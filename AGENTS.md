# AGENTS.md

## Cursor Cloud specific instructions

### What this is
Static, multi-page marketing/booking website for **GK Solutions LLC** — plain HTML, CSS, and vanilla JavaScript. There is **no build step, no package manager, and no dependencies** (no `package.json`, no `requirements.txt`). Python 3 from the system is the only tool needed, and it is preinstalled.

### Run it (development)
Serve from the repo root over HTTP (README documents this):

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080/`. Serving over HTTP (not opening `file://` pages) is **required** — the shared layout and forms both depend on it (see below).

### Lint / test / build
There is **no linter, no automated test suite, and no build** in this repo. Deployment is handled by GitHub Actions to GitHub Pages (`.github/workflows/static.yml`), which just uploads the repo as-is. Do not expect a `test`/`lint`/`build` command to exist.

### Non-obvious gotchas
- **Shared shell is injected by JS.** The header, footer, and mobile action bar are empty `<div>`s (`#site-header`, `#site-footer`, `#site-mobile-actions`) populated at runtime by `js/site-shell.js`. If you open a page as a `file://` URL the shell (and forms) will not work — always use the local HTTP server.
- **Service detail pages** in `services/*.html` set `data-base=".."` so `site-shell.js` resolves relative asset/link paths correctly. Keep that attribute when adding new service pages.
- **Regenerating service pages:** `services/*.html` are generated from a template. After editing service content in `scripts/generate-services.py`, regenerate with `python3 scripts/generate-services.py` (it overwrites the `services/*.html` files). Running it with no edits produces no diff.
- **Forms POST to a real external service.** Contact/quote forms (`js/main.js`) and the booking wizard (`js/booking.js`) submit to FormSubmit (`support@gks.software`). Completing the final submit step sends a real network request, and FormSubmit requires a one-time email activation on first use. When testing the booking wizard end-to-end, be aware the last "Confirm booking request" step triggers that external POST — stop before it if you don't intend to submit.
