-- ====================================================================
-- DOPHY SYSTEM - DATABASE MIGRATION SCRIPT: FULL PARTNER REFACTOR
-- ====================================================================
-- Description: 
-- 1. Creates `public.partners` table
-- 2. Clones all existing rows from `public.affiliates` to `public.partners` (if exists)
-- 3. Renames column `affiliate_id` -> `partner_id` in `sales`, `withdrawals`, `commissions`
-- 4. Sets up foreign keys, indexes, and RLS policies on `public.partners`
-- Ready to execute in Supabase SQL Editor
-- ====================================================================

-- Step 1: Create partner_status ENUM
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'partner_status') THEN
        CREATE TYPE partner_status AS ENUM ('active', 'inactive');
    END IF;
END$$;

-- Step 2: Create public.partners table
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

-- Step 3: Copy all data from public.affiliates to public.partners (if affiliates exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'affiliates') THEN
        INSERT INTO public.partners (
            id, user_id, full_name, email, phone_number, referral_code,
            bank_account_number, bank_name, status, available_balance,
            held_balance, sales_target, created_at, updated_at
        )
        SELECT 
            id, user_id, full_name, email, phone_number, referral_code,
            bank_account_number, bank_name, 
            status::text::partner_status, 
            available_balance, held_balance, sales_target, created_at, updated_at
        FROM public.affiliates
        ON CONFLICT (id) DO UPDATE SET
            user_id = EXCLUDED.user_id,
            full_name = EXCLUDED.full_name,
            email = EXCLUDED.email,
            phone_number = EXCLUDED.phone_number,
            referral_code = EXCLUDED.referral_code,
            bank_account_number = EXCLUDED.bank_account_number,
            bank_name = EXCLUDED.bank_name,
            status = EXCLUDED.status,
            available_balance = EXCLUDED.available_balance,
            held_balance = EXCLUDED.held_balance,
            sales_target = EXCLUDED.sales_target,
            updated_at = EXCLUDED.updated_at;
    END IF;
END$$;

-- Step 4: Create Indexes for public.partners
CREATE INDEX IF NOT EXISTS idx_partners_referral_code ON public.partners(referral_code);
CREATE INDEX IF NOT EXISTS idx_partners_email ON public.partners(email);

-- Step 5: Setup updated_at Trigger for public.partners
CREATE OR REPLACE FUNCTION set_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_partners_updated_at ON public.partners;
CREATE TRIGGER update_partners_updated_at
    BEFORE UPDATE ON public.partners
    FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

-- Step 6: Setup RLS on public.partners
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Partners read own profile" ON public.partners;
CREATE POLICY "Partners read own profile" ON public.partners
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Partners update own profile" ON public.partners;
CREATE POLICY "Partners update own profile" ON public.partners
    FOR UPDATE USING (auth.uid() = user_id);

-- Step 7: Rename columns from affiliate_id -> partner_id in relational tables if needed

-- 7.1 SALES table
DO $$
BEGIN
    -- Drop old foreign keys if existing
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'sales_affiliate_id_fkey') THEN
        ALTER TABLE public.sales DROP CONSTRAINT sales_affiliate_id_fkey;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'sales_partner_id_fkey') THEN
        ALTER TABLE public.sales DROP CONSTRAINT sales_partner_id_fkey;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'sales_referral_code_fkey') THEN
        ALTER TABLE public.sales DROP CONSTRAINT sales_referral_code_fkey;
    END IF;

    -- Rename column affiliate_id -> partner_id if affiliate_id exists and partner_id does not
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sales' AND column_name = 'affiliate_id') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sales' AND column_name = 'partner_id') THEN
        ALTER TABLE public.sales RENAME COLUMN affiliate_id TO partner_id;
    END IF;
END$$;

ALTER TABLE public.sales
    ADD CONSTRAINT sales_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.partners(id) ON DELETE SET NULL,
    ADD CONSTRAINT sales_referral_code_fkey FOREIGN KEY (referral_code) REFERENCES public.partners(referral_code) ON UPDATE CASCADE ON DELETE SET NULL;

-- 7.2 WITHDRAWALS table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'withdrawals_affiliate_id_fkey') THEN
        ALTER TABLE public.withdrawals DROP CONSTRAINT withdrawals_affiliate_id_fkey;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'withdrawals_partner_id_fkey') THEN
        ALTER TABLE public.withdrawals DROP CONSTRAINT withdrawals_partner_id_fkey;
    END IF;

    -- Rename column affiliate_id -> partner_id if affiliate_id exists and partner_id does not
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'withdrawals' AND column_name = 'affiliate_id') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'withdrawals' AND column_name = 'partner_id') THEN
        ALTER TABLE public.withdrawals RENAME COLUMN affiliate_id TO partner_id;
    END IF;
END$$;

ALTER TABLE public.withdrawals
    ADD CONSTRAINT withdrawals_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.partners(id) ON DELETE CASCADE;

-- Update withdrawals RLS policies to reference partner_id
DROP POLICY IF EXISTS "Affiliates read own withdrawals" ON public.withdrawals;
DROP POLICY IF EXISTS "Partners read own withdrawals" ON public.withdrawals;
CREATE POLICY "Partners read own withdrawals" ON public.withdrawals
    FOR SELECT USING (partner_id IN (
        SELECT id FROM public.partners WHERE user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Affiliates create own withdrawals" ON public.withdrawals;
DROP POLICY IF EXISTS "Partners create own withdrawals" ON public.withdrawals;
CREATE POLICY "Partners create own withdrawals" ON public.withdrawals
    FOR INSERT WITH CHECK (partner_id IN (
        SELECT id FROM public.partners WHERE user_id = auth.uid()
    ));

-- 7.3 COMMISSIONS table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'commissions_affiliate_id_fkey') THEN
        ALTER TABLE public.commissions DROP CONSTRAINT commissions_affiliate_id_fkey;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'commissions_partner_id_fkey') THEN
        ALTER TABLE public.commissions DROP CONSTRAINT commissions_partner_id_fkey;
    END IF;

    -- Rename column affiliate_id -> partner_id if affiliate_id exists and partner_id does not
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'commissions' AND column_name = 'affiliate_id') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'commissions' AND column_name = 'partner_id') THEN
        ALTER TABLE public.commissions RENAME COLUMN affiliate_id TO partner_id;
    END IF;
END$$;

ALTER TABLE public.commissions
    ADD CONSTRAINT commissions_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.partners(id) ON DELETE CASCADE;

-- Step 8: Update indices for relations
DROP INDEX IF EXISTS idx_sales_affiliate_id;
DROP INDEX IF EXISTS idx_withdrawals_affiliate_id;
DROP INDEX IF EXISTS idx_commissions_affiliate_id;

CREATE INDEX IF NOT EXISTS idx_sales_partner_id ON public.sales(partner_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_partner_id ON public.withdrawals(partner_id);
CREATE INDEX IF NOT EXISTS idx_commissions_partner_id ON public.commissions(partner_id);

-- Step 9: Reload Supabase PostgREST Schema Cache
NOTIFY pgrst, 'reload schema';
