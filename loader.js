(() => {
  "use strict";

  // Simple registry: apps register themselves here
  const SiteApps = (window.SiteApps ||= { registry: {}, register });

  function register(name, initFn) {
    if (typeof name !== "string" || !name) return;
    if (typeof initFn !== "function") return;
    SiteApps.registry[name] = initFn;
  }

  function initAll() {
    const nodes = document.querySelectorAll("[data-app]");
    nodes.forEach((el) => {
      const appName = el.getAttribute("data-app");
      const initFn = SiteApps.registry[appName];
      if (!initFn) return;

      // prevent double-init if Squarespace swaps DOM
      if (el.dataset.appInit === "1") return;
      el.dataset.appInit = "1";

      try {
        initFn(el);
      } catch (e) {
        console.error(`[SiteApps] init failed for ${appName}`, e);
      }
    });
  }

  // Run now + keep re-running for Squarespace AJAX navigation
  function boot() {
    initAll();

    const t = setInterval(initAll, 300);
    setTimeout(() => clearInterval(t), 9000);

    const obs = new MutationObserver(() => initAll());
    obs.observe(document.documentElement, { childList: true, subtree: true });

    window.addEventListener("popstate", () => setTimeout(initAll, 0));
    window.addEventListener("hashchange", () => setTimeout(initAll, 0));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
