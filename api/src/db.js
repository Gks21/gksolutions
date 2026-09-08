import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SQLITE_SCHEMA = fs.readFileSync(path.join(__dirname, "../sql/schema.sqlite.sql"), "utf8");
const POSTGRES_SCHEMA = fs.readFileSync(path.join(__dirname, "../sql/schema.postgres.sql"), "utf8");

function rowToInquiry(row) {
  if (!row) return null;
  let details;
  if (row.details) {
    try {
      details = JSON.parse(row.details);
    } catch {
      details = undefined;
    }
  }
  return {
    id: row.id,
    type: row.type,
    clientType: row.client_type || null,
    name: row.name,
    email: row.email,
    phone: row.phone || "",
    service: row.service || "",
    message: row.message || "",
    deviceOrSystem: row.device_or_system || "",
    remoteOrOnsite: row.remote_or_onsite || null,
    preferredDateTime: row.preferred_date_time ?? null,
    submittedAt: row.submitted_at,
    ...(details ? { details } : {}),
  };
}

function createSqlite(sqlitePath) {
  fs.mkdirSync(path.dirname(sqlitePath), { recursive: true });
  const db = new Database(sqlitePath);
  db.pragma("journal_mode = WAL");
  db.exec(SQLITE_SCHEMA);

  const insert = db.prepare(`
    INSERT INTO inquiries (
      id, type, client_type, name, email, phone, service, message,
      device_or_system, remote_or_onsite, preferred_date_time, submitted_at, details
    ) VALUES (
      @id, @type, @client_type, @name, @email, @phone, @service, @message,
      @device_or_system, @remote_or_onsite, @preferred_date_time, @submitted_at, @details
    )
  `);
  const listSince = db.prepare(`
    SELECT * FROM inquiries
    WHERE submitted_at > ?
    ORDER BY submitted_at ASC
  `);
  const listAll = db.prepare(`
    SELECT * FROM inquiries
    ORDER BY submitted_at ASC
  `);

  return {
    kind: "sqlite",
    async insertInquiry(record) {
      insert.run(record);
    },
    async listInquiries(since) {
      const rows = Number.isFinite(since) ? listSince.all(since) : listAll.all();
      return rows.map(rowToInquiry);
    },
    async close() {
      db.close();
    },
  };
}

function createPostgres(databaseUrl) {
  const pool = new pg.Pool({
    connectionString: databaseUrl,
    ssl: databaseUrl.includes("localhost") ? false : { rejectUnauthorized: false },
  });

  return {
    kind: "postgres",
    async init() {
      await pool.query(POSTGRES_SCHEMA);
    },
    async insertInquiry(record) {
      await pool.query(
        `INSERT INTO inquiries (
          id, type, client_type, name, email, phone, service, message,
          device_or_system, remote_or_onsite, preferred_date_time, submitted_at, details
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
        )`,
        [
          record.id,
          record.type,
          record.client_type,
          record.name,
          record.email,
          record.phone,
          record.service,
          record.message,
          record.device_or_system,
          record.remote_or_onsite,
          record.preferred_date_time,
          record.submitted_at,
          record.details,
        ]
      );
    },
    async listInquiries(since) {
      const result = Number.isFinite(since)
        ? await pool.query(
            `SELECT * FROM inquiries WHERE submitted_at > $1 ORDER BY submitted_at ASC`,
            [since]
          )
        : await pool.query(`SELECT * FROM inquiries ORDER BY submitted_at ASC`);
      return result.rows.map(rowToInquiry);
    },
    async close() {
      await pool.end();
    },
  };
}

export async function createStore(env = process.env) {
  if (env.DATABASE_URL) {
    const store = createPostgres(env.DATABASE_URL);
    await store.init();
    return store;
  }

  const sqlitePath = path.resolve(env.SQLITE_PATH || "./data/inquiries.sqlite");
  return createSqlite(sqlitePath);
}
