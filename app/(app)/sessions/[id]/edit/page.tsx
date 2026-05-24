'use client';

import { use, useState, type FormEvent, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { NumberStepper } from '@/components/ui/number-stepper';
import { BackIcon, ClockIcon, LibraryIcon } from '@/components/icons';
import { StickyNote } from 'lucide-react';
import { TrickPicker } from '@/components/trick/TrickPicker';
import { useExecuteUpdateSession, useQuerySession } from '@/hooks/useSessions';
import type { Session } from '@/types';

export default function EditSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session, isLoading, error } = useQuerySession(id);

  if (error) {
    return (
      <div className="text-muted-foreground py-12 text-center">
        Session not found.<br />
        <Link href="/sessions" className="text-blade hover:underline">Back to sessions</Link>
      </div>
    );
  }
  if (isLoading || !session) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  // key by id so navigating between sessions reseeds the form cleanly
  return <EditSessionForm key={session.id} session={session} />;
}

function EditSessionForm({ session }: { session: Session }) {
  const router = useRouter();
  const update = useExecuteUpdateSession();
  const [duration, setDuration] = useState(session.durationMin);
  const [notes, setNotes] = useState(session.notes ?? '');
  const [trickIds, setTrickIds] = useState<string[]>(session.trickIds);

  const isValid = Number.isFinite(duration) && duration >= 1;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      toast.error('Duration must be at least 1 minute');
      return;
    }
    try {
      await update.mutateAsync({
        id: session.id,
        body: { durationMin: duration, notes: notes || undefined, trickIds },
      });
      toast.success('Session updated');
      router.push('/sessions');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <Link href="/sessions" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <BackIcon className="h-4 w-4" /> All sessions
      </Link>

      <header>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Edit session</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Updating <time dateTime={session.startedAt}>{new Date(session.startedAt).toLocaleString()}</time>.
        </p>
      </header>

      <form
        onSubmit={submit}
        className="rounded-xl bg-card overflow-hidden divide-y divide-border/50 ring-2 ring-blade/40 shadow-glow border-t-2 border-blade"
      >
        <Step number={1} icon={<ClockIcon className="h-4 w-4" />} title="How long?" hint="Minutes — adjust the stepper or type a value.">
          <NumberStepper
            id="duration"
            label="Duration in minutes"
            value={duration}
            onChange={setDuration}
            min={1}
            max={1440}
            step={5}
            suffix="min"
          />
        </Step>

        <Step number={2} icon={<LibraryIcon className="h-4 w-4" />} title="What did you work on?" hint="Add or remove tricks from this session.">
          <TrickPicker selected={trickIds} onChange={setTrickIds} />
        </Step>

        <Step number={3} icon={<StickyNote className="h-4 w-4" />} title="Anything worth remembering?" hint="A cue, a breakthrough, something that wasn&apos;t clicking." optional>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="How did it feel? Anything click? What&apos;s still tricky?"
            className="bg-background border-border"
          />
        </Step>

        <div className="flex justify-end gap-2 px-6 py-4 bg-muted/30">
          <Link
            href="/sessions"
            className="inline-flex items-center justify-center h-9 px-4 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </Link>
          <Button type="submit" disabled={!isValid || update.isPending} className="bg-blade hover:bg-blade-soft text-white">
            {update.isPending ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}

interface StepProps {
  number: number;
  icon: ReactNode;
  title: string;
  hint: string;
  optional?: boolean;
  children: ReactNode;
}

function Step({ number, icon, title, hint, optional, children }: StepProps) {
  return (
    <section className="px-6 py-6 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
      <div className="row-span-2 grid place-items-center h-9 w-9 rounded-lg bg-blade/10 text-blade font-semibold text-sm">{number}</div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-muted-foreground">{icon}</span>
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        {optional && (
          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Optional
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{hint}</p>
      <div className="col-start-2 mt-3">{children}</div>
    </section>
  );
}
