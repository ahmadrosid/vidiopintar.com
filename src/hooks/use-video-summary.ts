import { useEffect, useState, useRef } from 'react';

interface UseVideoSummaryOptions {
  videoId: string;
  initialSummary?: string;
  enabled?: boolean;
}

interface UseVideoSummaryResult {
  summary: string | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useVideoSummary({
  videoId,
  initialSummary,
  enabled = true
}: UseVideoSummaryOptions): UseVideoSummaryResult {
  const [summary, setSummary] = useState<string | null>(initialSummary || null);
  const [isLoading, setIsLoading] = useState(!initialSummary);
  const [error, setError] = useState<string | null>(null);
  const isFetchingRef = useRef(false);

  const fetchSummary = async () => {
    // Prevent duplicate requests
    if (isFetchingRef.current) {
      return;
    }

    isFetchingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/video/${videoId}/generate-summary`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to generate summary');
      }

      const data = await response.json();
      setSummary(data.summary);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load summary';
      setError(errorMessage);
      console.error('Error fetching summary:', err);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  };

  useEffect(() => {
    // If we have initial summary or not enabled, don't fetch
    if (initialSummary || !enabled) {
      return;
    }

    fetchSummary();
  }, [videoId, initialSummary, enabled]);

  return {
    summary,
    isLoading,
    error,
    refetch: fetchSummary,
  };
}
