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

  const STYLE_ID = "siteapps-mdse-style-v2";

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
        width: 100%;
        display: block;
        background: #fff;
        border: 2px solid rgba(0,0,0,.15);
        border-radius: 14px;
        padding: 12px;
        margin: 10px 0;
      }
      .mdse-wrapper .node.activeNode {
        border-color: #0b5fff;
        box-shadow: 0 8px 22px rgba(11,95,255,.08);
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
        border: 2px solid rgba(0,0,0,.15);
        border-radius: 12px;
        padding: 12px 14px;
        font-size: 17px;
        font-weight: 800;
        resize: none;
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
      .mdse-wrapper .indentGuide {
        border-left: 4px solid rgba(11,95,255,.12);
        padding-left: 10px;
      }
      .mdse-wrapper .searchBox {
        margin-bottom: 12px;
      }
      .mdse-wrapper .searchResults,
      .mdse-wrapper .tagMatches {
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
      .mdse-wrapper .searchItem {
        border: 2px solid rgba(0,0,0,.15);
        border-radius: 14px;
        background: #fff;
        padding: 12px;
        text-align: left;
        width: 100%;
      }
      .mdse-wrapper .searchItemTitle {
        font-size: 16px;
        font-weight: 800;
        margin-bottom: 6px;
      }
      .mdse-wrapper .searchItemMeta {
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
      @media (max-width: 700px) {
        .mdse-wrapper { padding: 14px; }
        .mdse-wrapper .headerRight { margin-left: 0; }
      }
    `;
  }

  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const uid = () => `n_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;

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

  function safeStorageSet(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (_) {
      // ignore storage failures
    }
  }

  function safeStorageRemove(key) {
    try {
      localStorage.removeItem(key);
    } catch (_) {
      // ignore storage failures
    }
  }

  function copyTextFallback(text) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "readonly");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    ta.style.top = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
    } catch (_) {
      // ignore
    }
    document.body.removeChild(ta);
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

  window.SiteApps.register("mdseStage", (container) => {
    ensureStyle();

    const KEY = `siteapps:mdseStage:v2:${location.pathname}`;

    let nodes = [];
    let docPreamble = "";
    let activeNodeId = "";
    let activeTab = "structure";
    let searchQuery = "";
    let activeTag = "";
    let pendingFocus = null;
    let pendingScrollId = null;

    container.innerHTML = `
      <div class="mdse-wrapper">
        <div class="tabs">
          <button class="tabbtn active" data-tab="structure">Structure</button>
          <button class="tabbtn" data-tab="search">Search</button>
          <button class="tabbtn" data-tab="tags">Tags</button>
        </div>

        <div class="tabPanel panelStructure active">
          <textarea class="mdInput" placeholder="Paste Markdown here..."></textarea>
          <div class="btnrow">
            <button class="primary btnLoad">Load Markdown</button>
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

        <div class="tabPanel panelSearch">
          <div class="searchBox">
            <input class="searchInput" type="text" placeholder="Search titles and body text...">
          </div>
          <div class="muted searchMeta">No search yet.</div>
          <div class="searchResults"></div>
        </div>

        <div class="tabPanel panelTags">
          <div class="muted tagsMeta">No tags yet.</div>
          <div class="tagsBar"></div>
          <div class="tagMatches"></div>
        </div>
      </div>
    `;

    const root = container.querySelector(".mdse-wrapper");
    const taInput = root.querySelector(".mdInput");
    const btnLoad = root.querySelector(".btnLoad");
    const btnCopy = root.querySelector(".btnCopy");
    const btnReset = root.querySelector(".btnReset");
    const canvas = root.querySelector(".canvas");
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

    const saveState = debounce(() => {
      safeStorageSet(KEY, JSON.stringify({
        nodes,
        docPreamble,
        activeNodeId,
        activeTab,
        searchQuery,
        activeTag,
        rawInput: taInput.value || ""
      }));
    }, 180);

    function totalWords() {
      return nodes.reduce((sum, n) => sum + countWords(n.title) + countWords(n.body), 0);
    }

    function updateSummary() {
      summaryNodes.textContent = `${nodes.length} ${nodes.length === 1 ? "node" : "nodes"}`;
      summaryWords.textContent = `${totalWords()} ${totalWords() === 1 ? "word" : "words"}`;
      summaryPreamble.textContent = docPreamble.trim() ? "Preamble preserved" : "No preamble";

      if (docPreamble.trim()) {
        preambleNote.innerHTML = `<div class="note"><strong>Note:</strong> Text before the first heading has been preserved and will be included when you copy the result.</div>`;
      } else {
        preambleNote.innerHTML = "";
      }
    }

    function switchTab(tab) {
      activeTab = tab === "search" || tab === "tags" ? tab : "structure";
      root.querySelectorAll(".tabbtn").forEach((btn) => {
        btn.classList.toggle("active", btn.getAttribute("data-tab") === activeTab);
      });
      root.querySelector(".panelStructure").classList.toggle("active", activeTab === "structure");
      root.querySelector(".panelSearch").classList.toggle("active", activeTab === "search");
      root.querySelector(".panelTags").classList.toggle("active", activeTab === "tags");
      if (activeTab === "search") renderSearch();
      if (activeTab === "tags") renderTags();
      saveState();
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
      saveState();
    }

    function updateNodeMetric(nodeEl, node) {
      const metric = nodeEl.querySelector(".nodeMetric");
      if (metric) {
        const ownWords = countWords(node.title) + countWords(node.body);
        metric.textContent = `${ownWords}w`;
      }
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
        const ownWords = countWords(n.title) + countWords(n.body);

        const nodeEl = document.createElement("div");
        nodeEl.className = `node${activeNodeId === n.id ? " activeNode" : ""}${n.level > 1 ? " indentGuide" : ""}`;
        nodeEl.setAttribute("data-node-id", n.id);

        nodeEl.innerHTML = `
          <div class="nodeHeader">
            <div class="headerLeft">
              <div class="infoPill">H${n.level}</div>
              <button class="pillBtn" data-action="collapse" ${hasChildren ? "" : "disabled"}>${hasChildren ? (n.isCollapsed ? "▶" : "▼") : "•"}</button>
              <div class="infoPill nodeMetric">${ownWords}w</div>
              <div class="infoPill">${directChildren} child${directChildren === 1 ? "" : "ren"}</div>
            </div>
            <div class="headerRight">
              <button class="miniBtn" data-action="body">${n.showBody ? "Hide body" : "Show body"}</button>
              <button class="miniBtn" data-action="add">Add after</button>
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
                // ignore selection failures
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
        .map((n, idx) => ({ n, idx }))
        .filter(({ n }) => (`${n.title}\n${n.body}`).toLowerCase().includes(q));

      searchMeta.textContent = `${hits.length} match${hits.length === 1 ? "" : "es"}`;

      if (!hits.length) return;

      const frag = document.createDocumentFragment();
      hits.forEach(({ n, idx }) => {
        const btn = document.createElement("button");
        btn.className = "searchItem";
        btn.setAttribute("data-jump-id", n.id);
        btn.innerHTML = `
          <div class="searchItemTitle">${escapeHtml(n.title || "(untitled heading)")}</div>
          <div class="searchItemMeta">H${n.level} · Node ${idx + 1} · ${countWords(n.title) + countWords(n.body)}w</div>
          <div class="searchItemExcerpt">${escapeHtml(resultExcerpt(n, q))}</div>
        `;
        frag.appendChild(btn);
      });
      searchResults.appendChild(frag);
    }

    function addNewAfter(id) {
      const idx = getNodeIndexById(id);
      if (idx < 0) return;
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
      saveState();
    }

    function toggleBody(id) {
      const idx = getNodeIndexById(id);
      if (idx < 0) return;
      nodes[idx].showBody = !nodes[idx].showBody;
      renderStructure();
      saveState();
    }

    function toggleCollapse(id) {
      const idx = getNodeIndexById(id);
      if (idx < 0) return;
      const hasChildren = idx + 1 < nodes.length && nodes[idx + 1].level > nodes[idx].level;
      if (!hasChildren) return;
      nodes[idx].isCollapsed = !nodes[idx].isCollapsed;
      renderStructure();
      saveState();
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
      for (let i = start; i < end; i++) {
        nodes[i].level += applied;
      }
      renderStructure();
      saveState();
    }

    function deleteBranch(id) {
      const idx = getNodeIndexById(id);
      if (idx < 0) return;
      const [start, end] = getFamilyRange(idx);
      nodes.splice(start, end - start);
      if (activeNodeId === id) activeNodeId = "";
      renderStructure();
      saveState();
    }

    const scheduleSearchRender = makeRafScheduler(renderSearch);

    root.querySelectorAll(".tabbtn").forEach((btn) => {
      btn.addEventListener("click", () => {
        switchTab(btn.getAttribute("data-tab") || "structure");
      });
    });

    btnLoad.addEventListener("click", () => {
      const parsed = parseMarkdown(taInput.value || "");
      nodes = parsed.nodes;
      docPreamble = parsed.preamble;
      activeTag = "";
      activeNodeId = nodes[0] ? nodes[0].id : "";
      pendingScrollId = activeNodeId || null;
      renderStructure();
      if (activeTab === "search") renderSearch();
      if (activeTab === "tags") renderTags();
      saveState();
    });

    btnCopy.addEventListener("click", async () => {
      const text = nodesToMarkdown(docPreamble, nodes);
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(text);
        } else {
          copyTextFallback(text);
        }
      } catch (_) {
        copyTextFallback(text);
      }
    });

    btnReset.addEventListener("click", () => {
      nodes = [];
      docPreamble = "";
      activeNodeId = "";
      searchQuery = "";
      activeTag = "";
      taInput.value = "";
      searchInput.value = "";
      safeStorageRemove(KEY);
      renderStructure();
      renderSearch();
      renderTags();
    });

    searchInput.addEventListener("input", () => {
      searchQuery = searchInput.value || "";
      scheduleSearchRender();
      saveState();
    });

    function jumpToNodeFromPanel(id) {
      revealNode(id);
      switchTab("structure");
      renderStructure();
      saveState();
    }

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
      saveState();
    });

    tagMatches.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-jump-id]");
      if (!btn) return;
      jumpToNodeFromPanel(btn.getAttribute("data-jump-id"));
    });

    canvas.addEventListener("click", (e) => {
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
        else if (action === "add") addNewAfter(id);
        else if (action === "outdent") changeLevel(id, -1);
        else if (action === "indent") changeLevel(id, 1);
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
      saveState();
    });

    const syncInput = debounce(() => {
      if (activeTab === "search") scheduleSearchRender();
      if (activeTab === "tags") renderTags();
      updateSummary();
      saveState();
    }, 120);

    canvas.addEventListener("input", (e) => {
      const target = e.target;
      const nodeEl = target.closest(".node");
      if (!nodeEl) return;
      const id = nodeEl.getAttribute("data-node-id");
      const idx = getNodeIndexById(id);
      if (idx < 0) return;
      const node = nodes[idx];

      const type = target.getAttribute("data-type");
      if (type === "title") node.title = target.value;
      if (type === "body") node.body = target.value;

      autoResizeTA(target);
      updateNodeMetric(nodeEl, node);
      syncInput();
    });

    const saved = safeStorageGet(KEY);
    if (saved) {
      try {
        const state = JSON.parse(saved);
        if (Array.isArray(state.nodes)) nodes = state.nodes;
        if (typeof state.docPreamble === "string") docPreamble = state.docPreamble;
        if (typeof state.activeNodeId === "string") activeNodeId = state.activeNodeId;
        if (typeof state.activeTab === "string") activeTab = ["structure", "search", "tags"].includes(state.activeTab) ? state.activeTab : "structure";
        if (typeof state.searchQuery === "string") searchQuery = state.searchQuery;
        if (typeof state.activeTag === "string") activeTag = state.activeTag;
        if (typeof state.rawInput === "string") taInput.value = state.rawInput;
      } catch (_) {
        // ignore broken saved state
      }
    }

    searchInput.value = searchQuery;
    switchTab(activeTab);
    renderStructure();
    if (activeTab === "search") renderSearch();
    if (activeTab === "tags") renderTags();
  });
})();
