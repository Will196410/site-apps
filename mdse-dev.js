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

  const STYLE_ID = "siteapps-mdse-style-v5";
  const BUILD_CREATED_STAMP = "02 Apr 2026 · Gemini-3.0 Stable";

  function formatBrowserRunStamp() {
    try {
      const dt = new Date();
      return dt.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
      }) + " · " + (Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
    } catch (_) { return "Unavailable"; }
  }

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .mdse-wrapper {
        font-family: system-ui, -apple-system, sans-serif;
        width: min(100%, 1280px);
        margin: 14px auto;
        border: 2px solid #111;
        border-radius: 16px;
        padding: 18px;
        background: #fff;
        color: #111;
      }
      .mdse-wrapper * { box-sizing: border-box; }
      .mdse-wrapper .topMeta { display:flex; gap:10px; align-items:center; margin-bottom:12px; padding-bottom:12px; border-bottom:1px solid #eee; }
      .mdse-wrapper .tabs { display: flex; gap: 8px; margin-bottom: 12px; }
      .mdse-wrapper button { border: 2px solid #111; border-radius: 999px; padding: 6px 12px; font-weight: 800; cursor: pointer; background: #fff; transition: 0.1s; }
      .mdse-wrapper button.active { background: #111; color: #fff; }
      .mdse-wrapper button:hover:not(:disabled) { background: #f0f0f0; }
      .mdse-wrapper button.primary { background: #111; color: #fff; }
      .mdse-wrapper textarea { width: 100%; border: 2px solid #111; border-radius: 12px; padding: 12px; font-size: 16px; background: #fbfbfb; }
      .mdse-wrapper .tabPanel { display: none; }
      .mdse-wrapper .tabPanel.active { display: block; }
      .mdse-wrapper .node { margin: 10px 0; border: 2px solid rgba(0,0,0,.1); border-radius: 12px; padding: 10px; background: #fff; }
      .mdse-wrapper .node.activeNode { border-color: #0b5fff; box-shadow: 0 4px 12px rgba(11,95,255,.1); }
      .mdse-wrapper .metaBadge { font-size: 11px; font-weight: 900; padding: 3px 8px; border: 2px solid #111; border-radius: 999px; }
      .mdse-wrapper .metaBadge.good { border-color: #2e7d32; color: #2e7d32; }
      .mdse-wrapper .metaBadge.warn { border-color: #d32f2f; color: #d32f2f; }
      .mdse-wrapper .titleInput { font-weight: 800; font-size: 1.1rem; border-color: transparent; background: transparent; resize: none; overflow: hidden; }
      .mdse-wrapper .titleInput:focus { background: #fff; border-color: #ddd; }
      .mdse-wrapper .bodyInput { min-height: 80px; margin-top: 8px; }
      .mdse-wrapper .nodeHeader { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
      .mdse-wrapper .btnRow { display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap; }
      .mdse-wrapper .summaryPill { font-size: 12px; font-weight: 700; background: #eee; padding: 4px 10px; border-radius: 999px; }
      .mdse-wrapper .bottomMeta { margin-top: 20px; padding-top: 12px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
    `;
    document.head.appendChild(style);
  }

  const uid = () => `n_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  window.SiteApps.register("mdseStage", (container) => {
    ensureStyle();

    const STORAGE_KEY = `siteapps_outliner_v5_global`;
    let nodes = [];
    let docPreamble = "";
    let activeNodeId = "";
    let activeTab = "structure";
    let undoStack = [];

    container.innerHTML = `
      <div class="mdse-wrapper">
        <div class="topMeta">
          <span class="metaBadge good jsSaveBadge">Saved ✓</span>
          <span class="summaryPill jsNodeCount">0 Nodes</span>
          <span class="summaryPill jsWordCount">0 Words</span>
        </div>

        <div class="tabs">
          <button class="tabbtn active" data-tab="structure">Structure</button>
          <button class="tabbtn" data-tab="raw">Source</button>
        </div>

        <div class="tabPanel panelStructure active">
          <div class="btnRow">
            <button class="primary btnAdd">＋ Add Node</button>
            <button class="btnUndo">Undo</button>
            <button class="btnCopy">Copy Markdown</button>
            <button class="warn btnReset">Reset</button>
          </div>
          <div class="canvas" style="margin-top:20px;"></div>
        </div>

        <div class="tabPanel panelRaw">
          <textarea class="rawInput" style="min-height:300px;" placeholder="Paste Markdown here..."></textarea>
          <div class="btnRow">
            <button class="primary btnImport">Import from Source</button>
          </div>
        </div>

        <div class="bottomMeta">
          <div>Build: ${BUILD_CREATED_STAMP}</div>
          <div class="jsRunStamp">Run: ${formatBrowserRunStamp()}</div>
        </div>
      </div>
    `;

    const canvas = container.querySelector(".canvas");
    const saveBadge = container.querySelector(".jsSaveBadge");
    const rawInput = container.querySelector(".rawInput");

    function setStatus(text, type = "good") {
      saveBadge.textContent = text;
      saveBadge.className = `metaBadge ${type}`;
    }

    function saveToDisk() {
      try {
        const data = {
          nodes,
          docPreamble,
          lastSaved: Date.now()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        setStatus("Saved ✓", "good");
      } catch (e) {
        setStatus("Save Error!", "warn");
        console.error("Local Storage Save Failed", e);
      }
    }

    // Capture changes on exit
    window.addEventListener("beforeunload", saveToDisk);

    function render() {
      canvas.innerHTML = "";
      nodes.forEach((n) => {
        const nodeEl = document.createElement("div");
        nodeEl.className = `node ${activeNodeId === n.id ? 'activeNode' : ''}`;
        nodeEl.style.marginLeft = `${(n.level - 1) * 20}px`;
        
        nodeEl.innerHTML = `
          <div class="nodeHeader">
            <span class="metaBadge">H${n.level}</span>
            <input class="titleInput" value="${n.title}" placeholder="Heading...">
            <button class="btnLvl" data-dir="-1">←</button>
            <button class="btnLvl" data-dir="1">→</button>
            <button class="warn btnDel">×</button>
          </div>
          <textarea class="bodyInput" placeholder="Content...">${n.body}</textarea>
        `;

        const tIn = nodeEl.querySelector(".titleInput");
        const bIn = nodeEl.querySelector(".bodyInput");

        tIn.oninput = () => { n.title = tIn.value; setStatus("Unsaved...", "warn"); debouncedSave(); };
        bIn.oninput = () => { n.body = bIn.value; setStatus("Unsaved...", "warn"); debouncedSave(); };
        
        nodeEl.querySelector(".btnLvl").onclick = (e) => {
          const dir = parseInt(e.target.dataset.dir);
          n.level = clamp(n.level + dir, 1, 6);
          render();
          saveToDisk();
        };

        nodeEl.querySelector(".btnDel").onclick = () => {
          nodes = nodes.filter(item => item.id !== n.id);
          render();
          saveToDisk();
        };

        canvas.appendChild(nodeEl);
      });

      container.querySelector(".jsNodeCount").textContent = `${nodes.length} Nodes`;
    }

    let saveTimeout;
    function debouncedSave() {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(saveToDisk, 1000);
    }

    container.querySelector(".btnAdd").onclick = () => {
      nodes.push({ id: uid(), level: 1, title: "", body: "" });
      render();
      saveToDisk();
    };

    container.querySelector(".btnReset").onclick = () => {
      if(confirm("Clear all data?")) {
        nodes = [];
        localStorage.removeItem(STORAGE_KEY);
        render();
      }
    };

    // Load initial data
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) {
      const parsed = JSON.parse(existing);
      nodes = parsed.nodes || [];
      docPreamble = parsed.docPreamble || "";
      render();
    }

    // Tab Logic
    container.querySelectorAll(".tabbtn").forEach(btn => {
      btn.onclick = () => {
        container.querySelectorAll(".tabbtn, .tabPanel").forEach(el => el.classList.remove("active"));
        btn.classList.add("active");
        container.querySelector(`.panel${btn.dataset.tab.charAt(0).toUpperCase() + btn.dataset.tab.slice(1)}`).classList.add("active");
      };
    });
  });
})();
