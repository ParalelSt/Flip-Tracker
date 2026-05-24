'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusPill } from '@/components/trick/StatusPill';
import { DifficultyDots } from '@/components/trick/DifficultyDots';
import { BackIcon, ExternalIcon, TrashIcon, BalisongLogo, GlobeIcon, LockIcon } from '@/components/icons';
import { useExecuteDeleteTrick, useExecuteSetTrickStatus, useQueryTrick } from '@/hooks/useTricks';
import { useAuth } from '@/components/providers/AuthProvider';
import { thumbnailFromUrl, youtubeId } from '@/lib/video';
import { TRICK_STATUSES, type TrickStatus, type TrickWithStatus } from '@/types';
import { cn } from '@/lib/utils';

export default function TrickDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: trick, isLoading, error } = useQueryTrick(slug);

  if (error) {
    return (
      <div className="text-muted-foreground py-12 text-center">
        Trick not found.<br />
        <Link href="/tricks" className="text-blade hover:underline">Back to tricks</Link>
      </div>
    );
  }
  if (isLoading || !trick) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="aspect-video w-full rounded-2xl" />
        <Skeleton className="h-10 w-2/3" />
      </div>
    );
  }

  // key by id so navigating between tricks reseeds the notes textarea
  return <TrickDetail key={trick.id} trick={trick} />;
}

function TrickDetail({ trick }: { trick: TrickWithStatus }) {
  const router = useRouter();
  const { user } = useAuth();
  const setStatus = useExecuteSetTrickStatus();
  const deleteTrick = useExecuteDeleteTrick();
  const [notes, setNotes] = useState(trick.notes ?? '');

  const thumb = trick.videoThumbnailUrl ?? thumbnailFromUrl(trick.videoUrl);
  const ytId = youtubeId(trick.videoUrl);
  const isOwn = !!user && trick.createdBy === user.id;

  const onPickStatus = (next: TrickStatus) => {
    setStatus.mutate({ id: trick.id, slug: trick.slug, status: next, notes });
  };
  const onSaveNotes = () => {
    setStatus.mutate({ id: trick.id, slug: trick.slug, status: trick.status, notes });
    toast.success('Notes saved');
  };
  const onDelete = async () => {
    if (!window.confirm(`Delete "${trick.name}"?`)) return;
    await deleteTrick.mutateAsync(trick.id);
    router.push('/tricks');
  };

  return (
    <div className="space-y-8">
      <Link href="/tricks" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <BackIcon className="h-4 w-4" /> All tricks
      </Link>

      <header className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
            <span className="capitalize">{trick.category}</span>
            <span>·</span>
            <DifficultyDots value={trick.difficulty} />
            {trick.createdBy && (
              <>
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  {trick.isPublic ? <GlobeIcon className="h-3 w-3" /> : <LockIcon className="h-3 w-3" />}
                  {isOwn ? (trick.isPublic ? 'Public' : 'Private') : 'Community'}
                </span>
              </>
            )}
          </div>
          <h1 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight leading-tight">{trick.name}</h1>
          {trick.description && (
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground leading-relaxed">{trick.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <StatusPill status={trick.status} size="md" />
          {isOwn && (
            <Button variant="ghost" size="icon" onClick={onDelete} aria-label="Delete trick">
              <TrashIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
      </header>

      <section className="rounded-2xl overflow-hidden ring-1 ring-border/40 bg-card">
        {ytId ? (
          <div className="aspect-video w-full">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${ytId}`}
              title={trick.name}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        ) : thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumb} alt="" className="aspect-video w-full object-cover" />
        ) : (
          <div className="aspect-video w-full grid place-items-center text-foreground/15 bg-background">
            <BalisongLogo className="h-20 w-20" />
          </div>
        )}
        {trick.videoUrl && (
          <div className="flex items-center justify-between gap-3 px-5 py-3 text-xs text-muted-foreground border-t border-border/40">
            <div className="min-w-0">
              {trick.videoTitle && <div className="truncate text-foreground/85 font-medium">{trick.videoTitle}</div>}
              <div className="truncate">
                {trick.videoAuthor ? (
                  <>
                    Video by{' '}
                    {trick.videoAuthorUrl ? (
                      <a
                        href={trick.videoAuthorUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-foreground underline-offset-2 hover:underline"
                      >
                        {trick.videoAuthor}
                      </a>
                    ) : (
                      <span className="text-foreground/80">{trick.videoAuthor}</span>
                    )}
                  </>
                ) : (
                  <span className="truncate">{trick.videoUrl}</span>
                )}
              </div>
            </div>
            <a
              href={trick.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 shrink-0 hover:text-foreground"
              aria-label="Open source video"
            >
              Source <ExternalIcon className="h-3.5 w-3.5" />
            </a>
          </div>
        )}
      </section>

      <section className="rounded-2xl bg-card ring-1 ring-border/40 p-6 shadow-soft">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">My progress</div>
        <div className="mt-4 flex flex-wrap gap-2">
          {TRICK_STATUSES.map((s) => {
            const active = trick.status === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => onPickStatus(s)}
                className={cn(
                  'rounded-full transition-transform',
                  !active && 'hover:scale-[1.02]',
                )}
              >
                <StatusPill status={s} size="md" active={active} />
              </button>
            );
          })}
        </div>

        <div className="mt-6">
          <label htmlFor="notes" className="text-xs uppercase tracking-widest text-muted-foreground">My notes</label>
          <Textarea
            id="notes"
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Cues, what's tricky, what's clicking…"
            className="mt-2 bg-background border-border"
          />
          <div className="mt-3 flex justify-end">
            <Button onClick={onSaveNotes} disabled={setStatus.isPending} className="bg-blade hover:bg-blade-soft text-background">
              {setStatus.isPending ? 'Saving…' : 'Save notes'}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
