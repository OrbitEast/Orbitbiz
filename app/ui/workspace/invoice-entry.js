/* OrbitBiz — invoice intent bridge. Keeps the public Generate new invoice CTA inside the main workspace. */
(() => {
  "use strict";
  const core = window.OrbitBiz = window.OrbitBiz || {};
  let consumed = false;

  function hasInvoiceIntent() {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get("workspace") === "invoices" && params.get("action") === "new";
    } catch (_) {
      return false;
    }
  }

  function clearIntent() {
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("action");
      history.replaceState(history.state, "", url.pathname + (url.searchParams.toString() ? `?${url.searchParams}` : "") + url.hash);
    } catch (_) {}
  }

  function openGenerator() {
    if (consumed || !hasInvoiceIntent()) return;
    const state = core.workspaceState;
    const w = core.workspace;
    if (!state?.businessId || typeof w?.invoiceCreator !== "function") return;
    consumed = true;
    clearIntent();
    setTimeout(() => w.invoiceCreator(state, ""), 80);
  }

  window.addEventListener("auth:ready", openGenerator);
  core.events?.on("auth:ready", openGenerator);
  document.addEventListener("DOMContentLoaded", () => setTimeout(openGenerator, 250), { once: true });
})();
