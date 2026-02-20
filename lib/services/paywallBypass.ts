/**
 * Paywall Bypass Service
 *
 * LEGAL DISCLAIMER:
 * This functionality is intended for PERSONAL USE ONLY under fair use / private copy provisions.
 * Do NOT redistribute, republish, or commercially exploit bypassed content.
 * Respect copyright holders and consider subscribing to support quality journalism.
 *
 * Cascade strategy:
 * 1. Try GoogleBot User-Agent (publishers often allow crawlers)
 * 2. Try 12ft.io proxy service
 * 3. Try Archive.is archived version
 * 4. Fallback to browser
 */

const FETCH_TIMEOUT = 15000; // 15 seconds

const GOOGLEBOT_USER_AGENT = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
const BINGBOT_USER_AGENT = 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)';
const FACEBOOKBOT_USER_AGENT = 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)';
const STANDARD_USER_AGENT = 'InfoNexus/1.0 (News Aggregator)';

/**
 * Check if extracted content appears complete (not truncated by paywall)
 */
function isContentComplete(html: string | null): boolean {
  if (!html) return false;

  // Convert to plain text for analysis
  const text = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();

  // Content should be at least 300 characters to consider it complete
  // Lowered from 500 to handle shorter articles/briefs
  if (text.length < 300) return false;

  // Check for paywall indicators in the extracted content
  const paywallIndicators = [
    'réservé aux abonnés',
    'pour lire la suite',
    'subscribers only',
    'subscribe to read',
    'continue reading',
    'pour continuer',
  ];

  const lowerText = text.toLowerCase();
  const hasPaywallIndicator = paywallIndicators.some(indicator =>
    lowerText.includes(indicator.toLowerCase())
  );

  // If we find paywall indicators, content is NOT complete
  if (hasPaywallIndicator) {
    console.log('[PaywallBypass] Found paywall indicator in content');
    return false;
  }

  return true;
}

/**
 * Fetch page with custom User-Agent
 */
