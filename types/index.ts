/** Difficulty rating 1 (easiest) → 5 (hardest). */
export type Difficulty = 1 | 2 | 3 | 4 | 5;

export const TRICK_CATEGORIES = ['basic', 'twirl', 'fan', 'rollover', 'aerial', 'flow'] as const;
export type TrickCategory = (typeof TRICK_CATEGORIES)[number];

export const TRICK_STATUSES = ['not_started', 'learning', 'clean', 'mastered'] as const;
export type TrickStatus = (typeof TRICK_STATUSES)[number];

/** A trick in the shared catalog. `createdBy = null` means it's a seeded
 *  canonical trick; otherwise it was contributed by that user. */
export interface Trick {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  difficulty: Difficulty;
  category: TrickCategory;
  videoUrl: string | null;
  /** Cached from oEmbed (server-fetched on insert/update). Null for tricks
   *  without a video URL or when oEmbed didn't return data. */
  videoTitle: string | null;
  videoAuthor: string | null;
  videoAuthorUrl: string | null;
  videoThumbnailUrl: string | null;
  createdBy: string | null;
  isPublic: boolean;
  createdAt: string;
}

/** A trick augmented with the calling user's progress on it. */
export interface TrickWithStatus extends Trick {
  status: TrickStatus;
  notes: string | null;
  updatedAt: string | null;
}

export interface Session {
  id: string;
  startedAt: string;
  durationMin: number;
  notes: string | null;
  trickIds: string[];
}

export interface Combo {
  id: string;
  name: string;
  notes: string | null;
  trickIds: string[];
  createdAt: string;
}

export interface Note {
  id: string;
  body: string;
  createdAt: string;
}
