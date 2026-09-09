-- ====================================================================
-- DOPHY AFFILIATE APPLICATION - GLOBAL RESET SCRIPT (BACK TO ZERO)
-- ====================================================================
-- Description: Completely drops all tables, custom types, functions,
--              triggers, and policies to wipe the database back to 0.
-- Ready to execute in Supabase SQL Editor
-- ====================================================================

-- 1. DROP ALL TABLES IN CASCADE ORDER
DROP TABLE IF EXISTS public.announcements CASCADE;
DROP TABLE IF EXISTS public.withdrawals CASCADE;
DROP TABLE IF EXISTS public.commissions CASCADE;
DROP TABLE IF EXISTS public.sales CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.affiliates CASCADE;
DROP TABLE IF EXISTS public.admins CASCADE;

-- 2. DROP TRIGGER FUNCTIONS
DROP FUNCTION IF EXISTS set_updated_at_column CASCADE;

-- 3. DROP CUSTOM ENUMS
DROP TYPE IF EXISTS commission_status CASCADE;
DROP TYPE IF EXISTS withdrawal_status CASCADE;
DROP TYPE IF EXISTS affiliate_status CASCADE;
