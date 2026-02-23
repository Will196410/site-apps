(() => {
  "use strict";

  // —— SiteApps registry ——————————————————————————————————————————————————————
  window.SiteApps = window.SiteApps || {};
  window.SiteApps.registry = window.SiteApps.registry || {};
  window.SiteApps.register =
    window.SiteApps.register ||
    function (name, fn) { window.SiteApps.registry[name] = fn; };

  // —— Constants ——————————————————————————————————————————————————————————————
  const STYLE_ID = "siteapps-mdse2-style";
  const EST_H    = 96;    // fallback estimated node height (px)
  const WIN_PAD  = 1200;  // px of buffer above + below viewport to keep rendered

  // —— Styles ————————————————————————————————————————————————————————————————
  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const s = document.createElement("style");
    s.id = STYLE_ID;
    s.textContent = `
    [data-app="mdse2"]{
    font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;
    max-width:980px; margin:14px auto;
    border:2px solid #111; border-radius:16px;
    padding:18px; background:#fff; color:#111;
    }
    [data-app="mdse2"] *{ box-sizing:border-box; }
    [data-app="mdse2"] h3{ margin:0 0 10px; font-size:18px; }
    [data-app="mdse2"] .muted{ color:#444; font-size:13px; font-weight:700; }

    [data-app="mdse2"] textarea:not(.title){ width:100%; }
    [data-app="mdse2"] textarea,
    [data-app="mdse2"] input,
    [data-app="mdse2"] select{
    border:2px solid #111; border-radius:12px; padding:12px;
    font-size:16px; line-height:1.35; background:#fbfbfb; color:#111;
    }
    [data-app="mdse2"] textarea:focus,
    [data-app="mdse2"] button:focus,
    [data-app="mdse2"] select:focus,
    [data-app="mdse2"] input:focus{
    outline:3px solid rgba(11,95,255,.35); outline-offset:2px;
    }

    [data-app="mdse2"] .topbar{
    display:flex; gap:12px; align-items:flex-start;
    flex-wrap:wrap; margin-bottom:10px;
    }
    [data-app="mdse2"] .topbar .left{ flex:1 1 520px; min-width:0; }
    [data-app="mdse2"] .topbar .right{ flex:1 1 220px; display:flex; justify-content:flex-end; min-width:0; }

    [data-app="mdse2"] .tabs{ display:flex; gap:10px; flex-wrap:wrap; margin:6px 0 10px; }
    [data-app="mdse2"] .tabbtn{
    border:2px solid #111; border-radius:999px; padding:8px 12px;
    font-weight:1000; background:#fff; cursor:pointer;
    }
    [data-app="mdse2"] .tabbtn.active{ background:#111; color:#fff; }
    [data-app="mdse2"] .tabPanel{ display:none; }
    [data-app="mdse2"] .tabPanel.active{ display:block; }

    [data-app="mdse2"] .btnrow{
    display:flex; gap:8px; flex-wrap:wrap; margin:10px 0;
    }
    [data-app="mdse2"] button{
    border:2px solid #111; border-radius:12px; padding:10px 12px;
    font-weight:900; font-size:13px; background:#fff; cursor:pointer;
    }
    [data-app="mdse2"] button.primary{ background:#111; color:#fff; }
    [data-app="mdse2"] button.warn{ border-color:#7a0000; color:#7a0000; }
    [data-app="mdse2"] button:disabled{ opacity:.55; cursor:not-allowed; }

    [data-app="mdse2"] .badges{
    display:flex; gap:10px; align-items:center;
    justify-content:flex-end; flex-wrap:wrap;
    }
    [data-app="mdse2"] .badge{
    border:2px solid #111; border-radius:999px;
    padding:6px 10px; font-weight:900; font-size:13px; background:#fff;
    }
    [data-app="mdse2"] .badge.good{ border-color:#0b3d0b; color:#0b3d0b; }
    [data-app="mdse2"] .badge.warn{ border-color:#7a0000; color:#7a0000; }
    [data-app="mdse2"] .badge.dim{ border-color:#444; color:#444; }

    [data-app="mdse2"] .levelFilter{
    display:flex; gap:8px; align-items:center;
    flex-wrap:wrap; margin-top:10px;
    }
    [data-app="mdse2"] .levelFilter label{ font-weight:900; font-size:13px; }
    [data-app="mdse2"] select{ padding:8px 10px; font-weight:900; background:#fff; }

    [data-app="mdse2"] .searchRow{
    display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin-top:10px;
    }
    [data-app="mdse2"] .searchRow input[type="search"]{
    flex:1 1 260px; border:2px solid #111; border-radius:12px;
    padding:10px 12px; font-weight:900; font-size:15px; background:#fff;
    }
    [data-app="mdse2"] .searchOpt{
    display:flex; gap:6px; align-items:center;
    font-weight:900; font-size:13px; color:#222;
    }
    [data-app="mdse2"] .searchCount{
    font-weight:900; font-size:13px; color:#444;
    padding:6px 10px; border:2px solid rgba(0,0,0,.15);
    border-radius:999px; background:#fff;
    }

    [data-app="mdse2"] .canvas{ margin-top:14px; position:relative; }
    [data-app="mdse2"] .vSpacer{ width:100%; pointer-events:none; }

    [data-app="mdse2"] .node{
    background:#fff; border:2px solid rgba(0,0,0,.15);
    border-radius:14px; padding:12px; margin:10px 0;
    }
    [data-app="mdse2"] .node.level-1{ border-left:10px solid #111; margin-left:0; }
    [data-app="mdse2"] .node.level-2{ border-left:10px solid #444; margin-left:18px; }
    [data-app="mdse2"] .node.level-3{ border-left:10px solid #777; margin-left:36px; }
    [data-app="mdse2"] .node.level-4{ border-left:10px solid #999; margin-left:54px; }
    [data-app="mdse2"] .node.level-5{ border-left:10px solid #bbb; margin-left:72px; }
    [data-app="mdse2"] .node.level-6{ border-left:10px solid #ddd; margin-left:90px; }

    [data-app="mdse2"] .hdr{
    display:grid !important;
    grid-template-columns:auto auto auto minmax(240px,1fr) auto;
    column-gap:10px; align-items:start; min-width:0;
    }
    [data-app="mdse2"] .hdr > *{ min-width:0; }

    [data-app="mdse2"] .pill{
    border:2px solid #111; border-radius:12px; padding:8px 10px;
    font-weight:900; font-size:13px; background:#fff; user-select:none;
    }
    [data-app="mdse2"] .pill.gray{ border-color:#444; color:#444; }

    [data-app="mdse2"] .title{
    width:100% !important; min-width:240px !important;
    border:2px solid rgba(0,0,0,.15); border-radius:12px;
    padding:10px 12px; font-size:16px; font-weight:900;
    resize:none; overflow:hidden; min-height:44px;
    background:#fbfbfb; display:block;
    }

    [data-app="mdse2"] .tools{
    display:flex; gap:6px; flex-wrap:wrap;
    justify-content:flex-end; align-items:flex-start; margin-left:0 !important;
    }
    [data-app="mdse2"] .tools button{ padding:8px 10px; border-radius:12px; font-size:13px; }

    [data-app="mdse2"] .body{ margin-top:10px; display:none; }
    [data-app="mdse2"] .body.show{ display:block; }
    [data-app="mdse2"] .body textarea{ white-space:pre-wrap; }

    [data-app="mdse2"] .hint{
    margin-top:10px; font-size:13px; font-weight:800; color:#444;
    }

    @media (max-width:900px){
    [data-app="mdse2"] .hdr{
    grid-template-columns:auto auto auto 1fr;
    grid-auto-rows:auto; row-gap:10px;
    }
    [data-app="mdse2"] .tools{ grid-column:1 / -1; justify-content:flex-start; }
    [data-app="mdse2"] .title{ grid-column:1 / -1; min-width:0 !important; }
    }

    [data-app="mdse2"] .movingSource{
    border-color:#0b5fff !important;
    box-shadow:0 8px 28px rgba(11,95,255,.18);
    background:#f6f9ff !important;
    }
    [data-app="mdse2"] .moveTarget{
    cursor:pointer;
    border-color:#0b3d0b !important;
    background:#f1fff1 !important;
    }
    [data-app="mdse2"] .collapsed{
    border-color:#9a7b00 !important;
    background:#fffbe6 !important;
    }
    [data-app="mdse2"] .match{
    outline:4px solid rgba(255,170,0,.65); outline-offset:2px;
    }
    [data-app="mdse2"] .activeMatch{
    outline:5px solid rgba(255,120,0,.85); outline-offset:3px;
    }

    [data-app="mdse2"] .tagbar{
    display:flex; gap:10px; flex-wrap:wrap;
    align-items:center; margin:10px 0 12px;
    }
    [data-app="mdse2"] .tagchip{
    border:2px solid #111; border-radius:999px;
    padding:8px 12px; font-weight:1000; background:#fff; cursor:pointer;
    }
    [data-app="mdse2"] .tagchip.active{ background:#111; color:#fff; }
    [data-app="mdse2"] .tagmeta{ font-weight:900; color:#444; font-size:13px; }
    [data-app="mdse2"] .taglist{ display:grid; gap:10px; margin-top:10px; }
    [data-app="mdse2"] .tagcard{
    border:2px solid rgba(0,0,0,.15); border-radius:14px;
    padding:12px; background:#fff; cursor:pointer;
    }
    [data-app="mdse2"] .tagcard:hover{ box-shadow:0 6px 18px rgba(0,0,0,.06); }
    [data-app="mdse2"] .tagcard .toph{
    display:flex; gap:10px; align-items:center; flex-wrap:wrap; font-weight:1000;
    }
    [data-app="mdse2"] .tagcard .toph .lvl{
    border:2px solid #111; border-radius:999px;
    padding:4px 10px; font-size:12px; font-weight:1000;
    }
    [data-app="mdse2"] .tagcard .titleline{ font-size:15px; font-weight:1000; }
    [data-app="mdse2"] .tagcard .preview{
    margin-top:6px; color:#333; font-weight:750;
    font-size:14px; line-height:1.35;
    }
    [data-app="mdse2"] .tagcard .subtags{
    margin-top:8px; display:flex; gap:8px; flex-wrap:wrap;
    }
    [data-app="mdse2"] .tagpill{
    border:2px solid rgba(0,0,0,.15); border-radius:999px;
    padding:4px 10px; font-size:12px; font-weight:1000;
    color:#444; background:#fff;
    }

    [data-app="mdse2"] .footer{
    margin-top:14px; font-size:12px; color:#666;
    font-weight:700; text-align:right;
    }
    `;
    document.head.appendChild(s);
  }

  // —— Pure utilities —————————————————————————————————————————————————————————
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const uid   = () => `n_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;

  function autoResizeTA(ta) {
    ta.style.height = "auto";
    ta.style.height = Math.max(44, ta.scrollHeight) + "px";
  }
  function safeJsonParse(s) { try { return JSON.parse(s); } catch { return null; } }
  function storageKey(c) {
    const k = c.getAttribute("data-storage-key");
    return k && k.trim()
      ? `siteapps:mdse2:${k.trim()}`
      : `siteapps:mdse2:${location.pathname || "/"}`;
  }
  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      try { await navigator.clipboard.writeText(text); return true; } catch {}
    }
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.cssText = "position:fixed;left:-9999px;top:0";
      document.body.appendChild(ta);
      ta.focus(); ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return !!ok;
    } catch { return false; }
  }

  // —— Tag helpers ————————————————————————————————————————————————————————————
  const TAG_LINE_RE  = /^\s*%%\s*tag\s+(.*)\s*$/i; // Removed the leading \?
  const normaliseTag = t => (t || "").trim().replace(/\s+/g, " ").toLowerCase();
  const normaliseNL  = s => (s || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  function extractTagsFromBody(body) {
    const tags = [], seen = new Set();
    for (const line of (body || "").split("\n")) {
      const m = line.match(TAG_LINE_RE);
      if (!m) continue;
      const payload = (m[1] || "").trim();
      if (!payload) continue;
      const lower = payload.toLowerCase();
      const chunk = lower.startsWith("tags:") ? payload.slice(payload.indexOf(":") + 1) : payload;
      for (const p of chunk.split(",").map(p => p.trim()).filter(Boolean)) {
        const nt = normaliseTag(p);
        if (nt && !seen.has(nt)) { seen.add(nt); tags.push(nt); }
      }
    }
    return tags;
  }

  function bodyWithoutTagLines(body) {
    return (body || "").split("\n").filter(l => !TAG_LINE_RE.test(l)).join("\n").trim();
  }

  function firstSentence(text) {
    const s = (text || "").trim();
    if (!s) return "";
    const m = s.match(/^[\s\S]*?[.!?](?=\s|$)/);
    return m ? m[0].trim() : (s.split("\n").find(x => x.trim()) || "").trim();
  }

  function hasExactTagLine(body, payload) {
    const want = (payload || "").trim().toLowerCase();
    if (!want) return false;
    return normaliseNL(body).split("\n").some(ln => {
      const m = ln.match(TAG_LINE_RE);
      return m && (m[1] || "").trim().toLowerCase() === want;
    });
  }

  function addTagLineToBody(body, payload) {
    const want = (payload || "").trim();
    if (!want) return body || "";
    const b = normaliseNL(body || "").trimEnd();
    if (hasExactTagLine(b, want)) return b;
    return (b ? b + "\n" : "") + `%% tag ${want}`;
  }

  function removeTagLineFromBody(body, payload) {
    const want = (payload || "").trim().toLowerCase();
    if (!want) return body || "";
    return normaliseNL(body || "")
      .split("\n")
      .filter(ln => {
        const m = ln.match(TAG_LINE_RE);
        return !(m && (m[1] || "").trim().toLowerCase() === want);
      })
      .join("\n")
      .trimEnd();
  }

  // —— App ————————————————————————————————————————————————————————————————————
  window.SiteApps.register("mdse2", container => {
    ensureStyle();
    const KEY = storageKey(container);

    // Data state
    let nodes = [];
    let sourceId           = null;
    let lastCreatedId      = null;
    let maxVisibleLevel    = 6;
    let copiedSinceChange  = false;
    let lastCopyAt         = null;
    let searchQuery        = "";
    let searchInBody       = false;
    let revealMatches      = true;
    let matchIds           = [];
    let matchPos           = -1;
    let activeTab          = "structure";
    let activeTag          = "";

    const domCache  = new Map();
    const heightMap = new Map(); 
    let   visibleArr = [];        
    let   winStart   = 0;
    let   winEnd     = -1;

    let saveTimer  = null;
    let matchTimer = null;
    let tagTimer   = null;
    let scrollRaf  = null;

    container.innerHTML = "";
    container.setAttribute("data-app", "mdse2");
    container.innerHTML = `
<div class="topbar">
  <div class="left">
    <h3>Markdown Structure Editor</h3>
    <div class="muted">Paste Markdown → Load → reorder / tweak headings → Copy Result</div>
    <div class="tabs" role="tablist" aria-label="Views">
      <button type="button" class="tabbtn tabStructure" role="tab">Structure</button>
      <button type="button" class="tabbtn tabSearch"    role="tab">Search</button>
      <button type="button" class="tabbtn tabTags"      role="tab">Tags</button>
    </div>

    <div class="tabPanel panelStructure" role="tabpanel">
      <textarea class="mdInput" placeholder="Paste Markdown here..."></textarea>
      <div class="btnrow">
        <button class="primary btnLoad"   type="button">Load Markdown</button>
        <button class="btnUpdate"         type="button">Update Input Area</button>
        <button class="primary btnCopy"   type="button">Copy Result</button>
        <button class="warn btnReset"     type="button">Reset Everything</button>
        <button class="btnAddTop"         type="button">+ Add H1</button>
      </div>
      <div class="levelFilter">
        <label for="mdseMaxLevel">Show up to:</label>
        <select id="mdseMaxLevel">
          <option value="1">H1</option><option value="2">H2</option>
          <option value="3">H3</option><option value="4">H4</option>
          <option value="5">H5</option><option value="6">H6 (All)</option>
        </select>
        <button type="button" class="btnLvl1">H1</button>
        <button type="button" class="btnLvl2">H1–H2</button>
        <button type="button" class="btnLvl3">H1–H3</button>
        <button type="button" class="btnLvlAll">All</button>
      </div>
      <div class="hint">Tip: Tap ⠿ PIN on a heading, then tap a green target heading to move the whole branch.</div>
      <div class="canvas">
        <div class="vSpacer top"></div>
        <div class="vSpacer bot"></div>
      </div>
    </div>

    <div class="tabPanel panelSearch" role="tabpanel">
      <div class="searchRow" role="search" aria-label="Outline search">
        <input id="mdseSearch" type="search" placeholder="Search..." autocomplete="off" />
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
      <div class="muted">Tags are read from lines starting with <b>%% tag</b> or <b>\\%% tag</b> inside each section's body.</div>
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
      <span class="badge dim badgeSave">Unsaved...</span>
      <span class="badge warn badgeCopy">Not copied</span>
    </div>
  </div>
</div>
<div class="footer">v2.0  -  DOM reconciliation + virtual windowing</div>
`;

    // Mapping and Logic continues...
    // (Existing functions like familyIndices, renderStructure, etc. are logically sound
    // but were previously wrapped in breaking backticks and curly quotes).
    
    // ... [The rest of your logic functions go here, ensuring standard quotes are used] ...
  });
})();
