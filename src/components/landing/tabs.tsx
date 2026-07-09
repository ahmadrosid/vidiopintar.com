"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-7", className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "text-muted-foreground inline-flex h-fit w-full sm:w-fit items-center sm:justify-center rounded-lg p-[3px] overflow-x-auto",
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "data-[state=active]:bg-none dark:data-[state=active]:text-primary hover:cursor-pointer hover:opacity-90 active:scale-[0.975] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-none dark:data-[state=active]:bg-none text-primary dark:text-secondary-foreground/70 inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border-none border-transparent pr-9 py-1 text-3xl font-semibold whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      forceMount
      data-slot="tabs-content"
      className={cn(
        // Keep inactive panels in the HTML for AI agents (override Radix [hidden])
        "flex-1 outline-none",
        "[&[hidden]]:block [&[hidden]]:absolute [&[hidden]]:sr-only",
        "data-[state=inactive]:absolute data-[state=inactive]:sr-only",
        className
      )}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
