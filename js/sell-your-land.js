(function () {
  "use strict";
  const form = document.getElementById("sell-land-form");
  if (!form) return;
  const success = document.getElementById("seller-success");
  const errorSummary = document.getElementById("seller-error-summary");
  const phone = document.getElementById("seller-phone");
  const name = document.getElementById("seller-name");
  const acres = document.getElementById("seller-acres");
  const MAX_DETAILS = 1500;

  function clearErrors() {
    form.querySelectorAll("[data-error-for]").forEach((node) => { node.textContent = ""; });
    form.querySelectorAll("[aria-invalid='true']").forEach((node) => node.removeAttribute("aria-invalid"));
    errorSummary.hidden = true;
    errorSummary.textContent = "";
  }
  function setError(input, message) {
    input.setAttribute("aria-invalid", "true");
    const node = form.querySelector(`[data-error-for="${input.id}"]`);
    if (node) node.textContent = message;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearErrors();
    success.hidden = true;
    const invalid = [];
    if (name.value.trim().length < 2) {
      setError(name, "Enter your full name (at least 2 characters)."); invalid.push(name);
    }
    const digits = phone.value.replace(/\D/g, "");
    if (digits.length !== 10) {
      setError(phone, "Enter a 10-digit US phone number, including area code."); invalid.push(phone);
    }
    const email = document.getElementById("seller-email");
    if (!email.value.trim() || !email.checkValidity()) {
      setError(email, "Enter a valid email address."); invalid.push(email);
    }
    const location = document.getElementById("seller-location");
    if (!location.value.trim()) { setError(location, "Enter a city, county, state, or ZIP code."); invalid.push(location); }
    if (!acres.value || Number(acres.value) <= 0) { setError(acres, "Property size must be greater than 0 acres."); invalid.push(acres); }
    const type = document.getElementById("seller-land-type");
    if (!type.value) { setError(type, "Select a land type."); invalid.push(type); }
    const details = document.getElementById("seller-details");
    if (details.value.length > MAX_DETAILS) { setError(details, `Keep additional details under ${MAX_DETAILS} characters.`); invalid.push(details); }
    if (invalid.length || !form.checkValidity()) {
      errorSummary.textContent = "Please review the highlighted fields and try again.";
      errorSummary.hidden = false;
      (invalid[0] || form.querySelector(":invalid"))?.focus();
      return;
    }
    // Demo only: no email or backend submission occurs in this local-only implementation.
    form.reset();
    success.textContent = "Thank you for submitting your land details! Our team will contact you soon.";
    success.hidden = false;
    success.focus?.();
    success.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  form.addEventListener("input", (event) => {
    const input = event.target;
    if (input.hasAttribute("aria-invalid")) {
      input.removeAttribute("aria-invalid");
      const error = form.querySelector(`[data-error-for="${input.id}"]`);
      if (error) error.textContent = "";
    }
    if (success && !success.hidden) success.hidden = true;
  });
}());
