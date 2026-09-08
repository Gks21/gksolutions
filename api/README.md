# GK Solutions API

Receives website form submissions and serves them to the Android app.

```
Website (gks.software)  --POST-->  this API  --SQLite/Postgres-->
Android app             --GET--->  this API
```

The phone never talks to the website.

## Quick start

```bash
cd api
cp .env.example .env
# edit APP_API_KEY to a long random secret
npm install
npm run dev
```

API base for Android Settings: `http://10.0.2.2:8787` (emulator) or your LAN IP / deployed HTTPS URL.

## Endpoints

### `POST /api/inquiries` (website)

Public (CORS-limited). Body example:

```json
{
  "type": "BOOKING",
  "clientType": "INDIVIDUAL",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "555-0100",
  "service": "Remote IT Support",
  "message": "Laptop will not boot",
  "deviceOrSystem": "Windows laptop",
  "remoteOrOnsite": "REMOTE",
  "preferredDateTime": 1710000000000,
  "companyWebsite": ""
}
```

`type` may be `BOOKING`, `QUOTE`, `CONTACT`, or `COMMUNITY`.

Include empty honeypot field `companyWebsite: ""` on the form (bots that fill it are ignored).

### `GET /api/inquiries` (Android)

Requires header: `X-Api-Key: <APP_API_KEY>`

Optional: `?since=<epochMillis>`

```json
{
  "inquiries": [
    {
      "id": "uuid",
      "type": "BOOKING",
      "clientType": "INDIVIDUAL",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "phone": "555-0100",
      "service": "Remote IT Support",
      "message": "...",
      "deviceOrSystem": "Windows laptop",
      "remoteOrOnsite": "REMOTE",
      "preferredDateTime": 1710000000000,
      "submittedAt": 1710000000000
    }
  ]
}
```

### `GET /health`

Liveness check.

## Website wiring

The booking, quote, and contact forms POST here from `js/inquiries-api.js`. Local pages use `http://localhost:8787`. The live site uses `https://api.gks.software`. FormSubmit remains a backup if the API is unreachable.

## How to host this (the website is already hosted)

[gks.software](https://gks.software) is static files on **GitHub Pages**. That cannot run this API. The API is a small Node server that has to stay on 24/7. Host it on [Render](https://render.com) (easiest dashboard), then point `api.gks.software` at it.

You need a Render account (sign in with GitHub) and access to DNS for `gks.software`. This is not free: a starter web service plus a tiny Postgres is typically about **$14/month**.

### 1. Merge the API into `main`

The live site only deploys from `main`. Merge the inquiries-api pull request first (or Render can deploy from this branch, then switch to `main` after merge).

### 2. Create the service on Render

**Option A — Blueprint (fastest if you are comfortable)**

1. Open [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**.
2. Connect the `Gks21/gksolutions` repo. Render reads `render.yaml` in the repo root.
3. Apply. That creates:
   - web service `gks-api` (Docker, from `api/`)
   - Postgres `gks-inquiries` (inquiries persist across deploys)
4. Wait until the deploy is **Live**.

**Option B — Click through the dashboard**

1. **New** → **Postgres**. Name it `gks-inquiries`. Create it and copy the **Internal Database URL**.
2. **New** → **Web Service** → this GitHub repo.
3. Settings:
   - **Language / Runtime:** Docker
   - **Branch:** `main` (or `cursor/inquiries-api-345b` until that is merged)
   - **Root Directory:** `api`
   - **Dockerfile Path:** `./Dockerfile`
4. Environment variables:

   | Key | Value |
   |-----|--------|
   | `APP_API_KEY` | a long random secret (password manager or `openssl rand -hex 32`) |
   | `CORS_ORIGINS` | `https://gks.software` |
   | `DATABASE_URL` | the Internal Database URL from the Postgres service |
   | `NODE_ENV` | `production` |

   Render sets `PORT` for you. Do not copy `.env` into the repo.

5. Deploy and wait until it is **Live**.

### 3. Confirm it is up

Open the Render URL (something like `https://gks-api.onrender.com/health`). You should see:

```json
{"ok":true,"store":"postgres"}
```

If `store` is `sqlite`, `DATABASE_URL` is missing and inquiries will disappear on the next deploy.

### 4. Point `api.gks.software` at Render

1. In Render: the web service → **Settings** → **Custom Domains** → add `api.gks.software`.
2. At your DNS host (Cloudflare, Namecheap, Google Domains, wherever `gks.software` is managed — **not** the GitHub `CNAME` file), add:

   | Type | Name | Target |
   |------|------|--------|
   | CNAME | `api` | `gks-api.onrender.com` (use the exact hostname Render shows) |

   Do not change the existing apex/`www` records that send the marketing site to GitHub Pages.

3. Back in Render, click **Verify**. HTTPS is issued automatically.
4. Check `https://api.gks.software/health`.

### 5. Point the Android app at it

API base: `https://api.gks.software`

Header: `X-Api-Key: <the same APP_API_KEY from Render → Environment>`

Keep that key only in Render and in the phone’s secure settings. Never put it in the website.

### After it is live

Website forms on [gks.software](https://gks.software) already POST to `https://api.gks.software/api/inquiries` once this branch is on `main`. If the API is down, they still fall back to FormSubmit email.

## Other hosts

Same Docker image works on Fly.io, Railway, or a VPS. You still need HTTPS, `APP_API_KEY`, `CORS_ORIGINS=https://gks.software`, and `DATABASE_URL` (or a persistent disk if you stay on SQLite). Render is the path above because it does HTTPS and the custom domain without a CLI.

## Production notes

- Rotate `APP_API_KEY` if it leaks. Update Render and the Android app together.
- `sql/schema.postgres.sql` is applied automatically on boot when `DATABASE_URL` is set.
- Do not use local SQLite in production without a persistent disk — deploys wipe the container filesystem.
