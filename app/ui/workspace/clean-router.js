/* OrbitBiz — clean History API router. Keeps the existing workspace renderer intact. */
(() => {
  "use strict";
  const core = window.OrbitBiz = window.OrbitBiz || {};
  const state = core.workspaceState;
  if (!state) return;

  const pageRoutes = new Set([
    "dashboard","crm","customers","quotations","invoices","receipts",
    "purchases","purchase-orders","vendors","inventory","warehouses",
    "finance","vendor-payments","reconciliation","reports","settings"
  ]);

  const normalize = value => {
    const path = String(value || "").replace(/^\/+|\/+$/g, "");
    return path ? `/${path}` : "/";
  };

  function routeFromLocation() {
    let raw = location.pathname || "/";
    if ((!raw || raw === "/") && location.hash) raw = location.hash.slice(1) || "/";
    const parts = raw.split("/").filter(Boolean).map(part => decodeURIComponent(part));
    if (!parts.length) return { page: "dashboard", customerId: "", invoiceId: "" };

    const page = parts[0];
    if (!pageRoutes.has(page)) return { page: "dashboard", customerId: "", invoiceId: "" };
    if (page === "customers" && parts[1]) return { page, customerId: parts[1], invoiceId: "" };
    if (page === "invoices" && parts[1]) return { page, customerId: "", invoiceId: parts[1] };
    return { page, customerId: "", invoiceId: "" };
  }

  function routeForState(entry) {
    const page = pageRoutes.has(entry?.page) ? entry.page : "dashboard";
    if (page === "customers" && entry?.customerId) return `/customers/${encodeURIComponent(entry.customerId)}`;
    if (page === "invoices" && entry?.invoiceId) return `/invoices/${encodeURIComponent(entry.invoiceId)}`;
    return page === "dashboard" ? "/dashboard" : `/${page}`;
  }

  function applyLocationState() {
    const route = routeFromLocation();
    state.page = route.page;
    state.customerId = route.customerId;
    state.invoiceId = route.invoiceId;
    state.invoiceCustomerId = "";
  }

  const nativePush = history.pushState.bind(history);
  const nativeReplace = history.replaceState.bind(history);

  history.pushState = function(entry, title, url) {
    if (entry?.orbitbiz === true) url = routeForState(entry);
    return nativePush(entry, title, url);
  };

  history.replaceState = function(entry, title, url) {
    if (entry?.orbitbiz === true) url = routeForState(entry);
    return nativeReplace(entry, title, url);
  };

  // Read a direct /page or /customers/id URL before auth mounts the workspace.
  applyLocationState();

  // Remove the legacy hash when it is present, while preserving the current route.
  if (location.hash) {
    const route = routeFromLocation();
    if (route.page !== "dashboard" || location.pathname !== "/") {
      const entry = { orbitbiz: true, page: route.page, customerId: route.customerId, invoiceId: route.invoiceId };
      nativeReplace(entry, "", routeForState(entry));
    }
  }

  // If the app started at the root after authentication, make the dashboard URL explicit.
  if ((location.pathname === "/" || location.pathname === "") && state.businessId) {
    const entry = { orbitbiz: true, page: state.page || "dashboard", customerId: state.customerId || "", invoiceId: state.invoiceId || "" };
    nativeReplace(entry, "", routeForState(entry));
  }
})();
