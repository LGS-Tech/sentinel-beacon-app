-- Additive: deliberately does not move existing users or shared demo data.
CREATE TABLE IF NOT EXISTS organisation_domains (
  domain TEXT PRIMARY KEY CHECK (domain = LOWER(domain) AND domain = BTRIM(domain)),
  organization_id INTEGER NOT NULL UNIQUE REFERENCES organisations(id),
  approved_by TEXT NOT NULL CHECK (LENGTH(BTRIM(approved_by)) > 0),
  approved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Tenant ownership must be explicit, never silently assigned to the demo.
ALTER TABLE users ALTER COLUMN organization_id DROP DEFAULT;
ALTER TABLE departments ALTER COLUMN organization_id DROP DEFAULT;
ALTER TABLE cases ALTER COLUMN organization_id DROP DEFAULT;
ALTER TABLE case_attachments ALTER COLUMN organization_id DROP DEFAULT;
