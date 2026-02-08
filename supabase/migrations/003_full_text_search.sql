-- ============================================
-- FULL TEXT SEARCH FOR ARTICLES
-- ============================================

-- Add a generated column for full-text search
ALTER TABLE articles
ADD COLUMN IF NOT EXISTS fts tsvector
GENERATED ALWAYS AS (
  setweight(to_tsvector('french', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('french', coalesce(summary, '')), 'B')
) STORED;

-- Create GIN index for fast full-text search
CREATE INDEX IF NOT EXISTS idx_articles_fts ON articles USING GIN (fts);

-- Create a function to search articles
CREATE OR REPLACE FUNCTION search_articles(
  search_query TEXT,
  user_sources UUID[] DEFAULT NULL,
  result_limit INT DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  source_id UUID,
  url TEXT,
  title TEXT,
  summary TEXT,
  image_url TEXT,
  author TEXT,
  published_at TIMESTAMPTZ,
  fetched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.source_id,
    a.url,
    a.title,
    a.summary,
    a.image_url,
    a.author,
    a.published_at,
    a.fetched_at,
    a.created_at,
    ts_rank(a.fts, websearch_to_tsquery('french', search_query)) AS rank
  FROM articles a
  WHERE
    a.fts @@ websearch_to_tsquery('french', search_query)
    AND (user_sources IS NULL OR a.source_id = ANY(user_sources))
  ORDER BY rank DESC, a.published_at DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;
