'use client';

import Link from 'next/link';
import { StatusPill } from './StatusPill';
import { DifficultyDots } from './DifficultyDots';
import { thumbnailFromUrl } from '@/lib/video';
import { LockIcon, GlobeIcon, BalisongLogo } from '@/components/icons';
import type { TrickWithStatus } from '@/types';

interface Props {
  trick: TrickWithStatus;
  /** True when the calling user is the trick's author (controls private/public badge visibility). */
  isOwn?: boolean;
}

export function TrickCard({ trick, isOwn }: Props) {
  // Prefer the cached oEmbed thumbnail (works for any provider, exact source URL).
  // Fall back to the YouTube-derived hqdefault for legacy rows without metadata.
  const thumb = trick.videoThumbnailUrl ?? thumbnailFromUrl(trick.videoUrl);
  const isCustom = trick.createdBy != null;

  return (
    <Link
      href={`/tricks/${trick.slug}`}
      className="group relative flex flex-col rounded-2xl bg-card hover:bg-card/80 transition-colors overflow-hidden ring-1 ring-border/40"
    >
      <div className="relative aspect-video w-full bg-background overflow-hidden">
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumb} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full grid place-items-center text-foreground/15">
            <BalisongLogo className="h-12 w-12" />
          </div>
        )}
        {isCustom && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-background/70 backdrop-blur px-2 py-0.5 text-[10px] uppercase tracking-wider text-foreground/80">
            {trick.isPublic ? <GlobeIcon className="h-3 w-3" /> : <LockIcon className="h-3 w-3" />}
            {isOwn ? (trick.isPublic ? 'Public' : 'Private') : 'Community'}
          </span>
        )}
        {trick.videoAuthor && (
          // Bottom-left credit chip on the thumbnail — subtle, doesn't compete
          // with the trick name below. Only shown when oEmbed gave us an author.
          <span className="absolute left-3 bottom-3 inline-flex max-w-[calc(100%-1.5rem)] items-center gap-1 rounded-full bg-background/70 backdrop-blur px-2 py-0.5 text-[10px] text-foreground/80">
            <span className="opacity-60">via</span>
            <span className="truncate font-medium">{trick.videoAuthor}</span>
          </span>
        )}
      </div>
      <div className="flex-1 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold truncate">{trick.name}</h3>
          <DifficultyDots value={trick.difficulty} className="shrink-0 mt-1.5" />
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground capitalize">{trick.category}</span>
          <StatusPill status={trick.status} />
        </div>
      </div>
    </Link>
  );
}
