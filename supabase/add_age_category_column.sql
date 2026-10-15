-- Add code-level sender age (one pick per verification code).
-- Run once in Supabase SQL Editor on existing pilot DBs.

alter table public.ledger_threads
  add column if not exists age_category text not null default '';

comment on column public.ledger_threads.age_category is
  'Sender age tone tier for this product code (10-17, 18-30, 31-50, 50+). Receiver inherits.';

-- Backfill from legacy session-age-category markers in sender conversations.
update public.ledger_threads t
set age_category = sub.age
from (
  select
    id,
    (regexp_match(conversation, 'session-age-category:\s*(\S+)'))[1] as age
  from public.ledger_threads
  where role = 'sender'
    and coalesce(age_category, '') = ''
    and conversation ~ 'session-age-category:'
) sub
where t.id = sub.id
  and sub.age in ('10-17', '18-30', '31-50', '50+');
