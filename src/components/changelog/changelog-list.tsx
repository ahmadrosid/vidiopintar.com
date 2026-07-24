"use client";

import { ChangelogEntry } from "@/lib/data/changelogs";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ChangelogListProps {
  changelogs: ChangelogEntry[];
}

const categoryColors = {
  added: "bg-green-500/10 text-green-600 dark:text-green-400",
  changed: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  fixed: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  removed: "bg-red-500/10 text-red-600 dark:text-red-400"
};

const versionBadgeColors = {
  major: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  minor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  patch: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20"
};

export function ChangelogList({ changelogs }: ChangelogListProps) {
  return (
    <div className="relative max-w-xl">
      {changelogs.map((changelog) => (
        <div key={changelog.version} className="flex gap-x-6">
          {/* Line and dot */}
          <div className="relative flex-none">
            <div className="h-full w-0.5 bg-muted">
              <div className="absolute -left-[5px] top-4 h-3 w-3 rounded-full border-2 border-background bg-foreground" />
            </div>
          </div>

          {/* Content */}
          <div className="grow pb-12">
            <div className="flex items-center gap-3 mb-4 mt-2">
              <h3 className="text-xl font-semibold tracking-tight">
                v{changelog.version}
              </h3>
              <Badge 
                variant="outline"
                className={cn("capitalize text-xs", versionBadgeColors[changelog.type])}
              >
                {changelog.type} release
              </Badge>
              <time className="text-sm text-muted-foreground">
                {format(new Date(changelog.date), "MMMM d, yyyy")}
              </time>
            </div>

            <div className="space-y-4">
              {changelog.changes.map((changeGroup) => (
                <div key={changeGroup.category}>
                  <Badge 
                    variant="secondary"
                    className={cn("capitalize mb-2", categoryColors[changeGroup.category])}
                  >
                    {changeGroup.category}
                  </Badge>
                  <ul className="space-y-1 ml-4">
                    {changeGroup.items.map((item) => (
                      <li 
                        key={item}
                        className="text-sm text-muted-foreground list-disc list-inside"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}