-- =============================================================================
-- AKXERAI PILOT — FULL FRESH (legacy — 3 tables DROP)
-- Generated: node scripts/generate-pilot-fresh-start.mjs
-- Prefer: supabase/ledger_threads_fresh_start.sql (sirf ledger wipe).
-- =============================================================================
--
-- ⚠️  DROP: brand_accounts, brand_token_limits, ledger_threads
-- ❌ axera_ledger_threads — touch NAHI
--
-- =============================================================================

drop view if exists public.brand_wallet_snapshot cascade;

drop table if exists public.ledger_threads cascade;
drop table if exists public.brand_token_limits cascade;
drop table if exists public.brand_accounts cascade;
drop function if exists public.random_hoj_suffix() cascade;
drop function if exists public.ledger_threads_lock_budgets() cascade;

create table public.brand_accounts (
  brand_slug text primary key,
  brand_label text not null default '',
  axerai_ai_balance bigint not null default 0,
  axerai_voice_balance bigint not null default 0,
  per_code_ai_budget bigint not null default 1000000,
  per_code_voice_budget bigint not null default 15000,
  account_mode text not null default 'trial'
    check (account_mode in ('trial', 'prepaid', 'suspended')),
  codes_allocated int not null default 0,
  created_at timestamptz not null default now()
);

create table public.brand_token_limits (
  brand_slug text primary key
    references public.brand_accounts (brand_slug) on delete cascade,
  axerai_ai_pool bigint not null check (axerai_ai_pool >= 0),
  axerai_voice_pool bigint not null check (axerai_voice_pool >= 0),
  per_code_ai_cap bigint not null default 1000000 check (per_code_ai_cap >= 0),
  per_code_voice_cap bigint not null default 15000 check (per_code_voice_cap >= 0),
  locked_at timestamptz not null default now()
);


create table public.ledger_threads (
  code_no int not null default 0,
  verification_code text not null,
  role text not null check (role in ('sender', 'receiver')),
  scan_count int not null default 0,
  conversation text not null default '',
  session_summaries text not null default '',
  age_category text not null default '',
  ledger_insights text not null default '', -- insight:kind|detail|ISO8601
  axerai_ai_usage text not null default '',
  axerai_voice_usage text not null default '',
  axerai_ai_used_total bigint not null default 0,
  axerai_voice_used_total bigint not null default 0,
  brand_label text not null default '',
  brand_slug text not null default 'house-of-jewels',
  status text not null default 'active'
    check (status in ('active', 'expired', 'disabled')),
  axerai_ai_budget bigint not null default 1000000,
  axerai_voice_budget bigint not null default 15000,
  id bigserial primary key,
  device_id text not null default '',
  row_seq int not null,
  total_codes int not null default 0,
  unique (verification_code, role),
  unique (row_seq)
);


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


create index idx_ledger_threads_code on public.ledger_threads (verification_code);
create index idx_ledger_threads_code_no on public.ledger_threads (code_no);
create index idx_ledger_threads_row_seq on public.ledger_threads (row_seq);
create index idx_ledger_threads_status on public.ledger_threads (status);
create index idx_ledger_threads_brand on public.ledger_threads (brand_slug);

alter table public.brand_accounts enable row level security;
alter table public.brand_token_limits enable row level security;
alter table public.ledger_threads enable row level security;

drop policy if exists "anon select brand_accounts" on public.brand_accounts;
drop policy if exists "anon update brand_accounts" on public.brand_accounts;
drop policy if exists "anon select brand_token_limits" on public.brand_token_limits;
drop policy if exists "anon insert ledger_threads" on public.ledger_threads;
drop policy if exists "anon select ledger_threads" on public.ledger_threads;
drop policy if exists "anon update ledger_threads" on public.ledger_threads;

create policy "anon select brand_accounts"
  on public.brand_accounts for select to anon using (true);

create policy "anon select brand_token_limits"
  on public.brand_token_limits for select to anon using (true);

create policy "anon insert ledger_threads"
  on public.ledger_threads for insert to anon with check (true);

create policy "anon select ledger_threads"
  on public.ledger_threads for select to anon using (true);

create policy "anon update ledger_threads"
  on public.ledger_threads for update to anon using (true) with check (true);

grant select on public.brand_wallet_snapshot to anon, authenticated;


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


insert into public.brand_accounts (
  brand_slug, brand_label, axerai_ai_balance, axerai_voice_balance,
  per_code_ai_budget, per_code_voice_budget, account_mode, codes_allocated
)
values (
  'house-of-jewels',
  'House of Jewels Pilot',
  101000000,
  1515000,
  1000000,
  15000,
  'trial',
  101
);

