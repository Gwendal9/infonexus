/**
 * Article content extraction for reader mode.
 * Fetches a page's HTML and extracts the main article content,
 * stripping navigation, ads, and non-content elements.
 */
import { decodeHtmlEntities } from '@/lib/utils/decodeHtmlEntities';
import { cleanArticleContent } from '@/lib/utils/contentCleaner';
import { bypassPaywall, shouldAttemptBypass } from '@/lib/services/paywallBypass';
import { getSiteExtractor, extractWithSitePattern, siteRequiresBypass } from '@/lib/services/siteSpecificExtractors';

export interface ArticleContent {
  title: string;
  content: string; // cleaned HTML for rendering
  textContent: string; // plain text fallback
  author: string | null;
  siteName: string | null;
  estimatedReadTime: number; // minutes
  bypassUsed?: boolean;
}

const FETCH_TIMEOUT = 25000;

const REMOVE_TAGS = [
  'script', 'style', 'noscript', 'iframe', 'svg', 'form',
  'nav', 'header', 'footer', 'aside',
];

const REMOVE_CLASS_PATTERNS = [
  /\bad[s-]?\b/i, /\badvert/i, /\bsponsor/i,
  /\bsocial[-_]?share/i, /\bshare[-_]?button/i,
  /\bcomment/i, /\bsidebar/i, /\brelated[-_]?post/i,
  /\bnewsletter/i, /\bpopup/i, /\bmodal/i,
  /\bcookie/i, /\bbanner/i,
];

export async function extractArticleContent(
  url: string,
  enablePaywallBypass: boolean = false
): Promise<ArticleContent | null> {
  try {
    console.log(`[ArticleReader] Extracting content from: ${url}`);

    // Check if this site requires bypass
    const siteNeedsBypass = siteRequiresBypass(url);
    if (siteNeedsBypass && enablePaywallBypass) {
      console.log('[ArticleReader] Site known to require paywall bypass, attempting early...');
      const bypassedHtml = await bypassPaywall(url);
      if (bypassedHtml) {
        console.log('[ArticleReader] ✓ Early bypass successful');
        const result = extractFromHtml(bypassedHtml, url);
        if (result) result.bypassUsed = true;
        return result;
      }
      console.log('[ArticleReader] ✗ Early bypass failed, trying normal extraction');
    }

    let html = await fetchPage(url);
    if (!html) {
      console.log('[ArticleReader] ✗ Failed to fetch page');
      return null;
    }

    let title = extractTitle(html);
    let author = extractMeta(html, 'author') || extractMeta(html, 'article:author');
    let siteName = extractMeta(html, 'og:site_name');

    // Try site-specific extraction first
    const siteExtractor = getSiteExtractor(url);
    let contentHtml: string | null = null;

    if (siteExtractor) {
      contentHtml = extractWithSitePattern(html, siteExtractor);
    }

    // Fallback to generic extraction
    if (!contentHtml) {
      console.log('[ArticleReader] Falling back to generic extraction');
      contentHtml = extractMainContent(html);
    }

    if (!contentHtml) {
      console.log('[ArticleReader] ✗ No content extracted');
      return null;
    }

    // Clean the extracted content
    contentHtml = cleanContent(contentHtml, url);

    // Apply additional content cleaning (paywall, social, etc.)
    contentHtml = cleanArticleContent(contentHtml);

    // Generate plain text version
    let textContent = htmlToPlainText(contentHtml);
    let bypassUsed = false;

    // Attempt paywall bypass if enabled and content appears truncated
    if (enablePaywallBypass && shouldAttemptBypass(html, textContent.length)) {
      console.log('[ArticleReader] Content appears paywalled, attempting bypass...');
      const bypassedHtml = await bypassPaywall(url);

      if (bypassedHtml) {
        console.log('[ArticleReader] ✓ Bypass successful, re-extracting content');
        bypassUsed = true;
        // Re-extract with bypassed HTML
        html = bypassedHtml;
        title = extractTitle(html) || title;
        author = extractMeta(html, 'author') || extractMeta(html, 'article:author') || author;
        siteName = extractMeta(html, 'og:site_name') || siteName;

        contentHtml = extractMainContent(html);
        if (contentHtml) {
          contentHtml = cleanContent(contentHtml, url);
          contentHtml = cleanArticleContent(contentHtml);
          textContent = htmlToPlainText(contentHtml);
        }
      } else {
        console.log('[ArticleReader] ✗ Bypass failed, using original content');
      }
    }

    // Skip if too little content was extracted (even after bypass attempt)
    // Use word count instead of character count for better accuracy
    const words = textContent.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    const MIN_WORD_COUNT = 20; // ~2-3 phrases minimum

    if (wordCount < MIN_WORD_COUNT) {
      console.log(`[ArticleReader] Content too short: ${wordCount} words (minimum: ${MIN_WORD_COUNT})`);

      // Check if this is an error page
      const errorMarkers = ['404', 'not found', 'page introuvable', 'erreur', 'error'];
      const isErrorPage = errorMarkers.some(marker =>
        textContent.toLowerCase().includes(marker.toLowerCase())
      );

      if (isErrorPage) {
        console.log('[ArticleReader] Error page detected');
      }

      return null;
    }

    const estimatedReadTime = Math.max(1, Math.ceil(wordCount / 200));

    return {
      title: title || 'Article',
      content: contentHtml ?? '',
      textContent,
      author,
      siteName,
      estimatedReadTime,
      bypassUsed: bypassUsed || undefined,
    };
  } catch {
    return null;
  }
}

