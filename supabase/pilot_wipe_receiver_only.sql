-- =============================================================================
-- HOJ PILOT — RECEIVER ONLY RESET (sender story SAFE)
-- =============================================================================
-- Wife / recipient phone fresh — sender confessions on same code stay.
-- Does NOT drop tables. Does NOT touch brand_accounts.
--
-- Default code: HOJ-RICHER. Change verification_code if needed.
-- Supabase → SQL Editor → Run
-- =============================================================================

update public.ledger_threads
set
  device_id = '',
  scan_count = 0,
  conversation = '',
  session_summaries = '',
  axerai_ai_usage = '',
  axerai_voice_usage = '',
  axerai_ai_used_total = 0,
  axerai_voice_used_total = 0
where verification_code = 'HOJ-RICHER'
  and role = 'receiver';

-- Verify
-- select verification_code, role, scan_count, length(conversation) as conv_len
-- from public.ledger_threads
-- where verification_code = 'HOJ-RICHER'
-- order by role;
