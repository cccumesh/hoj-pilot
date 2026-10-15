/**
 * Generates supabase/pilot_fresh_start.sql — House of Jewels pilot seed.
 * Run: node scripts/generate-pilot-fresh-start.mjs
 */
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
/** Supabase → SQL Editor → RUN THIS (ledger-only wipe; Kotty @ 0). */
const LEDGER_FRESH_OUT = join(root, 'supabase', 'ledger_threads_fresh_start.sql')

/** Full nuclear — 3 tables drop (legacy; prefer ledger_threads_fresh_start.sql). */
const OUT_FILES_FULL = [
  join(root, 'supabase', 'FRESH_START.sql'),
  join(root, 'supabase', 'pilot_fresh_start.sql'),
]

/** code_no 0 = Kotty test card; 1–100 = HOJ pilot codes (fixed seed). */
const CODES = [
  ['HOJ-KOTTY', 0, 'Kotty Test Card'],
  ['HOJ-Y749E8', 1, 'House of Jewels Pilot'],
  ['HOJ-N96143', 2, 'House of Jewels Pilot'],
  ['HOJ-06Q681', 3, 'House of Jewels Pilot'],
  ['HOJ-A860H8', 4, 'House of Jewels Pilot'],
  ['HOJ-37L8G6', 5, 'House of Jewels Pilot'],
  ['HOJ-7Z8520', 6, 'House of Jewels Pilot'],
  ['HOJ-71893N', 7, 'House of Jewels Pilot'],
  ['HOJ-53E89I', 8, 'House of Jewels Pilot'],
  ['HOJ-315Y5B', 9, 'House of Jewels Pilot'],
  ['HOJ-411N89', 10, 'House of Jewels Pilot'],
  ['HOJ-0V1780', 11, 'House of Jewels Pilot'],
  ['HOJ-5R3147', 12, 'House of Jewels Pilot'],
  ['HOJ-B2156P', 13, 'House of Jewels Pilot'],
  ['HOJ-10121O', 14, 'House of Jewels Pilot'],
  ['HOJ-755V47', 15, 'House of Jewels Pilot'],
  ['HOJ-237F4N', 16, 'House of Jewels Pilot'],
  ['HOJ-97T530', 17, 'House of Jewels Pilot'],
  ['HOJ-X82569', 18, 'House of Jewels Pilot'],
  ['HOJ-Y89G36', 19, 'House of Jewels Pilot'],
  ['HOJ-41043H', 20, 'House of Jewels Pilot'],
  ['HOJ-024Y83', 21, 'House of Jewels Pilot'],
  ['HOJ-5IS212', 22, 'House of Jewels Pilot'],
  ['HOJ-12P451', 23, 'House of Jewels Pilot'],
  ['HOJ-2603Z9', 24, 'House of Jewels Pilot'],
  ['HOJ-S82X00', 25, 'House of Jewels Pilot'],
  ['HOJ-X4692U', 26, 'House of Jewels Pilot'],
  ['HOJ-E0E034', 27, 'House of Jewels Pilot'],
  ['HOJ-88A492', 28, 'House of Jewels Pilot'],
  ['HOJ-20LJ69', 29, 'House of Jewels Pilot'],
  ['HOJ-2ER845', 30, 'House of Jewels Pilot'],
  ['HOJ-2QS676', 31, 'House of Jewels Pilot'],
  ['HOJ-F92696', 32, 'House of Jewels Pilot'],
  ['HOJ-77400L', 33, 'House of Jewels Pilot'],
  ['HOJ-R38622', 34, 'House of Jewels Pilot'],
  ['HOJ-8903J8', 35, 'House of Jewels Pilot'],
  ['HOJ-CZ6129', 36, 'House of Jewels Pilot'],
  ['HOJ-M8605M', 37, 'House of Jewels Pilot'],
  ['HOJ-83CF89', 38, 'House of Jewels Pilot'],
  ['HOJ-887Q53', 39, 'House of Jewels Pilot'],
  ['HOJ-1356G6', 40, 'House of Jewels Pilot'],
  ['HOJ-4V7268', 41, 'House of Jewels Pilot'],
  ['HOJ-4685GL', 42, 'House of Jewels Pilot'],
  ['HOJ-B25M92', 43, 'House of Jewels Pilot'],
  ['HOJ-7K051B', 44, 'House of Jewels Pilot'],
  ['HOJ-7816D3', 45, 'House of Jewels Pilot'],
  ['HOJ-75393Y', 46, 'House of Jewels Pilot'],
  ['HOJ-053HV9', 47, 'House of Jewels Pilot'],
  ['HOJ-1645AZ', 48, 'House of Jewels Pilot'],
  ['HOJ-1382O9', 49, 'House of Jewels Pilot'],
  ['HOJ-6I6537', 50, 'House of Jewels Pilot'],
  ['HOJ-689T76', 51, 'House of Jewels Pilot'],
  ['HOJ-U3147Z', 52, 'House of Jewels Pilot'],
  ['HOJ-684I2I', 53, 'House of Jewels Pilot'],
  ['HOJ-3021U0', 54, 'House of Jewels Pilot'],
  ['HOJ-288Z82', 55, 'House of Jewels Pilot'],
  ['HOJ-R44179', 56, 'House of Jewels Pilot'],
  ['HOJ-U01101', 57, 'House of Jewels Pilot'],
  ['HOJ-55175R', 58, 'House of Jewels Pilot'],
  ['HOJ-85X1H5', 59, 'House of Jewels Pilot'],
  ['HOJ-3238GW', 60, 'House of Jewels Pilot'],
  ['HOJ-814Z14', 61, 'House of Jewels Pilot'],
  ['HOJ-67P075', 62, 'House of Jewels Pilot'],
  ['HOJ-N6G406', 63, 'House of Jewels Pilot'],
  ['HOJ-U27557', 64, 'House of Jewels Pilot'],
  ['HOJ-91A935', 65, 'House of Jewels Pilot'],
  ['HOJ-26RW53', 66, 'House of Jewels Pilot'],
  ['HOJ-86C82V', 67, 'House of Jewels Pilot'],
  ['HOJ-J18442', 68, 'House of Jewels Pilot'],
  ['HOJ-03292H', 69, 'House of Jewels Pilot'],
  ['HOJ-8644LD', 70, 'House of Jewels Pilot'],
  ['HOJ-4J296X', 71, 'House of Jewels Pilot'],
  ['HOJ-ZW0069', 72, 'House of Jewels Pilot'],
  ['HOJ-766V62', 73, 'House of Jewels Pilot'],
  ['HOJ-01659P', 74, 'House of Jewels Pilot'],
  ['HOJ-5C9492', 75, 'House of Jewels Pilot'],
  ['HOJ-7863X3', 76, 'House of Jewels Pilot'],
  ['HOJ-55729W', 77, 'House of Jewels Pilot'],
  ['HOJ-5G549K', 78, 'House of Jewels Pilot'],
  ['HOJ-92209G', 79, 'House of Jewels Pilot'],
  ['HOJ-585O6Y', 80, 'House of Jewels Pilot'],
  ['HOJ-460IA2', 81, 'House of Jewels Pilot'],
  ['HOJ-Q70934', 82, 'House of Jewels Pilot'],
  ['HOJ-4923L6', 83, 'House of Jewels Pilot'],
  ['HOJ-047JN7', 84, 'House of Jewels Pilot'],
  ['HOJ-9O1512', 85, 'House of Jewels Pilot'],
  ['HOJ-982Q8Z', 86, 'House of Jewels Pilot'],
  ['HOJ-78O46Q', 87, 'House of Jewels Pilot'],
  ['HOJ-O78633', 88, 'House of Jewels Pilot'],
  ['HOJ-775P56', 89, 'House of Jewels Pilot'],
  ['HOJ-6890X0', 90, 'House of Jewels Pilot'],
  ['HOJ-87P5S6', 91, 'House of Jewels Pilot'],
  ['HOJ-C031E2', 92, 'House of Jewels Pilot'],
  ['HOJ-8543DC', 93, 'House of Jewels Pilot'],
  ['HOJ-9U491S', 94, 'House of Jewels Pilot'],
  ['HOJ-2225R7', 95, 'House of Jewels Pilot'],
  ['HOJ-59098Z', 96, 'House of Jewels Pilot'],
  ['HOJ-FM2532', 97, 'House of Jewels Pilot'],
  ['HOJ-20ZS85', 98, 'House of Jewels Pilot'],
  ['HOJ-1D8306', 99, 'House of Jewels Pilot'],
  ['HOJ-1B2426', 100, 'House of Jewels Pilot'],
]

