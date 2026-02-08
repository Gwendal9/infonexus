// Widget catalog and configuration types

export type WidgetType = 'weather' | 'crypto' | 'quote' | 'football' | 'stock' | 'news' | 'word';

export interface WidgetDefinition {
  id: WidgetType;
  name: string;
  description: string;
  icon: string;
  defaultEnabled: boolean;
  hasSettings: boolean;
}

// Widget catalog - all available widgets
export const WIDGET_CATALOG: WidgetDefinition[] = [
  {
    id: 'weather',
    name: 'Météo',
    description: 'Prévisions météo pour une ville',
    icon: 'partly-sunny',
    defaultEnabled: true,
    hasSettings: true,
  },
  {
    id: 'crypto',
    name: 'Crypto',
    description: 'Prix des cryptomonnaies',
    icon: 'logo-bitcoin',
    defaultEnabled: true,
    hasSettings: true,
  },
  {
    id: 'quote',
    name: 'Citation',
    description: 'Citation inspirante du jour',
    icon: 'bulb',
    defaultEnabled: true,
    hasSettings: false,
  },
  {
    id: 'football',
    name: 'Football',
    description: 'Classements des ligues de football',
    icon: 'football',
    defaultEnabled: false,
    hasSettings: true,
  },
  {
    id: 'stock',
    name: 'Bourse',
    description: 'Cours des actions et ETFs',
    icon: 'trending-up',
    defaultEnabled: false,
    hasSettings: true,
  },
  {
    id: 'news',
    name: 'Actu',
    description: 'Actualités en temps réel',
    icon: 'newspaper',
    defaultEnabled: false,
    hasSettings: true,
  },
  {
    id: 'word',
    name: 'Mot du jour',
    description: 'Découvrez un nouveau mot chaque jour',
    icon: 'book',
    defaultEnabled: false,
    hasSettings: false,
  },
];

// Weather widget settings
export interface WeatherSettings {
  city: string;
  latitude: number;
  longitude: number;
  showForecast: boolean; // 5-day forecast
}

// Crypto widget settings
export interface CryptoSettings {
  currencies: {
    id: string;      // coingecko id
    symbol: string;  // BTC, ETH, etc.
    name: string;    // Bitcoin, Ethereum, etc.
  }[];
}

// Football widget settings
export interface FootballLeague {
  code: string;   // API code: PL, FL1, CL
  name: string;   // Display name
  country: string;
}

export interface FootballSettings {
  leagues: FootballLeague[];
}

// Stock widget settings
export interface StockItem {
  symbol: string;
  name: string;
  type: 'stock' | 'etf';
}

export interface StockSettings {
  items: StockItem[];
  apiKey?: string;
}

// News widget settings
export type NewsCategory = 'general' | 'business' | 'technology' | 'sports' | 'health' | 'science';

export interface NewsSettings {
  category: NewsCategory;
  apiKey?: string;
}

// All widget settings
export interface WidgetSettings {
  weather: WeatherSettings;
  crypto: CryptoSettings;
  football: FootballSettings;
  stock: StockSettings;
  news: NewsSettings;
}

// Widget state (enabled + settings)
export interface WidgetConfig {
  enabled: Record<WidgetType, boolean>;
  settings: WidgetSettings;
}

// Preset cities for weather
export const PRESET_CITIES = [
  { name: 'Paris', latitude: 48.8566, longitude: 2.3522 },
  { name: 'Lyon', latitude: 45.7640, longitude: 4.8357 },
  { name: 'Marseille', latitude: 43.2965, longitude: 5.3698 },
  { name: 'Toulouse', latitude: 43.6047, longitude: 1.4442 },
  { name: 'Bordeaux', latitude: 44.8378, longitude: -0.5792 },
  { name: 'Lille', latitude: 50.6292, longitude: 3.0573 },
  { name: 'Nice', latitude: 43.7102, longitude: 7.2620 },
  { name: 'Nantes', latitude: 47.2184, longitude: -1.5536 },
  { name: 'Strasbourg', latitude: 48.5734, longitude: 7.7521 },
  { name: 'Montpellier', latitude: 43.6108, longitude: 3.8767 },
];

// Preset football leagues
export const PRESET_LEAGUES: FootballLeague[] = [
  { code: 'FL1', name: 'Ligue 1', country: 'France' },
  { code: 'PL', name: 'Premier League', country: 'Angleterre' },
  { code: 'CL', name: 'Champions League', country: 'Europe' },
  { code: 'BL1', name: 'Bundesliga', country: 'Allemagne' },
  { code: 'SA', name: 'Serie A', country: 'Italie' },
  { code: 'PD', name: 'La Liga', country: 'Espagne' },
];

// Preset cryptocurrencies
export const PRESET_CRYPTOS = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
  { id: 'solana', symbol: 'SOL', name: 'Solana' },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano' },
  { id: 'ripple', symbol: 'XRP', name: 'Ripple' },
  { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin' },
  { id: 'polkadot', symbol: 'DOT', name: 'Polkadot' },
  { id: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche' },
];

// Preset stocks (US market - works with Finnhub free tier)
export const PRESET_STOCKS: StockItem[] = [
  { symbol: 'AAPL', name: 'Apple', type: 'stock' },
  { symbol: 'MSFT', name: 'Microsoft', type: 'stock' },
  { symbol: 'GOOGL', name: 'Google', type: 'stock' },
  { symbol: 'AMZN', name: 'Amazon', type: 'stock' },
  { symbol: 'NVDA', name: 'Nvidia', type: 'stock' },
  { symbol: 'TSLA', name: 'Tesla', type: 'stock' },
  { symbol: 'META', name: 'Meta', type: 'stock' },
  { symbol: 'NFLX', name: 'Netflix', type: 'stock' },
];

// Preset ETFs (US - works with Finnhub free tier)
export const PRESET_ETFS: StockItem[] = [
  { symbol: 'SPY', name: 'S&P 500', type: 'etf' },
  { symbol: 'QQQ', name: 'Nasdaq 100', type: 'etf' },
  { symbol: 'VTI', name: 'Total Market', type: 'etf' },
];

// News categories
export const NEWS_CATEGORIES: { value: NewsCategory; label: string }[] = [
  { value: 'general', label: 'Général' },
  { value: 'business', label: 'Business' },
  { value: 'technology', label: 'Tech' },
  { value: 'sports', label: 'Sport' },
  { value: 'health', label: 'Santé' },
  { value: 'science', label: 'Science' },
];

// Default configuration
export const DEFAULT_WIDGET_CONFIG: WidgetConfig = {
  enabled: {
    weather: true,
    crypto: true,
    quote: true,
    football: false,
    stock: false,
    news: false,
    word: false,
  },
  settings: {
    weather: {
      city: 'Paris',
      latitude: 48.8566,
      longitude: 2.3522,
      showForecast: false,
    },
    crypto: {
      currencies: [
        { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
        { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
      ],
    },
    football: {
      leagues: [
        { code: 'FL1', name: 'Ligue 1', country: 'France' },
      ],
    },
    stock: {
      items: [
        { symbol: 'AAPL', name: 'Apple', type: 'stock' },
        { symbol: 'MSFT', name: 'Microsoft', type: 'stock' },
        { symbol: 'GOOGL', name: 'Google', type: 'stock' },
      ],
    },
    news: {
      category: 'general',
    },
  },
};
