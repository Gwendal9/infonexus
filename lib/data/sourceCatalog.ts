import { SourceType } from '@/types/database';

export interface CatalogSource {
  id: string;
  name: string;
  url: string;
  type: SourceType;
  category: string;
  icon?: string;
}

// Verified working sources (tested 2026-02-07)
export const sourceCatalog: CatalogSource[] = [
  // Actualités générales
  { id: 'lemonde', name: 'Le Monde', url: 'https://www.lemonde.fr/rss/une.xml', type: 'rss', category: 'Actualités' },
  { id: 'lefigaro', name: 'Le Figaro', url: 'https://www.lefigaro.fr/rss/figaro_actualites.xml', type: 'rss', category: 'Actualités' },
  { id: 'liberation', name: 'Libération', url: 'https://www.liberation.fr/arc/outboundfeeds/rss-all/collection/accueil-une/', type: 'rss', category: 'Actualités' },
  { id: 'franceinfo', name: 'France Info', url: 'https://www.francetvinfo.fr/titres.rss', type: 'rss', category: 'Actualités' },
  { id: '20minutes', name: '20 Minutes', url: 'https://www.20minutes.fr/feeds/rss-une.xml', type: 'rss', category: 'Actualités' },
  { id: 'huffpost', name: 'HuffPost France', url: 'https://www.huffingtonpost.fr/feeds/index.xml', type: 'rss', category: 'Actualités' },
  { id: 'bfmtv', name: 'BFM TV', url: 'https://www.bfmtv.com/rss/news-24-7/', type: 'rss', category: 'Actualités' },
  { id: 'ouest-france', name: 'Ouest-France', url: 'https://www.ouest-france.fr/rss/une', type: 'rss', category: 'Actualités' },
  { id: 'lobs', name: "L'Obs", url: 'https://www.nouvelobs.com/rss.xml', type: 'rss', category: 'Actualités' },
  { id: 'lexpress', name: "L'Express", url: 'https://www.lexpress.fr/arc/outboundfeeds/rss/alaune.xml', type: 'rss', category: 'Actualités' },
  { id: 'mediapart', name: 'Mediapart', url: 'https://www.mediapart.fr/articles/feed', type: 'rss', category: 'Actualités' },

  // Tech
  { id: 'frandroid', name: 'Frandroid', url: 'https://www.frandroid.com/feed', type: 'rss', category: 'Tech' },
  { id: 'numerama', name: 'Numerama', url: 'https://www.numerama.com/feed/', type: 'rss', category: 'Tech' },
  { id: 'clubic', name: 'Clubic', url: 'https://www.clubic.com/feed/news.rss', type: 'rss', category: 'Tech' },
  { id: '01net', name: '01net', url: 'https://www.01net.com/rss/info/flux-rss/flux-toutes-les-actualites/', type: 'rss', category: 'Tech' },
  { id: 'journaldugeek', name: 'Journal du Geek', url: 'https://www.journaldugeek.com/feed/', type: 'rss', category: 'Tech' },
  { id: 'korben', name: 'Korben', url: 'https://korben.info/feed', type: 'rss', category: 'Tech' },
  { id: 'theverge', name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', type: 'rss', category: 'Tech' },
  { id: 'techcrunch', name: 'TechCrunch', url: 'https://techcrunch.com/feed/', type: 'rss', category: 'Tech' },
  { id: 'hackernews', name: 'Hacker News', url: 'https://hnrss.org/frontpage', type: 'rss', category: 'Tech' },

  // Science
  { id: 'futura', name: 'Futura Sciences', url: 'https://www.futura-sciences.com/rss/actualites.xml', type: 'rss', category: 'Science' },
  { id: 'sciencesetavenir', name: 'Sciences et Avenir', url: 'https://www.sciencesetavenir.fr/rss.xml', type: 'rss', category: 'Science' },

  // Culture
  { id: 'allocine', name: 'AlloCiné', url: 'https://www.allocine.fr/rss/news.xml', type: 'rss', category: 'Culture' },

  // YouTube - Actualités & Décryptage
  { id: 'hugodecrypte', name: 'Hugo Décrypte', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCAcAnMF0OrCtUep3Y4M-ZPw', type: 'youtube', category: 'YouTube' },
  { id: 'lepen', name: 'Le Pen - Actus du jour', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCVeMw72tepFl1Zt5fvf9QKQ', type: 'youtube', category: 'YouTube' },
  { id: 'brut', name: 'Brut', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCSKdvgqdnj72_SLggp7BDTg', type: 'youtube', category: 'YouTube' },

  // YouTube - Tech & Science
  { id: 'micode', name: 'Micode', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCYnvxJ-PKiGXo_tYXpWAC-w', type: 'youtube', category: 'YouTube' },
  { id: 'lereveilleur', name: 'Le Réveilleur', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC1EacOJoqsKaYxaDomTCTEQ', type: 'youtube', category: 'YouTube' },
  { id: 'scienceetonnante', name: 'Science Étonnante', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCaNlbnghtwlsGF-KzAFThqA', type: 'youtube', category: 'YouTube' },

  // International
  { id: 'bbc', name: 'BBC News', url: 'https://feeds.bbci.co.uk/news/rss.xml', type: 'rss', category: 'International' },
  { id: 'guardian', name: 'The Guardian', url: 'https://www.theguardian.com/world/rss', type: 'rss', category: 'International' },
  { id: 'nytimes', name: 'New York Times', url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', type: 'rss', category: 'International' },
];

export const categories = [...new Set(sourceCatalog.map(s => s.category))];

export function searchCatalog(query: string): CatalogSource[] {
  if (!query.trim()) return [];

  const q = query.toLowerCase();
  return sourceCatalog.filter(
    s => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)
  );
}

export function getCatalogByCategory(category: string): CatalogSource[] {
  return sourceCatalog.filter(s => s.category === category);
}