const TOTAL_CODES = 101

function rowPair(codeNo, verificationCode, brandLabel) {
  const sSeq = codeNo * 2 + 1
  const rSeq = codeNo * 2 + 2
  const budget = '1000000'
  const voice = '15000'
  const slug = 'house-of-jewels'
  const mk = (role, seq) =>
    `  (${codeNo}, '${verificationCode}', '${role}', 0, '', '', '', '', '${brandLabel}', '${slug}', 'active', ${budget}, ${voice}, '', ${seq}, ${TOTAL_CODES})`
  return [mk('sender', sSeq), mk('receiver', rSeq)]
}

const POOL_AI = TOTAL_CODES * 1_000_000
const POOL_VOICE = TOTAL_CODES * 15_000

const BRAND_TABLES_DDL = `create table public.brand_accounts (
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
`

const BRAND_TABLES_ENSURE = BRAND_TABLES_DDL.replace(/^create table/gim, 'create table if not exists')

const LEDGER_TABLE_DDL = `create table public.ledger_threads (
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
`

const WALLET_VIEW_DDL = `create or replace view public.brand_wallet_snapshot as
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
`

const LEDGER_INDEXES_RLS = `create index idx_ledger_threads_code on public.ledger_threads (verification_code);
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
`

const BUDGET_TRIGGER_DDL = `create or replace function public.ledger_threads_lock_budgets()
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
`

