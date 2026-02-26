(() => {
  "use strict";

  // ---- SiteApps registry (works with your loader.js) ----
  window.SiteApps = window.SiteApps || {};
  window.SiteApps.registry = window.SiteApps.registry || {};
  window.SiteApps.register =
    window.SiteApps.register ||
    function (name, initFn) {
      window.SiteApps.registry[name] = initFn;
    };

  const STYLE_ID = "siteapps-mdse-style";

  function ensureStyle() {
    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }

    style.textContent = `
[data-app="mdse"]{
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  max-width: 980px;
  margin: 14px auto;
  border: 2px solid #111;
  border-radius: 16px;
  padding: 18px;
  background: #fff;
  color: #111;
}
[data-app="mdse"] *{ box-sizing:border-box; }
[data-app="mdse"] h3{ margin:0 0 10px; font-size: 18px; }
[data-app="mdse"] .muted{ color:#444; font-size: 13px; font-weight: 700; }

[data-app="mdse"] textarea:not(.title){ width:100%; }

[data-app="mdse"] textarea,
[data-app="mdse"] input,
[data-app="mdse"] select{
  border:2px solid #111;
  border-radius: 12px;
  padding: 12px;
  font-size: 16px;
  line-height: 1.35;
  background: #fbfbfb;
  color:#111;
}
[data-app="mdse"] textarea:focus,
[data-app="mdse"] button:focus,
[data-app="mdse"] select:focus,
[data-app="mdse"] input:focus{
  outline: 3px solid rgba(11,95,255,.35);
  outline-offset: 2px;
}

[data-app="mdse"] .topbar{
  display:flex;
  gap: 12px;
  align-items:flex-start;
  flex-wrap:wrap;
  margin-bottom: 10px;
}
[data-app="mdse"] .topbar .left{ flex: 1 1 520px; min-width: 0; }
[data-app="mdse"] .topbar .right{ flex: 1 1 220px; display:flex; justify-content:flex-end; min-width: 0; }

[data-app="mdse"] .tabs{
  display:flex;
  gap: 10px;
  flex-wrap:wrap;
  margin: 6px 0 10px;
}
[data-app="mdse"] .tabbtn{
  border:2px solid #111;
  border-radius: 999px;
  padding: 8px 12px;
  font-weight: 1000;
  background:#fff;
  cursor:pointer;
}
[data-app="mdse"] .tabbtn.active{
  background:#111;
  color:#fff;
}
[data-app="mdse"] .tabPanel{ display:none; }
[data-app="mdse"] .tabPanel.active{ display:block; }

[data-app="mdse"] .btnrow{
  display:flex;
  gap: 8px;
  flex-wrap: wrap;
  margin: 10px 0 10px;
}
[data-app="mdse"] button{
  border: 2px solid #111;
  border-radius: 12px;
  padding: 10px 12px;
  font-weight: 900;
  font-size: 13px;
  background: #fff;
  cursor: pointer;
}
[data-app="mdse"] button.primary{ background:#111; color:#fff; }
[data-app="mdse"] button.warn{ border-color:#7a0000; color:#7a0000; }
[data-app="mdse"] button:disabled{ opacity:.55; cursor:not-allowed; }

[data-app="mdse"] .badges{
  display:flex;
  gap:10px;
  align-items:center;
  justify-content:flex-end;
  flex-wrap:wrap;
}
[data-app="mdse"] .badge{
  border:2px solid #111;
  border-radius:999px;
  padding: 6px 10px;
  font-weight: 900;
  font-size: 13px;
  background:#fff;
}
[data-app="mdse"] .badge.good{ border-color:#0b3d0b; color:#0b3d0b; }
[data-app="mdse"] .badge.warn{ border-color:#7a0000; color:#7a0000; }
[data-app="mdse"] .badge.dim{ border-color:#444; color:#444; }

[data-app="mdse"] .levelFilter{
  display:flex;
  gap: 8px;
  align-items:center;
  flex-wrap:wrap;
  margin-top: 10px;
}
[data-app="mdse"] .levelFilter label{
  font-weight: 900;
  font-size: 13px;
}
[data-app="mdse"] select{
  padding: 8px 10px;
  font-weight: 900;
  background:#fff;
}

/* Search UI */
[data-app="mdse"] .searchRow{
  display:flex;
  gap:8px;
  align-items:center;
  flex-wrap:wrap;
  margin-top: 10px;
}
[data-app="mdse"] .searchRow input[type="search"]{
  flex: 1 1 260px;
  border:2px solid #111;
  border-radius: 12px;
  padding: 10px 12px;
  font-weight: 900;
  font-size: 15px;
  background:#fff;
}
[data-app="mdse"] .searchOpt{
  display:flex;
  gap:6px;
  align-items:center;
  font-weight: 900;
  font-size: 13px;
  color:#222;
}
[data-app="mdse"] .searchCount{
  font-weight: 900;
  font-size: 13px;
  color:#444;
  padding: 6px 10px;
  border: 2px solid rgba(0,0,0,.15);
  border-radius: 999px;
  background:#fff;
}

[data-app="mdse"] .canvas{ margin-top: 14px; }

[data-app="mdse"] .node{
  background:#fff;
  border: 2px solid rgba(0,0,0,.15);
  border-radius: 14px;
  padding: 12px;
  margin: 10px 0;
}
[data-app="mdse"] .node.level-1{ border-left: 10px solid #111; margin-left:0; }
[data-app="mdse"] .node.level-2{ border-left: 10px solid #444; margin-left:18px; }
[data-app="mdse"] .node.level-3{ border-left: 10px solid #777; margin-left:36px; }
[data-app="mdse"] .node.level-4{ border-left: 10px solid #999; margin-left:54px; }
[data-app="mdse"] .node.level-5{ border-left: 10px solid #bbb; margin-left:72px; }
[data-app="mdse"] .node.level-6{ border-left: 10px solid #ddd; margin-left:90px; }

/* iPad/Safari flex squeeze fix: grid header */
[data-app="mdse"] .hdr{
  display: grid !important;
  grid-template-columns: auto auto auto 1fr;
  column-gap: 10px;
  row-gap: 8px;
  align-items: start;
  min-width: 0;
}
[data-app="mdse"] .hdr > *{ min-width: 0; }

[data-app="mdse"] .tools{
  display:flex;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 2px solid rgba(0,0,0,.08);
  justify-content: flex-start;
}

/* Optional: subtle highlight for the active node */
[data-app="mdse"] .node.activeNode{
  border-color: rgba(11,95,255,.45);
  box-shadow: 0 8px 22px rgba(11,95,255,.08);
}

[data-app="mdse"] .pill{
  border:2px solid #111;
  border-radius: 12px;
  padding: 8px 10px;
  font-weight: 900;
  font-size: 13px;
  background:#fff;
  user-select: none;
}
[data-app="mdse"] .pill.gray{ border-color:#444; color:#444; }

[data-app="mdse"] .title{
  width: 100% !important;
  min-width: 240px !important;
  border:2px solid rgba(0,0,0,.15);
  border-radius: 12px;
  padding: 10px 12px;
  font-size: 16px;
  font-weight: 900;
  resize: none;
  overflow:hidden;
  min-height: 44px;
  background: #fbfbfb;
  display:block;
}

[data-app="mdse"] .title{
  grid-column: 1 / -1;
}

[data-app="mdse"] .tools{
  display:flex;
  gap: 6px;
  flex-wrap:wrap;
  justify-content:flex-end;
  align-items:flex-start;
  margin-left: 0 !important;
}
[data-app="mdse"] .tools button{
  padding: 8px 10px;
  border-radius: 12px;
  font-size: 13px;
}

[data-app="mdse"] .body textarea{ white-space: pre-wrap; }
[data-app="mdse"] .body{ margin-top: 10px; display:none; }
[data-app="mdse"] .body.show{ display:block; }

[data-app="mdse"] .hint{
  margin-top: 10px;
  font-size: 13px;
  font-weight: 800;
  color:#444;
}

@media (max-width: 900px){
  [data-app="mdse"] .hdr{
    grid-template-columns: auto auto auto 1fr;
    grid-auto-rows: auto;
    row-gap: 10px;
  }
  [data-app="mdse"] .tools{
    grid-column: 1 / -1;
    justify-content: flex-start;
  }
  [data-app="mdse"] .title{
    grid-column: 1 / -1;
    min-width: 0 !important;
  }
}

[data-app="mdse"] .movingSource{
  border-color: #0b5fff !important;
  box-shadow: 0 8px 28px rgba(11,95,255,.18);
  background: #f6f9ff !important;
}
[data-app="mdse"] .moveTarget{
  cursor:pointer;
  border-color:#0b3d0b !important;
  background:#f1fff1 !important;
}
[data-app="mdse"] .collapsed{
  border-color:#9a7b00 !important;
  background:#fffbe6 !important;
}

/* Search highlighting (Structure tab) */
[data-app="mdse"] .match{
  outline: 4px solid rgba(255, 170, 0, .65);
  outline-offset: 2px;
}
[data-app="mdse"] .activeMatch{
  outline: 5px solid rgba(255, 120, 0, .85);
  outline-offset: 3px;
}

/* Tags + Search cards */
[data-app="mdse"] .tagbar{
  display:flex;
  gap: 10px;
  flex-wrap:wrap;
  align-items:center;
  margin: 10px 0 12px;
}
[data-app="mdse"] .tagchip{
  border:2px solid #111;
  border-radius: 999px;
  padding: 8px 12px;
  font-weight: 1000;
  background:#fff;
  cursor:pointer;
}
[data-app="mdse"] .tagchip.active{
  background:#111;
  color:#fff;
}
[data-app="mdse"] .tagmeta{
  font-weight: 900;
  color:#444;
  font-size: 13px;
}
[data-app="mdse"] .taglist{
  display:grid;
  gap: 10px;
  margin-top: 10px;
}
[data-app="mdse"] .tagcard{
  border:2px solid rgba(0,0,0,.15);
  border-radius: 14px;
  padding: 12px;
  background:#fff;
  cursor:pointer;
}
[data-app="mdse"] .tagcard:hover{
  box-shadow: 0 6px 18px rgba(0,0,0,.06);
}
[data-app="mdse"] .tagcard .toph{
  display:flex;
  gap: 10px;
  align-items:center;
  flex-wrap:wrap;
  font-weight: 1000;
}
[data-app="mdse"] .tagcard .toph .lvl{
  border:2px solid #111;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 1000;
}
[data-app="mdse"] .tagcard .titleline{
  font-size: 15px;
  font-weight: 1000;
}
[data-app="mdse"] .tagcard .preview{
  margin-top: 6px;
  color:#333;
  font-weight: 750;
  font-size: 14px;
  line-height: 1.35;
}
[data-app="mdse"] .tagcard .subtags{
  margin-top: 8px;
  display:flex;
  gap: 8px;
  flex-wrap:wrap;
}
[data-app="mdse"] .tagpill{
  border: 2px solid rgba(0,0,0,.15);
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 1000;
  color:#444;
  background:#fff;
}

[data-app="mdse"] .footer{
  margin-top: 14px;
  font-size: 12px;
  color:#666;
  font-weight: 700;
  text-align:right;
}


/* Hide tools until node is active */
[data-app="mdse"] .tools{ display:none; }
[data-app="mdse"] .node.activeNode .tools{ display:flex; }


`;
  }

  // ---- Utilities ----
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const uid = () =>
    `n_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;

  function autoResizeTA(ta) {
    ta.style.height = "auto";
    ta.style.height = Math.max(44, ta.scrollHeight) + "px";
  }

  function safeJsonParse(s) {
    try { return JSON.parse(s); } catch { return null; }
  }

  function storageKey(container) {
    const k = container.getAttribute("data-storage-key");
    if (k && k.trim()) return `siteapps:mdse:${k.trim()}`;
    return `siteapps:mdse:${location.pathname || "/"}`;
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

  // ---- Tag parsing helpers ----
  // Only treat lines starting with "%% tag" (or "\%% tag") as tags
  const TAG_LINE_RE = /^\s*\\?%%\s*tag\s+(.*)\s*$/i;

  function normaliseTag(t) {
    return (t || "")
      .trim()
      .replace(/\s+/g, " ")
      .toLowerCase();
  }

  function extractTagsFromBody(bodyText) {
    const tags = [];
    const lines = (bodyText || "").split("\n");
    for (const line of lines) {
      const m = line.match(TAG_LINE_RE);
      if (!m) continue;
      const payload = (m[1] || "").trim();
      if (!payload) continue;

      // Support:
      // - "arc:escape" (one per line)
      // - "tags: arc:escape, pov:ember"
      const lower = payload.toLowerCase();
      let chunk = payload;

      if (lower.startsWith("tags:")) {
        chunk = payload.slice(payload.indexOf(":") + 1);
      }

      const parts = chunk
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);

      for (const p of parts) {
        const nt = normaliseTag(p);
        if (!nt) continue;
        tags.push(nt);
      }
    }

    const seen = new Set();
    const out = [];
    for (const t of tags) {
      if (seen.has(t)) continue;
      seen.add(t);
      out.push(t);
    }
    return out;
  }

  function bodyWithoutTagLines(bodyText) {
    const lines = (bodyText || "").split("\n");
    const kept = [];
    for (const line of lines) {
      if (TAG_LINE_RE.test(line)) continue;
      kept.push(line);
    }
    return kept.join("\n").trim();
  }

  function firstSentence(text) {
    const s = (text || "").trim();
    if (!s) return "";
    const m = s.match(/^[\s\S]*?[.!?](?=\s|$)/);
    if (m && m[0]) return m[0].trim();
    const line = s.split("\n").find((x) => x.trim());
    return (line || "").trim();
  }

  // ---- Core app ----
  window.SiteApps.register("mdse", (container) => {
    ensureStyle();

    const KEY = storageKey(container);

    // State
    let nodes = []; // {id, level, title, body, isCollapsed, showBody, tags[]}
    let sourceId = null;
    let lastCreatedId = null;
    let maxVisibleLevel = 6;

    let copiedSinceChange = false;
    let lastCopyAt = null;

    // Search state
    let searchQuery = "";
    let searchInBody = false;
    let revealMatches = true;
    let matchIds = [];
    let matchPos = -1;

    // Tabs / Tags view state
    let activeTab = "structure"; // "structure" | "search" | "tags"
    let activeTag = ""; // normalised tag or ""

    let activeNodeId = ""; // which node is "selected" for showing controls
    
    let saveTimer = null;
    let matchTimer = null;
    let tagTimer = null;

    // ---- Outline helpers ----
    function indexById(id) {
      return nodes.findIndex((n) => n.id === id);
    }

    function familyIndices(startIdx) {
      const fam = [startIdx];
      if (startIdx < 0 || startIdx >= nodes.length) return fam;
      const pLevel = nodes[startIdx].level;
      for (let i = startIdx + 1; i < nodes.length; i++) {
        if (nodes[i].level > pLevel) fam.push(i);
        else break;
      }
      return fam;
    }

    function familyIds(startId) {
      const idx = indexById(startId);
      if (idx < 0) return [];
      return familyIndices(idx).map((i) => nodes[i].id);
    }

    function hasChildren(idx) {
      return familyIndices(idx).length > 1;
    }

    // ---- Bulk tag helpers (DIRECT CHILDREN ONLY) ----
    function normaliseNewlines(s) {
      return (s || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    }

    function directChildIndices(parentIdx) {
      const out = [];
      if (parentIdx < 0 || parentIdx >= nodes.length) return out;
      const pLevel = nodes[parentIdx].level;

      for (let i = parentIdx + 1; i < nodes.length; i++) {
        const lvl = nodes[i].level;
        if (lvl <= pLevel) break;            // end of subtree
        if (lvl === pLevel + 1) out.push(i); // direct children only
      }
      return out;
    }

    function hasExactTagLine(body, payload) {
      const want = (payload || "").trim();
      if (!want) return false;
      const lines = normaliseNewlines(body).split("\n");
      return lines.some((ln) => {
        const m = ln.match(/^\s*\\?%%\s*tag\s+(.*)\s*$/i);
        if (!m) return false;
        return (m[1] || "").trim().toLowerCase() === want.toLowerCase();
      });
    }

    function addTagLineToBody(body, payload) {
      const want = (payload || "").trim();
      if (!want) return body || "";

      const b = normaliseNewlines(body || "").trimEnd();
      if (hasExactTagLine(b, want)) return b;

      const prefix = b ? b + "\n" : "";
      return prefix + `%% tag ${want}`;
    }

    function removeTagLineFromBody(body, payload) {
      const want = (payload || "").trim();
      if (!want) return body || "";

      const lines = normaliseNewlines(body || "").split("\n");
      const kept = lines.filter((ln) => {
        const m = ln.match(/^\s*\\?%%\s*tag\s+(.*)\s*$/i);
        if (!m) return true;
        return (m[1] || "").trim().toLowerCase() !== want.toLowerCase();
      });

      return kept.join("\n").trimEnd();
    }

    function bulkTagDirectChildren(parentId, payload, mode /* "add" | "remove" */) {
      const parentIdx = indexById(parentId);
      if (parentIdx < 0) return;

      const childIdxs = directChildIndices(parentIdx);
      if (!childIdxs.length) {
        alert("No direct children under this heading.");
        return;
      }

      childIdxs.forEach((i) => {
        const n = nodes[i];
        n.body =
          mode === "remove"
            ? removeTagLineFromBody(n.body || "", payload)
            : addTagLineToBody(n.body || "", payload);

        n.tags = extractTagsFromBody(n.body);
        n.showBody = true; // show immediately so you can confirm it worked
      });

      markChangedFull();
    }

    // ---- Search helpers ----
    const norm = (s) => (s || "").toLowerCase();

    function nodeMatches(n, q) {
      if (!q) return false;
      const qq = norm(q);
      if (norm(n.title).includes(qq)) return true;
      if (searchInBody && norm(n.body).includes(qq)) return true;
      return false;
    }

    function nodeMatchesBodyOnly(n, q) {
      if (!q || !searchInBody) return false;
      const qq = norm(q);
      const inTitle = norm(n.title).includes(qq);
      const inBody = norm(n.body).includes(qq);
      return !inTitle && inBody;
    }

    // ---- Build UI ----
    container.innerHTML = "";
    container.setAttribute("data-app", "mdse");

    container.innerHTML = `
<div class="topbar">
  <div class="left">
    <h3>Markdown Structure Editor</h3>
    <div class="muted">Paste Markdown → Load → reorder / tweak headings → Copy Result</div>

    <div class="tabs" role="tablist" aria-label="Views">
      <button type="button" class="tabbtn tabStructure" role="tab">Structure</button>
      <button type="button" class="tabbtn tabSearch" role="tab">Search</button>
      <button type="button" class="tabbtn tabTags" role="tab">Tags</button>
    </div>

    <div class="tabPanel panelStructure" role="tabpanel">
      <textarea class="mdInput" placeholder="Paste Markdown here..."></textarea>

      <div class="btnrow">
        <button class="primary btnLoad" type="button">Load Markdown</button>
        <button class="btnUpdate" type="button">Update Input Area</button>
        <button class="primary btnCopy" type="button">Copy Result</button>
        <button class="warn btnReset" type="button">Reset Everything</button>
        <button class="btnAddTop" type="button">+ Add H1</button>
      </div>

      <div class="levelFilter">
        <label for="mdseMaxLevel">Show up to:</label>
        <select id="mdseMaxLevel">
          <option value="1">H1</option>
          <option value="2">H2</option>
          <option value="3">H3</option>
          <option value="4">H4</option>
          <option value="5">H5</option>
          <option value="6">H6 (All)</option>
        </select>

        <button type="button" class="btnLvl1">H1</button>
        <button type="button" class="btnLvl2">H1–H2</button>
        <button type="button" class="btnLvl3">H1–H3</button>
        <button type="button" class="btnLvlAll">All</button>
      </div>

      <div class="hint">Tip: Tap ⠿ PIN on a heading, then tap a green target heading to move the whole branch.</div>

      <div class="canvas"></div>
    </div>

    <div class="tabPanel panelSearch" role="tabpanel">
      <div class="searchRow" role="search" aria-label="Outline search">
        <input id="mdseSearch" type="search" placeholder="Search…" autocomplete="off" />
        <button type="button" class="btnPrev">Prev</button>
        <button type="button" class="btnNext">Next</button>
        <label class="searchOpt"><input id="mdseSearchBody" type="checkbox" /> Body</label>
        <label class="searchOpt"><input id="mdseReveal" type="checkbox" checked /> Reveal</label>
        <span class="searchCount" id="mdseCount"></span>
      </div>

      <div class="taglist searchResults" aria-live="polite"></div>
      <div class="hint">Search results highlight in Structure view.</div>
    </div>

    <div class="tabPanel panelTags" role="tabpanel">
      <div class="muted">Tags are read from lines starting with <b>%% tag</b> or <b>\\%% tag</b> inside each section’s body.</div>
      <div class="tagbar">
        <button type="button" class="tagchip tagAll active">All tags</button>
        <span class="tagmeta tagMeta"></span>
      </div>
      <div class="tagbar tagCloud" aria-label="Tag list"></div>
      <div class="taglist tagResults" aria-live="polite"></div>
    </div>
  </div>

  <div class="right">
    <div class="badges">
      <span class="badge dim badgeSave">Unsaved…</span>
      <span class="badge warn badgeCopy">Not copied</span>
    </div>
  </div>
</div>

<div class="footer">v5.6 — Search tab + Tags tab + Bulk tag direct children</div>
`;

    const $ = (sel) => container.querySelector(sel);

    // Tabs
    const btnTabStructure = $(".tabStructure");
    const btnTabSearch = $(".tabSearch");
    const btnTabTags = $(".tabTags");

    const panelStructure = $(".panelStructure");
    const panelSearch = $(".panelSearch");
    const panelTags = $(".panelTags");

    // Structure UI
    const taInput = $(".mdInput");
    const canvas = $(".canvas");

    const badgeSave = $(".badgeSave");
    const badgeCopy = $(".badgeCopy");

    const btnLoad = $(".btnLoad");
    const btnUpdate = $(".btnUpdate");
    const btnCopy = $(".btnCopy");
    const btnReset = $(".btnReset");
    const btnAddTop = $(".btnAddTop");

    const selMax = $("#mdseMaxLevel");
    const btnLvl1 = $(".btnLvl1");
    const btnLvl2 = $(".btnLvl2");
    const btnLvl3 = $(".btnLvl3");
    const btnLvlAll = $(".btnLvlAll");

    // Search UI
    const inSearch = $("#mdseSearch");
    const btnPrev = $(".btnPrev");
    const btnNext = $(".btnNext");
    const cbBody = $("#mdseSearchBody");
    const cbReveal = $("#mdseReveal");
    const countEl = $("#mdseCount");
    const searchResults = $(".searchResults");

    // Tags UI
    const tagMeta = $(".tagMeta");
    const tagAllBtn = $(".tagAll");
    const tagCloud = $(".tagCloud");
    const tagResults = $(".tagResults");

    // ---- Persistence ----
    function setCopiedFlag(flag) {
      copiedSinceChange = !!flag;
      if (copiedSinceChange) lastCopyAt = new Date().toISOString();
      badgeCopy.className = "badge " + (copiedSinceChange ? "good" : "warn");
      badgeCopy.textContent = copiedSinceChange ? "Copied ✓" : "Not copied";
      badgeCopy.title =
        copiedSinceChange && lastCopyAt ? `Last copied: ${lastCopyAt}` : "";
    }

    function saveNow() {
      try {
        const state = {
          v: 6,
          nodes,
          input: taInput.value,
          sourceId,
          maxVisibleLevel,
          copiedSinceChange,
          lastCopyAt,
          searchQuery,
          searchInBody,
          revealMatches,
          activeTab,
          activeTag,
        };
        localStorage.setItem(KEY, JSON.stringify(state));
        badgeSave.className = "badge good badgeSave";
        badgeSave.textContent = "Saved ✓";
      } catch {
        badgeSave.className = "badge warn badgeSave";
        badgeSave.textContent = "Not saved";
      }
    }

    function saveDebounced() {
      badgeSave.className = "badge dim badgeSave";
      badgeSave.textContent = "Unsaved…";
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        saveTimer = null;
        saveNow();
      }, 500);
    }

    function loadPref() {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const s = safeJsonParse(raw);
      if (!s || typeof s !== "object") return;

      if (Array.isArray(s.nodes)) nodes = s.nodes;
      if (typeof s.input === "string") taInput.value = s.input;
      if (typeof s.sourceId === "string" || s.sourceId === null) sourceId = s.sourceId;
      if (typeof s.maxVisibleLevel === "number") maxVisibleLevel = clamp(s.maxVisibleLevel, 1, 6);

      copiedSinceChange = !!s.copiedSinceChange;
      lastCopyAt = typeof s.lastCopyAt === "string" ? s.lastCopyAt : null;

      if (typeof s.searchQuery === "string") searchQuery = s.searchQuery;
      if (typeof s.searchInBody === "boolean") searchInBody = s.searchInBody;
      if (typeof s.revealMatches === "boolean") revealMatches = s.revealMatches;

      if (typeof s.activeTab === "string") activeTab = ["structure","search","tags"].includes(s.activeTab) ? s.activeTab : "structure";
      if (typeof s.activeTag === "string") activeTag = normaliseTag(s.activeTag);

      nodes = nodes
        .filter((n) => n && typeof n === "object")
        .map((n) => {
          const body = typeof n.body === "string" ? n.body : "";
          return {
            id: typeof n.id === "string" ? n.id : uid(),
            level: clamp(parseInt(n.level, 10) || 1, 1, 6),
            title: typeof n.title === "string" ? n.title : "",
            body,
            isCollapsed: !!n.isCollapsed,
            showBody: !!n.showBody,
            tags: Array.isArray(n.tags) ? n.tags.map(normaliseTag).filter(Boolean) : extractTagsFromBody(body),
          };
        });
    }

    // ---- Markdown parse / export ----
    function parseMarkdown(text) {
      const lines = (text || "").split("\n");
      const out = [];
      let current = null;

      for (const line of lines) {
        const m = line.match(/^(#{1,6})\s+(.*)/);
        if (m) {
          current = {
            id: uid(),
            level: m[1].length,
            title: m[2] || "",
            body: "",
            isCollapsed: false,
            showBody: false,
            tags: [],
          };
          out.push(current);
        } else if (current) {
          current.body += line + "\n";
        }
      }

      out.forEach((n) => (n.tags = extractTagsFromBody(n.body)));
      return out;
    }

    function toMarkdown() {
      return nodes
        .map((n) => {
          const head = "#".repeat(n.level) + " " + (n.title || "");
          const body = (n.body || "").trimEnd();
          return body ? head + "\n" + body : head;
        })
        .join("\n\n");
    }

    // ---- Clipboard paste as sibling ----
async function readClipboardTextFallback() {
  try {
    return await navigator.clipboard.readText();
  } catch {
    // iPad Safari can be picky; fallback lets you paste manually.
    return prompt("Clipboard read blocked. Paste the markdown here:","") || "";
  }
}

function normalizeClipboardToLevel(clip, targetLevel) {
  const text = (clip || "").replace(/\r\n?/g, "\n").trim();
  if (!text) return "";

  const lines = text.split("\n");

  // Find first markdown heading
  let firstHeadingLine = null;
  for (const ln of lines) {
    const m = ln.match(/^(#{1,6})\s+(.+)/);
    if (m) { firstHeadingLine = ln; break; }
  }

  // If no heading, make one from first non-empty line
  if (!firstHeadingLine) {
    const firstNonEmpty = lines.find((l) => l.trim().length) || "New node";
    const rest = lines.slice(lines.indexOf(firstNonEmpty) + 1);
    return (`${"#".repeat(targetLevel)} ${firstNonEmpty.trim()}\n` + rest.join("\n")).trimEnd();
  }

  const m0 = firstHeadingLine.match(/^(#{1,6})\s+/);
  const clipLevel = m0 ? m0[1].length : 2;
  const delta = targetLevel - clipLevel;

  const adjusted = lines.map((ln) => {
    const m = ln.match(/^(#{1,6})(\s+.*)$/);
    if (!m) return ln;
    let lvl = m[1].length + delta;
    lvl = Math.max(1, Math.min(6, lvl));
    return "#".repeat(lvl) + m[2];
  });

  return adjusted.join("\n").trimEnd();
}

async function pasteClipboardAsSiblingAfter(nodeId) {
  const idx = indexById(nodeId);
  if (idx < 0) return;

  const clip = await readClipboardTextFallback();
  if (!clip.trim()) return;

  const targetLevel = nodes[idx].level;
  const adjusted = normalizeClipboardToLevel(clip, targetLevel);
  if (!adjusted.trim()) return;

  const newNodes = parseMarkdown(adjusted);
  if (!newNodes.length) return;

  // Insert AFTER this node’s whole branch
  const fam = familyIndices(idx);
  const insertAt = fam[fam.length - 1] + 1;

  nodes.splice(insertAt, 0, ...newNodes);

  lastCreatedId = newNodes[0].id; // focus it after render
  markChangedFull();
}

    // ---- Matches ----
    function updateCount() {
      if (!searchQuery.trim()) {
        countEl.textContent = "";
        return;
      }
      if (!matchIds.length) {
        countEl.textContent = "0 matches";
        return;
      }
      const cur = matchPos >= 0 ? matchPos + 1 : 0;
      countEl.textContent = cur ? `${cur}/${matchIds.length}` : `${matchIds.length} matches`;
    }

    function computeRevealSet() {
      const reveal = new Set();
      if (!revealMatches || !searchQuery.trim() || !matchIds.length) return reveal;

      for (let i = 0; i < nodes.length; i++) {
        if (!nodeMatches(nodes[i], searchQuery)) continue;
        reveal.add(nodes[i].id);

        let childLevel = nodes[i].level;
        for (let j = i - 1; j >= 0; j--) {
          if (nodes[j].level < childLevel) {
            reveal.add(nodes[j].id);
            childLevel = nodes[j].level;
          }
          if (childLevel === 1) break;
        }
      }
      return reveal;
    }

    function rebuildMatchesNoRender() {
      matchIds = [];
      matchPos = -1;

      if (searchQuery.trim()) {
        for (const n of nodes) {
          if (nodeMatches(n, searchQuery)) matchIds.push(n.id);
        }
      }
      updateCount();
    }

    function rebuildMatchesDebounced() {
      if (matchTimer) clearTimeout(matchTimer);
      matchTimer = setTimeout(() => {
        matchTimer = null;
        rebuildMatchesNoRender();
      }, 150);
    }

    function rebuildMatches() {
      rebuildMatchesNoRender();
      scheduleRenderStructure();
      if (activeTab === "search") scheduleRenderSearchResults();
    }

    function jumpMatch(delta) {
      if (!matchIds.length) return;
      matchPos = (matchPos + delta + matchIds.length) % matchIds.length;
      updateCount();
      scheduleRenderStructure();

      const id = matchIds[matchPos];
      const el = canvas.querySelector(`[data-node-id="${id}"]`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        const t = el.querySelector(".title");
        if (t) t.focus();
      }
    }

    // ---- Tags view ----
    function allTags() {
      const set = new Set();
      nodes.forEach((n) => (n.tags || []).forEach((t) => set.add(t)));
      return [...set].sort((a, b) => a.localeCompare(b));
    }

    function tagsCountMap() {
      const m = new Map();
      nodes.forEach((n) => (n.tags || []).forEach((t) => m.set(t, (m.get(t) || 0) + 1)));
      return m;
    }

    function renderTagCloud(tags, counts) {
      tagCloud.innerHTML = "";
      if (!tags.length) {
        tagCloud.innerHTML = `<span class="tagmeta">No tags found yet. Add lines like <b>%% tag arc:escape</b> inside a section’s body.</span>`;
        return;
      }

      tags.forEach((t) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "tagchip" + (activeTag === t ? " active" : "");
        btn.textContent = `${t} (${counts.get(t) || 0})`;
        btn.addEventListener("click", () => {
          activeTag = activeTag === t ? "" : t;
          rebuildTagUI();
          saveDebounced();
        });
        tagCloud.appendChild(btn);
      });
    }

function makeRafScheduler(renderFn) {
  let queued = false;
  return function () {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      renderFn();
    });
  };
}
    
// PATCH: add directly under
// const scheduleRenderTagCloud = makeRafScheduler(renderTagCloud);
    
let scheduleRenderTagCloud = function(){};
scheduleRenderTagCloud = makeRafScheduler(renderTagCloud);


    function renderTagResults() {
      tagResults.innerHTML = "";

      if (!activeTag) {
        tagMeta.textContent = `Choose a tag to see matching sections (in manuscript order).`;
        return;
      }

      const matches = nodes.filter((n) => (n.tags || []).includes(activeTag));
      tagMeta.textContent = `${activeTag}: ${matches.length} section${matches.length === 1 ? "" : "s"}`;

      if (!matches.length) return;

      matches.forEach((n) => {
        const card = document.createElement("div");
        card.className = "tagcard";
        card.title = "Tap to jump to this section in Structure view";
        card.addEventListener("click", () => jumpToNode(n.id));

        const top = document.createElement("div");
        top.className = "toph";

        const lvl = document.createElement("span");
        lvl.className = "lvl";
        lvl.textContent = `H${n.level}`;

        const title = document.createElement("span");
        title.className = "titleline";
        title.textContent = n.title || "(untitled)";

        top.append(lvl, title);

        const cleaned = bodyWithoutTagLines(n.body);
        const preview = firstSentence(cleaned);

        const p = document.createElement("div");
        p.className = "preview";
        p.textContent = preview ? preview : "(No body text yet.)";

        const subtags = document.createElement("div");
        subtags.className = "subtags";
        (n.tags || []).slice(0, 12).forEach((t) => {
          const pill = document.createElement("span");
          pill.className = "tagpill";
          pill.textContent = t;
          subtags.appendChild(pill);
        });

        card.append(top, p, subtags);
        tagResults.appendChild(card);
      });
    }

    
// PATCH: add directly under
// const scheduleRenderTagResults = makeRafScheduler(renderTagResults);

let scheduleRenderTagResults = function(){};
scheduleRenderTagResults = makeRafScheduler(renderTagResults);


    function rebuildTagUI() {
      tagAllBtn.classList.toggle("active", !activeTag);
      const tags = allTags();
      const counts = tagsCountMap();
      renderTagCloud(tags, counts);
      scheduleRenderTagResults();
    }

    function rebuildTagUIDebounced() {
      if (tagTimer) clearTimeout(tagTimer);
      tagTimer = setTimeout(() => {
        tagTimer = null;
        if (activeTab === "tags") rebuildTagUI();
      }, 150);
    }

    // ---- Search results tab ----
    function renderSearchResults() {
      searchResults.innerHTML = "";

      if (!searchQuery.trim()) {
        searchResults.innerHTML = `<div class="tagmeta">Type to search your outline.</div>`;
        return;
      }

      if (!matchIds.length) {
        searchResults.innerHTML = `<div class="tagmeta">No matches found.</div>`;
        return;
      }

      const matchSet = new Set(matchIds);
      const matches = nodes.filter((n) => matchSet.has(n.id));

      matches.forEach((n) => {
        const card = document.createElement("div");
        card.className = "tagcard";
        card.title = "Jump to this section in Structure view";
        card.addEventListener("click", () => jumpToNode(n.id));

        const top = document.createElement("div");
        top.className = "toph";

        const lvl = document.createElement("span");
        lvl.className = "lvl";
        lvl.textContent = `H${n.level}`;

        const title = document.createElement("span");
        title.className = "titleline";
        title.textContent = n.title || "(untitled)";

        top.append(lvl, title);

        const cleaned = bodyWithoutTagLines(n.body);
        const preview = firstSentence(cleaned);

        const p = document.createElement("div");
        p.className = "preview";
        p.textContent = preview || "(No body text.)";

        card.append(top, p);
        searchResults.appendChild(card);
      });
    }
    
// PATCH: add directly under
// const scheduleRenderSearchResults = makeRafScheduler(renderSearchResults);

let scheduleRenderSearchResults = function(){};
scheduleRenderSearchResults = makeRafScheduler(renderSearchResults);


    function jumpToNode(id) {
      setTab("structure");

      const idx = indexById(id);
      if (idx >= 0 && nodes[idx].level > maxVisibleLevel) {
        maxVisibleLevel = 6;
        selMax.value = "6";
      }

      scheduleRenderStructure();

      const el = canvas.querySelector(`[data-node-id="${id}"]`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        const t = el.querySelector(".title");
        if (t) t.focus();
      }
    }

    // ---- Actions ----
    function markChangedFull() {
      setCopiedFlag(false);
      rebuildMatches();   // renders structure + counts
      rebuildTagUI();
      saveDebounced();
    }

    function markChangedTyping() {
      setCopiedFlag(false);
      if (searchQuery.trim()) rebuildMatchesDebounced();
      rebuildTagUIDebounced();
      saveDebounced();
    }

    function toggleBranchCollapse(id) {
      const idx = indexById(id);
      if (idx < 0) return;
      nodes[idx].isCollapsed = !nodes[idx].isCollapsed;
      markChangedFull();
    }

    function toggleBody(id) {
      const idx = indexById(id);
      if (idx < 0) return;
      nodes[idx].showBody = !nodes[idx].showBody;
      markChangedFull();
    }

    function changeLevel(id, delta) {
      const idx = indexById(id);
      if (idx < 0) return;
      const fam = familyIndices(idx);
      fam.forEach((i) => (nodes[i].level = clamp(nodes[i].level + delta, 1, 6)));
      markChangedFull();
    }

    function addNewAfter(idOrNull) {
      if (!nodes.length || !idOrNull) {
        const newNode = { id: uid(), level: 1, title: "", body: "", isCollapsed: false, showBody: false, tags: [] };
        nodes.push(newNode);
        lastCreatedId = newNode.id;
        markChangedFull();
        return;
      }
      const idx = indexById(idOrNull);
      if (idx < 0) return;
      const fam = familyIndices(idx);
      const insertAt = fam[fam.length - 1] + 1;
      const newNode = { id: uid(), level: nodes[idx].level, title: "", body: "", isCollapsed: false, showBody: false, tags: [] };
      nodes.splice(insertAt, 0, newNode);
      lastCreatedId = newNode.id;
      markChangedFull();
    }

    function duplicateBranch(id) {
      const idx = indexById(id);
      if (idx < 0) return;
      const fam = familyIndices(idx);
      const block = fam.map((i) => nodes[i]);

      const clones = block.map((n) => ({
        id: uid(),
        level: n.level,
        title: n.title,
        body: n.body,
        isCollapsed: n.isCollapsed,
        showBody: n.showBody,
        tags: Array.isArray(n.tags) ? [...n.tags] : extractTagsFromBody(n.body),
      }));

      const insertAt = fam[fam.length - 1] + 1;
      nodes.splice(insertAt, 0, ...clones);
      lastCreatedId = clones[0].id;
      markChangedFull();
    }

    function deleteBranch(id) {
      const idx = indexById(id);
      if (idx < 0) return;
      if (!confirm("Delete this heading and its children?")) return;
      const fam = familyIndices(idx);
      nodes.splice(idx, fam.length);
      if (sourceId && !nodes.some((n) => n.id === sourceId)) sourceId = null;
      markChangedFull();
    }

    function toggleMove(id) {
      if (!sourceId) {
        sourceId = id;
        scheduleRenderStructure();
        return;
      }

      if (sourceId === id) {
        sourceId = null;
        scheduleRenderStructure();
        return;
      }

      const movingIds = new Set(familyIds(sourceId));
      if (movingIds.has(id)) {
        sourceId = null;
        scheduleRenderStructure();
        return;
      }

      const movingNodes = nodes.filter((n) => movingIds.has(n.id));
      nodes = nodes.filter((n) => !movingIds.has(n.id));

      const targetIdx = indexById(id);
      if (targetIdx < 0) {
        nodes.push(...movingNodes);
        sourceId = null;
        markChangedFull();
        return;
      }

      const targetFam = familyIndices(targetIdx);
      const insertAt = targetFam[targetFam.length - 1] + 1;
      nodes.splice(insertAt, 0, ...movingNodes);

      sourceId = null;
      markChangedFull();
    }

    function setMaxLevel(level) {
      maxVisibleLevel = clamp(level, 1, 6);
      selMax.value = String(maxVisibleLevel);
      markChangedFull();
    }

    // ---- Tabs ----
    function setTab(tab) {
      activeTab = ["structure","search","tags"].includes(tab) ? tab : "structure";

      btnTabStructure.classList.toggle("active", activeTab === "structure");
      btnTabSearch.classList.toggle("active", activeTab === "search");
      btnTabTags.classList.toggle("active", activeTab === "tags");

      btnTabStructure.setAttribute("aria-selected", activeTab === "structure" ? "true" : "false");
      btnTabSearch.setAttribute("aria-selected", activeTab === "search" ? "true" : "false");
      btnTabTags.setAttribute("aria-selected", activeTab === "tags" ? "true" : "false");

      panelStructure.classList.toggle("active", activeTab === "structure");
      panelSearch.classList.toggle("active", activeTab === "search");
      panelTags.classList.toggle("active", activeTab === "tags");

      if (activeTab === "tags") rebuildTagUI();
      if (activeTab === "search") scheduleRenderSearchResults();

      saveDebounced();
    }

    // ---- Render (Structure tab) ----
    function renderStructure() {
      const scrollPos = window.scrollY;

      selMax.value = String(maxVisibleLevel);

      canvas.innerHTML = "";

      const hiddenByCollapse = new Set();
      nodes.forEach((n, idx) => {
        if (n.isCollapsed) familyIndices(idx).slice(1).forEach((i) => hiddenByCollapse.add(i));
      });

      const movingSet = sourceId ? new Set(familyIds(sourceId)) : new Set();
      const revealSet = computeRevealSet();
      const matchSet = new Set(matchIds);

      nodes.forEach((n, idx) => {
        if (n.level > maxVisibleLevel) return;
        if (hiddenByCollapse.has(idx) && !revealSet.has(n.id)) return;

        const isSource = sourceId === n.id;
        const isValidTarget = !!sourceId && !movingSet.has(n.id);
        const isMatch = searchQuery.trim() && matchSet.has(n.id);
        const isActive = isMatch && matchPos >= 0 && matchIds[matchPos] === n.id;

        const node = document.createElement("div");
        node.setAttribute("data-node-id", n.id);
        node.className =
          `node level-${n.level}` +
          (activeNodeId === n.id ? " activeNode" : "") +
          (isSource ? " movingSource" : "") +
          (isValidTarget ? " moveTarget" : "") +
          (n.isCollapsed ? " collapsed" : "") +
          (isMatch ? " match" : "") +
          (isActive ? " activeMatch" : "");

        node.addEventListener("click", (e) => {
  // If this node is a valid move target, clicking it should MOVE, not select.
  if (isValidTarget) {
    toggleMove(n.id);
    return;
  }

  // Otherwise, toggle "active" state to show/hide controls.
  activeNodeId = (activeNodeId === n.id) ? "" : n.id;
  scheduleRenderStructure();
});

        const hdr = document.createElement("div");
        hdr.className = "hdr";

        const pin = document.createElement("div");
        pin.className = "pill gray";
        pin.textContent = isSource ? "📍 PIN" : "⠿";
        pin.title = "Pin branch to move";
        pin.addEventListener("click", (e) => {
          e.stopPropagation();
          toggleMove(n.id);
        });

        const col = document.createElement("div");
        col.className = "pill gray";
        col.textContent = hasChildren(idx) ? (n.isCollapsed ? "▶" : "▼") : "•";
        col.title = hasChildren(idx) ? "Fold/unfold branch" : "No children";
        col.addEventListener("click", (e) => {
          e.stopPropagation();
          if (hasChildren(idx)) toggleBranchCollapse(n.id);
        });

        const lvl = document.createElement("div");
        lvl.className = "pill";
        lvl.textContent = `H${n.level}`;

        // --- TITLE: single-line ---
        const title = document.createElement("textarea");
        title.className = "title";
        title.rows = 1;
        title.value = (n.title || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/\n/g, " ");
        title.addEventListener("click", (e) => e.stopPropagation());
        title.addEventListener("keydown", (e) => {
          e.stopPropagation();
          if (e.key === "Enter") e.preventDefault();
        });
        title.addEventListener("input", () => {
          n.title = title.value.replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/\n/g, " ");
          if (title.value !== n.title) title.value = n.title;
          autoResizeTA(title);
          markChangedTyping();
        });

        const tools = document.createElement("div");
        tools.className = "tools";
        tools.addEventListener("click", (e) => e.stopPropagation());

        const hasBody = !!(n.body && n.body.trim());
        const bodyBtn = document.createElement("button");
        bodyBtn.type = "button";
        bodyBtn.textContent = n.showBody ? "📝 Hide text" : (hasBody ? "📝 Show text" : "➕ Add text");
        bodyBtn.className = hasBody ? "primary" : "";
        bodyBtn.addEventListener("click", () => toggleBody(n.id));

        const dup = document.createElement("button");
        dup.type = "button";
        dup.textContent = "⧉ Duplicate";
        dup.addEventListener("click", () => duplicateBranch(n.id));

        const add = document.createElement("button");
        add.type = "button";
        add.textContent = "+ Add";
        add.addEventListener("click", () => addNewAfter(n.id));

        const paste = document.createElement("button");
paste.type = "button";
paste.textContent = "📋 Paste";
paste.title = "Paste clipboard markdown as a sibling node after this branch (levels adjusted)";
// paste.addEventListener("click", () => pasteClipboardAsSiblingAfter(n.id));
        paste.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  pasteClipboardAsSiblingAfter(n.id);
});

        const left = document.createElement("button");
        left.type = "button";
        left.textContent = "←";
        left.title = "Promote (H-1) for this branch";
        left.addEventListener("click", () => changeLevel(n.id, -1));

        const right = document.createElement("button");
        right.type = "button";
        right.textContent = "→";
        right.title = "Demote (H+1) for this branch";
        right.addEventListener("click", () => changeLevel(n.id, +1));

        const tagKids = document.createElement("button");
        tagKids.type = "button";
        tagKids.textContent = `🏷 Tag H${n.level + 1}`;
        tagKids.title = `Add a %% tag line to every direct H${n.level + 1} under this heading`;
        tagKids.addEventListener("click", () => {
          const payload = prompt(
            `Add which tag to all H${n.level + 1} under "${n.title || "Untitled"}"?\n\nExample: arc holiday`,
            "arc holiday"
          );
          if (!payload) return;
          bulkTagDirectChildren(n.id, payload, "add");
        });

        const untagKids = document.createElement("button");
        untagKids.type = "button";
        untagKids.textContent = `🧽 Untag H${n.level + 1}`;
        untagKids.title = `Remove that exact %% tag line from every direct H${n.level + 1} under this heading`;
        untagKids.addEventListener("click", () => {
          const payload = prompt(
            `Remove which tag from all H${n.level + 1} under "${n.title || "Untitled"}"?\n\nExample: arc holiday`,
            "arc holiday"
          );
          if (!payload) return;
          bulkTagDirectChildren(n.id, payload, "remove");
        });

        const del = document.createElement("button");
        del.type = "button";
        del.textContent = "✕";
        del.className = "warn";
        del.title = "Delete branch";
        del.addEventListener("click", () => deleteBranch(n.id));

        if (n.level < 6) tools.append(bodyBtn, dup, add, paste, left, right, tagKids, untagKids, del);
        else tools.append(bodyBtn, dup, add, paste, left, right, del);

        // hdr.append(pin, col, lvl, title, tools);
        // hdr.append(pin, col, lvl, tools, title);
        hdr.append(pin, col, lvl, title);
        node.appendChild(hdr);

        // Body area: show if toggled, OR reveal+body-match-only while searching
        const bodyShouldShow =
          n.showBody ||
          (revealMatches && searchQuery.trim() && nodeMatchesBodyOnly(n, searchQuery));

        const bodyWrap = document.createElement("div");
        bodyWrap.className = "body" + (bodyShouldShow ? " show" : "");

        const bodyTA = document.createElement("textarea");
        bodyTA.rows = 6;
        bodyTA.wrap = "soft";
        bodyTA.value = (n.body || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").trimEnd();

        const stop = (e) => e.stopPropagation();
        bodyTA.addEventListener("keydown", stop);
        bodyTA.addEventListener("keypress", stop);
        bodyTA.addEventListener("keyup", stop);

        bodyTA.addEventListener("input", () => {
          n.body = bodyTA.value;
          n.tags = extractTagsFromBody(n.body);
          markChangedTyping();
        });

        bodyTA.addEventListener("click", (e) => e.stopPropagation());
        
        // bodyWrap.appendChild(bodyTA);
        // node.appendChild(bodyWrap);

        // canvas.appendChild(node);

bodyWrap.appendChild(bodyTA);
node.appendChild(bodyWrap);

// NEW: controls under title + body
node.appendChild(tools);

canvas.appendChild(node);
        
        autoResizeTA(title);
      });

      window.scrollTo(0, scrollPos);

      if (lastCreatedId) {
        const el = canvas.querySelector(`[data-node-id="${lastCreatedId}"]`);
        if (el) {
          const t = el.querySelector(".title");
          if (t) t.focus();
        }
        lastCreatedId = null;
      }
    }
   
// PATCH: add directly under
// const scheduleRenderStructure = makeRafScheduler(renderStructure);
    
let scheduleRenderStructure = function(){};
scheduleRenderStructure = makeRafScheduler(renderStructure);


    // ---- Buttons / events ----
    btnTabStructure.addEventListener("click", () => setTab("structure"));
    btnTabSearch.addEventListener("click", () => setTab("search"));
    btnTabTags.addEventListener("click", () => setTab("tags"));

    tagAllBtn.addEventListener("click", () => {
      activeTag = "";
      rebuildTagUI();
      saveDebounced();
    });

    btnLoad.addEventListener("click", () => {
      const text = taInput.value || "";
      if (!text.trim()) return;
      nodes = parseMarkdown(text);
      sourceId = null;
      markChangedFull();
    });

    btnUpdate.addEventListener("click", () => {
      taInput.value = toMarkdown();
      markChangedFull();
    });

    btnCopy.addEventListener("click", async () => {
      const md = toMarkdown();
      taInput.value = md;
      const ok = await copyText(md);
      if (ok) setCopiedFlag(true);
      else alert("Copy failed.");
      saveDebounced();
    });

    btnReset.addEventListener("click", () => {
      if (!confirm("Reset everything (including saved state for this app instance)?")) return;
      nodes = [];
      sourceId = null;
      taInput.value = "";
      maxVisibleLevel = 6;

      searchQuery = "";
      matchIds = [];
      matchPos = -1;

      activeTag = "";

      setCopiedFlag(false);
      try { localStorage.removeItem(KEY); } catch {}
      saveDebounced();
      scheduleRenderStructure();
      rebuildTagUI();
      rebuildMatchesNoRender();
      scheduleRenderSearchResults();
    });

    btnAddTop.addEventListener("click", () => addNewAfter(null));

    selMax.addEventListener("change", () => setMaxLevel(parseInt(selMax.value, 10)));
    btnLvl1.addEventListener("click", () => setMaxLevel(1));
    btnLvl2.addEventListener("click", () => setMaxLevel(2));
    btnLvl3.addEventListener("click", () => setMaxLevel(3));
    btnLvlAll.addEventListener("click", () => setMaxLevel(6));

    inSearch.addEventListener("input", () => {
      searchQuery = inSearch.value || "";
      rebuildMatches();
      if (activeTab === "search") scheduleRenderSearchResults();
      saveDebounced();
    });

    cbBody.addEventListener("change", () => {
      searchInBody = !!cbBody.checked;
      rebuildMatches();
      if (activeTab === "search") scheduleRenderSearchResults();
      saveDebounced();
    });

    cbReveal.addEventListener("change", () => {
      revealMatches = !!cbReveal.checked;
      scheduleRenderStructure();
      saveDebounced();
    });

    btnPrev.addEventListener("click", () => jumpMatch(-1));
    btnNext.addEventListener("click", () => jumpMatch(+1));

    inSearch.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (e.shiftKey) jumpMatch(-1);
        else jumpMatch(+1);
      }
      if (e.key === "Escape") {
        e.preventDefault();
        searchQuery = "";
        matchIds = [];
        matchPos = -1;
        inSearch.value = "";
        updateCount();
        scheduleRenderStructure();
        scheduleRenderSearchResults();
        saveDebounced();
      }
    });

    taInput.addEventListener("input", () => {
      // you changed the input text; it doesn't change nodes until Load
      setCopiedFlag(false);
      saveDebounced();
    });

    canvas.addEventListener("click", (e) => {
  // If the click wasn't on a node, clear selection
  const nodeEl = e.target.closest && e.target.closest(".node");
  if (!nodeEl) {
    activeNodeId = "";
    scheduleRenderStructure();
  }
});
    
    // ---- Init ----
    loadPref();
    setCopiedFlag(copiedSinceChange);

    selMax.value = String(maxVisibleLevel);
    inSearch.value = searchQuery;
    cbBody.checked = searchInBody;
    cbReveal.checked = revealMatches;

    badgeSave.className = "badge good badgeSave";
    badgeSave.textContent = "Saved ✓";

    // initial renders
    rebuildMatches();
    rebuildTagUI();
    setTab(activeTab || "structure");
    saveDebounced();
  });
})();
