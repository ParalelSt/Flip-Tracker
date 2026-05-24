'use client';

import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PlusIcon } from '@/components/icons';
import { useExecuteCreateTrick } from '@/hooks/useTricks';
import { TRICK_CATEGORIES, type TrickCategory } from '@/types';
import { cn } from '@/lib/utils';

const DIFFICULTIES = [1, 2, 3, 4, 5] as const;

export function AddCustomTrickDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<number>(1);
  const [category, setCategory] = useState<TrickCategory>('flow');
  const [videoUrl, setVideoUrl] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const create = useExecuteCreateTrick();

  const reset = () => {
    setName(''); setDescription(''); setDifficulty(1); setCategory('flow');
    setVideoUrl(''); setIsPublic(false);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await create.mutateAsync({
        name,
        description: description || undefined,
        difficulty,
        category,
        videoUrl: videoUrl || undefined,
        isPublic,
      });
      toast.success('Trick added');
      setOpen(false);
      reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="inline-flex items-center gap-2 h-9 px-4 rounded-full bg-blade text-background text-sm font-medium hover:bg-blade-soft transition-colors"
      >
        <PlusIcon className="h-4 w-4" /> Add custom trick
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add a custom trick</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4 mt-2">
          <div className="grid gap-2">
            <Label htmlFor="trick-name">Name</Label>
            <Input id="trick-name" required maxLength={120} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Bali Helix Variant" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="trick-desc">Description</Label>
            <Textarea id="trick-desc" rows={2} maxLength={2000} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional. What does it look like?" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Difficulty</Label>
              <div className="flex gap-1">
                {DIFFICULTIES.map((d) => (
                  <button
                    type="button"
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={cn(
                      'h-8 w-8 rounded-md text-xs font-bold transition-colors',
                      difficulty === d ? 'bg-blade text-background' : 'bg-card text-muted-foreground hover:text-foreground',
                    )}
                  >{d}</button>
                ))}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="trick-cat">Category</Label>
              <select
                id="trick-cat"
                value={category}
                onChange={(e) => setCategory(e.target.value as TrickCategory)}
                className="h-9 rounded-md bg-card border border-border px-3 text-sm capitalize focus:outline-none focus:ring-2 focus:ring-ring/50"
              >
                {TRICK_CATEGORIES.map((c) => <option key={c} value={c} className="capitalize bg-background">{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="trick-video">Reference video (YouTube link)</Label>
            <Input id="trick-video" type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://youtu.be/…" />
          </div>
          <label className="flex items-center gap-3 text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="h-4 w-4 accent-blade cursor-pointer"
            />
            <span>Share publicly with other flippers</span>
          </label>
          <Button type="submit" disabled={create.isPending || !name.trim()} className="bg-blade hover:bg-blade-soft text-background">
            {create.isPending ? 'Saving…' : 'Add trick'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