const BRAND_SEED_INSERT = `insert into public.brand_accounts (
  brand_slug, brand_label, axerai_ai_balance, axerai_voice_balance,
  per_code_ai_budget, per_code_voice_budget, account_mode, codes_allocated
)
values (
  'house-of-jewels',
  'House of Jewels Pilot',
  ${POOL_AI},
  ${POOL_VOICE},
  1000000,
  15000,
  'trial',
  ${TOTAL_CODES}
);

insert into public.brand_token_limits (
  brand_slug, axerai_ai_pool, axerai_voice_pool, per_code_ai_cap, per_code_voice_cap
)
values (
  'house-of-jewels',
  ${POOL_AI},
  ${POOL_VOICE},
  1000000,
  15000
);
`

const BRAND_SEED_UPSERT = `insert into public.brand_accounts (
  brand_slug, brand_label, axerai_ai_balance, axerai_voice_balance,
  per_code_ai_budget, per_code_voice_budget, account_mode, codes_allocated
)
values (
  'house-of-jewels',
  'House of Jewels Pilot',
  ${POOL_AI},
  ${POOL_VOICE},
  1000000,
  15000,
  'trial',
  ${TOTAL_CODES}
)
on conflict (brand_slug) do update set
  brand_label = excluded.brand_label,
  axerai_ai_balance = excluded.axerai_ai_balance,
  axerai_voice_balance = excluded.axerai_voice_balance,
  per_code_ai_budget = excluded.per_code_ai_budget,
  per_code_voice_budget = excluded.per_code_voice_budget,
  account_mode = excluded.account_mode,
  codes_allocated = excluded.codes_allocated;

insert into public.brand_token_limits (
  brand_slug, axerai_ai_pool, axerai_voice_pool, per_code_ai_cap, per_code_voice_cap
)
values (
  'house-of-jewels',
  ${POOL_AI},
  ${POOL_VOICE},
  1000000,
  15000
)
on conflict (brand_slug) do update set
  axerai_ai_pool = excluded.axerai_ai_pool,
  axerai_voice_pool = excluded.axerai_voice_pool,
  per_code_ai_cap = excluded.per_code_ai_cap,
  per_code_voice_cap = excluded.per_code_voice_cap,
  locked_at = now();
`

