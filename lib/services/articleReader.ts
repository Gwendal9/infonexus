/**
 * Article content extraction for reader mode.
 * Fetches a page's HTML and extracts the main article content,
 * stripping navigation, ads, and non-content elements.
 */

export interface ArticleContent {
  title: string;
  content: string; // cleaned HTML for rendering
  textContent: string; // plain text fallback
  author: string | null;
  siteName: string | null;
  estimatedReadTime: number; // minutes
}

const FETCH_TIMEOUT = 15000;

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

export async function extractArticleContent(url: string): Promise<ArticleContent | null> {
  try {
    const html = await fetchPage(url);
    if (!html) return null;

    const title = extractTitle(html);
    const author = extractMeta(html, 'author') || extractMeta(html, 'article:author');
    const siteName = extractMeta(html, 'og:site_name');

    // Extract main content area
    let contentHtml = extractMainContent(html);
    if (!contentHtml) return null;

    // Clean the extracted content
    contentHtml = cleanContent(contentHtml, url);

    // Generate plain text version
    const textContent = htmlToPlainText(contentHtml);

    // Skip if too little content was extracted
    if (textContent.length < 100) return null;

    const wordCount = textContent.split(/\s+/).length;
    const estimatedReadTime = Math.max(1, Math.ceil(wordCount / 200));

    return {
      title: title || 'Article',
      content: contentHtml,
      textContent,
      author,
      siteName,
      estimatedReadTime,
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
        'User-Agent': 'InfoNexus/1.0 (News Aggregator)',
        Accept: 'text/html,application/xhtml+xml',
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

function extractMainContent(html: string): string | null {
  // Try these selectors in priority order
  const patterns = [
    /<article[^>]*>([\s\S]*?)<\/article>/i,
    /<main[^>]*>([\s\S]*?)<\/main>/i,
    /<div[^>]+role=["']main["'][^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]+class=["'][^"']*(?:article[-_]?body|article[-_]?content|post[-_]?content|entry[-_]?content|story[-_]?body)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1].length > 200) {
      return match[1];
    }
  }

  // Fallback: try the largest text-heavy div
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    return bodyMatch[1];
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
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s+/g, ' ')
    .trim();
}

function decodeEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .trim();
}
