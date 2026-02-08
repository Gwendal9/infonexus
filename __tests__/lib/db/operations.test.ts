import { Article, Source, Favorite } from '@/types/database';

// Mock expo-sqlite
const mockRunAsync = jest.fn();
const mockGetAllAsync = jest.fn();
const mockGetFirstAsync = jest.fn();
const mockExecAsync = jest.fn();

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn().mockResolvedValue({
    runAsync: mockRunAsync,
    getAllAsync: mockGetAllAsync,
    getFirstAsync: mockGetFirstAsync,
    execAsync: mockExecAsync,
    closeAsync: jest.fn(),
  }),
}));

// Import after mocking
import * as db from '@/lib/db/operations';

describe('Database Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Articles', () => {
    const mockArticle: Article = {
      id: 'article-1',
      source_id: 'source-1',
      url: 'https://example.com/article',
      title: 'Test Article',
      summary: 'Test summary',
      image_url: 'https://example.com/image.jpg',
      author: 'Test Author',
      published_at: '2024-01-01T00:00:00Z',
      fetched_at: '2024-01-01T00:00:00Z',
      created_at: '2024-01-01T00:00:00Z',
    };

    it('should get articles from database', async () => {
      mockGetAllAsync.mockResolvedValueOnce([mockArticle]);

      const articles = await db.getArticles();

      expect(articles).toHaveLength(1);
      expect(articles[0]).toEqual(mockArticle);
      expect(mockGetAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM articles')
      );
    });

    it('should save articles to database', async () => {
      mockRunAsync.mockResolvedValue({ changes: 1 });

      await db.saveArticles([mockArticle]);

      expect(mockRunAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT OR REPLACE INTO articles'),
        mockArticle.id,
        mockArticle.source_id,
        mockArticle.url,
        mockArticle.title,
        mockArticle.summary,
        mockArticle.image_url,
        mockArticle.author,
        mockArticle.published_at,
        mockArticle.fetched_at,
        mockArticle.created_at,
        expect.any(String)
      );
    });

    it('should get article by ID', async () => {
      mockGetFirstAsync.mockResolvedValueOnce(mockArticle);

      const article = await db.getArticleById('article-1');

      expect(article).toEqual(mockArticle);
      expect(mockGetFirstAsync).toHaveBeenCalledWith(
        'SELECT * FROM articles WHERE id = ?',
        'article-1'
      );
    });

    it('should return null for non-existent article', async () => {
      mockGetFirstAsync.mockResolvedValueOnce(null);

      const article = await db.getArticleById('non-existent');

      expect(article).toBeNull();
    });
  });

  describe('Sources', () => {
    const mockSource: Source = {
      id: 'source-1',
      user_id: 'user-1',
      url: 'https://example.com/rss',
      name: 'Test Source',
      type: 'rss',
      status: 'active',
      logo_url: 'https://example.com/logo.png',
      last_fetched_at: '2024-01-01T00:00:00Z',
      last_error: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    it('should get sources from database', async () => {
      mockGetAllAsync.mockResolvedValueOnce([mockSource]);

      const sources = await db.getSources();

      expect(sources).toHaveLength(1);
      expect(sources[0]).toEqual(mockSource);
    });

    it('should save sources to database', async () => {
      mockRunAsync.mockResolvedValue({ changes: 1 });

      await db.saveSources([mockSource]);

      expect(mockRunAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT OR REPLACE INTO sources'),
        mockSource.id,
        mockSource.user_id,
        mockSource.url,
        mockSource.name,
        mockSource.type,
        mockSource.status,
        mockSource.logo_url,
        mockSource.last_fetched_at,
        mockSource.last_error,
        mockSource.created_at,
        mockSource.updated_at,
        expect.any(String) // synced_at
      );
    });
  });

  describe('Favorites', () => {
    const mockFavorite: Favorite = {
      id: 'fav-1',
      user_id: 'user-1',
      article_id: 'article-1',
      created_at: '2024-01-01T00:00:00Z',
    };

    it('should get favorite article IDs', async () => {
      mockGetAllAsync.mockResolvedValueOnce([{ article_id: 'article-1' }, { article_id: 'article-2' }]);

      const favoriteIds = await db.getFavoriteArticleIds();

      expect(favoriteIds.size).toBe(2);
      expect(favoriteIds.has('article-1')).toBe(true);
      expect(favoriteIds.has('article-2')).toBe(true);
    });

    it('should add a favorite', async () => {
      mockRunAsync.mockResolvedValue({ changes: 1 });

      const id = await db.addFavorite('user-1', 'article-1');

      expect(id).toBeDefined();
      expect(mockRunAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT OR REPLACE INTO favorites'),
        expect.any(String),
        'user-1',
        'article-1',
        expect.any(String),
        expect.any(String)
      );
    });

    it('should remove a favorite', async () => {
      mockRunAsync.mockResolvedValue({ changes: 1 });

      await db.removeFavorite('user-1', 'article-1');

      expect(mockRunAsync).toHaveBeenCalledWith(
        'DELETE FROM favorites WHERE user_id = ? AND article_id = ?',
        'user-1',
        'article-1'
      );
    });
  });

  describe('Sync Queue', () => {
    it('should add item to sync queue', async () => {
      mockRunAsync.mockResolvedValue({ changes: 1 });

      await db.addToSyncQueue('INSERT', 'favorites', 'article-1', { article_id: 'article-1' });

      expect(mockRunAsync).toHaveBeenCalledWith(
        'INSERT INTO sync_queue (action, table_name, record_id, payload) VALUES (?, ?, ?, ?)',
        'INSERT',
        'favorites',
        'article-1',
        JSON.stringify({ article_id: 'article-1' })
      );
    });

    it('should get sync queue items', async () => {
      const mockItems = [
        { id: 1, action: 'INSERT', table_name: 'favorites', record_id: 'article-1', payload: '{}', created_at: '2024-01-01', retry_count: 0, last_error: null },
      ];
      mockGetAllAsync.mockResolvedValueOnce(mockItems);

      const queue = await db.getSyncQueue();

      expect(queue).toHaveLength(1);
      expect(queue[0].action).toBe('INSERT');
    });

    it('should remove sync queue item', async () => {
      mockRunAsync.mockResolvedValue({ changes: 1 });

      await db.removeSyncQueueItem(1);

      expect(mockRunAsync).toHaveBeenCalledWith(
        'DELETE FROM sync_queue WHERE id = ?',
        1
      );
    });
  });
});
