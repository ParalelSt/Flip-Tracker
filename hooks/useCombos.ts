'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { QK } from './useTricks';

export function useQueryCombos() {
  return useQuery({
    queryKey: QK.combos,
    queryFn: () => api.listCombos().then((r) => r.combos),
  });
}

export function useQueryCombo(id: string) {
  return useQuery({
    queryKey: QK.combo(id),
    queryFn: () => api.getCombo(id).then((r) => r.combo),
    enabled: !!id,
  });
}

interface CreateComboVars {
  name: string;
  notes?: string;
  trickIds: string[];
}

export function useExecuteCreateCombo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateComboVars) => api.createCombo(body).then((r) => r.combo),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.combos }),
  });
}

interface UpdateComboVars {
  id: string;
  body: Partial<CreateComboVars>;
}

export function useExecuteUpdateCombo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: UpdateComboVars) => api.updateCombo(id, body).then((r) => r.combo),
    onSuccess: (_d, { id }) => {
      qc.invalidateQueries({ queryKey: QK.combos });
      qc.invalidateQueries({ queryKey: QK.combo(id) });
    },
  });
}

export function useExecuteDeleteCombo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteCombo(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.combos }),
  });
}
