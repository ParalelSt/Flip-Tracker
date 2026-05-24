'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { CombosIcon, PlusIcon } from '@/components/icons';
import { useExecuteCreateCombo, useQueryCombos } from '@/hooks/useCombos';

export default function CombosPage() {
  const { data: combos = [], isLoading } = useQueryCombos();

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Combos</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            String tricks into a sequence — practice flows or test routines.
          </p>
        </div>
        <NewComboDialog />
      </header>

      {isLoading ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
      ) : combos.length === 0 ? (
        <div className="rounded-2xl bg-card ring-1 ring-border/40 px-6 py-16 text-center">
          <CombosIcon className="h-8 w-8 mx-auto text-foreground/20" />
          <p className="mt-3 text-sm text-muted-foreground">No combos yet. Create one to start practicing flows.</p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {combos.map((c) => (
            <Link
              key={c.id}
              href={`/combos/${c.id}`}
              className="group rounded-2xl bg-card ring-1 ring-border/40 p-5 hover:bg-card/80 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="grid place-items-center h-9 w-9 rounded-xl bg-background text-blade shrink-0">
                  <CombosIcon className="h-4 w-4" />
                </span>
                <h3 className="text-base font-semibold truncate">{c.name}</h3>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                {c.trickIds.length} {c.trickIds.length === 1 ? 'step' : 'steps'}
              </div>
              {c.notes && (
                <p className="mt-2 text-sm text-foreground/70 line-clamp-2">{c.notes}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function NewComboDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const router = useRouter();
  const create = useExecuteCreateCombo();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const combo = await create.mutateAsync({ name, trickIds: [] });
      toast.success('Combo created');
      setOpen(false);
      setName('');
      router.push(`/combos/${combo.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="inline-flex items-center gap-2 h-9 px-4 rounded-full bg-blade text-background text-sm font-medium hover:bg-blade-soft transition-colors"
      >
        <PlusIcon className="h-4 w-4" /> New combo
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New combo</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4 mt-2">
          <div className="grid gap-2">
            <Label htmlFor="combo-name">Name</Label>
            <Input id="combo-name" required maxLength={120} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Morning warmup" autoFocus />
          </div>
          <Button type="submit" disabled={create.isPending || !name.trim()} className="bg-blade hover:bg-blade-soft text-background">
            {create.isPending ? 'Creating…' : 'Create and edit'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
