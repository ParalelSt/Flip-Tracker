'use client';

import { use, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { BackIcon, PlusIcon, TrashIcon } from '@/components/icons';
import { ComboSortableList } from '@/components/combo/ComboSortableList';
import { TrickPicker } from '@/components/trick/TrickPicker';
import { useExecuteDeleteCombo, useExecuteUpdateCombo, useQueryCombo } from '@/hooks/useCombos';
import { useQueryTricks } from '@/hooks/useTricks';
import type { Combo, TrickWithStatus } from '@/types';
import { cn } from '@/lib/utils';

export default function ComboEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: combo, isLoading, error } = useQueryCombo(id);
  const { data: tricks = [] } = useQueryTricks();

  if (error) {
    return (
      <div className="text-muted-foreground py-12 text-center">
        Combo not found.<br />
        <Link href="/combos" className="text-blade hover:underline">Back to combos</Link>
      </div>
    );
  }
  if (isLoading || !combo) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-12 w-2/3" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  // key by combo.id so navigating between combos reseeds form state cleanly
  return <ComboEditor key={combo.id} combo={combo} tricks={tricks} />;
}

interface EditorProps {
  combo: Combo;
  tricks: TrickWithStatus[];
}

function ComboEditor({ combo, tricks }: EditorProps) {
  const router = useRouter();
  const update = useExecuteUpdateCombo();
  const remove = useExecuteDeleteCombo();

  const trickById = useMemo(() => new Map(tricks.map((t) => [t.id, t])), [tricks]);

  const [name, setName] = useState(combo.name);
  const [notes, setNotes] = useState(combo.notes ?? '');
  const [trickIds, setTrickIds] = useState<string[]>(combo.trickIds);
  const [pickerOpen, setPickerOpen] = useState(false);

  const dirty =
    name !== combo.name
    || (notes ?? '') !== (combo.notes ?? '')
    || JSON.stringify(trickIds) !== JSON.stringify(combo.trickIds);

  const onSave = async () => {
    try {
      await update.mutateAsync({ id: combo.id, body: { name, notes: notes || undefined, trickIds } });
      toast.success('Combo saved');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed');
    }
  };

  const onDeleteCombo = async () => {
    if (!window.confirm(`Delete "${combo.name}"?`)) return;
    try {
      await remove.mutateAsync(combo.id);
      router.push('/combos');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  const removeTrick = (tid: string) => setTrickIds(trickIds.filter((x) => x !== tid));

  return (
    <div className="space-y-8 max-w-3xl">
      <Link href="/combos" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <BackIcon className="h-4 w-4" /> All combos
      </Link>

      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-0 space-y-2">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Combo</div>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-transparent border-0 px-0 text-3xl md:text-4xl font-bold tracking-tight h-auto focus-visible:ring-0 focus-visible:border-0 shadow-none"
            placeholder="Combo name"
          />
        </div>
        <Button variant="ghost" size="icon" onClick={onDeleteCombo} aria-label="Delete combo">
          <TrashIcon className="h-4 w-4" />
        </Button>
      </header>

      <section className="rounded-2xl bg-card ring-1 ring-border/40 p-6 shadow-soft space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-xs uppercase tracking-widest text-muted-foreground">Sequence</Label>
          <button
            type="button"
            onClick={() => setPickerOpen((v) => !v)}
            className={cn(
              'inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full transition-colors',
              pickerOpen ? 'bg-blade text-background' : 'bg-background text-muted-foreground hover:text-foreground',
            )}
          >
            <PlusIcon className="h-3.5 w-3.5" /> {pickerOpen ? 'Done' : 'Add tricks'}
          </button>
        </div>

        <ComboSortableList
          trickIds={trickIds}
          trickById={trickById}
          onReorder={setTrickIds}
          onRemove={removeTrick}
        />

        {pickerOpen && (
          <div className="pt-3 border-t border-border/40">
            <TrickPicker selected={trickIds} onChange={setTrickIds} unique={false} />
          </div>
        )}
      </section>

      <section className="rounded-2xl bg-card ring-1 ring-border/40 p-6 shadow-soft">
        <Label htmlFor="combo-notes" className="text-xs uppercase tracking-widest text-muted-foreground">Notes</Label>
        <Textarea
          id="combo-notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Cues, transitions, what to focus on…"
          className="mt-3 bg-background border-border"
        />
      </section>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={() => router.push('/combos')}>Back</Button>
        <Button onClick={onSave} disabled={!dirty || update.isPending} className="bg-blade hover:bg-blade-soft text-background">
          {update.isPending ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </div>
  );
}
