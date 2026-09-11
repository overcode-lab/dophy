-- ====================================================================
-- DOPHY PARTNER APPLICATION - SUPABASE DATABASE INITIALIZATION SCRIPT
-- ====================================================================
-- Description: Complete SQL DDL for DOPHY Creator Partner System
-- Naming Standard: Pure English Tables, Columns, Enums, and Foreign Keys
-- Ready to execute in Supabase SQL Editor
-- ====================================================================

-- 1. EXTENSIONS & ENUMS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Status for Creator Partner Account
CREATE TYPE partner_status AS ENUM ('active', 'inactive');

-- Status for Withdrawal Request
CREATE TYPE withdrawal_status AS ENUM ('pending', 'processing', 'completed', 'rejected', 'cancelled');

-- Status for Commission Entry
CREATE TYPE commission_status AS ENUM ('calculated', 'withdrawn');

-- ====================================================================
-- 2. TABLES DEFINITION
-- ====================================================================

-- A. ADMINS TABLE
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- B. PARTNERS TABLE (Creator Partners)
CREATE TABLE IF NOT EXISTS public.partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    referral_code VARCHAR(50) UNIQUE NOT NULL,
    bank_account_number VARCHAR(100) NOT NULL,
    bank_name VARCHAR(100) NOT NULL,
    status partner_status NOT NULL DEFAULT 'active',
    available_balance DECIMAL(12, 2) NOT NULL DEFAULT 0.00 CHECK (available_balance >= 0),
    held_balance DECIMAL(12, 2) NOT NULL DEFAULT 0.00 CHECK (held_balance >= 0),
    sales_target INT DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- C. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    weight VARCHAR(50) NOT NULL DEFAULT '65 gr',
    price DECIMAL(12, 2) NOT NULL CHECK (price >= 0),
    stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- D. SALES TABLE
CREATE TABLE IF NOT EXISTS public.sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0),
    total_price DECIMAL(12, 2) NOT NULL CHECK (total_price >= 0),
    referral_code VARCHAR(50) REFERENCES public.partners(referral_code) ON UPDATE CASCADE ON DELETE SET NULL,
    partner_id UUID REFERENCES public.partners(id) ON DELETE SET NULL,
    commission_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00 CHECK (commission_amount >= 0),
    recorded_by_admin_id UUID REFERENCES public.admins(id) ON DELETE SET NULL,
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- E. COMMISSIONS TABLE (Ledger)
CREATE TABLE IF NOT EXISTS public.commissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
    sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL CHECK (amount >= 0),
    status commission_status NOT NULL DEFAULT 'calculated',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- F. WITHDRAWALS TABLE
CREATE TABLE IF NOT EXISTS public.withdrawals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
    bank_account_number VARCHAR(100) NOT NULL,
    bank_name VARCHAR(100) NOT NULL,
    status withdrawal_status NOT NULL DEFAULT 'pending',
    proof_url TEXT DEFAULT NULL,
    proof_public_id VARCHAR(255) DEFAULT NULL,
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    rejection_reason TEXT DEFAULT NULL,
    processed_by_admin_id UUID REFERENCES public.admins(id) ON DELETE SET NULL
);

-- G. ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT DEFAULT NULL,
    image_public_id VARCHAR(255) DEFAULT NULL,
    created_by_admin_id UUID REFERENCES public.admins(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- 3. INDEXES FOR HIGH-PERFORMANCE QUERYING
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_partners_referral_code ON public.partners(referral_code);
CREATE INDEX IF NOT EXISTS idx_partners_email ON public.partners(email);
CREATE INDEX IF NOT EXISTS idx_sales_referral_code ON public.sales(referral_code);
CREATE INDEX IF NOT EXISTS idx_sales_partner_id ON public.sales(partner_id);
CREATE INDEX IF NOT EXISTS idx_sales_transaction_date ON public.sales(transaction_date);
CREATE INDEX IF NOT EXISTS idx_commissions_partner_id ON public.commissions(partner_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_partner_id ON public.withdrawals(partner_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON public.withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON public.announcements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);

-- ====================================================================
-- 4. AUTOMATIC UPDATED_AT TRIGGER FUNCTION
-- ====================================================================
CREATE OR REPLACE FUNCTION set_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_admins_updated_at
    BEFORE UPDATE ON public.admins
    FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

CREATE TRIGGER update_partners_updated_at
    BEFORE UPDATE ON public.partners
    FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

CREATE TRIGGER update_announcements_updated_at
    BEFORE UPDATE ON public.announcements
    FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

-- ====================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Admin Policy: Allow full access for verified Admins
CREATE POLICY "Admins full access on admins" ON public.admins
    FOR ALL USING (auth.uid() = user_id);

-- Partners Policy: Partners can read their own row
CREATE POLICY "Partners read own profile" ON public.partners
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Partners update own profile" ON public.partners
    FOR UPDATE USING (auth.uid() = user_id);

-- Products Policy: Everyone authenticated can view products
CREATE POLICY "Public read products" ON public.products
    FOR SELECT USING (true);

-- Withdrawals Policy: Partners view & create their own withdrawals
CREATE POLICY "Partners read own withdrawals" ON public.withdrawals
    FOR SELECT USING (partner_id IN (
        SELECT id FROM public.partners WHERE user_id = auth.uid()
    ));

CREATE POLICY "Partners create own withdrawals" ON public.withdrawals
    FOR INSERT WITH CHECK (partner_id IN (
        SELECT id FROM public.partners WHERE user_id = auth.uid()
    ));

-- Announcements Policy: Everyone authenticated can read announcements
CREATE POLICY "Authenticated users read announcements" ON public.announcements
    FOR SELECT USING (true);
