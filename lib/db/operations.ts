// CRUD operations for SQLite local storage
import { getDatabase } from './database';
import { randomUUID } from 'expo-crypto';
import { Article, Source, Theme, Favorite, SourceTheme } from '@/types/database';

// ============================================================================
// Articles
// ============================================================================

export interface ArticleRow {
  id: string;
  source_id: string;
  url: string;
  title: string;
  summary: string | null;
  image_url: string | null;
  author: string | null;
  published_at: string | null;
  fetched_at: string;
  created_at: string;
}

export async function getArticles(): Promise<Article[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<ArticleRow>(
    'SELECT * FROM articles ORDER BY published_at DESC NULLS LAST LIMIT 100'
  );
  return rows;
}

export async function getArticlesBySourceId(sourceId: string): Promise<Article[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<ArticleRow>(
    'SELECT * FROM articles WHERE source_id = ? ORDER BY published_at DESC NULLS LAST',
    sourceId
  );
  return rows;
}

export async function getArticleById(id: string): Promise<Article | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<ArticleRow>(
    'SELECT * FROM articles WHERE id = ?',
    id
  );
  return row ?? null;
}

export async function saveArticles(articles: Article[]): Promise<void> {
  if (articles.length === 0) return;

  const db = await getDatabase();
  const now = new Date().toISOString();

  for (const article of articles) {
    await db.runAsync(
      `INSERT OR REPLACE INTO articles
       (id, source_id, url, title, summary, image_url, author, published_at, fetched_at, created_at, synced_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      article.id,
      article.source_id,
      article.url,
      article.title,
      article.summary,
      article.image_url,
      article.author,
      article.published_at,
      article.fetched_at,
      article.created_at,
      now
    );
  }
}

export async function deleteArticlesBySourceId(sourceId: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM articles WHERE source_id = ?', sourceId);
}

// ============================================================================
// Sources
// ============================================================================

export interface SourceRow {
  id: string;
  user_id: string;
  url: string;
  name: string;
  type: string;
  status: string;
  logo_url: string | null;
  last_fetched_at: string | null;
  last_error: string | null;
  created_at: string;
  updated_at: string;
}

export async function getSources(): Promise<Source[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<SourceRow>(
    'SELECT * FROM sources ORDER BY created_at DESC'
  );
  return rows as Source[];
}

export async function getSourceById(id: string): Promise<Source | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<SourceRow>(
    'SELECT * FROM sources WHERE id = ?',
    id
  );
  return row as Source | null;
}

export async function saveSources(sources: Source[]): Promise<void> {
  if (sources.length === 0) return;

  const db = await getDatabase();
  const now = new Date().toISOString();

  for (const source of sources) {
    await db.runAsync(
      `INSERT OR REPLACE INTO sources
       (id, user_id, url, name, type, status, logo_url, last_fetched_at, last_error, created_at, updated_at, synced_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      source.id,
      source.user_id,
      source.url,
      source.name,
      source.type,
      source.status,
      source.logo_url,
      source.last_fetched_at,
      source.last_error,
      source.created_at,
      source.updated_at,
      now
    );
  }
}

export async function deleteSource(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM sources WHERE id = ?', id);
  await db.runAsync('DELETE FROM source_themes WHERE source_id = ?', id);
  await db.runAsync('DELETE FROM articles WHERE source_id = ?', id);
}

// ============================================================================
// Themes
// ============================================================================

export interface ThemeRow {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export async function getThemes(): Promise<Theme[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<ThemeRow>(
    'SELECT * FROM themes ORDER BY name ASC'
  );
  return rows;
}

export async function saveThemes(themes: Theme[]): Promise<void> {
  if (themes.length === 0) return;

  const db = await getDatabase();
  const now = new Date().toISOString();

  for (const theme of themes) {
    await db.runAsync(
      `INSERT OR REPLACE INTO themes
       (id, user_id, name, color, created_at, updated_at, synced_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      theme.id,
      theme.user_id,
      theme.name,
      theme.color,
      theme.created_at,
      theme.updated_at,
      now
    );
  }
}

export async function deleteTheme(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM themes WHERE id = ?', id);
  await db.runAsync('DELETE FROM source_themes WHERE theme_id = ?', id);
}

// ============================================================================
// Source Themes
// ============================================================================

export interface SourceThemeRow {
  source_id: string;
  theme_id: string;
}

export async function getSourceThemes(): Promise<SourceTheme[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<SourceThemeRow>(
    'SELECT source_id, theme_id FROM source_themes'
  );
  return rows;
}

export async function getThemeIdsForSource(sourceId: string): Promise<string[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ theme_id: string }>(
    'SELECT theme_id FROM source_themes WHERE source_id = ?',
    sourceId
  );
  return rows.map((r) => r.theme_id);
}

export async function saveSourceThemes(sourceThemes: SourceTheme[]): Promise<void> {
  if (sourceThemes.length === 0) return;

  const db = await getDatabase();
  const now = new Date().toISOString();

  // Clear existing and insert fresh data
  await db.runAsync('DELETE FROM source_themes');

  for (const st of sourceThemes) {
    await db.runAsync(
      'INSERT OR REPLACE INTO source_themes (source_id, theme_id, synced_at) VALUES (?, ?, ?)',
      st.source_id,
      st.theme_id,
      now
    );
  }
}

export async function setSourceThemes(sourceId: string, themeIds: string[]): Promise<void> {
  const db = await getDatabase();
  const now = new Date().toISOString();

  // Delete existing themes for this source
  await db.runAsync('DELETE FROM source_themes WHERE source_id = ?', sourceId);

  // Insert new themes
  for (const themeId of themeIds) {
    await db.runAsync(
      'INSERT INTO source_themes (source_id, theme_id, synced_at) VALUES (?, ?, ?)',
      sourceId,
      themeId,
      now
    );
  }
}

// ============================================================================
// Favorites
// ============================================================================

export interface FavoriteRow {
  id: string;
  user_id: string;
  article_id: string;
  created_at: string;
}

export async function getFavorites(): Promise<Favorite[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<FavoriteRow>(
    'SELECT * FROM favorites ORDER BY created_at DESC'
  );
  return rows;
}

export async function getFavoriteArticleIds(): Promise<Set<string>> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ article_id: string }>(
    'SELECT article_id FROM favorites'
  );
  return new Set(rows.map((r) => r.article_id));
}

export async function saveFavorites(favorites: Favorite[]): Promise<void> {
  if (favorites.length === 0) return;

  const db = await getDatabase();
  const now = new Date().toISOString();

  for (const fav of favorites) {
    await db.runAsync(
      `INSERT OR REPLACE INTO favorites
       (id, user_id, article_id, created_at, synced_at)
       VALUES (?, ?, ?, ?, ?)`,
      fav.id,
      fav.user_id,
      fav.article_id,
      fav.created_at,
      now
    );
  }
}

export async function addFavorite(userId: string, articleId: string): Promise<string> {
  const db = await getDatabase();
  const id = randomUUID();
  const now = new Date().toISOString();

  await db.runAsync(
    'INSERT OR REPLACE INTO favorites (id, user_id, article_id, created_at, synced_at) VALUES (?, ?, ?, ?, ?)',
    id,
    userId,
    articleId,
    now,
    now
  );

  return id;
}

export async function removeFavorite(userId: string, articleId: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'DELETE FROM favorites WHERE user_id = ? AND article_id = ?',
    userId,
    articleId
  );
}

export async function isFavorite(userId: string, articleId: string): Promise<boolean> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM favorites WHERE user_id = ? AND article_id = ?',
    userId,
    articleId
  );
  return (row?.count ?? 0) > 0;
}

// ============================================================================
// Sync Queue
// ============================================================================

export type SyncAction = 'INSERT' | 'UPDATE' | 'DELETE';

export interface SyncQueueItem {
  id: number;
  action: SyncAction;
  table_name: string;
  record_id: string;
  payload: string;
  created_at: string;
  retry_count: number;
  last_error: string | null;
}

export async function addToSyncQueue(
  action: SyncAction,
  tableName: string,
  recordId: string,
  payload: object
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO sync_queue (action, table_name, record_id, payload) VALUES (?, ?, ?, ?)',
    action,
    tableName,
    recordId,
    JSON.stringify(payload)
  );
}

export async function getSyncQueue(): Promise<SyncQueueItem[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<SyncQueueItem>(
    'SELECT * FROM sync_queue ORDER BY created_at ASC'
  );
  return rows;
}

export async function removeSyncQueueItem(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM sync_queue WHERE id = ?', id);
}

export async function updateSyncQueueItemError(id: number, error: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE sync_queue SET retry_count = retry_count + 1, last_error = ? WHERE id = ?',
    error,
    id
  );
}

export async function getSyncQueueCount(): Promise<number> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM sync_queue'
  );
  return result?.count ?? 0;
}

export async function clearSyncQueue(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM sync_queue');
}

// ============================================================================
// Read Articles
// ============================================================================

export interface ReadArticleRow {
  id: string;
  user_id: string;
  article_id: string;
  read_at: string;
}

export async function getReadArticleIds(): Promise<Set<string>> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ article_id: string }>(
    'SELECT article_id FROM read_articles'
  );
  return new Set(rows.map((r) => r.article_id));
}

export async function markArticleAsRead(userId: string, articleId: string): Promise<void> {
  const db = await getDatabase();
  const id = randomUUID();
  const now = new Date().toISOString();

  await db.runAsync(
    'INSERT OR IGNORE INTO read_articles (id, user_id, article_id, read_at, synced_at) VALUES (?, ?, ?, ?, ?)',
    id,
    userId,
    articleId,
    now,
    now
  );
}

export async function markArticleAsUnread(userId: string, articleId: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'DELETE FROM read_articles WHERE user_id = ? AND article_id = ?',
    userId,
    articleId
  );
}

export async function isArticleRead(userId: string, articleId: string): Promise<boolean> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM read_articles WHERE user_id = ? AND article_id = ?',
    userId,
    articleId
  );
  return (row?.count ?? 0) > 0;
}

export async function saveReadArticles(readArticles: ReadArticleRow[]): Promise<void> {
  if (readArticles.length === 0) return;

  const db = await getDatabase();
  const now = new Date().toISOString();

  for (const ra of readArticles) {
    await db.runAsync(
      'INSERT OR REPLACE INTO read_articles (id, user_id, article_id, read_at, synced_at) VALUES (?, ?, ?, ?, ?)',
      ra.id,
      ra.user_id,
      ra.article_id,
      ra.read_at,
      now
    );
  }
}

// ============================================================================
// Source Fetch Logs
// ============================================================================

export interface SourceFetchLogRow {
  id: string;
  source_id: string;
  success: number; // SQLite uses 0/1 for boolean
  articles_count: number;
  error: string | null;
  fetched_at: string;
}

export async function addSourceFetchLog(
  sourceId: string,
  success: boolean,
  articlesCount: number,
  error: string | null
): Promise<void> {
  const db = await getDatabase();
  const id = randomUUID();
  const now = new Date().toISOString();

  await db.runAsync(
    'INSERT INTO source_fetch_logs (id, source_id, success, articles_count, error, fetched_at) VALUES (?, ?, ?, ?, ?, ?)',
    id,
    sourceId,
    success ? 1 : 0,
    articlesCount,
    error,
    now
  );

  // Keep only last 10 logs per source
  await db.runAsync(
    `DELETE FROM source_fetch_logs WHERE source_id = ? AND id NOT IN (
      SELECT id FROM source_fetch_logs WHERE source_id = ? ORDER BY fetched_at DESC LIMIT 10
    )`,
    sourceId,
    sourceId
  );
}

export async function getSourceFetchLogs(sourceId: string): Promise<SourceFetchLogRow[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<SourceFetchLogRow>(
    'SELECT * FROM source_fetch_logs WHERE source_id = ? ORDER BY fetched_at DESC LIMIT 10',
    sourceId
  );
  return rows;
}

export async function getSourceHealthStats(sourceId: string): Promise<{
  successRate: number;
  lastSuccess: string | null;
  lastError: string | null;
  totalFetches: number;
}> {
  const db = await getDatabase();

  const logs = await db.getAllAsync<SourceFetchLogRow>(
    'SELECT * FROM source_fetch_logs WHERE source_id = ? ORDER BY fetched_at DESC LIMIT 10',
    sourceId
  );

  if (logs.length === 0) {
    return { successRate: 100, lastSuccess: null, lastError: null, totalFetches: 0 };
  }

  const successCount = logs.filter(l => l.success === 1).length;
  const successRate = Math.round((successCount / logs.length) * 100);

  const lastSuccessLog = logs.find(l => l.success === 1);
  const lastErrorLog = logs.find(l => l.success === 0);

  return {
    successRate,
    lastSuccess: lastSuccessLog?.fetched_at ?? null,
    lastError: lastErrorLog?.error ?? null,
    totalFetches: logs.length,
  };
}

export async function clearSourceFetchLogs(sourceId: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM source_fetch_logs WHERE source_id = ?', sourceId);
}
