(() => {
  "use strict";

  // -- SiteApps registry --
  window.SiteApps = window.SiteApps || {};
  window.SiteApps.registry = window.SiteApps.registry || {};
  window.SiteApps.register = window.SiteApps.register || function (name, initFn) {
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
      [data-app="mdse"] {
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
      [data-app="mdse"], [data-app="mdse"] * { box-sizing: border-box; }
      [data-app="mdse"] h3 { margin: 0 0 10px; font-size: 18px; }
      [data-app="mdse"] .muted { color: #444; font-size: 13px; font-weight: 700; }
      [data-app="mdse"] textarea, [data-app="mdse"] input, [data-app="mdse"] select {
        border: 2px solid #111; border-radius: 12px; padding: 12px;
        font-size: 16px; line-height: 1.35; background: #fbfbfb; color: #111;
      }
      [data-app="mdse"] .mdInput { display: block; width: 100%; max-height: 400px; overflow-y: auto; margin-bottom: 12px; resize: vertical; }
      [data-app="mdse"] button {
        border: 2px solid #111; border-radius: 999px; padding: 8px 14px;
        font-weight: 800; font-size: 13px; background: #fff; color: #111;
        cursor: pointer; transition: transform 0.1s;
      }
      [data-app="mdse"] button.primary { background: #111; color: #fff; }
      [data-app="mdse"] button.warn { border-color: #a00; color: #a00; background: #fffafa; }
      [data-app="mdse"] button:hover { opacity: 0.85; }
      [data-app="mdse"] button:active { transform: scale(0.96); }
      [data-app="mdse"] .btnrow { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; margin: 12px 0; }
      [data-app="mdse"] .hdr { display: flex !important; flex-wrap: wrap; align-items: center; gap: 10px; width: 100% !important; margin-bottom: 8px; }
      [data-app="mdse"] .title { flex: 1 1 100%; width: 100% !important; display: block; border: 2px solid rgba(0,0,0,.15); border-radius: 12px; padding: 12px 14px; font-size: 17px; font-weight: 800; resize: none; overflow: hidden; background: #fbfbfb; }
      [data-app="mdse"] .tabs { display: flex; gap: 10px; flex-wrap: wrap; margin: 6px 0 10px; }
      [data-app="mdse"] .tabbtn.active { background: #111; color: #fff; }
      [data-app="mdse"] .tabPanel { display: none; width: 100%; }
      [data-app="mdse"] .tabPanel.active { display: block; }
      [data-app="mdse"] .node { width: 100%; display: block; background: #fff; border: 2px solid rgba(0,0,0,.15); border-radius: 14px; padding: 12px; margin: 10px 0; }
      [data-app="mdse"] .node.activeNode { border-color: #0b5fff; box-shadow: 0 8px 22px rgba(11,95,255,.08); }
      [data-app="mdse"] .node.activeNode .tools { display: flex !important; }
      [data-app="mdse"] .node .tools { display: none; flex-wrap: wrap; gap: 6px; margin-top: 10px; padding-top: 10px; border-top: 1px solid #eee; }
      [data-app="mdse"] .body { display: none; margin-top: 10px; }
      [data-app="mdse"] .body.show { display: block; }
      [data-app="mdse"] .node.movingSource { background: #fff9c4; border: 2px dashed #fbc02d; }
      [data-app="mdse"] .node.moveTarget { border: 2px dashed #4caf50; cursor: pointer; }
      [data-app="mdse"] .pill { border: 2px solid #111; border-radius: 12px; padding: 4px 8px; font-weight: 900; font-size: 12px; background: #fff; cursor: pointer; }
      [data-app="mdse"] .miniTools { display: flex; gap: 4px; margin-left: auto; }
      [data-app="mdse"] .miniBtn { border: 1px solid #ddd; padding: 4px 8px; border-radius: 6px; font-size: 12px; background: #fff; cursor: pointer; }
      [data-app="mdse"] .miniBtn.primary { background: #0b5fff; color: #fff; border-color: #0b5fff; }
    `;
  }

  // -- Utilities --
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const uid = () => `n_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;

  function debounce(fn, ms) {
    let timer = null;
    const wrapper = (...args) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => { timer = null; fn(...args); }, ms);
    };
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

  function el(tag, attrs, children) {
    const e = document.createElement(tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (k === "class") e.className = v;
        else if (k === "text") e.textContent = v;
        else if (k === "html") e.innerHTML = v;
        else if (k === "disabled") e.disabled = !!v;
        else e.setAttribute(k, v);
      }
    }
    if (children) {
      const arr = Array.isArray(children) ? children : [children];
      for (const c of arr) {
        if (typeof c === "string" || typeof c === "number") e.appendChild(document.createTextNode(c));
        else if (c instanceof HTMLElement) e.appendChild(c);
      }
    }
    return e;
  }

  function autoResizeTA(ta) {
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = (ta.scrollHeight + 2) + "px";
  }

  function countWords(text) {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
  }

  // -- Core App --
  window.SiteApps.register("mdse", (container) => {
    ensureStyle();
    
    // State
    let nodes = [];
    let activeNodeId = "";
    let sourceId = null;
    let maxVisibleLevel = 6;
    let activeTab = "structure";
    const KEY = `siteapps:mdse:${location.pathname}`;

    // Initialization: Inject HTML first to ensure DOM refs work
    container.innerHTML = `
      <div data-app="mdse">
        <div class="status-header">
          <div class="btnrow">
            <button class="tabbtn tabStructure active" data-tab="structure">Structure</button>
            <button class="tabbtn tabSearch" data-tab="search">Search</button>
          </div>
        </div>
        <div class="tabPanel panelStructure active">
          <textarea class="mdInput" placeholder="Paste Markdown here..."></textarea>
          <div class="btnrow">
            <button class="primary btnLoad">Load Markdown</button>
            <button class="btnCopy">Copy Result</button>
          </div>
          <div class="canvas"></div>
        </div>
        <div class="tabPanel panelSearch">
          <div class="muted">Search functionality initialized...</div>
        </div>
      </div>
    `;

    const canvas = container.querySelector(".canvas");
    const taInput = container.querySelector(".mdInput");

    // Schedulers
    const scheduleRender = makeRafScheduler(() => renderStructure());

    // O(n) Metrics Pass
    function computeNodeMetrics() {
      const metrics = new Map();
      nodes.forEach(n => metrics.set(n.id, { 
        hasChildren: false, directChildren: 0, subtreeCount: 0, 
        wordCount: countWords(n.title) + countWords(n.body) 
      }));

      for (let i = nodes.length - 1; i >= 0; i--) {
        const current = nodes[i];
        const m = metrics.get(current.id);
        for (let j = i - 1; j >= 0; j--) {
          if (nodes[j].level < current.level) {
            const pM = metrics.get(nodes[j].id);
            pM.hasChildren = true;
            pM.subtreeCount += (1 + m.subtreeCount);
            pM.wordCount += m.wordCount;
            if (nodes[j].level === current.level - 1) pM.directChildren++;
            break; 
          }
        }
      }
      return metrics;
    }

    // Actions
    function toggleBody(id) {
      const n = nodes.find(x => x.id === id);
      if (n) n.showBody = !n.showBody;
      scheduleRender();
    }

    function toggleBranchCollapse(id) {
      const n = nodes.find(x => x.id === id);
      if (n) n.isCollapsed = !n.isCollapsed;
      scheduleRender();
    }

    function changeLevel(id, delta) {
      const n = nodes.find(x => x.id === id);
      if (n) n.level = clamp(n.level + delta, 1, 6);
      scheduleRender();
    }

    function addNewAfter(id) {
      const idx = nodes.findIndex(x => x.id === id);
      const newNode = { id: uid(), level: nodes[idx]?.level || 1, title: "", body: "", showBody: true };
      nodes.splice(idx + 1, 0, newNode);
      scheduleRender();
    }

    // Render Logic
    function renderStructure() {
      canvas.innerHTML = "";
      const metrics = computeNodeMetrics();
      const hiddenIndices = new Set();
      
      // Calculate visibility based on collapse
      nodes.forEach((n, i) => {
        if (n.isCollapsed) {
          for (let j = i + 1; j < nodes.length; j++) {
            if (nodes[j].level > n.level) hiddenIndices.add(j);
            else break;
          }
        }
      });

      nodes.forEach((n, i) => {
        if (hiddenIndices.has(i)) return;

        const m = metrics.get(n.id);
        const nodeClass = `node level-${n.level} ${activeNodeId === n.id ? "activeNode" : ""}`;
        
        const nodeEl = el("div", { class: nodeClass, "data-node-id": n.id }, [
          el("div", { class: "hdr" }, [
            el("div", { class: "pill", text: `H${n.level}` }),
            el("div", { class: "pill", text: m.hasChildren ? (n.isCollapsed ? "▶" : "▼") : "•", "data-action": "collapse" }),
            el("div", { class: "muted", text: `${m.wordCount}w` }),
            el("div", { class: "miniTools" }, [
              el("button", { class: "miniBtn", text: "📝", "data-action": "body" }),
              el("button", { class: "miniBtn", text: "+", "data-action": "add" }),
              el("button", { class: "miniBtn", text: "←", "data-action": "outdent" }),
              el("button", { class: "miniBtn", text: "→", "data-action": "indent" })
            ]),
            el("textarea", { class: "title", text: n.title, "data-type": "title" })
          ]),
          el("div", { class: "body" + (n.showBody ? " show" : "") }, [
            el("textarea", { class: "mdInput", text: n.body, "data-type": "body" })
          ]),
          el("div", { class: "tools" }, [
            el("button", { class: "warn", text: "Delete Node", "data-action": "delete" })
          ])
        ]);

        canvas.appendChild(nodeEl);
        nodeEl.querySelectorAll("textarea").forEach(autoResizeTA);
      });
    }

    // Event Delegation
    canvas.addEventListener("click", (e) => {
      const target = e.target;
      const action = target.getAttribute("data-action");
      const nodeEl = target.closest(".node");
      if (!nodeEl) return;
      const id = nodeEl.getAttribute("data-node-id");

      if (action === "body") toggleBody(id);
      else if (action === "collapse") toggleBranchCollapse(id);
      else if (action === "add") addNewAfter(id);
      else if (action === "outdent") changeLevel(id, -1);
      else if (action === "indent") changeLevel(id, 1);
      else if (action === "delete") {
        nodes = nodes.filter(n => n.id !== id);
        scheduleRender();
      } else {
        activeNodeId = (activeNodeId === id) ? "" : id;
        scheduleRender();
      }
    });

    canvas.addEventListener("input", (e) => {
      const target = e.target;
      const nodeEl = target.closest(".node");
      if (!nodeEl) return;
      const id = nodeEl.getAttribute("data-node-id");
      const n = nodes.find(x => x.id === id);
      
      if (target.getAttribute("data-type") === "title") n.title = target.value;
      if (target.getAttribute("data-type") === "body") n.body = target.value;
      
      autoResizeTA(target);
    });

    // Load Logic
    container.querySelector(".btnLoad").addEventListener("click", () => {
      const lines = taInput.value.split("\n");
      nodes = [];
      let current = null;
      lines.forEach(line => {
        const m = line.match(/^(#{1,6})\s+(.*)/);
        if (m) {
          current = { id: uid(), level: m[1].length, title: m[2], body: "", showBody: false, isCollapsed: false };
          nodes.push(current);
        } else if (current) {
          current.body += line + "\n";
        }
      });
      scheduleRender();
    });

    scheduleRender();
  });
})();
