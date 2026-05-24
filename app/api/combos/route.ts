import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { fromError, jsonError, requireUser, UnauthorizedError, unauthorizedResponse } from '@/lib/auth';
import { mapCombo } from '@/lib/mapRow';

const CreateComboSchema = z.object({
  name: z.string().min(1).max(120),
  notes: z.string().max(4000).optional().nullable(),
  trickIds: z.array(z.string().uuid()).max(50),
});

export async function GET() {
  try {
    const { supabase } = await requireUser();
    const { data, error } = await supabase
      .from('combos')
      .select('id, name, notes, created_at, combo_tricks(trick_id, position)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return Response.json({ combos: (data ?? []).map(mapCombo) });
  } catch (e) {
    if (e instanceof UnauthorizedError) return unauthorizedResponse();
    return fromError(e);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    const parsed = CreateComboSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? 'Invalid input', 400);
    const input = parsed.data;
    const { data: combo, error } = await supabase
      .from('combos')
      .insert({ user_id: user.id, name: input.name, notes: input.notes ?? null })
      .select('id, name, notes, created_at')
      .single();
    if (error || !combo) throw error ?? new Error('Insert failed');

    if (input.trickIds.length > 0) {
      const rows = input.trickIds.map((trick_id, position) => ({ combo_id: combo.id, trick_id, position }));
      const { error: ctErr } = await supabase.from('combo_tricks').insert(rows);
      if (ctErr) throw ctErr;
    }

    return Response.json({
      combo: mapCombo({
        ...combo,
        combo_tricks: input.trickIds.map((trick_id, position) => ({ trick_id, position })),
      }),
    }, { status: 201 });
  } catch (e) {
    if (e instanceof UnauthorizedError) return unauthorizedResponse();
    return fromError(e);
  }
}
