-- ====================================================================
-- DOPHY AFFILIATE APPLICATION - CLEAR ALL DATA SCRIPT
-- ====================================================================
-- Description: Empties all records from tables while keeping schema,
--              triggers, and RLS policies intact.
-- Ready to execute in Supabase SQL Editor
-- ====================================================================

TRUNCATE TABLE 
    public.announcements,
    public.withdrawals,
    public.commissions,
    public.sales,
    public.products,
    public.affiliates,
    public.admins
RESTART IDENTITY CASCADE;
