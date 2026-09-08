(function () {
  const header = document.getElementById("header");
  const navToggle = document.getElementById("nav-toggle");
  const navLinks = document.getElementById("nav-links");
  const yearEl = document.getElementById("year");

  if (yearEl) yearEl.textContent = new Date().getFullYear();

  function setMenuOpen(open) {
    if (!navToggle || !navLinks) return;
    navLinks.classList.toggle("open", open);
    navToggle.classList.toggle("active", open);
    navToggle.setAttribute("aria-expanded", open);
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.classList.toggle("nav-open", open);
  }

  if (header) {
    window.addEventListener("scroll", () => {
      header.classList.toggle("scrolled", window.scrollY > 20);
    });
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      setMenuOpen(!navLinks.classList.contains("open"));
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setMenuOpen(false));
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 900) setMenuOpen(false);
    });
  }

  const revealEls = document.querySelectorAll(
    ".service-card, .expect-card, .feature-card, .path-card, .help-card, .audience-card, .step-card, .plan-card, .service-block, .trust-item, .about-inner, .hero-copy, .hero-visual, .hero-actions, .volunteer-content, .volunteer-form, .contact-info, .contact-form, .section-header, .tag-list, .process-steps, .page-hero .container, .booking-wizard, .service-catalog, .audience-list, .steps-row, .split-block, .service-panel, .audience-scale-card, .teaser-card, .support-option, .process-row, .roadmap-card, .feature-split, .intro-prose, .media-rate-card, .pricing-panel, .cta-book"
  );
  revealEls.forEach((el) => el.classList.add("reveal"));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
  );
  revealEls.forEach((el) => observer.observe(el));

  function showFormNote(note, message, type) {
    if (!note) return;
    note.hidden = false;
    note.textContent = message;
    note.className = `form-note ${type}`;
    note.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function buildPayload(form, options) {
    const data = new FormData(form);
    const payload = {
      _subject: options.subject(data),
      _template: "table",
      _captcha: "false",
    };

    const email = data.get("email");
    if (email) payload._replyto = email;

    for (const [key, value] of data.entries()) {
      if (key === "_gotcha") continue;
      if (value) payload[key] = value;
    }

    return payload;
  }

  async function submitForm(form, options) {
    const note = document.getElementById(options.noteId);
    const submitBtn = form.querySelector('button[type="submit"]');
    if (!submitBtn) return;

    const originalLabel = submitBtn.textContent;
    const honeypot = form.querySelector('[name="_gotcha"]');

    if (honeypot?.value) {
      showFormNote(note, "Something went wrong. Please try again.", "error");
      return;
    }

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    if (window.location.protocol === "file:") {
      showFormNote(
        note,
        "Forms need to run from a web server. Open the site at your live URL or use a local server, then try again.",
        "error"
      );
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";
    if (note) note.hidden = true;

    try {
      if (!window.GKS?.submitInquiry) {
        throw new Error("The inquiry service is not available on this page.");
      }

      const data = new FormData(form);
      const inquiry = options.toInquiry(data);
      let emailPayload;

      if (options.useFormData) {
        data.append("_subject", options.subject(data));
        data.append("_template", "table");
        data.append("_captcha", "false");
        const email = data.get("email");
        if (email) data.append("_replyto", email);
        data.delete("_gotcha");
        emailPayload = data;
      } else {
        emailPayload = buildPayload(form, options);
      }

      await window.GKS.submitInquiry(inquiry, emailPayload, {
        useFormData: Boolean(options.useFormData),
      });

      form.reset();
      showFormNote(note, options.successMessage, "success");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please email support@gks.software directly.";
      showFormNote(note, message, "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel;
    }
  }

  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      submitForm(contactForm, {
        noteId: "form-note",
        successMessage: "Message sent — we'll get back to you soon.",
        subject: (data) => `Contact from ${data.get("name")}`,
        toInquiry: (data) => ({
          type: "CONTACT",
          name: data.get("name"),
          email: data.get("email"),
          phone: data.get("phone") || "",
          service: "Contact",
          message: data.get("message") || "",
          companyWebsite: data.get("companyWebsite") || "",
        }),
      });
    });
  }

  const quoteForm = document.getElementById("quote-form");
  if (quoteForm) {
    quoteForm.addEventListener("submit", (e) => {
      e.preventDefault();
      submitForm(quoteForm, {
        noteId: "quote-form-note",
        successMessage:
          "Quote request received — we'll review your project and follow up with next steps.",
        subject: (data) =>
          `Quote request: ${data.get("project_type")} — ${data.get("name")}`,
        useFormData: true,
        toInquiry: (data) => ({
          type: "QUOTE",
          clientType: window.GKS.mapClientType(data.get("client_type")),
          name: data.get("name"),
          email: data.get("email"),
          phone: data.get("phone") || "",
          service: data.get("project_type") || "Quote request",
          message: [
            data.get("description"),
            data.get("current_problem") && `Current problem: ${data.get("current_problem")}`,
            data.get("desired_outcome") && `Desired outcome: ${data.get("desired_outcome")}`,
            data.get("existing_systems") && `Existing systems: ${data.get("existing_systems")}`,
          ]
            .filter(Boolean)
            .join("\n\n"),
          companyWebsite: data.get("companyWebsite") || "",
          details: {
            organization: data.get("organization") || "",
            timeline: data.get("timeline") || "",
            budget: data.get("budget") || "",
            contactMethod: data.get("contact_method") || "",
          },
        }),
      });
    });
  }

  const pricingSwitcher = document.getElementById("pricing-switcher");
  if (pricingSwitcher) {
    const tabs = [...pricingSwitcher.querySelectorAll("[data-panel]")];
    const panels = [...document.querySelectorAll(".pricing-panel[data-panel]")];

    function showPanel(id) {
      const valid = tabs.some((tab) => tab.dataset.panel === id);
      const next = valid ? id : "individual";
      tabs.forEach((tab) => {
        const selected = tab.dataset.panel === next;
        tab.setAttribute("aria-selected", selected);
      });
      panels.forEach((panel) => {
        panel.hidden = panel.dataset.panel !== next;
      });
      if (history.replaceState) {
        history.replaceState(null, "", `#${next}`);
      }
    }

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => showPanel(tab.dataset.panel));
    });

    const hash = window.location.hash.replace("#", "");
    showPanel(hash);
  }

  const volunteerForm = document.getElementById("volunteer-form");
  if (volunteerForm) {
    volunteerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      submitForm(volunteerForm, {
        noteId: "volunteer-form-note",
        successMessage: "Message sent — we'll be in touch if it's a good fit.",
        subject: (data) =>
          `Community inquiry — ${data.get("organization") || data.get("name")}`,
        toInquiry: (data) => ({
          type: "COMMUNITY",
          name: data.get("name"),
          email: data.get("email"),
          phone: data.get("phone") || "",
          service: "Community inquiry",
          message: data.get("message") || "",
          companyWebsite: data.get("companyWebsite") || "",
          details: { organization: data.get("organization") || "" },
        }),
      });
    });
  }
})();
