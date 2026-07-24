# GK Solutions LLC — Website

Multi-page service platform for GK Solutions — IT support, consulting, websites, custom software, setups, and media conversion.

## Pages

| Page | File | Description |
|------|------|-------------|
| Home | `index.html` | Hero, featured services, audience types, trust section |
| Services (browse) | `services.html` | Service catalog index with cards |
| Service details | `services/*.html` | Individual pages per service |
| Pricing | `pricing.html` | Hourly rates by client type |
| Support Plans | `support-plans.html` | Prepaid support bundles |
| Book | `book.html` | 7-step booking wizard |
| Quote | `quote.html` | Project quote request form |
| Media Conversion | `media-conversion.html` | VHS/DVD pricing, process, privacy |
| Nonprofits | `nonprofits.html` | Nonprofit program overview |
| About | `about.html` | Company background |
| Contact | `contact.html` | Contact form and business details |
| Policies | `policies.html` | Deposits, cancellations, payment, data |

## Preview locally

```bash
python -m http.server 8080
```

Visit [http://localhost:8080](http://localhost:8080).

## Layout

Shared header, footer, and mobile action bar are injected by `js/site-shell.js` on each page. Service pages in `services/` use `data-base=".."` for correct relative paths.

To regenerate service detail pages after editing content:

```bash
python3 scripts/generate-services.py
```

## Contact forms

Forms submit to **support@gks.software** via [FormSubmit](https://formsubmit.co).

**Requirements:**
- Site must be served over HTTP/HTTPS (not opened as a `file://` page)
- First submission triggers an activation email to support@gks.software — click the link to enable delivery

Forms are handled in `js/main.js` (contact, quote) and `js/booking.js` (booking wizard).

## Deploy

Deploy to Netlify, Vercel, or GitHub Pages. HTTPS is required for form submissions.
