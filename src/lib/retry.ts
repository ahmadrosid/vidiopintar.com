export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function retryWithDelay<T>(
  fn: () => Promise<T>,
  {
    maxAttempts = 3,
    delayMs = 2000,
    onRetry,
  }: {
    maxAttempts?: number;
    delayMs?: number;
    onRetry?: (attempt: number, error: unknown) => void;
  } = {},
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        onRetry?.(attempt, error);
        await sleep(delayMs);
      }
    }
  }

  throw lastError;
}
