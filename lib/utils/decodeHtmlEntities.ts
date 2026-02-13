/**
 * Comprehensive HTML entity decoder.
 * Handles named entities, decimal numeric (&#NNN;) and hex numeric (&#xHH;) entities.
 */

const NAMED_ENTITIES: Record<string, string> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&apos;': "'",
  '&laquo;': '\u00AB',
  '&raquo;': '\u00BB',
  '&ldquo;': '\u201C',
  '&rdquo;': '\u201D',
  '&lsquo;': '\u2018',
  '&rsquo;': '\u2019',
  '&ndash;': '\u2013',
  '&mdash;': '\u2014',
  '&hellip;': '\u2026',
  '&copy;': '\u00A9',
  '&reg;': '\u00AE',
  '&trade;': '\u2122',
  '&euro;': '\u20AC',
  '&pound;': '\u00A3',
  '&yen;': '\u00A5',
  '&cent;': '\u00A2',
  '&deg;': '\u00B0',
  '&times;': '\u00D7',
  '&divide;': '\u00F7',
  '&bull;': '\u2022',
  '&middot;': '\u00B7',
  '&iexcl;': '\u00A1',
  '&iquest;': '\u00BF',
  '&agrave;': '\u00E0',
  '&aacute;': '\u00E1',
  '&acirc;': '\u00E2',
  '&atilde;': '\u00E3',
  '&auml;': '\u00E4',
  '&aring;': '\u00E5',
  '&aelig;': '\u00E6',
  '&ccedil;': '\u00E7',
  '&egrave;': '\u00E8',
  '&eacute;': '\u00E9',
  '&ecirc;': '\u00EA',
  '&euml;': '\u00EB',
  '&igrave;': '\u00EC',
  '&iacute;': '\u00ED',
  '&icirc;': '\u00EE',
  '&iuml;': '\u00EF',
  '&ograve;': '\u00F2',
  '&oacute;': '\u00F3',
  '&ocirc;': '\u00F4',
  '&otilde;': '\u00F5',
  '&ouml;': '\u00F6',
  '&ugrave;': '\u00F9',
  '&uacute;': '\u00FA',
  '&ucirc;': '\u00FB',
  '&uuml;': '\u00FC',
  '&ntilde;': '\u00F1',
  '&szlig;': '\u00DF',
  '&oelig;': '\u0153',
  '&OElig;': '\u0152',
};

export function decodeHtmlEntities(text: string): string {
  if (!text) return '';

  return text
    // Decode hex numeric entities: &#xHH; or &#XHH;
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
      const code = parseInt(hex, 16);
      return code > 0 ? String.fromCodePoint(code) : '';
    })
    // Decode decimal numeric entities: &#NNN;
    .replace(/&#(\d+);/g, (_, dec) => {
      const code = parseInt(dec, 10);
      return code > 0 ? String.fromCodePoint(code) : '';
    })
    // Decode named entities
    .replace(/&[a-zA-Z]+;/g, (entity) => {
      return NAMED_ENTITIES[entity] ?? NAMED_ENTITIES[entity.toLowerCase()] ?? entity;
    });
}
