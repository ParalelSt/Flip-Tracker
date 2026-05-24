'use client';

import { Input } from '@/components/ui/input';
import { SearchIcon } from '@/components/icons';
import { TRICK_CATEGORIES, TRICK_STATUSES, type TrickCategory, type TrickStatus } from '@/types';
import { cn } from '@/lib/utils';

const STATUS_LABELS: Record<TrickStatus | 'all', string> = {
  all: 'All',
  not_started: 'Not started',
  learning: 'Learning',
  clean: 'Clean',
  mastered: 'Mastered',
};

interface Props {
  search: string;
  category: TrickCategory | 'all';
  status: TrickStatus | 'all';
  onSearchChange: (v: string) => void;
  onCategoryChange: (v: TrickCategory | 'all') => void;
  onStatusChange: (v: TrickStatus | 'all') => void;
}

export function TrickFilters({ search, category, status, onSearchChange, onCategoryChange, onStatusChange }: Props) {
  const categories: ('all' | TrickCategory)[] = ['all', ...TRICK_CATEGORIES];
  const statuses: ('all' | TrickStatus)[] = ['all', ...TRICK_STATUSES];

  return (
    <div className="flex flex-col gap-4">
      <div className="relative w-full">
        <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search tricks…"
          className="pl-10 h-10 w-full rounded-full bg-card border-0"
        />
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-3 items-center">
        <FilterChips label="Category" options={categories} value={category} onChange={onCategoryChange} />
        <FilterChips
          label="Status"
          options={statuses}
          value={status}
          onChange={onStatusChange}
          labels={STATUS_LABELS}
        />
      </div>
    </div>
  );
}

interface ChipsProps<T extends string> {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  labels?: Record<string, string>;
}

function FilterChips<T extends string>({ label, options, value, onChange, labels }: ChipsProps<T>) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[11px] uppercase tracking-widest text-muted-foreground mr-1">{label}</span>
      {options.map((opt) => {
        const active = opt === value;
        const display = labels?.[opt] ?? (opt.charAt(0).toUpperCase() + opt.slice(1));
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium transition-colors',
              active
                ? 'bg-blade text-background'
                : 'bg-card text-muted-foreground hover:text-foreground hover:bg-card/80',
            )}
          >
            {display}
          </button>
        );
      })}
    </div>
  );
}
