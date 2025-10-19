-- Add superadmin role to the enum (step 1)
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'superadmin';