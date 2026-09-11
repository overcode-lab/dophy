-- ====================================================================
-- DOPHY SYSTEM - DATABASE MIGRATION: PRODUCT SOFT DELETE SUPPORT
-- ====================================================================
-- Run this in Supabase SQL Editor:
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
