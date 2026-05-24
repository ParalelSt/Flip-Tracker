'use client';

import { useMemo, useState } from 'react';
import { useQueryTricks } from '@/hooks/useTricks';
import { Input } from '@/components/ui/input';
import { SearchIcon, CheckIcon } from '@/components/icons';
import { Skeleton } from '@/components/ui/skeleton';
import { DifficultyDots } from './DifficultyDots';
import { cn } from '@/lib/utils';

interface Props {
  selected: string[];
  onChange: (ids: string[]) => void;
  /** When true, picking the same trick again is a no-op (used by sessions).
   *  When false (combos), picking re-adds to the end so combos can repeat. */
  unique?: boolean;
}

/** Searchable, multi-select trick chooser. Keeps the selection visible at the
 *  top so users can reorder/remove without scrolling. */
export function TrickPicker({ selected, onChange, unique = true }: Props) {
  const { data: tricks = [], isLoading } = useQueryTricks();
  const [search, setSearch] = useState('');

  const byId = useMemo(() => new Map(tricks.map((t) => [t.id, t])), [tricks]);
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tricks.filter((t) => !q || t.name.toLowerCase().includes(q));
  }, [tricks, search]);

  const toggle = (id: string) => {
    if (unique) {
      if (selectedSet.has(id)) onChange(selected.filter((s) => s !== id));
      else onChange([...selected, id]);
    } else {
      onChange([...selected, id]);
    }
  };

  const removeAt = (index: number) => onChange(selected.filter((_, i) => i !== index));

  return (
    <div className="space-y-4">
      {selected.length > 0 && (
        <div className="rounded-xl bg-background ring-1 ring-border/40 p-3">
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2">
            Selected · {selected.length}
          </div>
          <div className="flex flex-wrap gap-2">
            {selected.map((id, i) => {
              const t = byId.get(id);
              if (!t) return null;
              return (
                <button
                  key={`${id}-${i}`}
                  type="button"
                  onClick={() => removeAt(i)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-blade/15 text-blade px-3 py-1 text-xs font-medium hover:bg-blade/25 transition-colors"
                  title="Remove"
                >
                  {t.name} ×
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="relative">
        <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Find a trick…"
          className="pl-10 h-10 rounded-full bg-card border-0"
        />
      </div>

      {/* Cap at exactly 5 rows visible — fixed row height + matching container
          max-h means the 5th row's bottom edge lands flush against the scroll
          boundary, no half-row peeking. */}
      <div className="max-h-91.25 overflow-y-auto rounded-xl ring-1 ring-border/40 bg-card divide-y divide-border/40">
        {isLoading ? (
          <div className="p-3 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 rounded-md" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">No tricks found.</div>
        ) : (
          filtered.map((t) => {
            const isSelected = unique && selectedSet.has(t.id);
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => toggle(t.id)}
                className={cn(
                  // Fixed row height keeps 5 visible rows clean against the
                  // container's max-h-86 cap — no half-row peek at the edge.
                  'w-full h-17 px-4 flex items-center gap-3 text-left transition-colors',
                  isSelected ? 'bg-blade/10' : 'hover:bg-card/60',
                )}
              >
                <span className={cn(
                  'h-5 w-5 rounded-md grid place-items-center shrink-0',
                  isSelected ? 'bg-blade text-background' : 'bg-background ring-1 ring-border',
                )}>
                  {isSelected && <CheckIcon className="h-3.5 w-3.5" />}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{t.name}</div>
                  <div className="text-[11px] text-muted-foreground capitalize">{t.category}</div>
                </div>
                <DifficultyDots value={t.difficulty} />
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
