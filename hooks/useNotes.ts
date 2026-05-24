'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

const KEY = ['notes'] as const;

export function useQueryNotes() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => api.listNotes().then((r) => r.notes),
  });
}

export function useExecuteCreateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => api.createNote(body).then((r) => r.note),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useExecuteDeleteNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteNote(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
