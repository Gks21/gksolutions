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
  preferred_date_time INTEGER,
  submitted_at INTEGER NOT NULL,
  details TEXT
);

CREATE INDEX IF NOT EXISTS idx_inquiries_submitted_at ON inquiries (submitted_at);
CREATE INDEX IF NOT EXISTS idx_inquiries_type ON inquiries (type);
