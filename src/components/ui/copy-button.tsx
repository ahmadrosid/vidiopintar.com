"use client"

import { HugeiconsIcon } from "@hugeicons/react";
import { CheckIcon, Copy01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { Button } from "@/components/ui/button"

type CopyButtonProps = {
  content: string
  copyMessage?: string
  label?: string
  className?: string
}

export function CopyButton({ content, copyMessage, label, className }: CopyButtonProps) {
  const { isCopied, handleCopy } = useCopyToClipboard({
    text: content,
    copyMessage,
  })

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative h-fit w-fit cursor-pointer items-center p-1"
      aria-label={label || "Copy to clipboard"}
      onClick={handleCopy}
    >
      <div className="absolute inset-0 flex items-center justify-start p-1">
        <HugeiconsIcon icon={CheckIcon}
          className={cn(
            "size-3 transition-transform ease-in-out", className,
            isCopied ? "scale-100" : "scale-0"
          )}
        />
      </div>
      <HugeiconsIcon icon={Copy01Icon}
        className={cn(
          "size-3 transition-transform ease-in-out", className,
          isCopied ? "scale-0" : "scale-100"
        )}
      />
      {label && <span className={cn("text-xs", className)}>{label}</span>}
    </Button>
  )
}
