// Sync manager for offline-first data synchronization
import { supabase } from '@/utils/supabase';
import {
  saveArticles,
  saveSources,
  saveThemes,
  saveSourceThemes,
  saveFavorites,
  saveReadArticles,
  getSyncQueue,
  removeSyncQueueItem,
  updateSyncQueueItemError,
  SyncQueueItem,
} from '@/lib/db/operations';
import { Article, Source, Theme, SourceTheme, Favorite, ReadArticle } from '@/types/database';

const MAX_RETRIES = 3;

export interface SyncResult {
  success: boolean;
  articlesCount: number;
  sourcesCount: number;
  themesCount: number;
  favoritesCount: number;
  errors: string[];
}

/**
 * Pull all data from Supabase and save to local SQLite
 */
export async function pullFromSupabase(): Promise<SyncResult> {
  const result: SyncResult = {
    success: true,
    articlesCount: 0,
    sourcesCount: 0,
    themesCount: 0,
    favoritesCount: 0,
    errors: [],
  };

  try {
    // Fetch sources
    const { data: sources, error: sourcesError } = await supabase
      .from('sources')
      .select('*')
      .order('created_at', { ascending: false });

    if (sourcesError) {
      result.errors.push(`Sources: ${sourcesError.message}`);
    } else if (sources) {
      await saveSources(sources as Source[]);
      result.sourcesCount = sources.length;
    }

    // Fetch themes
    const { data: themes, error: themesError } = await supabase
      .from('themes')
      .select('*')
      .order('name', { ascending: true });

    if (themesError) {
      result.errors.push(`Themes: ${themesError.message}`);
    } else if (themes) {
      await saveThemes(themes as Theme[]);
      result.themesCount = themes.length;
    }

    // Fetch source_themes
    const { data: sourceThemes, error: sourceThemesError } = await supabase
      .from('source_themes')
      .select('source_id, theme_id');

    if (sourceThemesError) {
      result.errors.push(`Source themes: ${sourceThemesError.message}`);
    } else if (sourceThemes) {
      await saveSourceThemes(sourceThemes as SourceTheme[]);
    }

    // Fetch articles
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('*')
      .order('published_at', { ascending: false, nullsFirst: false })
      .limit(100);

    if (articlesError) {
      result.errors.push(`Articles: ${articlesError.message}`);
    } else if (articles) {
      await saveArticles(articles as Article[]);
      result.articlesCount = articles.length;
    }

    // Fetch favorites
    const { data: favorites, error: favoritesError } = await supabase
      .from('favorites')
      .select('*')
      .order('created_at', { ascending: false });

    if (favoritesError) {
      result.errors.push(`Favorites: ${favoritesError.message}`);
    } else if (favorites) {
      await saveFavorites(favorites as Favorite[]);
      result.favoritesCount = favorites.length;
    }

    // Fetch read articles
    const { data: readArticles, error: readArticlesError } = await supabase
      .from('read_articles')
      .select('*');

    if (readArticlesError) {
      result.errors.push(`Read articles: ${readArticlesError.message}`);
    } else if (readArticles) {
      await saveReadArticles(readArticles as ReadArticle[]);
    }

    result.success = result.errors.length === 0;
    console.log('[Sync] Pull completed:', result);
  } catch (error) {
    result.success = false;
    result.errors.push(error instanceof Error ? error.message : 'Unknown error');
    console.error('[Sync] Pull failed:', error);
  }

  return result;
}

/**
 * Process the sync queue - push pending local changes to Supabase
 */
export async function processSyncQueue(): Promise<{ processed: number; failed: number }> {
  const queue = await getSyncQueue();
  let processed = 0;
  let failed = 0;

  console.log(`[Sync] Processing ${queue.length} items in queue`);

  for (const item of queue) {
    if (item.retry_count >= MAX_RETRIES) {
      // Remove permanently instead of skipping indefinitely
      await removeSyncQueueItem(item.id);
      failed++;
      continue;
    }

    try {
      await processQueueItem(item);
      await removeSyncQueueItem(item.id);
      processed++;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await updateSyncQueueItemError(item.id, errorMessage);
      failed++;
      console.warn(`[Sync] Failed to process item ${item.id} (retry ${item.retry_count + 1}/${MAX_RETRIES}):`, errorMessage);
    }
  }

  console.log(`[Sync] Queue processed: ${processed} success, ${failed} failed`);
  return { processed, failed };
}

