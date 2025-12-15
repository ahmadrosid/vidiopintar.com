import { useEffect, useState, useRef, useCallback } from 'react';

interface UseVideoSummaryOptions {
  videoId: string;
  initialSummary?: string;
  enabled?: boolean;
}

interface UseVideoSummaryResult {
  summary: string | null;
  isLoading: boolean;
  error: string | null;
  regenerate: () => Promise<void>;
}

export function useVideoSummary({
  videoId,
  initialSummary,
  enabled = true
}: UseVideoSummaryOptions): UseVideoSummaryResult {
  const [summary, setSummary] = useState<string | null>(initialSummary || null);
  const [isLoading, setIsLoading] = useState(!initialSummary);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchSummary = useCallback(async (force = false) => {
    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setIsLoading(true);
    setError(null);

    try {
      const url = `/api/video/${videoId}/summary${force ? '?force=true' : ''}`;
      const response = await fetch(url, {
        method: 'POST',
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error('Failed to generate summary');
      }

      const data = await response.json();
      setSummary(data.summary);
    } catch (err) {
      // Ignore abort errors
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      const errorMessage = err instanceof Error ? err.message : 'Failed to load summary';
      setError(errorMessage);
      console.error('Error fetching summary:', err);
    } finally {
      if (!abortController.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [videoId]);

  const regenerate = useCallback(() => fetchSummary(true), [fetchSummary]);

  useEffect(() => {
    // If we have initial summary or not enabled, don't fetch
    if (initialSummary || !enabled) {
      return;
    }

    fetchSummary(false);

    // Cleanup: abort request on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [videoId, initialSummary, enabled, fetchSummary]);

  return {
    summary,
    isLoading,
    error,
    regenerate,
  };
}
