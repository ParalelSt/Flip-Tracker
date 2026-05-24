import type { NextRequest } from 'next/server';
import { fromError, requireUser, UnauthorizedError, unauthorizedResponse } from '@/lib/auth';

export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/notes/[id]'>) {
  try {
    const { supabase } = await requireUser();
    const { id } = await ctx.params;
    const { error } = await supabase.from('notes').delete().eq('id', id);
    if (error) throw error;
    return Response.json({ ok: true });
  } catch (e) {
    if (e instanceof UnauthorizedError) return unauthorizedResponse();
    return fromError(e);
  }
}
