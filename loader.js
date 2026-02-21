(() => {
  "use strict";

  const SiteApps = (window.SiteApps ||= {});
  SiteApps.registry ||= {};
  SiteApps.scripts ||= {};   // appName -> url
  SiteApps.loading ||= {};   // appName -> Promise

  SiteApps.register = function register(name, initFn) {
    if (typeof name !== "string" || !name) return;
    if (typeof initFn !== "function") return;
    SiteApps.registry[name] = initFn;
    // If the DOM already contains nodes for this app, init them now.
    queueInit();
  };

  // Map app names to script URLs (call this once, e.g. from footer)
  SiteApps.map = function map(obj) {
    if (!obj || typeof obj !== "object") return;
    Object.assign(SiteApps.scripts, obj);
    queueInit();
  };

  function loadScript(url) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = url;
      s.async = true; // OK because registration gates init
      s.onload = () => resolve(true);
      s.onerror = () => reject(new Error("Failed to load: " + url));
      document.head.appendChild(s);
    });
  }

  function ensureAppLoaded(appName) {
    // Already registered
    if (SiteApps.registry[appName]) return Promise.resolve(true);

    // Already loading
    if (SiteApps.loading[appName]) return SiteApps.loading[appName];

    const url = SiteApps.scripts[appName];
    if (!url) return Promise.resolve(false);

    SiteApps.loading[appName] = loadScript(url)
      .catch((e) => {
        console.error(`[SiteApps] script load failed for ${appName}`, e);
        return false;
      })
      .finally(() => {
        // allow retry if needed
        delete SiteApps.loading[appName];
      });

    return SiteApps.loading[appName];
  }

  let initQueued = false;
  function queueInit() {
    if (initQueued) return;
    initQueued = true;
    // rAF keeps this light during DOM churn (good for iPad Safari)
    requestAnimationFrame(() => {
      initQueued = false;
      initAll();
    });
  }

  async function initAll() {
    const nodes = document.querySelectorAll("[data-app]");
    for (const el of nodes) {
      const appName = el.getAttribute("data-app");
      if (!appName) continue;

      if (el.dataset.appInit === "1") continue;

      // If app isn’t registered yet, try to load it
      if (!SiteApps.registry[appName]) {
        await ensureAppLoaded(appName);
      }

      const initFn = SiteApps.registry[appName];
      if (!initFn) continue;

      el.dataset.appInit = "1";
      try {
        initFn(el);
      } catch (e) {
        console.error(`[SiteApps] init failed for ${appName}`, e);
      }
    }
  }

  function boot() {
    queueInit();

    // Short burst for initial Squarespace paint
    const t = setInterval(queueInit, 350);
    setTimeout(() => clearInterval(t), 6000);

    const obs = new MutationObserver(queueInit);
    obs.observe(document.documentElement, { childList: true, subtree: true });

    window.addEventListener("popstate", () => setTimeout(queueInit, 0));
    window.addEventListener("hashchange", () => setTimeout(queueInit, 0));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
