-- Migration: let guests (unauthenticated) read the public trick library so
-- the app works without an account. Per-user tables (status / sessions /
-- combos / notes) stay locked to their owners — guests use localStorage.
-- Idempotent.

drop policy if exists "tricks visible" on tricks;
create policy "tricks visible" on tricks
  for select to anon, authenticated
  using (is_public or created_by = auth.uid());