async function fetchPage(url: string): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    });
    clearTimeout(timeout);
    if (!response.ok) return null;
    return response.text();
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

function extractTitle(html: string): string | null {
  // Try OG title first, then <title> tag
  const ogTitle = extractMeta(html, 'og:title');
  if (ogTitle) return decodeEntities(ogTitle);

  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match ? decodeEntities(match[1].trim()) : null;
}

function extractMeta(html: string, name: string): string | null {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // property="..." content="..."
  const m1 = html.match(new RegExp(`<meta[^>]+property=["']${escapedName}["'][^>]+content=["']([^"']+)["']`, 'i'));
  if (m1) return decodeEntities(m1[1]);

  // name="..." content="..."
  const m2 = html.match(new RegExp(`<meta[^>]+name=["']${escapedName}["'][^>]+content=["']([^"']+)["']`, 'i'));
  if (m2) return decodeEntities(m2[1]);

  // content="..." property="..." (reverse order)
  const m3 = html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${escapedName}["']`, 'i'));
  if (m3) return decodeEntities(m3[1]);

  return null;
}

interface ContentCandidate {
  content: string;
  score: number;
  patternName: string;
}

function extractMainContent(html: string): string | null {
  // Try paragraph-based extraction FIRST — most reliable for modern sites
  const earlyParagraphs = extractParagraphs(html);
  if (earlyParagraphs) {
    console.log('[ArticleReader] ✓ Early paragraph extraction succeeded');
    return earlyParagraphs;
  }

  const patterns: Array<{ pattern: RegExp; score: number; name: string }> = [
    // Highest priority: HTML5 semantic tags
    {
      pattern: /<article[^>]*>([\s\S]*?)<\/article>/i,
      score: 10,
      name: 'article tag',
    },
    {
      pattern: /<main[^>]*>([\s\S]*?)<\/main>/i,
      score: 9,
      name: 'main tag',
    },

    // High priority: role attribute
    {
      pattern: /<div[^>]+role=["'](?:main|article)["'][^>]*>([\s\S]*?)<\/div>/i,
      score: 8,
      name: 'role attribute',
    },

    // Selectors by ID (often very specific)
    {
      pattern: /<div[^>]+id=["'](?:article|main|content|story|post|entry)(?:[-_](?:body|content|text|wrapper|container))?["'][^>]*>([\s\S]*?)<\/div>/i,
      score: 7,
      name: 'id attribute',
    },

    // Selectors by class (common patterns)
    {
      pattern: /<div[^>]+class=["'][^"']*(?:article|post|entry|story)[-_]?(?:body|content|text|main)?[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
      score: 6,
      name: 'class attribute (article)',
    },
    {
      pattern: /<div[^>]+class=["'][^"']*(?:content)[-_]?(?:main|primary|body)?[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
      score: 5,
      name: 'class attribute (content)',
    },

    // Section with specific selectors
    {
      pattern: /<section[^>]+(?:class|id)=["'][^"']*(?:article|content|main|post)[^"']*["'][^>]*>([\s\S]*?)<\/section>/i,
      score: 4,
      name: 'section tag',
    },
  ];

  const candidates: ContentCandidate[] = [];

  // Test all patterns and collect candidates
  for (const { pattern, score, name } of patterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      const content = match[1];
      const textContent = stripHtmlTags(content);
      const wordCount = textContent.split(/\s+/).filter(w => w.length > 0).length;

      // Ignore candidates that are too short (less than 20 words)
      if (wordCount < 20) continue;

      candidates.push({
        content,
        score: score + Math.log10(wordCount) * 2, // Bonus for word count
        patternName: name,
      });
    }
  }

  // Sort by score (descending)
  candidates.sort((a, b) => b.score - a.score);

  if (candidates.length > 0) {
    console.log(`[ArticleReader] Best match: ${candidates[0].patternName} (score: ${candidates[0].score.toFixed(2)})`);
    return candidates[0].content;
  }

  // Last resort: strip ALL HTML and return plain text blocks
  console.log('[ArticleReader] Using text-block fallback');
  return extractTextBlocks(html);
}

/**
 * Strip all HTML and extract text lines as <p> blocks.
 * Works for any HTML structure — the ultimate fallback.
 */
function extractTextBlocks(html: string): string | null {
  // Remove non-article areas
  let body = html
    .replace(/<head[\s\S]*?<\/head>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<aside[\s\S]*?<\/aside>/gi, '');

  // Convert structural HTML to newlines, then strip remaining tags
  body = body
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#\d+;/g, ' ');

  const blocks = body
    .split('\n')
    .map(line => line.replace(/\s+/g, ' ').trim())
    .filter(line => line.split(/\s+/).filter(w => w.length > 1).length >= 8);

  if (blocks.length >= 2) {
    return blocks.map(b => `<p>${b}</p>`).join('\n');
  }
  return null;
}

// Utility function to extract plain text
function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Extract article content by collecting all substantial <p> tags.
 * Pre-strips non-content areas so navigation text isn't picked up.
 */
function extractParagraphs(html: string): string | null {
  // Remove areas that never contain article text
  let body = html;
  body = body.replace(/<head[\s\S]*?<\/head>/gi, '');
  body = body.replace(/<script[\s\S]*?<\/script>/gi, '');
  body = body.replace(/<style[\s\S]*?<\/style>/gi, '');
  body = body.replace(/<nav[\s\S]*?<\/nav>/gi, '');
  body = body.replace(/<header[\s\S]*?<\/header>/gi, '');
  body = body.replace(/<footer[\s\S]*?<\/footer>/gi, '');
  body = body.replace(/<aside[\s\S]*?<\/aside>/gi, '');

  const collected: string[] = [];
  const re = /<p(?:\s[^>]*)?>[\s\S]*?<\/p>/gi;
  let m: RegExpExecArray | null;

  while ((m = re.exec(body)) !== null) {
    const text = m[0].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    // Keep paragraphs with at least 8 words
    if (text.split(/\s+/).filter(w => w.length > 0).length >= 8) {
      collected.push(m[0]);
    }
  }

  // At least 2 substantial paragraphs to be considered an article
  if (collected.length >= 2) {
    return collected.join('\n');
  }
  return null;
}

function cleanContent(html: string, baseUrl: string): string {
  let cleaned = html;

  // Remove unwanted tags and their content
  for (const tag of REMOVE_TAGS) {
    cleaned = cleaned.replace(new RegExp(`<${tag}[^>]*>[\\s\\S]*?<\\/${tag}>`, 'gi'), '');
    cleaned = cleaned.replace(new RegExp(`<${tag}[^>]*/?>`, 'gi'), '');
  }

  // Remove elements with ad/social/comment classes
  for (const pattern of REMOVE_CLASS_PATTERNS) {
    cleaned = cleaned.replace(
      new RegExp(`<[^>]+class=["'][^"']*${pattern.source}[^"']*["'][^>]*>[\\s\\S]*?<\\/[^>]+>`, 'gi'),
      ''
    );
  }

  // Resolve relative URLs in src and href attributes
  cleaned = cleaned.replace(
    /(src|href)=["'](?!https?:\/\/|data:|#)([^"']+)["']/gi,
    (_, attr, path) => {
      try {
        const resolved = new URL(path, baseUrl).href;
        return `${attr}="${resolved}"`;
      } catch {
        return `${attr}="${path}"`;
      }
    }
  );

  // Remove empty paragraphs
  cleaned = cleaned.replace(/<p[^>]*>\s*<\/p>/gi, '');

  // Remove excessive whitespace between tags
  cleaned = cleaned.replace(/>\s+</g, '> <');

  return cleaned.trim();
}

function htmlToPlainText(html: string): string {
  const stripped = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '');

  return decodeHtmlEntities(stripped)
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

function decodeEntities(text: string): string {
  return decodeHtmlEntities(text).trim();
}

/**
 * Extract article from HTML (helper function for reuse)
 */
function extractFromHtml(html: string, url: string): ArticleContent | null {
  const title = extractTitle(html);
  const author = extractMeta(html, 'author') || extractMeta(html, 'article:author');
  const siteName = extractMeta(html, 'og:site_name');

  // Try site-specific extraction first
  const siteExtractor = getSiteExtractor(url);
  let contentHtml: string | null = null;

  if (siteExtractor) {
    contentHtml = extractWithSitePattern(html, siteExtractor);
  }

  // Fallback to generic extraction
  if (!contentHtml) {
    contentHtml = extractMainContent(html);
  }

  if (!contentHtml) return null;

  // Clean the extracted content
  contentHtml = cleanContent(contentHtml, url);
  contentHtml = cleanArticleContent(contentHtml);

  // Generate plain text version
  const textContent = htmlToPlainText(contentHtml);

  // Check word count
  const words = textContent.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  const MIN_WORD_COUNT = 20;

  if (wordCount < MIN_WORD_COUNT) {
    console.log(`[ArticleReader] Content too short: ${wordCount} words`);
    return null;
  }

  const estimatedReadTime = Math.max(1, Math.ceil(wordCount / 200));

  return {
    title: title || 'Article',
    content: contentHtml,
    textContent,
    author,
    siteName,
    estimatedReadTime,
  };
}
