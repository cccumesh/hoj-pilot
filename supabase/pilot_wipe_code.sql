-- =============================================================================
-- HOJ PILOT — WIPE ONE CODE ONLY (brand + other codes SAFE)
-- =============================================================================
-- Use this when you want a fresh sender+receiver retest on ONE card code.
-- Does NOT drop tables. Does NOT touch brand_accounts or brand_token_limits.
-- Other HOJ codes keep conversation + token usage history.
--
-- Change the code below if needed (default: HOJ-RICHER test card).
-- Supabase → SQL Editor → Run
-- =============================================================================

-- ▼▼▼ EDIT THIS CODE IF NEEDED ▼▼▼
-- HOJ-RICHER = Richera / pilot test card (code_no 0)

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
where verification_code = 'HOJ-RICHER';

-- Verify: both rows empty, brand tables untouched
-- select verification_code, role, scan_count,
--        length(conversation) as conv_len,
--        axerai_ai_used_total, axerai_voice_used_total
-- from public.ledger_threads
-- where verification_code = 'HOJ-RICHER'
-- order by role;

-- select * from public.brand_wallet_snapshot;
