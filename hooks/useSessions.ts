'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { QK } from './useTricks';

const sessionKey = (id: string) => ['session', id] as const;

export function useQuerySessions() {
  return useQuery({
    queryKey: QK.sessions,
    queryFn: () => api.listSessions().then((r) => r.sessions),
  });
}

export function useQuerySession(id: string) {
  return useQuery({
    queryKey: sessionKey(id),
    queryFn: () => api.getSession(id).then((r) => r.session),
    enabled: !!id,
  });
}

interface UpdateSessionVars {
  id: string;
  body: Partial<{ startedAt: string; durationMin: number; notes?: string; trickIds: string[] }>;
}

export function useExecuteUpdateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: UpdateSessionVars) => api.updateSession(id, body).then((r) => r.session),
    onSuccess: (_d, { id }) => {
      qc.invalidateQueries({ queryKey: QK.sessions });
      qc.invalidateQueries({ queryKey: sessionKey(id) });
    },
  });
}

interface CreateSessionVars {
  startedAt?: string;
  durationMin: number;
  notes?: string;
  trickIds: string[];
}

export function useExecuteCreateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateSessionVars) => api.createSession(body).then((r) => r.session),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.sessions }),
  });
}

export function useExecuteDeleteSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteSession(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.sessions }),
  });
}
