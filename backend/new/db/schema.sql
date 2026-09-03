-- LGS Tech PostgreSQL schema
-- Campus ticketing: users, departments, cases/incidents, feed events
-- Idempotent: safe on fresh Docker volumes and existing local DBs (npm run db:setup)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- Departments (assign tickets to Facilities / IT / Engineering / …)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS departments (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  kind TEXT NOT NULL DEFAULT 'facilities'
    CHECK (kind IN ('facilities', 'it', 'engineering', 'security', 'medical', 'other')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

INSERT INTO departments (id, name, slug, kind) VALUES
  (1, 'Facilities', 'facilities', 'facilities'),
  (2, 'IT Support', 'it-support', 'it'),
  (3, 'Engineering', 'engineering', 'engineering'),
  (4, 'Security', 'security', 'security'),
  (5, 'Medical', 'medical', 'medical'),
  (6, 'Estates / Maintenance', 'estates', 'facilities')
ON CONFLICT (id) DO NOTHING;

SELECT setval(
  pg_get_serial_sequence('departments', 'id'),
  (SELECT COALESCE(MAX(id), 1) FROM departments)
);

-- ---------------------------------------------------------------------------
-- Users (students, staff, maintainers, leads)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  phone TEXT,
  role TEXT,
  authorisation INTEGER NOT NULL DEFAULT 2
    CHECK (authorisation IN (1, 2)),
  college_id TEXT,
  department_id INTEGER REFERENCES departments (id),
  year_semester TEXT,
  user_type TEXT NOT NULL DEFAULT 'staff'
    CHECK (user_type IN ('student', 'staff', 'maintainer', 'lead')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS college_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS department_id INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS year_semester TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_type TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

UPDATE users SET user_type = 'staff' WHERE user_type IS NULL;
UPDATE users SET is_active = TRUE WHERE is_active IS NULL;
UPDATE users SET updated_at = NOW() WHERE updated_at IS NULL;
UPDATE users SET authorisation = 2 WHERE authorisation IS NULL;

ALTER TABLE users ALTER COLUMN user_type SET DEFAULT 'staff';
ALTER TABLE users ALTER COLUMN user_type SET NOT NULL;
ALTER TABLE users ALTER COLUMN is_active SET DEFAULT TRUE;
ALTER TABLE users ALTER COLUMN is_active SET NOT NULL;
ALTER TABLE users ALTER COLUMN updated_at SET DEFAULT NOW();
ALTER TABLE users ALTER COLUMN updated_at SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_department_id_fkey'
  ) THEN
    ALTER TABLE users
      ADD CONSTRAINT users_department_id_fkey
      FOREIGN KEY (department_id) REFERENCES departments (id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_user_type_check'
  ) THEN
    ALTER TABLE users
      ADD CONSTRAINT users_user_type_check
      CHECK (user_type IN ('student', 'staff', 'maintainer', 'lead'));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_authorisation_check'
  ) THEN
    ALTER TABLE users
      ADD CONSTRAINT users_authorisation_check
      CHECK (authorisation IN (1, 2));
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_department_id ON users (department_id);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users (user_type);
CREATE INDEX IF NOT EXISTS idx_users_college_id ON users (college_id);

-- Seed demo staff plus maintainer and student
INSERT INTO users (
  id, username, password, email, name, phone, role, authorisation,
  user_type, department_id, college_id
) VALUES
  (1, 'jimstevens322', 'London588', 'jimstevens@gmail.com', 'Jim',
    '+4476338674998', 'Art teacher', 2, 'staff', NULL, NULL),
  (2, 'markdavis99', 'Football456', 'markdavis@gmail.com', 'Mark',
    '+447658713447', 'Maths teacher', 2, 'staff', NULL, NULL),
  (3, 'lindsaywilliams1874', 'TableTop22', 'lindsaywilliams@gmail.com', 'Lindsay',
    '+447566345922', 'Head teacher', 1, 'lead', NULL, NULL),
  (4, 'ellamcintosh111', 'TableTop22', 'ellamcintosh@gmail.com', 'Ella',
    '+447455698236', 'English teacher', 2, 'staff', NULL, NULL),
  (5, 'patel.estates', 'Estates221', 'estates@lgs.ac.uk', 'Priya Patel',
    '+447400100501', 'Estates maintainer', 2, 'maintainer', 6, 'STAFF-EST-01'),
  (6, 'chen.it', 'ITSupport19', 'itsupport@lgs.ac.uk', 'Wei Chen',
    '+447400100502', 'IT technician', 2, 'maintainer', 2, 'STAFF-IT-04'),
  (7, 'aisha.student', 'Student100', 'aisha.khan@student.lgs.ac.uk', 'Aisha Khan',
    '+447400100601', 'Student', 2, 'student', NULL, 'LGS-2026-4412')
ON CONFLICT (id) DO NOTHING;

UPDATE users SET user_type = 'lead', authorisation = 1 WHERE id = 3 AND user_type = 'staff';
UPDATE users SET department_id = 6 WHERE id = 5 AND department_id IS NULL;
UPDATE users SET department_id = 2 WHERE id = 6 AND department_id IS NULL;

SELECT setval(
  pg_get_serial_sequence('users', 'id'),
  (SELECT COALESCE(MAX(id), 1) FROM users)
);

-- ---------------------------------------------------------------------------
-- Cases / incidents (map tickets + emergency cases)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  created_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
  last_updated_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  location_x DOUBLE PRECISION,
  location_y DOUBLE PRECISION,
  location_label TEXT,
  feed TEXT,
  category TEXT NOT NULL DEFAULT 'Maintenance',
  description TEXT,
  chat TEXT,
  priority TEXT NOT NULL DEFAULT 'NORMAL',
  assigned_department_id INTEGER REFERENCES departments (id),
  assigned_user_id INTEGER REFERENCES users (id),
  created_by_user_id INTEGER REFERENCES users (id),
  closed_by_user_id INTEGER REFERENCES users (id),
  closed_at BIGINT,
  estimated_cost NUMERIC(12, 2),
  police_contacted BOOLEAN NOT NULL DEFAULT FALSE,
  fire_contacted BOOLEAN NOT NULL DEFAULT FALSE,
  ambulance_contacted BOOLEAN NOT NULL DEFAULT FALSE,
  maintenance_contacted BOOLEAN NOT NULL DEFAULT FALSE
);

