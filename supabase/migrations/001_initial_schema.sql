-- InfoNexus Initial Schema
-- Tables: sources, themes, articles, favorites, source_themes (junction)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- THEMES TABLE
-- ============================================
CREATE TABLE themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#FF6B35',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- RLS for themes
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own themes"
  ON themes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own themes"
  ON themes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own themes"
  ON themes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own themes"
  ON themes FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- SOURCES TABLE
-- ============================================
CREATE TYPE source_type AS ENUM ('rss', 'html', 'youtube');
CREATE TYPE source_status AS ENUM ('active', 'error', 'pending');

CREATE TABLE sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  name TEXT NOT NULL,
  type source_type NOT NULL DEFAULT 'rss',
  status source_status NOT NULL DEFAULT 'pending',
  logo_url TEXT,
  last_fetched_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, url)
);

-- RLS for sources
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sources"
  ON sources FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sources"
  ON sources FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sources"
  ON sources FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sources"
  ON sources FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- SOURCE_THEMES JUNCTION TABLE
-- ============================================
CREATE TABLE source_themes (
  source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  theme_id UUID NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
  PRIMARY KEY (source_id, theme_id)
);

-- RLS for source_themes
ALTER TABLE source_themes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own source_themes"
  ON source_themes FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM sources WHERE sources.id = source_id AND sources.user_id = auth.uid())
  );

CREATE POLICY "Users can create their own source_themes"
  ON source_themes FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM sources WHERE sources.id = source_id AND sources.user_id = auth.uid())
  );

CREATE POLICY "Users can delete their own source_themes"
  ON source_themes FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM sources WHERE sources.id = source_id AND sources.user_id = auth.uid())
  );

-- ============================================
-- ARTICLES TABLE
-- ============================================
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  image_url TEXT,
  author TEXT,
  published_at TIMESTAMPTZ,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(source_id, url)
);

-- RLS for articles (through source ownership)
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view articles from their sources"
  ON articles FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM sources WHERE sources.id = source_id AND sources.user_id = auth.uid())
  );

CREATE POLICY "Users can delete articles from their sources"
  ON articles FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM sources WHERE sources.id = source_id AND sources.user_id = auth.uid())
  );

-- ============================================
-- FAVORITES TABLE
-- ============================================
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, article_id)
);

-- RLS for favorites
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own favorites"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_sources_user_id ON sources(user_id);
CREATE INDEX idx_themes_user_id ON themes(user_id);
CREATE INDEX idx_articles_source_id ON articles(source_id);
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_article_id ON favorites(article_id);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sources_updated_at
  BEFORE UPDATE ON sources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER themes_updated_at
  BEFORE UPDATE ON themes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
