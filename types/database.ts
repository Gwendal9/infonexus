// Database types for InfoNexus
// These match the Supabase schema

export type SourceType = 'rss' | 'html' | 'youtube';
export type SourceStatus = 'active' | 'error' | 'pending';

export interface Theme {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface Source {
  id: string;
  user_id: string;
  url: string;
  name: string;
  type: SourceType;
  status: SourceStatus;
  logo_url: string | null;
  last_fetched_at: string | null;
  last_error: string | null;
  created_at: string;
  updated_at: string;
}

export interface SourceTheme {
  source_id: string;
  theme_id: string;
}

export interface Article {
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

export interface Favorite {
  id: string;
  user_id: string;
  article_id: string;
  created_at: string;
}

// Extended types with relations
export interface SourceWithThemes extends Source {
  themes?: Theme[];
}

export interface ArticleWithSource extends Article {
  source?: Source;
}

export interface ArticleWithFavorite extends ArticleWithSource {
  is_favorite?: boolean;
}

// Insert types (without auto-generated fields)
export interface InsertSource {
  url: string;
  name: string;
  type?: SourceType;
  logo_url?: string;
}

export interface InsertTheme {
  name: string;
  color?: string;
}
