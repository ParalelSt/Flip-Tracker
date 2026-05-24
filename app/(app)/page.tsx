'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useQueryTricks } from '@/hooks/useTricks';
import { useQuerySessions } from '@/hooks/useSessions';
import { useAuth } from '@/components/providers/AuthProvider';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusPill } from '@/components/trick/StatusPill';
import { ClockIcon, SparkIcon, SessionsIcon, PlusIcon } from '@/components/icons';

interface Stats {
  total: number;
  mastered: number;
  clean: number;
  learning: number;
  pctMastered: number;
}

function useDashboardStats(): Stats {
  const { data: tricks = [] } = useQueryTricks();
  return useMemo(() => {
    const total = tricks.length;
    const mastered = tricks.filter((t) => t.status === 'mastered').length;
    const clean = tricks.filter((t) => t.status === 'clean').length;
    const learning = tricks.filter((t) => t.status === 'learning').length;
    return { total, mastered, clean, learning, pctMastered: total ? Math.round((mastered / total) * 100) : 0 };
  }, [tricks]);
}

function formatRelative(iso: string): string {
  const d = new Date(iso);
  const ms = Date.now() - d.getTime();
  const min = Math.floor(ms / 60_000);
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return d.toLocaleDateString();
}

export default function DashboardPage() {
  const { user } = useAuth();
  const stats = useDashboardStats();
  const { data: sessions = [], isLoading: isSessionsLoading } = useQuerySessions();
  const { isLoading: isTricksLoading } = useQueryTricks();
  const recent = sessions.slice(0, 5);

  return (
    <div className="space-y-10">
      <header>
        <p className="text-sm text-muted-foreground">Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}.</p>
        <h1 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight">Dashboard</h1>
      </header>

      {/* Stat hero */}
      <section className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <div className="md:col-span-2 rounded-2xl bg-card ring-1 ring-border/40 p-6 shadow-soft">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
            <SparkIcon className="h-3.5 w-3.5 text-blade" />
            Mastery
          </div>
          {isTricksLoading ? (
            <Skeleton className="mt-4 h-12 w-32" />
          ) : (
            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-5xl font-bold tracking-tight tabular-nums">{stats.pctMastered}%</span>
              <span className="text-sm text-muted-foreground">
                {stats.mastered} of {stats.total} tricks mastered
              </span>
            </div>
          )}
          <Progress value={stats.pctMastered} className="mt-5 h-2" />
          <div className="mt-6 flex flex-wrap gap-3">
            <StatusPill status="learning" size="md" /> <span className="text-sm text-muted-foreground self-center">{stats.learning}</span>
            <span className="mx-2 text-foreground/20 self-center">·</span>
            <StatusPill status="clean" size="md" /> <span className="text-sm text-muted-foreground self-center">{stats.clean}</span>
            <span className="mx-2 text-foreground/20 self-center">·</span>
            <StatusPill status="mastered" size="md" /> <span className="text-sm text-muted-foreground self-center">{stats.mastered}</span>
          </div>
        </div>

        <div className="rounded-2xl bg-card ring-1 ring-border/40 p-6 shadow-soft flex flex-col">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
            <SessionsIcon className="h-3.5 w-3.5 text-blade" />
            Quick log
          </div>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Just finished flipping? Log it before you forget.
          </p>
          <div className="mt-auto flex flex-col gap-2">
            <Link
              href="/sessions/new"
              className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-lg bg-blade hover:bg-blade-soft text-background text-sm font-medium transition-colors"
            >
              <PlusIcon className="h-4 w-4" /> New session
            </Link>
            <Link href="/guide" className="text-xs text-center text-muted-foreground hover:text-foreground">
              First time? See how it works →
            </Link>
          </div>
        </div>
      </section>

      {/* Recent sessions */}
      <section>
        <div className="flex items-end justify-between mb-4">
          <h2 className="text-xl font-bold tracking-tight">Recent sessions</h2>
          <Link href="/sessions" className="text-xs text-muted-foreground hover:text-foreground">View all →</Link>
        </div>
        {isSessionsLoading ? (
          <div className="grid gap-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
          </div>
        ) : recent.length === 0 ? (
          <div className="rounded-2xl bg-card ring-1 ring-border/40 px-6 py-12 text-center">
            <p className="text-sm text-muted-foreground">No sessions logged yet.</p>
            <Link
              href="/sessions/new"
              className="mt-4 inline-flex items-center justify-center gap-2 h-9 px-4 rounded-lg bg-blade hover:bg-blade-soft text-background text-sm font-medium transition-colors"
            >
              Log your first session
            </Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {recent.map((s) => (
              <li key={s.id} className="flex items-center justify-between rounded-xl bg-card ring-1 ring-border/40 px-5 py-4">
                <div className="flex items-center gap-4 min-w-0">
                  <span className="grid place-items-center h-9 w-9 rounded-lg bg-background text-blade shrink-0">
                    <ClockIcon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">{s.durationMin} min</div>
                    <div className="text-xs text-muted-foreground">{formatRelative(s.startedAt)} · {s.trickIds.length} {s.trickIds.length === 1 ? 'trick' : 'tricks'}</div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
