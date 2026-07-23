# GK Solutions LLC — Website

Multi-page service platform for GK Solutions — IT support, consulting, websites, custom software, setups, and media conversion.

## Pages

| Page | File | Description |
|------|------|-------------|
| Home | `index.html` | Hero, featured services, audience types, trust section |
| Services | `services.html` | Full service catalog with details |
| Pricing | `pricing.html` | Rates by client type + support plans |
| Book | `book.html` | 7-step booking wizard with pricing preview |
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

## Contact forms

Forms submit to **support@gks.software** via [FormSubmit](https://formsubmit.co).

**Requirements:**
- Site must be served over HTTP/HTTPS (not opened as a `file://` page)
- First submission triggers an activation email to support@gks.software — click the link to enable delivery

Forms are handled in `js/main.js` (contact, quote) and `js/booking.js` (booking wizard).

## Deploy

Deploy to Netlify, Vercel, or GitHub Pages. HTTPS is required for form submissions.
