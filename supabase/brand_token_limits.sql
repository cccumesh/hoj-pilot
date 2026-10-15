-- =============================================================================
-- BRAND TOKEN LIMITS — authoritative pools (read-only from app)
-- =============================================================================
-- Run once in Supabase SQL Editor AFTER pilot_fresh_start.sql
-- Limits yahan set hongi — browser / dashboard se change NAHI ho sakti.
-- Usage ledger_threads ke numeric counters se count hota hai.
-- =============================================================================

alter table public.ledger_threads
  add column if not exists axerai_ai_used_total bigint not null default 0;

alter table public.ledger_threads
  add column if not exists axerai_voice_used_total bigint not null default 0;

create table if not exists public.brand_token_limits (
  brand_slug text primary key
    references public.brand_accounts (brand_slug) on delete cascade,
  axerai_ai_pool bigint not null check (axerai_ai_pool >= 0),
  axerai_voice_pool bigint not null check (axerai_voice_pool >= 0),
  per_code_ai_cap bigint not null default 1000000 check (per_code_ai_cap >= 0),
  per_code_voice_cap bigint not null default 15000 check (per_code_voice_cap >= 0),
  locked_at timestamptz not null default now()
);

-- Seed from brand_accounts if empty (101M AI + 1.515M voice pilot)
insert into public.brand_token_limits (
  brand_slug,
  axerai_ai_pool,
  axerai_voice_pool,
  per_code_ai_cap,
  per_code_voice_cap
)
select
  brand_slug,
  axerai_ai_balance,
  axerai_voice_balance,
  per_code_ai_budget,
  per_code_voice_budget
from public.brand_accounts
on conflict (brand_slug) do nothing;

create or replace view public.brand_wallet_snapshot as
select
  l.brand_slug,
  l.axerai_ai_pool,
  l.axerai_voice_pool,
  l.per_code_ai_cap,
  l.per_code_voice_cap,
  coalesce(sum(t.axerai_ai_used_total), 0)::bigint as axerai_ai_used,
  coalesce(sum(t.axerai_voice_used_total), 0)::bigint as axerai_voice_used,
  greatest(l.axerai_ai_pool - coalesce(sum(t.axerai_ai_used_total), 0), 0)::bigint
    as axerai_ai_remaining,
  greatest(l.axerai_voice_pool - coalesce(sum(t.axerai_voice_used_total), 0), 0)::bigint
    as axerai_voice_remaining
from public.brand_token_limits l
left join public.ledger_threads t on t.brand_slug = l.brand_slug
group by
  l.brand_slug,
  l.axerai_ai_pool,
  l.axerai_voice_pool,
  l.per_code_ai_cap,
  l.per_code_voice_cap;

alter table public.brand_token_limits enable row level security;

drop policy if exists "anon select brand_token_limits" on public.brand_token_limits;
drop policy if exists "anon update brand_accounts" on public.brand_accounts;

create policy "anon select brand_token_limits"
  on public.brand_token_limits for select to anon using (true);

-- brand_accounts: sirf update policy hatao — select pehle se hai to dubara mat banao

grant select on public.brand_wallet_snapshot to anon, authenticated;

-- Per-code budget columns on ledger rows cannot be tampered via API updates
create or replace function public.ledger_threads_lock_budgets()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' then
    new.axerai_ai_budget := old.axerai_ai_budget;
    new.axerai_voice_budget := old.axerai_voice_budget;
    if new.axerai_ai_used_total < old.axerai_ai_used_total then
      new.axerai_ai_used_total := old.axerai_ai_used_total;
    end if;
    if new.axerai_voice_used_total < old.axerai_voice_used_total then
      new.axerai_voice_used_total := old.axerai_voice_used_total;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_ledger_threads_lock_budgets on public.ledger_threads;
create trigger trg_ledger_threads_lock_budgets
  before update on public.ledger_threads
  for each row
  execute function public.ledger_threads_lock_budgets();

select brand_slug, axerai_ai_pool, axerai_voice_pool from public.brand_token_limits;
select * from public.brand_wallet_snapshot;
