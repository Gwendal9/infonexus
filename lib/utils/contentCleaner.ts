/**
 * Content Cleaner Utility
 * Removes unwanted elements from article HTML:
 * - Social sharing buttons
 * - Paywall messages
 * - Newsletter signups
 * - Comments sections
 * - Related articles
 */

// Paywall message patterns by language
const PAYWALL_PATTERNS_BY_LANG: Record<string, RegExp[]> = {
  fr: [
    /réservé(?:\s+aux)?\s+abonnés?/gi,
    /pour\s+(?:lire|continuer)\s+(?:la\s+)?suite/gi,
    /poursuiv(?:ez|re)\s+(?:votre\s+)?lecture/gi,
    /(?:il\s+vous\s+reste|vous\s+avez\s+lu)\s+\d+\s*%/gi,
    /abonne[zr][-\s]?vous\s+pour/gi,
    /devenir\s+membre/gi,
    /(?:contenu|article)\s+premium/gi,
    /membres?\s+uniquement/gi,
    /offre\s+(?:réservée|exclusive)/gi,
  ],
  en: [
    /subscribers?\s+only/gi,
    /continue\s+reading/gi,
    /(?:subscribe|sign\s+up)\s+to\s+(?:read|continue)/gi,
    /become\s+a\s+member/gi,
    /this\s+article\s+is\s+(?:reserved|exclusive)/gi,
    /you'?ve\s+reached\s+your\s+(?:limit|free\s+articles?)/gi,
    /member[-\s]?only/gi,
    /premium\s+content/gi,
    /\d+%\s+of\s+(?:the\s+)?article/gi,
    /exclusive\s+to\s+(?:members|subscribers)/gi,
  ],
  es: [
    /reservado\s+para\s+suscriptores/gi,
    /continuar\s+leyendo/gi,
    /suscr[íi]bete\s+para/gi,
    /contenido\s+premium/gi,
    /(?:solo|exclusivo)\s+para\s+miembros/gi,
    /hazte\s+miembro/gi,
  ],
};

// Create combined array of all patterns for backwards compatibility
const PAYWALL_PATTERNS = [
  ...PAYWALL_PATTERNS_BY_LANG.fr,
  ...PAYWALL_PATTERNS_BY_LANG.en,
  ...PAYWALL_PATTERNS_BY_LANG.es,
];

// CSS selectors for social sharing elements
const SOCIAL_SELECTORS = [
  '.share-buttons',
  '.social-share',
  '.share-button',
  '.sharing-buttons',
  '[class*="social-share"]',
  '[class*="share-bar"]',
  '[aria-label*="share"]',
  '[aria-label*="partage"]',
  '[data-share]',
];

// CSS selectors for paywall elements
const PAYWALL_SELECTORS = [
  '.paywall',
  '.subscription-wall',
  '.subscribe-wall',
  '[class*="premium"]',
  '.members-only',
  '[class*="paywall"]',
  '[data-paywall]',
];

// CSS selectors for newsletter/signup forms
const NEWSLETTER_SELECTORS = [
  '.newsletter',
  '.newsletter-signup',
  '.email-signup',
  '.email-capture',
  '[class*="newsletter"]',
  '[class*="subscribe"]',
];

// CSS selectors for comments
const COMMENT_SELECTORS = [
  '.comments',
  '#comments',
  '.comment-section',
  '#disqus',
  '[class*="comment"]',
  '[id*="comment"]',
];

// CSS selectors for related content
const RELATED_SELECTORS = [
  '.related-articles',
  '.related-posts',
  '.also-read',
  '[class*="related"]',
  '[class*="recommended"]',
];

// Patterns for unwanted text snippets (ads, device limits, etc.)
const UNWANTED_TEXT_PATTERNS = [
  /un compte par appareil/gi,
  /one account per device/gi,
  /limite de \d+ appareils?/gi,
  /device limit/gi,
  /créez votre compte/gi,
  /create your account/gi,
  /inscrivez[- ]vous gratuitement/gi,
  /sign up (?:for )?free/gi,
  /recevez (?:notre|nos) newsletters?/gi,
  /(?:suivez[- ]nous|follow us) (?:sur|on)/gi,
  /téléchargez l'application/gi,
  /download (?:the|our) app/gi,
  /activez les notifications/gi,
  /enable notifications/gi,
  /accepter les cookies/gi,
  /accept cookies/gi,
  /gérer (?:mes|vos) préférences/gi,
  /manage (?:your|my) preferences/gi,
  /publicité/gi,
  /advertisement/gi,
  /sponsored content/gi,
  /contenu sponsorisé/gi,
];

