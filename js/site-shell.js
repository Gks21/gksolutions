(function () {
  const base = document.body.dataset.base || "";
  const page = document.body.dataset.page || "";
  const p = base ? base + "/" : "";

  const navItems = [
    { id: "home", label: "Home", href: "index.html" },
    { id: "services", label: "Services", href: "services.html" },
    { id: "pricing", label: "Pricing", href: "pricing.html" },
    { id: "book", label: "Book", href: "book.html" },
    { id: "nonprofits", label: "Nonprofits", href: "nonprofits.html" },
    { id: "about", label: "About", href: "about.html" },
    { id: "contact", label: "Contact", href: "contact.html" },
  ];

  const footerLinks = [
    { label: "Services", href: "services.html" },
    { label: "Pricing", href: "pricing.html" },
    { label: "Support Plans", href: "support-plans.html" },
    { label: "Book", href: "book.html" },
    { label: "Nonprofits", href: "nonprofits.html" },
    { label: "About", href: "about.html" },
    { label: "Contact", href: "contact.html" },
    { label: "Policies", href: "policies.html" },
  ];

  function link(href) {
    return p + href;
  }

  function navLink(item) {
    const current = item.id === page ? ' aria-current="page"' : "";
    return `<li><a href="${link(item.href)}" data-nav="${item.id}"${current}>${item.label}</a></li>`;
  }

  const headerEl = document.getElementById("site-header");
  if (headerEl) {
    headerEl.outerHTML = `
  <header class="header" id="header">
    <nav class="nav container">
      <a href="${link("index.html")}" class="logo">
        <img src="${link("img/gks_logo_tp.png")}" alt="GK Solutions" class="logo-mark" width="48" height="48" />
      </a>
      <button class="nav-toggle" id="nav-toggle" aria-label="Open menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
      <ul class="nav-links" id="nav-links">
        ${navItems.map(navLink).join("")}
      </ul>
      <div class="nav-actions">
        <a href="${link("book.html")}" class="btn btn-primary btn-sm">Book a Service</a>
        <a href="${link("quote.html")}" class="btn btn-secondary btn-sm">Request a Quote</a>
      </div>
    </nav>
  </header>`;
  }

  const footerEl = document.getElementById("site-footer");
  if (footerEl) {
    footerEl.outerHTML = `
  <footer class="footer">
    <div class="container footer-inner">
      <div class="footer-brand">
        <a href="${link("index.html")}" class="brand brand--footer">
          <img src="${link("img/gks_logo_tp.png")}" alt="" class="brand-mark" width="48" height="48" />
          <img src="${link("img/gks_txt_tp.png")}" alt="GK Solutions" class="brand-text" width="140" height="40" />
        </a>
        <p class="footer-tagline">Curiosity, Built In.</p>
      </div>
      <div class="footer-contact">
        <a href="mailto:support@gks.software">support@gks.software</a>
      </div>
      <nav class="footer-links" aria-label="Footer">
        ${footerLinks.map((l) => `<a href="${link(l.href)}">${l.label}</a>`).join("")}
      </nav>
      <p class="footer-copy">&copy; <span id="year"></span> GK Solutions LLC</p>
    </div>
  </footer>`;
  }

  const mobileEl = document.getElementById("site-mobile-actions");
  if (mobileEl) {
    mobileEl.outerHTML = `
  <div class="mobile-actions" aria-label="Quick actions">
    <a href="${link("book.html")}" class="btn btn-primary">Book a Service</a>
    <a href="${link("quote.html")}" class="btn btn-secondary">Request a Quote</a>
  </div>`;
  }
})();