const LEDGER_SEED_HEAD = `insert into public.ledger_threads (
  code_no, verification_code, role, scan_count, conversation,
  session_summaries, axerai_ai_usage, axerai_voice_usage,
  brand_label, brand_slug, status, axerai_ai_budget, axerai_voice_budget,
  device_id, row_seq, total_codes
)
values
`

const rows = CODES.flatMap(([code, no, label]) => rowPair(no, code, label))

const footer = `
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
`

const LEDGER_FRESH_HEADER = `-- =============================================================================
-- AKXERAI — LEDGER_THREADS FRESH START (NEW — Supabase me YE file chalao)
-- Generated: node scripts/generate-pilot-fresh-start.mjs — seed mat edit karo.
-- =============================================================================
--
-- .env: VITE_SUPABASE_LEDGER_TABLE=ledger_threads
--
-- ASAR (data wipe):
--   • public.ledger_threads — DROP + CREATE + 202 rows (HOJ-KOTTY @ code_no 0)
--   • brand_wallet_snapshot — view dubara
--   • ledger_threads_lock_budgets — trigger isi table par
--
-- ASAR NAHI (DROP nahi):
--   • axera_ledger_threads — kabhi touch nahi
--   • brand_accounts / brand_token_limits — sirf create-if-missing + upsert pools
--   • koi aur Supabase table / auth / storage
--
-- HOJ-RICHER — NAHI. Pilot test = HOJ-KOTTY only @ code_no 0.
-- Purana pilot_fresh_start.sql (Richera) delete kar sakte ho — is file ko use karo.
--
-- =============================================================================

drop view if exists public.brand_wallet_snapshot cascade;

drop trigger if exists trg_ledger_threads_lock_budgets on public.ledger_threads;
drop table if exists public.ledger_threads cascade;
drop function if exists public.ledger_threads_lock_budgets() cascade;

${BRAND_TABLES_ENSURE}

${LEDGER_TABLE_DDL}

${WALLET_VIEW_DDL}

${LEDGER_INDEXES_RLS}

${BUDGET_TRIGGER_DDL}

${BRAND_SEED_UPSERT}

${LEDGER_SEED_HEAD}
`

const FULL_FRESH_HEADER = `-- =============================================================================
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

${BRAND_TABLES_DDL}

${LEDGER_TABLE_DDL}

${WALLET_VIEW_DDL}

${LEDGER_INDEXES_RLS}

${BUDGET_TRIGGER_DDL}

${BRAND_SEED_INSERT}

${LEDGER_SEED_HEAD}
`

const ledgerFreshSql = LEDGER_FRESH_HEADER + rows.join(',\n') + footer
const fullFreshSql = FULL_FRESH_HEADER + rows.join(',\n') + footer

writeFileSync(LEDGER_FRESH_OUT, ledgerFreshSql, 'utf8')
for (const outPath of OUT_FILES_FULL) {
  writeFileSync(outPath, fullFreshSql, 'utf8')
}
console.log('[pilot] wrote', LEDGER_FRESH_OUT, 'rows', rows.length)
console.log('[pilot] wrote', OUT_FILES_FULL.join(', '))
