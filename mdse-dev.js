(() => {
  "use strict";

  // ---- SiteApps registry ----
  window.SiteApps = window.SiteApps || {};
  window.SiteApps.registry = window.SiteApps.registry || {};
  window.SiteApps.register =
    window.SiteApps.register ||
    function (name, initFn) {
      window.SiteApps.registry[name] = initFn;
    };

  const STYLE_ID = "siteapps-mdse-style-v4";
  const BUILD_CREATED_STAMP = "02 Apr 2026 13:18 BST · GPT-5.4 Thinking";

  function formatBrowserRunStamp() {
    try {
      const dt = new Date();
      const text = dt.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
      }).replace(",", "");
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "local time";
      return `${text} · ${tz}`;
    } catch (_) {
      return "Unavailable";
    }
  }

  function ensureStyle() {
    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }

    style.textContent = `
      .mdse-wrapper {
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
      .mdse-wrapper, .mdse-wrapper * { box-sizing: border-box; }
      .mdse-wrapper .muted { color: #444; font-size: 13px; font-weight: 700; }
      .mdse-wrapper .btnrow { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; margin: 10px 0; }
      .mdse-wrapper .tabs { display: flex; gap: 10px; flex-wrap: wrap; margin: 0 0 10px; }
      .mdse-wrapper button {
        border: 2px solid #111;
        border-radius: 999px;
        padding: 8px 14px;
        font-weight: 800;
        font-size: 13px;
        background: #fff;
        color: #111;
        cursor: pointer;
        transition: transform 0.1s, opacity 0.1s;
      }
      .mdse-wrapper button.primary { background: #111; color: #fff; }
      .mdse-wrapper button.warn { border-color: #a00; color: #a00; background: #fff8f8; }
      .mdse-wrapper button.ghost { background: #fbfbfb; }
      .mdse-wrapper button.active { background: #111; color: #fff; }
      .mdse-wrapper button:disabled { opacity: 0.45; cursor: default; }
      .mdse-wrapper button:hover:not(:disabled) { opacity: 0.88; }
      .mdse-wrapper button:active:not(:disabled) { transform: scale(0.96); }

      .mdse-wrapper textarea,
      .mdse-wrapper input,
      .mdse-wrapper select {
        width: 100%;
        border: 2px solid #111;
        border-radius: 12px;
        padding: 12px;
        font-size: 16px;
        line-height: 1.35;
        background: #fbfbfb;
        color: #111;
      }

      .mdse-wrapper .tabPanel { display: none; width: 100%; }
      .mdse-wrapper .tabPanel.active { display: block; }

      .mdse-wrapper .mdInput {
        display: block;
        width: 100%;
        min-height: 180px;
        max-height: 420px;
        resize: vertical;
        margin-bottom: 12px;
      }

      .mdse-wrapper .panelSummary {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        align-items: center;
        margin: 6px 0 10px;
      }

      .mdse-wrapper .summaryPill {
        border: 2px solid rgba(0,0,0,.15);
        border-radius: 999px;
        padding: 6px 10px;
        font-size: 12px;
        font-weight: 800;
        background: #fff;
      }

      .mdse-wrapper .canvas:empty::before {
        content: "Load Markdown to see your structure.";
        display: block;
        padding: 14px;
        border: 2px dashed rgba(0,0,0,.2);
        border-radius: 14px;
        color: #555;
        font-size: 14px;
        font-weight: 700;
        background: #fcfcfc;
      }

      .mdse-wrapper .node {
        --indent: 0px;
        width: calc(100% - var(--indent));
        margin: 10px 0 10px var(--indent);
        display: block;
        background: #fff;
        border: 2px solid rgba(0,0,0,.15);
        border-radius: 14px;
        padding: 12px;
        position: relative;
      }
      .mdse-wrapper .node.activeNode {
        border-color: #0b5fff;
        box-shadow: 0 8px 22px rgba(11,95,255,.08);
      }
      .mdse-wrapper .node.pinnedNode {
        border-color: #8b5a00;
        box-shadow: 0 8px 22px rgba(139,90,0,.10);
      }

      .mdse-wrapper .nodeHeader {
        display: flex;
        gap: 10px;
        align-items: flex-start;
        flex-wrap: wrap;
        width: 100%;
      }
      .mdse-wrapper .headerLeft {
        display: flex;
        gap: 8px;
        align-items: center;
        flex-wrap: wrap;
      }
      .mdse-wrapper .headerRight {
        margin-left: auto;
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
        align-items: center;
      }
      .mdse-wrapper .nodeTitleWrap {
        flex: 1 1 100%;
        width: 100%;
      }
      .mdse-wrapper .titleInput {
        display: block;
        width: 100%;
        min-height: 60px;
        border: 2px solid rgba(0,0,0,.15);
        border-radius: 12px;
        padding: 12px 14px;
        font-size: 17px;
        line-height: 1.35;
        font-weight: 800;
        resize: vertical;
        overflow: hidden;
        background: #fbfbfb;
      }
      .mdse-wrapper .bodyWrap {
        display: none;
        margin-top: 10px;
      }
      .mdse-wrapper .bodyWrap.show { display: block; }
      .mdse-wrapper .bodyInput {
        display: block;
        width: 100%;
        min-height: 120px;
        resize: vertical;
      }
      .mdse-wrapper .tools {
        display: none;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 10px;
        padding-top: 10px;
        border-top: 1px solid #eee;
      }
      .mdse-wrapper .node.activeNode .tools { display: flex; }

      .mdse-wrapper .pillBtn,
      .mdse-wrapper .infoPill {
        border: 2px solid #111;
        border-radius: 12px;
        padding: 4px 8px;
        font-weight: 900;
        font-size: 12px;
        background: #fff;
      }
      .mdse-wrapper .pillBtn {
        cursor: pointer;
      }
      .mdse-wrapper .miniBtn {
        border: 1px solid #ddd;
        padding: 4px 8px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 800;
        background: #fff;
      }
      .mdse-wrapper .pinBtn {
        border: 2px solid rgba(0,0,0,.15);
        border-radius: 999px;
        padding: 4px 9px;
        min-width: 38px;
        font-size: 16px;
        line-height: 1;
        background: #fff;
      }
      .mdse-wrapper .pinBtn.active {
        border-color: #8b5a00;
        color: #8b5a00;
        background: #fff8ec;
      }
      .mdse-wrapper .pinBtn.target {
        border-color: #0b5fff;
        color: #0b5fff;
        background: #f5f9ff;
      }

      .mdse-wrapper .indentGuide {
        border-left: 4px solid rgba(11,95,255,.12);
        padding-left: 10px;
      }
      .mdse-wrapper .searchBox {
        margin-bottom: 12px;
      }
      .mdse-wrapper .searchResults,
      .mdse-wrapper .tagMatches,
      .mdse-wrapper .tocList {
        display: grid;
        gap: 10px;
      }
      .mdse-wrapper .tagsBar {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin: 10px 0 12px;
      }
      .mdse-wrapper .tagChip {
        border: 2px solid #111;
        border-radius: 999px;
        padding: 6px 10px;
        font-size: 12px;
        font-weight: 800;
        background: #fff;
        cursor: pointer;
      }
      .mdse-wrapper .tagChip.active {
        background: #111;
        color: #fff;
      }
      .mdse-wrapper .searchItem,
      .mdse-wrapper .tocItem {
        border: 2px solid rgba(0,0,0,.15);
        border-radius: 14px;
        background: #fff;
        padding: 12px;
        text-align: left;
        width: 100%;
      }
      .mdse-wrapper .tocItem {
        --toc-indent: 0px;
        padding-left: calc(12px + var(--toc-indent));
      }
      .mdse-wrapper .tocHead {
        display: flex;
        gap: 8px;
        align-items: center;
        width: 100%;
      }
      .mdse-wrapper .tocMarker {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 28px;
        padding: 2px 6px;
        border: 2px solid rgba(0,0,0,.15);
        border-radius: 999px;
        font-size: 12px;
        font-weight: 900;
        background: #fff;
      }
      .mdse-wrapper .tocMarkerBtn {
        cursor: pointer;
      }
      .mdse-wrapper .tocMarkerBtn:disabled {
        cursor: default;
        opacity: 0.55;
      }
      .mdse-wrapper .tocMarker.none {
        opacity: 0.55;
      }
      .mdse-wrapper .tocJumpBody {
        flex: 1 1 auto;
        min-width: 0;
        border: 0;
        border-radius: 0;
        padding: 0;
        background: transparent;
        text-align: left;
        font: inherit;
        color: inherit;
        cursor: pointer;
      }
      .mdse-wrapper .tocTitleRow {
        display: flex;
        gap: 8px;
        align-items: baseline;
        flex-wrap: wrap;
      }
      .mdse-wrapper .searchItemTitle,
      .mdse-wrapper .tocItemTitle {
        font-size: 16px;
        font-weight: 800;
        margin-bottom: 6px;
      }
      .mdse-wrapper .tocHead .tocItemTitle {
        margin-bottom: 0;
      }
      .mdse-wrapper .tocLevel {
        font-size: 12px;
        font-weight: 900;
        color: #444;
        border: 2px solid rgba(0,0,0,.15);
        border-radius: 999px;
        padding: 2px 8px;
        background: #fff;
      }
      .mdse-wrapper .searchItemMeta,
      .mdse-wrapper .tocItemMeta {
        font-size: 12px;
        font-weight: 800;
        color: #444;
        margin-bottom: 6px;
      }
      .mdse-wrapper .searchItemExcerpt {
        font-size: 14px;
        color: #222;
        white-space: pre-wrap;
      }
      .mdse-wrapper .note {
        border: 2px dashed rgba(0,0,0,.2);
        border-radius: 14px;
        background: #fcfcfc;
        padding: 12px;
        margin: 10px 0;
      }

      .mdse-wrapper .topMeta {
        display:flex;
        gap:10px;
        align-items:center;
        flex-wrap:wrap;
        margin:0 0 12px;
        padding-bottom:12px;
        border-bottom:1px solid #eee;
      }

      .mdse-wrapper .bottomMeta {
        display:flex;
        gap:10px;
        align-items:center;
        flex-wrap:wrap;
        margin:14px 0 0;
        padding-top:12px;
        border-top:1px solid #eee;
      }
      .mdse-wrapper .buildStamp {
        font-size:12px;
        font-weight:800;
        color:#555;
      }
      .mdse-wrapper .metaBadge {
        font-size:12px;
        font-weight:900;
        padding:4px 9px;
        border:2px solid #111;
        border-radius:999px;
        background:#fff;
      }
      .mdse-wrapper .metaBadge.good {
        border-color:#0b3d0b;
        color:#0b3d0b;
      }
      .mdse-wrapper .metaBadge.warn {
        border-color:#7a0000;
        color:#7a0000;
      }
      .mdse-wrapper .metaBadge.dim {
        border-color:#555;
        color:#555;
      }
      .mdse-wrapper .metaBadge.pin {
        border-color:#8b5a00;
        color:#8b5a00;
      }

      @media (max-width: 700px) {
        .mdse-wrapper { padding: 14px; }
        .mdse-wrapper .headerRight { margin-left: 0; }
        .mdse-wrapper .node { width: 100%; margin-left: 0; }
      }
    `;
  }

  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const uid = () => `n_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
  const HISTORY_LIMIT = 10;

  function debounce(fn, ms) {
    let timer = null;
    return (...args) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        fn(...args);
      }, ms);
    };
  }

  function makeRafScheduler(fn) {
    let queued = false;
    return () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        fn();
      });
    };
  }

  function countWords(text) {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
  }

  function autoResizeTA(ta) {
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${ta.scrollHeight + 2}px`;
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function safeStorageGet(key) {
    try {
      return localStorage.getItem(key);
    } catch (_) {
      return null;
    }
  }

  function safeStorageRemove(key) {
    try {
      localStorage.removeItem(key);
    } catch (_) {
      // ignore
    }
  }

  function copyTextFallback(text) {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "readonly");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      ta.style.top = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return !!ok;
    } catch (_) {
      return false;
    }
  }

  function parseMarkdown(raw) {
    const text = String(raw || "").replace(/\r\n?/g, "\n");
    const lines = text.split("\n");
    const nodes = [];
    const preamble = [];

    let current = null;
    let inFence = false;
    let fenceChar = "";
    let fenceLen = 0;

    function pushBodyLine(line) {
      if (current) current._bodyLines.push(line);
      else preamble.push(line);
    }

    for (const line of lines) {
      const fenceMatch = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
      if (fenceMatch) {
        const marker = fenceMatch[1];
        const char = marker[0];
        const len = marker.length;

        if (!inFence) {
          inFence = true;
          fenceChar = char;
          fenceLen = len;
        } else if (char === fenceChar && len >= fenceLen) {
          inFence = false;
          fenceChar = "";
          fenceLen = 0;
        }

        pushBodyLine(line);
        continue;
      }

      if (!inFence) {
        const m = line.match(/^ {0,3}(#{1,6})[ \t]+(.*)$/);
        if (m) {
          let title = m[2] || "";
          title = title.replace(/[ \t]+#+[ \t]*$/, "").trimEnd();
          current = {
            id: uid(),
            level: m[1].length,
            title,
            body: "",
            showBody: false,
            isCollapsed: false,
            _bodyLines: []
          };
          nodes.push(current);
          continue;
        }
      }

      pushBodyLine(line);
    }

    nodes.forEach((n) => {
      n.body = n._bodyLines.join("\n").replace(/^\n+/, "");
      delete n._bodyLines;
    });

    return {
      preamble: preamble.join("\n").replace(/^\n+/, ""),
      nodes
    };
  }

  function nodesToMarkdown(docPreamble, nodes) {
    const parts = [];
    const pre = String(docPreamble || "").replace(/^\n+/, "").replace(/\s+$/, "");
    if (pre) parts.push(pre);

    nodes.forEach((n) => {
      const head = `${"#".repeat(clamp(n.level || 1, 1, 6))} ${String(n.title || "").trimEnd()}`;
      const body = String(n.body || "").replace(/^\n+/, "").replace(/\s+$/, "");
      parts.push(body ? `${head}\n\n${body}` : head);
    });

    return parts.join("\n\n").replace(/\n{3,}/g, "\n\n");
  }

  function normalizeNodes(arr) {
    if (!Array.isArray(arr)) return [];
    return arr.map((n) => ({
      id: typeof n?.id === "string" && n.id ? n.id : uid(),
      level: clamp(parseInt(n?.level, 10) || 1, 1, 6),
      title: typeof n?.title === "string" ? n.title : "",
      body: typeof n?.body === "string" ? n.body : "",
      showBody: !!n?.showBody,
      isCollapsed: !!n?.isCollapsed
    }));
  }

  function cloneNodes(arr) {
    return normalizeNodes(arr).map((n) => ({ ...n }));
  }

  function mergeTextParts(a, b) {
    const left = String(a || "").replace(/\s+$/, "");
    const right = String(b || "").replace(/^\s+/, "");
    if (!left) return right;
    if (!right) return left;
    return `${left}\n\n${right}`;
  }

  function ensureTagLine(body, tagLabel) {
    const tag = String(tagLabel || "").replace(/\s+/g, " ").trim();
    if (!tag) return String(body || "");

    const src = String(body || "").replace(/\r\n?/g, "\n");
    const lines = src ? src.split("\n") : [];
    const wantedKey = tag.toLowerCase();

    for (const line of lines) {
      const m = line.match(/^\s*\\?%%\s*tag\b[ \t]+(.+)$/i);
      if (!m) continue;
      const tail = String(m[1] || "").trim();
      const parts = tail.includes(",")
        ? tail.split(",").map((s) => s.trim()).filter(Boolean)
        : [tail];
      if (parts.some((part) => part.replace(/\s+/g, " ").trim().toLowerCase() === wantedKey)) {
        return src;
      }
    }

    const line = `%% tag ${tag}`;
    return src ? `${line}\n${src}` : line;
  }

  function normalizePastedNodesForPeerLevel(pastedNodes, peerLevel) {
    const list = cloneNodes(pastedNodes);
    if (!list.length) return list;

    const minLevel = list.reduce((min, n) => Math.min(min, n.level), list[0].level);
    const maxLevel = list.reduce((max, n) => Math.max(max, n.level), list[0].level);
    const delta = clamp((peerLevel || 1) - minLevel, 1 - minLevel, 6 - maxLevel);

    list.forEach((n) => {
      n.level = clamp(n.level + delta, 1, 6);
    });

    return list;
  }

  window.SiteApps.register("mdseStage", (container) => {
    ensureStyle();

    const KEY = `siteapps:mdseStage:v4:${location.pathname}`;

    let nodes = [];
    let docPreamble = "";
    let activeNodeId = "";
    let activeTab = "structure";
    let searchQuery = "";
    let activeTag = "";
    let pendingFocus = null;
    let pendingScrollId = null;
    let pinnedRootId = "";
    let undoStack = [];
    let pendingTextHistory = null;

    container.innerHTML = `
      <div class="mdse-wrapper">
        <div class="topMeta">
          <span class="metaBadge dim jsSaveBadge">Saved ✓</span>
          <span class="metaBadge warn jsCopyBadge">Not copied</span>
          <span class="metaBadge dim jsPinBadge">Nothing pinned</span>
        </div>

        <div class="tabs">
          <button class="tabbtn active" data-tab="structure">Structure</button>
          <button class="tabbtn" data-tab="toc">Contents</button>
          <button class="tabbtn" data-tab="search">Search</button>
          <button class="tabbtn" data-tab="tags">Tags</button>
        </div>

        <div class="tabPanel panelStructure active">
          <textarea class="mdInput" placeholder="Paste Markdown here..."></textarea>
          <div class="btnrow">
            <button class="primary btnLoad">Load Markdown</button>
            <button class="ghost btnUndo" disabled>Undo</button>
            <button class="ghost btnCopy">Copy Result</button>
            <button class="ghost btnReset">Reset App</button>
          </div>
          <div class="panelSummary">
            <div class="summaryPill summaryNodes">0 nodes</div>
            <div class="summaryPill summaryWords">0 words</div>
            <div class="summaryPill summaryPreamble">No preamble</div>
          </div>
          <div class="preambleNote"></div>
          <div class="canvas"></div>
        </div>

        <div class="tabPanel panelToc">
          <div class="btnrow">
            <button class="ghost btnCopyToc">Copy Contents</button>
          </div>
          <div class="muted tocMeta">No headings yet.</div>
          <div class="tocList"></div>
        </div>

        <div class="tabPanel panelSearch">
          <div class="searchBox">
            <input class="searchInput" type="text" placeholder="Search titles and body text...">
          </div>
          <div class="muted searchMeta">No search yet.</div>
          <div class="searchResults"></div>
        </div>

        <div class="tabPanel panelTags">
          <div class="btnrow">
            <button class="ghost btnCopyTags">Copy Tags</button>
          </div>
          <div class="muted tagsMeta">No tags yet.</div>
          <div class="tagsBar"></div>
          <div class="tagMatches"></div>
        </div>

        <div class="bottomMeta">
          <div class="buildStamp">Created: ${escapeHtml(BUILD_CREATED_STAMP)}</div>
          <div class="buildStamp jsRunStamp">Browser run: ${escapeHtml(formatBrowserRunStamp())}</div>
        </div>
      </div>
    `;

    const root = container.querySelector(".mdse-wrapper");
    const taInput = root.querySelector(".mdInput");
    const btnLoad = root.querySelector(".btnLoad");
    const btnUndo = root.querySelector(".btnUndo");
    const btnCopy = root.querySelector(".btnCopy");
    const btnReset = root.querySelector(".btnReset");
    const btnCopyToc = root.querySelector(".btnCopyToc");
    const btnCopyTags = root.querySelector(".btnCopyTags");
    const canvas = root.querySelector(".canvas");
    const tocMeta = root.querySelector(".tocMeta");
    const tocList = root.querySelector(".tocList");
    const searchInput = root.querySelector(".searchInput");
    const searchMeta = root.querySelector(".searchMeta");
    const searchResults = root.querySelector(".searchResults");
    const tagsMeta = root.querySelector(".tagsMeta");
    const tagsBar = root.querySelector(".tagsBar");
    const tagMatches = root.querySelector(".tagMatches");
    const summaryNodes = root.querySelector(".summaryNodes");
    const summaryWords = root.querySelector(".summaryWords");
    const summaryPreamble = root.querySelector(".summaryPreamble");
    const preambleNote = root.querySelector(".preambleNote");

    const runStamp = root.querySelector(".jsRunStamp");
    const saveBadge = root.querySelector(".jsSaveBadge");
    const copyBadge = root.querySelector(".jsCopyBadge");
    const pinBadge = root.querySelector(".jsPinBadge");

    if (runStamp) {
      runStamp.textContent = `Browser run: ${formatBrowserRunStamp()}`;
    }

    let copiedSinceChange = false;
    let saveTimer = null;

    function setSaveBadgeSaved() {
      if (!saveBadge) return;
      saveBadge.className = "metaBadge good jsSaveBadge";
      saveBadge.textContent = "Saved ✓";
    }

    function setSaveBadgeUnsaved() {
      if (!saveBadge) return;
      saveBadge.className = "metaBadge dim jsSaveBadge";
      saveBadge.textContent = "Unsaved…";
    }

    function setSaveBadgeNotSaved() {
      if (!saveBadge) return;
      saveBadge.className = "metaBadge warn jsSaveBadge";
      saveBadge.textContent = "Not saved";
    }

    function setCopyBadge() {
      if (!copyBadge) return;
      if (copiedSinceChange) {
        copyBadge.className = "metaBadge good jsCopyBadge";
        copyBadge.textContent = "Copied ✓";
      } else {
        copyBadge.className = "metaBadge warn jsCopyBadge";
        copyBadge.textContent = "Not copied";
      }
    }

    function getPinnedTitle() {
      const idx = getNodeIndexById(pinnedRootId);
      return idx >= 0 ? (nodes[idx].title || "(untitled)") : "";
    }

    function updatePinBadge() {
      if (!pinBadge) return;
      const title = getPinnedTitle();
      if (title) {
        pinBadge.className = "metaBadge pin jsPinBadge";
        pinBadge.textContent = `Pinned: ${title} → tap another pin`;
      } else {
        pinBadge.className = "metaBadge dim jsPinBadge";
        pinBadge.textContent = "Nothing pinned";
      }
    }

    function updateUndoButton() {
      if (!btnUndo) return;
      const count = undoStack.length;
      btnUndo.disabled = !count;
      btnUndo.textContent = count ? `Undo (${count})` : "Undo";
    }

    function snapshotState() {
      return {
        v: 4,
        nodes: cloneNodes(nodes),
        docPreamble,
        activeNodeId,
        activeTab,
        searchQuery,
        activeTag,
        rawInput: taInput.value || "",
        copiedSinceChange,
        pinnedRootId
      };
    }

    function applySnapshot(state, options = {}) {
      nodes = cloneNodes(state?.nodes || []);
      docPreamble = typeof state?.docPreamble === "string" ? state.docPreamble : "";
      activeNodeId = typeof state?.activeNodeId === "string" ? state.activeNodeId : "";
      activeTab = typeof state?.activeTab === "string" && ["structure", "toc", "search", "tags"].includes(state.activeTab)
        ? state.activeTab
        : "structure";
      searchQuery = typeof state?.searchQuery === "string" ? state.searchQuery : "";
      activeTag = typeof state?.activeTag === "string" ? state.activeTag : "";
      taInput.value = typeof state?.rawInput === "string" ? state.rawInput : "";
      copiedSinceChange = !!state?.copiedSinceChange;
      pinnedRootId = typeof state?.pinnedRootId === "string" ? state.pinnedRootId : "";

      if (activeNodeId && getNodeIndexById(activeNodeId) < 0) {
        activeNodeId = nodes[0] ? nodes[0].id : "";
      }
      if (pinnedRootId && getNodeIndexById(pinnedRootId) < 0) {
        pinnedRootId = "";
      }

      searchInput.value = searchQuery;
      pendingTextHistory = null;
      setCopyBadge();
      updatePinBadge();
      switchTab(activeTab, { silent: true });
      renderStructure();
      if (activeTab === "toc") renderTOC();
      if (activeTab === "search") renderSearch();
      if (activeTab === "tags") renderTags();
      updateUndoButton();
      if (!options.skipSave) persistStateNow();
    }

    function statesEqual(a, b) {
      try {
        return JSON.stringify(a) === JSON.stringify(b);
      } catch (_) {
        return false;
      }
    }

    function pushUndoSnapshot(reason, explicitState) {
      const shot = explicitState ? {
        v: 4,
        nodes: cloneNodes(explicitState.nodes),
        docPreamble: typeof explicitState.docPreamble === "string" ? explicitState.docPreamble : "",
        activeNodeId: typeof explicitState.activeNodeId === "string" ? explicitState.activeNodeId : "",
        activeTab: typeof explicitState.activeTab === "string" ? explicitState.activeTab : "structure",
        searchQuery: typeof explicitState.searchQuery === "string" ? explicitState.searchQuery : "",
        activeTag: typeof explicitState.activeTag === "string" ? explicitState.activeTag : "",
        rawInput: typeof explicitState.rawInput === "string" ? explicitState.rawInput : "",
        copiedSinceChange: !!explicitState.copiedSinceChange,
        pinnedRootId: typeof explicitState.pinnedRootId === "string" ? explicitState.pinnedRootId : ""
      } : snapshotState();

      const last = undoStack[undoStack.length - 1];
      if (last && statesEqual(last.state, shot)) return;

      undoStack.push({ reason: reason || "change", state: shot });
      if (undoStack.length > HISTORY_LIMIT) undoStack = undoStack.slice(-HISTORY_LIMIT);
      updateUndoButton();
    }

    function undoLast() {
      const entry = undoStack.pop();
      if (!entry) return;
      applySnapshot(entry.state);
      updateUndoButton();
    }

    function buildState() {
      return {
        ...snapshotState(),
        undoStack: undoStack.map((entry) => ({
          reason: entry.reason,
          state: entry.state
        }))
      };
    }

    function persistStateNow() {
      try {
        localStorage.setItem(KEY, JSON.stringify(buildState()));
        setSaveBadgeSaved();
        return true;
      } catch (_) {
        setSaveBadgeNotSaved();
        return false;
      }
    }

    function flushSaveNow() {
      if (saveTimer) {
        clearTimeout(saveTimer);
        saveTimer = null;
      }
      return persistStateNow();
    }

    function scheduleSave() {
      setSaveBadgeUnsaved();
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        saveTimer = null;
        persistStateNow();
      }, 250);
    }

    function markDocChanged() {
      copiedSinceChange = false;
      setCopyBadge();
      scheduleSave();
    }

    function markStateChanged() {
      scheduleSave();
    }

    function persistSilently() {
      flushSaveNow();
    }
    
    function totalWords() {
      return nodes.reduce((sum, n) => sum + countWords(n.title) + countWords(n.body), 0);
    }

    function updateSummary() {
      const words = totalWords();
      summaryNodes.textContent = `${nodes.length} ${nodes.length === 1 ? "node" : "nodes"}`;
      summaryWords.textContent = `${words} ${words === 1 ? "word" : "words"}`;
      summaryPreamble.textContent = docPreamble.trim() ? "Preamble preserved" : "No preamble";

      if (docPreamble.trim()) {
        preambleNote.innerHTML = `<div class="note"><strong>Note:</strong> Text before the first heading has been preserved and will be included when you copy the result.</div>`;
      } else {
        preambleNote.innerHTML = "";
      }

      updatePinBadge();
      updateUndoButton();
    }

    function switchTab(tab, options = {}) {
      activeTab = ["structure", "toc", "search", "tags"].includes(tab) ? tab : "structure";
      root.querySelectorAll(".tabbtn").forEach((btn) => {
        btn.classList.toggle("active", btn.getAttribute("data-tab") === activeTab);
      });
      root.querySelector(".panelStructure").classList.toggle("active", activeTab === "structure");
      root.querySelector(".panelToc").classList.toggle("active", activeTab === "toc");
      root.querySelector(".panelSearch").classList.toggle("active", activeTab === "search");
      root.querySelector(".panelTags").classList.toggle("active", activeTab === "tags");
      if (activeTab === "toc") renderTOC();
      if (activeTab === "search") renderSearch();
      if (activeTab === "tags") renderTags();
      if (!options.silent) markStateChanged();
    }

    function getNodeIndexById(id) {
      return nodes.findIndex((n) => n.id === id);
    }

    function getFamilyRange(startIdx) {
      if (startIdx < 0 || startIdx >= nodes.length) return [0, 0];
      const level = nodes[startIdx].level;
      let end = startIdx + 1;
      while (end < nodes.length && nodes[end].level > level) end += 1;
      return [startIdx, end];
    }

    function getAncestorIndices(idx) {
      const out = [];
      if (idx < 0 || idx >= nodes.length) return out;
      let wantLessThan = nodes[idx].level;
      for (let i = idx - 1; i >= 0; i--) {
        if (nodes[i].level < wantLessThan) {
          out.unshift(i);
          wantLessThan = nodes[i].level;
          if (wantLessThan <= 1) break;
        }
      }
      return out;
    }

    function getDirectChildCount(idx) {
      const baseLevel = nodes[idx].level;
      let count = 0;
      for (let i = idx + 1; i < nodes.length; i++) {
        if (nodes[i].level <= baseLevel) break;
        if (nodes[i].level === baseLevel + 1) count += 1;
      }
      return count;
    }

    function getDescendantCount(idx) {
      if (idx < 0 || idx >= nodes.length) return 0;
      const [start, end] = getFamilyRange(idx);
      return Math.max(0, end - start - 1);
    }

    function getIndirectChildCount(idx) {
      return Math.max(0, getDescendantCount(idx) - getDirectChildCount(idx));
    }

    function getDirectChildRootIndices(idx) {
      const out = [];
      if (idx < 0 || idx >= nodes.length) return out;
      const baseLevel = nodes[idx].level;
      for (let i = idx + 1; i < nodes.length; i++) {
        if (nodes[i].level <= baseLevel) break;
        if (nodes[i].level === baseLevel + 1) out.push(i);
      }
      return out;
    }

    function computeHiddenIndices() {
      const hidden = new Set();
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        if (!n.isCollapsed) continue;
        for (let j = i + 1; j < nodes.length; j++) {
          if (nodes[j].level > n.level) hidden.add(j);
          else break;
        }
      }
      return hidden;
    }

    function computeVisibleTOCIndices() {
      const visible = [];
      const collapsedStack = [];

      for (let i = 0; i < nodes.length; i++) {
        const level = nodes[i].level;

        while (collapsedStack.length && level <= collapsedStack[collapsedStack.length - 1]) {
          collapsedStack.pop();
        }

        if (collapsedStack.length) continue;

        visible.push(i);

        if (nodes[i].isCollapsed) {
          collapsedStack.push(level);
        }
      }

      return visible;
    }

    function isIndexInsideFamily(candidateIdx, rootIdx) {
      if (candidateIdx < 0 || rootIdx < 0) return false;
      const [start, end] = getFamilyRange(rootIdx);
      return candidateIdx >= start && candidateIdx < end;
    }

    function revealNode(id) {
      const idx = getNodeIndexById(id);
      if (idx < 0) return;
      getAncestorIndices(idx).forEach((ancestorIdx) => {
        nodes[ancestorIdx].isCollapsed = false;
      });
      activeNodeId = id;
      pendingScrollId = id;
    }

    function setActiveNode(id) {
      activeNodeId = activeNodeId === id ? "" : id;
      root.querySelectorAll(".node").forEach((nodeEl) => {
        nodeEl.classList.toggle("activeNode", nodeEl.getAttribute("data-node-id") === activeNodeId);
      });
      markStateChanged();
    }

    function updateNodeMetric(nodeEl, nodeId) {
      if (!nodeEl) return;
      const idx = getNodeIndexById(nodeId);
      if (idx < 0) return;

      const metricWords = nodeEl.querySelector(".nodeMetricWords");
      const directMetric = nodeEl.querySelector(".nodeMetricDirect");
      const indirectMetric = nodeEl.querySelector(".nodeMetricIndirect");

      const ownWords = countWords(nodes[idx].title) + countWords(nodes[idx].body);
      const direct = getDirectChildCount(idx);
      const indirect = getIndirectChildCount(idx);

      if (metricWords) metricWords.textContent = `${ownWords}w`;
      if (directMetric) directMetric.textContent = `${direct} direct`;
      if (indirectMetric) indirectMetric.textContent = `${indirect} indirect`;
    }

    function canDropPinnedAfter(targetId) {
      const pinnedIdx = getNodeIndexById(pinnedRootId);
      const targetIdx = getNodeIndexById(targetId);
      if (pinnedIdx < 0 || targetIdx < 0) return false;
      if (pinnedRootId === targetId) return false;
      if (isIndexInsideFamily(targetIdx, pinnedIdx)) return false;
      return true;
    }

    function buildBranchMarkdownById(id) {
      const idx = getNodeIndexById(id);
      if (idx < 0) return "";
      const [start, end] = getFamilyRange(idx);
      return nodesToMarkdown("", nodes.slice(start, end));
    }

    async function copyTextToClipboard(text) {
      let ok = false;

      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(text);
          ok = true;
        } else {
          ok = copyTextFallback(text);
        }
      } catch (_) {
        ok = copyTextFallback(text);
      }

      if (ok) {
        copiedSinceChange = true;
        setCopyBadge();
        markStateChanged();
      } else if (copyBadge) {
        copyBadge.className = "metaBadge warn jsCopyBadge";
        copyBadge.textContent = "Copy failed";
      }

      return ok;
    }

    async function copyNodeBranch(id, triggerEl) {
      const text = buildBranchMarkdownById(id);
      if (!text) return false;

      const ok = await copyTextToClipboard(text);
      if (ok && triggerEl) {
        const original = triggerEl.textContent;
        triggerEl.textContent = "Copied";
        setTimeout(() => {
          if (triggerEl.isConnected) triggerEl.textContent = original;
        }, 1000);
      }
      return ok;
    }

    function renderStructure() {
      updateSummary();
      const scrollY = window.scrollY;
      const hidden = computeHiddenIndices();
      const frag = document.createDocumentFragment();

      nodes.forEach((n, idx) => {
        if (hidden.has(idx)) return;

        const hasChildren = idx + 1 < nodes.length && nodes[idx + 1].level > n.level;
        const directChildren = getDirectChildCount(idx);
        const indirectChildren = getIndirectChildCount(idx);
        const ownWords = countWords(n.title) + countWords(n.body);
        const canDropPinned = canDropPinnedAfter(n.id);
        const pinIsActive = pinnedRootId === n.id;
        const pinIsTarget = !!pinnedRootId && !pinIsActive && canDropPinned;

        const pinTitle = !pinnedRootId
          ? "Pin this branch to move it"
          : pinIsActive
            ? "Cancel pinned move"
            : canDropPinned
              ? "Move pinned branch after this one"
              : "Cannot move pinned branch here";

        const nodeEl = document.createElement("div");
        nodeEl.className = `node${activeNodeId === n.id ? " activeNode" : ""}${n.level > 1 ? " indentGuide" : ""}${pinnedRootId === n.id ? " pinnedNode" : ""}`;
        nodeEl.setAttribute("data-node-id", n.id);
        nodeEl.style.setProperty("--indent", `${(n.level - 1) * 22}px`);

        nodeEl.innerHTML = `
          <div class="nodeHeader">
            <div class="headerLeft">
              <div class="infoPill">H${n.level}</div>
              <button class="pillBtn" data-action="collapse" ${hasChildren ? "" : "disabled"}>${hasChildren ? (n.isCollapsed ? "▶" : "▼") : "•"}</button>
              <button
                class="pinBtn${pinIsActive ? " active" : ""}${pinIsTarget ? " target" : ""}"
                data-action="pin"
                title="${escapeHtml(pinTitle)}"
                aria-label="${escapeHtml(pinTitle)}"
              >📌</button>
              <div class="infoPill nodeMetricWords">${ownWords}w</div>
              <div class="infoPill nodeMetricDirect">${directChildren} direct</div>
              <div class="infoPill nodeMetricIndirect">${indirectChildren} indirect</div>
              ${pinnedRootId === n.id ? `<div class="infoPill">Pinned</div>` : ""}
            </div>
            <div class="headerRight">
              <button class="miniBtn" data-action="copy-node">Copy node</button>
              <button class="miniBtn" data-action="body">${n.showBody ? "Hide body" : "Show body"}</button>
              <button class="miniBtn" data-action="add">Add after</button>
              <button class="miniBtn" data-action="paste">Paste after</button>
              <button class="miniBtn" data-action="outdent">←</button>
              <button class="miniBtn" data-action="indent">→</button>
            </div>
            <div class="nodeTitleWrap">
              <textarea class="titleInput" data-type="title" placeholder="Heading text..."></textarea>
            </div>
          </div>
          <div class="bodyWrap${n.showBody ? " show" : ""}">
            <textarea class="bodyInput" data-type="body" placeholder="Body text..."></textarea>
          </div>
          <div class="tools">
            <button class="ghost" data-action="unwrap" ${directChildren ? "" : "disabled"}>Unwrap children</button>
            <button class="warn" data-action="delete">Delete branch</button>
          </div>
        `;

        const titleTA = nodeEl.querySelector(".titleInput");
        const bodyTA = nodeEl.querySelector(".bodyInput");
        titleTA.value = n.title || "";
        bodyTA.value = n.body || "";
        autoResizeTA(titleTA);
        autoResizeTA(bodyTA);
        frag.appendChild(nodeEl);
      });

      canvas.innerHTML = "";
      canvas.appendChild(frag);

      requestAnimationFrame(() => {
        window.scrollTo({ top: scrollY, left: window.scrollX, behavior: "auto" });

        if (pendingFocus && pendingFocus.id) {
          const nodeEl = canvas.querySelector(`.node[data-node-id="${pendingFocus.id}"]`);
          if (nodeEl) {
            const field = nodeEl.querySelector(`[data-type="${pendingFocus.field}"]`) || nodeEl.querySelector("[data-type='title']");
            if (field) {
              field.focus();
              const len = field.value.length;
              try {
                field.setSelectionRange(len, len);
              } catch (_) {
                // ignore
              }
              autoResizeTA(field);
            }
          }
          pendingFocus = null;
        }

        if (pendingScrollId) {
          const nodeEl = canvas.querySelector(`.node[data-node-id="${pendingScrollId}"]`);
          if (nodeEl) {
            nodeEl.scrollIntoView({ block: "center", behavior: "smooth" });
          }
          pendingScrollId = null;
        }
      });
    }

    function buildSimpleTOCText() {
      const visibleIndices = computeVisibleTOCIndices();

      return visibleIndices.map((idx) => {
        const n = nodes[idx];
        const hasChildren = idx + 1 < nodes.length && nodes[idx + 1].level > n.level;
        const marker = hasChildren ? (n.isCollapsed ? "▶" : "▼") : "•";
        const indent = "  ".repeat(Math.max(0, n.level - 1));
        const title = String(n.title || "").trim() || "(untitled heading)";
        return `${indent}${marker} ${title} [H${n.level}]`;
      }).join("\n");
    }

    function renderTOC() {
      tocList.innerHTML = "";

      if (!nodes.length) {
        tocMeta.textContent = "Load Markdown first, then view contents.";
        return;
      }

      const visibleIndices = computeVisibleTOCIndices();
      tocMeta.textContent = `${visibleIndices.length} visible heading${visibleIndices.length === 1 ? "" : "s"}. Tap a heading to jump to it in Structure.`;

      const frag = document.createDocumentFragment();

      visibleIndices.forEach((idx) => {
        const n = nodes[idx];
        const hasChildren = idx + 1 < nodes.length && nodes[idx + 1].level > n.level;
        const marker = hasChildren ? (n.isCollapsed ? "▶" : "▼") : "•";

        const row = document.createElement("div");
        row.className = "tocItem";
        row.style.setProperty("--toc-indent", `${(n.level - 1) * 18}px`);

        row.innerHTML = `
          <div class="tocHead">
            <button
              class="tocMarker tocMarkerBtn${hasChildren ? "" : " none"}"
              data-action="toc-toggle"
              data-node-id="${escapeHtml(n.id)}"
              ${hasChildren ? "" : "disabled"}
              aria-label="${hasChildren ? (n.isCollapsed ? "Expand branch" : "Collapse branch") : "No children"}"
              title="${hasChildren ? (n.isCollapsed ? "Expand branch" : "Collapse branch") : "No children"}"
            >${marker}</button>

            <button class="tocJumpBody" data-jump-id="${escapeHtml(n.id)}">
              <div class="tocTitleRow">
                <div class="tocItemTitle">${escapeHtml(n.title || "(untitled heading)")}</div>
                <div class="tocLevel">H${n.level}</div>
              </div>
            </button>
          </div>
        `;

        frag.appendChild(row);
      });

      tocList.appendChild(frag);
    }

    function resultExcerpt(node, query) {
      const hay = `${node.title}\n${node.body}`.trim();
      if (!hay) return "(empty node)";
      if (!query) return hay.slice(0, 220);
      const lowerHay = hay.toLowerCase();
      const lowerQuery = query.toLowerCase();
      const idx = lowerHay.indexOf(lowerQuery);
      if (idx < 0) return hay.slice(0, 220);
      const start = Math.max(0, idx - 60);
      const end = Math.min(hay.length, idx + query.length + 120);
      const prefix = start > 0 ? "…" : "";
      const suffix = end < hay.length ? "…" : "";
      return `${prefix}${hay.slice(start, end)}${suffix}`;
    }

    function renderSearch() {
      const q = searchQuery.trim().toLowerCase();
      searchResults.innerHTML = "";

      if (!q) {
        searchMeta.textContent = nodes.length
          ? "Type in the box to search titles and body text."
          : "Load Markdown first, then search.";
        return;
      }

      const hits = nodes
        .map((n) => ({ n }))
        .filter(({ n }) => (`${n.title}\n${n.body}`).toLowerCase().includes(q));

      searchMeta.textContent = `${hits.length} match${hits.length === 1 ? "" : "es"}`;

      if (!hits.length) return;

      const frag = document.createDocumentFragment();
      hits.forEach(({ n }) => {
        const btn = document.createElement("button");
        btn.className = "searchItem";
        btn.setAttribute("data-jump-id", n.id);
        btn.innerHTML = `
          <div class="searchItemTitle">${escapeHtml(n.title || "(untitled heading)")}</div>
          <div class="searchItemMeta">H${n.level} · ${countWords(n.title) + countWords(n.body)}w</div>
          <div class="searchItemExcerpt">${escapeHtml(resultExcerpt(n, q))}</div>
        `;
        frag.appendChild(btn);
      });
      searchResults.appendChild(frag);
    }

    function extractCommentTags(text) {
      const out = [];
      const seen = new Set();
      const src = String(text || "").replace(/\r\n?/g, "\n");
      const rx = /(?:^|\n)\s*\\?%%\s*tag\b[ \t]+([^\n]+)/gi;
      let m;

      while ((m = rx.exec(src))) {
        const tail = String(m[1] || "").trim();
        if (!tail) continue;

        const parts = tail.includes(",")
          ? tail.split(",").map((s) => s.trim()).filter(Boolean)
          : [tail];

        parts.forEach((part) => {
          const clean = part.replace(/\s+/g, " ").trim();
          const key = clean.toLowerCase();
          if (!key || seen.has(key)) return;
          seen.add(key);
          out.push(clean);
        });
      }

      return out;
    }

    function buildTagGroups() {
      const map = new Map();

      nodes.forEach((n, idx) => {
        extractCommentTags(n.body).forEach((tag) => {
          const key = tag.toLowerCase();
          let entry = map.get(key);
          if (!entry) {
            entry = { key, label: tag, hits: [] };
            map.set(key, entry);
          }
          entry.hits.push({ n, idx });
        });
      });

      return Array.from(map.values()).sort((a, b) =>
        a.label.localeCompare(b.label, undefined, { sensitivity: "base" })
      );
    }

    function tagLineExcerpt(node, tagKey) {
      const src = String(node.body || "").replace(/\r\n?/g, "\n");
      const rx = /(?:^|\n)\s*\\?%%\s*tag\b[ \t]+([^\n]+)/gi;
      let m;

      while ((m = rx.exec(src))) {
        const rawTail = String(m[1] || "").trim();
        if (!rawTail) continue;

        const parts = rawTail.includes(",")
          ? rawTail.split(",").map((s) => s.trim()).filter(Boolean)
          : [rawTail];

        if (parts.some((part) => part.replace(/\s+/g, " ").trim().toLowerCase() === tagKey)) {
          return `%% tag ${rawTail}`;
        }
      }

      return resultExcerpt(node, tagKey);
    }

    function renderTags() {
      tagsBar.innerHTML = "";
      tagMatches.innerHTML = "";

      if (!nodes.length) {
        tagsMeta.textContent = "Load Markdown first, then view tags.";
        return;
      }

      const groups = buildTagGroups();
      if (!groups.length) {
        activeTag = "";
        tagsMeta.textContent = "No tags found. Use lines such as %% tag something or \\%% tag something anywhere inside a node body.";
        return;
      }

      if (activeTag && !groups.some((g) => g.key === activeTag)) {
        activeTag = "";
      }
      if (!activeTag && groups.length === 1) {
        activeTag = groups[0].key;
      }

      const chipsFrag = document.createDocumentFragment();
      groups.forEach((group) => {
        const btn = document.createElement("button");
        btn.className = `tagChip${activeTag === group.key ? " active" : ""}`;
        btn.setAttribute("data-tag", group.key);
        btn.textContent = `${group.label} (${group.hits.length})`;
        chipsFrag.appendChild(btn);
      });
      tagsBar.appendChild(chipsFrag);

      const totalTaggedNodes = groups.reduce((sum, group) => sum + group.hits.length, 0);
      const activeGroup = groups.find((group) => group.key === activeTag) || null;

      if (!activeGroup) {
        tagsMeta.textContent = `${groups.length} tag${groups.length === 1 ? "" : "s"} across ${totalTaggedNodes} tagged node${totalTaggedNodes === 1 ? "" : "s"}. Tap a tag to view matches.`;
        return;
      }

      tagsMeta.textContent = `${activeGroup.label}: ${activeGroup.hits.length} node${activeGroup.hits.length === 1 ? "" : "s"}`;

      const frag = document.createDocumentFragment();
      activeGroup.hits.forEach(({ n }) => {
        const btn = document.createElement("button");
        btn.className = "searchItem";
        btn.setAttribute("data-jump-id", n.id);
        btn.innerHTML = `
          <div class="searchItemTitle">${escapeHtml(n.title || "(untitled heading)")}</div>
          <div class="searchItemMeta">H${n.level} · ${countWords(n.title) + countWords(n.body)}w</div>
          <div class="searchItemExcerpt">${escapeHtml(tagLineExcerpt(n, activeGroup.key))}</div>
        `;
        frag.appendChild(btn);
      });
      tagMatches.appendChild(frag);
    }

    async function copyAllTagsToClipboard() {
      const groups = buildTagGroups();
      if (!groups.length) {
        tagsMeta.textContent = "No tags to copy yet.";
        return;
      }

      const text = groups.map((group) => group.label).join("\n");
      const ok = await copyTextToClipboard(text);

      if (ok) {
        const base = tagsMeta.textContent;
        tagsMeta.textContent = `Copied ${groups.length} tag${groups.length === 1 ? "" : "s"} to clipboard.`;
        setTimeout(() => {
          if (activeTab === "tags") renderTags();
          else tagsMeta.textContent = base;
        }, 1400);
      } else {
        tagsMeta.textContent = "Copy failed.";
      }
    }

    async function copyTOCToClipboard() {
      if (!nodes.length) {
        tocMeta.textContent = "No headings to copy yet.";
        return;
      }

      const text = buildSimpleTOCText();
      const ok = await copyTextToClipboard(text);

      if (ok) {
        const base = tocMeta.textContent;
        tocMeta.textContent = `Copied ${nodes.length} heading${nodes.length === 1 ? "" : "s"} to clipboard.`;
        setTimeout(() => {
          if (activeTab === "toc") renderTOC();
          else tocMeta.textContent = base;
        }, 1400);
      } else {
        tocMeta.textContent = "Copy failed.";
      }
    }

    function addNewAfter(id) {
      const idx = getNodeIndexById(id);
      if (idx < 0) return;
      pushUndoSnapshot("add node");
      const [, end] = getFamilyRange(idx);
      const level = nodes[idx].level;
      const newNode = {
        id: uid(),
        level,
        title: "",
        body: "",
        showBody: true,
        isCollapsed: false
      };
      nodes.splice(end, 0, newNode);
      activeNodeId = newNode.id;
      pendingFocus = { id: newNode.id, field: "title" };
      renderStructure();
      if (activeTab === "toc") renderTOC();
      markDocChanged();
    }

    function toggleBody(id) {
      const idx = getNodeIndexById(id);
      if (idx < 0) return;
      nodes[idx].showBody = !nodes[idx].showBody;
      renderStructure();
      markStateChanged();
    }

    function toggleCollapse(id, options = {}) {
      const idx = getNodeIndexById(id);
      if (idx < 0) return;
      const hasChildren = idx + 1 < nodes.length && nodes[idx + 1].level > nodes[idx].level;
      if (!hasChildren) return;
      nodes[idx].isCollapsed = !nodes[idx].isCollapsed;
      renderStructure();
      if (activeTab === "toc") renderTOC();

      if (options.silentBadges) persistSilently();
      else markStateChanged();
    }

    function changeLevel(id, delta) {
      const idx = getNodeIndexById(id);
      if (idx < 0) return;
      const [start, end] = getFamilyRange(idx);
      const family = nodes.slice(start, end);
      const topLevel = family[0].level;
      const deepest = family.reduce((max, n) => Math.max(max, n.level), family[0].level);
      const applied = clamp(delta, 1 - topLevel, 6 - deepest);
      if (!applied) return;
      pushUndoSnapshot("change level");
      for (let i = start; i < end; i++) {
        nodes[i].level += applied;
      }
      renderStructure();
      if (activeTab === "toc") renderTOC();
      markDocChanged();
    }

    function deleteBranch(id) {
      const idx = getNodeIndexById(id);
      if (idx < 0) return;
      pushUndoSnapshot("delete branch");
      const [start, end] = getFamilyRange(idx);
      if (pinnedRootId && isIndexInsideFamily(getNodeIndexById(pinnedRootId), idx)) {
        pinnedRootId = "";
      }
      nodes.splice(start, end - start);
      if (activeNodeId === id) {
        activeNodeId = nodes[start] ? nodes[start].id : (nodes[start - 1] ? nodes[start - 1].id : "");
      }
      renderStructure();
      if (activeTab === "toc") renderTOC();
      markDocChanged();
    }

    function movePinnedAfter(targetId) {
      const pinnedIdx = getNodeIndexById(pinnedRootId);
      const targetIdx = getNodeIndexById(targetId);
      if (pinnedIdx < 0 || targetIdx < 0) return false;
      if (!canDropPinnedAfter(targetId)) return false;

      pushUndoSnapshot("move pinned branch");

      const [pinStart, pinEnd] = getFamilyRange(pinnedIdx);
      const branch = cloneNodes(nodes.slice(pinStart, pinEnd));
      nodes.splice(pinStart, pinEnd - pinStart);

      let insertionIdx = targetIdx;
      if (pinStart < targetIdx) insertionIdx -= (pinEnd - pinStart);

      const [, targetEnd] = getFamilyRange(insertionIdx);
      nodes.splice(targetEnd, 0, ...branch);

      activeNodeId = branch[0] ? branch[0].id : activeNodeId;
      pendingScrollId = activeNodeId || null;
      pinnedRootId = "";
      renderStructure();
      if (activeTab === "toc") renderTOC();
      markDocChanged();
      return true;
    }

    function handlePinTap(id) {
      if (!pinnedRootId) {
        pinnedRootId = id;
        activeNodeId = id;
        renderStructure();
        markStateChanged();
        return;
      }

      if (pinnedRootId === id) {
        pinnedRootId = "";
        renderStructure();
        markStateChanged();
        return;
      }

      if (!movePinnedAfter(id)) {
        renderStructure();
      }
    }

    async function readPasteSourceText() {
      try {
        if (navigator.clipboard && navigator.clipboard.readText) {
          const text = await navigator.clipboard.readText();
          if (text && text.trim()) return text;
        }
      } catch (_) {
        // ignore
      }

      const fallback = String(taInput.value || "");
      return fallback.trim() ? fallback : "";
    }

    async function pasteMarkdownAfter(id) {
      const idx = getNodeIndexById(id);
      if (idx < 0) return;

      const raw = await readPasteSourceText();
      if (!raw.trim()) {
        window.alert("Nothing available to paste. Copy Markdown first, or put it in the top textarea and try again.");
        return;
      }

      const parsed = parseMarkdown(raw);
      pushUndoSnapshot("paste markdown");

      if (!parsed.nodes.length) {
        nodes[idx].body = mergeTextParts(nodes[idx].body, parsed.preamble || raw);
        nodes[idx].showBody = true;
        activeNodeId = nodes[idx].id;
        pendingFocus = { id: nodes[idx].id, field: "body" };
        renderStructure();
        if (activeTab === "toc") renderTOC();
        markDocChanged();
        return;
      }

      const peerLevel = nodes[idx].level;
      const toInsert = normalizePastedNodesForPeerLevel(parsed.nodes, peerLevel);
      if (parsed.preamble.trim()) {
        toInsert[0].body = mergeTextParts(parsed.preamble, toInsert[0].body);
        toInsert[0].showBody = true;
      }

      const [, end] = getFamilyRange(idx);
      nodes.splice(end, 0, ...toInsert);
      activeNodeId = toInsert[0].id;
      pendingScrollId = activeNodeId;
      pendingFocus = { id: activeNodeId, field: "title" };
      renderStructure();
      if (activeTab === "toc") renderTOC();
      markDocChanged();
    }

    function unwrapChildren(id) {
      const idx = getNodeIndexById(id);
      if (idx < 0) return;
      const childRoots = getDirectChildRootIndices(idx);
      if (!childRoots.length) return;

      pushUndoSnapshot("unwrap children");

      const parentTitle = String(nodes[idx].title || "").trim();
      const [start, end] = getFamilyRange(idx);

      for (let i = idx + 1; i < end; i++) {
        nodes[i].level = clamp(nodes[i].level - 1, 1, 6);
      }

      childRoots.forEach((childIdx) => {
        if (nodes[childIdx] && parentTitle) {
          nodes[childIdx].body = ensureTagLine(nodes[childIdx].body, parentTitle);
        }
      });

      nodes[idx].isCollapsed = false;
      activeNodeId = nodes[idx].id;
      renderStructure();
      if (activeTab === "toc") renderTOC();
      markDocChanged();
    }

    const scheduleSearchRender = makeRafScheduler(renderSearch);

    root.querySelectorAll(".tabbtn").forEach((btn) => {
      btn.addEventListener("click", () => {
        switchTab(btn.getAttribute("data-tab") || "structure");
      });
    });

    taInput.addEventListener("input", () => {
      markStateChanged();
    });

    btnLoad.addEventListener("click", () => {
      pushUndoSnapshot("load markdown");
      const parsed = parseMarkdown(taInput.value || "");
      nodes = parsed.nodes;
      docPreamble = parsed.preamble;
      activeTag = "";
      activeNodeId = nodes[0] ? nodes[0].id : "";
      pendingScrollId = activeNodeId || null;
      pinnedRootId = "";
      renderStructure();
      if (activeTab === "toc") renderTOC();
      if (activeTab === "search") renderSearch();
      if (activeTab === "tags") renderTags();
      markDocChanged();
    });

    btnUndo.addEventListener("click", () => {
      undoLast();
    });

    btnCopy.addEventListener("click", async () => {
      const text = nodesToMarkdown(docPreamble, nodes);
      await copyTextToClipboard(text);
    });

    btnCopyToc.addEventListener("click", () => {
      copyTOCToClipboard();
    });

    btnCopyTags.addEventListener("click", () => {
      copyAllTagsToClipboard();
    });

    btnReset.addEventListener("click", () => {
      const ok = window.confirm("Reset the app and clear the saved Markdown on this page?");
      if (!ok) return;

      pushUndoSnapshot("reset app");

      nodes = [];
      docPreamble = "";
      activeNodeId = "";
      searchQuery = "";
      activeTag = "";
      pendingFocus = null;
      pendingScrollId = null;
      pinnedRootId = "";
      copiedSinceChange = false;
      pendingTextHistory = null;

      taInput.value = "";
      searchInput.value = "";

      safeStorageRemove(KEY);

      renderStructure();
      renderTOC();
      renderSearch();
      renderTags();
      setCopyBadge();
      persistStateNow();
    });

    searchInput.addEventListener("input", () => {
      searchQuery = searchInput.value || "";
      scheduleSearchRender();
      markStateChanged();
    });

    function jumpToNodeFromPanel(id) {
      revealNode(id);
      switchTab("structure");
      renderStructure();
      markStateChanged();
    }

    tocList.addEventListener("click", (e) => {
      const toggleBtn = e.target.closest('[data-action="toc-toggle"]');
      if (toggleBtn) {
        e.preventDefault();
        e.stopPropagation();
        const id = toggleBtn.getAttribute("data-node-id");
        if (!id) return;
        toggleCollapse(id, { silentBadges: true });
        return;
      }

      const jumpBtn = e.target.closest("[data-jump-id]");
      if (!jumpBtn) return;
      jumpToNodeFromPanel(jumpBtn.getAttribute("data-jump-id"));
    });

    searchResults.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-jump-id]");
      if (!btn) return;
      jumpToNodeFromPanel(btn.getAttribute("data-jump-id"));
    });

    tagsBar.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-tag]");
      if (!btn) return;
      const tag = btn.getAttribute("data-tag") || "";
      activeTag = activeTag === tag ? "" : tag;
      renderTags();
      markStateChanged();
    });

    tagMatches.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-jump-id]");
      if (!btn) return;
      jumpToNodeFromPanel(btn.getAttribute("data-jump-id"));
    });

    canvas.addEventListener("click", async (e) => {
      const actionEl = e.target.closest("[data-action]");
      const nodeEl = e.target.closest(".node");
      if (!nodeEl) return;

      if (e.target.closest("textarea")) return;

      const id = nodeEl.getAttribute("data-node-id");
      if (!id) return;

      if (actionEl) {
        const action = actionEl.getAttribute("data-action");
        if (action === "body") toggleBody(id);
        else if (action === "collapse") toggleCollapse(id);
        else if (action === "pin") handlePinTap(id);
        else if (action === "copy-node") await copyNodeBranch(id, actionEl);
        else if (action === "add") addNewAfter(id);
        else if (action === "paste") await pasteMarkdownAfter(id);
        else if (action === "outdent") changeLevel(id, -1);
        else if (action === "indent") changeLevel(id, 1);
        else if (action === "unwrap") unwrapChildren(id);
        else if (action === "delete") deleteBranch(id);
        return;
      }

      setActiveNode(id);
    });

    canvas.addEventListener("focusin", (e) => {
      const nodeEl = e.target.closest(".node");
      if (!nodeEl) return;
      const id = nodeEl.getAttribute("data-node-id");
      if (!id) return;
      activeNodeId = id;
      root.querySelectorAll(".node").forEach((el) => {
        el.classList.toggle("activeNode", el === nodeEl);
      });
      if (e.target.matches("textarea[data-type]")) {
        pendingTextHistory = snapshotState();
      }
      markStateChanged();
    });

    canvas.addEventListener("keydown", (e) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      if (e.shiftKey) return;
      if (String(e.key || "").toLowerCase() === "z") {
        e.preventDefault();
        undoLast();
      }
    });

    const syncInput = debounce(() => {
      if (activeTab === "toc") renderTOC();
      if (activeTab === "search") scheduleSearchRender();
      if (activeTab === "tags") renderTags();
      updateSummary();
      markDocChanged();
    }, 120);

    canvas.addEventListener("input", (e) => {
      const target = e.target;
      const nodeEl = target.closest(".node");
      if (!nodeEl) return;
      const id = nodeEl.getAttribute("data-node-id");
      const idx = getNodeIndexById(id);
      if (idx < 0) return;
      const node = nodes[idx];

      if (target.matches("textarea[data-type]") && pendingTextHistory) {
        pushUndoSnapshot("text edit", pendingTextHistory);
        pendingTextHistory = null;
      }

      const type = target.getAttribute("data-type");
      if (type === "title") node.title = target.value;
      if (type === "body") node.body = target.value;

      autoResizeTA(target);
      updateNodeMetric(nodeEl, id);
      syncInput();
    });

    const saved = safeStorageGet(KEY);
    if (saved) {
      try {
        const state = JSON.parse(saved);
        nodes = normalizeNodes(state.nodes);
        if (typeof state.docPreamble === "string") docPreamble = state.docPreamble;
        if (typeof state.activeNodeId === "string") activeNodeId = state.activeNodeId;
        if (typeof state.activeTab === "string" && ["structure", "toc", "search", "tags"].includes(state.activeTab)) {
          activeTab = state.activeTab;
        }
        if (typeof state.searchQuery === "string") searchQuery = state.searchQuery;
        if (typeof state.activeTag === "string") activeTag = state.activeTag;
        if (typeof state.rawInput === "string") taInput.value = state.rawInput;
        copiedSinceChange = !!state.copiedSinceChange;
        pinnedRootId = typeof state.pinnedRootId === "string" ? state.pinnedRootId : "";

        if (Array.isArray(state.undoStack)) {
          undoStack = state.undoStack
            .map((entry) => ({
              reason: entry?.reason || "change",
              state: {
                v: 4,
                nodes: normalizeNodes(entry?.state?.nodes),
                docPreamble: typeof entry?.state?.docPreamble === "string" ? entry.state.docPreamble : "",
                activeNodeId: typeof entry?.state?.activeNodeId === "string" ? entry.state.activeNodeId : "",
                activeTab: typeof entry?.state?.activeTab === "string" ? entry.state.activeTab : "structure",
                searchQuery: typeof entry?.state?.searchQuery === "string" ? entry.state.searchQuery : "",
                activeTag: typeof entry?.state?.activeTag === "string" ? entry.state.activeTag : "",
                rawInput: typeof entry?.state?.rawInput === "string" ? entry.state.rawInput : "",
                copiedSinceChange: !!entry?.state?.copiedSinceChange,
                pinnedRootId: typeof entry?.state?.pinnedRootId === "string" ? entry.state.pinnedRootId : ""
              }
            }))
            .slice(-HISTORY_LIMIT);
        }
      } catch (_) {
        // ignore broken saved state
      }
    }

    if (activeNodeId && getNodeIndexById(activeNodeId) < 0) {
      activeNodeId = nodes[0] ? nodes[0].id : "";
    }
    if (pinnedRootId && getNodeIndexById(pinnedRootId) < 0) {
      pinnedRootId = "";
    }

    function handleLifecycleSave() {
      flushSaveNow();
    }

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState !== "visible") {
        handleLifecycleSave();
      }
    });

    window.addEventListener("pagehide", handleLifecycleSave);
    window.addEventListener("beforeunload", handleLifecycleSave);
    
    searchInput.value = searchQuery;
    setCopyBadge();
    updatePinBadge();
    updateUndoButton();
    switchTab(activeTab, { silent: true });
    renderStructure();
    if (activeTab === "toc") renderTOC();
    if (activeTab === "search") renderSearch();
    if (activeTab === "tags") renderTags();
    persistStateNow();
  });
})();
