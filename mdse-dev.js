(() => {
“use strict”;

// –– SiteApps registry ––
window.SiteApps = window.SiteApps || {};
window.SiteApps.registry = window.SiteApps.registry || {};
window.SiteApps.register =
window.SiteApps.register ||
function (name, initFn) {
window.SiteApps.registry[name] = initFn;
};

const STYLE_ID = “siteapps-mdse-style”;

function ensureStyle() {
let style = document.getElementById(STYLE_ID);
if (!style) {
style = document.createElement(“style”);
style.id = STYLE_ID;
document.head.appendChild(style);
}

```
style.textContent = `
```

[data-app=“mdse”] {
font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
width: min(100%, 1280px);
margin: 14px auto;
border: 2px solid #111;
border-radius: 16px;
padding: 18px;
background: #fff;
color: #111;
display: block;
}
[data-app=“mdse”], [data-app=“mdse”] * { box-sizing: border-box; }
[data-app=“mdse”] h3 { margin: 0 0 10px; font-size: 18px; }
[data-app=“mdse”] .muted { color: #444; font-size: 13px; font-weight: 700; }

/* Inputs & Form Elements */
[data-app=“mdse”] textarea, [data-app=“mdse”] input, [data-app=“mdse”] select {
border: 2px solid #111;
border-radius: 12px;
padding: 12px;
font-size: 16px;
line-height: 1.35;
background: #fbfbfb;
color: #111;
}
[data-app=“mdse”] .mdInput {
display: block;
width: 100%;
max-height: 400px;
overflow-y: auto;
margin-bottom: 12px;
resize: vertical;
}

/* Buttons */
[data-app=“mdse”] button {
border: 2px solid #111;
border-radius: 999px;
padding: 8px 14px;
font-weight: 800;
font-size: 13px;
background: #fff;
color: #111;
cursor: pointer;
transition: transform 0.1s;
}
[data-app=“mdse”] button.primary { background: #111; color: #fff; }
[data-app=“mdse”] button.warn { border-color: #a00; color: #a00; background: #fffafa; }
[data-app=“mdse”] button:hover { opacity: 0.85; }
[data-app=“mdse”] button:active { transform: scale(0.96); }
[data-app=“mdse”] .btnrow {
display: flex; gap: 10px; flex-wrap: wrap; align-items: center; margin: 12px 0;
}

[data-app=“mdse”] textarea:not(.title) { width: 100%; }
[data-app=“mdse”] textarea:focus, [data-app=“mdse”] button:focus,
[data-app=“mdse”] select:focus, [data-app=“mdse”] input:focus {
outline: 3px solid rgba(11,95,255,.35);
outline-offset: 2px;
}

/* Header & Layout */
[data-app=“mdse”] .hdr {
display: flex !important;
flex-wrap: wrap;
align-items: center;
gap: 10px;
width: 100% !important;
margin-bottom: 8px;
}
[data-app=“mdse”] .title {
flex: 1 1 100%;
width: 100% !important;
display: block;
border: 2px solid rgba(0,0,0,.15);
border-radius: 12px;
padding: 12px 14px;
font-size: 17px;
font-weight: 1000;
resize: none;
overflow: hidden;
background: #fbfbfb;
margin-top: 5px;
}

/* Tabs */
[data-app=“mdse”] .tabs { display: flex; gap: 10px; flex-wrap: wrap; margin: 6px 0 10px; }
[data-app=“mdse”] .tabbtn {
border: 2px solid #111; border-radius: 999px; padding: 8px 12px;
font-weight: 1000; background: #fff; cursor: pointer;
}
[data-app=“mdse”] .tabbtn.active { background: #111; color: #fff; }
[data-app=“mdse”] .tabPanel { display: none; width: 100%; }
[data-app=“mdse”] .tabPanel.active { display: block; }

/* Status Header & Badges */
[data-app=“mdse”] .status-header {
display: flex; justify-content: flex-end; margin-bottom: 12px;
padding-bottom: 8px; border-bottom: 1px solid rgba(0,0,0,0.05);
}
[data-app=“mdse”] .badges { display: flex; gap: 8px; }
[data-app=“mdse”] .badge.good { background: #eefbee; color: #2b7a2e; border: 1px solid #2b7a2e; }
[data-app=“mdse”] .badge.warn { background: #fff5f5; color: #c00; border: 1px solid #c00; }
[data-app=“mdse”] .badge.dim  { background: #f9f9f9; color: #666; border: 1px solid #ccc; }

/* Search & Tag Result Cards */
[data-app=“mdse”] .tagcard {
display: block !important; width: 100%;
border: 2px solid #111; border-radius: 12px;
padding: 14px; margin-bottom: 12px;
background: #fdfdfd; cursor: pointer;
transition: transform 0.1s ease, box-shadow 0.1s ease;
}
[data-app=“mdse”] .tagcard:hover {
background: #f0f7ff; transform: translateY(-2px);
border-color: #0b5fff; box-shadow: 0 4px 12px rgba(11, 95, 255, 0.1);
}
[data-app=“mdse”] .tagcard .toph {
display: flex; align-items: center; gap: 10px; margin-bottom: 8px;
}
[data-app=“mdse”] .tagcard .lvl {
background: #111; color: #fff; font-weight: 800;
font-size: 11px; padding: 2px 6px; border-radius: 6px; text-transform: uppercase;
}
[data-app=“mdse”] .tagcard .titleline { font-weight: 700; font-size: 15px; color: #111; }
[data-app=“mdse”] .tagcard .preview {
font-size: 13px; color: #555; line-height: 1.4;
display: -webkit-box; -webkit-line-clamp: 2;
-webkit-box-orient: vertical; overflow: hidden;
}
[data-app=“mdse”] .tagcard .subtags { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 10px; }
[data-app=“mdse”] .tagcard .tagpill {
font-size: 10px; font-weight: 700; background: #eee;
padding: 2px 6px; border-radius: 4px; border: 1px solid #ccc; color: #444;
}

/* Tag bar */
[data-app=“mdse”] .tagbar {
display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin: 8px 0;
}
[data-app=“mdse”] .tagbar .spacer { flex: 1 1 auto; }

/* Pills */
[data-app=“mdse”] .pill {
border: 2px solid #111; border-radius: 12px; padding: 8px 10px;
font-weight: 900; font-size: 13px; background: #fff; user-select: none;
}
[data-app=“mdse”] .hdr .pill { padding: 4px 8px; font-size: 12px; border-radius: 10px; }
[data-app=“mdse”] .hdr .pill:not(.gray) { padding: 4px 12px; font-size: 13px; border: 3px solid #111; }
[data-app=“mdse”] .hdr .pill.gray {
padding: 2px 6px; font-size: 12px; border: 2px solid rgba(0,0,0,.35);
background: #fff; min-width: 28px; text-align: center;
}

/* Tools */
[data-app=“mdse”] .tools {
display: flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end;
align-items: flex-start; margin-top: 10px; padding-top: 10px;
border-top: 2px solid rgba(0,0,0,.08);
}
[data-app=“mdse”] .miniTools {
display: flex; gap: 6px; align-items: center;
justify-content: flex-end; white-space: nowrap;
}
[data-app=“mdse”] .miniBtn {
border: 2px solid rgba(0,0,0,.15); border-radius: 10px;
padding: 4px 6px; font-weight: 1000; font-size: 11px;
line-height: 1; background: #fff;
}

/* Nodes */
[data-app=“mdse”] .node {
width: 100%; display: block; background: #fff;
border: 2px solid rgba(0,0,0,.15); border-radius: 14px;
padding: 12px; margin: 10px 0;
}
[data-app=“mdse”] .node.activeNode { border-color: rgba(11,95,255,.45); box-shadow: 0 8px 22px rgba(11,95,255,.08); }
[data-app=“mdse”] .node.activeNode .tools { display: flex !important; }
[data-app=“mdse”] .node .tools { display: none !important; }

[data-app=“mdse”] .node.level-1 { padding-left: 12px; }
[data-app=“mdse”] .node.level-2 { padding-left: 32px; border-left: 4px solid #eee; }
[data-app=“mdse”] .node.level-3 { padding-left: 52px; border-left: 4px solid #ddd; }
[data-app=“mdse”] .node.level-4 { padding-left: 72px; border-left: 4px solid #ccc; }
[data-app=“mdse”] .node.level-5 { padding-left: 92px; border-left: 4px solid #bbb; }
[data-app=“mdse”] .node.level-6 { padding-left: 112px; border-left: 4px solid #aaa; }

[data-app=“mdse”] .node .body { display: none; width: 100%; margin-top: 10px; }
[data-app=“mdse”] .node .body.show { display: block; }
[data-app=“mdse”] .node textarea { width: 100%; display: block; }
[data-app=“mdse”] .node.activeNode { border-left-color: #0b5fff !important; }
[data-app=“mdse”] .node.movingSource { background: #fff9c4; border: 2px dashed #fbc02d; opacity: 0.8; }
[data-app=“mdse”] .node.moveTarget { border: 2px dashed #4caf50; cursor: alias; }
[data-app=“mdse”] .node.moveTarget:hover { background: #e8f5e9; }

@media (max-width: 768px) {
[data-app=“mdse”] { width: 100%; padding: 10px; }
}
`;
}

// –– Utilities ––
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const uid = () => `n_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;

function debounce(fn, ms) {
let timer = null;
const wrapper = (…args) => {
if (timer) clearTimeout(timer);
timer = setTimeout(() => { timer = null; fn(…args); }, ms);
};
wrapper.cancel = () => { if (timer) { clearTimeout(timer); timer = null; } };
wrapper.pending = () => timer !== null;
return wrapper;
}

function makeRafScheduler(renderFn) {
let queued = false;
return () => {
if (queued) return;
queued = true;
requestAnimationFrame(() => { queued = false; renderFn(); });
};
}

// DOM helper — drastically reduces createElement boilerplate
function el(tag, attrs, children) {
const e = document.createElement(tag);
if (attrs) {
for (const [k, v] of Object.entries(attrs)) {
if (k === “class”) e.className = v;
else if (k === “text”) e.textContent = v;
else if (k === “html”) e.innerHTML = v;
else if (k.startsWith(“on”)) e.addEventListener(k.slice(2), v);
else if (k === “disabled”) e.disabled = !!v;
else e.setAttribute(k, v);
}
}
if (children) {
if (!Array.isArray(children)) children = [children];
for (const c of children) {
if (typeof c === “string”) e.appendChild(document.createTextNode(c));
else if (c) e.appendChild(c);
}
}
return e;
}

function autoResizeTA(ta) {
if (!ta || (ta.classList && ta.classList.contains(“mdInput”))) return;
ta.style.height = “auto”;
if (ta.scrollHeight > 0) ta.style.height = (ta.scrollHeight + 2) + “px”;
}

function downloadFile(filename, content, mimeType = “text/plain;charset=utf-8”) {
const blob = new Blob([content], { type: mimeType });
const url = URL.createObjectURL(blob);
const a = el(“a”, { href: url, download: filename });
document.body.appendChild(a);
a.click();
a.remove();
setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function slugifyFilename(s) {
return (s || “outline”).toLowerCase().trim()
.replace(/[^\w\s-]/g, “”).replace(/\s+/g, “-”)
.replace(/-+/g, “-”).replace(/^-|-$/g, “”) || “outline”;
}

function safeJsonParse(s) {
try { return JSON.parse(s); } catch { return null; }
}

function storageKey(container) {
const k = container.getAttribute(“data-storage-key”);
return `siteapps:mdse:${(k && k.trim()) || location.pathname || "/"}`;
}

async function copyText(text) {
try {
await navigator.clipboard.writeText(text);
return true;
} catch {
try {
const ta = el(“textarea”);
ta.value = text;
Object.assign(ta.style, { position: “fixed”, left: “-9999px”, top: “0” });
document.body.appendChild(ta);
ta.focus();
ta.select();
const ok = document.execCommand(“copy”);
ta.remove();
return !!ok;
} catch { return false; }
}
}

// –– Tag parsing ––
const TAG_LINE_RE = /^\s*\?%%\s*tag\s+(.*)\s*$/i;

function normaliseTag(t) {
return (t || “”).trim().replace(/\s+/g, “ “).toLowerCase();
}

function extractTagsFromBody(bodyText) {
const tags = [];
for (const line of (bodyText || “”).split(”\n”)) {
const m = line.match(TAG_LINE_RE);
if (!m) continue;
let chunk = (m[1] || “”).trim();
if (!chunk) continue;
if (chunk.toLowerCase().startsWith(“tags:”)) {
chunk = chunk.slice(chunk.indexOf(”:”) + 1);
}
for (const p of chunk.split(”,”)) {
const nt = normaliseTag(p);
if (nt) tags.push(nt);
}
}
return […new Set(tags)];
}

function bodyWithoutTagLines(bodyText) {
return (bodyText || “”).split(”\n”)
.filter((line) => !TAG_LINE_RE.test(line))
.join(”\n”).trim();
}

function firstSentence(text) {
const s = (text || “”).trim();
if (!s) return “”;
const m = s.match(/^[\s\S]*?[.!?](?=\s|$)/);
if (m && m[0]) return m[0].trim();
return (s.split(”\n”).find((x) => x.trim()) || “”).trim();
}

// –– Core app ––
window.SiteApps.register(“mdse”, (container) => {
ensureStyle();
const KEY = storageKey(container);

```
// State
let nodes = [];
let sourceId = null;
let lastCreatedId = null;
let maxVisibleLevel = 6;
let pendingScrollToId = "";
let suppressNextScrollRestore = false;
let copiedSinceChange = false;
let lastCopyAt = null;

// Search state
let searchQuery = "";
let searchInBody = false;
let revealMatches = true;
let matchIds = [];
let matchPos = -1;

// Tab / Tags
let activeTab = "structure";
let activeTag = "";
let activeNodeId = "";

// Undo
const UNDO_LIMIT = 10;
let undoStack = [];

// Schedulers
const scheduleRenderStructure = makeRafScheduler(() => renderStructure());
const scheduleRenderTagCloud = makeRafScheduler(() => renderTagCloud());
const scheduleRenderTagResults = makeRafScheduler(() => renderTagResults());
const scheduleRenderSearchResults = makeRafScheduler(() => renderSearchResults());

// ---- Outline helpers ----
function indexById(id) { return nodes.findIndex((n) => n.id === id); }

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
  return idx < 0 ? [] : familyIndices(idx).map((i) => nodes[i].id);
}

// Compute all per-node metrics in a single pass (avoids repeated familyIndices calls)
function computeNodeMetrics() {
  const metrics = new Map();
  for (let i = 0; i < nodes.length; i++) {
    const fam = familyIndices(i);
    const pLevel = nodes[i].level;
    let directChildren = 0;
    let wordCount = 0;
    for (const j of fam) {
      const n = nodes[j];
      if (j !== i && n.level === pLevel + 1) directChildren++;
      wordCount += countWords(n.title) + countWords(n.body);
    }
    metrics.set(nodes[i].id, {
      hasChildren: fam.length > 1,
      directChildren,
      subtreeCount: fam.length - 1,
      wordCount,
      familyEnd: fam[fam.length - 1],
    });
  }
  return metrics;
}

function directChildIndices(parentIdx) {
  const out = [];
  if (parentIdx < 0 || parentIdx >= nodes.length) return out;
  const pLevel = nodes[parentIdx].level;
  for (let i = parentIdx + 1; i < nodes.length; i++) {
    const lvl = nodes[i].level;
    if (lvl <= pLevel) break;
    if (lvl === pLevel + 1) out.push(i);
  }
  return out;
}

// ---- Word count ----
function countWords(text) {
  if (!text) return 0;
  return text.split("\n")
    .filter((line) => !line.trim().startsWith("%% tag"))
    .join(" ").trim().split(/\s+/).filter(Boolean).length;
}

// ---- Tag line manipulation ----
function normaliseNewlines(s) {
  return (s || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function hasExactTagLine(body, payload) {
  const want = (payload || "").trim().toLowerCase();
  if (!want) return false;
  return normaliseNewlines(body).split("\n").some((ln) => {
    const m = ln.match(TAG_LINE_RE);
    return m && (m[1] || "").trim().toLowerCase() === want;
  });
}

function addTagLineToBody(body, payload) {
  const want = (payload || "").trim();
  if (!want) return body || "";
  const b = normaliseNewlines(body || "").trimEnd();
  if (hasExactTagLine(b, want)) return b;
  return (b ? b + "\n" : "") + `%% tag ${want}`;
}

function removeTagLineFromBody(body, payload) {
  const want = (payload || "").trim().toLowerCase();
  if (!want) return body || "";
  return normaliseNewlines(body || "").split("\n")
    .filter((ln) => {
      const m = ln.match(TAG_LINE_RE);
      return !m || (m[1] || "").trim().toLowerCase() !== want;
    }).join("\n").trimEnd();
}

function titleToTag(title) {
  return (title || "").trim().toLowerCase()
    .replace(/[^a-z0-9\s:-]/g, "").replace(/\s+/g, "-");
}

function bulkTagDirectChildren(parentId, payload, mode) {
  pushUndo("bulk tag");
  const parentIdx = indexById(parentId);
  if (parentIdx < 0) return;
  const childIdxs = directChildIndices(parentIdx);
  if (!childIdxs.length) { alert("No direct children under this heading."); return; }
  const fn = mode === "remove" ? removeTagLineFromBody : addTagLineToBody;
  childIdxs.forEach((i) => {
    nodes[i].body = fn(nodes[i].body || "", payload);
    nodes[i].tags = extractTagsFromBody(nodes[i].body);
    nodes[i].showBody = true;
  });
  markChangedFull();
}

// ---- Undo ----
function snapshotNodes() { return JSON.stringify(nodes); }

function restoreNodes(snapshot) {
  const arr = safeJsonParse(snapshot);
  if (!Array.isArray(arr)) return false;
  nodes = arr.filter((n) => n && typeof n === "object").map((n) => {
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
  if (sourceId && !nodes.some((n) => n.id === sourceId)) sourceId = null;
  if (activeNodeId && !nodes.some((n) => n.id === activeNodeId)) activeNodeId = "";
  return true;
}

function pushUndo(label) {
  undoStack.push({ label: label || "", snap: snapshotNodes() });
  if (undoStack.length > UNDO_LIMIT) undoStack.shift();
}

function undo() {
  if (!undoStack.length) return;
  const prev = undoStack.pop();
  if (!restoreNodes(prev.snap)) return;
  setCopiedFlag(false);
  rebuildMatchesNoRender();
  if (activeTab === "tags") rebuildTagUI();
  if (activeTab === "search") scheduleRenderSearchResults();
  scheduleRenderStructure();
  saveDebounced();
}

// ---- Search ----
const norm = (s) => (s || "").toLowerCase();

function nodeMatches(n, q) {
  if (!q) return false;
  const qq = norm(q);
  return norm(n.title).includes(qq) || (searchInBody && norm(n.body).includes(qq));
}

function nodeMatchesBodyOnly(n, q) {
  if (!q || !searchInBody) return false;
  const qq = norm(q);
  return !norm(n.title).includes(qq) && norm(n.body).includes(qq);
}

function updateCount() {
  if (!searchQuery.trim()) { countEl.textContent = ""; return; }
  if (!matchIds.length) { countEl.textContent = "0 matches"; return; }
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

const rebuildMatchesDebounced = debounce(() => rebuildMatchesNoRender(), 150);

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
  const nodeEl = canvas.querySelector(`[data-node-id="${id}"]`);
  if (nodeEl) {
    nodeEl.scrollIntoView({ behavior: "smooth", block: "center" });
    const t = nodeEl.querySelector(".title");
    if (t) t.focus();
  }
}

// ---- Tags view ----
function tagsCountMap() {
  const m = new Map();
  nodes.forEach((n) => (n.tags || []).forEach((t) => m.set(t, (m.get(t) || 0) + 1)));
  return m;
}

function allTags() {
  return [...tagsCountMap().keys()].sort((a, b) => a.localeCompare(b));
}

// ---- Shared card builder (used by Tags + Search) ----
function buildCard(n, onClick, showTags) {
  const cleaned = bodyWithoutTagLines(n.body);
  const preview = firstSentence(cleaned);

  const card = el("div", {
    class: "tagcard",
    title: "Tap to jump to this section in Structure view",
    onclick: () => onClick(n.id),
  }, [
    el("div", { class: "toph" }, [
      el("span", { class: "lvl", text: `H${n.level}` }),
      el("span", { class: "titleline", text: n.title || "(untitled)" }),
    ]),
    el("div", { class: "preview", text: preview || "(No body text.)" }),
  ]);

  if (showTags && n.tags && n.tags.length) {
    const subtags = el("div", { class: "subtags" });
    n.tags.slice(0, 12).forEach((t) => {
      subtags.appendChild(el("span", { class: "tagpill", text: t }));
    });
    card.appendChild(subtags);
  }
  return card;
}

function renderTagCloud() {
  const counts = tagsCountMap();
  const tags = [...counts.keys()].sort((a, b) => a.localeCompare(b));
  tagCloud.innerHTML = "";

  if (!tags.length) {
    tagCloud.innerHTML = `<span class="tagmeta">No tags found yet. Add lines like <b>%% tag arc:escape</b> inside a section's body.</span>`;
    return;
  }
  tags.forEach((t) => {
    tagCloud.appendChild(el("button", {
      type: "button",
      class: "tagchip" + (activeTag === t ? " active" : ""),
      text: `${t} (${counts.get(t) || 0})`,
      onclick: () => { activeTag = activeTag === t ? "" : t; rebuildTagUI(); saveDebounced(); },
    }));
  });
}

function renderTagResults() {
  tagResults.innerHTML = "";
  if (!activeTag) {
    tagMeta.textContent = "Choose a tag to see matching sections (in manuscript order).";
    return;
  }
  const matches = nodes.filter((n) => (n.tags || []).includes(activeTag));
  tagMeta.textContent = `${activeTag}: ${matches.length} section${matches.length === 1 ? "" : "s"}`;
  matches.forEach((n) => tagResults.appendChild(buildCard(n, jumpToNode, true)));
}

function rebuildTagUI() {
  tagAllBtn.classList.toggle("active", !activeTag);
  scheduleRenderTagCloud();
  scheduleRenderTagResults();
}

const rebuildTagUIDebounced = debounce(() => {
  if (activeTab === "tags") rebuildTagUI();
}, 150);

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
  nodes.filter((n) => matchSet.has(n.id))
    .forEach((n) => searchResults.appendChild(buildCard(n, jumpToNode, false)));
}

function jumpToNode(id) {
  setTab("structure");
  const idx = indexById(id);
  if (idx >= 0 && nodes[idx].level > maxVisibleLevel) {
    maxVisibleLevel = 6;
    selMax.value = "6";
  }
  activeNodeId = id;
  pendingScrollToId = id;
  suppressNextScrollRestore = true;
  scheduleRenderStructure();
}

// ---- Persistence ----
function setCopiedFlag(flag) {
  copiedSinceChange = !!flag;
  if (copiedSinceChange) lastCopyAt = new Date().toISOString();
  badgeCopy.className = "badge " + (copiedSinceChange ? "good" : "warn");
  badgeCopy.textContent = copiedSinceChange ? "Copied ✓" : "Not copied";
  badgeCopy.title = copiedSinceChange && lastCopyAt ? `Last copied: ${lastCopyAt}` : "";
}

function saveNow() {
  setTimeout(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify({
        v: 6, nodes, input: taInput.value, sourceId, maxVisibleLevel,
        copiedSinceChange, lastCopyAt, searchQuery, searchInBody,
        revealMatches, activeTab, activeTag,
      }));
      badgeSave.className = "badge good badgeSave";
      badgeSave.textContent = "Saved ✓";
    } catch (err) {
      console.error("Storage failed:", err);
      badgeSave.className = "badge warn badgeSave";
      badgeSave.textContent = "Not saved";
    }
  }, 0);
}

const saveDebounced = debounce(() => saveNow(), 500);
// Override to show unsaved state immediately
const _saveDebouncedOrig = saveDebounced;
const saveDebouncedWithBadge = (...args) => {
  badgeSave.className = "badge dim badgeSave";
  badgeSave.textContent = "Unsaved…";
  _saveDebouncedOrig(...args);
};
// We'll just inline the badge update in markChanged* instead.
// Keep saveDebounced as-is; badge logic below.

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

  nodes = nodes.filter((n) => n && typeof n === "object").map((n) => {
    const body = typeof n.body === "string" ? n.body : "";
    return {
      id: typeof n.id === "string" ? n.id : uid(),
      level: clamp(parseInt(n.level, 10) || 1, 1, 6),
      title: typeof n.title === "string" ? n.title : "",
      body,
      isCollapsed: !!n.isCollapsed,
      showBody: false,
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
    const headingMatch = line.match(/^(#{1,6})\s+(.*)/);
    if (headingMatch) {
      current = {
        id: uid(), level: headingMatch[1].length,
        title: headingMatch[2].trim() || "(Untitled)",
        body: "", isCollapsed: false, showBody: false, tags: [],
      };
      out.push(current);
    } else {
      if (!current && line.trim().length > 0) {
        current = {
          id: uid(), level: 1, title: "(Start / Preamble)",
          body: "", isCollapsed: false, showBody: true, tags: [],
        };
        out.push(current);
      }
      if (current) current.body += line + "\n";
    }
  }
  out.forEach((n) => { n.body = n.body.trim(); n.tags = extractTagsFromBody(n.body); });
  return out;
}

function toMarkdown() {
  return nodes.map((n) => {
    const head = "#".repeat(n.level) + " " + (n.title || "");
    const body = (n.body || "").trimEnd();
    return body ? head + "\n" + body : head;
  }).join("\n\n");
}

// ---- Clipboard paste as sibling ----
async function readClipboardTextFallback() {
  try { return await navigator.clipboard.readText(); }
  catch { return prompt("Clipboard read blocked. Paste the markdown here:", "") || ""; }
}

function normalizeClipboardToLevel(clip, targetLevel) {
  const text = String(clip || "").replace(/\r\n?/g, "\n").trim();
  if (!text) return "";

  const lines = text.split("\n");
  // Single pass: find first heading level AND transform
  let delta = null;
  return lines.map((ln) => {
    const m = ln.match(/^(#{1,6})(\s+.*)$/);
    if (!m) return ln;
    if (delta === null) delta = targetLevel - m[1].length;
    const lvl = clamp(m[1].length + delta, 1, 6);
    return "#".repeat(lvl) + m[2];
  }).join("\n").trimEnd();
}

async function pasteClipboardAsSiblingAfter(nodeId) {
  pushUndo("paste");
  const idx = indexById(nodeId);
  if (idx < 0) return;

  const clip = await readClipboardTextFallback();
  if (!clip.trim()) return;

  const adjusted = normalizeClipboardToLevel(clip, nodes[idx].level);
  if (!adjusted.trim()) return;

  const newNodes = parseMarkdown(adjusted);
  if (!newNodes.length) return;

  const fam = familyIndices(idx);
  nodes.splice(fam[fam.length - 1] + 1, 0, ...newNodes);
  lastCreatedId = newNodes[0].id;
  markChangedFull();
}

// ---- Actions ----
function showUnsaved() {
  badgeSave.className = "badge dim badgeSave";
  badgeSave.textContent = "Unsaved…";
}

function markChangedFull() {
  setCopiedFlag(false);
  showUnsaved();
  rebuildMatches();
  rebuildTagUI();
  saveDebounced();
}

function markChangedTyping() {
  setCopiedFlag(false);
  showUnsaved();
  if (searchQuery.trim()) rebuildMatchesDebounced();
  rebuildTagUIDebounced();
  saveDebounced();
}

// View-state toggles: no undo push (these aren't structural changes)
function toggleBranchCollapse(id) {
  const idx = indexById(id);
  if (idx < 0) return;
  nodes[idx].isCollapsed = !nodes[idx].isCollapsed;
  scheduleRenderStructure();
  saveDebounced();
}

function toggleBody(id) {
  const idx = indexById(id);
  if (idx < 0) return;
  nodes[idx].showBody = !nodes[idx].showBody;
  scheduleRenderStructure();
  saveDebounced();
}

function changeLevel(id, delta) {
  pushUndo("promote/demote");
  const idx = indexById(id);
  if (idx < 0) return;
  familyIndices(idx).forEach((i) => (nodes[i].level = clamp(nodes[i].level + delta, 1, 6)));
  markChangedFull();
}

function addNewAfter(idOrNull) {
  pushUndo("add");
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
  const newNode = { id: uid(), level: nodes[idx].level, title: "", body: "", isCollapsed: false, showBody: false, tags: [] };
  nodes.splice(fam[fam.length - 1] + 1, 0, newNode);
  lastCreatedId = newNode.id;
  markChangedFull();
}

function duplicateBranch(id) {
  pushUndo("duplicate");
  const idx = indexById(id);
  if (idx < 0) return;
  const fam = familyIndices(idx);
  const clones = fam.map((i) => ({
    id: uid(), level: nodes[i].level, title: nodes[i].title, body: nodes[i].body,
    isCollapsed: nodes[i].isCollapsed, showBody: nodes[i].showBody,
    tags: [...(nodes[i].tags || [])],
  }));
  nodes.splice(fam[fam.length - 1] + 1, 0, ...clones);
  lastCreatedId = clones[0].id;
  markChangedFull();
}

function deleteBranch(id) {
  pushUndo("delete");
  const idx = indexById(id);
  if (idx < 0) return;
  if (!confirm("Delete this heading and its children?")) return;
  const fam = familyIndices(idx);
  nodes.splice(idx, fam.length);
  if (sourceId && !nodes.some((n) => n.id === sourceId)) sourceId = null;
  markChangedFull();
}

function deleteAndPromoteChildren(id) {
  pushUndo("unwrap");
  const idx = indexById(id);
  if (idx < 0) return;
  const parent = nodes[idx];
  const L = parent.level;
  const tagPayload = parent.title.trim() ? "seq:" + titleToTag(parent.title) : "";

  for (let i = idx + 1; i < nodes.length; i++) {
    if (nodes[i].level <= L) break;
    if (tagPayload && nodes[i].level === L + 1) {
      nodes[i].body = addTagLineToBody(nodes[i].body || "", tagPayload);
      nodes[i].tags = extractTagsFromBody(nodes[i].body);
    }
    nodes[i].level = clamp(nodes[i].level - 1, 1, 6);
  }
  nodes.splice(idx, 1);
  markChangedFull();
}

function toggleMove(id) {
  pushUndo("move");
  if (!sourceId) { sourceId = id; scheduleRenderStructure(); return; }
  if (sourceId === id) { sourceId = null; scheduleRenderStructure(); return; }

  const movingIds = new Set(familyIds(sourceId));
  if (movingIds.has(id)) { sourceId = null; scheduleRenderStructure(); return; }

  const movingNodes = nodes.filter((n) => movingIds.has(n.id));
  nodes = nodes.filter((n) => !movingIds.has(n.id));

  const targetIdx = indexById(id);
  if (targetIdx < 0) {
    nodes.push(...movingNodes);
  } else {
    const targetFam = familyIndices(targetIdx);
    nodes.splice(targetFam[targetFam.length - 1] + 1, 0, ...movingNodes);
  }
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

  [btnTabStructure, btnTabSearch, btnTabTags].forEach((btn, i) => {
    const tabs = ["structure", "search", "tags"];
    btn.classList.toggle("active", activeTab === tabs[i]);
    btn.setAttribute("aria-selected", activeTab === tabs[i] ? "true" : "false");
  });
  [panelStructure, panelSearch, panelTags].forEach((p, i) => {
    p.classList.toggle("active", activeTab === ["structure","search","tags"][i]);
  });

  requestAnimationFrame(() => {
    const activePanel = container.querySelector(".tabPanel.active");
    const textareas = activePanel?.querySelectorAll("textarea:not(.mdInput)");
    if (textareas) textareas.forEach((ta) => autoResizeTA(ta));
  });

  if (activeTab === "tags") rebuildTagUI();
  if (activeTab === "search") scheduleRenderSearchResults();
}

// ---- Build UI ----
container.innerHTML = "";
container.setAttribute("data-app", "mdse");

container.innerHTML = `
```

<div class="topbar">
  <div class="status-header">
    <div class="badges">
      <span class="badge dim badgeSave">Saved ✓</span>
      <span class="badge warn badgeCopy">Not copied</span>
    </div>
  </div>
  <div class="left">
    <h3>Markdown Outline Utility &amp; Structure Editor</h3>
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
        <button class="btnUndo" type="button">↺ Undo</button>
        <button class="primary btnCopy" type="button">Copy Result</button>
        <button class="btnExport" type="button">Export .md</button>
        <button class="warn btnReset" type="button">Reset Everything</button>
        <button class="btnAddTop" type="button">+ Add H1</button>
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
      <div class="muted">Tags are read from lines starting with <b>%% tag</b> or <b>\\%% tag</b> inside each section's body.</div>
      <div class="tagbar">
        <button type="button" class="tagchip tagAll active">All tags</button>
        <span class="tagmeta tagMeta"></span>
        <span class="spacer"></span>
        <button type="button" class="btnCopyTags">Copy all tags</button>
      </div>
      <div class="tagbar tagCloud" aria-label="Tag list"></div>
      <div class="taglist tagResults" aria-live="polite"></div>
    </div>
  </div>
  <div class="footer">v6.0 — Optimised build</div>
</div>`;

```
const $ = (sel) => container.querySelector(sel);

// Tab buttons & panels
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
const selMax = $("#mdseMaxLevel");

// Search UI
const inSearch = $("#mdseSearch");
const cbBody = $("#mdseSearchBody");
const cbReveal = $("#mdseReveal");
const countEl = $("#mdseCount");
const searchResults = $(".searchResults");

// Tags UI
const tagMeta = $(".tagMeta");
const tagAllBtn = $(".tagAll");
const tagCloud = $(".tagCloud");
const tagResults = $(".tagResults");
const btnCopyTags = $(".btnCopyTags");

// ---- Render (Structure tab) ----
function renderStructure() {
  const scrollPos = window.scrollY;
  const shouldRestoreScroll = !suppressNextScrollRestore;
  suppressNextScrollRestore = false;

  selMax.value = String(maxVisibleLevel);
  canvas.innerHTML = "";

  const hiddenByCollapse = new Set();
  nodes.forEach((n, idx) => {
    if (n.isCollapsed) familyIndices(idx).slice(1).forEach((i) => hiddenByCollapse.add(i));
  });

  const movingSet = sourceId ? new Set(familyIds(sourceId)) : new Set();
  const revealSet = computeRevealSet();
  const matchSet = new Set(matchIds);
  const metrics = computeNodeMetrics();

  nodes.forEach((n, idx) => {
    if (n.level > maxVisibleLevel) return;
    if (hiddenByCollapse.has(idx) && !revealSet.has(n.id)) return;

    const isSource = sourceId === n.id;
    const isValidTarget = !!sourceId && !movingSet.has(n.id);
    const isMatch = searchQuery.trim() && matchSet.has(n.id);
    const isActive = isMatch && matchPos >= 0 && matchIds[matchPos] === n.id;
    const m = metrics.get(n.id);

    const classes = [
      "node", `level-${n.level}`,
      activeNodeId === n.id && "activeNode",
      isSource && "movingSource",
      isValidTarget && "moveTarget",
      n.isCollapsed && "collapsed",
      isMatch && "match",
      isActive && "activeMatch",
    ].filter(Boolean).join(" ");

    const stop = (e) => e.stopPropagation();

    // Title textarea
    const title = el("textarea", { class: "title", rows: "1" });
    title.value = (n.title || "").replace(/[\r\n]/g, " ");
    title.addEventListener("click", stop);
    title.addEventListener("keydown", (e) => { stop(e); if (e.key === "Enter") e.preventDefault(); });
    title.addEventListener("input", () => {
      const start = title.selectionStart;
      const end = title.selectionEnd;
      const cleaned = title.value.replace(/[\r\n]/g, " ");
      n.title = cleaned;
      if (title.value !== cleaned) {
        title.value = cleaned;
        title.setSelectionRange(start, end);
      }
      autoResizeTA(title);
      markChangedTyping();
    });

    // Mini tools (always visible)
    const miniHasBody = !!(n.body && n.body.trim());
    const miniTools = el("div", { class: "miniTools", onclick: stop }, [
      el("button", {
        type: "button",
        class: "miniBtn" + (miniHasBody ? " primary" : ""),
        title: miniHasBody ? (n.showBody ? "Hide text" : "Show text") : "Add text",
        text: "📝",
        onclick: (e) => { stop(e); toggleBody(n.id); },
      }),
      el("button", {
        type: "button", class: "miniBtn", title: "Add sibling after branch", text: "＋",
        onclick: (e) => { stop(e); addNewAfter(n.id); },
      }),
      el("button", {
        type: "button", class: "miniBtn", title: "Promote (H-1)", text: "←",
        disabled: n.level <= 1,
        onclick: (e) => { stop(e); if (n.level > 1) changeLevel(n.id, -1); },
      }),
      el("button", {
        type: "button", class: "miniBtn", title: "Demote (H+1)", text: "→",
        disabled: n.level >= 6,
        onclick: (e) => { stop(e); if (n.level < 6) changeLevel(n.id, +1); },
      }),
    ]);

    // Meta badge
    const metaText = m.subtreeCount > 0
      ? `(${m.directChildren},${m.subtreeCount} • ${m.wordCount.toLocaleString()}w)`
      : `(${m.directChildren},0 • ${m.wordCount}w)`;
    const meta = el("div", {
      class: "nodeMeta",
      text: metaText,
      title: `${m.directChildren} direct children, ${m.subtreeCount} total in subtree`,
    });

    // Header
    const hdr = el("div", { class: "hdr" }, [
      el("div", { class: "pill", text: `H${n.level}` }),
      el("div", {
        class: "pill gray",
        text: isSource ? "📍 PIN" : "⠿",
        title: "Pin branch to move",
        onclick: (e) => { stop(e); toggleMove(n.id); },
      }),
      el("div", {
        class: "pill gray",
        text: m.hasChildren ? (n.isCollapsed ? "▶" : "▼") : "•",
        title: m.hasChildren ? "Fold/unfold branch" : "No children",
        onclick: (e) => { stop(e); if (m.hasChildren) toggleBranchCollapse(n.id); },
      }),
      meta,
      miniTools,
      title,
    ]);

    // Full tools (shown when activeNode)
    const toolButtons = [
      el("button", { type: "button", text: "⧉ Duplicate", onclick: () => duplicateBranch(n.id) }),
      el("button", {
        type: "button", text: "📋 Paste",
        title: "Paste clipboard markdown as sibling after this branch",
        onclick: (e) => { e.preventDefault(); stop(e); pasteClipboardAsSiblingAfter(n.id); },
      }),
    ];

    if (n.level < 6) {
      toolButtons.push(
        el("button", {
          type: "button", text: `🏷 Tag H${n.level + 1}`,
          title: `Add a %% tag line to every direct H${n.level + 1} under this heading`,
          onclick: () => {
            const payload = prompt(`Add which tag to all H${n.level + 1} under "${n.title || "Untitled"}"?\n\nExample: arc holiday`, "arc holiday");
            if (payload) bulkTagDirectChildren(n.id, payload, "add");
          },
        }),
        el("button", {
          type: "button", text: `🧽 Untag H${n.level + 1}`,
          title: `Remove that exact %% tag line from every direct H${n.level + 1}`,
          onclick: () => {
            const payload = prompt(`Remove which tag from all H${n.level + 1} under "${n.title || "Untitled"}"?\n\nExample: arc holiday`, "arc holiday");
            if (payload) bulkTagDirectChildren(n.id, payload, "remove");
          },
        }),
        el("button", {
          type: "button", text: "⇪ Unwrap",
          title: "Delete this heading and promote its children",
          onclick: (e) => { stop(e); if (confirm("Delete this heading and promote its children?")) deleteAndPromoteChildren(n.id); },
        }),
      );
    }

    toolButtons.push(
      el("button", {
        type: "button", text: "✕", class: "warn",
        title: "Delete branch", onclick: () => deleteBranch(n.id),
      })
    );

    const tools = el("div", { class: "tools", onclick: stop }, toolButtons);

    // Body area
    const bodyShouldShow = n.showBody ||
      (revealMatches && searchQuery.trim() && nodeMatchesBodyOnly(n, searchQuery));

    const bodyTA = el("textarea", { rows: "6", wrap: "soft" });
    bodyTA.value = (n.body || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").trimEnd();
    ["keydown", "keypress", "keyup"].forEach((evt) => bodyTA.addEventListener(evt, stop));
    bodyTA.addEventListener("click", stop);
    bodyTA.addEventListener("input", () => {
      n.body = bodyTA.value;
      n.tags = extractTagsFromBody(n.body);
      markChangedTyping();
    });

    const bodyWrap = el("div", { class: "body" + (bodyShouldShow ? " show" : "") }, [bodyTA]);

    // Node container
    const node = el("div", { "data-node-id": n.id, class: classes }, [hdr, bodyWrap, tools]);
    node.addEventListener("click", (e) => {
      if (isValidTarget) { toggleMove(n.id); return; }
      activeNodeId = (activeNodeId === n.id) ? "" : n.id;
      scheduleRenderStructure();
    });

    canvas.appendChild(node);
    autoResizeTA(title);
    if (bodyShouldShow) setTimeout(() => autoResizeTA(bodyTA), 0);
  });

  if (shouldRestoreScroll) window.scrollTo(0, scrollPos);

  setCopiedFlag(copiedSinceChange);
  badgeSave.textContent = saveDebounced.pending() ? "Unsaved…" : "Saved ✓";

  if (lastCreatedId) {
    const nodeEl = canvas.querySelector(`[data-node-id="${lastCreatedId}"]`);
    if (nodeEl) { const t = nodeEl.querySelector(".title"); if (t) t.focus(); }
    lastCreatedId = null;
  }

  if (pendingScrollToId) {
    const targetId = pendingScrollToId;
    pendingScrollToId = "";
    requestAnimationFrame(() => {
      const nodeEl = canvas.querySelector(`[data-node-id="${targetId}"]`);
      if (!nodeEl) return;
      nodeEl.scrollIntoView({ behavior: "smooth", block: "start" });
      const t = nodeEl.querySelector(".title");
      if (t) t.focus();
      setTimeout(() => {
        const el2 = canvas.querySelector(`[data-node-id="${targetId}"]`);
        if (el2) el2.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    });
  }
}

// ---- Event wiring ----
btnTabStructure.addEventListener("click", () => setTab("structure"));
btnTabSearch.addEventListener("click", () => setTab("search"));
btnTabTags.addEventListener("click", () => setTab("tags"));

tagAllBtn.addEventListener("click", () => { activeTag = ""; rebuildTagUI(); saveDebounced(); });

btnCopyTags.addEventListener("click", async () => {
  const tags = allTags();
  if (!tags.length) { alert("No tags to copy yet."); return; }
  const ok = await copyText(tags.join("\n"));
  if (!ok) { alert("Copy failed."); return; }
  const oldText = btnCopyTags.textContent;
  btnCopyTags.textContent = "Copied ✓";
  setTimeout(() => { btnCopyTags.textContent = oldText; }, 1200);
});

$(".btnLoad").addEventListener("click", () => {
  const text = taInput.value || "";
  if (!text.trim()) return;
  nodes = parseMarkdown(text);
  sourceId = null;
  markChangedFull();
  refreshLayout();
});

$(".btnUpdate").addEventListener("click", () => { taInput.value = toMarkdown(); markChangedFull(); });
$(".btnUndo").addEventListener("click", () => undo());

$(".btnCopy").addEventListener("click", async () => {
  const md = toMarkdown();
  taInput.value = md;
  const ok = await copyText(md);
  if (ok) setCopiedFlag(true);
  else alert("Copy failed.");
  saveDebounced();
});

$(".btnExport").addEventListener("click", () => {
  const md = toMarkdown();
  taInput.value = md;
  const firstTitle = nodes.find((n) => (n.title || "").trim())?.title || "outline";
  downloadFile(`${slugifyFilename(firstTitle)}.md`, md, "text/markdown;charset=utf-8");
  setCopiedFlag(false);
  saveDebounced();
});

$(".btnReset").addEventListener("click", () => {
  if (!confirm("Reset everything (including saved state for this app instance)?")) return;
  nodes = []; sourceId = null; taInput.value = ""; maxVisibleLevel = 6;
  searchQuery = ""; matchIds = []; matchPos = -1; activeTag = "";
  setCopiedFlag(false);
  try { localStorage.removeItem(KEY); } catch {}
  saveDebounced();
  scheduleRenderStructure();
  rebuildTagUI();
  rebuildMatchesNoRender();
  scheduleRenderSearchResults();
});

$(".btnAddTop").addEventListener("click", () => addNewAfter(null));

selMax.addEventListener("change", () => setMaxLevel(parseInt(selMax.value, 10)));
$(".btnLvl1").addEventListener("click", () => setMaxLevel(1));
$(".btnLvl2").addEventListener("click", () => setMaxLevel(2));
$(".btnLvl3").addEventListener("click", () => setMaxLevel(3));
$(".btnLvlAll").addEventListener("click", () => setMaxLevel(6));

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

$(".btnPrev").addEventListener("click", () => jumpMatch(-1));
$(".btnNext").addEventListener("click", () => jumpMatch(+1));

inSearch.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    jumpMatch(e.shiftKey ? -1 : 1);
  }
  if (e.key === "Escape") {
    e.preventDefault();
    searchQuery = ""; matchIds = []; matchPos = -1; inSearch.value = "";
    updateCount();
    scheduleRenderStructure();
    scheduleRenderSearchResults();
    saveDebounced();
  }
});

taInput.addEventListener("input", () => { setCopiedFlag(false); saveDebounced(); });

canvas.addEventListener("click", (e) => {
  if (!e.target.closest || !e.target.closest(".node")) {
    activeNodeId = "";
    scheduleRenderStructure();
  }
});

// Global keyboard shortcuts
document.addEventListener("keydown", (e) => {
  const mod = e.metaKey || e.ctrlKey;
  if (mod && e.key.toLowerCase() === "z" && !e.shiftKey) {
    const tag = (e.target?.tagName || "").toLowerCase();
    if (tag !== "textarea" && tag !== "input") { e.preventDefault(); undo(); }
  }
});

// Layout refresh
function refreshLayout() {
  requestAnimationFrame(() => {
    container.style.width = "";
    void container.getBoundingClientRect();
    requestAnimationFrame(() => {
      scheduleRenderStructure();
      const activePanel = container.querySelector(".tabPanel.active");
      activePanel?.querySelectorAll("textarea:not(.mdInput)").forEach((ta) => autoResizeTA(ta));
    });
  });
}

window.addEventListener("resize", refreshLayout);
window.addEventListener("orientationchange", refreshLayout);
window.addEventListener("pageshow", refreshLayout);

// Watch parent width for Squarespace layout engine
(function watchParentWidth() {
  const parent = container.parentElement;
  if (!parent) { refreshLayout(); return; }

  if (window.ResizeObserver) {
    let settled = false;
    const ro = new ResizeObserver(() => {
      if (container.offsetWidth > 100 && !settled) {
        settled = true;
        refreshLayout();
      }
    });
    ro.observe(parent);
    window.addEventListener("load", () => { ro.observe(parent); refreshLayout(); });
  } else {
    let tries = 0;
    function poll() {
      if (container.offsetWidth > 100 || tries++ > 30) refreshLayout();
      else setTimeout(poll, 100);
    }
    window.addEventListener("load", poll);
    poll();
  }
})();

// ---- Init ----
loadPref();
setCopiedFlag(copiedSinceChange);
selMax.value = String(maxVisibleLevel);
inSearch.value = searchQuery;
cbBody.checked = searchInBody;
cbReveal.checked = revealMatches;
badgeSave.className = "badge good badgeSave";
badgeSave.textContent = "Saved ✓";

rebuildMatches();
rebuildTagUI();
setTab(activeTab || "structure");
saveDebounced();
refreshLayout();
```

});
})();
