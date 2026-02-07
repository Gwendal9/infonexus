import { XMLParser } from 'fast-xml-parser';

export interface ParsedArticle {
  url: string;
  title: string;
  summary: string | null;
  image_url: string | null;
  author: string | null;
  published_at: string | null;
}

interface RSSItem {
  title?: string;
  link?: string;
  description?: string;
  pubDate?: string;
  'dc:creator'?: string;
  author?: string;
  'media:content'?: { '@_url'?: string } | { '@_url'?: string }[];
  'media:thumbnail'?: { '@_url'?: string };
  enclosure?: { '@_url'?: string; '@_type'?: string };
  'content:encoded'?: string;
}

interface RSSChannel {
  item?: RSSItem | RSSItem[];
}

interface AtomEntry {
  title?: string | { '#text'?: string };
  link?: { '@_href'?: string } | { '@_href'?: string }[];
  summary?: string;
  content?: string | { '#text'?: string };
  published?: string;
  updated?: string;
  author?: { name?: string };
  'media:content'?: { '@_url'?: string };
  'media:thumbnail'?: { '@_url'?: string };
}

interface AtomFeed {
  entry?: AtomEntry | AtomEntry[];
}

function extractImageFromContent(content: string | undefined): string | null {
  if (!content) return null;
  const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  return imgMatch ? imgMatch[1] : null;
}

function cleanHtml(html: string | undefined): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim()
    .slice(0, 500);
}

function parseRSSItem(item: RSSItem): ParsedArticle | null {
  const url = item.link;
  const title = item.title;

  if (!url || !title) return null;

  let imageUrl: string | null = null;

  // Try different image sources
  if (item['media:content']) {
    const media = item['media:content'];
    if (Array.isArray(media)) {
      imageUrl = media[0]?.['@_url'] || null;
    } else {
      imageUrl = media['@_url'] || null;
    }
  }
  if (!imageUrl && item['media:thumbnail']) {
    imageUrl = item['media:thumbnail']['@_url'] || null;
  }
  if (!imageUrl && item.enclosure?.['@_type']?.startsWith('image')) {
    imageUrl = item.enclosure['@_url'] || null;
  }
  if (!imageUrl) {
    imageUrl = extractImageFromContent(item['content:encoded'] || item.description);
  }

  // Try to extract summary from multiple sources
  let summary: string | null = null;
  if (item.description) {
    summary = cleanHtml(item.description);
  }
  if (!summary && item['content:encoded']) {
    summary = cleanHtml(item['content:encoded']);
  }

  return {
    url: typeof url === 'string' ? url : String(url),
    title: typeof title === 'string' ? title : String(title),
    summary: summary || null,
    image_url: imageUrl,
    author: item['dc:creator'] || item.author || null,
    published_at: item.pubDate ? new Date(item.pubDate).toISOString() : null,
  };
}

function parseAtomEntry(entry: AtomEntry): ParsedArticle | null {
  let url: string | null = null;
  if (entry.link) {
    if (Array.isArray(entry.link)) {
      url = entry.link[0]?.['@_href'] || null;
    } else {
      url = entry.link['@_href'] || null;
    }
  }

  let title: string | null = null;
  if (typeof entry.title === 'string') {
    title = entry.title;
  } else if (entry.title?.['#text']) {
    title = entry.title['#text'];
  }

  if (!url || !title) return null;

  let summary: string | null = null;
  if (entry.summary) {
    summary = cleanHtml(entry.summary);
  } else if (typeof entry.content === 'string') {
    summary = cleanHtml(entry.content);
  } else if (entry.content?.['#text']) {
    summary = cleanHtml(entry.content['#text']);
  }

  let imageUrl: string | null = null;
  if (entry['media:content']) {
    imageUrl = entry['media:content']['@_url'] || null;
  }
  if (!imageUrl && entry['media:thumbnail']) {
    imageUrl = entry['media:thumbnail']['@_url'] || null;
  }

  const publishedAt = entry.published || entry.updated || null;

  return {
    url,
    title,
    summary,
    image_url: imageUrl,
    author: entry.author?.name || null,
    published_at: publishedAt ? new Date(publishedAt).toISOString() : null,
  };
}

export async function parseRSSFeed(feedUrl: string): Promise<ParsedArticle[]> {
  const response = await fetch(feedUrl, {
    headers: {
      'User-Agent': 'InfoNexus/1.0',
      Accept: 'application/rss+xml, application/xml, text/xml, application/atom+xml',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch feed: ${response.status}`);
  }

  const xml = await response.text();

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
  });

  const parsed = parser.parse(xml);
  const articles: ParsedArticle[] = [];

  // RSS 2.0 format
  const rssChannel: RSSChannel | undefined = parsed?.rss?.channel;
  if (rssChannel?.item) {
    const items = Array.isArray(rssChannel.item) ? rssChannel.item : [rssChannel.item];
    for (const item of items) {
      const article = parseRSSItem(item);
      if (article) articles.push(article);
    }
  }

  // Atom format
  const atomFeed: AtomFeed | undefined = parsed?.feed;
  if (atomFeed?.entry) {
    const entries = Array.isArray(atomFeed.entry) ? atomFeed.entry : [atomFeed.entry];
    for (const entry of entries) {
      const article = parseAtomEntry(entry);
      if (article) articles.push(article);
    }
  }

  return articles;
}
