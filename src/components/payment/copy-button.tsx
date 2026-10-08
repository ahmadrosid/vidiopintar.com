'use client';

import { useState } from 'react';
import { Copy, CheckCircle } from 'lucide-react';

interface CopyButtonProps {
  text: string;
  fieldId: string;
}

export function CopyButton({ text, fieldId }: CopyButtonProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <button
      type="button"
      onClick={() => copyToClipboard(text, fieldId)}
      className="flex items-center gap-2 px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors"
    >
      {copiedField === fieldId ? (
        <>
          <CheckCircle className="size-4" /> {"Disalin!"}
        </>
      ) : (
        <>
          <Copy className="size-4" /> {"Salin"}
        </>
      )}
    </button>
  );
}