insert into public.brand_token_limits (
  brand_slug, axerai_ai_pool, axerai_voice_pool, per_code_ai_cap, per_code_voice_cap
)
values (
  'house-of-jewels',
  101000000,
  1515000,
  1000000,
  15000
);


insert into public.ledger_threads (
  code_no, verification_code, role, scan_count, conversation,
  session_summaries, axerai_ai_usage, axerai_voice_usage,
  brand_label, brand_slug, status, axerai_ai_budget, axerai_voice_budget,
  device_id, row_seq, total_codes
)
values

  (0, 'HOJ-KOTTY', 'sender', 0, '', '', '', '', 'Kotty Test Card', 'house-of-jewels', 'active', 1000000, 15000, '', 1, 101),
  (0, 'HOJ-KOTTY', 'receiver', 0, '', '', '', '', 'Kotty Test Card', 'house-of-jewels', 'active', 1000000, 15000, '', 2, 101),
  (1, 'HOJ-Y749E8', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 3, 101),
  (1, 'HOJ-Y749E8', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 4, 101),
  (2, 'HOJ-N96143', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 5, 101),
  (2, 'HOJ-N96143', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 6, 101),
  (3, 'HOJ-06Q681', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 7, 101),
  (3, 'HOJ-06Q681', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 8, 101),
  (4, 'HOJ-A860H8', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 9, 101),
  (4, 'HOJ-A860H8', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 10, 101),
  (5, 'HOJ-37L8G6', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 11, 101),
  (5, 'HOJ-37L8G6', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 12, 101),
  (6, 'HOJ-7Z8520', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 13, 101),
  (6, 'HOJ-7Z8520', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 14, 101),
  (7, 'HOJ-71893N', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 15, 101),
  (7, 'HOJ-71893N', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 16, 101),
  (8, 'HOJ-53E89I', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 17, 101),
  (8, 'HOJ-53E89I', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 18, 101),
  (9, 'HOJ-315Y5B', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 19, 101),
  (9, 'HOJ-315Y5B', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 20, 101),
  (10, 'HOJ-411N89', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 21, 101),
  (10, 'HOJ-411N89', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 22, 101),
  (11, 'HOJ-0V1780', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 23, 101),
  (11, 'HOJ-0V1780', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 24, 101),
  (12, 'HOJ-5R3147', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 25, 101),
  (12, 'HOJ-5R3147', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 26, 101),
  (13, 'HOJ-B2156P', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 27, 101),
  (13, 'HOJ-B2156P', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 28, 101),
  (14, 'HOJ-10121O', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 29, 101),
  (14, 'HOJ-10121O', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 30, 101),
  (15, 'HOJ-755V47', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 31, 101),
  (15, 'HOJ-755V47', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 32, 101),
  (16, 'HOJ-237F4N', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 33, 101),
  (16, 'HOJ-237F4N', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 34, 101),
  (17, 'HOJ-97T530', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 35, 101),
  (17, 'HOJ-97T530', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 36, 101),
  (18, 'HOJ-X82569', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 37, 101),
  (18, 'HOJ-X82569', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 38, 101),
  (19, 'HOJ-Y89G36', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 39, 101),
  (19, 'HOJ-Y89G36', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 40, 101),
  (20, 'HOJ-41043H', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 41, 101),
  (20, 'HOJ-41043H', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 42, 101),
  (21, 'HOJ-024Y83', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 43, 101),
  (21, 'HOJ-024Y83', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 44, 101),
  (22, 'HOJ-5IS212', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 45, 101),
  (22, 'HOJ-5IS212', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 46, 101),
  (23, 'HOJ-12P451', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 47, 101),
  (23, 'HOJ-12P451', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 48, 101),
  (24, 'HOJ-2603Z9', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 49, 101),
  (24, 'HOJ-2603Z9', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 50, 101),
  (25, 'HOJ-S82X00', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 51, 101),
  (25, 'HOJ-S82X00', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 52, 101),
  (26, 'HOJ-X4692U', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 53, 101),
  (26, 'HOJ-X4692U', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 54, 101),
  (27, 'HOJ-E0E034', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 55, 101),
  (27, 'HOJ-E0E034', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 56, 101),
  (28, 'HOJ-88A492', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 57, 101),
  (28, 'HOJ-88A492', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 58, 101),
  (29, 'HOJ-20LJ69', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 59, 101),
  (29, 'HOJ-20LJ69', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 60, 101),
  (30, 'HOJ-2ER845', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 61, 101),
  (30, 'HOJ-2ER845', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 62, 101),
  (31, 'HOJ-2QS676', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 63, 101),
  (31, 'HOJ-2QS676', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 64, 101),
  (32, 'HOJ-F92696', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 65, 101),
  (32, 'HOJ-F92696', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 66, 101),
  (33, 'HOJ-77400L', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 67, 101),
  (33, 'HOJ-77400L', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 68, 101),
  (34, 'HOJ-R38622', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 69, 101),
  (34, 'HOJ-R38622', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 70, 101),
  (35, 'HOJ-8903J8', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 71, 101),
  (35, 'HOJ-8903J8', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 72, 101),
  (36, 'HOJ-CZ6129', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 73, 101),
  (36, 'HOJ-CZ6129', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 74, 101),
  (37, 'HOJ-M8605M', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 75, 101),
  (37, 'HOJ-M8605M', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 76, 101),
  (38, 'HOJ-83CF89', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 77, 101),
  (38, 'HOJ-83CF89', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 78, 101),
  (39, 'HOJ-887Q53', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 79, 101),
  (39, 'HOJ-887Q53', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 80, 101),
  (40, 'HOJ-1356G6', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 81, 101),
  (40, 'HOJ-1356G6', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 82, 101),
  (41, 'HOJ-4V7268', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 83, 101),
  (41, 'HOJ-4V7268', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 84, 101),
  (42, 'HOJ-4685GL', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 85, 101),
  (42, 'HOJ-4685GL', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 86, 101),
  (43, 'HOJ-B25M92', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 87, 101),
  (43, 'HOJ-B25M92', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 88, 101),
  (44, 'HOJ-7K051B', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 89, 101),
  (44, 'HOJ-7K051B', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 90, 101),
  (45, 'HOJ-7816D3', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 91, 101),
  (45, 'HOJ-7816D3', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 92, 101),
  (46, 'HOJ-75393Y', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 93, 101),
  (46, 'HOJ-75393Y', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 94, 101),
  (47, 'HOJ-053HV9', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 95, 101),
  (47, 'HOJ-053HV9', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 96, 101),
  (48, 'HOJ-1645AZ', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 97, 101),
  (48, 'HOJ-1645AZ', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 98, 101),
  (49, 'HOJ-1382O9', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 99, 101),
  (49, 'HOJ-1382O9', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 100, 101),
  (50, 'HOJ-6I6537', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 101, 101),
  (50, 'HOJ-6I6537', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 102, 101),
  (51, 'HOJ-689T76', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 103, 101),
  (51, 'HOJ-689T76', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 104, 101),
  (52, 'HOJ-U3147Z', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 105, 101),
  (52, 'HOJ-U3147Z', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 106, 101),
  (53, 'HOJ-684I2I', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 107, 101),
  (53, 'HOJ-684I2I', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 108, 101),
  (54, 'HOJ-3021U0', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 109, 101),
  (54, 'HOJ-3021U0', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 110, 101),
  (55, 'HOJ-288Z82', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 111, 101),
  (55, 'HOJ-288Z82', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 112, 101),
  (56, 'HOJ-R44179', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 113, 101),
  (56, 'HOJ-R44179', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 114, 101),
  (57, 'HOJ-U01101', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 115, 101),
  (57, 'HOJ-U01101', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 116, 101),
  (58, 'HOJ-55175R', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 117, 101),
  (58, 'HOJ-55175R', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 118, 101),
  (59, 'HOJ-85X1H5', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 119, 101),
  (59, 'HOJ-85X1H5', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 120, 101),
  (60, 'HOJ-3238GW', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 121, 101),
  (60, 'HOJ-3238GW', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 122, 101),
  (61, 'HOJ-814Z14', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 123, 101),
  (61, 'HOJ-814Z14', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 124, 101),
  (62, 'HOJ-67P075', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 125, 101),
  (62, 'HOJ-67P075', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 126, 101),
  (63, 'HOJ-N6G406', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 127, 101),
  (63, 'HOJ-N6G406', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 128, 101),
  (64, 'HOJ-U27557', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 129, 101),
  (64, 'HOJ-U27557', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 130, 101),
  (65, 'HOJ-91A935', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 131, 101),
  (65, 'HOJ-91A935', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 132, 101),
  (66, 'HOJ-26RW53', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 133, 101),
  (66, 'HOJ-26RW53', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 134, 101),
  (67, 'HOJ-86C82V', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 135, 101),
  (67, 'HOJ-86C82V', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 136, 101),
  (68, 'HOJ-J18442', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 137, 101),
  (68, 'HOJ-J18442', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 138, 101),
  (69, 'HOJ-03292H', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 139, 101),
  (69, 'HOJ-03292H', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 140, 101),
  (70, 'HOJ-8644LD', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 141, 101),
  (70, 'HOJ-8644LD', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 142, 101),
  (71, 'HOJ-4J296X', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 143, 101),
  (71, 'HOJ-4J296X', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 144, 101),
  (72, 'HOJ-ZW0069', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 145, 101),
  (72, 'HOJ-ZW0069', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 146, 101),
  (73, 'HOJ-766V62', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 147, 101),
  (73, 'HOJ-766V62', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 148, 101),
  (74, 'HOJ-01659P', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 149, 101),
  (74, 'HOJ-01659P', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 150, 101),
  (75, 'HOJ-5C9492', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 151, 101),
  (75, 'HOJ-5C9492', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 152, 101),
  (76, 'HOJ-7863X3', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 153, 101),
  (76, 'HOJ-7863X3', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 154, 101),
  (77, 'HOJ-55729W', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 155, 101),
  (77, 'HOJ-55729W', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 156, 101),
  (78, 'HOJ-5G549K', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 157, 101),
  (78, 'HOJ-5G549K', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 158, 101),
  (79, 'HOJ-92209G', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 159, 101),
  (79, 'HOJ-92209G', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 160, 101),
  (80, 'HOJ-585O6Y', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 161, 101),
  (80, 'HOJ-585O6Y', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 162, 101),
  (81, 'HOJ-460IA2', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 163, 101),
  (81, 'HOJ-460IA2', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 164, 101),
  (82, 'HOJ-Q70934', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 165, 101),
  (82, 'HOJ-Q70934', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 166, 101),
  (83, 'HOJ-4923L6', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 167, 101),
  (83, 'HOJ-4923L6', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 168, 101),
  (84, 'HOJ-047JN7', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 169, 101),
  (84, 'HOJ-047JN7', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 170, 101),
  (85, 'HOJ-9O1512', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 171, 101),
  (85, 'HOJ-9O1512', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 172, 101),
  (86, 'HOJ-982Q8Z', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 173, 101),
  (86, 'HOJ-982Q8Z', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 174, 101),
  (87, 'HOJ-78O46Q', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 175, 101),
  (87, 'HOJ-78O46Q', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 176, 101),
  (88, 'HOJ-O78633', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 177, 101),
  (88, 'HOJ-O78633', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 178, 101),
  (89, 'HOJ-775P56', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 179, 101),
  (89, 'HOJ-775P56', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 180, 101),
  (90, 'HOJ-6890X0', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 181, 101),
  (90, 'HOJ-6890X0', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 182, 101),
  (91, 'HOJ-87P5S6', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 183, 101),
  (91, 'HOJ-87P5S6', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 184, 101),
  (92, 'HOJ-C031E2', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 185, 101),
  (92, 'HOJ-C031E2', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 186, 101),
  (93, 'HOJ-8543DC', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 187, 101),
  (93, 'HOJ-8543DC', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 188, 101),
  (94, 'HOJ-9U491S', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 189, 101),
  (94, 'HOJ-9U491S', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 190, 101),
  (95, 'HOJ-2225R7', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 191, 101),
  (95, 'HOJ-2225R7', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 192, 101),
  (96, 'HOJ-59098Z', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 193, 101),
  (96, 'HOJ-59098Z', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 194, 101),
  (97, 'HOJ-FM2532', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 195, 101),
  (97, 'HOJ-FM2532', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 196, 101),
  (98, 'HOJ-20ZS85', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 197, 101),
  (98, 'HOJ-20ZS85', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 198, 101),
  (99, 'HOJ-1D8306', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 199, 101),
  (99, 'HOJ-1D8306', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 200, 101),
  (100, 'HOJ-1B2426', 'sender', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 201, 101),
  (100, 'HOJ-1B2426', 'receiver', 0, '', '', '', '', 'House of Jewels Pilot', 'house-of-jewels', 'active', 1000000, 15000, '', 202, 101)
;

-- Verify
select brand_slug, codes_allocated from public.brand_accounts;

select count(*) as total_rows,
       count(distinct verification_code) as unique_codes,
       max(row_seq) as max_row_seq,
       max(total_codes) as total_codes_col
from public.ledger_threads;

select count(*) as richer_rows_left
from public.ledger_threads
where verification_code = 'HOJ-RICHER';

select code_no, verification_code, role, row_seq, total_codes, brand_label
from public.ledger_threads
order by code_no, case role when 'sender' then 0 else 1 end
limit 12;
