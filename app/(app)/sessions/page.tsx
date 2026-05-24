'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useQueryTricks } from '@/hooks/useTricks';
import { useExecuteDeleteSession, useQuerySessions } from '@/hooks/useSessions';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ClockIcon, PlusIcon, SessionsIcon, TrashIcon } from '@/components/icons';
import { Pencil } from 'lucide-react';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function SessionsPage() {
  const { data: sessions = [], isLoading } = useQuerySessions();
  const { data: tricks = [] } = useQueryTricks();
  const trickById = useMemo(() => new Map(tricks.map((t) => [t.id, t])), [tricks]);
  const deleteSession = useExecuteDeleteSession();

  const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMin, 0);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Sessions</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {sessions.length} {sessions.length === 1 ? 'session' : 'sessions'} logged
            {sessions.length > 0 && <> · {Math.round(totalMinutes / 60)} hours total</>}.
          </p>
        </div>
        <Link
          href="/sessions/new"
          className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-lg bg-blade hover:bg-blade-soft text-background text-sm font-medium transition-colors"
        >
          <PlusIcon className="h-4 w-4" /> New session
        </Link>
      </header>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
      ) : sessions.length === 0 ? (
        <div className="rounded-2xl bg-card ring-1 ring-border/40 px-6 py-16 text-center">
          <SessionsIcon className="h-8 w-8 mx-auto text-foreground/20" />
          <p className="mt-3 text-sm text-muted-foreground">No sessions yet. Log your first one to start a streak.</p>
          <Link
            href="/sessions/new"
            className="mt-5 inline-flex items-center justify-center gap-2 h-9 px-4 rounded-lg bg-blade hover:bg-blade-soft text-background text-sm font-medium transition-colors"
          >
            Log a session
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {sessions.map((s) => (
            <li key={s.id} className="rounded-2xl bg-card ring-1 ring-border/40 p-5 hover:bg-card/80 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0">
                  <span className="grid place-items-center h-10 w-10 rounded-xl bg-background text-blade shrink-0">
                    <ClockIcon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">{s.durationMin} min</div>
                    <div className="text-xs text-muted-foreground">{formatDate(s.startedAt)}</div>
                    {s.notes && <p className="mt-2 text-sm text-foreground/80 leading-relaxed">{s.notes}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Link
                    href={`/sessions/${s.id}/edit`}
                    aria-label="Edit session"
                    className="grid place-items-center h-9 w-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (window.confirm('Delete this session?')) deleteSession.mutate(s.id);
                    }}
                    aria-label="Delete session"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {s.trickIds.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {s.trickIds.map((id) => (
                    <span key={id} className="rounded-full bg-background px-2.5 py-1 text-[11px] font-medium ring-1 ring-border/40">
                      {trickById.get(id)?.name ?? '—'}
                    </span>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