/**
 * Remove elements matching CSS selectors
 */
function removeElementsBySelectors(html: string, selectors: string[]): string {
  let cleaned = html;

  for (const selector of selectors) {
    // Simple regex-based removal for common patterns
    // This is a lightweight approach without full DOM parsing

    // Handle class selectors
    if (selector.startsWith('.')) {
      const className = selector.slice(1);
      const pattern = new RegExp(
        `<[^>]+class=["'][^"']*${className}[^"']*["'][^>]*>.*?</[^>]+>`,
        'gis'
      );
      cleaned = cleaned.replace(pattern, '');
    }

    // Handle ID selectors
    if (selector.startsWith('#')) {
      const id = selector.slice(1);
      const pattern = new RegExp(
        `<[^>]+id=["']${id}["'][^>]*>.*?</[^>]+>`,
        'gis'
      );
      cleaned = cleaned.replace(pattern, '');
    }

    // Handle attribute selectors like [data-share] or [class*="value"]
    if (selector.startsWith('[') && selector.endsWith(']')) {
      const inner = selector.slice(1, -1);
      if (inner.includes('*=')) {
        // [attr*="value"] - attribute contains value
        const eqIdx = inner.indexOf('*=');
        const attrName = inner.slice(0, eqIdx).trim();
        const attrValue = inner.slice(eqIdx + 2).replace(/["']/g, '').trim();
        const pattern = new RegExp(
          `<[^>]+${attrName}=["'][^"']*${attrValue}[^"']*["'][^>]*>[\\s\\S]*?</[^>]+>`,
          'gi'
        );
        cleaned = cleaned.replace(pattern, '');
      } else {
        // [attr] - simple attribute exists
        const attr = inner.split('=')[0].trim();
        const pattern = new RegExp(
          `<[^>]+\\s${attr}(?:=["'][^"']*["'])?[^>]*>.*?</[^>]+>`,
          'gis'
        );
        cleaned = cleaned.replace(pattern, '');
      }
    }
  }

  return cleaned;
}

/**
 * Detect language from HTML lang attribute or meta tags
 */
function detectLanguage(html: string): string {
  // Try lang attribute on <html> tag
  const htmlLang = html.match(/<html[^>]+lang=["']([a-z]{2})/i);
  if (htmlLang) {
    const lang = htmlLang[1].toLowerCase();
    if (lang in PAYWALL_PATTERNS_BY_LANG) return lang;
  }

  // Try meta tags
  const metaLang = html.match(/<meta[^>]+(?:property|name)=["'](?:og:)?locale["'][^>]+content=["']([a-z]{2})/i);
  if (metaLang) {
    const lang = metaLang[1].toLowerCase();
    if (lang in PAYWALL_PATTERNS_BY_LANG) return lang;
  }

  // Default: use all patterns
  return 'all';
}

/**
 * Get paywall patterns for detected language
 */
function getPaywallPatterns(html: string): RegExp[] {
  const lang = detectLanguage(html);

  if (lang === 'all') {
    return PAYWALL_PATTERNS;
  }

  return PAYWALL_PATTERNS_BY_LANG[lang] || PAYWALL_PATTERNS;
}

/**
 * Remove paragraphs containing paywall messages
 */
export function removePaywallContent(html: string): string {
  let cleaned = html;

  // Remove elements with paywall selectors
  cleaned = removeElementsBySelectors(cleaned, PAYWALL_SELECTORS);

  // Get language-specific patterns
  const patterns = getPaywallPatterns(html);

  // Remove paragraphs containing paywall patterns
  for (const pattern of patterns) {
    // Find <p> tags containing the pattern
    const pTagPattern = new RegExp(
      `<p[^>]*>.*?${pattern.source}.*?</p>`,
      'gis'
    );
    cleaned = cleaned.replace(pTagPattern, '');

    // Also remove <div> tags containing the pattern
    const divTagPattern = new RegExp(
      `<div[^>]*>.*?${pattern.source}.*?</div>`,
      'gis'
    );
    cleaned = cleaned.replace(divTagPattern, '');
  }

  return cleaned;
}

/**
 * Remove social sharing links and buttons
 */
export function removeSocialLinks(html: string): string {
  let cleaned = html;

  // Remove elements with social selectors
  cleaned = removeElementsBySelectors(cleaned, SOCIAL_SELECTORS);

  // Remove specific social sharing URLs
  const socialUrls = [
    'facebook.com/sharer',
    'twitter.com/intent',
    'linkedin.com/share',
    't.me/share',
    'api.whatsapp.com',
    'pinterest.com/pin',
  ];

  for (const url of socialUrls) {
    const pattern = new RegExp(
      `<a[^>]*href=["'][^"']*${url}[^"']*["'][^>]*>.*?</a>`,
      'gis'
    );
    cleaned = cleaned.replace(pattern, '');
  }

  // Remove mailto links in article content (but keep in author bylines)
  cleaned = cleaned.replace(
    /<a[^>]*href=["']mailto:[^"']+["'][^>]*>.*?<\/a>/gis,
    ''
  );

  return cleaned;
}

/**
 * Remove newsletter signup forms
 */
export function removeNewsletterSignups(html: string): string {
  return removeElementsBySelectors(html, NEWSLETTER_SELECTORS);
}

/**
 * Remove comment sections
 */
export function removeComments(html: string): string {
  return removeElementsBySelectors(html, COMMENT_SELECTORS);
}

/**
 * Remove related articles sections
 */
export function removeRelatedArticles(html: string): string {
  return removeElementsBySelectors(html, RELATED_SELECTORS);
}

/**
 * Remove unwanted text snippets (ads, device limits, promotional content)
 */
export function removeUnwantedText(html: string): string {
  let cleaned = html;

  // Remove paragraphs and spans containing unwanted patterns
  for (const pattern of UNWANTED_TEXT_PATTERNS) {
    // Remove <p> tags containing the pattern
    const pTagPattern = new RegExp(
      `<p[^>]*>.*?${pattern.source}.*?</p>`,
      'gis'
    );
    cleaned = cleaned.replace(pTagPattern, '');

    // Remove <div> tags containing the pattern (but not if they're too large)
    const divMatches = cleaned.match(new RegExp(`<div[^>]*>.*?${pattern.source}.*?</div>`, 'gis'));
    if (divMatches) {
      for (const match of divMatches) {
        // Only remove if the div is relatively small (< 500 chars)
        // to avoid removing entire article sections
        if (match.length < 500) {
          cleaned = cleaned.replace(match, '');
        }
      }
    }

    // Remove <span> tags containing the pattern
    const spanTagPattern = new RegExp(
      `<span[^>]*>.*?${pattern.source}.*?</span>`,
      'gis'
    );
    cleaned = cleaned.replace(spanTagPattern, '');

    // Remove <aside> tags containing the pattern
    const asideTagPattern = new RegExp(
      `<aside[^>]*>.*?${pattern.source}.*?</aside>`,
      'gis'
    );
    cleaned = cleaned.replace(asideTagPattern, '');
  }

  return cleaned;
}

/**
 * Master cleaning function - applies all cleaners.
 * Only uses CSS-class-based removal (safe).
 * Text-content-based removal is intentionally skipped to avoid
 * accidentally removing legitimate article content.
 */
export function cleanArticleContent(html: string): string {
  let cleaned = html;

  // Only remove by CSS class (safe — doesn't touch text content)
  cleaned = removeElementsBySelectors(cleaned, PAYWALL_SELECTORS);
  cleaned = removeElementsBySelectors(cleaned, SOCIAL_SELECTORS);
  cleaned = removeElementsBySelectors(cleaned, NEWSLETTER_SELECTORS);
  cleaned = removeElementsBySelectors(cleaned, COMMENT_SELECTORS);
  cleaned = removeElementsBySelectors(cleaned, RELATED_SELECTORS);

  // Remove empty paragraphs and divs
  cleaned = cleaned.replace(/<p[^>]*>\s*<\/p>/g, '');
  cleaned = cleaned.replace(/<div[^>]*>\s*<\/div>/g, '');

  return cleaned;
}
