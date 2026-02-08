import { useQuery } from '@tanstack/react-query';
import { getSourceHealthStats, getSourceFetchLogs, SourceFetchLogRow } from '@/lib/db';

export interface SourceHealthStats {
  successRate: number;
  lastSuccess: string | null;
  lastError: string | null;
  totalFetches: number;
}

export function useSourceHealth(sourceId: string) {
  return useQuery({
    queryKey: ['source-health', sourceId],
    queryFn: async (): Promise<SourceHealthStats> => {
      return getSourceHealthStats(sourceId);
    },
    enabled: !!sourceId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export interface SourceFetchLog {
  id: string;
  sourceId: string;
  success: boolean;
  articlesCount: number;
  error: string | null;
  fetchedAt: string;
}

export function useSourceFetchLogs(sourceId: string) {
  return useQuery({
    queryKey: ['source-fetch-logs', sourceId],
    queryFn: async (): Promise<SourceFetchLog[]> => {
      const logs = await getSourceFetchLogs(sourceId);
      return logs.map((log: SourceFetchLogRow) => ({
        id: log.id,
        sourceId: log.source_id,
        success: log.success === 1,
        articlesCount: log.articles_count,
        error: log.error,
        fetchedAt: log.fetched_at,
      }));
    },
    enabled: !!sourceId,
    staleTime: 1000 * 60 * 5,
  });
}
