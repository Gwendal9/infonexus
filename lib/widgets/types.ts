// Widget catalog and configuration types

export type WidgetType = 'weather' | 'crypto' | 'quote';

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
  currencies: Array<{
    id: string;      // coingecko id
    symbol: string;  // BTC, ETH, etc.
    name: string;    // Bitcoin, Ethereum, etc.
  }>;
}

// All widget settings
export interface WidgetSettings {
  weather: WeatherSettings;
  crypto: CryptoSettings;
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

// Default configuration
export const DEFAULT_WIDGET_CONFIG: WidgetConfig = {
  enabled: {
    weather: true,
    crypto: true,
    quote: true,
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
  },
};
