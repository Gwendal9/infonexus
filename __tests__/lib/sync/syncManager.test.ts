// Mock modules before imports
const mockSupabaseFrom = jest.fn();
const mockSupabaseAuth = {
  getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }),
};

jest.mock('@/utils/supabase', () => ({
  supabase: {
    from: mockSupabaseFrom,
    auth: mockSupabaseAuth,
  },
}));

const mockSaveArticles = jest.fn();
const mockSaveSources = jest.fn();
const mockSaveThemes = jest.fn();
const mockSaveSourceThemes = jest.fn();
const mockSaveFavorites = jest.fn();
const mockSaveReadArticles = jest.fn();
const mockGetSyncQueue = jest.fn();
const mockRemoveSyncQueueItem = jest.fn();
const mockUpdateSyncQueueItemError = jest.fn();

jest.mock('@/lib/db/operations', () => ({
  saveArticles: mockSaveArticles,
  saveSources: mockSaveSources,
  saveThemes: mockSaveThemes,
  saveSourceThemes: mockSaveSourceThemes,
  saveFavorites: mockSaveFavorites,
  saveReadArticles: mockSaveReadArticles,
  getSyncQueue: mockGetSyncQueue,
  removeSyncQueueItem: mockRemoveSyncQueueItem,
  updateSyncQueueItemError: mockUpdateSyncQueueItemError,
}));

// eslint-disable-next-line import/first
import { pullFromSupabase, processSyncQueue, fullSync } from '@/lib/sync/syncManager';

