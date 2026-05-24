'use client';

import { useState, type FormEvent, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { NumberStepper } from '@/components/ui/number-stepper';
import { BackIcon, ClockIcon, LibraryIcon } from '@/components/icons';
import { StickyNote } from 'lucide-react';
import { TrickPicker } from '@/components/trick/TrickPicker';
import { useExecuteCreateSession } from '@/hooks/useSessions';

export default function NewSessionPage() {
  const router = useRouter();
  const create = useExecuteCreateSession();
  const [duration, setDuration] = useState(20);
  const [notes, setNotes] = useState('');
  const [trickIds, setTrickIds] = useState<string[]>([]);
  const isValid = Number.isFinite(duration) && duration >= 1;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      toast.error('Duration must be at least 1 minute');
      return;
    }
    try {
      await create.mutateAsync({ durationMin: duration, notes: notes || undefined, trickIds });
      toast.success('Session logged');
      router.push('/sessions');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <Link
        href="/sessions"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <BackIcon className="h-4 w-4" /> All sessions
      </Link>

      <header>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Log a session</h1>
        <p className="mt-2 text-base text-muted-foreground">
          Three quick steps. We&apos;ll handle the timestamps.
        </p>
      </header>

      {/* Unified flow panel. Red accent ring + soft halo make it pop without
          competing with the brand button; thin top border anchors the eye. */}
      <form
        onSubmit={submit}
        className="rounded-xl bg-card overflow-hidden divide-y divide-border/50 ring-2 ring-blade/40 shadow-glow border-t-2 border-blade"
      >
        <Step
          number={1}
          icon={<ClockIcon className="h-4 w-4" />}
          title="How long was it?"
          hint="Round to the nearest 5 minutes — close enough is fine."
        >
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

        <Step
          number={2}
          icon={<LibraryIcon className="h-4 w-4" />}
          title="What did you work on?"
          hint="Pick every trick you touched today, even briefly."
        >
          <TrickPicker selected={trickIds} onChange={setTrickIds} />
        </Step>

        <Step
          number={3}
          icon={<StickyNote className="h-4 w-4" />}
          title="Anything worth remembering?"
          hint="A cue, a breakthrough, something that wasn&apos;t clicking."
          optional
        >
          <Textarea
            id="notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Y2 felt cleaner once I gripped lower on the safe handle."
            className="rounded-lg"
          />
        </Step>

        <footer className="flex items-center justify-between gap-3 bg-muted/30 px-6 py-4">
          <Link
            href="/sessions"
            className="inline-flex items-center justify-center h-10 px-4 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </Link>
          <Button
            type="submit"
            disabled={!isValid || create.isPending}
            className="h-10 px-5 rounded-lg bg-blade hover:bg-blade-soft text-white text-sm font-semibold"
          >
            {create.isPending ? 'Saving…' : 'Log session'}
          </Button>
        </footer>
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

/** One step in the logging flow. Number badge + title + hint pull the eye
 *  down the page; the input sits below in a consistent indent so the form
 *  reads as a single guided sequence. */
function Step({ number, icon, title, hint, optional, children }: StepProps) {
  return (
    <section className="px-6 py-6 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
      <div className="row-span-2 grid place-items-center h-9 w-9 rounded-lg bg-blade/10 text-blade font-semibold text-sm">
        {number}
      </div>
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
