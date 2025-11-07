import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded bg-gray-200 dark:bg-gray-700",
        "before:absolute before:inset-0",
        "before:-translate-x-full",
        "before:animate-[shimmer_1.5s_infinite]",
        "before:bg-gradient-to-r",
        "before:from-transparent before:via-white/20 dark:before:via-white/10 before:to-transparent",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
