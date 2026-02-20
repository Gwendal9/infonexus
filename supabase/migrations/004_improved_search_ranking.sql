-- ============================================
-- IMPROVED FULL TEXT SEARCH WITH BETTER RANKING
-- ============================================

-- Drop the old function
DROP FUNCTION IF EXISTS search_articles(TEXT, UUID[], INT);

-- Create an improved search function with better ranking
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
DECLARE
  query_tsquery tsquery;
BEGIN
  -- Convert search query to tsquery (supports multiple words, phrases, etc.)
  query_tsquery := websearch_to_tsquery('french', search_query);

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
    -- Improved ranking algorithm:
    -- 1. ts_rank_cd uses cover density ranking (better for phrases)
    -- 2. Weight title matches 4x more than summary matches
    -- 3. Boost recent articles (published in last 30 days get +0.5 bonus)
    -- 4. Normalization flags: 1 (divides by document length)
    (
      ts_rank_cd(a.fts, query_tsquery, 1) * 10 +
      CASE
        WHEN a.published_at > NOW() - INTERVAL '7 days' THEN 1.5
        WHEN a.published_at > NOW() - INTERVAL '30 days' THEN 0.5
        ELSE 0
      END
    )::REAL AS rank
  FROM articles a
  WHERE
    a.fts @@ query_tsquery
    AND (user_sources IS NULL OR a.source_id = ANY(user_sources))
  ORDER BY rank DESC, a.published_at DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;

-- Add comment to explain the function
COMMENT ON FUNCTION search_articles IS 'Full-text search with cover density ranking, recency boost, and French language support';

-- Create a simple keyword search function for exact matches
CREATE OR REPLACE FUNCTION search_articles_simple(
  search_term TEXT,
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
    -- Simple ranking: title matches score higher than summary matches
    (
      CASE WHEN LOWER(a.title) ILIKE '%' || LOWER(search_term) || '%' THEN 10 ELSE 0 END +
      CASE WHEN LOWER(a.summary) ILIKE '%' || LOWER(search_term) || '%' THEN 5 ELSE 0 END +
      CASE WHEN a.published_at > NOW() - INTERVAL '7 days' THEN 2 ELSE 0 END
    )::REAL AS rank
  FROM articles a
  WHERE
    (LOWER(a.title) ILIKE '%' || LOWER(search_term) || '%' OR
     LOWER(a.summary) ILIKE '%' || LOWER(search_term) || '%')
    AND (user_sources IS NULL OR a.source_id = ANY(user_sources))
  ORDER BY rank DESC, a.published_at DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION search_articles_simple IS 'Simple ILIKE-based search for exact substring matching (fallback when FTS fails)';
