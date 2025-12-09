"use client";

import { Button } from '@/components/ui/button';
import { Markdown} from '@/components/ui/markdown';
import { CopyButton } from "@/components/ui/copy-button";
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw } from 'lucide-react';
import { useVideoSummary } from '@/hooks/use-video-summary';

interface SummarySectionProps {
  videoId: string;
  initialSummary: string;
}

export function SummarySection({ videoId, initialSummary }: SummarySectionProps) {
  const { summary, isLoading, error, regenerate } = useVideoSummary({
    videoId,
    initialSummary,
  });

  const showRegenerateButton = !summary || summary.trim() === '' || summary.includes('Unable to generate summary') || error;

  // Show skeleton loader during any loading state
  if (isLoading) {
    return (
      <div className="space-y-3 py-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    );
  }

  return (
    <div>
      {showRegenerateButton ? (
        <div className="text-left py-2">
          <p className="text-muted-foreground mb-4">
            {error || (!summary ? 'Summary not available' : 'Summary generation failed')}
          </p>
          <Button
            onClick={regenerate}
            variant="outline"
            className="gap-2 cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            {error ? 'Retry' : 'Generate'}
          </Button>
        </div>
      ) : (
        <div className="relative group prose dark:prose-invert prose-sm px-2 max-w-none">
          <Markdown>{summary}</Markdown>
          <div className="absolute top-0 right-2 group-hover:visible invisible">
            <CopyButton content={summary} copyMessage="Summary copied to clipboard!" label="Copy" />
          </div>
        </div>
      )}
    </div>
  );
}
