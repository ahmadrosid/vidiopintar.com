import * as React from "react"
import { cn } from "@/lib/utils"
import { CodeBlock, CodeBlockCode } from "./code-block"

function extractLanguage(className?: string): string {
  if (!className) return "plaintext"
  const match = className.match(/language-(\w+)/)
  return match ? match[1] : "plaintext"
}

export function MarkdownCodeComponent({ className, children, ...props }: React.ComponentProps<"code"> & { node?: { position?: { start?: { line?: number }; end?: { line?: number } } } }) {
  const startLine = props.node?.position?.start?.line
  const endLine = props.node?.position?.end?.line
  const isInline = !startLine || startLine === endLine

  if (isInline) {
    return (
      <span
        className={cn(
          "bg-primary-foreground rounded-sm px-1 font-mono text-sm",
          className
        )}
        {...props}
      >
        {children}
      </span>
    )
  }

  const language = extractLanguage(className)

  return (
    <CodeBlock className={className}>
      <CodeBlockCode code={children as string} language={language} />
    </CodeBlock>
  )
}

export function MarkdownPreComponent({ children }: { children?: React.ReactNode }) {
  return <>{children}</>
}
