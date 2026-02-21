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

  const STYLE_ID = "siteapps-md-numberer-style-v1";

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;

    // Includes your original look + font import, scoped to [data-app="md-numberer"]
    style.textContent = `
@import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500&family=Crimson+Pro:wght@400;600;700&display=swap');

[data-app="md-numberer"]{
  --primary:#2d5a4a;
  --accent:#d4a574;
  --bg:#f8f6f1;
  --surface:#ffffff;
  --text:#2a2a2a;
  --text-muted:#6b6b6b;
  --border:#ddd8ce;
  --success:#4a7c59;
}
[data-app="md-numberer"] *{ box-sizing:border-box; }
[data-app="md-numberer"]{
  font-family:'Crimson Pro',serif;
  background:linear-gradient(135deg,var(--bg) 0%, #ede9df 100%);
  color:var(--text);
  padding:2rem;
  border-radius:12px;
  max-width:1400px;
  margin:0 auto;
  border:2px solid rgba(45,90,74,0.18);
}
[data-app="md-numberer"] .md-header{
  text-align:center;
  margin-bottom:2rem;
  padding-bottom:2rem;
  border-bottom:2px solid var(--border);
}
[data-app="md-numberer"] .md-header h1{
  font-size:2.3rem;
  font-weight:700;
  color:var(--primary);
  margin:0 0 0.5rem 0;
}
[data-app="md-numberer"] .md-subtitle{
  font-size:1.1rem;
  color:var(--text-muted);
  margin:0;
}
[data-app="md-numberer"] .md-config-panel{
  background:var(--surface);
  border-radius:12px;
  box-shadow:0 4px 20px rgba(45,90,74,0.08);
  padding:1.5rem;
  margin-bottom:2rem;
}
[data-app="md-numberer"] .md-config-header{ margin-bottom:1rem; }
[data-app="md-numberer"] .md-config-header h3{
  font-size:1.3rem;
  font-weight:600;
  color:var(--primary);
  margin:0 0 0.5rem 0;
}
[data-app="md-numberer"] .md-config-desc{
  font-size:0.95rem;
  color:var(--text-muted);
  margin:0;
}
[data-app="md-numberer"] .md-config-inputs{
  display:grid;
  grid-template-columns:repeat(auto-fit, minmax(150px, 1fr));
  gap:1rem;
}
[data-app="md-numberer"] .md-input-group{
  display:flex;
  flex-direction:column;
  gap:0.5rem;
}
[data-app="md-numberer"] .md-input-group label{
  font-size:0.9rem;
  font-weight:600;
  color:var(--text);
}
[data-app="md-numberer"] .md-number-input{
  font-family:'Fira Code',monospace;
  font-size:1rem;
  padding:0.5rem;
  border:2px solid var(--border);
  border-radius:6px;
  background:#fafaf8;
  color:var(--text);
  width:100%;
}
[data-app="md-numberer"] .md-number-input:focus{
  outline:none;
  border-color:var(--primary);
  box-shadow:0 0 0 3px rgba(45,90,74,0.1);
}
[data-app="md-numberer"] .md-workspace{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:2rem;
  margin-bottom:2rem;
}
@media (max-width:768px){
  [data-app="md-numberer"] .md-workspace{ grid-template-columns:1fr; }
  [data-app="md-numberer"] .md-config-inputs{ grid-template-columns:repeat(2,1fr); }
}
[data-app="md-numberer"] .md-panel{
  background:var(--surface);
  border-radius:12px;
  box-shadow:0 4px 20px rgba(45,90,74,0.08);
  padding:1.5rem;
}
[data-app="md-numberer"] .md-panel-header{
  margin-bottom:1rem;
  padding-bottom:1rem;
  border-bottom:1px solid var(--border);
}
[data-app="md-numberer"] .md-panel-title{
  font-size:1.3rem;
  font-weight:600;
  color:var(--primary);
  margin:0;
}
[data-app="md-numberer"] .md-textarea{
  font-family:'Fira Code',monospace;
  font-size:0.95rem;
  line-height:1.6;
  padding:1.25rem;
  border:2px solid var(--border);
  border-radius:8px;
  resize:vertical;
  min-height:400px;
  background:#fafaf8;
  color:var(--text);
  width:100%;
  display:block;
}
[data-app="md-numberer"] .md-textarea:focus{
  outline:none;
  border-color:var(--primary);
  box-shadow:0 0 0 3px rgba(45,90,74,0.1);
}
[data-app="md-numberer"] .md-toc-panel{ grid-column:1 / -1; }
[data-app="md-numberer"] .md-toc-content{
  font-family:'Fira Code',monospace;
  font-size:0.9rem;
  line-height:1.8;
  padding:1.5rem;
  background:#fafaf8;
  border:2px solid var(--border);
  border-radius:8px;
  min-height:150px;
  max-height:300px;
  overflow-y:auto;
  white-space:pre-wrap;
  color:var(--text);
}
[data-app="md-numberer"] .md-toc-content:empty::before{
  content:"Table of contents will appear here...";
  color:var(--text-muted);
  font-style:italic;
}
[data-app="md-numberer"] .md-button-group{
  display:flex;
  gap:1rem;
  margin-top:1rem;
  flex-wrap:wrap;
}
[data-app="md-numberer"] .md-btn{
  font-family:'Crimson Pro',serif;
  font-size:1rem;
  font-weight:600;
  padding:0.75rem 1.5rem;
  border:none;
  border-radius:8px;
  cursor:pointer;
  transition:all .2s ease;
}
[data-app="md-numberer"] .md-btn-primary{
  background:var(--primary);
  color:#fff;
}
[data-app="md-numberer"] .md-btn-primary:hover{ background:#234536; transform:translateY(-1px); }
[data-app="md-numberer"] .md-btn-secondary{
  background:#8b6f47;
  color:#fff;
}
[data-app="md-numberer"] .md-btn-secondary:hover{ background:#6f5836; transform:translateY(-1px); }
[data-app="md-numberer"] .md-btn-accent{
  background:var(--accent);
  color:var(--text);
}
[data-app="md-numberer"] .md-btn-accent:hover{ background:#c89556; transform:translateY(-1px); }

[data-app="md-numberer"] .md-toast{
  position:fixed;
  bottom:2rem;
  right:2rem;
  background:var(--success);
  color:#fff;
  padding:1rem 1.5rem;
  border-radius:8px;
  box-shadow:0 4px 20px rgba(0,0,0,.2);
  opacity:0;
  transform:translateY(20px);
  transition:all .25s ease;
  font-family:'Crimson Pro',serif;
  font-weight:600;
  z-index:10000;
  pointer-events:none;
}
[data-app="md-numberer"] .md-toast.show{ opacity:1; transform:translateY(0); }

/* small status badges (match your other tools) */
[data-app="md-numberer"] .status-row{
  display:flex;
  gap:10px;
  justify-content:center;
  flex-wrap:wrap;
  margin-top:10px;
}
[data-app="md-numberer"] .badge{
  font-family:'Fira Code',monospace;
  font-size:0.9rem;
  font-weight:700;
  padding:6px 10px;
  border-radius:999px;
  border:2px solid var(--border);
  background:#fff;
  color:var(--text);
}
[data-app="md-numberer"] .badge.good{ border-color:#0b3d0b; color:#0b3d0b; }
[data-app="md-numberer"] .badge.warn{ border-color:#7a0000; color:#7a0000; }
[data-app="md-numberer"] .badge.dim{ border-color:#666; color:#666; }
`;

    document.head.appendChild(style);
  }

  function safeJsonParse(s) {
    try { return JSON.parse(s); } catch { return null; }
  }

  function storageKey(container) {
    const k = container.getAttribute("data-storage-key");
    if (k && k.trim()) return `siteapps:numberer:${k.trim()}`;
    return `siteapps:numberer:${location.pathname || "/"}`;
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fallback
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

  window.SiteApps.register("md-numberer", (container) => {
    ensureStyle();

    const key = storageKey(container);

    // --- state ---
    let copiedSinceChange = false;
    let lastCopyAt = null;

    let saveTimer = null;

    function toast(msg) {
      toastEl.textContent = msg;
      toastEl.classList.add("show");
      setTimeout(() => toastEl.classList.remove("show"), 2800);
    }

    function setCopyBadge(flag) {
      copiedSinceChange = !!flag;
      if (copiedSinceChange) lastCopyAt = new Date().toISOString();
      renderBadges();
      saveStateDebounced();
    }

    function markChanged() {
      copiedSinceChange = false;
      renderBadges();
      saveStateDebounced();
    }

    function renderBadges() {
      // save badge is updated by saveState/saveStateDebounced
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
          startH1: startH1.value,
          zeroPad: zeroPad.value,
          startH2: startH2.value,
          startH3: startH3.value,
          startH4: startH4.value,
          startH5: startH5.value,
          startH6: startH6.value,
          input: mdInput.value,
          output: mdOutput.value,
          toc: tocContent.textContent,
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
      }, 600);
    }

    function restoreState() {
      const raw = localStorage.getItem(key);
      if (!raw) return;
      const s = safeJsonParse(raw);
      if (!s || typeof s !== "object") return;

      startH1.value = typeof s.startH1 === "string" ? s.startH1 : "";
      zeroPad.value = typeof s.zeroPad === "string" ? s.zeroPad : "";
      startH2.value = typeof s.startH2 === "string" ? s.startH2 : "";
      startH3.value = typeof s.startH3 === "string" ? s.startH3 : "";
      startH4.value = typeof s.startH4 === "string" ? s.startH4 : "";
      startH5.value = typeof s.startH5 === "string" ? s.startH5 : "";
      startH6.value = typeof s.startH6 === "string" ? s.startH6 : "";

      mdInput.value = typeof s.input === "string" ? s.input : "";
      mdOutput.value = typeof s.output === "string" ? s.output : "";
      tocContent.textContent = typeof s.toc === "string" ? s.toc : "";

      copiedSinceChange = !!s.copiedSinceChange;
      lastCopyAt = typeof s.lastCopyAt === "string" ? s.lastCopyAt : null;
    }

    // --- build UI ---
    container.innerHTML = "";
    container.setAttribute("data-app", "md-numberer"); // ensure selector matches even if user forgets

    const wrap = document.createElement("div");
    wrap.className = "md-numberer";

    wrap.innerHTML = `
      <div class="md-header">
        <h1>📝 Markdown Heading Numberer</h1>
        <p class="md-subtitle">Automatically number your Markdown headings with hierarchical precision</p>
        <div class="status-row">
          <span class="badge dim" data-role="save"> </span>
          <span class="badge warn" data-role="copy">Not copied</span>
        </div>
      </div>

      <div class="md-config-panel">
        <div class="md-config-header">
          <h3>⚙️ Starting Numbers (Optional)</h3>
          <p class="md-config-desc">
            H1 can be a label (e.g., "arc") or number (e.g., "3"). Set zero padding (e.g., "2" for 01.02.03).
            Leave blank for defaults.
          </p>
        </div>
        <div class="md-config-inputs">
          <div class="md-input-group">
            <label>H1 (label or #):</label>
            <input type="text" class="md-number-input" data-role="startH1" placeholder="1 or arc">
          </div>
          <div class="md-input-group">
            <label>Zero pad (digits):</label>
            <input type="number" class="md-number-input" data-role="zeroPad" min="0" max="5" placeholder="0 (none)">
          </div>
          <div class="md-input-group">
            <label>H2 starts at:</label>
            <input type="number" class="md-number-input" data-role="startH2" min="0" placeholder="1">
          </div>
          <div class="md-input-group">
            <label>H3 starts at:</label>
            <input type="number" class="md-number-input" data-role="startH3" min="0" placeholder="1">
          </div>
          <div class="md-input-group">
            <label>H4 starts at:</label>
            <input type="number" class="md-number-input" data-role="startH4" min="0" placeholder="1">
          </div>
          <div class="md-input-group">
            <label>H5 starts at:</label>
            <input type="number" class="md-number-input" data-role="startH5" min="0" placeholder="1">
          </div>
          <div class="md-input-group">
            <label>H6 starts at:</label>
            <input type="number" class="md-number-input" data-role="startH6" min="0" placeholder="1">
          </div>
        </div>
      </div>

      <div class="md-workspace">
        <div class="md-panel">
          <div class="md-panel-header">
            <h2 class="md-panel-title">📄 Input Markdown</h2>
          </div>
          <textarea class="md-textarea" data-role="mdInput"></textarea>
          <div class="md-button-group">
            <button class="md-btn md-btn-primary" data-role="btnNumber">🔢 Number Headings</button>
            <button class="md-btn md-btn-accent" data-role="btnRemove">✂️ Remove Numbering</button>
            <button class="md-btn md-btn-secondary" data-role="btnClear">🗑️ Clear All</button>
          </div>
        </div>

        <div class="md-panel">
          <div class="md-panel-header">
            <h2 class="md-panel-title">✅ Numbered Output</h2>
          </div>
          <textarea class="md-textarea" data-role="mdOutput" readonly></textarea>
          <div class="md-button-group">
            <button class="md-btn md-btn-accent" data-role="btnCopyOutput">📋 Copy Numbered Text</button>
          </div>
        </div>

        <div class="md-panel md-toc-panel">
          <div class="md-panel-header">
            <h2 class="md-panel-title">📑 Table of Contents</h2>
          </div>
          <div class="md-toc-content" data-role="toc"></div>
          <div class="md-button-group">
            <button class="md-btn md-btn-accent" data-role="btnCopyTOC">📋 Copy Table of Contents</button>
          </div>
        </div>
      </div>
    `;

    container.appendChild(wrap);

    const toastEl = document.createElement("div");
    toastEl.className = "md-toast";
    container.appendChild(toastEl);

    const q = (role) => wrap.querySelector(`[data-role="${role}"]`);

    const saveBadge = q("save");
    const copyBadge = q("copy");

    const startH1 = q("startH1");
    const zeroPad = q("zeroPad");
    const startH2 = q("startH2");
    const startH3 = q("startH3");
    const startH4 = q("startH4");
    const startH5 = q("startH5");
    const startH6 = q("startH6");

    const mdInput = q("mdInput");
    const mdOutput = q("mdOutput");
    const tocContent = q("toc");

    const btnNumber = q("btnNumber");
    const btnRemove = q("btnRemove");
    const btnClear = q("btnClear");
    const btnCopyOutput = q("btnCopyOutput");
    const btnCopyTOC = q("btnCopyTOC");

    function padNumber(num, padLength, isLabel) {
      if (isLabel || padLength === 0) return num.toString();
      return num.toString().padStart(padLength, "0");
    }

    function removeNumberingPrefix(title) {
      // same intent as your original:
      // - remove "1.2.3 " or "arc.1 " etc
      // - remove "12 " prefix
      return title.replace(/^(?:\w+\.)+\w+\s+|^\d+\s+/, "");
    }

    function numberHeadings() {
      const input = mdInput.value;
      if (!input.trim()) {
        toast("Please enter some Markdown text first!");
        return;
      }

      const padLength = zeroPad.value ? parseInt(zeroPad.value, 10) : 0;

      const h1Input = (startH1.value || "").trim();
      let h1Value, h1IsLabel;

      if (h1Input === "") {
        h1Value = 1;
        h1IsLabel = false;
      } else {
        const parsed = parseInt(h1Input, 10);
        if (Number.isNaN(parsed)) {
          h1Value = h1Input;
          h1IsLabel = true;
        } else {
          h1Value = parsed;
          h1IsLabel = false;
        }
      }

      const startValues = [h1Value];
      const startInputs = [null, startH2, startH3, startH4, startH5, startH6];
      for (let i = 2; i <= 6; i++) {
        const v = startInputs[i - 1].value;
        startValues.push(v ? parseInt(v, 10) : 1);
      }

      const lines = input.split("\n");
      const numberedLines = [];
      const tocItems = [];

      const counters = h1IsLabel
        ? [h1Value, startValues[1] - 1, startValues[2] - 1, startValues[3] - 1, startValues[4] - 1, startValues[5] - 1]
        : [startValues[0] - 1, startValues[1] - 1, startValues[2] - 1, startValues[3] - 1, startValues[4] - 1, startValues[5] - 1];

      for (const line of lines) {
        const m = line.match(/^(#{1,6})\s+(.+)$/);
        if (!m) {
          numberedLines.push(line);
          continue;
        }

        const level = m[1].length;
        const title = m[2];
        const cleanTitle = removeNumberingPrefix(title);

        if (level === 1) {
          if (!h1IsLabel) counters[0]++;
        } else {
          counters[level - 1]++;
        }

        // reset child levels
        for (let i = level; i < counters.length; i++) {
          if (i === 0 && h1IsLabel) continue;
          counters[i] = startValues[i] - 1;
        }

        // build number
        const parts = [];
        for (let i = 0; i < level; i++) {
          if (i === 0 && h1IsLabel) parts.push(counters[i]);
          else parts.push(padNumber(counters[i], padLength, false));
        }

        const numberString = parts.join(".");
        numberedLines.push(`${m[1]} ${numberString} ${cleanTitle}`);

        const indent = "  ".repeat(level - 1);
        tocItems.push(`${indent}${numberString} ${cleanTitle}`);
      }

      mdOutput.value = numberedLines.join("\n");
      tocContent.textContent = tocItems.join("\n");

      toast("✨ Headings numbered successfully!");
      markChanged();
    }

    function removeNumbering() {
      const input = mdInput.value;
      if (!input.trim()) {
        toast("Please enter some Markdown text first!");
        return;
      }

      const lines = input.split("\n");
      const cleaned = lines.map((line) => {
        const m = line.match(/^(#{1,6})\s+(.+)$/);
        if (!m) return line;
        return `${m[1]} ${removeNumberingPrefix(m[2])}`;
      });

      mdOutput.value = cleaned.join("\n");
      tocContent.textContent = "";

      toast("✂️ Numbering removed successfully!");
      markChanged();
    }

    async function copyOutput() {
      const text = mdOutput.value || "";
      if (!text.trim()) {
        toast("Nothing to copy! Number the headings first.");
        return;
      }
      const ok = await copyText(text);
      toast(ok ? "📋 Numbered text copied to clipboard!" : "Copy failed.");
      if (ok) setCopyBadge(true);
    }

    async function copyTOC() {
      const text = tocContent.textContent || "";
      if (!text.trim()) {
        toast("No table of contents to copy! Number the headings first.");
        return;
      }
      const ok = await copyText(text);
      toast(ok ? "📋 Table of contents copied to clipboard!" : "Copy failed.");
      if (ok) setCopyBadge(true);
    }

    function clearAll() {
      mdInput.value = "";
      mdOutput.value = "";
      tocContent.textContent = "";
      startH1.value = "";
      zeroPad.value = "";
      startH2.value = "";
      startH3.value = "";
      startH4.value = "";
      startH5.value = "";
      startH6.value = "";
      toast("🗑️ All cleared!");
      markChanged();
    }

    // bind
    btnNumber.addEventListener("click", numberHeadings);
    btnRemove.addEventListener("click", removeNumbering);
    btnClear.addEventListener("click", clearAll);
    btnCopyOutput.addEventListener("click", copyOutput);
    btnCopyTOC.addEventListener("click", copyTOC);

    // mark changes for inputs
    [startH1, zeroPad, startH2, startH3, startH4, startH5, startH6, mdInput].forEach((el) => {
      el.addEventListener("input", () => markChanged());
    });

    // restore + badges
    restoreState();
    renderBadges();

    saveBadge.className = "badge good";
    saveBadge.textContent = "Saved ✓";
    saveStateDebounced();

    // save on changes (debounced)
    [startH1, zeroPad, startH2, startH3, startH4, startH5, startH6, mdInput].forEach((el) => {
      el.addEventListener("input", () => saveStateDebounced());
    });

    // keep output/toc saved when computed
    const saveAfterAction = () => saveStateDebounced();
    btnNumber.addEventListener("click", saveAfterAction);
    btnRemove.addEventListener("click", saveAfterAction);
    btnClear.addEventListener("click", saveAfterAction);
  });
})();
