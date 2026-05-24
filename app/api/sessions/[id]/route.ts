import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { fromError, jsonError, requireUser, UnauthorizedError, unauthorizedResponse } from '@/lib/auth';
import { mapSession } from '@/lib/mapRow';

const UpdateSessionSchema = z.object({
  startedAt: z.string().datetime().optional(),
  durationMin: z.number().int().min(1).max(1440).optional(),
  notes: z.string().max(4000).nullable().optional(),
  trickIds: z.array(z.string().uuid()).max(100).optional(),
});

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/sessions/[id]'>) {
  try {
    const { supabase } = await requireUser();
    const { id } = await ctx.params;
    const { data, error } = await supabase
      .from('sessions')
      .select('id, started_at, duration_min, notes, session_tricks(trick_id)')
      .eq('id', id)
      .single();
    if (error || !data) return jsonError('Session not found', 404);
    return Response.json({ session: mapSession(data) });
  } catch (e) {
    if (e instanceof UnauthorizedError) return unauthorizedResponse();
    return fromError(e);
  }
}

export async function PATCH(request: NextRequest, ctx: RouteContext<'/api/sessions/[id]'>) {
  try {
    const { supabase } = await requireUser();
    const { id } = await ctx.params;
    const parsed = UpdateSessionSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? 'Invalid input', 400);
    const input = parsed.data;

    const updates: Record<string, unknown> = {};
    if (input.startedAt !== undefined) updates.started_at = input.startedAt;
    if (input.durationMin !== undefined) updates.duration_min = input.durationMin;
    if (input.notes !== undefined) updates.notes = input.notes;
    if (Object.keys(updates).length) {
      const { error } = await supabase.from('sessions').update(updates).eq('id', id);
      if (error) throw error;
    }

    // Replace trick set if provided. Not transactional — fine for personal use.
    if (input.trickIds !== undefined) {
      const { error: delErr } = await supabase.from('session_tricks').delete().eq('session_id', id);
      if (delErr) throw delErr;
      if (input.trickIds.length > 0) {
        const rows = input.trickIds.map((trick_id) => ({ session_id: id, trick_id }));
        const { error: insErr } = await supabase.from('session_tricks').insert(rows);
        if (insErr) throw insErr;
      }
    }

    const { data, error: fetchErr } = await supabase
      .from('sessions')
      .select('id, started_at, duration_min, notes, session_tricks(trick_id)')
      .eq('id', id)
      .single();
    if (fetchErr || !data) throw fetchErr ?? new Error('Not found');
    return Response.json({ session: mapSession(data) });
  } catch (e) {
    if (e instanceof UnauthorizedError) return unauthorizedResponse();
    return fromError(e);
  }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/sessions/[id]'>) {
  try {
    const { supabase } = await requireUser();
    const { id } = await ctx.params;
    const { error } = await supabase.from('sessions').delete().eq('id', id);
    if (error) throw error;
    return Response.json({ ok: true });
  } catch (e) {
    if (e instanceof UnauthorizedError) return unauthorizedResponse();
    return fromError(e);
  }
}
