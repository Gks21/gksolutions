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

## Production notes

- Put the API behind HTTPS (Fly.io, Railway, Render, VPS, etc.).
- Rotate `APP_API_KEY` and store it only in server env + Android secure preferences later.
- `sql/schema.postgres.sql` is ready when you move off local SQLite. Set `DATABASE_URL` and restart.
