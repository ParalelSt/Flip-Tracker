import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { fromError, jsonError, requireUser, UnauthorizedError, unauthorizedResponse } from '@/lib/auth';
import { mapCombo } from '@/lib/mapRow';

const UpdateComboSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  notes: z.string().max(4000).nullable().optional(),
  trickIds: z.array(z.string().uuid()).max(50).optional(),
});

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/combos/[id]'>) {
  try {
    const { supabase } = await requireUser();
    const { id } = await ctx.params;
    const { data, error } = await supabase
      .from('combos')
      .select('id, name, notes, created_at, combo_tricks(trick_id, position)')
      .eq('id', id)
      .single();
    if (error || !data) return jsonError('Combo not found', 404);
    return Response.json({ combo: mapCombo(data) });
  } catch (e) {
    if (e instanceof UnauthorizedError) return unauthorizedResponse();
    return fromError(e);
  }
}

export async function PATCH(request: NextRequest, ctx: RouteContext<'/api/combos/[id]'>) {
  try {
    const { supabase } = await requireUser();
    const { id } = await ctx.params;
    const parsed = UpdateComboSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? 'Invalid input', 400);
    const input = parsed.data;

    const updates: Record<string, unknown> = {};
    if (input.name !== undefined) updates.name = input.name;
    if (input.notes !== undefined) updates.notes = input.notes;
    if (Object.keys(updates).length) {
      const { error } = await supabase.from('combos').update(updates).eq('id', id);
      if (error) throw error;
    }

    if (input.trickIds !== undefined) {
      // Replace the trick sequence in one transaction-ish flow: delete then
      // re-insert in the new order. Atomicity isn't critical for personal use.
      const { error: delErr } = await supabase.from('combo_tricks').delete().eq('combo_id', id);
      if (delErr) throw delErr;
      if (input.trickIds.length > 0) {
        const rows = input.trickIds.map((trick_id, position) => ({ combo_id: id, trick_id, position }));
        const { error: insErr } = await supabase.from('combo_tricks').insert(rows);
        if (insErr) throw insErr;
      }
    }

    const { data, error: fetchErr } = await supabase
      .from('combos')
      .select('id, name, notes, created_at, combo_tricks(trick_id, position)')
      .eq('id', id)
      .single();
    if (fetchErr || !data) throw fetchErr ?? new Error('Not found');
    return Response.json({ combo: mapCombo(data) });
  } catch (e) {
    if (e instanceof UnauthorizedError) return unauthorizedResponse();
    return fromError(e);
  }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/combos/[id]'>) {
  try {
    const { supabase } = await requireUser();
    const { id } = await ctx.params;
    const { error } = await supabase.from('combos').delete().eq('id', id);
    if (error) throw error;
    return Response.json({ ok: true });
  } catch (e) {
    if (e instanceof UnauthorizedError) return unauthorizedResponse();
    return fromError(e);
  }
}
