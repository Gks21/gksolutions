import crypto from "node:crypto";
import express from "express";
import dotenv from "dotenv";
import { createStore } from "./db.js";

dotenv.config();

const PORT = Number(process.env.PORT) || 8787;
const APP_API_KEY = process.env.APP_API_KEY || "";
const CORS_ORIGINS = (process.env.CORS_ORIGINS || "https://gks.software,http://localhost:8080,http://127.0.0.1:8080")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const TYPES = new Set(["BOOKING", "QUOTE", "CONTACT", "COMMUNITY"]);
const CLIENT_TYPES = new Set(["INDIVIDUAL", "SMALL_BUSINESS", "NONPROFIT", "ENTERPRISE"]);
const LOCATIONS = new Set(["REMOTE", "ONSITE", "EITHER"]);

const rateBuckets = new Map();

function text(value, max) {
  if (value == null) return "";
  return String(value).trim().slice(0, max);
}

function optionalEnum(value, allowed) {
  if (value == null || value === "") return null;
  const next = String(value).trim().toUpperCase();
  return allowed.has(next) ? next : null;
}

function parseEpoch(value) {
  if (value == null || value === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.trunc(n);
}

function clientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket.remoteAddress || "unknown";
}

function allowOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return null;
  return CORS_ORIGINS.includes(origin) ? origin : null;
}

function applyCors(req, res) {
  const origin = allowOrigin(req);
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Api-Key");
    res.setHeader("Access-Control-Max-Age", "600");
  }
  return origin;
}

function rateLimit(ip, limit = 20, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const bucket = rateBuckets.get(ip) || { count: 0, resetAt: now + windowMs };
  if (now > bucket.resetAt) {
    bucket.count = 0;
    bucket.resetAt = now + windowMs;
  }
  bucket.count += 1;
  rateBuckets.set(ip, bucket);
  return bucket.count <= limit;
}

function timingSafeEqual(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  if (left.length !== right.length) {
    crypto.timingSafeEqual(left, left);
    return false;
  }
  return crypto.timingSafeEqual(left, right);
}

function requireAppKey(req, res) {
  if (!APP_API_KEY || APP_API_KEY.length < 16 || APP_API_KEY === "change-me-to-a-long-random-secret") {
    res.status(503).json({ error: "APP_API_KEY is not configured" });
    return false;
  }
  const provided = req.get("X-Api-Key") || "";
  if (!timingSafeEqual(provided, APP_API_KEY)) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  return true;
}

function validateInquiry(body) {
  const type = optionalEnum(body.type, TYPES);
  if (!type) return { error: "type must be BOOKING, QUOTE, CONTACT, or COMMUNITY" };

  const name = text(body.name, 120);
  const email = text(body.email, 254);
  if (name.length < 2) return { error: "name is required" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "a valid email is required" };

  const clientType = optionalEnum(body.clientType, CLIENT_TYPES);
  const remoteOrOnsite = optionalEnum(body.remoteOrOnsite, LOCATIONS);

  return {
    value: {
      type,
      clientType,
      name,
      email,
      phone: text(body.phone, 40),
      service: text(body.service, 160),
      message: text(body.message, 8000),
      deviceOrSystem: text(body.deviceOrSystem, 240),
      remoteOrOnsite,
      preferredDateTime: parseEpoch(body.preferredDateTime),
      details: body.details && typeof body.details === "object" ? body.details : undefined,
    },
  };
}

const store = await createStore();
const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "32kb" }));

app.use((req, res, next) => {
  applyCors(req, res);
  if (req.method === "OPTIONS") {
    return res.status(allowOrigin(req) ? 204 : 403).end();
  }
  next();
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, store: store.kind });
});

app.post("/api/inquiries", async (req, res) => {
  const ip = clientIp(req);
  if (!rateLimit(ip)) {
    return res.status(429).json({ error: "Too many requests. Try again later." });
  }

  const body = req.body && typeof req.body === "object" ? req.body : {};
  if (text(body.companyWebsite, 200)) {
    return res.status(201).json({ ok: true, id: crypto.randomUUID(), submittedAt: Date.now() });
  }

  const checked = validateInquiry(body);
  if (checked.error) {
    return res.status(400).json({ error: checked.error });
  }

  const submittedAt = Date.now();
  const id = crypto.randomUUID();
  try {
    await store.insertInquiry({
      id,
      type: checked.value.type,
      client_type: checked.value.clientType,
      name: checked.value.name,
      email: checked.value.email,
      phone: checked.value.phone,
      service: checked.value.service,
      message: checked.value.message,
      device_or_system: checked.value.deviceOrSystem,
      remote_or_onsite: checked.value.remoteOrOnsite,
      preferred_date_time: checked.value.preferredDateTime,
      submitted_at: submittedAt,
      details: checked.value.details ? JSON.stringify(checked.value.details) : null,
    });
  } catch (error) {
    console.error("insert_failed", error instanceof Error ? error.message : error);
    return res.status(500).json({ error: "Could not save the inquiry." });
  }

  return res.status(201).json({ ok: true, id, submittedAt });
});

app.get("/api/inquiries", async (req, res) => {
  if (!requireAppKey(req, res)) return;

  const since = parseEpoch(req.query.since);
  try {
    const inquiries = await store.listInquiries(since);
    return res.json({ inquiries });
  } catch (error) {
    console.error("list_failed", error instanceof Error ? error.message : error);
    return res.status(500).json({ error: "Could not load inquiries." });
  }
});

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

const server = app.listen(PORT, "0.0.0.0", () => {
  if (!APP_API_KEY || APP_API_KEY === "change-me-to-a-long-random-secret") {
    console.warn("APP_API_KEY is still the example value. Android GET /api/inquiries will be rejected.");
  }
  console.log(`GK Solutions API listening on 0.0.0.0:${PORT} (${store.kind})`);
});

async function shutdown() {
  server.close();
  await store.close();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
