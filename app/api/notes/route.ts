import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { fromError, jsonError, requireUser, UnauthorizedError, unauthorizedResponse } from '@/lib/auth';
import type { Note } from '@/types';

const CreateNoteSchema = z.object({
  body: z.string().min(1).max(8000),
});

interface NoteRow {
  id: string;
  body: string;
  created_at: string;
}

function mapNote(row: NoteRow): Note {
  return { id: row.id, body: row.body, createdAt: row.created_at };
}

export async function GET() {
  try {
    const { supabase } = await requireUser();
    const { data, error } = await supabase
      .from('notes')
      .select('id, body, created_at')
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) throw error;
    return Response.json({ notes: (data ?? []).map(mapNote) });
  } catch (e) {
    if (e instanceof UnauthorizedError) return unauthorizedResponse();
    return fromError(e);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    const parsed = CreateNoteSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? 'Invalid input', 400);
    const { data, error } = await supabase
      .from('notes')
      .insert({ user_id: user.id, body: parsed.data.body })
      .select('id, body, created_at')
      .single();
    if (error) throw error;
    return Response.json({ note: mapNote(data) }, { status: 201 });
  } catch (e) {
    if (e instanceof UnauthorizedError) return unauthorizedResponse();
    return fromError(e);
  }
}
