-- Run when moving off local SQLite.
CREATE TABLE IF NOT EXISTS inquiries (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  client_type TEXT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  service TEXT,
  message TEXT,
  device_or_system TEXT,
  remote_or_onsite TEXT,
  preferred_date_time BIGINT,
  submitted_at BIGINT NOT NULL,
  details TEXT
);

CREATE INDEX IF NOT EXISTS idx_inquiries_submitted_at ON inquiries (submitted_at);
CREATE INDEX IF NOT EXISTS idx_inquiries_type ON inquiries (type);
