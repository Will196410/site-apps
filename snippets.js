/* SiteApps: Snippets v1 */
(() => {
  "use strict";

  const APP = "snippets";
  const SELECTOR = '[data-siteapp="snippets"]';

  function ensureStyles() {
    const id = "siteapps-snippets-style";
    if (document.getElementById(id)) return;
    const s = document.createElement("style");
    s.id = id;
    s.textContent = `
      .sa-snippets{max-width:980px}
      .sa-snippets *{box-sizing:border-box}
      .sa-snippets .row{display:flex;gap:12px;flex-wrap:wrap}
      .sa-snippets .col{flex:1 1 280px;min-width:260px}
      .sa-snippets label{display:block;font:600 13px system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;margin:0 0 6px}
      .sa-snippets textarea{
        width:100%;
        min-height:110px;
        padding:10px 12px;
        border:1px solid rgba(0,0,0,.18);
        border-radius:10px;
        font:14px/1.35 ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;
        background:#fff;
        resize:vertical;
      }
      .sa-snippets .controls{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0 14px}
      .sa-snippets button{
        appearance:none;
        border:1px solid rgba(0,0,0,.18);
        background:#fff;
        border-radius:999px;
        padding:8px 12px;
        font:600 13px system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;
        cursor:pointer;
      }
      .sa-snippets button:active{transform:translateY(1px)}
      .sa-snippets .muted{opacity:.72;font:12px system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif}
      .sa-snippets .status{min-height:18px;margin-top:6px}
      .sa-snippets .sep{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:6px 0 12px}
      .sa-snippets .sep input[type="text"]{
        width:260px; max-width:100%;
        padding:8px 10px;
        border:1px solid rgba(0,0,0,.18);
        border-radius:10px;
        font:13px ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;
      }
      .sa-snippets .pill{
        display:inline-flex;align-items:center;gap:8px;
        border:1px solid rgba(0,0,0,.12);
        border-radius:999px;
        padding:6px 10px;
        background:rgba(0,0,0,.03);
        font:600 12px system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;
      }
    `;
    document.head.appendChild(s);
  }

  function uid() {
    return Math.random().toString(36).slice(2, 10);
  }

  function storageKey(instanceId) {
    // Keep keys stable per page + instance
    return `SiteApps:${APP}:${location.pathname}:${instanceId}`;
  }

  function toast(msg) {
    let t = document.getElementById("siteapps-snippets-toast");
    if (!t) {
      t = document.createElement("div");
      t.id = "siteapps-snippets-toast";
      t.style.cssText =
        "position:fixed;left:50%;bottom:18px;transform:translateX(-50%);" +
        "background:#111;color:#fff;padding:10px 12px;border-radius:999px;" +
        "font:600 14px system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;" +
        "z-index:999999;opacity:0;transition:opacity .15s ease;";
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = "1";
    clearTimeout(t._t);
    t._t = setTimeout(() => (t.style.opacity = "0"), 1400);
  }

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback (best-effort for iPad Safari)
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "-9999px";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (e) {
      ok = false;
    }
    document.body.removeChild(ta);
    return ok;
  }

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (k === "class") node.className = v;
        else if (k === "text") node.textContent = v;
        else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2), v);
        else node.setAttribute(k, v);
      }
    }
    if (children) {
      for (const c of children) node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    }
    return node;
  }

  function initSnippets(root) {
    ensureStyles();

    const instanceId = root.getAttribute("data-siteapp-id") || uid();
    root.setAttribute("data-siteapp-id", instanceId);

    const key = storageKey(instanceId);
    const saved = (() => {
      try { return JSON.parse(localStorage.getItem(key) || "{}"); } catch { return {}; }
    })();

    const taA = el("textarea", { "data-ta": "a", autocapitalize: "off", autocomplete: "off", spellcheck: "false" });
    const taB = el("textarea", { "data-ta": "b", autocapitalize: "off", autocomplete: "off", spellcheck: "false" });
    const taC = el("textarea", { "data-ta": "c", autocapitalize: "off", autocomplete: "off", spellcheck: "false" });
    const taOut = el("textarea", { "data-ta": "out", autocapitalize: "off", autocomplete: "off", spellcheck: "false" });

    taA.value = saved.a || "";
    taB.value = saved.b || "";
    taC.value = saved.c || "";
    taOut.value = saved.out || "";

    const sepInput = el("input", { type: "text", value: saved.sep ?? "\n", "aria-label": "Separator" });
    const chkTrim = el("input", { type: "checkbox" });
    chkTrim.checked = !!saved.trim;
    const chkSkipEmpty = el("input", { type: "checkbox" });
    chkSkipEmpty.checked = saved.skipEmpty !== false; // default true

    function persist() {
      try {
        localStorage.setItem(
          key,
          JSON.stringify({
            a: taA.value,
            b: taB.value,
            c: taC.value,
            out: taOut.value,
            sep: sepInput.value,
            trim: chkTrim.checked,
            skipEmpty: chkSkipEmpty.checked
          })
        );
      } catch (e) {
        // If storage fails (private mode, quota), just ignore.
      }
    }

    function getParts() {
      let parts = [taA.value, taB.value, taC.value];
      if (chkTrim.checked) parts = parts.map((s) => s.trim());
      if (chkSkipEmpty.checked) parts = parts.filter((s) => s.length > 0);
      return parts;
    }

    function joinIntoOutput(replace) {
      const parts = getParts();
      const joined = parts.join(sepInput.value);
      if (replace) taOut.value = joined;
      else taOut.value = (taOut.value ? taOut.value + sepInput.value : "") + joined;
      persist();
      toast(replace ? "Built output" : "Appended to output");
    }

    async function copyFrom(textarea) {
      const text = textarea.value || "";
      if (!text) return toast("Nothing to copy");
      try {
        const ok = await copyText(text);
        toast(ok ? "Copied" : "Couldn’t copy");
      } catch {
        toast("Couldn’t copy");
      }
    }

    function clearAll() {
      taA.value = "";
      taB.value = "";
      taC.value = "";
      taOut.value = "";
      persist();
      toast("Cleared");
    }

    // Save on input (lightweight)
    const onInput = () => persist();
    taA.addEventListener("input", onInput, { passive: true });
    taB.addEventListener("input", onInput, { passive: true });
    taC.addEventListener("input", onInput, { passive: true });
    taOut.addEventListener("input", onInput, { passive: true });
    sepInput.addEventListener("input", onInput, { passive: true });
    chkTrim.addEventListener("change", persist, { passive: true });
    chkSkipEmpty.addEventListener("change", persist, { passive: true });

    const ui = el("div", { class: "sa-snippets" }, [
      el("div", { class: "muted", text: "Paste fragments into A/B/C, then build or append into Output." }),
      el("div", { class: "sep" }, [
        el("span", { class: "pill" }, [
          el("span", { text: "Separator" }),
          sepInput
        ]),
        el("label", { class: "pill" }, [
          chkTrim,
          el("span", { text: "Trim parts" })
        ]),
        el("label", { class: "pill" }, [
          chkSkipEmpty,
          el("span", { text: "Skip empty" })
        ])
      ]),
      el("div", { class: "controls" }, [
        el("button", { type: "button", onclick: () => joinIntoOutput(true), text: "Build Output" }),
        el("button", { type: "button", onclick: () => joinIntoOutput(false), text: "Append to Output" }),
        el("button", { type: "button", onclick: () => copyFrom(taOut), text: "Copy Output" }),
        el("button", { type: "button", onclick: clearAll, text: "Reset All" })
      ]),
      el("div", { class: "row" }, [
        el("div", { class: "col" }, [
          el("label", { text: "Snippet A" }),
          taA,
          el("div", { class: "controls" }, [
            el("button", { type: "button", onclick: () => copyFrom(taA), text: "Copy A" }),
            el("button", { type: "button", onclick: () => { taA.value=""; persist(); toast("Cleared A"); }, text: "Clear A" })
          ])
        ]),
        el("div", { class: "col" }, [
          el("label", { text: "Snippet B" }),
          taB,
          el("div", { class: "controls" }, [
            el("button", { type: "button", onclick: () => copyFrom(taB), text: "Copy B" }),
            el("button", { type: "button", onclick: () => { taB.value=""; persist(); toast("Cleared B"); }, text: "Clear B" })
          ])
        ]),
        el("div", { class: "col" }, [
          el("label", { text: "Snippet C" }),
          taC,
          el("div", { class: "controls" }, [
            el("button", { type: "button", onclick: () => copyFrom(taC), text: "Copy C" }),
            el("button", { type: "button", onclick: () => { taC.value=""; persist(); toast("Cleared C"); }, text: "Clear C" })
          ])
        ])
      ]),
      el("div", { style: "margin-top:10px" }, [
        el("label", { text: "Output" }),
        taOut
      ]),
      el("div", { class: "status muted" })
    ]);

    // Clear and render
    root.innerHTML = "";
    root.appendChild(ui);
  }

  // Register with your loader
  if (window.SiteApps && typeof window.SiteApps.register === "function") {
    window.SiteApps.register(APP, {
      selector: SELECTOR,
      init: initSnippets
    });
  } else {
    // If loader isn't ready yet, fail quietly
    // (your initAll will run after loader in normal use)
  }
})();