async function fetchWithUserAgent(url: string, userAgent: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    const response = await fetch(url, {
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'no-cache',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[PaywallBypass] HTTP ${response.status} with UA: ${userAgent}`);
      return null;
    }

    const html = await response.text();
    return html;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.warn(`[PaywallBypass] Timeout with UA: ${userAgent}`);
    } else {
      console.warn(`[PaywallBypass] Error with UA: ${userAgent}`, error.message);
    }
    return null;
  }
}

/**
 * Try fetching via 12ft.io proxy
 * Works for JavaScript-based paywalls
 */
async function fetch12ft(url: string): Promise<string | null> {
  try {
    // 12ft.io expects the URL as path parameter
    const proxyUrl = `https://12ft.io/${encodeURIComponent(url)}`;

    console.log('[PaywallBypass] Trying 12ft.io proxy...');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    const response = await fetch(proxyUrl, {
      headers: {
        'User-Agent': STANDARD_USER_AGENT,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[PaywallBypass] 12ft.io returned ${response.status}`);
      return null;
    }

    const html = await response.text();
    console.log('[PaywallBypass] ✓ 12ft.io succeeded');
    return html;
  } catch (error: any) {
    console.warn('[PaywallBypass] 12ft.io failed:', error.message);
    return null;
  }
}

/**
 * Try fetching from Archive.is
 * Works for archived versions of articles
 */
async function fetchArchive(url: string): Promise<string | null> {
  try {
    // Archive.is URL format
    const archiveUrl = `https://archive.is/${encodeURIComponent(url)}`;

    console.log('[PaywallBypass] Trying Archive.is...');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    const response = await fetch(archiveUrl, {
      headers: {
        'User-Agent': STANDARD_USER_AGENT,
      },
      signal: controller.signal,
      redirect: 'follow', // Archive.is may redirect
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[PaywallBypass] Archive.is returned ${response.status}`);
      return null;
    }

    const html = await response.text();

    // Archive.is wraps content in iframe - extract it
    const iframeMatch = html.match(/<iframe[^>]+src=["']([^"']+)["']/i);
    if (iframeMatch) {
      const iframeUrl = iframeMatch[1];
      const iframeResponse = await fetch(iframeUrl, {
        headers: { 'User-Agent': STANDARD_USER_AGENT },
      });
      const iframeHtml = await iframeResponse.text();
      console.log('[PaywallBypass] ✓ Archive.is succeeded (iframe)');
      return iframeHtml;
    }

    console.log('[PaywallBypass] ✓ Archive.is succeeded');
    return html;
  } catch (error: any) {
    console.warn('[PaywallBypass] Archive.is failed:', error.message);
    return null;
  }
}

/**
 * Master bypass function - tries all strategies in cascade
 * Returns HTML content if successful, null otherwise
 */
export async function bypassPaywall(url: string): Promise<string | null> {
  console.log(`[PaywallBypass] Starting bypass cascade for: ${url}`);

  // Strategy 1: Try GoogleBot User-Agent
  console.log('[PaywallBypass] Strategy 1: GoogleBot UA');
  const googleBotHtml = await fetchWithUserAgent(url, GOOGLEBOT_USER_AGENT);
  if (isContentComplete(googleBotHtml)) {
    console.log('[PaywallBypass] ✓ GoogleBot strategy succeeded');
    return googleBotHtml;
  }

  // Strategy 2: Try BingBot User-Agent (sometimes works when Google doesn't)
  console.log('[PaywallBypass] Strategy 2: BingBot UA');
  const bingBotHtml = await fetchWithUserAgent(url, BINGBOT_USER_AGENT);
  if (isContentComplete(bingBotHtml)) {
    console.log('[PaywallBypass] ✓ BingBot strategy succeeded');
    return bingBotHtml;
  }

  // Strategy 3: Try FacebookBot (often whitelisted for social sharing)
  console.log('[PaywallBypass] Strategy 3: FacebookBot UA');
  const facebookBotHtml = await fetchWithUserAgent(url, FACEBOOKBOT_USER_AGENT);
  if (isContentComplete(facebookBotHtml)) {
    console.log('[PaywallBypass] ✓ FacebookBot strategy succeeded');
    return facebookBotHtml;
  }

  // Strategy 4: Try 12ft.io proxy
  console.log('[PaywallBypass] Strategy 4: 12ft.io');
  const twelveFtHtml = await fetch12ft(url);
  if (isContentComplete(twelveFtHtml)) {
    console.log('[PaywallBypass] ✓ 12ft.io strategy succeeded');
    return twelveFtHtml;
  }

  // Strategy 5: Try Archive.is
  console.log('[PaywallBypass] Strategy 5: Archive.is');
  const archiveHtml = await fetchArchive(url);
  if (isContentComplete(archiveHtml)) {
    console.log('[PaywallBypass] ✓ Archive.is strategy succeeded');
    return archiveHtml;
  }

  // All strategies failed
  console.log('[PaywallBypass] ✗ All bypass strategies failed');
  return null;
}

/**
 * Check if paywall bypass should be attempted
 * Based on content length and known paywall indicators
 */
export function shouldAttemptBypass(html: string, textLength: number): boolean {
  // Content too short - likely paywalled (lowered from 500)
  if (textLength < 300) return true;

  // Check for paywall indicators in HTML
  const paywallIndicators = [
    'paywall',
    'subscription-wall',
    'premium-content',
    'subscribers-only',
    'abonnés',
    'premium',
    'subscribe',
    'abonnement',
    'membres uniquement',
    'member-only',
    'reserved',
    'réservé',
  ];

  const lowerHtml = html.toLowerCase();
  const hasIndicator = paywallIndicators.some(indicator => lowerHtml.includes(indicator));

  if (hasIndicator) {
    console.log('[PaywallBypass] Paywall indicators detected, will attempt bypass');
  }

  return hasIndicator;
}
