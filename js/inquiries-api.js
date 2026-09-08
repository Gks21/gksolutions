(function (global) {
  const FORM_SUBMIT_ENDPOINT = "https://formsubmit.co/ajax/support@gks.software";

  const CLIENT_TYPES = {
    individual: "INDIVIDUAL",
    small_business: "SMALL_BUSINESS",
    nonprofit: "NONPROFIT",
    enterprise: "ENTERPRISE",
    "small business": "SMALL_BUSINESS",
    "enterprise or organization": "ENTERPRISE",
  };

  const LOCATIONS = {
    remote: "REMOTE",
    onsite: "ONSITE",
    either: "EITHER",
  };

  function apiBase() {
    if (typeof global.GKS_API_BASE === "string" && global.GKS_API_BASE) {
      return global.GKS_API_BASE.replace(/\/$/, "");
    }
    const host = global.location?.hostname || "";
    if (host === "localhost" || host === "127.0.0.1") {
      return "http://localhost:8787";
    }
    return "https://api.gks.software";
  }

  function mapClientType(value) {
    if (!value) return null;
    const key = String(value).trim().toLowerCase().replace(/[\s-]+/g, "_");
    if (CLIENT_TYPES[key]) return CLIENT_TYPES[key];
    const spaced = String(value).trim().toLowerCase();
    return CLIENT_TYPES[spaced] || null;
  }

  function mapLocation(value) {
    if (!value) return null;
    return LOCATIONS[String(value).trim().toLowerCase()] || null;
  }

  function preferredDateTime(dateStr, timeLabel) {
    if (!dateStr) return null;
    const match = String(timeLabel || "").match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    const date = new Date(`${dateStr}T00:00:00`);
    if (Number.isNaN(date.getTime())) return null;
    if (!match) return date.getTime();
    let hour = Number(match[1]);
    const minute = Number(match[2]);
    const meridiem = match[3].toUpperCase();
    if (meridiem === "PM" && hour !== 12) hour += 12;
    if (meridiem === "AM" && hour === 12) hour = 0;
    date.setHours(hour, minute, 0, 0);
    return date.getTime();
  }

  async function postInquiry(body) {
    const response = await fetch(`${apiBase()}/api/inquiries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        ...body,
        companyWebsite: body.companyWebsite || "",
      }),
    });

    let result = {};
    try {
      result = await response.json();
    } catch {
      result = {};
    }

    if (!response.ok || result.ok === false) {
      throw new Error(result.error || "The inquiry could not be sent.");
    }
    return result;
  }

  async function postFormSubmit(payload, useFormData) {
    let response;
    if (useFormData) {
      const data = payload instanceof FormData ? payload : new FormData();
      if (!(payload instanceof FormData)) {
        Object.entries(payload).forEach(([key, value]) => {
          if (value != null && value !== "") data.append(key, value);
        });
      }
      data.delete("_gotcha");
      data.delete("companyWebsite");
      response = await fetch(FORM_SUBMIT_ENDPOINT, { method: "POST", body: data });
    } else {
      response = await fetch(FORM_SUBMIT_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });
    }

    let result = {};
    try {
      result = await response.json();
    } catch {
      result = {};
    }

    const failed =
      !response.ok || result.success === false || result.success === "false";
    if (failed) {
      throw new Error(result.message || "The form could not be sent.");
    }
    return result;
  }

  async function submitInquiry(inquiry, emailPayload, options = {}) {
    let apiError = null;
    try {
      await postInquiry(inquiry);
    } catch (error) {
      apiError = error;
    }

    if (!apiError) {
      return { ok: true, via: "api" };
    }

    if (emailPayload) {
      await postFormSubmit(emailPayload, options.useFormData);
      return { ok: true, via: "email" };
    }

    throw apiError;
  }

  global.GKS = Object.assign(global.GKS || {}, {
    apiBase,
    mapClientType,
    mapLocation,
    preferredDateTime,
    postInquiry,
    submitInquiry,
  });
})(window);
