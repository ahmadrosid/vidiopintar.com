'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';

interface TransactionsTableFiltersProps {
  filters: {
    status: string;
    planType: string;
    search: string;
  };
  showFilters: boolean;
  hasActiveFilters: boolean;
  uniqueStatuses: string[];
  uniquePlanTypes: string[];
  filteredCount: number;
  totalCount: number;
  onToggleFilters: () => void;
  onResetFilters: () => void;
  onFiltersChange: (filters: { status: string; planType: string; search: string }) => void;
}

export function TransactionsTableFilters({
  filters,
  showFilters,
  hasActiveFilters,
  uniqueStatuses,
  uniquePlanTypes,
  filteredCount,
  totalCount,
  onToggleFilters,
  onResetFilters,
  onFiltersChange,
}: TransactionsTableFiltersProps) {
  return (
    <>
      <div className="border-b px-4 py-3 bg-card/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleFilters}
              className="h-9 px-4 text-sm font-medium rounded-xs hover:bg-accent/90 transition-colors duration-200"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {showFilters ? (
                <ChevronUp className="h-4 w-4 ml-2" />
              ) : (
                <ChevronDown className="h-4 w-4 ml-2" />
              )}
            </Button>

            {hasActiveFilters && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs font-medium">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span className="text-primary">Filters active</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onResetFilters}
                  className="h-7 px-3 text-xs rounded-xs hover:bg-accent/90 transition-colors duration-200"
                >
                  <RotateCcw className="h-3 w-3 mr-1.5" />
                  Reset
                </Button>
              </div>
            )}
          </div>

          <div className="text-sm text-muted-foreground font-medium">
            {filteredCount !== totalCount ? (
              <>Showing {filteredCount} of {totalCount} transactions</>
            ) : (
              <>{totalCount} transactions</>
            )}
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="border-b bg-card/50 hover:bg-card/85 transition-colors duration-200 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search by reference, name, or email..."
              value={filters.search}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              className="h-10 flex-1 rounded-xs dark:text-black !bg-white"
            />

            <Select
              value={filters.status}
              onValueChange={(value) => onFiltersChange({ ...filters, status: value })}
            >
              <SelectTrigger className="h-10 w-full sm:w-48 rounded-xs">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                {uniqueStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status === 'all' ? 'All statuses' : status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.planType}
              onValueChange={(value) => onFiltersChange({ ...filters, planType: value })}
            >
              <SelectTrigger className="h-10 w-full sm:w-48 rounded-xs">
                <SelectValue placeholder="All plans" />
              </SelectTrigger>
              <SelectContent>
                {uniquePlanTypes.map((planType) => (
                  <SelectItem key={planType} value={planType}>
                    {planType === 'all' ? 'All plans' : planType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </>
  );
}
