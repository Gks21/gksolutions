(function () {
  const base = document.body.dataset.base || "";
  const page = document.body.dataset.page || "";
  const p = base ? base + "/" : "";

  const navItems = [
    { id: "home", label: "Home", href: "index.html" },
    { id: "services", label: "Services", href: "services.html" },
    { id: "pricing", label: "Pricing", href: "pricing.html" },
    { id: "support", label: "Support", href: "support-plans.html" },
    { id: "nonprofits", label: "Nonprofits", href: "nonprofits.html" },
    { id: "about", label: "About", href: "about.html" },
  ];

  const footerGroups = [
    {
      title: "Services",
      links: [
        { label: "IT Support", href: "services/it-support.html" },
        { label: "Consulting", href: "services/consulting.html" },
        { label: "Setups", href: "services/setup.html" },
        { label: "Websites", href: "services/websites.html" },
        { label: "Software", href: "services/custom-software.html" },
        { label: "Media Conversion", href: "media-conversion.html" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "about.html" },
        { label: "Nonprofits", href: "nonprofits.html" },
        { label: "Pricing", href: "pricing.html" },
        { label: "Policies", href: "policies.html" },
        { label: "Terms & Agreement", href: "terms.html" },
      ],
    },
    {
      title: "Get Started",
      links: [
        { label: "Book Service", href: "book.html" },
        { label: "Request Quote", href: "quote.html" },
        { label: "Contact", href: "contact.html" },
      ],
    },
  ];

  function link(href) {
    return p + href;
  }

  function navLink(item) {
    const current = item.id === page ? ' aria-current="page"' : "";
    return `<li><a href="${link(item.href)}" data-nav="${item.id}"${current}>${item.label}</a></li>`;
  }

  const skipLink = `<a class="skip-link" href="#main-content">Skip to content</a>`;

  const headerEl = document.getElementById("site-header");
  if (headerEl) {
    headerEl.outerHTML = `
  ${skipLink}
  <header class="header" id="header">
    <div class="header-rail">
      <div class="header-inner">
        <p>Southern Indiana &amp; Louisville · Remote nationwide</p>
        <a href="mailto:support@gks.software">support@gks.software</a>
      </div>
    </div>
    <nav class="header-bar" aria-label="Main">
      <div class="header-inner">
        <a href="${link("index.html")}" class="logo">
            <img src="${link("img/gks_round_web.png")}" alt="GK Solutions" class="logo-mark" width="48" height="48" />
            <img src="${link("img/gks_txt_tp.png")}" alt="" class="logo-text" width="140" height="40" />
        </a>
        <div class="header-end">
          <ul class="nav-links" id="nav-links">
            ${navItems.map(navLink).join("")}
            <li class="nav-mobile-cta">
              <a href="${link("book.html")}" class="btn btn-primary btn-full">Book Service</a>
            </li>
            <li class="nav-mobile-cta">
              <a href="${link("quote.html")}" class="btn btn-ghost btn-full">Request a Quote</a>
            </li>
          </ul>
          <a href="${link("quote.html")}" class="btn btn-ghost btn-sm header-cta header-quote">Request a Quote</a>
          <a href="${link("book.html")}" class="btn btn-primary btn-sm header-cta">Book Service</a>
          <button class="nav-toggle" id="nav-toggle" aria-label="Open menu" aria-expanded="false" aria-controls="nav-links">
            <span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span>
          </button>
        </div>
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
          <img src="${link("img/gks_round_web.png")}" alt="" class="brand-mark" width="48" height="48" />
          <img src="${link("img/gks_txt_tp.png")}" alt="GK Solutions" class="brand-text" width="140" height="40" />
        </a>
        <p class="footer-domain">gks.software</p>
        <a href="mailto:support@gks.software" class="footer-email">support@gks.software</a>
      </div>
      <div class="footer-columns">
        ${footerGroups
          .map(
            (group) => `
          <div class="footer-col">
            <p class="footer-col-title">${group.title}</p>
            <nav aria-label="${group.title}">
              ${group.links.map((l) => `<a href="${link(l.href)}">${l.label}</a>`).join("")}
            </nav>
          </div>`
          )
          .join("")}
      </div>
      <div class="footer-bottom">
        <p class="footer-copy">&copy; <span id="year"></span> GK Solutions LLC</p>
        <p class="footer-slogan">Curiosity, Built In.</p>
      </div>
    </div>
  </footer>`;
  }

  const mobileEl = document.getElementById("site-mobile-actions");
  if (mobileEl) {
    mobileEl.outerHTML = `
  <div class="mobile-actions" aria-label="Quick actions">
    <a href="${link("book.html")}" class="btn btn-primary">Book</a>
    <a href="${link("quote.html")}" class="btn btn-secondary">Quote</a>
  </div>`;
  }
})();
