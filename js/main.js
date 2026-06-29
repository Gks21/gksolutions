(function () {
  const FORM_ENDPOINT = "https://formsubmit.co/ajax/support@gks.software";
  const header = document.getElementById("header");
  const navToggle = document.getElementById("nav-toggle");
  const navLinks = document.getElementById("nav-links");
  const yearEl = document.getElementById("year");

  if (yearEl) yearEl.textContent = new Date().getFullYear();

  if (header) {
    window.addEventListener("scroll", () => {
      header.classList.toggle("scrolled", window.scrollY > 20);
    });
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("open");
      navToggle.classList.toggle("active", open);
      navToggle.setAttribute("aria-expanded", open);
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        navToggle.classList.remove("active");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Open menu");
      });
    });
  }

  const revealEls = document.querySelectorAll(
    ".service-card, .expect-card, .about-inner, .hero-brand-wrap, .hero-headline, .hero-subtitle, .hero-actions, .volunteer-content, .volunteer-form, .contact-info, .contact-form, .section-header, .tag-list, .process-steps"
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
      const response = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(buildPayload(form, options)),
      });

      let result = {};
      try {
        result = await response.json();
      } catch {
        throw new Error("Unexpected response from the server.");
      }

      const failed =
        !response.ok ||
        result.success === false ||
        result.success === "false";

      if (failed) {
        throw new Error(
          result.message ||
            "The form could not be sent. Please email support@gks.software directly."
        );
      }

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
        successMessage: "Message sent — I'll get back to you soon.",
        subject: (data) => `Project inquiry from ${data.get("name")}`,
      });
    });
  }

  const volunteerForm = document.getElementById("volunteer-form");
  if (volunteerForm) {
    volunteerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      submitForm(volunteerForm, {
        noteId: "volunteer-form-note",
        successMessage: "Message sent — I'll be in touch if it's a good fit.",
        subject: (data) =>
          `Community inquiry — ${data.get("organization") || data.get("name")}`,
      });
    });
  }
})();
