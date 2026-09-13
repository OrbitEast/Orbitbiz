/* OrbitBiz — entry routing for public feature links and workspace actions. */
(() => {
  "use strict";

  const core = window.OrbitBiz = window.OrbitBiz || {};
  const KEY = "orbitbiz.pendingWorkspace";

  function readIntent() {
    try {
      const params = new URLSearchParams(location.search);
      const workspace = params.get("workspace") || "";
      const action = params.get("action") || "";
      if (workspace || action) return { workspace, action };
      const stored = sessionStorage.getItem(KEY);
      return stored ? JSON.parse(stored) : { workspace: "", action: "" };
    } catch (_) {
      return { workspace: "", action: "" };
    }
  }

  function saveIntent(intent) {
    if (!intent.workspace && !intent.action) return;
    try { sessionStorage.setItem(KEY, JSON.stringify(intent)); } catch (_) {}
  }

  function clearIntent() {
    try { sessionStorage.removeItem(KEY); } catch (_) {}
  }

  const initialIntent = readIntent();
  saveIntent(initialIntent);

  // Preserve the requested workspace/action through the Google OAuth round-trip.
  if (window.supabase?.createClient && !window.__orbitBizCreateClientPatched) {
    const originalCreateClient = window.supabase.createClient;
    window.supabase.createClient = (...args) => {
      const client = originalCreateClient(...args);
      if (client?.auth?.signInWithOAuth && !client.auth.__orbitBizOAuthPatched) {
        const originalOAuth = client.auth.signInWithOAuth.bind(client.auth);
        client.auth.signInWithOAuth = options => {
          const intent = readIntent();
          const query = new URLSearchParams();
          if (intent.workspace) query.set("workspace", intent.workspace);
          if (intent.action) query.set("action", intent.action);
          const redirectTo = `${window.location.origin}${window.location.pathname}${query.toString() ? `?${query}` : ""}`;
          return originalOAuth({ ...options, options: { ...(options?.options || {}), redirectTo } });
        };
        client.auth.__orbitBizOAuthPatched = true;
      }
      return client;
    };
    window.__orbitBizCreateClientPatched = true;
  }

  function applyWorkspaceIntent() {
    const intent = readIntent();
    const state = core.workspaceState;
    const workspace = core.workspace;
    if (!state || !workspace || !intent.workspace) return;

    if (intent.workspace === "invoices") {
      if (state.page !== "invoices") state.navigate("invoices", false);
      if (intent.action === "new") {
        window.setTimeout(() => {
          if (core.workspaceState?.page === "invoices") workspace.invoiceCreator?.(core.workspaceState, "");
        }, 80);
      }
    }
    clearIntent();
  }

  function wireInvoiceLinks() {
    if (core.workspaceState?.page !== "invoices") return;
    document.querySelectorAll('[data-action="quick-invoice"]').forEach(button => {
      if (button.tagName === "A") return;
      const link = document.createElement("a");
      link.className = button.className;
      link.href = "/?workspace=invoices&action=new";
      link.innerHTML = button.innerHTML;
      link.setAttribute("aria-label", "Create a new invoice");
      button.replaceWith(link);
    });
  }

  core.events?.on("auth:ready", () => {
    window.setTimeout(() => {
      applyWorkspaceIntent();
      wireInvoiceLinks();
    }, 0);
  });

  window.addEventListener("auth:ready", () => {
    window.setTimeout(() => {
      applyWorkspaceIntent();
      wireInvoiceLinks();
    }, 0);
  });

  document.addEventListener("DOMContentLoaded", () => {
    // When a public feature page sends an unauthenticated visitor to /?workspace=...,
    // let the normal OrbitBiz auth screen open after the normal auth bootstrap settles.
    const intent = readIntent();
    if (intent.workspace && !core.auth?.currentUser) {
      window.setTimeout(() => {
        if (!core.auth?.currentUser) {
          window.dispatchEvent(new CustomEvent("orbitbiz:auth-request", { detail: { mode: "signin" } }));
        }
      }, 0);
    }
  }, { once: true });

  const observer = new MutationObserver(() => wireInvoiceLinks());
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
