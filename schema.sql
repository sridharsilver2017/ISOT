-- ===================================================
-- Cloudflare D1 SQL Schema for ISOT 2026 Conference
-- ===================================================

-- Table 1: Conference Programme Sessions & Talks
CREATE TABLE IF NOT EXISTS programme_data (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  last_updated TEXT NOT NULL,
  updated_by TEXT NOT NULL
);

-- Table 2: Admin Users with hashed credentials
CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL
);

-- Insert Default Admin Accounts if missing
INSERT OR IGNORE INTO admin_users (id, username, name, email, role, password_hash, created_at)
VALUES 
  ('admin-1', 'admin', 'ISOT Organizing Committee Admin', 'admin@isot2026.com', 'super_admin', '$2a$10$vN95iR3a3eS7zIq2N28Pne2pTjKkH40l3h40tWb5P06qJp6qK4eK2', datetime('now')),
  ('admin-2', 'secretariat', 'Scientific Secretariat', 'secretariat@isot2026.com', 'editor', '$2a$10$fV3z9.a4Zz9w.k4fB2bK8eO0V4h9uW0a3mB4cE5h6i7j8k9l0m1n2', datetime('now'));
