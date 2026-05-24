import type { Combo, Note, Session, Trick, TrickStatus, TrickWithStatus } from '@/types';
import * as L from '@/lib/localStore';

interface ReqOptions {
  method?: string;
  body?: unknown;
  signal?: AbortSignal;
}

async function req<T>(path: string, { method = 'GET', body, signal }: ReqOptions = {}): Promise<T> {
  const res = await fetch(`/api${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
    signal,
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({ error: res.statusText }))) as { error?: string };
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

// AuthProvider flips this whenever the Supabase session changes. When false,
// every user-data method routes to localStorage instead of the network — that
// keeps guests fully functional and avoids touching every hook downstream.
let _signedIn = false;
export function setSignedIn(b: boolean): void { _signedIn = b; }
export const isGuest = (): boolean => !_signedIn;

interface CreateTrickBody {
  name: string;
  description?: string;
  difficulty: number;
  category: string;
  videoUrl?: string;
  isPublic?: boolean;
}

interface CreateSessionBody {
  startedAt?: string;
  durationMin: number;
  notes?: string;
  trickIds: string[];
}

interface CreateComboBody {
  name: string;
  notes?: string;
  trickIds: string[];
}

export const api = {
  // Tricks — public catalog, anon read allowed server-side. Guest status is
  // layered locally on top of the server response.
  listTricks: async () => {
    const { tricks } = await req<{ tricks: TrickWithStatus[] }>('/tricks');
    return { tricks: isGuest() ? L.applyLocalStatus(tricks) : tricks };
  },
  getTrick: async (slug: string) => {
    const { trick } = await req<{ trick: TrickWithStatus }>(`/tricks/${encodeURIComponent(slug)}`);
    if (!isGuest()) return { trick };
    return { trick: L.applyLocalStatus([trick])[0] };
  },
  createTrick: (body: CreateTrickBody) => req<{ trick: Trick }>('/tricks', { method: 'POST', body }),
  updateTrick: (id: string, body: Partial<CreateTrickBody>) =>
    req<{ trick: Trick }>(`/tricks/${id}`, { method: 'PATCH', body }),
  deleteTrick: (id: string) => req<{ ok: true }>(`/tricks/${id}`, { method: 'DELETE' }),
  setTrickStatus: async (id: string, status: TrickStatus, notes?: string) => {
    if (isGuest()) { L.setLocalStatus(id, status, notes); return { ok: true as const }; }
    return req<{ ok: true }>(`/tricks/${id}/status`, { method: 'PUT', body: { status, notes } });
  },

  listSessions: async () => {
    if (isGuest()) return { sessions: L.listLocalSessions() };
    return req<{ sessions: Session[] }>('/sessions');
  },
  getSession: async (id: string) => {
    if (isGuest()) {
      const session = L.getLocalSession(id);
      if (!session) throw new Error('Session not found');
      return { session };
    }
    return req<{ session: Session }>(`/sessions/${id}`);
  },
  createSession: async (body: CreateSessionBody) => {
    if (isGuest()) return { session: L.createLocalSession(body) };
    return req<{ session: Session }>('/sessions', { method: 'POST', body });
  },
  updateSession: async (id: string, body: Partial<CreateSessionBody>) => {
    if (isGuest()) {
      const session = L.updateLocalSession(id, body);
      if (!session) throw new Error('Session not found');
      return { session };
    }
    return req<{ session: Session }>(`/sessions/${id}`, { method: 'PATCH', body });
  },
  deleteSession: async (id: string) => {
    if (isGuest()) { L.deleteLocalSession(id); return { ok: true as const }; }
    return req<{ ok: true }>(`/sessions/${id}`, { method: 'DELETE' });
  },

  listNotes: async () => {
    if (isGuest()) return { notes: L.listLocalNotes() };
    return req<{ notes: Note[] }>('/notes');
  },
  createNote: async (body: string) => {
    if (isGuest()) return { note: L.createLocalNote(body) };
    return req<{ note: Note }>('/notes', { method: 'POST', body: { body } });
  },
  deleteNote: async (id: string) => {
    if (isGuest()) { L.deleteLocalNote(id); return { ok: true as const }; }
    return req<{ ok: true }>(`/notes/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },

  listCombos: async () => {
    if (isGuest()) return { combos: L.listLocalCombos() };
    return req<{ combos: Combo[] }>('/combos');
  },
  getCombo: async (id: string) => {
    if (isGuest()) {
      const combo = L.getLocalCombo(id);
      if (!combo) throw new Error('Combo not found');
      return { combo };
    }
    return req<{ combo: Combo }>(`/combos/${id}`);
  },
  createCombo: async (body: CreateComboBody) => {
    if (isGuest()) return { combo: L.createLocalCombo(body) };
    return req<{ combo: Combo }>('/combos', { method: 'POST', body });
  },
  updateCombo: async (id: string, body: Partial<CreateComboBody>) => {
    if (isGuest()) {
      const combo = L.updateLocalCombo(id, body);
      if (!combo) throw new Error('Combo not found');
      return { combo };
    }
    return req<{ combo: Combo }>(`/combos/${id}`, { method: 'PATCH', body });
  },
  deleteCombo: async (id: string) => {
    if (isGuest()) { L.deleteLocalCombo(id); return { ok: true as const }; }
    return req<{ ok: true }>(`/combos/${id}`, { method: 'DELETE' });
  },
};
