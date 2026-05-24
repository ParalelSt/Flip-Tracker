'use client';

import type { Combo, Note, Session, TrickStatus, TrickWithStatus } from '@/types';

/** localStorage-backed mirror of the server data — used when the user is in
 *  guest mode. Keys are scoped under `flip.local.*` so they're easy to spot
 *  and wipe. Each helper is synchronous and JSON-serialized. */

const KEYS = {
  status: 'flip.local.status',
  sessions: 'flip.local.sessions',
  combos: 'flip.local.combos',
  notes: 'flip.local.notes',
} as const;

interface StatusRow {
  status: TrickStatus;
  notes: string | null;
  updatedAt: string;
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch { /* quota / disabled — ignore */ }
}

// --- STATUS ----------------------------------------------------------------
type StatusMap = Record<string, StatusRow>;

function readStatusMap(): StatusMap {
  return read<StatusMap>(KEYS.status, {});
}

/** Merge per-user status into a tricks list pulled from the server. */
export function applyLocalStatus(tricks: TrickWithStatus[]): TrickWithStatus[] {
  const map = readStatusMap();
  return tricks.map((t) => {
    const s = map[t.id];
    if (!s) return t;
    return { ...t, status: s.status, notes: s.notes, updatedAt: s.updatedAt };
  });
}

export function setLocalStatus(trickId: string, status: TrickStatus, notes?: string | null) {
  const map = readStatusMap();
  map[trickId] = {
    status,
    notes: notes ?? map[trickId]?.notes ?? null,
    updatedAt: new Date().toISOString(),
  };
  write(KEYS.status, map);
}

// --- SESSIONS --------------------------------------------------------------
export function listLocalSessions(): Session[] {
  return read<Session[]>(KEYS.sessions, []).slice().sort((a, b) =>
    a.startedAt < b.startedAt ? 1 : -1,
  );
}

export function getLocalSession(id: string): Session | null {
  return listLocalSessions().find((s) => s.id === id) ?? null;
}

export function createLocalSession(body: { durationMin: number; notes?: string; trickIds: string[] }): Session {
  const session: Session = {
    id: crypto.randomUUID(),
    startedAt: new Date().toISOString(),
    durationMin: body.durationMin,
    notes: body.notes ?? null,
    trickIds: body.trickIds,
  };
  write(KEYS.sessions, [session, ...read<Session[]>(KEYS.sessions, [])]);
  return session;
}

export function updateLocalSession(id: string, patch: Partial<Pick<Session, 'durationMin' | 'notes' | 'trickIds'>>): Session | null {
  const all = read<Session[]>(KEYS.sessions, []);
  const next = all.map((s) => (s.id === id ? { ...s, ...patch, notes: patch.notes ?? s.notes } : s));
  write(KEYS.sessions, next);
  return next.find((s) => s.id === id) ?? null;
}

export function deleteLocalSession(id: string): void {
  write(KEYS.sessions, read<Session[]>(KEYS.sessions, []).filter((s) => s.id !== id));
}

// --- COMBOS ----------------------------------------------------------------
export function listLocalCombos(): Combo[] {
  return read<Combo[]>(KEYS.combos, []).slice().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function getLocalCombo(id: string): Combo | null {
  return listLocalCombos().find((c) => c.id === id) ?? null;
}

export function createLocalCombo(body: { name: string; notes?: string; trickIds: string[] }): Combo {
  const combo: Combo = {
    id: crypto.randomUUID(),
    name: body.name,
    notes: body.notes ?? null,
    trickIds: body.trickIds,
    createdAt: new Date().toISOString(),
  };
  write(KEYS.combos, [combo, ...read<Combo[]>(KEYS.combos, [])]);
  return combo;
}

export function updateLocalCombo(id: string, patch: Partial<Pick<Combo, 'name' | 'notes' | 'trickIds'>>): Combo | null {
  const all = read<Combo[]>(KEYS.combos, []);
  const next = all.map((c) => (c.id === id ? { ...c, ...patch, notes: patch.notes ?? c.notes } : c));
  write(KEYS.combos, next);
  return next.find((c) => c.id === id) ?? null;
}

export function deleteLocalCombo(id: string): void {
  write(KEYS.combos, read<Combo[]>(KEYS.combos, []).filter((c) => c.id !== id));
}

// --- NOTES -----------------------------------------------------------------
export function listLocalNotes(): Note[] {
  return read<Note[]>(KEYS.notes, []).slice().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function createLocalNote(body: string): Note {
  const note: Note = { id: crypto.randomUUID(), body, createdAt: new Date().toISOString() };
  write(KEYS.notes, [note, ...read<Note[]>(KEYS.notes, [])]);
  return note;
}

export function deleteLocalNote(id: string): void {
  write(KEYS.notes, read<Note[]>(KEYS.notes, []).filter((n) => n.id !== id));
}

// --- ALL / WIPE ------------------------------------------------------------
export function snapshotLocal() {
  return {
    status: readStatusMap(),
    sessions: read<Session[]>(KEYS.sessions, []),
    combos: read<Combo[]>(KEYS.combos, []),
    notes: read<Note[]>(KEYS.notes, []),
  };
}

export function hasLocalData(): boolean {
  const s = snapshotLocal();
  return (
    Object.keys(s.status).length > 0 ||
    s.sessions.length > 0 ||
    s.combos.length > 0 ||
    s.notes.length > 0
  );
}

export function wipeLocal(): void {
  if (typeof window === 'undefined') return;
  for (const k of Object.values(KEYS)) window.localStorage.removeItem(k);
}
