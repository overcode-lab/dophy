-- ====================================================================
-- DOPHY AFFILIATE APPLICATION - DUMMY SEED DATA SCRIPT
-- ====================================================================
-- Description: Independent SQL script to populate test dummy data for
--              Products, Admin, Affiliates (Budi & Siti), and Announcement.
-- Ready to execute in Supabase SQL Editor AFTER running init.sql
-- ====================================================================

-- 1. Initial Products
INSERT INTO public.products (id, name, weight, price, stock)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'DOPHY Coffee', '65 gr', 15000.00, 100),
    ('22222222-2222-2222-2222-222222222222', 'DOPHY Chocolate', '65 gr', 15000.00, 100)
ON CONFLICT (id) DO NOTHING;

-- 2. Initial Admin Account (Auto-links to auth.users if registered in Supabase Auth)
INSERT INTO public.admins (id, user_id, full_name, email)
VALUES (
    'a1111111-1111-1111-1111-111111111111',
    (SELECT id FROM auth.users WHERE email = 'admin@dophy.com' LIMIT 1),
    'Admin DOPHY Official',
    'admin@dophy.com'
)
ON CONFLICT (email) DO UPDATE
SET 
    full_name = EXCLUDED.full_name,
    user_id = COALESCE(public.admins.user_id, (SELECT id FROM auth.users WHERE email = EXCLUDED.email LIMIT 1));

-- 3. Initial Affiliate Accounts (Budi & Siti) (Auto-links to auth.users if registered in Supabase Auth)
INSERT INTO public.affiliates (id, user_id, full_name, email, phone_number, referral_code, bank_account_number, bank_name, status, available_balance, held_balance, sales_target)
VALUES 
    (
        'b2222222-2222-2222-2222-222222222222',
        (SELECT id FROM auth.users WHERE email = 'budi@dophy.com' LIMIT 1),
        'Budi Santoso',
        'budi@dophy.com',
        '081234567890',
        'DOPHY-BUDI123',
        '123456789',
        'Bank BCA',
        'active',
        500000.00,
        0.00,
        50
    ),
    (
        'c3333333-3333-3333-3333-333333333333',
        (SELECT id FROM auth.users WHERE email = 'siti@dophy.com' LIMIT 1),
        'Siti Rahma',
        'siti@dophy.com',
        '089876543210',
        'DOPHY-SITI456',
        '987654321',
        'GoPay',
        'active',
        250000.00,
        0.00,
        30
    )
ON CONFLICT (email) DO UPDATE
SET user_id = COALESCE(public.affiliates.user_id, (SELECT id FROM auth.users WHERE email = EXCLUDED.email LIMIT 1));

-- 4. Initial Announcement (Dynamically references admin ID)
INSERT INTO public.announcements (id, title, content, created_by_admin_id)
VALUES 
    (
        'd4444444-4444-4444-4444-444444444444',
        'Selamat Datang di Creator Partner DOPHY! 🍿✨',
        'Dapatkan komisi ekstra setiap penjualan snack DOPHY dengan bagikan kode referral unik milikmu!',
        (SELECT id FROM public.admins WHERE email LIKE 'admin@dophy%' LIMIT 1)
    )
ON CONFLICT (id) DO NOTHING;

-- ====================================================================
-- AUTO-SYNC ALL UNLINKED USER_IDs FROM SUPABASE AUTH (auth.users)
-- ====================================================================
UPDATE public.admins a
SET user_id = u.id
FROM auth.users u
WHERE a.email = u.email AND a.user_id IS NULL;

UPDATE public.affiliates a
SET user_id = u.id
FROM auth.users u
WHERE a.email = u.email AND a.user_id IS NULL;
