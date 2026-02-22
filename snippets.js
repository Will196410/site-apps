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

  const STYLE_ID = "siteapps-snippets-style-v11";

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
[data-app="snippets"] textarea.input{
  min-height:120px;
}
[data-app="snippets"] textarea.output{
  min-height:360px; /* taller output */
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

[data-app="snippets"] .feedback{
  background:#0b7a2b;
  color:#fff;
  padding:8px 12px;
  border-radius:10px;
  font-size:14px;
  font-weight:900;
  opacity:0;
  transition:opacity .2s;
  margin-top:10px;
  display:inline-block;
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

  function trimLinesAndClearEmpty(s, clearEmptyLines) {
    const raw = normalizeLineEndings(s);
    const lines = raw.split("\n");

    // Trim each line (always), then optionally remove empty lines
    const trimmed = lines.map((l) => l.trim());
    return clearEmptyLines
      ? trimmed.filter((l) => l !== "").join("\n")
      : trimmed.join("\n");
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
          v: 11,
          input: inputTA.value,
          output: outputTA.value,
          trim: trimCB.checked,
          clearEmpty: emptyCB.checked,
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
      }, 400);
    }

    function restoreState() {
      try {
        const raw = localStorage.getItem(storageKey);
        if (!raw) return;
        const s = safeJsonParse(raw);
        if (!s || typeof s !== "object") return;
        if (typeof s.input === "string") inputTA.value = s.input;
        if (typeof s.output === "string") outputTA.value = s.output;
        trimCB.checked = s.trim !== false; // default true
        emptyCB.checked = !!s.clearEmpty;
        copiedSinceChange = !!s.copiedSinceChange;
        lastCopyAt = typeof s.lastCopyAt === "string" ? s.lastCopyAt : null;
      } catch {}
    }

    function markChanged() {
      copiedSinceChange = false;
      renderBadges();
      saveStateDebounced();
    }

    function getProcessedInput() {
      let text = inputTA.value || "";
      // Options:
      // - "Trim" means trim each line's leading/trailing whitespace (keeps blank lines unless clear empty is on)
      // - "Clear empty lines" removes empty lines after trimming
      if (trimCB.checked) {
        text = trimLinesAndClearEmpty(text, emptyCB.checked);
      } else if (emptyCB.checked) {
        // If they untick trim but want clear-empty, still do a safe normalize + empty removal
        const raw = normalizeLineEndings(text);
        text = raw.split("\n").filter((l) => l.trim() !== "").join("\n");
      } else {
        text = normalizeLineEndings(text);
      }
      return text;
    }

    function prepend() {
      const chunk = getProcessedInput();
      if (!chunk) return;
      const out = outputTA.value || "";
      outputTA.value = out ? (chunk + "\n" + out) : chunk;
      inputTA.value = "";
      markChanged();
    }

    function append() {
      const chunk = getProcessedInput();
      if (!chunk) return;
      const out = outputTA.value || "";
      outputTA.value = out ? (out + "\n" + chunk) : chunk;
      inputTA.value = "";
      markChanged();
    }

    function replaceOut() {
      const chunk = getProcessedInput();
      outputTA.value = chunk;
      inputTA.value = "";
      markChanged();
    }

    async function copyToClipboard() {
      const text = outputTA.value || "";
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
        outputTA.focus();
        outputTA.select();
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
      if (!confirm("Clear input and output?")) return;
      inputTA.value = "";
      outputTA.value = "";
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
    title.textContent = "Snippets — Prepend / Append";

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

    const trimWrap = document.createElement("div");
    trimWrap.className = "pill";
    const trimCB = document.createElement("input");
    trimCB.type = "checkbox";
    trimCB.checked = true;
    const trimText = document.createElement("span");
    trimText.textContent = "Trim";
    trimWrap.append(trimCB, trimText);

    const emptyWrap = document.createElement("div");
    emptyWrap.className = "pill";
    const emptyCB = document.createElement("input");
    emptyCB.type = "checkbox";
    const emptyText = document.createElement("span");
    emptyText.textContent = "Clear empty lines";
    emptyWrap.append(emptyCB, emptyText);

    optsRow.append(trimWrap, emptyWrap);

    const mkBtn = (text, cls, fn) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = cls;
      b.textContent = text;
      b.addEventListener("click", fn);
      return b;
    };

    const actions = document.createElement("div");
    actions.className = "actions";

    const btnPre = mkBtn("⬆️ Prepend", "btn-primary", prepend);
    const btnApp = mkBtn("⬇️ Append", "btn-primary", append);
    const btnRep = mkBtn("Replace output", "btn-primary", replaceOut);
    const btnCopy = mkBtn("📋 Copy output", "btn-copy", copyToClipboard);
    const btnClear = mkBtn("🗑️ Clear all", "btn-clear", clearAll);

    actions.append(btnPre, btnApp, btnRep, btnCopy, btnClear);

    const inLabel = document.createElement("label");
    inLabel.textContent = "Input:";

    const inputTA = document.createElement("textarea");
    inputTA.className = "input";
    inputTA.placeholder = "Paste your fragment here…";

    const outLabel = document.createElement("label");
    outLabel.textContent = "Output:";

    const outputTA = document.createElement("textarea");
    outputTA.className = "output";
    outputTA.placeholder = "Your built text appears here…";

    const feedback = document.createElement("div");
    feedback.className = "feedback";
    feedback.textContent = "Copied!";

    container.append(topRow, optsRow, actions, inLabel, inputTA, outLabel, outputTA, feedback);

    // Change tracking
    const onChange = () => markChanged();
    inputTA.addEventListener("input", onChange);
    outputTA.addEventListener("input", onChange);
    trimCB.addEventListener("change", onChange);
    emptyCB.addEventListener("change", onChange);

    // Restore + badges
    restoreState();
    renderBadges();
    saveBadge.className = "badge good";
    saveBadge.textContent = "Saved ✓";
    saveStateDebounced();
  });
})();
