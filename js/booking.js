(function () {
  const FORM_ENDPOINT = "https://formsubmit.co/ajax/support@gks.software";
  const TOTAL_STEPS = 7;

  const CLIENT_LABELS = {
    individual: "Individual",
    small_business: "Small Business",
    nonprofit: "Nonprofit",
    enterprise: "Enterprise or Organization",
  };

  const SERVICES = [
    { id: "consultation", label: "Consultation", desc: "Technology evaluation and recommendations" },
    { id: "remote", label: "Remote Support", desc: "Diagnose and resolve issues remotely" },
    { id: "onsite", label: "On-Site Support", desc: "In-person technical assistance" },
    { id: "setup", label: "Setup Service", desc: "Device and software installation" },
    { id: "network", label: "Network & Wi-Fi", desc: "Connectivity and network equipment" },
    { id: "media_pickup", label: "Media Conversion Pickup", desc: "Schedule media pickup appointment" },
    { id: "website_consult", label: "Website Consultation", desc: "Discuss website project needs" },
    { id: "software_consult", label: "Software Consultation", desc: "Discuss custom software needs" },
    { id: "general", label: "General Inquiry", desc: "Other questions or needs" },
  ];

  const PRICING = {
    individual: {
      consultation: { price: "$10", deposit: "$5", included: "Discussion, intake, and technology recommendations.", extra: "Hands-on labor is billed separately.", quote: false },
      remote: { price: "$45/hour", deposit: "$5", included: "Remote diagnosis and troubleshooting.", extra: "Parts, software licenses, and additional hours.", quote: false },
      onsite: { price: "$60/hour", deposit: "$5", included: "On-site diagnosis and troubleshooting.", extra: "Travel beyond service area, parts, and additional hours.", quote: false },
      setup: { price: "Flat rate (varies)", deposit: "$5", included: "Device setup and configuration.", extra: "Software licenses and complex migrations.", quote: "estimate" },
      network: { price: "Varies", deposit: "$5", included: "Network evaluation and basic setup.", extra: "Hardware and equipment costs.", quote: "estimate" },
      media_pickup: { price: "From $10/disc", deposit: "$5", included: "Pickup appointment and item documentation.", extra: "Conversion costs based on media type and length.", quote: false },
      website_consult: { price: "$10 consultation", deposit: "$5", included: "Project discussion and initial recommendations.", extra: "Full website projects require a written quote.", quote: true },
      software_consult: { price: "$10 consultation", deposit: "$5", included: "Requirements discussion and initial recommendations.", extra: "Development work requires a custom quote.", quote: true },
      general: { price: "Varies", deposit: "$5", included: "Initial discussion to determine next steps.", extra: "Depends on scope of work.", quote: false },
    },
    small_business: {
      consultation: { price: "$20 (applied toward work)", deposit: "$5", included: "Discussion, intake, and recommendations.", extra: "Hands-on labor billed separately.", quote: false },
      remote: { price: "$65/hour", deposit: "$5", included: "Remote diagnosis and troubleshooting.", extra: "Parts, licenses, and additional hours.", quote: false },
      onsite: { price: "$80/hour", deposit: "$5", included: "On-site diagnosis and troubleshooting.", extra: "Travel, parts, and additional hours.", quote: false },
      setup: { price: "Fixed pricing (varies)", deposit: "$5", included: "Workstation and device setup.", extra: "Licenses and complex migrations.", quote: "estimate" },
      network: { price: "Written quote", deposit: "$5", included: "Network planning consultation.", extra: "Hardware and equipment.", quote: true },
      media_pickup: { price: "From $10/disc", deposit: "$5", included: "Pickup and documentation.", extra: "Conversion costs.", quote: false },
      website_consult: { price: "$20 consultation", deposit: "$5", included: "Project scoping discussion.", extra: "Full projects require a written quote.", quote: true },
      software_consult: { price: "$20 consultation", deposit: "$5", included: "Requirements discussion.", extra: "Development requires a custom quote.", quote: true },
      general: { price: "Varies", deposit: "$5", included: "Initial discussion.", extra: "Depends on scope.", quote: false },
    },
    nonprofit: {
      consultation: { price: "Free", deposit: "$5", included: "Free advising and recommendations.", extra: "Hands-on labor billed at nonprofit rates.", quote: false },
      remote: { price: "$25/hour", deposit: "$5", included: "Remote diagnosis and troubleshooting.", extra: "Parts and additional hours.", quote: false },
      onsite: { price: "$35/hour", deposit: "$5", included: "On-site diagnosis and troubleshooting.", extra: "Travel, parts, and additional hours.", quote: false },
      setup: { price: "$50/workstation", deposit: "$5", included: "Workstation setup.", extra: "Licenses and complex migrations.", quote: false },
      network: { price: "Starting at $75", deposit: "$5", included: "Basic network services.", extra: "Hardware and equipment.", quote: "estimate" },
      media_pickup: { price: "From $10/disc", deposit: "$5", included: "Pickup and documentation.", extra: "Conversion costs.", quote: false },
      website_consult: { price: "Free consultation", deposit: "$5", included: "Project discussion. Approved projects may be at no cost.", extra: "Hosting and maintenance costs.", quote: true },
      software_consult: { price: "Free consultation", deposit: "$5", included: "Requirements discussion. Approved projects may be at no cost.", extra: "Hosting and maintenance costs.", quote: true },
      general: { price: "Discounted rates", deposit: "$5", included: "Initial discussion.", extra: "Depends on scope.", quote: false },
    },
    enterprise: {
      consultation: { price: "Custom quote", deposit: "$5", included: "Scoping discussion.", extra: "All work custom quoted.", quote: true },
      remote: { price: "Custom quote", deposit: "$5", included: "Per agreement.", extra: "All work custom quoted.", quote: true },
      onsite: { price: "Custom quote", deposit: "$5", included: "Per agreement.", extra: "All work custom quoted.", quote: true },
      setup: { price: "Custom quote", deposit: "$5", included: "Per agreement.", extra: "All work custom quoted.", quote: true },
      network: { price: "Custom quote", deposit: "$5", included: "Per agreement.", extra: "Hardware separate.", quote: true },
      media_pickup: { price: "Custom quote", deposit: "$5", included: "Per agreement.", extra: "All work custom quoted.", quote: true },
      website_consult: { price: "Custom quote", deposit: "$5", included: "Per agreement.", extra: "All work custom quoted.", quote: true },
      software_consult: { price: "Custom quote", deposit: "$5", included: "Per agreement.", extra: "All work custom quoted.", quote: true },
      general: { price: "Custom quote", deposit: "$5", included: "Initial discussion.", extra: "All work custom quoted.", quote: true },
    },
  };

  const SUPPORT_SLOTS = ["9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"];
  const PICKUP_SLOTS = ["10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM"];

  const wizard = document.getElementById("booking-wizard");
  if (!wizard) return;

  const state = {
    step: 1,
    clientType: null,
    service: null,
    selectedTime: null,
    submitted: false,
  };

  const progressEl = document.getElementById("booking-progress");
  const progressLabels = document.getElementById("booking-progress-labels");
  const bookingFeedback = document.getElementById("booking-feedback");
  const bookingLayout = document.getElementById("booking-layout");
  const bookingSummary = document.getElementById("booking-summary");
  const bookingSummaryContent = document.getElementById("booking-summary-content");
  const clientChoices = document.getElementById("client-type-choices");
  const serviceChoices = document.getElementById("service-choices");
  const pricingPreview = document.getElementById("pricing-preview");
  const timeSlots = document.getElementById("time-slots");
  const bookingDate = document.getElementById("booking-date");
  const scheduleDesc = document.getElementById("schedule-desc");
  const bookingBack = document.getElementById("booking-back");
  const bookingNext = document.getElementById("booking-next");
  const bookingNav = document.getElementById("booking-nav");
  const intakeForm = document.getElementById("intake-form");
  const confirmationEl = document.getElementById("booking-confirmation");

  function getServiceLabel(id) {
    return SERVICES.find((s) => s.id === id)?.label || id;
  }

  function getPricing() {
    if (!state.clientType || !state.service) return null;
    return PRICING[state.clientType]?.[state.service] || null;
  }

  function renderServices() {
    serviceChoices.innerHTML = SERVICES.map(
      (s) =>
        `<button type="button" class="choice-btn${state.service === s.id ? " selected" : ""}" data-value="${s.id}"><strong>${s.label}</strong><span>${s.desc}</span></button>`
    ).join("");
    serviceChoices.querySelectorAll(".choice-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.service = btn.dataset.value;
        serviceChoices.querySelectorAll(".choice-btn").forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
        updateSummary();
      });
    });
  }

  function renderPricing() {
    const p = getPricing();
    if (!p) return;
    const quoteNote = p.quote === true
      ? "<p>A final written quote is required before work begins.</p>"
      : p.quote === "estimate"
        ? "<p>An estimate will be provided before work begins.</p>"
        : "";
    pricingPreview.innerHTML = `
      <h3>${getServiceLabel(state.service)} — ${CLIENT_LABELS[state.clientType]}</h3>
      <dl>
        <dt>Starting / fixed price</dt>
        <dd class="highlight">${p.price}</dd>
        <dt>Deposit required</dt>
        <dd>${p.deposit} (nonrefundable for missed appointments or late cancellations)</dd>
        <dt>What's included</dt>
        <dd>${p.included}</dd>
        <dt>May cost extra</dt>
        <dd>${p.extra}</dd>
      </dl>
      ${quoteNote}
    `;
  }

  function renderTimeSlots() {
    const isPickup = state.service === "media_pickup";
    const slots = isPickup ? PICKUP_SLOTS : SUPPORT_SLOTS;
    scheduleDesc.textContent = isPickup
      ? "Select a pickup appointment window."
      : "Select an available support appointment window.";
    timeSlots.innerHTML = slots
      .map(
        (slot) =>
          `<button type="button" class="time-slot${state.selectedTime === slot ? " selected" : ""}" data-time="${slot}">${slot}</button>`
      )
      .join("");
    timeSlots.querySelectorAll(".time-slot").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.selectedTime = btn.dataset.time;
        timeSlots.querySelectorAll(".time-slot").forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
        updateSummary();
      });
    });
  }

  function setMinDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const y = tomorrow.getFullYear();
    const m = String(tomorrow.getMonth() + 1).padStart(2, "0");
    const d = String(tomorrow.getDate()).padStart(2, "0");
    const localDate = `${y}-${m}-${d}`;
    bookingDate.min = localDate;
    if (!bookingDate.value) bookingDate.value = localDate;
  }

  function showError(message) {
    if (!bookingFeedback) return;
    bookingFeedback.textContent = message;
    bookingFeedback.className = "booking-feedback visible error";
    bookingFeedback.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function clearError() {
    if (!bookingFeedback) return;
    bookingFeedback.textContent = "";
    bookingFeedback.className = "booking-feedback";
  }

  function updateSummary() {
    if (!bookingSummary || !bookingSummaryContent || !bookingLayout) return;

    const parts = [];
    if (state.clientType) {
      parts.push(`<div><dt>Client type</dt><dd>${CLIENT_LABELS[state.clientType]}</dd></div>`);
    }
    if (state.service) {
      parts.push(`<div><dt>Service</dt><dd>${getServiceLabel(state.service)}</dd></div>`);
    }
    const p = getPricing();
    if (p) {
      parts.push(`<div><dt>Starting price</dt><dd>${p.price}</dd></div>`);
    }
    if (bookingDate?.value && state.selectedTime) {
      const date = new Date(bookingDate.value + "T12:00:00");
      const dateStr = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
      parts.push(`<div><dt>Appointment</dt><dd>${dateStr} at ${state.selectedTime}</dd></div>`);
    }

    const hasSummary = parts.length > 0;
    bookingSummaryContent.innerHTML = parts.join("");
    bookingSummary.classList.toggle("visible", hasSummary && state.step < TOTAL_STEPS);
    bookingLayout.classList.toggle("has-summary", hasSummary && state.step >= 2 && state.step < TOTAL_STEPS);
  }

  function updateProgress() {
    progressEl.querySelectorAll(".booking-progress-step").forEach((el, i) => {
      el.classList.toggle("active", i < state.step);
      el.classList.toggle("complete", i < state.step - 1);
    });
    if (progressLabels) {
      progressLabels.querySelectorAll("span").forEach((el, i) => {
        el.classList.toggle("active", i + 1 === state.step);
      });
    }
  }

  function showStep(step) {
    state.step = step;
    clearError();
    wizard.querySelectorAll(".booking-panel").forEach((panel) => {
      panel.classList.toggle("active", Number(panel.dataset.step) === step);
    });
    bookingBack.hidden = step <= 1 || step >= TOTAL_STEPS;
    bookingNext.hidden = step >= TOTAL_STEPS;
    bookingNav.hidden = step >= TOTAL_STEPS;

    if (step === 2) renderServices();
    if (step === 3) renderPricing();
    if (step === 5) {
      setMinDate();
      renderTimeSlots();
    }

    if (step === 6) {
      bookingNext.textContent = "Confirm booking request";
    } else if (step < TOTAL_STEPS) {
      bookingNext.textContent = "Continue";
    }

    updateProgress();
    updateSummary();
    const scrollTarget = document.getElementById("booking-wizard");
    if (scrollTarget) scrollTarget.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function validateStep() {
    clearError();
    switch (state.step) {
      case 1:
        if (!state.clientType) {
          showError("Please select a client type to continue.");
          return false;
        }
        return true;
      case 2:
        if (!state.service) {
          showError("Please select a service to continue.");
          return false;
        }
        return true;
      case 4:
        if (!intakeForm.checkValidity()) {
          intakeForm.reportValidity();
          return false;
        }
        return true;
      case 5:
        if (!bookingDate.value || !state.selectedTime) {
          showError("Please select a date and time for your appointment.");
          return false;
        }
        return true;
      default:
        return true;
    }
  }

  function buildConfirmation() {
    const p = getPricing();
    const date = new Date(bookingDate.value + "T12:00:00");
    const dateStr = date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

    confirmationEl.innerHTML = `
      <h3>Booking request received</h3>
      <p class="booking-confirm-lead">We'll review your request and follow up to confirm your appointment and collect the deposit.</p>
      <dl class="confirmation-detail">
        <dt>Requested date &amp; time</dt>
        <dd>${dateStr} at ${state.selectedTime}</dd>
        <dt>Service</dt>
        <dd>${getServiceLabel(state.service)}</dd>
        <dt>Client type</dt>
        <dd>${CLIENT_LABELS[state.clientType]}</dd>
        <dt>Deposit required</dt>
        <dd>$5.00 — due when your appointment is confirmed</dd>
        <dt>Estimated balance</dt>
        <dd>${p ? p.price : "Per service agreement"} — due after service unless otherwise stated.</dd>
      </dl>
      <div class="deposit-notice">
        <p><strong>What's next:</strong> You'll receive a confirmation email with next steps. Payment processing will be connected soon; for now, submitting this form records your booking request and deposit agreement.</p>
        <p style="margin-top:8px"><strong>Preparation:</strong> Please have relevant devices accessible and any error messages or account details ready. For on-site visits, ensure someone is available at the scheduled time.</p>
        <p style="margin-top:8px"><strong>Contact:</strong> <a href="mailto:support@gks.software" style="color:var(--accent)">support@gks.software</a></p>
        <p style="margin-top:8px"><strong>Cancellation:</strong> Deposits are nonrefundable for missed appointments or cancellations within 24 hours. <a href="policies.html" style="color:var(--accent)">View policies →</a></p>
      </div>
    `;
  }

  async function submitBooking() {
    if (state.submitted) return true;

    const formData = new FormData(intakeForm);
    const honeypot = intakeForm.querySelector('[name="_gotcha"]');
    if (honeypot?.value) {
      showError("Something went wrong. Please try again.");
      return false;
    }

    const payload = {
      _subject: `Booking: ${getServiceLabel(state.service)} — ${formData.get("name")}`,
      _template: "table",
      _captcha: "false",
      _form_kind: "booking",
      client_type: CLIENT_LABELS[state.clientType],
      service: getServiceLabel(state.service),
      appointment_date: bookingDate.value,
      appointment_time: state.selectedTime,
      deposit: "$5.00",
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone") || "",
      need: formData.get("need"),
      device: formData.get("device") || "",
      location: formData.get("location"),
      previous: formData.get("previous") || "",
      deadline: formData.get("deadline") || "",
      data_involved: formData.get("data"),
    };

    const email = formData.get("email");
    if (email) payload._replyto = email;

    if (window.location.protocol === "file:") {
      showError(
        "Forms need to run from a web server. Open the site at your live URL or use a local server, then try again."
      );
      return false;
    }

    bookingNext.disabled = true;
    bookingNext.textContent = "Submitting…";

    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.success === false) {
        throw new Error(result.message || "Booking could not be submitted.");
      }
      buildConfirmation();
      state.submitted = true;
      return true;
    } catch (err) {
      showError(err instanceof Error ? err.message : "Something went wrong. Please email support@gks.software.");
      return false;
    } finally {
      bookingNext.disabled = false;
      bookingNext.textContent = "Confirm booking request";
    }
  }

  clientChoices.querySelectorAll(".choice-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.clientType = btn.dataset.value;
      clientChoices.querySelectorAll(".choice-btn").forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      updateSummary();
    });
  });

  bookingBack.addEventListener("click", () => {
    if (state.step > 1) showStep(state.step - 1);
  });

  bookingNext.addEventListener("click", async () => {
    if (!validateStep()) return;

    if (state.step === 6) {
      const ok = await submitBooking();
      if (ok) showStep(7);
      return;
    }

    showStep(state.step + 1);
  });

  bookingDate.addEventListener("change", () => {
    state.selectedTime = null;
    renderTimeSlots();
    updateSummary();
  });

  showStep(1);
})();
