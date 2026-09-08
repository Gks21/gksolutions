# GK Solutions LLC — Website

Multi-page service platform for GK Solutions — IT support, consulting, websites, custom software, setups, and media conversion.

## Pages

| Page | File | Description |
|------|------|-------------|
| Home | `index.html` | Hero, services, audiences, pricing/support teasers, media, nonprofit, roadmap |
| Services (browse) | `services.html` | Service catalog with large panels |
| Service details | `services/*.html` | Individual pages per service |
| Pricing | `pricing.html` | Client-type selector with rates |
| Support Plans | `support-plans.html` | Pay-as-needed, monthly, and annual support |
| Book | `book.html` | 7-step booking wizard |
| Quote | `quote.html` | Project quote request form |
| Media Conversion | `media-conversion.html` | VHS/DVD pricing, process, privacy |
| Nonprofits | `nonprofits.html` | Nonprofit program overview |
| About | `about.html` | Company background |
| Contact | `contact.html` | Contact form and business details |
| Policies | `policies.html` | Deposits, cancellations, payment, data |
| Terms | `terms.html` | Terms & Agreement for bookings and service |
| 404 | `404.html` | Custom GitHub Pages not-found page |

## Preview locally

```bash
python3 -m http.server 8080
```

Visit [http://localhost:8080](http://localhost:8080).

Live site: [https://gks.software](https://gks.software).

## Layout

Shared header, footer, and mobile action bar are injected by `js/site-shell.js` on each page. Service pages in `services/` use `data-base=".."` for correct relative paths.

To regenerate service detail pages after editing content:

```bash
python3 scripts/generate-services.py
```

## Contact forms

Booking, quote, and contact forms POST to the GK Solutions API (`/api/inquiries`) so the Android app can pull them. FormSubmit to **support@gks.software** is kept as an email backup if the API is unreachable.

Local pages talk to `http://localhost:8787`. The live site talks to `https://api.gks.software`.

See `api/README.md` for API setup.

**Requirements:**
- Site must be served over HTTP/HTTPS (not opened as a `file://` page)
- For local form tests, run the API (`cd api && npm run dev`) alongside `python3 -m http.server 8080`

Forms are handled in `js/inquiries-api.js`, `js/main.js` (contact, quote), and `js/booking.js` (booking wizard).

## Deploy

GitHub Pages deploys from `main` via `.github/workflows/static.yml` to [gks.software](https://gks.software). The `api/` service is not part of Pages — host it separately over HTTPS.
