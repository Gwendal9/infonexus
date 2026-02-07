import { SourceType } from '@/types/database';

interface DetectionResult {
  type: SourceType;
  url: string; // May be transformed (e.g., YouTube channel to RSS)
  name?: string;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Detect the source type from a URL
 * - YouTube: Detect channel/user pages and convert to RSS feed
 * - RSS: Check for common RSS extensions and try to fetch as RSS
 * - HTML: Fallback for regular web pages
 */
export async function detectSourceType(inputUrl: string): Promise<DetectionResult> {
  const url = normalizeUrl(inputUrl);

  // Check for YouTube
  const youtubeResult = await detectYouTube(url);
  if (youtubeResult) {
    return youtubeResult;
  }

  // Check for RSS feed
  const rssResult = await detectRSS(url);
  if (rssResult) {
    return rssResult;
  }

  // Fallback to HTML
  return {
    type: 'html',
    url,
    confidence: 'low',
  };
}

function normalizeUrl(url: string): string {
  let normalized = url.trim();
  if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
    normalized = 'https://' + normalized;
  }
  return normalized;
}

async function detectYouTube(url: string): Promise<DetectionResult | null> {
  const youtubePatterns = [
    // Channel by ID: /channel/UC...
    /youtube\.com\/channel\/(UC[\w-]+)/,
    // Channel by custom URL: /@username or /c/username
    /youtube\.com\/(@[\w-]+)/,
    /youtube\.com\/c\/([\w-]+)/,
    // User page: /user/username
    /youtube\.com\/user\/([\w-]+)/,
    // Direct RSS feed
    /youtube\.com\/feeds\/videos\.xml\?channel_id=(UC[\w-]+)/,
  ];

  for (const pattern of youtubePatterns) {
    const match = url.match(pattern);
    if (match) {
      const identifier = match[1];

      // If it's already an RSS feed URL
      if (url.includes('/feeds/videos.xml')) {
        return {
          type: 'youtube',
          url,
          confidence: 'high',
        };
      }

      // If it's a channel ID (starts with UC), we can create RSS directly
      if (identifier.startsWith('UC')) {
        return {
          type: 'youtube',
          url: `https://www.youtube.com/feeds/videos.xml?channel_id=${identifier}`,
          confidence: 'high',
        };
      }

      // For handles (@username) or custom URLs, we need to resolve the channel ID
      const channelId = await resolveYouTubeChannelId(url);
      if (channelId) {
        return {
          type: 'youtube',
          url: `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
          confidence: 'high',
        };
      }

      // Couldn't resolve, but it's clearly YouTube
      return {
        type: 'youtube',
        url,
        confidence: 'medium',
      };
    }
  }

  return null;
}

async function resolveYouTubeChannelId(channelUrl: string): Promise<string | null> {
  try {
    const response = await fetch(channelUrl, {
      headers: {
        'User-Agent': 'InfoNexus/1.0',
      },
    });

    if (!response.ok) return null;

    const html = await response.text();

    // Look for channel ID in the page HTML
    // Pattern: "channelId":"UC..."
    const match = html.match(/"channelId":"(UC[\w-]+)"/);
    if (match) {
      return match[1];
    }

    // Alternative pattern in meta tags
    const metaMatch = html.match(/content="https:\/\/www\.youtube\.com\/channel\/(UC[\w-]+)"/);
    if (metaMatch) {
      return metaMatch[1];
    }

    return null;
  } catch {
    return null;
  }
}

async function detectRSS(url: string): Promise<DetectionResult | null> {
  // Check URL patterns that are likely RSS
  const rssPatterns = [
    /\.rss$/i,
    /\.xml$/i,
    /\.atom$/i,
    /\/feed\/?$/i,
    /\/rss\/?$/i,
    /\/atom\/?$/i,
    /feed\.xml$/i,
    /rss\.xml$/i,
    /atom\.xml$/i,
  ];

  const isLikelyRSS = rssPatterns.some((pattern) => pattern.test(url));

  // Try to fetch and check content type
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'InfoNexus/1.0',
      },
    });

    const contentType = response.headers.get('content-type') || '';
    const isRSSContentType =
      contentType.includes('xml') ||
      contentType.includes('rss') ||
      contentType.includes('atom');

    if (isRSSContentType) {
      return {
        type: 'rss',
        url,
        confidence: 'high',
      };
    }

    // URL pattern suggests RSS but content-type doesn't confirm
    if (isLikelyRSS) {
      // Try to verify by fetching content
      const getResponse = await fetch(url, {
        headers: {
          'User-Agent': 'InfoNexus/1.0',
          Accept: 'application/rss+xml, application/xml, text/xml, application/atom+xml',
        },
      });

      const text = await getResponse.text();
      if (text.includes('<rss') || text.includes('<feed') || text.includes('<channel>')) {
        return {
          type: 'rss',
          url,
          confidence: 'high',
        };
      }
    }
  } catch {
    // If fetch fails but URL looks like RSS, still suggest it
    if (isLikelyRSS) {
      return {
        type: 'rss',
        url,
        confidence: 'medium',
      };
    }
  }

  // Try to find RSS feed link in HTML page
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'InfoNexus/1.0',
      },
    });

    const html = await response.text();

    // Look for RSS link in <head>
    const rssLinkMatch = html.match(
      /<link[^>]+type=["']application\/rss\+xml["'][^>]+href=["']([^"']+)["']/i
    );
    if (rssLinkMatch) {
      const rssUrl = new URL(rssLinkMatch[1], url).href;
      return {
        type: 'rss',
        url: rssUrl,
        confidence: 'high',
      };
    }

    // Look for Atom link
    const atomLinkMatch = html.match(
      /<link[^>]+type=["']application\/atom\+xml["'][^>]+href=["']([^"']+)["']/i
    );
    if (atomLinkMatch) {
      const atomUrl = new URL(atomLinkMatch[1], url).href;
      return {
        type: 'rss',
        url: atomUrl,
        confidence: 'high',
      };
    }
  } catch {
    // Ignore fetch errors
  }

  return null;
}
