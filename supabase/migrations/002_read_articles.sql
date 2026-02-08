-- ============================================
-- READ ARTICLES TABLE
-- Tracks which articles have been read by users
-- ============================================
CREATE TABLE read_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, article_id)
);

-- RLS for read_articles
ALTER TABLE read_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own read articles"
  ON read_articles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can mark articles as read"
  ON read_articles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unmark articles as read"
  ON read_articles FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_read_articles_user_id ON read_articles(user_id);
CREATE INDEX idx_read_articles_article_id ON read_articles(article_id);

-- ============================================
-- SOURCE FETCH LOGS TABLE
-- Tracks fetch history for source health monitoring
-- ============================================
CREATE TABLE source_fetch_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  success BOOLEAN NOT NULL DEFAULT false,
  articles_count INTEGER NOT NULL DEFAULT 0,
  error TEXT,
  fetched_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for source_fetch_logs (inherit from source ownership)
ALTER TABLE source_fetch_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view logs for their sources"
  ON source_fetch_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sources
      WHERE sources.id = source_fetch_logs.source_id
      AND sources.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create logs for their sources"
  ON source_fetch_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sources
      WHERE sources.id = source_fetch_logs.source_id
      AND sources.user_id = auth.uid()
    )
  );

-- Index
CREATE INDEX idx_source_fetch_logs_source_id ON source_fetch_logs(source_id);
CREATE INDEX idx_source_fetch_logs_fetched_at ON source_fetch_logs(fetched_at DESC);
