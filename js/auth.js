(function () {
  "use strict";
  const loginTab = document.getElementById("auth-tab-login");
  const registerTab = document.getElementById("auth-tab-register");
  const loginPanel = document.getElementById("login-panel");
  const registerPanel = document.getElementById("register-panel");
  const forgotPanel = document.getElementById("forgot-panel");
  const loggedInPanel = document.getElementById("auth-logged-in-panel");
  if (!loginTab || !registerTab) return;
  const authStatus = document.getElementById("auth-status");

  function getAuth() { return window.APL?.readDemoAuth(); }
  function setStatus(message, kind) {
    authStatus.textContent = message;
    authStatus.className = `form-status ${kind || ""}`.trim();
    authStatus.hidden = !message;
  }
  function hideAllPanels() {
    loginPanel.hidden = true;
    registerPanel.hidden = true;
    forgotPanel.hidden = true;
  }
  function setTab(mode) {
    hideAllPanels();
    loggedInPanel.hidden = true;
    const loginActive = mode === "login";
    loginTab.setAttribute("aria-selected", String(loginActive));
    registerTab.setAttribute("aria-selected", String(!loginActive));
    loginTab.classList.toggle("is-active", loginActive);
    registerTab.classList.toggle("is-active", !loginActive);
    (loginActive ? loginPanel : registerPanel).hidden = false;
    setStatus("", "");
  }
  function renderAuthState() {
    const auth = getAuth();
    const tablist = document.getElementById("auth-tablist");
    const loginHeading = document.getElementById("auth-form-heading");
    if (auth && auth.isLoggedIn) {
      hideAllPanels();
      tablist.hidden = true;
      loginTab.hidden = true;
      registerTab.hidden = true;
      loggedInPanel.hidden = false;
      document.getElementById("signed-in-email").textContent = auth.email || "Demo user";
      loginHeading.textContent = "Account status";
      setStatus("You are signed in to a temporary demo session. No real authentication has occurred.", "notice");
    } else {
      tablist.hidden = false;
      loginTab.hidden = false;
      registerTab.hidden = false;
      loggedInPanel.hidden = true;
      loginHeading.textContent = "Login to Your Account";
      setTab("login");
    }
    window.APL?.updateHeaderAuthState();
  }

  function storeDemoSession(email) {
    try {
      sessionStorage.setItem(window.APL.demoAuthKey, JSON.stringify({
        isLoggedIn: true,
        email,
        signedInAt: new Date().toISOString(),
        demoOnly: true
      }));
      window.APL.updateHeaderAuthState();
      renderAuthState();
      setStatus("Demo sign-in complete for this browser tab. No server account was checked.", "success");
    } catch (_error) {
      setStatus("This browser blocked session storage, so the demo sign-in state could not be saved.", "error");
    }
  }
  function checkEmail(input) {
    input.value = input.value.trim();
    if (!input.value || !input.checkValidity()) {
      input.setAttribute("aria-invalid", "true");
      input.focus();
      setStatus("Enter a valid email address.", "error");
      return false;
    }
    input.removeAttribute("aria-invalid");
    return true;
  }
  function setPasswordVisibility(buttonId, inputId) {
    const button = document.getElementById(buttonId);
    const input = document.getElementById(inputId);
    if (!button || !input) return;
    button.addEventListener("click", () => {
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      button.setAttribute("aria-pressed", String(show));
      button.textContent = show ? "Hide" : "Show";
    });
  }

  loginTab.addEventListener("click", () => setTab("login"));
  registerTab.addEventListener("click", () => setTab("register"));
  document.querySelectorAll("[data-open-register]").forEach((link) => link.addEventListener("click", (event) => {
    event.preventDefault(); setTab("register"); registerTab.focus();
  }));
  document.querySelectorAll("[data-open-login]").forEach((link) => link.addEventListener("click", (event) => {
    event.preventDefault(); setTab("login"); loginTab.focus();
  }));
  document.getElementById("forgot-password-link").addEventListener("click", (event) => {
    event.preventDefault();
    hideAllPanels();
    loginTab.setAttribute("aria-selected", "false");
    registerTab.setAttribute("aria-selected", "false");
    loginTab.classList.remove("is-active");
    registerTab.classList.remove("is-active");
    setStatus("", "");
    forgotPanel.hidden = false;
    document.getElementById("forgot-email").value = document.getElementById("login-email").value;
    document.getElementById("forgot-email").focus();
    document.getElementById("auth-form-heading").textContent = "Reset Your Password";
  });
  document.getElementById("return-to-login").addEventListener("click", (event) => {
    event.preventDefault();
    document.getElementById("auth-form-heading").textContent = "Login to Your Account";
    setTab("login");
  });

  const rememberMe = document.getElementById("remember-me");
  const loginEmail = document.getElementById("login-email");
  try {
    const rememberedEmail = localStorage.getItem("apl-demo-remembered-email");
    if (rememberedEmail) { loginEmail.value = rememberedEmail; rememberMe.checked = true; }
  } catch (_error) { /* the checkbox remains available if storage is disabled */ }
  rememberMe.addEventListener("change", () => {
    if (!rememberMe.checked) {
      try { localStorage.removeItem("apl-demo-remembered-email"); } catch (_error) { /* no-op */ }
    }
  });
  document.getElementById("login-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const email = document.getElementById("login-email");
    const password = document.getElementById("login-password");
    if (!checkEmail(email)) return;
    if (!password.value) { password.setAttribute("aria-invalid", "true"); password.focus(); setStatus("Enter your password.", "error"); return; }
    password.removeAttribute("aria-invalid");
    try {
      if (rememberMe.checked) localStorage.setItem("apl-demo-remembered-email", email.value);
      else localStorage.removeItem("apl-demo-remembered-email");
    } catch (_error) { /* demo sign-in can still continue without Remember Me persistence */ }
    storeDemoSession(email.value);
  });
  document.getElementById("register-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.getElementById("register-name");
    const email = document.getElementById("register-email");
    const password = document.getElementById("register-password");
    const confirm = document.getElementById("register-confirm-password");
    const terms = document.getElementById("register-terms");
    if (name.value.trim().length < 2) { name.setAttribute("aria-invalid", "true"); name.focus(); setStatus("Enter your full name.", "error"); return; }
    name.removeAttribute("aria-invalid");
    if (!checkEmail(email)) return;
    if (password.value.length < 8) { password.setAttribute("aria-invalid", "true"); password.focus(); setStatus("Use at least 8 characters for the demo password.", "error"); return; }
    password.removeAttribute("aria-invalid");
    if (password.value !== confirm.value) { confirm.setAttribute("aria-invalid", "true"); confirm.focus(); setStatus("The passwords do not match.", "error"); return; }
    confirm.removeAttribute("aria-invalid");
    if (!terms.checked) { terms.focus(); setStatus("Acknowledge the Terms and Privacy notice to continue.", "error"); return; }
    storeDemoSession(email.value);
  });
  document.getElementById("forgot-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const email = document.getElementById("forgot-email");
    if (!checkEmail(email)) return;
    setStatus("If an account exists for this email, password-reset instructions will be sent. This demo has not sent an email.", "notice");
  });
  document.getElementById("auth-page-logout").addEventListener("click", () => {
    try { sessionStorage.removeItem(window.APL.demoAuthKey); } catch (_error) { /* no-op */ }
    window.APL?.updateHeaderAuthState();
    renderAuthState();
    setStatus("You have been logged out of the demo session.", "success");
  });
  setPasswordVisibility("toggle-login-password", "login-password");
  setPasswordVisibility("toggle-register-password", "register-password");
  setPasswordVisibility("toggle-confirm-password", "register-confirm-password");
  window.addEventListener("apl:auth-logged-out", () => {
    renderAuthState();
    setStatus("You have been logged out of the demo session.", "success");
  });
  renderAuthState();
}());
