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

  const STYLE_ID = "siteapps-mdse-style-v2"; // bump style id so CSS updates cleanly

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
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

[data-app="mdse"] textarea{
  width:100%;
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
[data-app="mdse"] .topbar .left{ flex: 1 1 520px; }
[data-app="mdse"] .topbar .right{ flex: 1 1 220px; display:flex; justify-content:flex-end; }

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
  border:2px solid #111;
  border-radius: 12px;
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

[data-app="mdse"] .hdr{
  display:flex;
  gap: 10px;
  align-items:flex-start;
}
[data-app="mdse"] .pill{
  border:2px solid #111;
  border-radius: 12px;
  padding: 8px 10px;
  font-weight: 900;
  font-size: 13px;
  background:#fff;
  flex: 0 0 auto;
  user-select: none;
}
[data-app="mdse"] .pill.gray{ border-color:#444; color:#444; }
[data-app="mdse"] .title{
  flex: 1 1 auto;
  border:2px solid rgba(0,0,0,.15);
  border-radius: 12px;
  padding: 10px 12px;
  font-size: 16px;
  font-weight: 900;
  resize: none;
  overflow:hidden;
  min-height: 44px;
  background: #fbfbfb;
}
[data-app="mdse"] .tools{
  display:flex;
  gap: 6px;
  flex-wrap:wrap;
  justify-content:flex-end;
  align-items:flex-start;
  flex: 0 0 auto;
}
[data-app="mdse"] .tools button{
  padding: 8px 10px;
  border-radius: 12px;
  font-size: 13px;
}
[data-app="mdse"] .body{
  margin-top: 10px;
  display:none;
}
[data-app="mdse"] .body.show{ display:block; }

[data-app="mdse"] .hint{
  margin-top: 10px;
  font-size: 13px;
  font-weight: 800;
  color:#444;
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

/* Search highlighting */
[data-app="mdse"] .match{
  outline: 4px solid rgba(255, 170, 0, .65);
  outline-offset: 2px;
}
[data-app="mdse"] .activeMatch{
  outline: 5px solid rgba(255, 120, 0, .85);
  outline-offset: 3px;
}

[data-app="mdse"] .footer{
  margin-top: 14px;
  font-size: 12px;
  color:#666;
  font-weight: 700;
  text-align:right;
}
`;
    document.head.appendChild(style);
  }

  // ---- Utilities ----
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const uid = () => `n_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;

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

  // ---- Core app ----
  window.SiteApps.register("mdse", (container) => {
    ensureStyle();

    const KEY = storageKey(container);

    // State
    let nodes = []; // {id, level, title, body, isCollapsed, showBody}
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

    let saveTimer = null;

    // Build UI
    container.innerHTML = "";
    container.setAttribute("data-app", "mdse");

    container.innerHTML = `
<div class="topbar">
  <div class="left">
    <h3>Markdown Structure Editor</h3>
    <div class="muted">Paste Markdown → Load → reorder / tweak headings → Copy Result</div>
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

    <div class="searchRow" role="search" aria-label="Outline search">
      <input id="mdseSearch" type="search" placeholder="Search…" autocomplete="off" />
      <button type="button" class="btnPrev">Prev</button>
      <button type="button" class="btnNext">Next</button>
      <label class="searchOpt"><input id="mdseSearchBody" type="checkbox" /> Body</label>
      <label class="searchOpt"><input id="mdseReveal" type="checkbox" checked /> Reveal</label>
      <span class="searchCount" id="mdseCount"></span>
    </div>

    <div class="hint">Tip: Tap ⠿ PIN on a heading, then tap a green target heading to move the whole branch.</div>
  </div>

  <div class="right">
    <div class="badges">
      <span class="badge dim badgeSave">Unsaved…</span>
      <span class="badge warn badgeCopy">Not copied</span>
    </div>
  </div>
</div>

<div class="canvas"></div>
<div class="footer">v5.1 — Search + Reveal + Next/Prev</div>
`;

    const $ = (sel) => container.querySelector(sel);

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

    const inSearch = $("#mdseSearch");
    const btnPrev = $(".btnPrev");
    const btnNext = $(".btnNext");
    const cbBody = $("#mdseSearchBody");
    const cbReveal = $("#mdseReveal");
    const countEl = $("#mdseCount");

    // ---- Persistence ----
    function setCopiedFlag(flag) {
      copiedSinceChange = !!flag;
      if (copiedSinceChange) lastCopyAt = new Date().toISOString();
      badgeCopy.className = "badge " + (copiedSinceChange ? "good" : "warn");
      badgeCopy.textContent = copiedSinceChange ? "Copied ✓" : "Not copied";
      badgeCopy.title = copiedSinceChange && lastCopyAt ? `Last copied: ${lastCopyAt}` : "";
    }

    function markChanged() {
      setCopiedFlag(false);
      rebuildMatches(); // keep search in sync
      saveDebounced();
    }

    function saveNow() {
      try {
        const state = {
          v: 2,
          nodes,
          input: taInput.value,
          sourceId,
          maxVisibleLevel,
          copiedSinceChange,
          lastCopyAt,
          // search prefs
          searchQuery,
          searchInBody,
          revealMatches
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

      // Search prefs (query optional)
      if (typeof s.searchQuery === "string") searchQuery = s.searchQuery;
      if (typeof s.searchInBody === "boolean") searchInBody = s.searchInBody;
      if (typeof s.revealMatches === "boolean") revealMatches = s.revealMatches;

      // sanitise nodes
      nodes = nodes
        .filter((n) => n && typeof n === "object")
        .map((n) => ({
          id: typeof n.id === "string" ? n.id : uid(),
          level: clamp(parseInt(n.level, 10) || 1, 1, 6),
          title: typeof n.title === "string" ? n.title : "",
          body: typeof n.body === "string" ? n.body : "",
          isCollapsed: !!n.isCollapsed,
          showBody: !!n.showBody,
        }));
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
          };
          out.push(current);
        } else if (current) {
          current.body += line + "\n";
        }
      }
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
      const fam = familyIndices(idx);
      return fam.length > 1;
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

    function rebuildMatches() {
      matchIds = [];
      matchPos = -1;

      if (searchQuery.trim()) {
        for (const n of nodes) {
          if (nodeMatches(n, searchQuery)) matchIds.push(n.id);
        }
      }

      updateCount();
      render();
    }

    function updateCount() {
      if (!searchQuery.trim()) {
        countEl.textContent = "";
        return;
      }
      if (!matchIds.length) {
        countEl.textContent = "0 matches";
        return;
      }
      const cur = matchPos >= 0 ? (matchPos + 1) : 0;
      countEl.textContent = cur ? `${cur}/${matchIds.length}` : `${matchIds.length} matches`;
    }

    function computeRevealSet() {
      const reveal = new Set();
      if (!revealMatches || !searchQuery.trim() || !matchIds.length) return reveal;

      // reveal ancestors of matching nodes
      for (let i = 0; i < nodes.length; i++) {
        if (!nodeMatches(nodes[i], searchQuery)) continue;

        // include the node
        reveal.add(nodes[i].id);

        // walk back to parents based on decreasing level
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

    function jump(delta) {
      if (!matchIds.length) return;
      matchPos = (matchPos + delta + matchIds.length) % matchIds.length;
      updateCount();
      render();

      const id = matchIds[matchPos];
      // find the element after render
      const el = canvas.querySelector(`[data-node-id="${id}"]`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        const t = el.querySelector(".title");
        if (t) t.focus();
      }
    }

    // ---- Actions ----
    function toggleBranchCollapse(id) {
      const idx = indexById(id);
      if (idx < 0) return;
      nodes[idx].isCollapsed = !nodes[idx].isCollapsed;
      markChanged();
    }

    function toggleBody(id) {
      const idx = indexById(id);
      if (idx < 0) return;
      nodes[idx].showBody = !nodes[idx].showBody;
      markChanged();
    }

    function changeLevel(id, delta) {
      const idx = indexById(id);
      if (idx < 0) return;
      const fam = familyIndices(idx);
      fam.forEach((i) => {
        nodes[i].level = clamp(nodes[i].level + delta, 1, 6);
      });
      markChanged();
    }

    function addNewAfter(idOrNull) {
      if (!nodes.length || !idOrNull) {
        const newNode = { id: uid(), level: 1, title: "", body: "", isCollapsed: false, showBody: false };
        nodes.push(newNode);
        lastCreatedId = newNode.id;
        markChanged();
        return;
      }
      const idx = indexById(idOrNull);
      if (idx < 0) return;
      const fam = familyIndices(idx);
      const insertAt = fam[fam.length - 1] + 1;
      const newNode = {
        id: uid(),
        level: nodes[idx].level,
        title: "",
        body: "",
        isCollapsed: false,
        showBody: false,
      };
      nodes.splice(insertAt, 0, newNode);
      lastCreatedId = newNode.id;
      markChanged();
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
      }));

      const insertAt = fam[fam.length - 1] + 1;
      nodes.splice(insertAt, 0, ...clones);
      lastCreatedId = clones[0].id;
      markChanged();
    }

    function deleteBranch(id) {
      const idx = indexById(id);
      if (idx < 0) return;
      if (!confirm("Delete this heading and its children?")) return;
      const fam = familyIndices(idx);
      nodes.splice(idx, fam.length);
      if (sourceId && !nodes.some((n) => n.id === sourceId)) sourceId = null;
      markChanged();
    }

    // Stable move
    function toggleMove(id) {
      if (!sourceId) {
        sourceId = id;
        render();
        return;
      }

      if (sourceId === id) {
        sourceId = null;
        render();
        return;
      }

      const movingIds = new Set(familyIds(sourceId));
      if (movingIds.has(id)) {
        sourceId = null;
        render();
        return;
      }

      const movingNodes = nodes.filter((n) => movingIds.has(n.id));
      nodes = nodes.filter((n) => !movingIds.has(n.id));

      const targetIdx = indexById(id);
      if (targetIdx < 0) {
        nodes.push(...movingNodes);
        sourceId = null;
        markChanged();
        return;
      }

      const targetFam = familyIndices(targetIdx);
      const insertAt = targetFam[targetFam.length - 1] + 1;

      nodes.splice(insertAt, 0, ...movingNodes);

      sourceId = null;
      markChanged();
    }

    function setMaxLevel(level) {
      maxVisibleLevel = clamp(level, 1, 6);
      selMax.value = String(maxVisibleLevel);
      markChanged();
    }

    // ---- Render ----
    function render() {
      const scrollPos = window.scrollY;

      selMax.value = String(maxVisibleLevel);

      // Sync search UI
      inSearch.value = searchQuery;
      cbBody.checked = searchInBody;
      cbReveal.checked = revealMatches;

      canvas.innerHTML = "";

      // Collapsed hiding (but allow reveal to override)
      const hiddenByCollapse = new Set();
      nodes.forEach((n, idx) => {
        if (n.isCollapsed) {
          familyIndices(idx).slice(1).forEach((i) => hiddenByCollapse.add(i));
        }
      });

      const movingSet = sourceId ? new Set(familyIds(sourceId)) : new Set();

      // Reveal matching branches
      const revealSet = computeRevealSet();

      // For quick match checks in render
      const matchSet = new Set(matchIds);

      nodes.forEach((n, idx) => {
        if (n.level > maxVisibleLevel) return;

        // Hidden by collapse unless reveal says otherwise (or it's an ancestor in revealSet)
        if (hiddenByCollapse.has(idx) && !revealSet.has(n.id)) return;

        const isSource = sourceId === n.id;
        const isValidTarget = !!sourceId && !movingSet.has(n.id);

        const isMatch = searchQuery.trim() && matchSet.has(n.id);
        const isActive = isMatch && matchPos >= 0 && matchIds[matchPos] === n.id;

        const node = document.createElement("div");
        node.setAttribute("data-node-id", n.id);
        node.className =
          `node level-${n.level}` +
          (isSource ? " movingSource" : "") +
          (isValidTarget ? " moveTarget" : "") +
          (n.isCollapsed ? " collapsed" : "") +
          (isMatch ? " match" : "") +
          (isActive ? " activeMatch" : "");

        if (isValidTarget) node.addEventListener("click", () => toggleMove(n.id));

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

        const title = document.createElement("textarea");
        title.className = "title";
        title.rows = 1;
        title.value = n.title || "";
        title.addEventListener("click", (e) => e.stopPropagation());
        title.addEventListener("input", () => {
          n.title = title.value;
          autoResizeTA(title);
          markChanged();
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

        const del = document.createElement("button");
        del.type = "button";
        del.textContent = "✕";
        del.className = "warn";
        del.title = "Delete branch";
        del.addEventListener("click", () => deleteBranch(n.id));

        tools.append(bodyBtn, dup, add, left, right, del);

        hdr.append(pin, col, lvl, title, tools);
        node.appendChild(hdr);

        // Body area (hidden by default) — BUT reveal body if match is body-only while searching & revealMatches on
        const bodyShouldShow =
          n.showBody ||
          (revealMatches && searchQuery.trim() && nodeMatchesBodyOnly(n, searchQuery));

        const bodyWrap = document.createElement("div");
        bodyWrap.className = "body" + (bodyShouldShow ? " show" : "");

        const bodyTA = document.createElement("textarea");
        bodyTA.rows = 6;
        bodyTA.value = (n.body || "").trimEnd();
        bodyTA.addEventListener("input", () => {
          n.body = bodyTA.value;
          markChanged();
        });
        bodyWrap.appendChild(bodyTA);
        node.appendChild(bodyWrap);

        canvas.appendChild(node);

        autoResizeTA(title);
      });

      window.scrollTo(0, scrollPos);

      if (lastCreatedId) {
        const el = [...canvas.querySelectorAll(".node")].find((div) => {
          const t = div.querySelector(".title");
          return t && t.value === "";
        });
        if (el) el.querySelector(".title").focus();
        lastCreatedId = null;
      }
    }

    // ---- Buttons / events ----
    btnLoad.addEventListener("click", () => {
      const text = taInput.value || "";
      if (!text.trim()) return;
      nodes = parseMarkdown(text);
      sourceId = null;
      markChanged();
    });

    btnUpdate.addEventListener("click", () => {
      taInput.value = toMarkdown();
      markChanged();
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
      setCopiedFlag(false);
      try { localStorage.removeItem(KEY); } catch {}
      saveDebounced();
      render();
    });

    btnAddTop.addEventListener("click", () => addNewAfter(null));

    selMax.addEventListener("change", () => setMaxLevel(parseInt(selMax.value, 10)));

    btnLvl1.addEventListener("click", () => setMaxLevel(1));
    btnLvl2.addEventListener("click", () => setMaxLevel(2));
    btnLvl3.addEventListener("click", () => setMaxLevel(3));
    btnLvlAll.addEventListener("click", () => setMaxLevel(6));

    // Search events
    inSearch.addEventListener("input", () => {
      searchQuery = inSearch.value || "";
      rebuildMatches();
      saveDebounced();
    });

    cbBody.addEventListener("change", () => {
      searchInBody = !!cbBody.checked;
      rebuildMatches();
      saveDebounced();
    });

    cbReveal.addEventListener("change", () => {
      revealMatches = !!cbReveal.checked;
      render();
      saveDebounced();
    });

    btnPrev.addEventListener("click", () => jump(-1));
    btnNext.addEventListener("click", () => jump(+1));

    // Enter = Next, Shift+Enter = Prev (nice on desktop; harmless on iPad)
    inSearch.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (e.shiftKey) jump(-1);
        else jump(+1);
      }
      if (e.key === "Escape") {
        e.preventDefault();
        searchQuery = "";
        matchIds = [];
        matchPos = -1;
        inSearch.value = "";
        updateCount();
        render();
        saveDebounced();
      }
    });

    // Input changes should mark "not copied"
    taInput.addEventListener("input", () => markChanged());

    // ---- Init ----
    loadPref();
    setCopiedFlag(copiedSinceChange);

    // Sync UI with loaded prefs
    selMax.value = String(maxVisibleLevel);
    inSearch.value = searchQuery;
    cbBody.checked = searchInBody;
    cbReveal.checked = revealMatches;

    badgeSave.className = "badge good badgeSave";
    badgeSave.textContent = "Saved ✓";

    rebuildMatches(); // renders as well
    saveDebounced();
  });
})();
