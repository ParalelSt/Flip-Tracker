import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { fromError, jsonError, requireUser, UnauthorizedError, unauthorizedResponse } from '@/lib/auth';
import { TRICK_STATUSES } from '@/types';

const StatusSchema = z.object({
  status: z.enum(TRICK_STATUSES),
  notes: z.string().max(4000).nullable().optional(),
});

async function resolveTrickId(supabase: Awaited<ReturnType<typeof import('@/lib/supabase/server').createClient>>, idOrSlug: string): Promise<string | null> {
  if (/^[0-9a-f-]{36}$/i.test(idOrSlug)) return idOrSlug;
  const { data } = await supabase.from('tricks').select('id').eq('slug', idOrSlug).maybeSingle();
  return data?.id ?? null;
}

export async function PUT(request: NextRequest, ctx: RouteContext<'/api/tricks/[id]/status'>) {
  try {
    const { supabase, user } = await requireUser();
    const { id } = await ctx.params;
    const parsed = StatusSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? 'Invalid input', 400);
    const trickId = await resolveTrickId(supabase, id);
    if (!trickId) return jsonError('Trick not found', 404);
    const { error } = await supabase
      .from('user_trick_status')
      .upsert({
        user_id: user.id,
        trick_id: trickId,
        status: parsed.data.status,
        notes: parsed.data.notes ?? null,
        updated_at: new Date().toISOString(),
      });
    if (error) throw error;
    return Response.json({ ok: true });
  } catch (e) {
    if (e instanceof UnauthorizedError) return unauthorizedResponse();
    return fromError(e);
  }
}
