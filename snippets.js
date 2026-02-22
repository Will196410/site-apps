(() => {
  "use strict";

  // Ensure registry exists (works with your loader.js)
  window.SiteApps = window.SiteApps || {};
  window.SiteApps.registry = window.SiteApps.registry || {};
  window.SiteApps.register =
    window.SiteApps.register ||
    function (name, initFn) {
      window.SiteApps.registry[name] = initFn;
    };

  const STYLE_ID = "siteapps-snippets-style-v10";

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
[data-app="snippets"]{
  font-family:-apple-system,system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;
  background:#fff;
  border:2px solid #111;
  padding:18px;
  border-radius:14px;
  color:#111;
  max-width:980px;
  margin:14px auto;
}
[data-app="snippets"] .top-row{
  display:flex;
  align-items:baseline;
  justify-content:space-between;
  gap:10px;
  flex-wrap:wrap;
  margin-bottom:10px;
}
[data-app="snippets"] h3{
  margin:0;
  font-size:20px;
  font-weight:900;
}
[data-app="snippets"] .status-row{
  display:flex;
  gap:10px;
  align-items:center;
  flex-wrap:wrap;
  justify-content:flex-end;
}
[data-app="snippets"] .badge{
  font-size:14px;
  font-weight:900;
  padding:6px 10px;
  border:2px solid #111;
  border-radius:999px;
  background:#fff;
}
[data-app="snippets"] .badge.good{ border-color:#0b3d0b; color:#0b3d0b; }
[data-app="snippets"] .badge.warn{ border-color:#7a0000; color:#7a0000; }
[data-app="snippets"] .badge.dim{ border-color:#444; color:#444; }

[data-app="snippets"] label{
  display:block;
  margin:10px 0 6px;
  font-weight:900;
  font-size:14px;
}
[data-app="snippets"] textarea{
  width:100%;
  min-height:120px;
  padding:12px;
  border:2px solid #111;
  border-radius:10px;
  font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace;
  font-size:15px;
  line-height:1.35;
}
[data-app="snippets"] textarea:focus{
  outline:none;
  box-shadow:0 0 0 3px rgba(11,95,255,0.25);
}

[data-app="snippets"] .row{
  display:flex;
  gap:12px;
  flex-wrap:wrap;
}
[data-app="snippets"] .col{
  flex:1 1 260px;
  min-width:240px;
}

[data-app="snippets"] .controls{
  display:flex;
  flex-wrap:wrap;
  gap:10px;
  margin:12px 0 10px;
  align-items:center;
}
[data-app="snippets"] .controls button,
[data-app="snippets"] .actions button{
  border:2px solid #111;
  border-radius:10px;
  cursor:pointer;
  padding:10px 12px;
  font-weight:900;
  font-size:14px;
  background:#fff;
  color:#111;
}
[data-app="snippets"] .btn-primary{ background:#0b5fff; border-color:#0b5fff; color:#fff; }
[data-app="snippets"] .btn-copy{ background:#111; border-color:#111; color:#fff; }
[data-app="snippets"] .btn-clear{ background:#fff; border-color:#7a0000; color:#7a0000; }

[data-app="snippets"] .pill{
  display:flex;
  align-items:center;
  gap:10px;
  padding:8px 10px;
  border:2px solid #111;
  border-radius:10px;
}
[data-app="snippets"] input[type="checkbox"]{ width:20px; height:20px; }
[data-app="snippets"] input[type="text"]{
  width:260px; max-width:100%;
  padding:10px 10px;
  border:2px solid #111;
  border-radius:10px;
  font:14px ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace;
}

[data-app="snippets"] .feedback{
  background:#0b7a2b;
  color:#fff;
  padding:8px 12px;
  border-radius:10px;
  font-size:14px;
  font-weight:900;
  opacity:0;
  transition:opacity .2s;
}
[data-app="snippets"] .feedback.show{ opacity:1; }

@media (max-width:700px){
  [data-app="snippets"] .controls,
  [data-app="snippets"] .actions{ flex-direction:column; }
  [data-app="snippets"] .controls button,
  [data-app="snippets"] .actions button{ width:100%; }
}
`;
    document.head.appendChild(style);
  }

  function safeJsonParse(s) {
    try { return JSON.parse(s); } catch { return null; }
  }

  function makeStorageKey(container) {
    const k = container.getAttribute("data-storage-key");
    if (k && k.trim()) return `siteapps:snippets:${k.trim()}`;
    return `siteapps:snippets:${(location.pathname || "/")}`;
  }

  function normalizeLineEndings(s) {
    return String(s || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  }

  window.SiteApps.register("snippets", (container) => {
    ensureStyle();

    const storageKey = makeStorageKey(container);

    // State
    let copiedSinceChange = false;
    let lastCopyAt = null;

    function setCopied(flag) {
      copiedSinceChange = !!flag;
      if (copiedSinceChange) lastCopyAt = new Date().toISOString();
      renderBadges();
      saveState();
    }

    function renderBadges() {
      if (copiedSinceChange) {
        copyBadge.className = "badge good";
        copyBadge.textContent = "Copied ✓";
        copyBadge.title = lastCopyAt ? `Last copied: ${lastCopyAt}` : "";
      } else {
        copyBadge.className = "badge warn";
        copyBadge.textContent = "Not copied";
        copyBadge.title = "You’ve changed something since last copy.";
      }
    }

    let saveTimer = null;
    function saveState() {
      try {
        const state = {
          v: 10,
          a: taA.value,
          b: taB.value,
          c: taC.value,
          out: taOut.value,
          sep: sepIn.value,
          trim: trimCB.checked,
          skipEmpty: skipCB.checked,
          copiedSinceChange,
          lastCopyAt,
        };
        localStorage.setItem(storageKey, JSON.stringify(state));
        saveBadge.className = "badge good";
        saveBadge.textContent = "Saved ✓";
      } catch {
        saveBadge.className = "badge warn";
        saveBadge.textContent = "Not saved";
      }
    }

    function saveStateDebounced() {
      saveBadge.className = "badge dim";
      saveBadge.textContent = "Unsaved…";
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        saveTimer = null;
        saveState();
      }, 500);
    }

    function restoreState() {
      try {
        const raw = localStorage.getItem(storageKey);
        if (!raw) return;
        const s = safeJsonParse(raw);
        if (!s || typeof s !== "object") return;
        if (typeof s.a === "string") taA.value = s.a;
        if (typeof s.b === "string") taB.value = s.b;
        if (typeof s.c === "string") taC.value = s.c;
        if (typeof s.out === "string") taOut.value = s.out;
        if (typeof s.sep === "string") sepIn.value = s.sep;
        trimCB.checked = !!s.trim;
        skipCB.checked = s.skipEmpty !== false; // default true
        copiedSinceChange = !!s.copiedSinceChange;
        lastCopyAt = typeof s.lastCopyAt === "string" ? s.lastCopyAt : null;
      } catch {}
    }

    function markChanged() {
      copiedSinceChange = false;
      renderBadges();
      saveStateDebounced();
    }

    function getParts() {
      let parts = [taA.value, taB.value, taC.value].map(normalizeLineEndings);
      if (trimCB.checked) parts = parts.map((x) => x.trim());
      if (skipCB.checked) parts = parts.filter((x) => x.length > 0);
      return parts;
    }

    function buildOutput(replace) {
      const joined = getParts().join(sepIn.value);
      if (replace) taOut.value = joined;
      else taOut.value = (taOut.value ? taOut.value + sepIn.value : "") + joined;
      markChanged();
    }

    async function copyToClipboard() {
      const text = taOut.value || "";
      if (!text.trim()) {
        alert("No output to copy");
        return;
      }

      try {
        await navigator.clipboard.writeText(text);
        feedback.classList.add("show");
        setTimeout(() => feedback.classList.remove("show"), 1200);
        setCopied(true);
        return;
      } catch {}

      // Fallback
      try {
        taOut.focus();
        taOut.select();
        const ok = document.execCommand("copy");
        if (!ok) throw new Error("execCommand failed");
        feedback.classList.add("show");
        setTimeout(() => feedback.classList.remove("show"), 1200);
        setCopied(true);
      } catch {
        alert("Copy failed. Tap and hold to copy, or try a different browser.");
      }
    }

    function clearAll() {
      if (!confirm("Clear all text?")) return;
      taA.value = "";
      taB.value = "";
      taC.value = "";
      taOut.value = "";
      copiedSinceChange = false;
      lastCopyAt = null;
      renderBadges();
      saveStateDebounced();
    }

    // Build UI
    container.innerHTML = "";

    const topRow = document.createElement("div");
    topRow.className = "top-row";

    const title = document.createElement("h3");
    title.textContent = "Snippets — Build & Copy";

    const statusRow = document.createElement("div");
    statusRow.className = "status-row";

    const saveBadge = document.createElement("span");
    saveBadge.className = "badge dim";
    saveBadge.textContent = "";

    const copyBadge = document.createElement("span");
    copyBadge.className = "badge warn";
    copyBadge.textContent = "Not copied";

    statusRow.append(saveBadge, copyBadge);
    topRow.append(title, statusRow);

    const optsRow = document.createElement("div");
    optsRow.className = "controls";

    const sepWrap = document.createElement("div");
    sepWrap.className = "pill";

    const sepLbl = document.createElement("span");
    sepLbl.style.fontWeight = "900";
    sepLbl.textContent = "Separator";

    const sepIn = document.createElement("input");
    sepIn.type = "text";
    sepIn.value = "\n";

    sepWrap.append(sepLbl, sepIn);

    const trimWrap = document.createElement("div");
    trimWrap.className = "pill";
    const trimCB = document.createElement("input");
    trimCB.type = "checkbox";
    const trimText = document.createElement("span");
    trimText.textContent = "Trim parts";
    trimWrap.append(trimCB, trimText);

    const skipWrap = document.createElement("div");
    skipWrap.className = "pill";
    const skipCB = document.createElement("input");
    skipCB.type = "checkbox";
    skipCB.checked = true;
    const skipText = document.createElement("span");
    skipText.textContent = "Skip empty";
    skipWrap.append(skipCB, skipText);

    optsRow.append(sepWrap, trimWrap, skipWrap);

    const mkBtn = (text, cls, fn) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = cls;
      b.textContent = text;
      b.addEventListener("click", fn);
      return b;
    };

    const actionRow = document.createElement("div");
    actionRow.className = "actions";

    const btnBuild = mkBtn("Build output", "btn-primary", () => buildOutput(true));
    const btnAppend = mkBtn("Append", "btn-primary", () => buildOutput(false));
    const btnCopy = mkBtn("📋 Copy output", "btn-copy", copyToClipboard);
    const btnClear = mkBtn("🗑️ Clear all", "btn-clear", clearAll);

    actionRow.append(btnBuild, btnAppend, btnCopy, btnClear);

    const row = document.createElement("div");
    row.className = "row";

    const colA = document.createElement("div");
    colA.className = "col";
    const labA = document.createElement("label");
    labA.textContent = "Snippet A:";
    const taA = document.createElement("textarea");
    taA.placeholder = "Paste fragment A…";
    colA.append(labA, taA);

    const colB = document.createElement("div");
    colB.className = "col";
    const labB = document.createElement("label");
    labB.textContent = "Snippet B:";
    const taB = document.createElement("textarea");
    taB.placeholder = "Paste fragment B…";
    colB.append(labB, taB);

    const colC = document.createElement("div");
    colC.className = "col";
    const labC = document.createElement("label");
    labC.textContent = "Snippet C:";
    const taC = document.createElement("textarea");
    taC.placeholder = "Paste fragment C…";
    colC.append(labC, taC);

    row.append(colA, colB, colC);

    const outLabel = document.createElement("label");
    outLabel.textContent = "Output:";

    const taOut = document.createElement("textarea");
    taOut.placeholder = "Built text appears here…";

    const feedback = document.createElement("div");
    feedback.className = "feedback";
    feedback.textContent = "Copied!";

    container.append(topRow, optsRow, actionRow, row, outLabel, taOut, feedback);

    // Events
    const onChange = () => markChanged();
    taA.addEventListener("input", onChange);
    taB.addEventListener("input", onChange);
    taC.addEventListener("input", onChange);
    taOut.addEventListener("input", onChange);
    sepIn.addEventListener("input", onChange);
    trimCB.addEventListener("change", onChange);
    skipCB.addEventListener("change", onChange);

    // Restore + badges
    restoreState();
    renderBadges();
    saveBadge.className = "badge good";
    saveBadge.textContent = "Saved ✓";
    saveStateDebounced();
  });
})();
