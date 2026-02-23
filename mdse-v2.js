(() => {
“use strict”;

// \u2500\u2500 SiteApps registry \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
window.SiteApps = window.SiteApps || {};
window.SiteApps.registry = window.SiteApps.registry || {};
window.SiteApps.register =
window.SiteApps.register ||
function (name, fn) { window.SiteApps.registry[name] = fn; };

// \u2500\u2500 Constants \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const STYLE_ID = “siteapps-mdse2-style”;
const EST_H    = 96;    // fallback estimated node height (px)
const WIN_PAD  = 1200;  // px of buffer above + below viewport to keep rendered

// \u2500\u2500 Styles \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
function ensureStyle() {
if (document.getElementById(STYLE_ID)) return;
const s = document.createElement(“style”);
s.id = STYLE_ID;
s.textContent = `
[data-app=“mdse2”]{
font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;
max-width:980px; margin:14px auto;
border:2px solid #111; border-radius:16px;
padding:18px; background:#fff; color:#111;
}
[data-app=“mdse2”] *{ box-sizing:border-box; }
[data-app=“mdse2”] h3{ margin:0 0 10px; font-size:18px; }
[data-app=“mdse2”] .muted{ color:#444; font-size:13px; font-weight:700; }

[data-app=“mdse2”] textarea:not(.title){ width:100%; }
[data-app=“mdse2”] textarea,
[data-app=“mdse2”] input,
[data-app=“mdse2”] select{
border:2px solid #111; border-radius:12px; padding:12px;
font-size:16px; line-height:1.35; background:#fbfbfb; color:#111;
}
[data-app=“mdse2”] textarea:focus,
[data-app=“mdse2”] button:focus,
[data-app=“mdse2”] select:focus,
[data-app=“mdse2”] input:focus{
outline:3px solid rgba(11,95,255,.35); outline-offset:2px;
}

[data-app=“mdse2”] .topbar{
display:flex; gap:12px; align-items:flex-start;
flex-wrap:wrap; margin-bottom:10px;
}
[data-app=“mdse2”] .topbar .left{ flex:1 1 520px; min-width:0; }
[data-app=“mdse2”] .topbar .right{ flex:1 1 220px; display:flex; justify-content:flex-end; min-width:0; }

[data-app=“mdse2”] .tabs{ display:flex; gap:10px; flex-wrap:wrap; margin:6px 0 10px; }
[data-app=“mdse2”] .tabbtn{
border:2px solid #111; border-radius:999px; padding:8px 12px;
font-weight:1000; background:#fff; cursor:pointer;
}
[data-app=“mdse2”] .tabbtn.active{ background:#111; color:#fff; }
[data-app=“mdse2”] .tabPanel{ display:none; }
[data-app=“mdse2”] .tabPanel.active{ display:block; }

[data-app=“mdse2”] .btnrow{
display:flex; gap:8px; flex-wrap:wrap; margin:10px 0;
}
[data-app=“mdse2”] button{
border:2px solid #111; border-radius:12px; padding:10px 12px;
font-weight:900; font-size:13px; background:#fff; cursor:pointer;
}
[data-app=“mdse2”] button.primary{ background:#111; color:#fff; }
[data-app=“mdse2”] button.warn{ border-color:#7a0000; color:#7a0000; }
[data-app=“mdse2”] button:disabled{ opacity:.55; cursor:not-allowed; }

[data-app=“mdse2”] .badges{
display:flex; gap:10px; align-items:center;
justify-content:flex-end; flex-wrap:wrap;
}
[data-app=“mdse2”] .badge{
border:2px solid #111; border-radius:999px;
padding:6px 10px; font-weight:900; font-size:13px; background:#fff;
}
[data-app=“mdse2”] .badge.good{ border-color:#0b3d0b; color:#0b3d0b; }
[data-app=“mdse2”] .badge.warn{ border-color:#7a0000; color:#7a0000; }
[data-app=“mdse2”] .badge.dim{ border-color:#444; color:#444; }

[data-app=“mdse2”] .levelFilter{
display:flex; gap:8px; align-items:center;
flex-wrap:wrap; margin-top:10px;
}
[data-app=“mdse2”] .levelFilter label{ font-weight:900; font-size:13px; }
[data-app=“mdse2”] select{ padding:8px 10px; font-weight:900; background:#fff; }

[data-app=“mdse2”] .searchRow{
display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin-top:10px;
}
[data-app=“mdse2”] .searchRow input[type=“search”]{
flex:1 1 260px; border:2px solid #111; border-radius:12px;
padding:10px 12px; font-weight:900; font-size:15px; background:#fff;
}
[data-app=“mdse2”] .searchOpt{
display:flex; gap:6px; align-items:center;
font-weight:900; font-size:13px; color:#222;
}
[data-app=“mdse2”] .searchCount{
font-weight:900; font-size:13px; color:#444;
padding:6px 10px; border:2px solid rgba(0,0,0,.15);
border-radius:999px; background:#fff;
}

[data-app=“mdse2”] .canvas{ margin-top:14px; position:relative; }
[data-app=“mdse2”] .vSpacer{ width:100%; pointer-events:none; }

[data-app=“mdse2”] .node{
background:#fff; border:2px solid rgba(0,0,0,.15);
border-radius:14px; padding:12px; margin:10px 0;
}
[data-app=“mdse2”] .node.level-1{ border-left:10px solid #111; margin-left:0; }
[data-app=“mdse2”] .node.level-2{ border-left:10px solid #444; margin-left:18px; }
[data-app=“mdse2”] .node.level-3{ border-left:10px solid #777; margin-left:36px; }
[data-app=“mdse2”] .node.level-4{ border-left:10px solid #999; margin-left:54px; }
[data-app=“mdse2”] .node.level-5{ border-left:10px solid #bbb; margin-left:72px; }
[data-app=“mdse2”] .node.level-6{ border-left:10px solid #ddd; margin-left:90px; }

[data-app=“mdse2”] .hdr{
display:grid !important;
grid-template-columns:auto auto auto minmax(240px,1fr) auto;
column-gap:10px; align-items:start; min-width:0;
}
[data-app=“mdse2”] .hdr > *{ min-width:0; }

[data-app=“mdse2”] .pill{
border:2px solid #111; border-radius:12px; padding:8px 10px;
font-weight:900; font-size:13px; background:#fff; user-select:none;
}
[data-app=“mdse2”] .pill.gray{ border-color:#444; color:#444; }

[data-app=“mdse2”] .title{
width:100% !important; min-width:240px !important;
border:2px solid rgba(0,0,0,.15); border-radius:12px;
padding:10px 12px; font-size:16px; font-weight:900;
resize:none; overflow:hidden; min-height:44px;
background:#fbfbfb; display:block;
}

[data-app=“mdse2”] .tools{
display:flex; gap:6px; flex-wrap:wrap;
justify-content:flex-end; align-items:flex-start; margin-left:0 !important;
}
[data-app=“mdse2”] .tools button{ padding:8px 10px; border-radius:12px; font-size:13px; }

[data-app=“mdse2”] .body{ margin-top:10px; display:none; }
[data-app=“mdse2”] .body.show{ display:block; }
[data-app=“mdse2”] .body textarea{ white-space:pre-wrap; }

[data-app=“mdse2”] .hint{
margin-top:10px; font-size:13px; font-weight:800; color:#444;
}

@media (max-width:900px){
[data-app=“mdse2”] .hdr{
grid-template-columns:auto auto auto 1fr;
grid-auto-rows:auto; row-gap:10px;
}
[data-app=“mdse2”] .tools{ grid-column:1 / -1; justify-content:flex-start; }
[data-app=“mdse2”] .title{ grid-column:1 / -1; min-width:0 !important; }
}

[data-app=“mdse2”] .movingSource{
border-color:#0b5fff !important;
box-shadow:0 8px 28px rgba(11,95,255,.18);
background:#f6f9ff !important;
}
[data-app=“mdse2”] .moveTarget{
cursor:pointer;
border-color:#0b3d0b !important;
background:#f1fff1 !important;
}
[data-app=“mdse2”] .collapsed{
border-color:#9a7b00 !important;
background:#fffbe6 !important;
}
[data-app=“mdse2”] .match{
outline:4px solid rgba(255,170,0,.65); outline-offset:2px;
}
[data-app=“mdse2”] .activeMatch{
outline:5px solid rgba(255,120,0,.85); outline-offset:3px;
}

[data-app=“mdse2”] .tagbar{
display:flex; gap:10px; flex-wrap:wrap;
align-items:center; margin:10px 0 12px;
}
[data-app=“mdse2”] .tagchip{
border:2px solid #111; border-radius:999px;
padding:8px 12px; font-weight:1000; background:#fff; cursor:pointer;
}
[data-app=“mdse2”] .tagchip.active{ background:#111; color:#fff; }
[data-app=“mdse2”] .tagmeta{ font-weight:900; color:#444; font-size:13px; }
[data-app=“mdse2”] .taglist{ display:grid; gap:10px; margin-top:10px; }
[data-app=“mdse2”] .tagcard{
border:2px solid rgba(0,0,0,.15); border-radius:14px;
padding:12px; background:#fff; cursor:pointer;
}
[data-app=“mdse2”] .tagcard:hover{ box-shadow:0 6px 18px rgba(0,0,0,.06); }
[data-app=“mdse2”] .tagcard .toph{
display:flex; gap:10px; align-items:center; flex-wrap:wrap; font-weight:1000;
}
[data-app=“mdse2”] .tagcard .toph .lvl{
border:2px solid #111; border-radius:999px;
padding:4px 10px; font-size:12px; font-weight:1000;
}
[data-app=“mdse2”] .tagcard .titleline{ font-size:15px; font-weight:1000; }
[data-app=“mdse2”] .tagcard .preview{
margin-top:6px; color:#333; font-weight:750;
font-size:14px; line-height:1.35;
}
[data-app=“mdse2”] .tagcard .subtags{
margin-top:8px; display:flex; gap:8px; flex-wrap:wrap;
}
[data-app=“mdse2”] .tagpill{
border:2px solid rgba(0,0,0,.15); border-radius:999px;
padding:4px 10px; font-size:12px; font-weight:1000;
color:#444; background:#fff;
}

[data-app=“mdse2”] .footer{
margin-top:14px; font-size:12px; color:#666;
font-weight:700; text-align:right;
}
`;
document.head.appendChild(s);
}

// \u2500\u2500 Pure utilities \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const uid   = () => `n_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;

function autoResizeTA(ta) {
ta.style.height = “auto”;
ta.style.height = Math.max(44, ta.scrollHeight) + “px”;
}
function safeJsonParse(s) { try { return JSON.parse(s); } catch { return null; } }
function storageKey(c) {
const k = c.getAttribute(“data-storage-key”);
return k && k.trim()
? `siteapps:mdse2:${k.trim()}`
: `siteapps:mdse2:${location.pathname || "/"}`;
}
async function copyText(text) {
if (navigator.clipboard && window.isSecureContext) {
try { await navigator.clipboard.writeText(text); return true; } catch {}
}
try {
const ta = document.createElement(“textarea”);
ta.value = text;
ta.style.cssText = “position:fixed;left:-9999px;top:0”;
document.body.appendChild(ta);
ta.focus(); ta.select();
const ok = document.execCommand(“copy”);
ta.remove();
return !!ok;
} catch { return false; }
}

// \u2500\u2500 Tag helpers \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const TAG_LINE_RE  = /^\s*\?%%\s*tag\s+(.*)\s*$/i;
const normaliseTag = t => (t || “”).trim().replace(/\s+/g, “ “).toLowerCase();
const normaliseNL  = s => (s || “”).replace(/\r\n/g, “\n”).replace(/\r/g, “\n”);

function extractTagsFromBody(body) {
const tags = [], seen = new Set();
for (const line of (body || “”).split(”\n”)) {
const m = line.match(TAG_LINE_RE);
if (!m) continue;
const payload = (m[1] || “”).trim();
if (!payload) continue;
const lower = payload.toLowerCase();
const chunk = lower.startsWith(“tags:”) ? payload.slice(payload.indexOf(”:”) + 1) : payload;
for (const p of chunk.split(”,”).map(p => p.trim()).filter(Boolean)) {
const nt = normaliseTag(p);
if (nt && !seen.has(nt)) { seen.add(nt); tags.push(nt); }
}
}
return tags;
}

function bodyWithoutTagLines(body) {
return (body || “”).split(”\n”).filter(l => !TAG_LINE_RE.test(l)).join(”\n”).trim();
}

function firstSentence(text) {
const s = (text || “”).trim();
if (!s) return “”;
const m = s.match(/^[\s\S]*?[.!?](?=\s|$)/);
return m ? m[0].trim() : (s.split(”\n”).find(x => x.trim()) || “”).trim();
}

function hasExactTagLine(body, payload) {
const want = (payload || “”).trim().toLowerCase();
if (!want) return false;
return normaliseNL(body).split(”\n”).some(ln => {
const m = ln.match(TAG_LINE_RE);
return m && (m[1] || “”).trim().toLowerCase() === want;
});
}

function addTagLineToBody(body, payload) {
const want = (payload || “”).trim();
if (!want) return body || “”;
const b = normaliseNL(body || “”).trimEnd();
if (hasExactTagLine(b, want)) return b;
return (b ? b + “\n” : “”) + `%% tag ${want}`;
}

function removeTagLineFromBody(body, payload) {
const want = (payload || “”).trim().toLowerCase();
if (!want) return body || “”;
return normaliseNL(body || “”)
.split(”\n”)
.filter(ln => {
const m = ln.match(TAG_LINE_RE);
return !(m && (m[1] || “”).trim().toLowerCase() === want);
})
.join(”\n”)
.trimEnd();
}

// \u2500\u2500 App \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
window.SiteApps.register(“mdse2”, container => {
ensureStyle();
const KEY = storageKey(container);

```
// \u2500\u2500 Data state
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

// \u2500\u2500 Virtual render state
// domCache: id \u2192 { el, pin, colBtn, lvlPill, titleTA, bodyTA, bodyWrap,
//                  bodyBtn, tagKidsBtn, untagKidsBtn }
const domCache  = new Map();
const heightMap = new Map(); // id \u2192 measured height (px)
let   visibleArr = [];        // [{n, idx}] after level/collapse/reveal filter
let   winStart   = 0;
let   winEnd     = -1;

// \u2500\u2500 Timers / rAF
let saveTimer  = null;
let matchTimer = null;
let tagTimer   = null;
let scrollRaf  = null;

// \u2500\u2500 Shell HTML \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
container.innerHTML = "";
container.setAttribute("data-app", "mdse2");
container.innerHTML = `
```

<div class="topbar">
  <div class="left">
    <h3>Markdown Structure Editor</h3>
    <div class="muted">Paste Markdown \u2192 Load \u2192 reorder / tweak headings \u2192 Copy Result</div>
    <div class="tabs" role="tablist" aria-label="Views">
      <button type="button" class="tabbtn tabStructure" role="tab">Structure</button>
      <button type="button" class="tabbtn tabSearch"    role="tab">Search</button>
      <button type="button" class="tabbtn tabTags"      role="tab">Tags</button>
    </div>

```
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
    <button type="button" class="btnLvl2">H1\u2013H2</button>
    <button type="button" class="btnLvl3">H1\u2013H3</button>
    <button type="button" class="btnLvlAll">All</button>
  </div>
  <div class="hint">Tip: Tap \u283F PIN on a heading, then tap a green target heading to move the whole branch.</div>
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
```

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

```
const $ = sel => container.querySelector(sel);

const btnTabStructure = $(".tabStructure");
const btnTabSearch    = $(".tabSearch");
const btnTabTags      = $(".tabTags");
const panelStructure  = $(".panelStructure");
const panelSearch     = $(".panelSearch");
const panelTags       = $(".panelTags");
const taInput         = $(".mdInput");
const canvas          = $(".canvas");
const topSpacer       = $(".vSpacer.top");
const botSpacer       = $(".vSpacer.bot");
const badgeSave       = $(".badgeSave");
const badgeCopy       = $(".badgeCopy");
const btnLoad         = $(".btnLoad");
const btnUpdate       = $(".btnUpdate");
const btnCopy         = $(".btnCopy");
const btnReset        = $(".btnReset");
const btnAddTop       = $(".btnAddTop");
const selMax          = $("#mdseMaxLevel");
const btnLvl1         = $(".btnLvl1");
const btnLvl2         = $(".btnLvl2");
const btnLvl3         = $(".btnLvl3");
const btnLvlAll       = $(".btnLvlAll");
const inSearch        = $("#mdseSearch");
const btnPrev         = $(".btnPrev");
const btnNext         = $(".btnNext");
const cbBody          = $("#mdseSearchBody");
const cbReveal        = $("#mdseReveal");
const countEl         = $("#mdseCount");
const searchResults   = $(".searchResults");
const tagMeta         = $(".tagMeta");
const tagAllBtn       = $(".tagAll");
const tagCloud        = $(".tagCloud");
const tagResults      = $(".tagResults");

// \u2500\u2500 Outline helpers \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const indexById = id => nodes.findIndex(n => n.id === id);

function familyIndices(si) {
  const fam = [si];
  if (si < 0 || si >= nodes.length) return fam;
  const pl = nodes[si].level;
  for (let i = si + 1; i < nodes.length; i++) {
    if (nodes[i].level > pl) fam.push(i); else break;
  }
  return fam;
}

function familyIds(id) {
  const idx = indexById(id);
  return idx < 0 ? [] : familyIndices(idx).map(i => nodes[i].id);
}

function hasChildren(idx) { return familyIndices(idx).length > 1; }

function directChildIndices(pi) {
  const out = [];
  if (pi < 0 || pi >= nodes.length) return out;
  const pl = nodes[pi].level;
  for (let i = pi + 1; i < nodes.length; i++) {
    if (nodes[i].level <= pl) break;
    if (nodes[i].level === pl + 1) out.push(i);
  }
  return out;
}

function bulkTagDirectChildren(parentId, payload, mode) {
  const pi = indexById(parentId);
  if (pi < 0) return;
  const kids = directChildIndices(pi);
  if (!kids.length) { alert("No direct children under this heading."); return; }
  kids.forEach(i => {
    const n = nodes[i];
    n.body = mode === "remove"
      ? removeTagLineFromBody(n.body || "", payload)
      : addTagLineToBody(n.body || "", payload);
    n.tags     = extractTagsFromBody(n.body);
    n.showBody = true;
  });
  markChangedFull();
}

// \u2500\u2500 Search helpers \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const normS = s => (s || "").toLowerCase();

function nodeMatches(n, q) {
  if (!q) return false;
  const qq = normS(q);
  if (normS(n.title).includes(qq)) return true;
  if (searchInBody && normS(n.body).includes(qq)) return true;
  return false;
}

function nodeMatchesBodyOnly(n, q) {
  if (!q || !searchInBody) return false;
  const qq = normS(q);
  return !normS(n.title).includes(qq) && normS(n.body).includes(qq);
}

// \u2500\u2500 Virtual render helpers \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

function computeRevealSet() {
  const reveal = new Set();
  if (!revealMatches || !searchQuery.trim() || !matchIds.length) return reveal;
  const matchSet = new Set(matchIds);
  for (let i = 0; i < nodes.length; i++) {
    if (!matchSet.has(nodes[i].id)) continue;
    reveal.add(nodes[i].id);
    let cl = nodes[i].level;
    for (let j = i - 1; j >= 0; j--) {
      if (nodes[j].level < cl) { reveal.add(nodes[j].id); cl = nodes[j].level; }
      if (cl === 1) break;
    }
  }
  return reveal;
}

function computeVisible() {
  const hidden = new Set();
  nodes.forEach((n, idx) => {
    if (n.isCollapsed) familyIndices(idx).slice(1).forEach(i => hidden.add(i));
  });
  const reveal = computeRevealSet();
  visibleArr = [];
  nodes.forEach((n, idx) => {
    if (n.level > maxVisibleLevel) return;
    if (hidden.has(idx) && !reveal.has(n.id)) return;
    visibleArr.push({ n, idx });
  });
}

// Compute which slice of visibleArr should be in the DOM.
// Uses heightMap for accuracy; falls back to EST_H for unmeasured nodes.
function computeWindow() {
  if (!visibleArr.length) { winStart = 0; winEnd = -1; return; }

  const scrollY      = window.scrollY;
  const canvasDocTop = canvas.getBoundingClientRect().top + scrollY;
  // Positions are canvas-relative
  const from = scrollY - WIN_PAD - canvasDocTop;
  const to   = scrollY + window.innerHeight + WIN_PAD - canvasDocTop;

  let cumH = 0;
  let start = 0, end = visibleArr.length - 1, foundStart = false;

  for (let i = 0; i < visibleArr.length; i++) {
    const h = heightMap.get(visibleArr[i].n.id) || EST_H;
    if (!foundStart && cumH + h > from) { start = i; foundStart = true; }
    cumH += h;
    if (foundStart && cumH > to) { end = i; break; }
  }
  if (!foundStart) start = Math.max(0, visibleArr.length - 5);

  winStart = start;
  winEnd   = end;
}

function getSpacerHeights() {
  let topH = 0, botH = 0;
  for (let i = 0; i < winStart; i++)
    topH += heightMap.get(visibleArr[i]?.n.id) || EST_H;
  for (let i = winEnd + 1; i < visibleArr.length; i++)
    botH += heightMap.get(visibleArr[i]?.n.id) || EST_H;
  return { topH, botH };
}

// \u2500\u2500 Node DOM builders \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

function nodeClass(n, isSource, isTarget, isMatch, isActive) {
  return "node level-" + n.level
    + (isSource      ? " movingSource" : "")
    + (isTarget      ? " moveTarget"   : "")
    + (n.isCollapsed ? " collapsed"    : "")
    + (isMatch       ? " match"        : "")
    + (isActive      ? " activeMatch"  : "");
}

// Create a full DOM entry for a node. Returns an entry object with refs.
function buildNodeEntry(n, idx, movingSet, revealSet, matchSet) {
  const isSource = sourceId === n.id;
  const isTarget = !!sourceId && !movingSet.has(n.id);
  const isMatch  = !!searchQuery.trim() && matchSet.has(n.id);
  const isActive = isMatch && matchPos >= 0 && matchIds[matchPos] === n.id;

  const el = document.createElement("div");
  el.setAttribute("data-node-id", n.id);
  el.className        = nodeClass(n, isSource, isTarget, isMatch, isActive);
  el.dataset.isTarget = isTarget ? "1" : "0";

  // \u2500\u2500 Header grid
  const hdr = document.createElement("div");
  hdr.className = "hdr";

  const pin = document.createElement("div");
  pin.className   = "pill gray";
  pin.textContent = isSource ? "\u{1F4CD} PIN" : "\u283F";
  pin.title       = "Pin branch to move";
  pin.addEventListener("click", e => { e.stopPropagation(); toggleMove(n.id); });

  const colBtn = document.createElement("div");
  colBtn.className   = "pill gray";
  colBtn.textContent = hasChildren(idx) ? (n.isCollapsed ? "\u25B6" : "\u25BC") : "\u2022";
  colBtn.title       = hasChildren(idx) ? "Fold/unfold branch" : "No children";
  colBtn.addEventListener("click", e => {
    e.stopPropagation();
    if (hasChildren(indexById(n.id))) toggleBranchCollapse(n.id);
  });

  const lvlPill = document.createElement("div");
  lvlPill.className   = "pill";
  lvlPill.textContent = `H${n.level}`;

  const titleTA = document.createElement("textarea");
  titleTA.className = "title";
  titleTA.rows      = 1;
  titleTA.value     = (n.title || "").replace(/[\r\n]+/g, " ");
  titleTA.addEventListener("click",   e => e.stopPropagation());
  titleTA.addEventListener("keydown", e => {
    e.stopPropagation();
    if (e.key === "Enter") e.preventDefault();
  });
  titleTA.addEventListener("input", () => {
    n.title = titleTA.value.replace(/[\r\n]+/g, " ");
    if (titleTA.value !== n.title) titleTA.value = n.title;
    autoResizeTA(titleTA);
    markChangedTyping();
  });

  // \u2500\u2500 Tool buttons
  const tools = document.createElement("div");
  tools.className = "tools";
  tools.addEventListener("click", e => e.stopPropagation());

  const mkBtn = (text, cls, title, fn) => {
    const b = document.createElement("button");
    b.type = "button"; b.textContent = text;
    if (cls)   b.className = cls;
    if (title) b.title     = title;
    b.addEventListener("click", fn);
    return b;
  };

  const hasBody = !!(n.body && n.body.trim());
  const bodyBtn = mkBtn(
    n.showBody ? "\u{1F4DD} Hide text" : (hasBody ? "\u{1F4DD} Show text" : "\u2795 Add text"),
    hasBody ? "primary" : "",
    "", () => toggleBody(n.id)
  );

  const dup  = mkBtn("\u29C9 Duplicate", "", "",                          () => duplicateBranch(n.id));
  const add  = mkBtn("+ Add",        "", "",                          () => addNewAfter(n.id));
  const lft  = mkBtn("\u2190", "",  "Promote (H-1) for this branch",      () => changeLevel(n.id, -1));
  const rgt  = mkBtn("\u2192", "",  "Demote (H+1) for this branch",       () => changeLevel(n.id, +1));
  const del  = mkBtn("\u2715", "warn", "Delete branch",                   () => deleteBranch(n.id));

  let tagKidsBtn = null, untagKidsBtn = null;
  if (n.level < 6) {
    tagKidsBtn = mkBtn(
      `\u{1F3F7} Tag H${n.level + 1}`,
      "",
      `Add a %% tag line to every direct H${n.level + 1} under this heading`,
      () => {
        const p = prompt(
          `Add which tag to all H${n.level + 1} under "${n.title || "Untitled"}"?\n\nExample: arc holiday`,
          "arc holiday"
        );
        if (p) bulkTagDirectChildren(n.id, p, "add");
      }
    );
    untagKidsBtn = mkBtn(
      `\u{1F9FD} Untag H${n.level + 1}`,
      "",
      `Remove that exact %% tag line from every direct H${n.level + 1} under this heading`,
      () => {
        const p = prompt(
          `Remove which tag from all H${n.level + 1} under "${n.title || "Untitled"}"?\n\nExample: arc holiday`,
          "arc holiday"
        );
        if (p) bulkTagDirectChildren(n.id, p, "remove");
      }
    );
    tools.append(bodyBtn, dup, add, lft, rgt, tagKidsBtn, untagKidsBtn, del);
  } else {
    tools.append(bodyBtn, dup, add, lft, rgt, del);
  }

  hdr.append(pin, colBtn, lvlPill, titleTA, tools);
  el.appendChild(hdr);

  // \u2500\u2500 Body area
  const shouldShow = n.showBody ||
    (revealMatches && searchQuery.trim() && nodeMatchesBodyOnly(n, searchQuery));

  const bodyWrap = document.createElement("div");
  bodyWrap.className = "body" + (shouldShow ? " show" : "");

  const bodyTA = document.createElement("textarea");
  bodyTA.rows  = 6;
  bodyTA.wrap  = "soft";
  bodyTA.value = normaliseNL(n.body || "").trimEnd();
  const sp = e => e.stopPropagation();
  bodyTA.addEventListener("keydown",  sp);
  bodyTA.addEventListener("keypress", sp);
  bodyTA.addEventListener("keyup",    sp);
  bodyTA.addEventListener("input", () => {
    n.body = bodyTA.value;
    n.tags = extractTagsFromBody(n.body);
    markChangedTyping();
  });

  bodyWrap.appendChild(bodyTA);
  el.appendChild(bodyWrap);

  // Resize title once in DOM (scrollHeight needs layout)
  requestAnimationFrame(() => autoResizeTA(titleTA));

  return { el, pin, colBtn, lvlPill, titleTA, bodyTA, bodyWrap, bodyBtn, tagKidsBtn, untagKidsBtn };
}

// Patch an existing entry in-place  -  no DOM teardown, no event re-binding.
function updateNodeEntry(entry, n, idx, movingSet, revealSet, matchSet) {
  const { el, pin, colBtn, lvlPill, titleTA, bodyTA, bodyWrap, bodyBtn, tagKidsBtn, untagKidsBtn } = entry;

  const isSource = sourceId === n.id;
  const isTarget = !!sourceId && !movingSet.has(n.id);
  const isMatch  = !!searchQuery.trim() && matchSet.has(n.id);
  const isActive = isMatch && matchPos >= 0 && matchIds[matchPos] === n.id;

  const nc = nodeClass(n, isSource, isTarget, isMatch, isActive);
  if (el.className !== nc)       el.className = nc;
  el.dataset.isTarget = isTarget ? "1" : "0";

  const pinTxt = isSource ? "\u{1F4CD} PIN" : "\u283F";
  if (pin.textContent !== pinTxt) pin.textContent = pinTxt;

  const hc = hasChildren(idx);
  const colTxt = hc ? (n.isCollapsed ? "\u25B6" : "\u25BC") : "\u2022";
  if (colBtn.textContent !== colTxt) colBtn.textContent = colTxt;
  colBtn.title = hc ? "Fold/unfold branch" : "No children";

  const lvlTxt = `H${n.level}`;
  if (lvlPill.textContent !== lvlTxt) lvlPill.textContent = lvlTxt;

  // Only overwrite textarea value if it diverges (e.g. after bulk-tag, level change)
  const wantTitle = (n.title || "").replace(/[\r\n]+/g, " ");
  if (titleTA.value !== wantTitle) { titleTA.value = wantTitle; autoResizeTA(titleTA); }

  const wantBody = normaliseNL(n.body || "").trimEnd();
  if (bodyTA.value !== wantBody) bodyTA.value = wantBody;

  const shouldShow = n.showBody ||
    (revealMatches && searchQuery.trim() && nodeMatchesBodyOnly(n, searchQuery));
  bodyWrap.classList.toggle("show", shouldShow);

  const hasBodyNow = !!(n.body && n.body.trim());
  const wantBtnTxt = n.showBody ? "\u{1F4DD} Hide text" : (hasBodyNow ? "\u{1F4DD} Show text" : "\u2795 Add text");
  if (bodyBtn.textContent !== wantBtnTxt) bodyBtn.textContent = wantBtnTxt;
  const wantBtnCls = hasBodyNow ? "primary" : "";
  if (bodyBtn.className !== wantBtnCls) bodyBtn.className = wantBtnCls;

  if (tagKidsBtn) {
    const t = `\u{1F3F7} Tag H${n.level + 1}`;
    if (tagKidsBtn.textContent !== t) tagKidsBtn.textContent = t;
  }
  if (untagKidsBtn) {
    const t = `\u{1F9FD} Untag H${n.level + 1}`;
    if (untagKidsBtn.textContent !== t) untagKidsBtn.textContent = t;
  }
}

// \u2500\u2500 Main render \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// Called on any structural change. Does:
//   1. Compute which nodes are logically visible (level + collapse filter)
//   2. Evict domCache entries for nodes that no longer exist
//   3. Compute which slice of visible nodes is inside the viewport window
//   4. Set spacer heights for the off-screen regions
//   5. Remove DOM nodes outside the window (kept in cache for fast scrollback)
//   6. Forward-scan reconcile: build new / patch existing / reorder DOM nodes
//   7. Measure actual heights on next frame and refine spacers
function renderStructure() {
  selMax.value = String(maxVisibleLevel);

  // 1. Visible list
  computeVisible();

  // 2. Evict deleted nodes
  const visibleIds = new Set(visibleArr.map(v => v.n.id));
  for (const [id, entry] of domCache) {
    if (!visibleIds.has(id)) {
      if (entry.el.parentNode) entry.el.remove();
      domCache.delete(id);
      heightMap.delete(id);
    }
  }

  // 3. Window
  computeWindow();

  // 4. Spacers
  const { topH, botH } = getSpacerHeights();
  topSpacer.style.height = topH + "px";
  botSpacer.style.height = botH + "px";

  // Shared sets for render decisions
  const movingSet = sourceId ? new Set(familyIds(sourceId)) : new Set();
  const revealSet = computeRevealSet();
  const matchSet  = new Set(matchIds);

  // 5. Remove out-of-window nodes from DOM (keep in cache)
  const winIds = new Set();
  for (let i = winStart; i <= winEnd; i++) {
    if (visibleArr[i]) winIds.add(visibleArr[i].n.id);
  }
  let scan = topSpacer.nextSibling;
  while (scan && scan !== botSpacer) {
    const next = scan.nextSibling;
    const id   = scan.getAttribute("data-node-id");
    if (id && !winIds.has(id)) {
      const h = scan.offsetHeight;
      if (h > 0) heightMap.set(id, h); // record height before removal
      scan.remove();
    }
    scan = next;
  }

  // 6. Forward-scan reconcile
  // cursor points to the DOM node that the next item should appear *before*
  let cursor = topSpacer.nextSibling || botSpacer;

  for (let i = winStart; i <= winEnd; i++) {
    if (i < 0 || i >= visibleArr.length) continue;
    const { n, idx } = visibleArr[i];
    let entry = domCache.get(n.id);

    if (!entry) {
      // Brand new node
      entry = buildNodeEntry(n, idx, movingSet, revealSet, matchSet);
      domCache.set(n.id, entry);
      canvas.insertBefore(entry.el, cursor);
      // cursor stays  -  next item goes after this new element

    } else if (entry.el.parentNode === canvas) {
      // Already in DOM  -  update and check position
      updateNodeEntry(entry, n, idx, movingSet, revealSet, matchSet);
      if (entry.el === cursor) {
        cursor = cursor.nextSibling || botSpacer; // already correct, advance
      } else {
        canvas.insertBefore(entry.el, cursor); // move to correct slot
      }

    } else {
      // In cache but not in DOM (was outside window, now scrolled into view)
      updateNodeEntry(entry, n, idx, movingSet, revealSet, matchSet);
      canvas.insertBefore(entry.el, cursor);
    }
  }

  // 7. Measure heights and refine spacers on next frame
  requestAnimationFrame(() => {
    let changed = false;
    for (let i = winStart; i <= winEnd; i++) {
      if (!visibleArr[i]) continue;
      const entry = domCache.get(visibleArr[i].n.id);
      if (entry?.el.parentNode) {
        const h = entry.el.offsetHeight;
        if (h > 0 && heightMap.get(visibleArr[i].n.id) !== h) {
          heightMap.set(visibleArr[i].n.id, h);
          changed = true;
        }
      }
    }
    if (changed) {
      const { topH: tH, botH: bH } = getSpacerHeights();
      topSpacer.style.height = tH + "px";
      botSpacer.style.height = bH + "px";
    }
  });

  // 8. Focus newly created node
  if (lastCreatedId) {
    const entry = domCache.get(lastCreatedId);
    if (entry?.el) {
      entry.el.scrollIntoView({ behavior: "smooth", block: "center" });
      entry.titleTA.focus();
    }
    lastCreatedId = null;
  }
}

// \u2500\u2500 Scroll-driven window updates \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
function onScroll() {
  if (scrollRaf) return;
  scrollRaf = requestAnimationFrame(() => {
    scrollRaf = null;
    if (activeTab !== "structure" || !visibleArr.length) return;
    const oldStart = winStart, oldEnd = winEnd;
    computeWindow();
    if (winStart !== oldStart || winEnd !== oldEnd) {
      // Restore so renderStructure recalculates cleanly
      winStart = oldStart; winEnd = oldEnd;
      renderStructure();
    }
  });
}

window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", () => {
  if (activeTab === "structure") renderStructure();
}, { passive: true });

// Cleanup scroll listener if container is removed from DOM
{
  const remObs = new MutationObserver(() => {
    if (!document.contains(container)) {
      window.removeEventListener("scroll", onScroll);
      remObs.disconnect();
    }
  });
  remObs.observe(document.body, { childList: true, subtree: true });
}

// \u2500\u2500 Persistence \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
function setCopiedFlag(flag) {
  copiedSinceChange = !!flag;
  if (copiedSinceChange) lastCopyAt = new Date().toISOString();
  badgeCopy.className   = "badge " + (copiedSinceChange ? "good" : "warn");
  badgeCopy.textContent = copiedSinceChange ? "Copied \u2713" : "Not copied";
  badgeCopy.title       = copiedSinceChange && lastCopyAt ? `Last copied: ${lastCopyAt}` : "";
}

function saveNow() {
  try {
    localStorage.setItem(KEY, JSON.stringify({
      v: 7, nodes, input: taInput.value, sourceId, maxVisibleLevel,
      copiedSinceChange, lastCopyAt, searchQuery, searchInBody,
      revealMatches, activeTab, activeTag,
    }));
    badgeSave.className   = "badge good badgeSave";
    badgeSave.textContent = "Saved \u2713";
  } catch {
    badgeSave.className   = "badge warn badgeSave";
    badgeSave.textContent = "Not saved";
  }
}

function saveDebounced() {
  badgeSave.className   = "badge dim badgeSave";
  badgeSave.textContent = "Unsaved...";
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => { saveTimer = null; saveNow(); }, 500);
}

function loadPref() {
  const raw = localStorage.getItem(KEY);
  if (!raw) return;
  const s = safeJsonParse(raw);
  if (!s || typeof s !== "object") return;

  if (Array.isArray(s.nodes))                nodes          = s.nodes;
  if (typeof s.input           === "string") taInput.value  = s.input;
  if (s.sourceId               !== undefined) sourceId      = s.sourceId;
  if (typeof s.maxVisibleLevel === "number") maxVisibleLevel = clamp(s.maxVisibleLevel, 1, 6);
  copiedSinceChange = !!s.copiedSinceChange;
  lastCopyAt        = typeof s.lastCopyAt    === "string"  ? s.lastCopyAt    : null;
  if (typeof s.searchQuery   === "string")  searchQuery   = s.searchQuery;
  if (typeof s.searchInBody  === "boolean") searchInBody  = s.searchInBody;
  if (typeof s.revealMatches === "boolean") revealMatches = s.revealMatches;
  if (typeof s.activeTab     === "string")  activeTab     =
    ["structure","search","tags"].includes(s.activeTab) ? s.activeTab : "structure";
  if (typeof s.activeTag === "string") activeTag = normaliseTag(s.activeTag);

  nodes = nodes.filter(n => n && typeof n === "object").map(n => {
    const body = typeof n.body === "string" ? n.body : "";
    return {
      id:          typeof n.id    === "string" ? n.id    : uid(),
      level:       clamp(parseInt(n.level, 10) || 1, 1, 6),
      title:       typeof n.title === "string" ? n.title : "",
      body,
      isCollapsed: !!n.isCollapsed,
      showBody:    !!n.showBody,
      tags:        Array.isArray(n.tags)
        ? n.tags.map(normaliseTag).filter(Boolean)
        : extractTagsFromBody(body),
    };
  });
}

// \u2500\u2500 Markdown parse / export \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
function parseMarkdown(text) {
  const out = []; let current = null;
  for (const line of (text || "").split("\n")) {
    const m = line.match(/^(#{1,6})\s+(.*)/);
    if (m) {
      current = { id: uid(), level: m[1].length, title: m[2] || "",
                  body: "", isCollapsed: false, showBody: false, tags: [] };
      out.push(current);
    } else if (current) {
      current.body += line + "\n";
    }
  }
  out.forEach(n => { n.tags = extractTagsFromBody(n.body); });
  return out;
}

function toMarkdown() {
  return nodes.map(n => {
    const head = "#".repeat(n.level) + " " + (n.title || "");
    const body = (n.body || "").trimEnd();
    return body ? head + "\n" + body : head;
  }).join("\n\n");
}

// \u2500\u2500 Match helpers \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
function updateCount() {
  if (!searchQuery.trim()) { countEl.textContent = ""; return; }
  if (!matchIds.length)    { countEl.textContent = "0 matches"; return; }
  const cur = matchPos >= 0 ? matchPos + 1 : 0;
  countEl.textContent = cur ? `${cur}/${matchIds.length}` : `${matchIds.length} matches`;
}

function rebuildMatchesNoRender() {
  matchIds = []; matchPos = -1;
  if (searchQuery.trim())
    nodes.forEach(n => { if (nodeMatches(n, searchQuery)) matchIds.push(n.id); });
  updateCount();
}

function rebuildMatchesDebounced() {
  if (matchTimer) clearTimeout(matchTimer);
  matchTimer = setTimeout(() => { matchTimer = null; rebuildMatchesNoRender(); }, 150);
}

function rebuildMatches() {
  rebuildMatchesNoRender();
  renderStructure();
  if (activeTab === "search") renderSearchResults();
}

function jumpMatch(delta) {
  if (!matchIds.length) return;
  matchPos = (matchPos + delta + matchIds.length) % matchIds.length;
  updateCount();
  renderStructure();
  const entry = domCache.get(matchIds[matchPos]);
  if (entry?.el) {
    entry.el.scrollIntoView({ behavior: "smooth", block: "center" });
    entry.titleTA.focus();
  }
}

// \u2500\u2500 Tags tab \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
function allTags() {
  const set = new Set();
  nodes.forEach(n => (n.tags || []).forEach(t => set.add(t)));
  return [...set].sort((a, b) => a.localeCompare(b));
}
function tagsCountMap() {
  const m = new Map();
  nodes.forEach(n => (n.tags || []).forEach(t => m.set(t, (m.get(t) || 0) + 1)));
  return m;
}

function renderTagCloud(tags, counts) {
  tagCloud.innerHTML = "";
  if (!tags.length) {
    tagCloud.innerHTML =
      `<span class="tagmeta">No tags found. Add <b>%% tag name</b> lines inside section bodies.</span>`;
    return;
  }
  tags.forEach(t => {
    const btn = document.createElement("button");
    btn.type      = "button";
    btn.className = "tagchip" + (activeTag === t ? " active" : "");
    btn.textContent = `${t} (${counts.get(t) || 0})`;
    btn.addEventListener("click", () => {
      activeTag = activeTag === t ? "" : t;
      rebuildTagUI(); saveDebounced();
    });
    tagCloud.appendChild(btn);
  });
}

function renderTagResults() {
  tagResults.innerHTML = "";
  if (!activeTag) {
    tagMeta.textContent = "Choose a tag to see matching sections.";
    return;
  }
  const matches = nodes.filter(n => (n.tags || []).includes(activeTag));
  tagMeta.textContent = `${activeTag}: ${matches.length} section${matches.length === 1 ? "" : "s"}`;
  matches.forEach(n => tagResults.appendChild(makeCard(n, () => jumpToNode(n.id))));
}

function rebuildTagUI() {
  tagAllBtn.classList.toggle("active", !activeTag);
  renderTagCloud(allTags(), tagsCountMap());
  renderTagResults();
}

function rebuildTagUIDebounced() {
  if (tagTimer) clearTimeout(tagTimer);
  tagTimer = setTimeout(() => { tagTimer = null; if (activeTab === "tags") rebuildTagUI(); }, 150);
}

// \u2500\u2500 Search results tab \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
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
  nodes.filter(n => matchSet.has(n.id))
       .forEach(n => searchResults.appendChild(makeCard(n, () => jumpToNode(n.id))));
}

function makeCard(n, onClick) {
  const card  = document.createElement("div");
  card.className = "tagcard";
  card.title     = "Tap to jump to this section in Structure view";
  card.addEventListener("click", onClick);

  const top = document.createElement("div"); top.className = "toph";
  const lvl = document.createElement("span"); lvl.className = "lvl"; lvl.textContent = `H${n.level}`;
  const ttl = document.createElement("span"); ttl.className = "titleline";
  ttl.textContent = n.title || "(untitled)";
  top.append(lvl, ttl);

  const p = document.createElement("div"); p.className = "preview";
  p.textContent = firstSentence(bodyWithoutTagLines(n.body)) || "(No body text.)";

  const subtags = document.createElement("div"); subtags.className = "subtags";
  (n.tags || []).slice(0, 12).forEach(t => {
    const pill = document.createElement("span"); pill.className = "tagpill";
    pill.textContent = t;
    subtags.appendChild(pill);
  });

  card.append(top, p, subtags);
  return card;
}

function jumpToNode(id) {
  setTab("structure");
  const idx = indexById(id);
  if (idx >= 0 && nodes[idx].level > maxVisibleLevel) {
    maxVisibleLevel = 6; selMax.value = "6";
  }
  renderStructure();
  requestAnimationFrame(() => {
    const entry = domCache.get(id);
    if (entry?.el) {
      entry.el.scrollIntoView({ behavior: "smooth", block: "center" });
      entry.titleTA.focus();
    }
  });
}

// \u2500\u2500 Change triggers \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// Full structural change: recompute matches + re-render + save
function markChangedFull() {
  setCopiedFlag(false);
  rebuildMatches();   // calls renderStructure internally
  rebuildTagUI();
  saveDebounced();
}

// Typing-only change: badges + debounced match check + save (no render)
function markChangedTyping() {
  setCopiedFlag(false);
  if (searchQuery.trim()) rebuildMatchesDebounced();
  rebuildTagUIDebounced();
  saveDebounced();
}

// \u2500\u2500 Outline actions \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
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
  familyIndices(idx).forEach(i => {
    nodes[i].level = clamp(nodes[i].level + delta, 1, 6);
  });
  markChangedFull();
}

function addNewAfter(idOrNull) {
  const newNode = { id: uid(), level: 1, title: "", body: "",
                    isCollapsed: false, showBody: false, tags: [] };
  if (!nodes.length || !idOrNull) {
    nodes.push(newNode);
  } else {
    const idx = indexById(idOrNull);
    if (idx < 0) return;
    newNode.level = nodes[idx].level;
    const fam = familyIndices(idx);
    nodes.splice(fam[fam.length - 1] + 1, 0, newNode);
  }
  lastCreatedId = newNode.id;
  markChangedFull();
}

function duplicateBranch(id) {
  const idx = indexById(id);
  if (idx < 0) return;
  const fam    = familyIndices(idx);
  const clones = fam.map(i => ({ ...nodes[i], id: uid(),
                                 tags: [...(nodes[i].tags || [])] }));
  nodes.splice(fam[fam.length - 1] + 1, 0, ...clones);
  lastCreatedId = clones[0].id;
  markChangedFull();
}

function deleteBranch(id) {
  const idx = indexById(id);
  if (idx < 0) return;
  if (!confirm("Delete this heading and its children?")) return;
  const fam = familyIndices(idx);
  nodes.splice(idx, fam.length);
  if (sourceId && !nodes.some(n => n.id === sourceId)) sourceId = null;
  markChangedFull();
}

function toggleMove(id) {
  if (!sourceId)       { sourceId = id;   renderStructure(); return; }
  if (sourceId === id) { sourceId = null;  renderStructure(); return; }

  const movingIds = new Set(familyIds(sourceId));
  if (movingIds.has(id)) { sourceId = null; renderStructure(); return; }

  const movingNodes = nodes.filter(n => movingIds.has(n.id));
  nodes = nodes.filter(n => !movingIds.has(n.id));

  const targetIdx = indexById(id);
  if (targetIdx < 0) {
    nodes.push(...movingNodes);
  } else {
    const tFam = familyIndices(targetIdx);
    nodes.splice(tFam[tFam.length - 1] + 1, 0, ...movingNodes);
  }
  sourceId = null;
  markChangedFull();
}

function setMaxLevel(level) {
  maxVisibleLevel = clamp(level, 1, 6);
  selMax.value    = String(maxVisibleLevel);
  markChangedFull();
}

// \u2500\u2500 Tabs \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
function setTab(tab) {
  activeTab = ["structure","search","tags"].includes(tab) ? tab : "structure";

  [["structure", btnTabStructure, panelStructure],
   ["search",    btnTabSearch,    panelSearch],
   ["tags",      btnTabTags,      panelTags]].forEach(([t, btn, panel]) => {
    btn.classList.toggle("active", activeTab === t);
    btn.setAttribute("aria-selected", activeTab === t ? "true" : "false");
    panel.classList.toggle("active", activeTab === t);
  });

  if (activeTab === "tags")   rebuildTagUI();
  if (activeTab === "search") renderSearchResults();
  saveDebounced();
}

// \u2500\u2500 Event listeners \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
btnTabStructure.addEventListener("click", () => setTab("structure"));
btnTabSearch   .addEventListener("click", () => setTab("search"));
btnTabTags     .addEventListener("click", () => setTab("tags"));
tagAllBtn      .addEventListener("click", () => {
  activeTag = ""; rebuildTagUI(); saveDebounced();
});

// Move-target clicks: delegated to canvas so we don't need per-node listeners
canvas.addEventListener("click", e => {
  const node = e.target.closest('.node[data-is-target="1"]');
  if (!node) return;
  const id = node.getAttribute("data-node-id");
  if (id) toggleMove(id);
});

btnLoad.addEventListener("click", () => {
  const text = taInput.value || "";
  if (!text.trim()) return;
  nodes = parseMarkdown(text);
  sourceId = null;
  domCache.forEach(e => { if (e.el.parentNode) e.el.remove(); });
  domCache.clear(); heightMap.clear(); visibleArr = [];
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
  if (ok) setCopiedFlag(true); else alert("Copy failed.");
  saveDebounced();
});

btnReset.addEventListener("click", () => {
  if (!confirm("Reset everything (including saved state for this app instance)?")) return;
  nodes = []; sourceId = null; taInput.value = "";
  maxVisibleLevel = 6; searchQuery = "";
  matchIds = []; matchPos = -1; activeTag = "";
  setCopiedFlag(false);
  try { localStorage.removeItem(KEY); } catch {}
  domCache.forEach(e => { if (e.el.parentNode) e.el.remove(); });
  domCache.clear(); heightMap.clear(); visibleArr = [];
  topSpacer.style.height = "0"; botSpacer.style.height = "0";
  rebuildTagUI(); rebuildMatchesNoRender(); renderSearchResults();
  saveDebounced();
});

btnAddTop.addEventListener("click", () => addNewAfter(null));

selMax   .addEventListener("change", () => setMaxLevel(parseInt(selMax.value, 10)));
btnLvl1  .addEventListener("click",  () => setMaxLevel(1));
btnLvl2  .addEventListener("click",  () => setMaxLevel(2));
btnLvl3  .addEventListener("click",  () => setMaxLevel(3));
btnLvlAll.addEventListener("click",  () => setMaxLevel(6));

inSearch.addEventListener("input", () => {
  searchQuery = inSearch.value || "";
  rebuildMatches();
  if (activeTab === "search") renderSearchResults();
  saveDebounced();
});

cbBody.addEventListener("change", () => {
  searchInBody = !!cbBody.checked;
  rebuildMatches();
  if (activeTab === "search") renderSearchResults();
  saveDebounced();
});

cbReveal.addEventListener("change", () => {
  revealMatches = !!cbReveal.checked;
  renderStructure();
  saveDebounced();
});

btnPrev.addEventListener("click", () => jumpMatch(-1));
btnNext.addEventListener("click", () => jumpMatch(+1));

inSearch.addEventListener("keydown", e => {
  if (e.key === "Enter") { e.preventDefault(); jumpMatch(e.shiftKey ? -1 : 1); }
  if (e.key === "Escape") {
    e.preventDefault();
    searchQuery = ""; matchIds = []; matchPos = -1;
    inSearch.value = ""; updateCount();
    renderStructure(); renderSearchResults(); saveDebounced();
  }
});

taInput.addEventListener("input", () => { setCopiedFlag(false); saveDebounced(); });

// \u2500\u2500 Init \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
loadPref();
setCopiedFlag(copiedSinceChange);

selMax.value     = String(maxVisibleLevel);
inSearch.value   = searchQuery;
cbBody.checked   = searchInBody;
cbReveal.checked = revealMatches;

badgeSave.className   = "badge good badgeSave";
badgeSave.textContent = "Saved \u2713";

rebuildMatches();
rebuildTagUI();
setTab(activeTab || "structure");
saveDebounced();
```

});
})();
