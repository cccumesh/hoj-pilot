-- Verify-fail + PAIR_FULL counters for dashboard (sender row per product code).
-- Supabase → SQL Editor → Run once. This project only: public.ledger_threads.

alter table public.ledger_threads
  add column if not exists ledger_insights text not null default '';

comment on column public.ledger_threads.ledger_insights is
  'One line per event: insight:kind|detail|ISO8601 (verify_fail, verify_glitch, pair_full).';
