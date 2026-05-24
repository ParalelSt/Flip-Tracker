'use client';

import { useMemo, useState } from 'react';
import { useQueryTricks } from '@/hooks/useTricks';
import { useAuth } from '@/components/providers/AuthProvider';
import { TrickCard } from '@/components/trick/TrickCard';
import { TrickFilters } from '@/components/trick/TrickFilters';
import { AddCustomTrickDialog } from '@/components/trick/AddCustomTrickDialog';
import { Skeleton } from '@/components/ui/skeleton';
import type { TrickCategory, TrickStatus } from '@/types';

export default function TricksPage() {
  const { user } = useAuth();
  const { data: tricks = [], isLoading } = useQueryTricks();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<TrickCategory | 'all'>('all');
  const [status, setStatus] = useState<TrickStatus | 'all'>('all');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tricks.filter((t) => {
      if (category !== 'all' && t.category !== category) return false;
      if (status !== 'all' && t.status !== status) return false;
      if (q && !t.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [tricks, search, category, status]);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Tricks</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {tricks.length} tricks in your library — {filtered.length} match the current filters.
          </p>
        </div>
        <AddCustomTrickDialog />
      </header>

      <TrickFilters
        search={search}
        category={category}
        status={status}
        onSearchChange={setSearch}
        onCategoryChange={setCategory}
        onStatusChange={setStatus}
      />

      {isLoading ? (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl bg-card ring-1 ring-border/40 px-6 py-16 text-center text-muted-foreground">
          No tricks match these filters.
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((t) => (
            <TrickCard key={t.id} trick={t} isOwn={!!user && t.createdBy === user.id} />
          ))}
        </div>
      )}
    </div>
  );
}
