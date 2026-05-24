import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { fromError, jsonError, requireUser, UnauthorizedError, unauthorizedResponse } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { mapTrick, mapTrickWithStatus } from '@/lib/mapRow';
import { uniqueSlug } from '@/lib/slug';
import { fetchVideoMetadata } from '@/lib/video';
import { TRICK_CATEGORIES } from '@/types';

const CreateTrickSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(2000).optional().nullable(),
  difficulty: z.number().int().min(1).max(5),
  category: z.enum(TRICK_CATEGORIES),
  videoUrl: z.string().url().optional().nullable(),
  isPublic: z.boolean().optional(),
});

export async function GET() {
  try {
    // Anon-friendly: server-side RLS lets unauthenticated callers read public
    // tricks. Authed users get the status join; guests get tricks with default
    // statuses (filled in client-side from localStorage).
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    const isAuthed = !!userData?.user;

    if (isAuthed) {
      const { data, error } = await supabase
        .from('tricks')
        .select('*, user_trick_status(status, notes, updated_at)')
        .order('difficulty')
        .order('name');
      if (error) throw error;
      return Response.json({ tricks: (data ?? []).map(mapTrickWithStatus) });
    }

    const { data, error } = await supabase
      .from('tricks')
      .select('*')
      .eq('is_public', true)
      .order('difficulty')
      .order('name');
    if (error) throw error;
    return Response.json({
      tricks: (data ?? []).map((row) => ({
        ...mapTrick(row),
        status: 'not_started' as const,
        notes: null,
        updatedAt: null,
      })),
    });
  } catch (e) {
    return fromError(e);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    const parsed = CreateTrickSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? 'Invalid input', 400);
    const input = parsed.data;
    const meta = await fetchVideoMetadata(input.videoUrl);
    const { data, error } = await supabase
      .from('tricks')
      .insert({
        slug: uniqueSlug(input.name),
        name: input.name,
        description: input.description ?? null,
        difficulty: input.difficulty,
        category: input.category,
        video_url: input.videoUrl ?? null,
        video_title: meta?.title ?? null,
        video_author: meta?.author ?? null,
        video_author_url: meta?.authorUrl ?? null,
        video_thumbnail_url: meta?.thumbnailUrl ?? null,
        is_public: input.isPublic ?? false,
        created_by: user.id,
      })
      .select('*')
      .single();
    if (error) throw error;
    return Response.json({ trick: mapTrick(data) }, { status: 201 });
  } catch (e) {
    if (e instanceof UnauthorizedError) return unauthorizedResponse();
    return fromError(e);
  }
}
