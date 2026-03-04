-- Add brand_color to profiles for customizable budget templates
ALTER TABLE profiles ADD COLUMN brand_color TEXT DEFAULT '#2563eb';
