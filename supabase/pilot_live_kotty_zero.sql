-- Kotty = code_no 0, HOJ-RICHER hatao — DATA WIPE NAHI.
-- Tumhare case: ledger_threads me zyada data nahi; Kotty sender pe jo AI/voice totals
-- aur usage text hai woh rehne deta hai (sirf code_no / total_codes / row_seq fix).
--
-- Supabase → SQL Editor → poori file ek baar Run.
-- Full 101-code seed chahiye ho to baad me pilot_fresh_start.sql (nuclear).

-- 1) Schema app ke saath (missing columns)
alter table public.ledger_threads
  add column if not exists age_category text not null default '',
  add column if not exists ledger_insights text not null default '',
  add column if not exists axerai_ai_used_total bigint not null default 0,
  add column if not exists axerai_voice_used_total bigint not null default 0,
  add column if not exists code_no int not null default 0,
  add column if not exists brand_label text not null default '',
  add column if not exists brand_slug text not null default 'house-of-jewels',
  add column if not exists status text not null default 'active',
  add column if not exists axerai_ai_budget bigint not null default 1000000,
  add column if not exists axerai_voice_budget bigint not null default 15000,
  add column if not exists row_seq int,
  add column if not exists total_codes int not null default 101;

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

-- 2) Richera pilot row — ab ledger me nahi
delete from public.ledger_threads where verification_code = 'HOJ-RICHER';

-- 3) Kotty test card (code_no 0) — insert agar missing
insert into public.ledger_threads (
  code_no, verification_code, role, scan_count, conversation,
  session_summaries, age_category, ledger_insights,
  axerai_ai_usage, axerai_voice_usage, axerai_ai_used_total, axerai_voice_used_total,
  brand_label, brand_slug, status, axerai_ai_budget, axerai_voice_budget,
  device_id, row_seq, total_codes
)
select 0, 'HOJ-KOTTY', 'sender', 0, '', '', '', '', '', '', 0, 0,
  'Kotty Test Card', 'house-of-jewels', 'active', 1000000, 15000, '', 1, 101
where not exists (
  select 1 from public.ledger_threads where verification_code = 'HOJ-KOTTY' and role = 'sender'
);

insert into public.ledger_threads (
  code_no, verification_code, role, scan_count, conversation,
  session_summaries, age_category, ledger_insights,
  axerai_ai_usage, axerai_voice_usage, axerai_ai_used_total, axerai_voice_used_total,
  brand_label, brand_slug, status, axerai_ai_budget, axerai_voice_budget,
  device_id, row_seq, total_codes
)
select 0, 'HOJ-KOTTY', 'receiver', 0, '', '', '', '', '', '', 0, 0,
  'Kotty Test Card', 'house-of-jewels', 'active', 1000000, 15000, '', 2, 101
where not exists (
  select 1 from public.ledger_threads where verification_code = 'HOJ-KOTTY' and role = 'receiver'
);

-- 4) Kotty ko 0 pe lao; usage/tokens/conversation touch nahi
update public.ledger_threads
set
  code_no = 0,
  brand_label = 'Kotty Test Card',
  total_codes = 101,
  row_seq = case role when 'sender' then 1 when 'receiver' then 2 end
where verification_code = 'HOJ-KOTTY';

update public.ledger_threads
set total_codes = 101
where brand_slug = 'house-of-jewels';

-- 5) Baaki HOJ codes (1–100) row_seq formula: 2*code_no+1 / +2
update public.ledger_threads t
set row_seq = sub.seq
from (
  select id,
    case role when 'sender' then code_no * 2 + 1 when 'receiver' then code_no * 2 + 2 end as seq
  from public.ledger_threads
  where verification_code <> 'HOJ-KOTTY' and code_no between 1 and 100
) sub
where t.id = sub.id;

select verification_code, code_no, role, scan_count,
  axerai_ai_used_total, axerai_voice_used_total, row_seq, total_codes
from public.ledger_threads
where verification_code = 'HOJ-KOTTY'
order by role;
