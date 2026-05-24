'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { TrickStatus, TrickWithStatus } from '@/types';

export const QK = {
  tricks: ['tricks'] as const,
  trick: (slugOrId: string) => ['trick', slugOrId] as const,
  sessions: ['sessions'] as const,
  combos: ['combos'] as const,
  combo: (id: string) => ['combo', id] as const,
};

export function useQueryTricks() {
  // No `enabled: !!user` — guests use the same query, the API layer routes to
  // localStorage when no session is present.
  return useQuery({
    queryKey: QK.tricks,
    queryFn: () => api.listTricks().then((r) => r.tricks),
  });
}

export function useQueryTrick(slugOrId: string) {
  return useQuery({
    queryKey: QK.trick(slugOrId),
    queryFn: () => api.getTrick(slugOrId).then((r) => r.trick),
    enabled: !!slugOrId,
  });
}

interface SetStatusVars {
  id: string;
  slug: string;
  status: TrickStatus;
  notes?: string;
}

export function useExecuteSetTrickStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, notes }: SetStatusVars) => api.setTrickStatus(id, status, notes),
    onMutate: async ({ id, slug, status, notes }) => {
      await qc.cancelQueries({ queryKey: QK.tricks });
      const prevList = qc.getQueryData<TrickWithStatus[]>(QK.tricks);
      if (prevList) {
        qc.setQueryData<TrickWithStatus[]>(
          QK.tricks,
          prevList.map((t) =>
            t.id === id ? { ...t, status, notes: notes ?? t.notes, updatedAt: new Date().toISOString() } : t,
          ),
        );
      }
      const prevDetail = qc.getQueryData<TrickWithStatus>(QK.trick(slug));
      if (prevDetail) {
        qc.setQueryData<TrickWithStatus>(QK.trick(slug), {
          ...prevDetail,
          status,
          notes: notes ?? prevDetail.notes,
          updatedAt: new Date().toISOString(),
        });
      }
      return { prevList, prevDetail };
    },
    onError: (_e, vars, ctx) => {
      if (ctx?.prevList) qc.setQueryData(QK.tricks, ctx.prevList);
      if (ctx?.prevDetail) qc.setQueryData(QK.trick(vars.slug), ctx.prevDetail);
    },
    onSettled: (_d, _e, vars) => {
      qc.invalidateQueries({ queryKey: QK.tricks });
      qc.invalidateQueries({ queryKey: QK.trick(vars.slug) });
    },
  });
}

interface CreateTrickVars {
  name: string;
  description?: string;
  difficulty: number;
  category: string;
  videoUrl?: string;
  isPublic?: boolean;
}

export function useExecuteCreateTrick() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateTrickVars) => api.createTrick(body).then((r) => r.trick),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.tricks }),
  });
}

export function useExecuteDeleteTrick() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteTrick(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.tricks }),
  });
}
