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

  const STYLE_ID = "siteapps-sorter-style-v1";

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
/* Text Line Sorter — high contrast + iPad friendly */
[data-app="sorter"]{
  font-family:-apple-system,system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;
  background:#fff;
  border:2px solid #111;
  padding:18px;
  border-radius:14px;
  color:#111;
  max-width:980px;
  margin:14px auto;
}
[data-app="sorter"] .top-row{
  display:flex;
  align-items:baseline;
  justify-content:space-between;
  gap:10px;
  flex-wrap:wrap;
  margin-bottom:10px;
}
[data-app="sorter"] h3{
  margin:0;
  font-size:20px;
  font-weight:900;
}
[data-app="sorter"] .status-row{
  display:flex;
  gap:10px;
  align-items:center;
  flex-wrap:wrap;
  justify-content:flex-end;
}
[data-app="sorter"] .badge{
  font-size:14px;
  font-weight:900;
  padding:6px 10px;
  border:2px solid #111;
  border-radius:999px;
  background:#fff;
}
[data-app="sorter"] .badge.good{ border-color:#0b3d0b; color:#0b3d0b; }
[data-app="sorter"] .badge.warn{ border-color:#7a0000; color:#7a0000; }
[data-app="sorter"] .badge.dim{ border-color:#444; color:#444; }

[data-app="sorter"] label{
  display:block;
  margin:10px 0 6px;
  font-weight:900;
  font-size:14px;
}
[data-app="sorter"] textarea{
  width:100%;
  min-height:160px;
  padding:12px;
  border:2px solid #111;
  border-radius:10px;
  font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace;
  font-size:15px;
  line-height:1.35;
}
[data-app="sorter"] textarea:focus{
  outline:none;
  box-shadow:0 0 0 3px rgba(11,95,255,0.25);
}

[data-app="sorter"] .controls{
  display:flex;
  flex-wrap:wrap;
  gap:10px;
  margin:12px 0 10px;
  align-items:center;
}
[data-app="sorter"] .controls button,
[data-app="sorter"] .actions button{
  border:2px solid #111;
  border-radius:10px;
  cursor:pointer;
  padding:10px 12px;
  font-weight:900;
  font-size:14px;
  background:#fff;
  color:#111;
}
[data-app="sorter"] .btn-primary{ background:#0b7a2b; border-color:#0b7a2b; color:#fff; }
[data-app="sorter"] .btn-secondary{ background:#0b5fff; border-color:#0b5fff; color:#fff; }
[data-app="sorter"] .btn-copy{ background:#111; border-color:#111; color:#fff; }
[data-app="sorter"] .btn-clear{ background:#fff; border-color:#7a0000; color:#7a0000; }

[data-app="sorter"] .check{
  display:flex;
  align-items:center;
  gap:10px;
  padding:8px 10px;
  border:2px solid #111;
  border-radius:10px;
}
[data-app="sorter"] input[type="checkbox"]{
  width:20px; height:20px;
}

[data-app="sorter"] .result-row{
  position:relative;
}
[data-app="sorter"] .feedback{
  position:absolute;
  top:10px;
  right:10px;
  background:#0b7a2b;
  color:#fff;
  padding:8px 12px;
  border-radius:10px;
  font-size:14px;
  font-weight:900;
  opacity:0;
  transition:opacity .2s;
  pointer-events:none;
}
[data-app="sorter"] .feedback.show{ opacity:1; }

[data-app="sorter"] .actions{
  display:flex;
  gap:10px;
  flex-wrap:wrap;
  margin-top:10px;
}
@media (max-width:700px){
  [data-app="sorter"] .controls,
  [data-app="sorter"] .actions{ flex-direction:column; }
  [data-app="sorter"] .controls button,
  [data-app="sorter"] .actions button{ width:100%; }
}
`;
    document.head.appendChild(style);
  }

  function safeJsonParse(s) {
    try { return JSON.parse(s); } catch { return null; }
  }

  function makeStorageKey(container) {
    const k = container.getAttribute("data-storage-key");
    if (k && k.trim()) return `siteapps:sorter:${k.trim()}`;
    // fallback: per-path
    return `siteapps:sorter:${(location.pathname || "/")}`;
  }

  function normalizeLineEndings(s) {
    return String(s || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  }

  function sortLines(lines, type) {
    switch (type) {
      case "asc-alpha":
        lines.sort((a, b) => a.localeCompare(b, undefined, { numeric: false, sensitivity: "base" }));
        break;
      case "desc-alpha":
        lines.sort((a, b) => b.localeCompare(a, undefined, { numeric: false, sensitivity: "base" }));
        break;
      case "asc-num":
        lines.sort((a, b) => {
          const numA = parseFloat(a);
          const numB = parseFloat(b);
          const aNum = !Number.isNaN(numA);
          const bNum = !Number.isNaN(numB);
          if (!aNum && !bNum) return a.localeCompare(b, undefined, { sensitivity: "base" });
          if (!aNum) return 1;
          if (!bNum) return -1;
          return numA - numB;
        });
        break;
      case "desc-num":
        lines.sort((a, b) => {
          const numA = parseFloat(a);
          const numB = parseFloat(b);
          const aNum = !Number.isNaN(numA);
          const bNum = !Number.isNaN(numB);
          if (!aNum && !bNum) return b.localeCompare(a, undefined, { sensitivity: "base" });
          if (!aNum) return 1;
          if (!bNum) return -1;
          return numB - numA;
        });
        break;
    }
    return lines;
  }

  window.SiteApps.register("sorter", (container) => {
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

    function markChanged() {
      copiedSinceChange = false;
      renderBadges();
      saveStateDebounced();
    }

    let saveTimer = null;
    function saveState() {
      try {
        const state = {
          v: 1,
          input: inputTA.value,
          removeDupes: dupesCB.checked,
          output: outputTA.value,
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
        if (typeof s.input === "string") inputTA.value = s.input;
        if (typeof s.output === "string") outputTA.value = s.output;
        dupesCB.checked = !!s.removeDupes;
        copiedSinceChange = !!s.copiedSinceChange;
        lastCopyAt = typeof s.lastCopyAt === "string" ? s.lastCopyAt : null;
      } catch {}
    }

    // Build UI
    container.innerHTML = "";

    const topRow = document.createElement("div");
    topRow.className = "top-row";

    const title = document.createElement("h3");
    title.textContent = "Text Line Sorter & Deduplicator";

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

    const inputLabel = document.createElement("label");
    inputLabel.textContent = "Input (one item per line):";

    const inputTA = document.createElement("textarea");
    inputTA.placeholder = "Enter your text here, one line per item…";

    const controls = document.createElement("div");
    controls.className = "controls";

    const mkBtn = (text, cls, fn) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = cls;
      b.textContent = text;
      b.addEventListener("click", fn);
      return b;
    };

    const dupesWrap = document.createElement("div");
    dupesWrap.className = "check";

    const dupesCB = document.createElement("input");
    dupesCB.type = "checkbox";
    dupesCB.id = `sorter-dupes-${Math.random().toString(16).slice(2)}`;

    const dupesLbl = document.createElement("label");
    dupesLbl.setAttribute("for", dupesCB.id);
    dupesLbl.style.margin = "0";
    dupesLbl.textContent = "Remove duplicates";

    dupesWrap.append(dupesCB, dupesLbl);

    const outputWrap = document.createElement("div");
    outputWrap.className = "result-row";

    const outputLabel = document.createElement("label");
    outputLabel.textContent = "Result:";

    const outputTA = document.createElement("textarea");
    outputTA.readOnly = true;
    outputTA.placeholder = "Sorted results will appear here…";

    const feedback = document.createElement("div");
    feedback.className = "feedback";
    feedback.textContent = "Copied!";

    outputWrap.append(outputLabel, outputTA, feedback);

    const actions = document.createElement("div");
    actions.className = "actions";

    function getLines() {
      const raw = normalizeLineEndings(inputTA.value);
      return raw.split("\n").map(l => l.trim()).filter(l => l !== "");
    }

    function runSort(type) {
      const lines = getLines();
      if (!lines.length) {
        alert("Please enter some text to sort");
        return;
      }

      let out = lines;

      if (dupesCB.checked) {
        // preserve first-seen order pre-sort? (Your original de-dupes before sorting)
        // We'll keep your behaviour: de-dupe BEFORE sort.
        out = [...new Set(out)];
      }

      out = sortLines(out, type);
      outputTA.value = out.join("\n");

      markChanged();
    }

    async function copyToClipboard() {
      const text = outputTA.value || "";
      if (!text.trim()) {
        alert("No text to copy");
        return;
      }

      // Preferred API
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
      if (!confirm("Clear all text?")) return;
      inputTA.value = "";
      outputTA.value = "";
      dupesCB.checked = false;
      copiedSinceChange = false;
      lastCopyAt = null;
      renderBadges();
      saveStateDebounced();
    }

    controls.append(
      mkBtn("Sort A→Z", "btn-primary", () => runSort("asc-alpha")),
      mkBtn("Sort Z→A", "btn-primary", () => runSort("desc-alpha")),
      mkBtn("Sort 0→9", "btn-secondary", () => runSort("asc-num")),
      mkBtn("Sort 9→0", "btn-secondary", () => runSort("desc-num")),
      dupesWrap
    );

    actions.append(
      mkBtn("📋 Copy result", "btn-copy", copyToClipboard),
      mkBtn("🗑️ Clear all", "btn-clear", clearAll)
    );

    container.append(topRow, inputLabel, inputTA, controls, outputWrap, actions);

    // Persist / change tracking
    inputTA.addEventListener("input", () => {
      markChanged();
      saveStateDebounced();
    });
    dupesCB.addEventListener("change", () => {
      markChanged();
      saveStateDebounced();
    });

    // Restore
    restoreState();
    renderBadges();
    saveBadge.className = "badge good";
    saveBadge.textContent = "Saved ✓";
  });
})();
