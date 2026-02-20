/**
 * Content Cleaner Utility v2 - Using DOM Parser
 *
 * IMPORTANT: This file requires node-html-parser to be installed:
 * npm install node-html-parser
 *
 * Once installed, rename this file to contentCleaner.ts (backup the old one)
 *
 * Improvements over v1:
 * - Uses real DOM parser instead of regex
 * - Properly handles nested elements
 * - No risk of breaking HTML structure
 * - More reliable element removal
 */

import { parse, HTMLElement } from 'node-html-parser';

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
    return [
      ...PAYWALL_PATTERNS_BY_LANG.fr,
      ...PAYWALL_PATTERNS_BY_LANG.en,
      ...PAYWALL_PATTERNS_BY_LANG.es,
    ];
  }

  return PAYWALL_PATTERNS_BY_LANG[lang] || [];
}

/**
 * Remove elements matching CSS selectors using DOM parser
 */
function removeElementsBySelectors(root: HTMLElement, selectors: string[]): void {
  for (const selector of selectors) {
    try {
      const elements = root.querySelectorAll(selector);
      elements.forEach((el: HTMLElement) => {
        el.remove();
      });
    } catch (error) {
      // Selector might not be valid for this parser, skip it
      console.warn(`[ContentCleaner] Invalid selector: ${selector}`, error);
    }
  }
}

/**
 * Remove paragraphs/divs containing paywall messages using DOM parser
 */
export function removePaywallContent(html: string): string {
  try {
    const root = parse(html);

    // Remove elements with paywall selectors
    removeElementsBySelectors(root, PAYWALL_SELECTORS);

    // Get language-specific patterns
    const patterns = getPaywallPatterns(html);

    // Remove elements containing paywall patterns
    const textElements = root.querySelectorAll('p, div, span');
    textElements.forEach((el: HTMLElement) => {
      const text = el.text;
      for (const pattern of patterns) {
        if (pattern.test(text)) {
          el.remove();
          break;
        }
      }
    });

    return root.toString();
  } catch (error) {
    console.warn('[ContentCleaner] Paywall removal failed, using original HTML', error);
    return html;
  }
}

/**
 * Remove social sharing links and buttons
 */
export function removeSocialLinks(html: string): string {
  try {
    const root = parse(html);

    // Remove elements with social selectors
    removeElementsBySelectors(root, SOCIAL_SELECTORS);

    // Remove links to social platforms
    const links = root.querySelectorAll('a');
    links.forEach((link: HTMLElement) => {
      const href = link.getAttribute('href') || '';
      const socialUrls = [
        'facebook.com/sharer',
        'twitter.com/intent',
        'linkedin.com/share',
        't.me/share',
        'api.whatsapp.com',
        'pinterest.com/pin',
      ];

      if (socialUrls.some(url => href.includes(url))) {
        link.remove();
      }
    });

    // Remove mailto links
    const mailtoLinks = root.querySelectorAll('a[href^="mailto:"]');
    mailtoLinks.forEach((el: HTMLElement) => el.remove());

    return root.toString();
  } catch (error) {
    console.warn('[ContentCleaner] Social links removal failed', error);
    return html;
  }
}

/**
 * Remove newsletter signup forms
 */
export function removeNewsletterSignups(html: string): string {
  try {
    const root = parse(html);
    removeElementsBySelectors(root, NEWSLETTER_SELECTORS);
    return root.toString();
  } catch (error) {
    console.warn('[ContentCleaner] Newsletter removal failed', error);
    return html;
  }
}

/**
 * Remove comment sections
 */
export function removeComments(html: string): string {
  try {
    const root = parse(html);
    removeElementsBySelectors(root, COMMENT_SELECTORS);
    return root.toString();
  } catch (error) {
    console.warn('[ContentCleaner] Comments removal failed', error);
    return html;
  }
}

/**
 * Remove related articles sections
 */
export function removeRelatedArticles(html: string): string {
  try {
    const root = parse(html);
    removeElementsBySelectors(root, RELATED_SELECTORS);
    return root.toString();
  } catch (error) {
    console.warn('[ContentCleaner] Related articles removal failed', error);
    return html;
  }
}

/**
 * Master cleaning function - applies all cleaners
 */
export function cleanArticleContent(html: string): string {
  try {
    const root = parse(html);

    // Remove all unwanted elements at once
    const allSelectors = [
      ...PAYWALL_SELECTORS,
      ...SOCIAL_SELECTORS,
      ...NEWSLETTER_SELECTORS,
      ...COMMENT_SELECTORS,
      ...RELATED_SELECTORS,
    ];

    removeElementsBySelectors(root, allSelectors);

    // Remove paragraphs/divs containing paywall patterns
    const patterns = getPaywallPatterns(html);
    const textElements = root.querySelectorAll('p, div, span');
    textElements.forEach((el: HTMLElement) => {
      const text = el.text;
      for (const pattern of patterns) {
        if (pattern.test(text)) {
          el.remove();
          break;
        }
      }
    });

    // Remove empty paragraphs and divs
    const emptyElements = root.querySelectorAll('p:empty, div:empty');
    emptyElements.forEach((el: HTMLElement) => el.remove());

    return root.toString();
  } catch (error) {
    console.warn('[ContentCleaner] Cleaning failed, using original HTML', error);
    return html;
  }
}
