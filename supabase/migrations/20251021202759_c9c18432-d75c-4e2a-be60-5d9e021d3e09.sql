-- Add admin_sub_azienda role to the user_role enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'admin_sub_azienda';