async function processQueueItem(item: SyncQueueItem): Promise<void> {
  const payload = JSON.parse(item.payload);

  switch (item.table_name) {
    case 'favorites':
      await processFavoriteAction(item.action, payload);
      break;
    case 'read_articles':
      await processReadArticleAction(item.action, payload);
      break;
    case 'sources':
      await processSourceAction(item.action, payload);
      break;
    case 'themes':
      await processThemeAction(item.action, payload);
      break;
    case 'source_themes':
      await processSourceThemeAction(item.action, payload);
      break;
    default:
      throw new Error(`Unknown table: ${item.table_name}`);
  }
}

async function processFavoriteAction(action: string, payload: any): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  switch (action) {
    case 'INSERT':
      const { error: insertError } = await supabase
        .from('favorites')
        .insert({ user_id: user.id, article_id: payload.article_id });
      if (insertError) throw insertError;
      break;
    case 'DELETE':
      const { error: deleteError } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('article_id', payload.article_id);
      if (deleteError) throw deleteError;
      break;
    default:
      throw new Error(`Unknown action for favorites: ${action}`);
  }
}

async function processReadArticleAction(action: string, payload: any): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  switch (action) {
    case 'INSERT':
      const { error: insertError } = await supabase
        .from('read_articles')
        .upsert(
          { user_id: user.id, article_id: payload.article_id, read_at: new Date().toISOString() },
          { onConflict: 'user_id,article_id' }
        );
      if (insertError) throw insertError;
      break;
    case 'DELETE':
      const { error: deleteError } = await supabase
        .from('read_articles')
        .delete()
        .eq('user_id', user.id)
        .eq('article_id', payload.article_id);
      if (deleteError) throw deleteError;
      break;
    default:
      throw new Error(`Unknown action for read_articles: ${action}`);
  }
}

async function processSourceAction(action: string, payload: any): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  switch (action) {
    case 'INSERT':
      const { error: insertError } = await supabase
        .from('sources')
        .insert({ ...payload, user_id: user.id });
      if (insertError) throw insertError;
      break;
    case 'UPDATE':
      const { error: updateError } = await supabase
        .from('sources')
        .update(payload)
        .eq('id', payload.id)
        .eq('user_id', user.id);
      if (updateError) throw updateError;
      break;
    case 'DELETE':
      const { error: deleteError } = await supabase
        .from('sources')
        .delete()
        .eq('id', payload.id)
        .eq('user_id', user.id);
      if (deleteError) throw deleteError;
      break;
    default:
      throw new Error(`Unknown action for sources: ${action}`);
  }
}

async function processThemeAction(action: string, payload: any): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  switch (action) {
    case 'INSERT':
      const { error: insertError } = await supabase
        .from('themes')
        .insert({ ...payload, user_id: user.id });
      if (insertError) throw insertError;
      break;
    case 'UPDATE':
      const { error: updateError } = await supabase
        .from('themes')
        .update(payload)
        .eq('id', payload.id)
        .eq('user_id', user.id);
      if (updateError) throw updateError;
      break;
    case 'DELETE':
      const { error: deleteError } = await supabase
        .from('themes')
        .delete()
        .eq('id', payload.id)
        .eq('user_id', user.id);
      if (deleteError) throw deleteError;
      break;
    default:
      throw new Error(`Unknown action for themes: ${action}`);
  }
}

async function processSourceThemeAction(action: string, payload: any): Promise<void> {
  switch (action) {
    case 'INSERT':
      const { error: insertError } = await supabase
        .from('source_themes')
        .insert(payload);
      if (insertError) throw insertError;
      break;
    case 'DELETE':
      const { error: deleteError } = await supabase
        .from('source_themes')
        .delete()
        .eq('source_id', payload.source_id)
        .eq('theme_id', payload.theme_id);
      if (deleteError) throw deleteError;
      break;
    default:
      throw new Error(`Unknown action for source_themes: ${action}`);
  }
}

/**
 * Full sync: push pending changes, then pull latest data
 */
export async function fullSync(): Promise<SyncResult> {
  console.log('[Sync] Starting full sync...');

  // First, push any pending local changes
  await processSyncQueue();

  // Then pull latest from server
  const result = await pullFromSupabase();

  console.log('[Sync] Full sync completed');
  return result;
}
