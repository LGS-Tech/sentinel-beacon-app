-- Run once as a PostgreSQL superuser (postgres), e.g.:
--   psql -U postgres -f db/init-role.sql
--
-- Creates the shared LGS team role + database.
-- Password is supplied via environment substitution by scripts/setup-postgres.js
-- or replace __LGS_TECH_PASSWORD__ manually before running.

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'LGS_Tech') THEN
    CREATE ROLE "LGS_Tech" LOGIN PASSWORD '__LGS_TECH_PASSWORD__';
  ELSE
    ALTER ROLE "LGS_Tech" WITH LOGIN PASSWORD '__LGS_TECH_PASSWORD__';
  END IF;
END
$$;

SELECT 'CREATE DATABASE lgs_tech OWNER "LGS_Tech"'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'lgs_tech')\gexec

GRANT ALL PRIVILEGES ON DATABASE lgs_tech TO "LGS_Tech";
