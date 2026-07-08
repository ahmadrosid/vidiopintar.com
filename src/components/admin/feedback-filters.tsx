"use client"

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeedbackFiltersProps {
  onFilterChange: (filters: {
    type: string | null;
    rating: string | null;
    search: string;
    sortBy: string;
  }) => void;
  totalCount: number;
  filteredCount: number;
}

export function FeedbackFilters({ onFilterChange, totalCount, filteredCount }: FeedbackFiltersProps) {
  const [type, setType] = useState<string | null>(null);
  const [rating, setRating] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const updateFilters = (newFilters: Partial<{
    type: string | null;
    rating: string | null;
    search: string;
    sortBy: string;
  }>) => {
    const updatedFilters = {
      type: newFilters.type !== undefined ? newFilters.type : type,
      rating: newFilters.rating !== undefined ? newFilters.rating : rating,
      search: newFilters.search !== undefined ? newFilters.search : search,
      sortBy: newFilters.sortBy !== undefined ? newFilters.sortBy : sortBy,
    };

    setType(updatedFilters.type);
    setRating(updatedFilters.rating);
    setSearch(updatedFilters.search);
    setSortBy(updatedFilters.sortBy);

    onFilterChange(updatedFilters);
  };

  const clearFilters = () => {
    updateFilters({
      type: null,
      rating: null,
      search: "",
      sortBy: "newest"
    });
  };

  const hasActiveFilters = type || rating || search;

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={rating === "bad" ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilters({ rating: rating === "bad" ? null : "bad" })}
            className={cn(
              "h-8 rounded-full px-3 text-xs",
              rating === "bad"
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : "dark:border-input dark:bg-input/30 dark:hover:bg-input/50"
            )}
          >
            😞 Issues only
          </Button>
          <Button
            type="button"
            variant={rating === "love_it" ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilters({ rating: rating === "love_it" ? null : "love_it" })}
            className={cn(
              "h-8 rounded-full px-3 text-xs",
              rating !== "love_it" && "dark:border-input dark:bg-input/30 dark:hover:bg-input/50"
            )}
          >
            🧡 Positive only
          </Button>
        </div>

        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search comments..."
            value={search}
            onChange={(e) => updateFilters({ search: e.target.value })}
            className="h-9 rounded-xs border-border bg-background pl-9 text-sm text-foreground shadow-xs placeholder:text-muted-foreground dark:bg-input/30"
          />
        </div>

        <Select value={sortBy} onValueChange={(value) => updateFilters({ sortBy: value })}>
          <SelectTrigger className="h-9 w-full rounded-xs lg:w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Recent first</SelectItem>
            <SelectItem value="rating_low">Issues first</SelectItem>
            <SelectItem value="type">By type</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {filteredCount} of {totalCount} shown
          </span>
          {type && (
            <Badge
              variant="secondary"
              className="cursor-pointer gap-1 rounded-xs"
              onClick={() => updateFilters({ type: null })}
            >
              Type: {type.replace('_', ' ')}
              <X className="h-3 w-3" />
            </Badge>
          )}
          {rating && (
            <Badge
              variant="secondary"
              className="cursor-pointer gap-1 rounded-xs"
              onClick={() => updateFilters({ rating: null })}
            >
              Rating: {rating.replace('_', ' ')}
              <X className="h-3 w-3" />
            </Badge>
          )}
          {search && (
            <Badge
              variant="secondary"
              className="cursor-pointer gap-1 rounded-xs"
              onClick={() => updateFilters({ search: "" })}
            >
              Search: &quot;{search}&quot;
              <X className="h-3 w-3" />
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 rounded-xs px-2 text-xs">
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
