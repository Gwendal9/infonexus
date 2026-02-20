import { ParsedArticle } from './rssParser';
import { decodeHtmlEntities } from '@/lib/utils/decodeHtmlEntities';

/**
 * Scrape articles from an HTML page
 * Extracts meta tags and structured data to get article info
 */
export async function scrapeHTMLPage(pageUrl: string): Promise<ParsedArticle[]> {
  const response = await fetch(pageUrl, {
    headers: {
      'User-Agent': 'InfoNexus/1.0 (News Aggregator)',
      Accept: 'text/html,application/xhtml+xml',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch page: ${response.status}`);
  }

  const html = await response.text();
  const article = extractArticleFromHTML(html, pageUrl);

  if (article) {
    return [article];
  }

  // Try to find article links on the page (for homepage/listing pages)
  const articleLinks = extractArticleLinks(html, pageUrl);
  const articles: ParsedArticle[] = [];

  // Limit to first 10 articles to avoid excessive requests
  for (const link of articleLinks.slice(0, 10)) {
    try {
      const articleHtml = await fetchWithTimeout(link.url);
      const extractedArticle = extractArticleFromHTML(articleHtml, link.url);
      if (extractedArticle) {
        articles.push(extractedArticle);
      }
    } catch {
      // Skip failed articles
    }
  }

  return articles;
}

async function fetchWithTimeout(url: string, timeout = 10000): Promise<string> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'InfoNexus/1.0 (News Aggregator)',
        Accept: 'text/html,application/xhtml+xml',
      },
    });
    clearTimeout(id);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.text();
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

function extractArticleFromHTML(html: string, url: string): ParsedArticle | null {
  // Extract title
  let title = extractMetaContent(html, 'og:title') ||
    extractMetaContent(html, 'twitter:title') ||
    extractTitleTag(html);

  if (!title) return null;

  // Extract description/summary with fallback to first paragraph
  const summary = extractSummary(html);

  // Extract image
  const imageUrl = extractMetaContent(html, 'og:image') ||
    extractMetaContent(html, 'twitter:image') ||
    extractFirstImage(html) ||
    null;

  // Extract author
  const author = extractMetaContent(html, 'author') ||
    extractMetaContent(html, 'article:author') ||
    extractSchemaAuthor(html) ||
    null;

  // Extract published date
  const publishedAt = extractMetaContent(html, 'article:published_time') ||
    extractMetaContent(html, 'datePublished') ||
    extractSchemaDate(html) ||
    null;

  return {
    url,
    title: cleanText(title),
    summary: summary, // Already cleaned and truncated by extractSummary
    image_url: imageUrl ? resolveUrl(imageUrl, url) : null,
    author: author ? cleanText(author) : null,
    published_at: publishedAt ? parseDate(publishedAt) : null,
  };
}

function extractMetaContent(html: string, name: string): string | null {
  // Try property attribute (Open Graph)
  const propertyMatch = html.match(
    new RegExp(`<meta[^>]+property=["']${escapeRegex(name)}["'][^>]+content=["']([^"']+)["']`, 'i')
  );
  if (propertyMatch) return propertyMatch[1];

  // Try name attribute
  const nameMatch = html.match(
    new RegExp(`<meta[^>]+name=["']${escapeRegex(name)}["'][^>]+content=["']([^"']+)["']`, 'i')
  );
  if (nameMatch) return nameMatch[1];

  // Try reverse order (content before property/name)
  const reversePropertyMatch = html.match(
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${escapeRegex(name)}["']`, 'i')
  );
  if (reversePropertyMatch) return reversePropertyMatch[1];

  const reverseNameMatch = html.match(
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${escapeRegex(name)}["']`, 'i')
  );
  if (reverseNameMatch) return reverseNameMatch[1];

  return null;
}

function extractTitleTag(html: string): string | null {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match ? match[1] : null;
}

function extractFirstImage(html: string): string | null {
  // Look for images in article or main content areas first
  const contentMatch = html.match(/<(?:article|main)[^>]*>([\s\S]*?)<\/(?:article|main)>/i);
  const searchArea = contentMatch ? contentMatch[1] : html;

  const imgMatch = searchArea.match(/<img[^>]+src=["']([^"']+)["']/i);
  return imgMatch ? imgMatch[1] : null;
}

function extractSchemaAuthor(html: string): string | null {
  // Look for JSON-LD author
  const jsonLdMatch = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
  if (jsonLdMatch) {
    try {
      const data = JSON.parse(jsonLdMatch[1]);
      if (data.author) {
        if (typeof data.author === 'string') return data.author;
        if (data.author.name) return data.author.name;
        if (Array.isArray(data.author) && data.author[0]?.name) return data.author[0].name;
      }
    } catch {
      // Invalid JSON, ignore
    }
  }
  return null;
}

function extractSchemaDate(html: string): string | null {
  // Look for JSON-LD date
  const jsonLdMatch = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
  if (jsonLdMatch) {
    try {
      const data = JSON.parse(jsonLdMatch[1]);
      return data.datePublished || data.dateCreated || null;
    } catch {
      // Invalid JSON, ignore
    }
  }
  return null;
}

interface ArticleLink {
  url: string;
  title: string;
}

function extractArticleLinks(html: string, baseUrl: string): ArticleLink[] {
  const links: ArticleLink[] = [];
  const seen = new Set<string>();

  // Look for article links - common patterns
  const patterns = [
    // Links inside <article> tags
    /<article[^>]*>[\s\S]*?<a[^>]+href=["']([^"']+)["'][^>]*>([^<]+)</gi,
    // Links with class containing "article", "post", "entry"
    /<a[^>]+class=["'][^"']*(?:article|post|entry)[^"']*["'][^>]+href=["']([^"']+)["'][^>]*>([^<]+)</gi,
    // h2/h3 inside links (common news pattern)
    /<a[^>]+href=["']([^"']+)["'][^>]*>[\s\S]*?<h[23][^>]*>([^<]+)</gi,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      const href = match[1];
      const title = match[2];

      // Skip common non-article links
      if (isNavigationLink(href)) continue;

      const absoluteUrl = resolveUrl(href, baseUrl);
      if (absoluteUrl && !seen.has(absoluteUrl)) {
        seen.add(absoluteUrl);
        links.push({
          url: absoluteUrl,
          title: cleanText(title),
        });
      }
    }
  }

  return links;
}

function isNavigationLink(href: string): boolean {
  const skipPatterns = [
    /^#/,
    /^javascript:/i,
    /^mailto:/i,
    /\/tag\//i,
    /\/category\//i,
    /\/author\//i,
    /\/page\/\d+/i,
    /\/(about|contact|privacy|terms|login|register|search)/i,
  ];

  return skipPatterns.some((pattern) => pattern.test(href));
}

function resolveUrl(href: string, baseUrl: string): string | null {
  try {
    return new URL(href, baseUrl).href;
  } catch {
    return null;
  }
}

function cleanText(text: string): string {
  return decodeHtmlEntities(text)
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Truncate text intelligently at word boundaries
 */
function truncateSummary(text: string, maxLength: number = 500): string {
  if (text.length <= maxLength) return text;

  // Find the last space before maxLength
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  // If we find a space in the last 80%, cut there
  if (lastSpace > maxLength * 0.8) {
    return truncated.slice(0, lastSpace).trim() + '...';
  }

  // Otherwise, look for the last punctuation mark
  const lastPunct = Math.max(
    truncated.lastIndexOf('.'),
    truncated.lastIndexOf(','),
    truncated.lastIndexOf(';')
  );

  if (lastPunct > maxLength * 0.6) {
    return truncated.slice(0, lastPunct + 1).trim();
  }

  // Last resort: cut at maxLength with ellipsis
  return truncated.trim() + '...';
}

/**
 * Extract summary with fallback to first paragraph
 */
function extractSummary(html: string): string | null {
  // 1. Try meta tags first (priority)
  const metaSummary =
    extractMetaContent(html, 'og:description') ||
    extractMetaContent(html, 'twitter:description') ||
    extractMetaContent(html, 'description');

  if (metaSummary) {
    return truncateSummary(cleanText(metaSummary));
  }

  // 2. Fallback: extract first paragraph from main content
  const articleMatch = html.match(/<(?:article|main)[^>]*>([\s\S]*?)<\/(?:article|main)>/i);
  const searchArea = articleMatch ? articleMatch[1] : html;

  // Look for paragraphs
  const paragraphs = searchArea.match(/<p[^>]*>([^<]+(?:<[^/][^>]*>[^<]*<\/[^>]+>)*[^<]+)<\/p>/gi);

  if (paragraphs) {
    for (const p of paragraphs) {
      const text = p.replace(/<[^>]+>/g, '').trim();
      // Take the first paragraph with at least 50 characters
      if (text.length >= 50) {
        return truncateSummary(cleanText(text), 300);
      }
    }
  }

  return null;
}

function parseDate(dateStr: string): string | null {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    return date.toISOString();
  } catch {
    return null;
  }
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
