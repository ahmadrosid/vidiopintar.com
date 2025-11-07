import { useEffect, useState, useRef } from 'react';

interface UseQuickQuestionsOptions {
  videoId: string;
  initialQuestions?: string[];
  enabled?: boolean;
}

interface UseQuickQuestionsResult {
  questions: string[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useQuickQuestions({
  videoId,
  initialQuestions = [],
  enabled = true
}: UseQuickQuestionsOptions): UseQuickQuestionsResult {
  const [questions, setQuestions] = useState<string[]>(initialQuestions);
  const [isLoading, setIsLoading] = useState(initialQuestions.length === 0);
  const [error, setError] = useState<string | null>(null);
  const isFetchingRef = useRef(false);

  const fetchQuestions = async () => {
    // Prevent duplicate requests
    if (isFetchingRef.current) {
      return;
    }

    isFetchingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/video/${videoId}/generate-questions`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate questions');
      }

      const data = await response.json();
      setQuestions(data.questions);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load questions';
      setError(errorMessage);
      console.error('Error fetching questions:', err);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  };

  useEffect(() => {
    // If we have initial questions or not enabled, don't fetch
    if (initialQuestions.length > 0 || !enabled) {
      return;
    }

    fetchQuestions();
  }, [videoId, initialQuestions.length, enabled]);

  return {
    questions,
    isLoading,
    error,
    refetch: fetchQuestions,
  };
}
