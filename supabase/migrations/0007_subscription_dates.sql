-- ============================================================================
-- ClipAnalisis — subscription validity + daily quota tracking
-- Adds 4 columns to subscriptions:
--   subscription_start_date  — when the paid period began
--   subscription_end_date    — when the paid period expires (+30 days from payment)
--   daily_analyses_used      — counter reset each day (used for starter limit)
--   last_daily_reset         — timestamp of last counter reset
-- ============================================================================

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subscription_end_date   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS daily_analyses_used     INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_daily_reset        TIMESTAMPTZ;
