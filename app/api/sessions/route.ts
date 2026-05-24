import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { fromError, jsonError, requireUser, UnauthorizedError, unauthorizedResponse } from '@/lib/auth';
import { mapSession } from '@/lib/mapRow';

const CreateSessionSchema = z.object({
  startedAt: z.string().optional(),
  durationMin: z.number().int().min(1).max(24 * 60),
  notes: z.string().max(4000).optional().nullable(),
  trickIds: z.array(z.string().uuid()).max(200),
});

export async function GET() {
  try {
    const { supabase } = await requireUser();
    const { data, error } = await supabase
      .from('sessions')
      .select('id, started_at, duration_min, notes, session_tricks(trick_id)')
      .order('started_at', { ascending: false })
      .limit(100);
    if (error) throw error;
    return Response.json({ sessions: (data ?? []).map(mapSession) });
  } catch (e) {
    if (e instanceof UnauthorizedError) return unauthorizedResponse();
    return fromError(e);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    const parsed = CreateSessionSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? 'Invalid input', 400);
    const input = parsed.data;
    const { data: session, error } = await supabase
      .from('sessions')
      .insert({
        user_id: user.id,
        started_at: input.startedAt ?? new Date().toISOString(),
        duration_min: input.durationMin,
        notes: input.notes ?? null,
      })
      .select('id, started_at, duration_min, notes')
      .single();
    if (error || !session) throw error ?? new Error('Insert failed');

    if (input.trickIds.length > 0) {
      const rows = input.trickIds.map((trick_id) => ({ session_id: session.id, trick_id }));
      const { error: stErr } = await supabase.from('session_tricks').insert(rows);
      if (stErr) throw stErr;
    }

    return Response.json({
      session: mapSession({ ...session, session_tricks: input.trickIds.map((trick_id) => ({ trick_id })) }),
    }, { status: 201 });
  } catch (e) {
    if (e instanceof UnauthorizedError) return unauthorizedResponse();
    return fromError(e);
  }
}
