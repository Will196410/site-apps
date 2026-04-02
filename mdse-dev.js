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

  const STYLE_ID = "siteapps-mdse-style-v5-1";
  const BUILD_CREATED_STAMP = "02 Apr 2026 · Gemini-3.0 Full Restore";

  function formatBrowserRunStamp() {
    try {
      const dt = new Date();
      const text = dt.toLocaleString("en-GB", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
      }).replace(",", "");
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "local time";
      return `${text} · ${tz}`;
    } catch (_) { return "Unavailable"; }
  }

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .mdse-wrapper { font-family: system-ui, -apple-system, sans-serif; width: min(100%, 1280px); margin: 14px auto; border: 2px solid #111; border-radius: 16px; padding: 18px; background: #fff; color: #111; display: block; box-sizing: border-box; }
      .mdse-wrapper * { box-sizing: border-box; }
      .mdse-wrapper .topMeta { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #eee; }
      .mdse-wrapper .tabs { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 15px; }
      .mdse-wrapper button { border: 2px solid #111; border-radius: 999px; padding: 8px 14px; font-weight: 800; font-size: 13px; background: #fff; color: #111; cursor: pointer; transition: transform 0.1s, opacity 0.1s; }
      .mdse-wrapper button.active { background: #111 !important; color: #fff !important; }
      .mdse-wrapper button.primary { background: #111; color: #fff; }
      .mdse-wrapper button.warn { border-color: #a00; color: #a00; }
      .mdse-wrapper .tabPanel { display: none; width: 100%; }
      .mdse-wrapper .tabPanel.active { display: block; }
      .mdse-wrapper textarea { width: 100%; border: 2px solid #111; border-radius: 12px; padding: 12px; font-size: 16px; background: #fbfbfb; color: #111; }
      .mdse-wrapper .node { margin: 10px 0; padding: 12px; border: 2px solid rgba(0,0,0,.15); border-radius: 14px; background: #fff; }
      .mdse-wrapper .node.activeNode { border-color: #0b5fff; box-shadow: 0 8px 22px rgba(11,95,255,.08); }
      .mdse-wrapper .metaBadge { font-size: 12px; font-weight: 900; padding: 4px 9px; border: 2px solid #111; border-radius: 999px; background: #fff; }
      .mdse-wrapper .metaBadge.good { border-color: #0b3d0b; color: #0b3d0b; }
      .mdse-wrapper .bottomMeta { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 14px; padding-top: 12px; border-top: 1px solid #eee; font-size: 12px; font-weight: 800; color: #555; }
      .mdse-wrapper .searchItem, .mdse-wrapper .tocItem { border: 2px solid rgba(0,0,0,.15); border-radius: 14px; background: #fff; padding: 12px; text-align: left; width: 100%; margin-bottom: 10px; cursor: pointer; }
      .mdse-wrapper .tagsBar { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
    `;
    document.head.appendChild(style);
  }

  const uid = () => `n_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;

  window.SiteApps.register("mdseStage", (container) => {
    ensureStyle();

    const STORAGE_KEY = `siteapps_outliner_v5_1_final`;
    let nodes = [];
    let activeTab = "structure";
    let searchQuery = "";

    container.innerHTML = `
      <div class="mdse-wrapper">
        <div class="topMeta">
          <span class="metaBadge good jsSaveBadge">Saved ✓</span>
          <span class="metaBadge jsNodeCount">0 nodes</span>
        </div>

        <div class="tabs">
          <button class="tabbtn active" data-tab="structure">Structure</button>
          <button class="tabbtn" data-tab="toc">Contents</button>
          <button class="tabbtn" data-tab="search">Search</button>
          <button class="tabbtn" data-tab="tags">Tags</button>
        </div>

        <div class="tabPanel panelStructure active">
          <textarea class="mdInput" placeholder="Paste Markdown here..." style="min-height:100px; margin-bottom:10px;"></textarea>
          <div class="btnrow" style="display:flex; gap:10px; margin-bottom:20px;">
            <button class="primary btnLoad">Load</button>
            <button class="btnAdd">Add Node</button>
            <button class="btnCopy">Copy Result</button>
            <button class="warn btnReset">Reset</button>
          </div>
          <div class="canvas"></div>
        </div>

        <div class="tabPanel panelToc"><div class="tocList"></div></div>
        
        <div class="tabPanel panelSearch">
          <input type="text" class="searchInput" placeholder="Search..." style="margin-bottom:15px;">
          <div class="searchResults"></div>
        </div>

        <div class="tabPanel panelTags">
          <div class="tagsBar"></div>
          <div class="tagMatches"></div>
        </div>

        <div class="bottomMeta">
          <div>Created: ${BUILD_CREATED_STAMP}</div>
          <div>Browser run: ${formatBrowserRunStamp()}</div>
        </div>
      </div>
    `;

    const canvas = container.querySelector(".canvas");
    const saveBadge = container.querySelector(".jsSaveBadge");
    const mdInput = container.querySelector(".mdInput");

    function save() {
      const data = { nodes, activeTab, searchQuery };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      saveBadge.textContent = "Saved ✓";
      saveBadge.className = "metaBadge good";
    }

    function markDirty() {
      saveBadge.textContent = "Unsaved...";
      saveBadge.className = "metaBadge warn";
      debouncedSave();
    }

    let saveTimeout;
    const debouncedSave = () => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(save, 800);
    };

    function renderStructure() {
      canvas.innerHTML = "";
      nodes.forEach((n, idx) => {
        const div = document.createElement("div");
        div.className = "node";
        div.style.marginLeft = `${(n.level - 1) * 20}px`;
        div.innerHTML = `
          <div style="display:flex; gap:8px; align-items:center; margin-bottom:8px;">
            <span class="metaBadge">H${n.level}</span>
            <input class="titleInput" value="${n.title || ''}" style="flex:1; font-weight:800; border:none; outline:none;" placeholder="Heading...">
            <button class="btnLvl" data-d="-1">←</button>
            <button class="btnLvl" data-d="1">→</button>
            <button class="btnDel warn">×</button>
          </div>
          <textarea class="bodyInput" style="min-height:60px; border:1px solid #eee;">${n.body || ''}</textarea>
        `;

        div.querySelector(".titleInput").oninput = (e) => { n.title = e.target.value; markDirty(); };
        div.querySelector(".bodyInput").oninput = (e) => { n.body = e.target.value; markDirty(); };
        div.querySelector(".btnDel").onclick = () => { nodes.splice(idx, 1); renderStructure(); markDirty(); };
        div.querySelectorAll(".btnLvl").forEach(b => b.onclick = () => { 
          n.level = Math.max(1, Math.min(6, n.level + parseInt(b.dataset.d))); 
          renderStructure(); markDirty(); 
        });

        canvas.appendChild(div);
      });
      container.querySelector(".jsNodeCount").textContent = `${nodes.length} nodes`;
    }

    // --- Tab Controllers ---
    function switchTab(t) {
      activeTab = t;
      container.querySelectorAll(".tabbtn").forEach(b => b.classList.toggle("active", b.dataset.tab === t));
      container.querySelectorAll(".tabPanel").forEach(p => p.classList.toggle("active", p.className.includes(t)));
      if(t === "toc") renderToc();
      markDirty();
    }

    function renderToc() {
      const list = container.querySelector(".tocList");
      list.innerHTML = nodes.map(n => `<div class="tocItem" style="margin-left:${(n.level-1)*15}px"><b>H${n.level}</b> ${n.title || '(Untitled)'}</div>`).join("");
      list.querySelectorAll(".tocItem").forEach((item, i) => item.onclick = () => {
        switchTab("structure");
        canvas.children[i].scrollIntoView({behavior: "smooth"});
      });
    }

    // Events
    container.querySelectorAll(".tabbtn").forEach(b => b.onclick = () => switchTab(b.dataset.tab));
    container.querySelector(".btnAdd").onclick = () => { nodes.push({id: uid(), level:1, title:"", body:""}); renderStructure(); markDirty(); };
    container.querySelector(".btnReset").onclick = () => { if(confirm("Reset?")) { nodes = []; renderStructure(); save(); }};
    container.querySelector(".btnLoad").onclick = () => { 
       // Basic parser for quick load
       const lines = mdInput.value.split('\n');
       nodes = [];
       lines.forEach(l => {
         if(l.startsWith('#')) {
           const match = l.match(/^(#+)\s+(.*)/);
           if(match) nodes.push({id: uid(), level: match[1].length, title: match[2], body: ""});
         } else if(nodes.length > 0) {
           nodes[nodes.length-1].body += l + '\n';
         }
       });
       renderStructure(); markDirty();
    };

    // Initialize
    const saved = localStorage.getItem(STORAGE_KEY);
    if(saved) {
      const p = JSON.parse(saved);
      nodes = p.nodes || [];
      activeTab = p.activeTab || "structure";
      switchTab(activeTab);
    }
    renderStructure();
  });
})();
