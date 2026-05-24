'use client';

import { snapshotLocal, wipeLocal, hasLocalData } from './localStore';

/** Push everything in localStorage up to the user's Supabase account, then
 *  wipe the local copy. Called from AuthProvider right after a SIGNED_IN
 *  event. Errors are swallowed per-entity so one bad row doesn't strand the
 *  rest; the user can re-attempt by signing out + in again.
 *
 *  Merge policy: append (local rows are added alongside any server rows the
 *  user already has). Trick statuses upsert — the server-side handler keeps
 *  the row freshly stamped. */
export async function migrateLocalToServer(): Promise<{ migrated: number; failed: number }> {
  if (!hasLocalData()) return { migrated: 0, failed: 0 };
  const snap = snapshotLocal();
  let migrated = 0;
  let failed = 0;

  const post = async (path: string, body: unknown) => {
    const res = await fetch(`/api${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await res.text());
  };
  const put = async (path: string, body: unknown) => {
    const res = await fetch(`/api${path}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await res.text());
  };

  // Status — one PUT per trick that has a local status row.
  for (const [trickId, row] of Object.entries(snap.status)) {
    try {
      await put(`/tricks/${trickId}/status`, { status: row.status, notes: row.notes });
      migrated++;
    } catch { failed++; }
  }

  // Sessions — POST each. Server picks its own id; the local one is dropped.
  for (const s of snap.sessions) {
    try {
      await post('/sessions', {
        startedAt: s.startedAt,
        durationMin: s.durationMin,
        notes: s.notes ?? undefined,
        trickIds: s.trickIds,
      });
      migrated++;
    } catch { failed++; }
  }

  // Combos — POST each.
  for (const c of snap.combos) {
    try {
      await post('/combos', { name: c.name, notes: c.notes ?? undefined, trickIds: c.trickIds });
      migrated++;
    } catch { failed++; }
  }

  // Notes — POST each.
  for (const n of snap.notes) {
    try {
      await post('/notes', { body: n.body });
      migrated++;
    } catch { failed++; }
  }

  if (failed === 0) wipeLocal();
  return { migrated, failed };
}
