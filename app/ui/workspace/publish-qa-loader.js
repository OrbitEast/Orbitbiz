/* OrbitBiz — safe loader for the publish QA workflow bundle. */
(() => {
  "use strict";
  const src = "app/ui/workspace/publish-qa.js";
  fetch(`${src}?v=20260913`, { cache: "no-store" })
    .then(response => {
      if (!response.ok) throw new Error(`Could not load ${src} (${response.status})`);
      return response.text();
    })
    .then(source => {
      const repaired = source.replace(
        "w.pageView=w.pageView||async()=>null;",
        "w.pageView=w.pageView||(async()=>null);"
      );
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.text = repaired;
      document.head.appendChild(script);
    })
    .catch(error => console.error("OrbitBiz: publish QA bundle failed to load", error));

  // Keep public feature entry points connected to the same authenticated workspace.
  const entry = document.createElement("script");
  entry.src = "app/core/navigation-entry.js?v=20260913";
  entry.defer = false;
  document.head.appendChild(entry);
})();
