-- Add pro_until and rename subscription field for AbacatePay
ALTER TABLE profiles ADD COLUMN pro_until TIMESTAMPTZ;
ALTER TABLE profiles RENAME COLUMN mp_subscription_id TO abacatepay_billing_id;

-- Migrate existing pro users
UPDATE profiles SET pro_until = now() + interval '30 days' WHERE plan = 'pro';