ALTER TABLE cases ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS chat TEXT;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS priority TEXT;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS assigned_department_id INTEGER;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS assigned_user_id INTEGER;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS created_by_user_id INTEGER;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS closed_by_user_id INTEGER;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS closed_at BIGINT;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS estimated_cost NUMERIC(12, 2);
ALTER TABLE cases ADD COLUMN IF NOT EXISTS police_contacted BOOLEAN;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS fire_contacted BOOLEAN;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS ambulance_contacted BOOLEAN;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS maintenance_contacted BOOLEAN;

UPDATE cases SET category = 'Maintenance' WHERE category IS NULL OR category = '';
UPDATE cases SET priority = 'NORMAL' WHERE priority IS NULL OR priority = '';
UPDATE cases SET police_contacted = FALSE WHERE police_contacted IS NULL;
UPDATE cases SET fire_contacted = FALSE WHERE fire_contacted IS NULL;
UPDATE cases SET ambulance_contacted = FALSE WHERE ambulance_contacted IS NULL;
UPDATE cases SET maintenance_contacted = FALSE WHERE maintenance_contacted IS NULL;

ALTER TABLE cases ALTER COLUMN category SET DEFAULT 'Maintenance';
ALTER TABLE cases ALTER COLUMN category SET NOT NULL;
ALTER TABLE cases ALTER COLUMN priority SET DEFAULT 'NORMAL';
ALTER TABLE cases ALTER COLUMN priority SET NOT NULL;
ALTER TABLE cases ALTER COLUMN police_contacted SET DEFAULT FALSE;
ALTER TABLE cases ALTER COLUMN police_contacted SET NOT NULL;
ALTER TABLE cases ALTER COLUMN fire_contacted SET DEFAULT FALSE;
ALTER TABLE cases ALTER COLUMN fire_contacted SET NOT NULL;
ALTER TABLE cases ALTER COLUMN ambulance_contacted SET DEFAULT FALSE;
ALTER TABLE cases ALTER COLUMN ambulance_contacted SET NOT NULL;
ALTER TABLE cases ALTER COLUMN maintenance_contacted SET DEFAULT FALSE;
ALTER TABLE cases ALTER COLUMN maintenance_contacted SET NOT NULL;

