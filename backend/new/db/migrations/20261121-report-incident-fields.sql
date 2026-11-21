-- Existing installations skip schema.sql to preserve provisioned accounts and data.
-- Add the incident report fields independently of the legacy baseline/seed script.
ALTER TABLE cases ADD COLUMN IF NOT EXISTS severity TEXT;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS sub_type TEXT;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS building TEXT;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS room TEXT;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS landmark TEXT;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS note TEXT;
