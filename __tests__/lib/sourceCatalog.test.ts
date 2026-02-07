import { sourceCatalog, categories, searchCatalog, getCatalogByCategory } from '@/lib/data/sourceCatalog';

describe('sourceCatalog', () => {
  describe('catalog data', () => {
    it('should have sources', () => {
      expect(sourceCatalog.length).toBeGreaterThan(0);
    });

    it('should have all required fields for each source', () => {
      sourceCatalog.forEach((source) => {
        expect(source.id).toBeDefined();
        expect(source.name).toBeDefined();
        expect(source.url).toBeDefined();
        expect(source.type).toBeDefined();
        expect(source.category).toBeDefined();
        expect(['rss', 'html', 'youtube']).toContain(source.type);
      });
    });

    it('should have unique IDs', () => {
      const ids = sourceCatalog.map((s) => s.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have valid URLs', () => {
      sourceCatalog.forEach((source) => {
        expect(() => new URL(source.url)).not.toThrow();
      });
    });
  });

  describe('categories', () => {
    it('should extract unique categories', () => {
      expect(categories.length).toBeGreaterThan(0);
      const uniqueCategories = new Set(categories);
      expect(uniqueCategories.size).toBe(categories.length);
    });

    it('should include expected categories', () => {
      expect(categories).toContain('Actualités');
      expect(categories).toContain('Tech');
      expect(categories).toContain('YouTube');
    });
  });

  describe('searchCatalog', () => {
    it('should return empty array for empty query', () => {
      expect(searchCatalog('')).toEqual([]);
      expect(searchCatalog('   ')).toEqual([]);
    });

    it('should find sources by name', () => {
      const results = searchCatalog('monde');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((s) => s.name.toLowerCase().includes('monde'))).toBe(true);
    });

    it('should find sources by category', () => {
      const results = searchCatalog('tech');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should be case insensitive', () => {
      const lower = searchCatalog('hugo');
      const upper = searchCatalog('HUGO');
      expect(lower.length).toBe(upper.length);
    });
  });

  describe('getCatalogByCategory', () => {
    it('should return sources for a category', () => {
      const techSources = getCatalogByCategory('Tech');
      expect(techSources.length).toBeGreaterThan(0);
      techSources.forEach((source) => {
        expect(source.category).toBe('Tech');
      });
    });

    it('should return empty array for unknown category', () => {
      const results = getCatalogByCategory('NonExistent');
      expect(results).toEqual([]);
    });
  });
});

describe('YouTube sources', () => {
  it('should have valid YouTube feed URLs', () => {
    const youtubeSources = sourceCatalog.filter((s) => s.type === 'youtube');
    expect(youtubeSources.length).toBeGreaterThan(0);

    youtubeSources.forEach((source) => {
      expect(source.url).toContain('youtube.com/feeds/videos.xml');
      expect(source.url).toContain('channel_id=');
    });
  });
});
