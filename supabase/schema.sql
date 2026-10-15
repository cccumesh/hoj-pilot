-- Axerai Richera — schema reference only.
-- Shared Supabase (axerai-love): run supabase/richera_fresh_start.sql
-- Do NOT run supabase/fresh_start.sql — it drops ledger_threads.

create table if not exists public.richera_ledger_threads (
  id uuid primary key default gen_random_uuid(),
  verification_code text not null,
  device_id text not null default '',
  role text not null check (role in ('sender', 'receiver')),
  scan_count int not null default 0,
  conversation text not null default '',
  session_summaries text not null default '',
  axerai_ai_usage text not null default '',
  axerai_voice_usage text not null default '',
  unique (verification_code, role)
);

create index if not exists idx_richera_ledger_threads_code
  on public.richera_ledger_threads (verification_code);

alter table public.richera_ledger_threads enable row level security;

drop policy if exists "anon insert richera_ledger_threads" on public.richera_ledger_threads;
drop policy if exists "anon select richera_ledger_threads" on public.richera_ledger_threads;
drop policy if exists "anon update richera_ledger_threads" on public.richera_ledger_threads;

create policy "anon insert richera_ledger_threads"
  on public.richera_ledger_threads for insert to anon with check (true);
create policy "anon select richera_ledger_threads"
  on public.richera_ledger_threads for select to anon using (true);
create policy "anon update richera_ledger_threads"
  on public.richera_ledger_threads for update to anon using (true) with check (true);
