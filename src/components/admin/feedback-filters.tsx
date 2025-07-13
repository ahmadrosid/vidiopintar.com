"use client"

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, X } from "lucide-react";

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Filters</span>
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2">
              {filteredCount} of {totalCount}
            </Badge>
          )}
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        {/* Quick Rating Filters */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Show:</span>
          <button
            onClick={() => updateFilters({ rating: rating === "bad" ? null : "bad" })}
            className={`px-3 py-1 rounded-full text-sm ${
              rating === "bad" 
                ? "bg-red-100 text-red-800 border border-red-200" 
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            😞 Issues only
          </button>
          <button
            onClick={() => updateFilters({ rating: rating === "love_it" ? null : "love_it" })}
            className={`px-3 py-1 rounded-full text-sm ${
              rating === "love_it" 
                ? "bg-green-100 text-green-800 border border-green-200" 
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            🧡 Positive only
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search comments..."
            value={search}
            onChange={(e) => updateFilters({ search: e.target.value })}
            className="pl-9 text-sm"
          />
        </div>

        {/* Sort */}
        <Select value={sortBy} onValueChange={(value) => updateFilters({ sortBy: value })}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Recent first</SelectItem>
            <SelectItem value="rating_low">Issues first</SelectItem>
            <SelectItem value="type">By type</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Active Filter Pills */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {type && (
            <Badge variant="secondary" className="cursor-pointer" onClick={() => updateFilters({ type: null })}>
              Type: {type.replace('_', ' ')} <X className="h-3 w-3 ml-1" />
            </Badge>
          )}
          {rating && (
            <Badge variant="secondary" className="cursor-pointer" onClick={() => updateFilters({ rating: null })}>
              Rating: {rating.replace('_', ' ')} <X className="h-3 w-3 ml-1" />
            </Badge>
          )}
          {search && (
            <Badge variant="secondary" className="cursor-pointer" onClick={() => updateFilters({ search: "" })}>
              Search: "{search}" <X className="h-3 w-3 ml-1" />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}