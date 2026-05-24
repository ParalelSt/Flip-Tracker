'use client';

import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { TrashIcon } from '@/components/icons';
import { useExecuteCreateNote, useExecuteDeleteNote, useQueryNotes } from '@/hooks/useNotes';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
}

export default function NotesPage() {
  const { data: notes = [], isLoading } = useQueryNotes();
  const create = useExecuteCreateNote();
  const remove = useExecuteDeleteNote();
  const [body, setBody] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const text = body.trim();
    if (!text) return;
    try {
      await create.mutateAsync(text);
      setBody('');
      toast.success('Note saved');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save');
    }
  };

  const onDelete = async (id: string) => {
    if (!window.confirm('Delete this note?')) return;
    try {
      await remove.mutateAsync(id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <header>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Notes</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Jot down what you worked on, breakthroughs, what felt off — a flipping journal.
        </p>
      </header>

      <form onSubmit={submit} className="rounded-2xl bg-card ring-1 ring-border/40 p-5 shadow-soft space-y-3">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Today I…"
          rows={4}
          maxLength={8000}
          className="bg-background border-border"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{body.length}/8000</span>
          <Button
            type="submit"
            disabled={!body.trim() || create.isPending}
            className="bg-blade hover:bg-blade-soft text-white"
          >
            {create.isPending ? 'Saving…' : 'Add note'}
          </Button>
        </div>
      </form>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
        </div>
      ) : notes.length === 0 ? (
        <div className="rounded-2xl bg-card ring-1 ring-border/40 px-6 py-12 text-center text-sm text-muted-foreground">
          No notes yet. Save the first one above.
        </div>
      ) : (
        <ul className="space-y-3">
          {notes.map((n) => (
            <li key={n.id} className="rounded-2xl bg-card ring-1 ring-border/40 p-5">
              <div className="flex items-start justify-between gap-4">
                <p className="whitespace-pre-wrap text-sm leading-relaxed flex-1">{n.body}</p>
                <Button variant="ghost" size="icon" onClick={() => onDelete(n.id)} aria-label="Delete note">
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">{formatDate(n.createdAt)}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