describe('Sync Manager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('pullFromSupabase', () => {
    it('should fetch and save all data types', async () => {
      // Mock Supabase responses
      const mockSources = [{ id: 'source-1', name: 'Test Source' }];
      const mockThemes = [{ id: 'theme-1', name: 'Test Theme' }];
      const mockSourceThemes = [{ source_id: 'source-1', theme_id: 'theme-1' }];
      const mockArticles = [{ id: 'article-1', title: 'Test Article' }];
      const mockFavorites = [{ id: 'fav-1', article_id: 'article-1' }];
      const mockReadArticles = [{ id: 'read-1', article_id: 'article-1' }];

      mockSupabaseFrom.mockImplementation((table: string) => {
        const chainMethods = {
          select: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          limit: jest.fn().mockImplementation(function(this: any) { return this; }),
        };

        switch (table) {
          case 'sources':
            return {
              ...chainMethods,
              order: jest.fn().mockResolvedValue({ data: mockSources, error: null }),
            };
          case 'themes':
            return {
              ...chainMethods,
              order: jest.fn().mockResolvedValue({ data: mockThemes, error: null }),
            };
          case 'source_themes':
            return {
              select: jest.fn().mockResolvedValue({ data: mockSourceThemes, error: null }),
            };
          case 'articles':
            return {
              select: jest.fn().mockReturnValue({
                order: jest.fn().mockReturnValue({
                  limit: jest.fn().mockResolvedValue({ data: mockArticles, error: null }),
                }),
              }),
            };
          case 'favorites':
            return {
              ...chainMethods,
              order: jest.fn().mockResolvedValue({ data: mockFavorites, error: null }),
            };
          case 'read_articles':
            return {
              select: jest.fn().mockResolvedValue({ data: mockReadArticles, error: null }),
            };
          default:
            return { select: jest.fn().mockResolvedValue({ data: [], error: null }) };
        }
      });

      const result = await pullFromSupabase();

      expect(result.success).toBe(true);
      expect(result.sourcesCount).toBe(1);
      expect(result.themesCount).toBe(1);
      expect(result.articlesCount).toBe(1);
      expect(result.favoritesCount).toBe(1);
      expect(result.errors).toHaveLength(0);

      expect(mockSaveSources).toHaveBeenCalledWith(mockSources);
      expect(mockSaveThemes).toHaveBeenCalledWith(mockThemes);
      expect(mockSaveSourceThemes).toHaveBeenCalledWith(mockSourceThemes);
      expect(mockSaveArticles).toHaveBeenCalledWith(mockArticles);
      expect(mockSaveFavorites).toHaveBeenCalledWith(mockFavorites);
    });

    it('should handle errors gracefully', async () => {
      mockSupabaseFrom.mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ data: null, error: { message: 'Network error' } }),
      }));

      const result = await pullFromSupabase();

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Network error');
    });
  });

  describe('processSyncQueue', () => {
    it('should process empty queue', async () => {
      mockGetSyncQueue.mockResolvedValueOnce([]);

      const result = await processSyncQueue();

      expect(result.processed).toBe(0);
      expect(result.failed).toBe(0);
    });

    it('should process INSERT favorite action', async () => {
      const queueItem = {
        id: 1,
        action: 'INSERT',
        table_name: 'favorites',
        record_id: 'article-1',
        payload: JSON.stringify({ article_id: 'article-1' }),
        created_at: '2024-01-01',
        retry_count: 0,
        last_error: null,
      };
      mockGetSyncQueue.mockResolvedValueOnce([queueItem]);

      mockSupabaseFrom.mockImplementation(() => ({
        insert: jest.fn().mockResolvedValue({ error: null }),
      }));

      const result = await processSyncQueue();

      expect(result.processed).toBe(1);
      expect(result.failed).toBe(0);
      expect(mockRemoveSyncQueueItem).toHaveBeenCalledWith(1);
    });

    it('should process DELETE favorite action', async () => {
      const queueItem = {
        id: 2,
        action: 'DELETE',
        table_name: 'favorites',
        record_id: 'article-1',
        payload: JSON.stringify({ article_id: 'article-1' }),
        created_at: '2024-01-01',
        retry_count: 0,
        last_error: null,
      };
      mockGetSyncQueue.mockResolvedValueOnce([queueItem]);

      mockSupabaseFrom.mockImplementation(() => ({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
      }));

      // Mock the final eq to resolve
      const mockEq = jest.fn().mockResolvedValue({ error: null });
      mockSupabaseFrom.mockImplementation(() => ({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: mockEq,
          }),
        }),
      }));

      const result = await processSyncQueue();

      expect(result.processed).toBe(1);
      expect(result.failed).toBe(0);
    });

    it('should skip items that have exceeded max retries', async () => {
      const queueItem = {
        id: 1,
        action: 'INSERT',
        table_name: 'favorites',
        record_id: 'article-1',
        payload: JSON.stringify({ article_id: 'article-1' }),
        created_at: '2024-01-01',
        retry_count: 3, // Max retries reached
        last_error: 'Previous error',
      };
      mockGetSyncQueue.mockResolvedValueOnce([queueItem]);

      const result = await processSyncQueue();

      expect(result.processed).toBe(0);
      expect(result.failed).toBe(1);
      expect(mockSupabaseFrom).not.toHaveBeenCalled();
    });

    it('should update error on failure', async () => {
      const queueItem = {
        id: 1,
        action: 'INSERT',
        table_name: 'favorites',
        record_id: 'article-1',
        payload: JSON.stringify({ article_id: 'article-1' }),
        created_at: '2024-01-01',
        retry_count: 0,
        last_error: null,
      };
      mockGetSyncQueue.mockResolvedValueOnce([queueItem]);

      mockSupabaseFrom.mockImplementation(() => ({
        insert: jest.fn().mockResolvedValue({ error: { message: 'Insert failed' } }),
      }));

      const result = await processSyncQueue();

      expect(result.processed).toBe(0);
      expect(result.failed).toBe(1);
      expect(mockUpdateSyncQueueItemError).toHaveBeenCalledWith(1, expect.any(String));
    });
  });

  describe('fullSync', () => {
    it('should process queue then pull data', async () => {
      mockGetSyncQueue.mockResolvedValueOnce([]);

      // Mock successful pull
      mockSupabaseFrom.mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ data: [], error: null }),
      }));

      const result = await fullSync();

      expect(result).toBeDefined();
      expect(mockGetSyncQueue).toHaveBeenCalled();
    });
  });
});
