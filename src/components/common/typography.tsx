import { cn } from "@/lib/utils"

interface TypographyProps {
  html: string
}

export default function Typography({ html }: TypographyProps) {
  return (
    <div
      className={cn(
        "prose prose-gray dark:prose-invert",
        "prose-h2:text-2xl prose-h2:font-semibold",
        "prose-h4:text-lg prose-h4:font-medium",
        "prose-p:text-muted-foreground",
        "prose-li:text-muted-foreground",
        "w-full max-w-none"
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
