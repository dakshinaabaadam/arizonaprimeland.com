(function () {
  "use strict";
  const DEMO_AUTH_KEY = "apl-demo-auth";

  function readDemoAuth() {
    try {
      const value = sessionStorage.getItem(DEMO_AUTH_KEY);
      return value ? JSON.parse(value) : null;
    } catch (_error) {
      return null;
    }
  }

  function clearDemoAuth() {
    try { sessionStorage.removeItem(DEMO_AUTH_KEY); } catch (_error) { /* storage may be disabled */ }
  }

  function updateHeaderAuthState() {
    const auth = readDemoAuth();
    const loginLink = document.querySelector("[data-login-link]");
    const accountLink = document.querySelector("[data-account-link]");
    const logoutButton = document.querySelector("[data-logout-button]");
    if (loginLink) loginLink.hidden = Boolean(auth && auth.isLoggedIn);
    if (accountLink) accountLink.hidden = !(auth && auth.isLoggedIn);
    if (logoutButton) logoutButton.hidden = !(auth && auth.isLoggedIn);
    if (accountLink && auth && auth.isLoggedIn) {
      accountLink.textContent = "My Account";
      accountLink.setAttribute("aria-label", "Open account page");
      if (loginLink && loginLink.hasAttribute("aria-current")) {
        loginLink.removeAttribute("aria-current");
        accountLink.setAttribute("aria-current", "page");
      }
    } else if (accountLink) {
      accountLink.removeAttribute("aria-current");
    }
    document.documentElement.classList.toggle("has-demo-session", Boolean(auth && auth.isLoggedIn));
  }

  function setActiveNavigation() {
    const currentPage = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
    document.querySelectorAll("[data-nav-link]").forEach((link) => {
      const href = (link.getAttribute("href") || "").split("?")[0].toLowerCase();
      const active = href === currentPage || (currentPage === "property-detail.html" && href === "prime-properties.html");
      if (active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  }

  function setupMobileNavigation() {
    const toggle = document.querySelector("[data-menu-toggle]");
    const nav = document.getElementById("primary-navigation");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      nav.classList.toggle("is-open", !expanded);
    });
    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        toggle.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
      });
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        toggle.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
        toggle.focus();
      }
    });
  }

  function setupLogoutButtons() {
    document.querySelectorAll("[data-logout-button]").forEach((button) => {
      button.addEventListener("click", () => {
        clearDemoAuth();
        updateHeaderAuthState();
        if (document.getElementById("auth-logged-in-panel")) {
          window.dispatchEvent(new CustomEvent("apl:auth-logged-out"));
        }
        const status = document.getElementById("site-status");
        if (status) {
          status.textContent = "You have been logged out of the demo session.";
          status.hidden = false;
        }
        if (!document.getElementById("auth-logged-in-panel")) {
          window.location.href = "login-register.html";
        }
      });
    });
  }

  function setFooterYear() {
    document.querySelectorAll("[data-current-year]").forEach((node) => {
      node.textContent = String(new Date().getFullYear());
    });
  }

  function exposeCompanyEmailLinks() {
    const address = "joe@arizonaprimeland.com";
    const composeUrl = "https://mail.google.com/mail/?view=cm&fs=1&to=" + encodeURIComponent(address);
    document.querySelectorAll("[data-company-gmail]").forEach((link) => {
      link.href = composeUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    });
    document.querySelectorAll("[data-company-mailto]").forEach((link) => {
      link.href = "mailto:" + address;
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    setActiveNavigation();
    setupMobileNavigation();
    setupLogoutButtons();
    updateHeaderAuthState();
    setFooterYear();
    exposeCompanyEmailLinks();
  });

  window.APL = {
    readDemoAuth,
    updateHeaderAuthState,
    demoAuthKey: DEMO_AUTH_KEY
  };
}());
