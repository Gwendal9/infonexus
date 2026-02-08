import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/utils/supabase';
import { parseRSSFeed } from '@/lib/services/rssParser';
import { scrapeHTMLPage } from '@/lib/services/htmlScraper';
import { addSourceFetchLog } from '@/lib/db';
import { Source } from '@/types/database';

interface RefreshResult {
  sourceId: string;
  sourceName: string;
  success: boolean;
  articlesCount: number;
  error?: string;
}

export function useRefreshSources() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<RefreshResult[]> => {
      // Get all sources for current user
      const { data: sources, error: sourcesError } = await supabase
        .from('sources')
        .select('*')
        .order('created_at', { ascending: false });

      if (sourcesError) throw sourcesError;
      if (!sources || sources.length === 0) return [];

      const results: RefreshResult[] = [];

      for (const source of sources as Source[]) {
        try {
          let articles;

          // Handle different source types
          switch (source.type) {
            case 'rss':
            case 'youtube':
              // Both RSS and YouTube use RSS feeds
              articles = await parseRSSFeed(source.url);
              break;
            case 'html':
              articles = await scrapeHTMLPage(source.url);
              break;
            default:
              results.push({
                sourceId: source.id,
                sourceName: source.name,
                success: false,
                articlesCount: 0,
                error: 'Type non supporté',
              });
              continue;
          }

          // Insert or update articles
          let insertedCount = 0;
          for (const article of articles) {
            const { error: insertError } = await supabase.from('articles').upsert(
              {
                source_id: source.id,
                url: article.url,
                title: article.title,
                summary: article.summary,
                image_url: article.image_url,
                author: article.author,
                published_at: article.published_at,
                fetched_at: new Date().toISOString(),
              },
              {
                onConflict: 'source_id,url',
              }
            );

            if (!insertError) insertedCount++;
          }

          // Update source status
          await supabase
            .from('sources')
            .update({
              status: 'active',
              last_fetched_at: new Date().toISOString(),
              last_error: null,
            })
            .eq('id', source.id);

          // Log successful fetch
          await addSourceFetchLog(source.id, true, insertedCount, null);

          results.push({
            sourceId: source.id,
            sourceName: source.name,
            success: true,
            articlesCount: insertedCount,
          });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';

          // Update source with error
          await supabase
            .from('sources')
            .update({
              status: 'error',
              last_error: errorMessage,
            })
            .eq('id', source.id);

          // Log failed fetch
          await addSourceFetchLog(source.id, false, 0, errorMessage);

          results.push({
            sourceId: source.id,
            sourceName: source.name,
            success: false,
            articlesCount: 0,
            error: errorMessage,
          });
        }
      }

      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['sources'] });
    },
  });
}