ALTER TABLE cases DROP CONSTRAINT IF EXISTS cases_status_check;
ALTER TABLE cases ADD CONSTRAINT cases_status_check
  CHECK (status IN ('ACTIVE', 'IN_PROGRESS', 'CLOSED', 'RESOLVED'));

ALTER TABLE cases DROP CONSTRAINT IF EXISTS cases_category_check;
ALTER TABLE cases ADD CONSTRAINT cases_category_check
  CHECK (category IN (
    'Fire', 'Intruder', 'Injury', 'Maintenance', 'Missing',
    'Facilities', 'IT Support', 'Engineering'
  ));

ALTER TABLE cases DROP CONSTRAINT IF EXISTS cases_priority_check;
ALTER TABLE cases ADD CONSTRAINT cases_priority_check
  CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'CRITICAL'));

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'cases_assigned_department_id_fkey'
  ) THEN
    ALTER TABLE cases
      ADD CONSTRAINT cases_assigned_department_id_fkey
      FOREIGN KEY (assigned_department_id) REFERENCES departments (id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'cases_assigned_user_id_fkey'
  ) THEN
    ALTER TABLE cases
      ADD CONSTRAINT cases_assigned_user_id_fkey
      FOREIGN KEY (assigned_user_id) REFERENCES users (id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'cases_created_by_user_id_fkey'
  ) THEN
    ALTER TABLE cases
      ADD CONSTRAINT cases_created_by_user_id_fkey
      FOREIGN KEY (created_by_user_id) REFERENCES users (id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'cases_closed_by_user_id_fkey'
  ) THEN
    ALTER TABLE cases
      ADD CONSTRAINT cases_closed_by_user_id_fkey
      FOREIGN KEY (closed_by_user_id) REFERENCES users (id);
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_cases_status ON cases (status);
CREATE INDEX IF NOT EXISTS idx_cases_created_at ON cases (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cases_category ON cases (category);
CREATE INDEX IF NOT EXISTS idx_cases_assigned_user_id ON cases (assigned_user_id);
CREATE INDEX IF NOT EXISTS idx_cases_assigned_department_id ON cases (assigned_department_id);
CREATE INDEX IF NOT EXISTS idx_cases_created_by_user_id ON cases (created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_cases_location_label ON cases (location_label);

-- Infer category from existing titles like "Fire Case"
UPDATE cases
SET category = regexp_replace(title, '\s+Case$', '')
WHERE (title ILIKE '% Case')
  AND regexp_replace(title, '\s+Case$', '') IN (
    'Fire', 'Intruder', 'Injury', 'Maintenance', 'Missing',
    'Facilities', 'IT Support', 'Engineering'
  );

-- ---------------------------------------------------------------------------
-- Case feed / assignment history (structured; feed TEXT kept for the app)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS case_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases (id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users (id),
  event_type TEXT NOT NULL DEFAULT 'note'
    CHECK (event_type IN (
      'created', 'note', 'location', 'status', 'assignment', 'services', 'closed', 'reopened'
    )),
  message TEXT NOT NULL,
  created_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
);

CREATE INDEX IF NOT EXISTS idx_case_events_case_id ON case_events (case_id, created_at);

-- ---------------------------------------------------------------------------
-- Case attachments (metadata only — binary stored outside Postgres)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS case_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases (id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  mime_type TEXT,
  storage_url TEXT NOT NULL,
  storage_provider TEXT NOT NULL DEFAULT 'external'
    CHECK (storage_provider IN ('external', 'local', 's3', 'blob', 'other')),
  file_size_bytes BIGINT,
  uploaded_by_user_id INTEGER REFERENCES users (id),
  created_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
);

CREATE INDEX IF NOT EXISTS idx_case_attachments_case_id
  ON case_attachments (case_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_case_attachments_uploaded_by
  ON case_attachments (uploaded_by_user_id);
