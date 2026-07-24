import { useCallback, useState } from 'react';

interface UseQuickQuestionsOptions {
  initialQuestions: string[];
}

interface UseQuickQuestionsResult {
  questions: string[];
  isLoading: boolean;
  error: string | null;
  refetch: (videoId: string) => Promise<void>;
}

export function useQuickQuestions({
  initialQuestions,
}: UseQuickQuestionsOptions): UseQuickQuestionsResult {
  const [questions, setQuestions] = useState<string[]>(initialQuestions);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async (videoId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/video/${videoId}/generate-questions`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
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
    }
  }, []);

  return {
    questions,
    isLoading,
    error,
    refetch,
  };
}
