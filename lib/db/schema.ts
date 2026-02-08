// SQLite schema for offline storage
// These tables mirror the Supabase schema for offline-first support

export const SCHEMA_VERSION = 2;

// Articles table - stores fetched articles locally
export const CREATE_ARTICLES_TABLE = `
CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  image_url TEXT,
  author TEXT,
  published_at TEXT,
  fetched_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  synced_at TEXT DEFAULT CURRENT_TIMESTAMP
)`;

// Sources table - stores user's RSS/content sources
export const CREATE_SOURCES_TABLE = `
CREATE TABLE IF NOT EXISTS sources (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  url TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'rss',
  status TEXT NOT NULL DEFAULT 'active',
  logo_url TEXT,
  last_fetched_at TEXT,
  last_error TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  synced_at TEXT DEFAULT CURRENT_TIMESTAMP
)`;

// Themes table - stores user-defined themes/categories
export const CREATE_THEMES_TABLE = `
CREATE TABLE IF NOT EXISTS themes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  synced_at TEXT DEFAULT CURRENT_TIMESTAMP
)`;

// Source-themes junction table
export const CREATE_SOURCE_THEMES_TABLE = `
CREATE TABLE IF NOT EXISTS source_themes (
  source_id TEXT NOT NULL,
  theme_id TEXT NOT NULL,
  synced_at TEXT DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (source_id, theme_id)
)`;

// Favorites table - stores user's favorite articles
export const CREATE_FAVORITES_TABLE = `
CREATE TABLE IF NOT EXISTS favorites (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  article_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  synced_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, article_id)
)`;

// Sync queue - stores pending actions when offline
export const CREATE_SYNC_QUEUE_TABLE = `
CREATE TABLE IF NOT EXISTS sync_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  payload TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  retry_count INTEGER DEFAULT 0,
  last_error TEXT
)`;

// Read articles - tracks which articles the user has read
export const CREATE_READ_ARTICLES_TABLE = `
CREATE TABLE IF NOT EXISTS read_articles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  article_id TEXT NOT NULL,
  read_at TEXT NOT NULL,
  synced_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, article_id)
)`;

// Source fetch logs - tracks fetch history for source health
export const CREATE_SOURCE_FETCH_LOGS_TABLE = `
CREATE TABLE IF NOT EXISTS source_fetch_logs (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL,
  success INTEGER NOT NULL,
  articles_count INTEGER NOT NULL DEFAULT 0,
  error TEXT,
  fetched_at TEXT NOT NULL
)`;

// Schema metadata for migrations
export const CREATE_SCHEMA_META_TABLE = `
CREATE TABLE IF NOT EXISTS schema_meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
)`;

// All table creation statements in order
export const ALL_TABLES = [
  CREATE_SCHEMA_META_TABLE,
  CREATE_ARTICLES_TABLE,
  CREATE_SOURCES_TABLE,
  CREATE_THEMES_TABLE,
  CREATE_SOURCE_THEMES_TABLE,
  CREATE_FAVORITES_TABLE,
  CREATE_SYNC_QUEUE_TABLE,
  CREATE_READ_ARTICLES_TABLE,
  CREATE_SOURCE_FETCH_LOGS_TABLE,
];

// Indexes for better query performance
export const CREATE_INDEXES = [
  'CREATE INDEX IF NOT EXISTS idx_articles_source_id ON articles(source_id)',
  'CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC)',
  'CREATE INDEX IF NOT EXISTS idx_sources_user_id ON sources(user_id)',
  'CREATE INDEX IF NOT EXISTS idx_themes_user_id ON themes(user_id)',
  'CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id)',
  'CREATE INDEX IF NOT EXISTS idx_favorites_article_id ON favorites(article_id)',
  'CREATE INDEX IF NOT EXISTS idx_sync_queue_created_at ON sync_queue(created_at)',
  'CREATE INDEX IF NOT EXISTS idx_read_articles_user_id ON read_articles(user_id)',
  'CREATE INDEX IF NOT EXISTS idx_read_articles_article_id ON read_articles(article_id)',
  'CREATE INDEX IF NOT EXISTS idx_source_fetch_logs_source_id ON source_fetch_logs(source_id)',
  'CREATE INDEX IF NOT EXISTS idx_source_fetch_logs_fetched_at ON source_fetch_logs(fetched_at DESC)',
];
