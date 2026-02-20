/**
 * Site-specific content extractors
 * Provides custom extraction logic for specific news sites
 */

interface SiteExtractor {
  domain: string;
  contentSelector: RegExp[];
  removeSelectors?: string[];
  requiresBypass?: boolean;
}

export const SITE_EXTRACTORS: SiteExtractor[] = [
  // Le Monde
  {
    domain: 'lemonde.fr',
    contentSelector: [
      /<article[^>]*class=["'][^"']*article__content[^"']*["'][^>]*>([\s\S]*?)<\/article>/i,
      /<div[^>]*class=["'][^"']*article__paragraph[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi,
      /<section[^>]*class=["'][^"']*article__content[^"']*["'][^>]*>([\s\S]*?)<\/section>/i,
    ],
    removeSelectors: [
      '.article__status',
      '.article__siblings',
      '.inread',
      '[data-testid="paywall"]',
      '.paywall-popin',
    ],
    requiresBypass: true,
  },

  // Le Figaro
  {
    domain: 'lefigaro.fr',
    contentSelector: [
      /<div[^>]*class=["'][^"']*fig-content-body[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
      /<article[^>]*class=["'][^"']*fig-article[^"']*["'][^>]*>([\s\S]*?)<\/article>/i,
    ],
    removeSelectors: [
      '.fig-premium-paywall',
      '.fig-premium-mark',
      '.fig-ensemble',
    ],
    requiresBypass: true,
  },

  // Libération
  {
    domain: 'liberation.fr',
    contentSelector: [
      /<div[^>]*class=["'][^"']*article-body[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
      /<article[^>]*>([\s\S]*?)<\/article>/i,
    ],
    removeSelectors: [
      '.paywall',
      '.subscribe-banner',
    ],
    requiresBypass: true,
  },

  // France Info (public, no paywall)
  {
    domain: 'francetvinfo.fr',
    contentSelector: [
      /<div[^>]*class=["'][^"']*article-text[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
      /<article[^>]*>([\s\S]*?)<\/article>/i,
    ],
    requiresBypass: false,
  },

  // BBC
  {
    domain: 'bbc.com',
    contentSelector: [
      /<article[^>]*>([\s\S]*?)<\/article>/i,
      /<div[^>]*data-component=["']text-block["'][^>]*>([\s\S]*?)<\/div>/gi,
    ],
    requiresBypass: false,
  },

  // The Guardian
  {
    domain: 'theguardian.com',
    contentSelector: [
      /<div[^>]*class=["'][^"']*article-body-commercial-selector[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]*class=["'][^"']*content__article-body[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
    ],
    requiresBypass: false,
  },

  // Le Parisien
  {
    domain: 'leparisien.fr',
    contentSelector: [
      /<div[^>]*class=["'][^"']*article[^"']*body[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]*class=["'][^"']*story[^"']*content[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
      /<article[^>]*>([\s\S]*?)<\/article>/i,
    ],
    removeSelectors: [
      '.paywall',
      '.premium-lock',
      '.subscribe',
    ],
    requiresBypass: true,
  },

  // Les Échos
  {
    domain: 'lesechos.fr',
    contentSelector: [
      /<div[^>]*class=["'][^"']*article[^"']*content[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]*class=["'][^"']*article[^"']*body[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
      /<article[^>]*>([\s\S]*?)<\/article>/i,
    ],
    removeSelectors: [
      '.paywall',
      '.article-paywall',
    ],
    requiresBypass: true,
  },

  // 20 Minutes (public, no paywall)
  {
    domain: '20minutes.fr',
    contentSelector: [
      /<div[^>]*class=["'][^"']*content[^"']*article[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
      /<article[^>]*>([\s\S]*?)<\/article>/i,
    ],
    requiresBypass: false,
  },

  // BFM TV (public, no paywall)
  {
    domain: 'bfmtv.com',
    contentSelector: [
      /<div[^>]*class=["'][^"']*article[^"']*content[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
      /<article[^>]*>([\s\S]*?)<\/article>/i,
    ],
    requiresBypass: false,
  },
];

/**
 * Get site-specific extractor for a URL
 */
export function getSiteExtractor(url: string): SiteExtractor | null {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return SITE_EXTRACTORS.find(extractor =>
      hostname.includes(extractor.domain)
    ) || null;
  } catch {
    return null;
  }
}

/**
 * Extract content using site-specific patterns
 */
export function extractWithSitePattern(html: string, extractor: SiteExtractor): string | null {
  console.log(`[SiteExtractor] Using patterns for ${extractor.domain}`);

  for (const pattern of extractor.contentSelector) {
    // Always use exec() — match() with g flag drops capture groups
    const re = new RegExp(pattern.source, pattern.flags.replace('g', ''));
    const match = re.exec(html);
    if (match && match[1]) {
      const content = match[1];
      const textLength = content.replace(/<[^>]+>/g, '').trim().length;

      if (textLength > 100) {
        console.log(`[SiteExtractor] ✓ Pattern matched, content length: ${textLength}`);
        return content;
      }
    }
  }

  console.log(`[SiteExtractor] ✗ No pattern matched for ${extractor.domain}`);
  return null;
}

/**
 * Check if site requires paywall bypass
 */
export function siteRequiresBypass(url: string): boolean {
  const extractor = getSiteExtractor(url);
  return extractor?.requiresBypass ?? false;
}
