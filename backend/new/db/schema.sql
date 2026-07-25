-- LGS Tech PostgreSQL base schema
-- Mirrors backend/new Mongo Case model + Settings users storage

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tickets / cases (replaces Mongo Case collection)
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
  CONSTRAINT cases_status_check CHECK (status IN ('ACTIVE', 'CLOSED', 'RESOLVED'))
);

CREATE INDEX IF NOT EXISTS idx_cases_status ON cases (status);
CREATE INDEX IF NOT EXISTS idx_cases_created_at ON cases (created_at DESC);

-- Users (replaces data/users.json used by Settings)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  phone TEXT,
  role TEXT,
  authorisation INTEGER NOT NULL DEFAULT 2,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- Seed demo staff accounts (same shape as previous users.json)
INSERT INTO users (id, username, password, email, name, phone, role, authorisation)
VALUES
  (1, 'jimstevens322', 'London588', 'jimstevens@gmail.com', 'Jim', '+4476338674998', 'Art teacher', 2),
  (2, 'markdavis99', 'Football456', 'markdavis@gmail.com', 'Mark', '+447658713447', 'Maths teacher', 2),
  (3, 'lindsaywilliams1874', 'TableTop22', 'lindsaywilliams@gmail.com', 'Lindsay', '+447566345922', 'Head teacher', 1),
  (4, 'ellamcintosh111', 'TableTop22', 'ellamcintosh@gmail.com', 'Ella', '+447455698236', 'English teacher', 2)
ON CONFLICT (id) DO NOTHING;

SELECT setval(pg_get_serial_sequence('users', 'id'), (SELECT COALESCE(MAX(id), 1) FROM users));
