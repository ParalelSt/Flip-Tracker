import type { Combo, Session, Trick, TrickWithStatus, TrickStatus, TrickCategory, Difficulty } from '@/types';

interface TrickRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  difficulty: number;
  category: string;
  video_url: string | null;
  video_title: string | null;
  video_author: string | null;
  video_author_url: string | null;
  video_thumbnail_url: string | null;
  created_by: string | null;
  is_public: boolean;
  created_at: string;
}

interface StatusRow {
  status: string;
  notes: string | null;
  updated_at: string;
}

interface JoinedTrickRow extends TrickRow {
  user_trick_status: StatusRow[] | StatusRow | null;
}

export function mapTrick(row: TrickRow): Trick {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    difficulty: row.difficulty as Difficulty,
    category: row.category as TrickCategory,
    videoUrl: row.video_url,
    videoTitle: row.video_title,
    videoAuthor: row.video_author,
    videoAuthorUrl: row.video_author_url,
    videoThumbnailUrl: row.video_thumbnail_url,
    createdBy: row.created_by,
    isPublic: row.is_public,
    createdAt: row.created_at,
  };
}

export function mapTrickWithStatus(row: JoinedTrickRow): TrickWithStatus {
  const statusRow = Array.isArray(row.user_trick_status)
    ? row.user_trick_status[0] ?? null
    : row.user_trick_status;
  return {
    ...mapTrick(row),
    status: (statusRow?.status as TrickStatus | undefined) ?? 'not_started',
    notes: statusRow?.notes ?? null,
    updatedAt: statusRow?.updated_at ?? null,
  };
}

interface SessionRow {
  id: string;
  started_at: string;
  duration_min: number;
  notes: string | null;
  session_tricks?: { trick_id: string }[] | null;
}

export function mapSession(row: SessionRow): Session {
  return {
    id: row.id,
    startedAt: row.started_at,
    durationMin: row.duration_min,
    notes: row.notes,
    trickIds: (row.session_tricks ?? []).map((st) => st.trick_id),
  };
}

interface ComboRow {
  id: string;
  name: string;
  notes: string | null;
  created_at: string;
  combo_tricks?: { trick_id: string; position: number }[] | null;
}

export function mapCombo(row: ComboRow): Combo {
  const order = (row.combo_tricks ?? []).slice().sort((a, b) => a.position - b.position);
  return {
    id: row.id,
    name: row.name,
    notes: row.notes,
    trickIds: order.map((ct) => ct.trick_id),
    createdAt: row.created_at,
  };
}
