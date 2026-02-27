-- =============================================================================
-- Admin Panel Setup — ShopLocal
-- Run this in your Supabase SQL Editor
-- =============================================================================

-- 1. Add is_active column to users (if it doesn't exist yet)
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- 2. Create platform_settings table (key-value store)
CREATE TABLE IF NOT EXISTS platform_settings (
    key          TEXT PRIMARY KEY,
    value        TEXT NOT NULL DEFAULT '',
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default settings
INSERT INTO platform_settings (key, value) VALUES
    ('platform_name',                    'ShopLocal'),
    ('contact_email',                    'support@shoplocal.in'),
    ('maintenance_mode',                 'false'),
    ('max_product_images',               '5'),
    ('order_cancellation_window_hours',  '24'),
    ('platform_fee_percent',             '0')
ON CONFLICT (key) DO NOTHING;

-- 3. Promote a user to admin (replace with your email)
-- UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
