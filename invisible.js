(() => {
  "use strict";

  // Registry helpers (works with your loader.js)
  window.SiteApps = window.SiteApps || {};
  window.SiteApps.registry = window.SiteApps.registry || {};
  window.SiteApps.register =
    window.SiteApps.register ||
    function (name, initFn) {
      window.SiteApps.registry[name] = initFn;
    };

  const STYLE_ID = "siteapps-invisible-style-v1";

  const NAMED = new Map([
    [0x200B, "ZWSP (Zero-Width Space)"],
    [0x200C, "ZWNJ (Zero-Width Non-Joiner)"],
    [0x200D, "ZWJ (Zero-Width Joiner)"],
    [0x2060, "WJ (Word Joiner)"],
    [0xFEFF, "BOM/ZWNBSP"],
    [0x00AD, "SHY (Soft Hyphen)"],
    [0x200E, "LRM (Left-to-Right Mark)"],
    [0x200F, "RLM (Right-to-Left Mark)"],
    [0x202A, "LRE"],
    [0x202B, "RLE"],
    [0x202C, "PDF"],
    [0x202D, "LRO"],
    [0x202E, "RLO"],
    [0x2066, "LRI"],
    [0x2067, "RLI"],
    [0x2068, "FSI"],
    [0x2069, "PDI"],
    [0x2061, "Invisible Function Apply"],
    [0x2062, "Invisible Times"],
    [0x2063, "Invisible Separator"],
    [0x2064, "Invisible Plus"],
    [0x061C, "ALM (Arabic Letter Mark)"],
  ]);

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
[data-app="invisible"]{
  font:16px/1.5 system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;
  max-width:980px;
  margin:14px auto;
  padding:18px;
  border-radius:14px;
  border:2px solid #111;
  background:#fff;
  color:#111;
}
[data-app="invisible"] label{ display:block; font-weight:900; margin:0 0 .5rem; }
[data-app="invisible"] textarea{
  width:100%;
  box-sizing:border-box;
  padding:.75rem;
  border:2px solid #111;
  border-radius:10px;
  font:15px/1.35 ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace;
  background:#fbfbfb;
  color:#111;
}
[data-app="invisible"] textarea:focus,
[data-app="invisible"] button:focus{
  outline:3px solid rgba(11,95,255,.35);
  outline-offset:2px;
}
[data-app="invisible"] .row{
  display:flex;
  gap:.5rem;
  align-items:center;
  margin-top:.75rem;
  flex-wrap:wrap;
}
[data-app="invisible"] button{
  padding:.65rem .95rem;
  border:2px solid #111;
  border-radius:10px;
  background:#fff;
  cursor:pointer;
  font-weight:900;
  font-size:14px;
}
[data-app="invisible"] .btn-scan{ background:#111; color:#fff; }
[data-app="invisible"] .btn-reset{ background:#fff; color:#7a0000; border-color:#7a0000; }
[data-app="invisible"] .btn-copy{ background:#fff; color:#111; }
[data-app="invisible"] .summary{ font-size:.95rem; color:#333; font-weight:700; }

[data-app="invisible"] .results{ margin-top:1.1rem; display:none; }
[data-app="invisible"] h3{ margin:.7rem 0 .25rem; }
[data-app="invisible"] .hint{ margin:.25rem 0 .75rem; color:#444; }

[data-app="invisible"] .highlighted{
  white-space:pre-wrap;
  border:2px dashed #777;
  border-radius:10px;
  padding:1rem;
  overflow:auto;
  background:#fafafa;
  font:14px/1.5 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
}
[data-app="invisible"] .inv-chip{
  display:inline-block;
  padding:0 .35em;
  margin:.05em .08em;
  border-radius:.35em;
  border:2px solid rgba(200,0,0,.55);
  background: rgba(255,0,0,.12);
  font: 12px/1.6 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
  color:#8a0000;
  vertical-align:baseline;
  white-space:nowrap;
}
[data-app="invisible"] .copy-status{ font-size:.95rem; font-weight:900; color:#0b3d0b; }
[data-app="invisible"] .badge-row{
  display:flex;
  gap:10px;
  align-items:center;
  flex-wrap:wrap;
}
[data-app="invisible"] .badge{
  font-size:14px;
  font-weight:900;
  padding:6px 10px;
  border:2px solid #111;
  border-radius:999px;
  background:#fff;
}
[data-app="invisible"] .badge.good{ border-color:#0b3d0b; color:#0b3d0b; }
[data-app="invisible"] .badge.warn{ border-color:#7a0000; color:#7a0000; }
[data-app="invisible"] .badge.dim{ border-color:#444; color:#444; }

@media (max-width:700px){
  [data-app="invisible"] button{ width:100%; }
  [data-app="invisible"] .badge-row{ width:100%; }
}
`;
    document.head.appendChild(style);
  }

  function isInvisibleCodePoint(cp) {
    if (cp === 9 || cp === 10 || cp === 13) return false; // keep tab, LF, CR
    if ((cp >= 0x0000 && cp <= 0x001f) || cp === 0x007f) return true;
    if (NAMED.has(cp)) return true;
    if (
      (cp >= 0x200b && cp <= 0x200f) ||
      (cp >= 0x202a && cp <= 0x202e) ||
      (cp >= 0x2060 && cp <= 0x2064) ||
      (cp >= 0x2066 && cp <= 0x2069) ||
      cp === 0xfeff
    )
      return true;
    return false;
  }

  function codePointLabel(cp) {
    const hex = cp.toString(16).toUpperCase().padStart(4, "0");
    const name = NAMED.get(cp) || "Invisible/Control";
    return `${name} · U+${hex}`;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (m) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[m]));
  }

  function highlightInvisibles(text) {
    let out = "";
    for (let i = 0; i < text.length; ) {
      const cp = text.codePointAt(i);
      const ch = String.fromCodePoint(cp);
      i += cp > 0xffff ? 2 : 1;

      if (isInvisibleCodePoint(cp)) {
        const label = codePointLabel(cp);
        const hex = cp.toString(16).toUpperCase().padStart(4, "0");
        out += `<span class="inv-chip" title="${escapeHtml(label)}">U+${hex}</span>`;
      } else {
        out += escapeHtml(ch);
      }
    }
    return out;
  }

  function removeInvisibles(text) {
    let out = "";
    for (let i = 0; i < text.length; ) {
      const cp = text.codePointAt(i);
      const ch = String.fromCodePoint(cp);
      i += cp > 0xffff ? 2 : 1;
      if (!isInvisibleCodePoint(cp)) out += ch;
    }
    return out;
  }

  function countInvisibles(text) {
    let total = 0;
    for (let i = 0; i < text.length; ) {
      const cp = text.codePointAt(i);
      i += cp > 0xffff ? 2 : 1;
      if (isInvisibleCodePoint(cp)) total++;
    }
    return total;
  }

  function safeJsonParse(s) {
    try { return JSON.parse(s); } catch { return null; }
  }

  function storageKey(container) {
    const k = container.getAttribute("data-storage-key");
    if (k && k.trim()) return `siteapps:invisible:${k.trim()}`;
    return `siteapps:invisible:${location.pathname || "/"}`;
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        ta.style.top = "0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        const ok = document.execCommand("copy");
        ta.remove();
        return !!ok;
      } catch {
        return false;
      }
    }
  }

  window.SiteApps.register("invisible", (container) => {
    ensureStyle();

    const key = storageKey(container);

    // State
    let copiedSinceChange = false;
    let lastCopyAt = null;
    let saveTimer = null;

    function setBadges() {
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

    function saveState() {
      try {
        const state = {
          v: 1,
          input: input.value,
          showResults: results.style.display !== "none",
          clean: clean.value,
          highlighted: highlighted.innerHTML,
          summary: summary.textContent,
          copiedSinceChange,
          lastCopyAt,
        };
        localStorage.setItem(key, JSON.stringify(state));
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

    function markChanged() {
      copiedSinceChange = false;
      setBadges();
      saveStateDebounced();
    }

    function restoreState() {
      const raw = localStorage.getItem(key);
      if (!raw) return;
      const s = safeJsonParse(raw);
      if (!s || typeof s !== "object") return;

      input.value = typeof s.input === "string" ? s.input : "";
      clean.value = typeof s.clean === "string" ? s.clean : "";
      summary.textContent = typeof s.summary === "string" ? s.summary : "";
      highlighted.innerHTML = typeof s.highlighted === "string" ? s.highlighted : "";

      results.style.display = s.showResults ? "block" : "none";

      copiedSinceChange = !!s.copiedSinceChange;
      lastCopyAt = typeof s.lastCopyAt === "string" ? s.lastCopyAt : null;
    }

    // Build UI
    container.innerHTML = "";
    container.setAttribute("data-app", "invisible");

    const top = document.createElement("div");
    top.className = "row";
    top.style.marginTop = "0";
    top.style.justifyContent = "space-between";

    const title = document.createElement("div");
    title.style.fontWeight = "900";
    title.textContent = "Invisible Code Detector";

    const badgeRow = document.createElement("div");
    badgeRow.className = "badge-row";

    const saveBadge = document.createElement("span");
    saveBadge.className = "badge dim";
    saveBadge.textContent = "";

    const copyBadge = document.createElement("span");
    copyBadge.className = "badge warn";
    copyBadge.textContent = "Not copied";

    badgeRow.append(saveBadge, copyBadge);
    top.append(title, badgeRow);

    const lab = document.createElement("label");
    lab.textContent = "Paste your text here:";

    const input = document.createElement("textarea");
    input.rows = 10;

    const row = document.createElement("div");
    row.className = "row";

    const btnScan = document.createElement("button");
    btnScan.className = "btn-scan";
    btnScan.textContent = "Scan";

    const btnReset = document.createElement("button");
    btnReset.className = "btn-reset";
    btnReset.textContent = "Reset";

    const summary = document.createElement("span");
    summary.className = "summary";
    summary.setAttribute("aria-live", "polite");

    row.append(btnScan, btnReset, summary);

    const results = document.createElement("div");
    results.className = "results";

    const h1 = document.createElement("h3");
    h1.textContent = "Highlighted view";

    const hint = document.createElement("p");
    hint.className = "hint";
    hint.textContent =
      "Invisible codes are shown as labels in-line. Hover to see the Unicode name & code point.";

    const highlighted = document.createElement("div");
    highlighted.className = "highlighted";

    const h2 = document.createElement("h3");
    h2.textContent = "Clean version (codes removed)";

    const copyRow = document.createElement("div");
    copyRow.className = "row";
    copyRow.style.margin = ".25rem 0";

    const copyBtn = document.createElement("button");
    copyBtn.className = "btn-copy";
    copyBtn.textContent = "Copy clean text";

    const copyStatus = document.createElement("span");
    copyStatus.className = "copy-status";

    copyRow.append(copyBtn, copyStatus);

    const clean = document.createElement("textarea");
    clean.rows = 8;

    results.append(h1, hint, highlighted, h2, copyRow, clean);

    container.append(top, lab, input, row, results);

    function scanNow() {
      const text = input.value || "";
      const total = countInvisibles(text);

      if (!text.length) {
        results.style.display = "none";
        summary.textContent = "Nothing to scan.";
        clean.value = "";
        highlighted.innerHTML = "";
        markChanged();
        return;
      }

      highlighted.innerHTML = highlightInvisibles(text);
      clean.value = removeInvisibles(text);
      results.style.display = "block";

      summary.textContent =
        total === 0
          ? "No invisible codes found."
          : `Found ${total} invisible code${total !== 1 ? "s" : ""}.`;

      markChanged();
    }

    function resetAll() {
      input.value = "";
      results.style.display = "none";
      summary.textContent = "";
      clean.value = "";
      highlighted.innerHTML = "";
      copiedSinceChange = false;
      lastCopyAt = null;
      setBadges();
      saveStateDebounced();
    }

    btnScan.addEventListener("click", scanNow);
    btnReset.addEventListener("click", resetAll);

    input.addEventListener("input", () => {
      // We don't auto-scan on every keystroke (could be heavy), but we do mark state changed.
      markChanged();
    });

    copyBtn.addEventListener("click", async () => {
      copyStatus.textContent = "";
      const ok = await copyText(clean.value || "");
      copyStatus.textContent = ok ? "Copied!" : "Copy failed.";
      setTimeout(() => (copyStatus.textContent = ""), 1500);
      if (ok) {
        copiedSinceChange = true;
        lastCopyAt = new Date().toISOString();
        setBadges();
        saveStateDebounced();
      }
    });

    // restore & init
    restoreState();
    setBadges();
    saveBadge.className = "badge good";
    saveBadge.textContent = "Saved ✓";
    saveStateDebounced();
  });
})();
