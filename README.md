# GK Solutions LLC — Website

Static site for Greg Shaw / GK Solutions — independent developer, Southern Indiana.

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

**Testing locally:** `python -m http.server 8080` then visit `http://localhost:8080`

## Customize

- **Email** — `support@gks.software` in `index.html` and `js/main.js`
- **Copy** — Edit `index.html` directly

## Deploy

Deploy to Netlify, Vercel, or GitHub Pages. HTTPS is required for form submissions.
