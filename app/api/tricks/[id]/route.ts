import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { fromError, jsonError, requireUser, UnauthorizedError, unauthorizedResponse } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { mapTrick, mapTrickWithStatus } from '@/lib/mapRow';
import { fetchVideoMetadata } from '@/lib/video';
import { TRICK_CATEGORIES } from '@/types';

const UpdateTrickSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  description: z.string().max(2000).nullable().optional(),
  difficulty: z.number().int().min(1).max(5).optional(),
  category: z.enum(TRICK_CATEGORIES).optional(),
  videoUrl: z.string().url().nullable().optional(),
  isPublic: z.boolean().optional(),
});

// :id segment accepts either UUID or slug — both are unique in the table.
function buildSelector(id: string) {
  const isUuid = /^[0-9a-f-]{36}$/i.test(id);
  return isUuid ? { column: 'id', value: id } : { column: 'slug', value: id };
}

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/tricks/[id]'>) {
  try {
    // Anon-friendly: RLS lets unauthenticated callers read public tricks.
    // Authed users get the per-user status join; guests get default status.
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    const isAuthed = !!userData?.user;
    const { id } = await ctx.params;
    const sel = buildSelector(id);

    if (isAuthed) {
      const { data, error } = await supabase
        .from('tricks')
        .select('*, user_trick_status(status, notes, updated_at)')
        .eq(sel.column, sel.value)
        .single();
      if (error || !data) return jsonError('Trick not found', 404);
      return Response.json({ trick: mapTrickWithStatus(data) });
    }

    const { data, error } = await supabase
      .from('tricks')
      .select('*')
      .eq(sel.column, sel.value)
      .single();
    if (error || !data) return jsonError('Trick not found', 404);
    return Response.json({
      trick: {
        ...mapTrick(data),
        status: 'not_started' as const,
        notes: null,
        updatedAt: null,
      },
    });
  } catch (e) {
    return fromError(e);
  }
}

export async function PATCH(request: NextRequest, ctx: RouteContext<'/api/tricks/[id]'>) {
  try {
    const { supabase } = await requireUser();
    const { id } = await ctx.params;
    const sel = buildSelector(id);
    const parsed = UpdateTrickSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? 'Invalid input', 400);
    const input = parsed.data;
    const updates: Record<string, unknown> = {};
    if (input.name !== undefined) updates.name = input.name;
    if (input.description !== undefined) updates.description = input.description;
    if (input.difficulty !== undefined) updates.difficulty = input.difficulty;
    if (input.category !== undefined) updates.category = input.category;
    if (input.videoUrl !== undefined) {
      updates.video_url = input.videoUrl;
      // Re-fetch metadata whenever the URL changes — including unsetting it.
      const meta = await fetchVideoMetadata(input.videoUrl);
      updates.video_title = meta?.title ?? null;
      updates.video_author = meta?.author ?? null;
      updates.video_author_url = meta?.authorUrl ?? null;
      updates.video_thumbnail_url = meta?.thumbnailUrl ?? null;
    }
    if (input.isPublic !== undefined) updates.is_public = input.isPublic;
    const { data, error } = await supabase
      .from('tricks')
      .update(updates)
      .eq(sel.column, sel.value)
      .select('*')
      .single();
    if (error || !data) throw error ?? new Error('Not found');
    return Response.json({ trick: mapTrick(data) });
  } catch (e) {
    if (e instanceof UnauthorizedError) return unauthorizedResponse();
    return fromError(e);
  }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/tricks/[id]'>) {
  try {
    const { supabase } = await requireUser();
    const { id } = await ctx.params;
    const sel = buildSelector(id);
    const { error } = await supabase.from('tricks').delete().eq(sel.column, sel.value);
    if (error) throw error;
    return Response.json({ ok: true });
  } catch (e) {
    if (e instanceof UnauthorizedError) return unauthorizedResponse();
    return fromError(e);
  }
}
