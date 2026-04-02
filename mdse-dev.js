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

  const STYLE_ID = "siteapps-mdse-style-v4-fixed";
  const BUILD_CREATED_STAMP = "02 Apr 2026 14:30 GMT · Optimized Persistence";

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
      }).replace(",", "") + ` · ${Intl.DateTimeFormat().resolvedOptions().timeZone || "local"}`;
    } catch (_) { return "Unavailable"; }
  }

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .mdse-wrapper { font-family: system-ui, -apple-system, sans-serif; width: min(100%, 1280px); margin: 14px auto; border: 2px solid #111; border-radius: 16px; padding: 18px; background: #fff; color: #111; display: block; box-sizing: border-box; }
      .mdse-wrapper * { box-sizing: border-box; }
      .mdse-wrapper .muted { color: #444; font-size: 13px; font-weight: 700; }
      .mdse-wrapper .btnrow { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; margin: 10px 0; }
      .mdse-wrapper .tabs { display: flex; gap: 10px; flex-wrap: wrap; margin: 0 0 10px; }
      .mdse-wrapper button { border: 2px solid #111; border-radius: 999px; padding: 8px 14px; font-weight: 800; font-size: 13px; background: #fff; cursor: pointer; transition: transform 0.1s, opacity 0.1s; }
      .mdse-wrapper button.primary { background: #111; color: #fff; }
      .mdse-wrapper button.warn { border-color: #a00; color: #a00; background: #fff8f8; }
      .mdse-wrapper button.ghost { background: #fbfbfb; }
      .mdse-wrapper button.active { background: #111; color: #fff; }
      .mdse-wrapper button:disabled { opacity: 0.45; cursor: default; }
      .mdse-wrapper button:hover:not(:disabled) { opacity: 0.85; }
      .mdse-wrapper textarea, .mdse-wrapper input { width: 100%; border: 2px solid #111; border-radius: 12px; padding: 12px; font-size: 16px; background: #fbfbfb; }
      .mdse-wrapper .tabPanel { display: none; }
      .mdse-wrapper .tabPanel.active { display: block; }
      .mdse-wrapper .mdInput { min-height: 120px; max-height: 300px; resize: vertical; margin-bottom: 12px; }
      .mdse-wrapper .node { margin: 10px 0 10px var(--indent, 0); border: 2px solid rgba(0,0,0,.15); border-radius: 14px; padding: 12px; background: #fff; }
      .mdse-wrapper .node.activeNode { border-color: #0b5fff; box-shadow: 0 4px 12px rgba(11,95,255,.1); }
      .mdse-wrapper .node.pinnedNode { border-color: #8b5a00; background: #fffdf9; }
      .mdse-wrapper .titleInput { font-weight: 800; min-height: 40px; resize: none; overflow: hidden; }
      .mdse-wrapper .bodyInput { min-height: 80px; margin-top: 10px; display: none; }
      .mdse-wrapper .bodyInput.show { display: block; }
      .mdse-wrapper .infoPill { font-size: 11px; font-weight: 900; padding: 2px 8px; border: 2px solid #eee; border-radius: 8px; }
      .mdse-wrapper .metaBadge { font-size: 12px; font-weight: 900; padding: 4px 10px; border-radius: 999px; border: 2px solid #111; }
      .mdse-wrapper .metaBadge.good { color: #0b3d0b; border-color: #0b3d0b; }
      .mdse-wrapper .metaBadge.warn { color: #a00; border-color: #a00; }
    `;
    document.head.appendChild(style);
  }

  const uid = () => `n_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

  function parseMarkdown(raw) {
    const lines = String(raw || "").replace(/\r\n?/g, "\n").split("\n");
    const nodes = [];
    const preamble = [];
    let current = null;

    for (const line of lines) {
      const m = line.match(/^ {0,3}(#{1,6})[ \t]+(.*)$/);
      if (m) {
        current = { id: uid(), level: m[1].length, title: m[2].trim(), body: "", showBody: false, _lines: [] };
        nodes.push(current);
      } else if (current) {
        current._lines.push(line);
      } else {
        preamble.push(line);
      }
    }
    nodes.forEach(n => { n.body = n._lines.join("\n").trim(); delete n._lines; });
    return { preamble: preamble.join("\n").trim(), nodes };
  }

  function nodesToMarkdown(pre, nodes) {
    let md = pre ? pre + "\n\n" : "";
    return md + nodes.map(n => `${"#".repeat(n.level)} ${n.title}\n\n${n.body}`).join("\n\n").replace(/\n{3,}/g, "\n\n");
  }

  window.SiteApps.register("mdseStage", (container) => {
    ensureStyle();
    const STORAGE_KEY = `mdse_v4_save_${location.pathname.replace(/\//g, '_')}`;
    
    let state = {
      nodes: [],
      preamble: "",
      activeNodeId: "",
      pinnedId: "",
      activeTab: "structure"
    };
    let undoStack = [];

    container.innerHTML = `
      <div class="mdse-wrapper">
        <div class="btnrow">
          <span class="metaBadge good jsStatus">Ready</span>
          <button class="tabbtn active" data-tab="structure">Structure</button>
          <button class="tabbtn" data-tab="toc">TOC</button>
          <button class="ghost jsUndo" disabled>Undo</button>
        </div>
        <div class="tabPanel panelStructure active">
          <textarea class="mdInput jsRaw" placeholder="Paste Markdown here..."></textarea>
          <div class="btnrow">
            <button class="primary jsLoad">Load</button>
            <button class="ghost jsCopy">Copy Result</button>
            <button class="warn jsReset">Reset</button>
          </div>
          <div class="jsCanvas"></div>
        </div>
        <div class="tabPanel panelToc"><div class="jsToc"></div></div>
        <div class="muted" style="margin-top:20px; font-size:10px;">${BUILD_CREATED_STAMP}</div>
      </div>
    `;

    const el = {
      status: container.querySelector(".jsStatus"),
      canvas: container.querySelector(".jsCanvas"),
      raw: container.querySelector(".jsRaw"),
      toc: container.querySelector(".jsToc"),
      undo: container.querySelector(".jsUndo"),
      tabs: container.querySelectorAll(".tabbtn"),
      panels: container.querySelectorAll(".tabPanel")
    };

    function setStatus(msg, type = "good") {
      el.status.textContent = msg;
      el.status.className = `metaBadge ${type}`;
    }

    function save() {
      try {
        // We do NOT save the undo stack to localStorage to avoid QuotaExceeded errors
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        setStatus("Saved ✓");
      } catch (e) {
        setStatus("Save Failed (Storage Full)", "warn");
        console.error("MDSE Save Error:", e);
      }
    }

    function pushUndo() {
      undoStack.push(JSON.stringify(state));
      if (undoStack.length > 20) undoStack.shift();
      el.undo.disabled = false;
    }

    function render() {
      el.canvas.innerHTML = "";
      state.nodes.forEach((n, idx) => {
        const nodeEl = document.createElement("div");
        nodeEl.className = `node ${state.activeNodeId === n.id ? 'activeNode' : ''} ${state.pinnedId === n.id ? 'pinnedNode' : ''}`;
        nodeEl.style.setProperty("--indent", `${(n.level - 1) * 20}px`);
        nodeEl.innerHTML = `
          <div class="btnrow">
            <span class="infoPill">H${n.level}</span>
            <button class="ghost jsNodeAction" data-act="toggle">Body</button>
            <button class="ghost jsNodeAction" data-act="indent">→</button>
            <button class="ghost jsNodeAction" data-act="outdent">←</button>
            <button class="ghost jsNodeAction" data-act="pin">${state.pinnedId === n.id ? '📍' : '📌'}</button>
            <button class="warn jsNodeAction" data-act="del">×</button>
          </div>
          <textarea class="titleInput jsInput" data-prop="title">${n.title}</textarea>
          <textarea class="bodyInput jsInput ${n.showBody ? 'show' : ''}" data-prop="body">${n.body}</textarea>
        `;

        nodeEl.addEventListener("click", () => {
          if (state.activeNodeId !== n.id) {
            state.activeNodeId = n.id;
            render();
          }
        });

        nodeEl.querySelectorAll(".jsNodeAction").forEach(btn => {
          btn.onclick = (e) => {
            e.stopPropagation();
            const act = btn.dataset.act;
            pushUndo();
            if (act === 'toggle') n.showBody = !n.showBody;
            if (act === 'indent') n.level = clamp(n.level + 1, 1, 6);
            if (act === 'outdent') n.level = clamp(n.level - 1, 1, 6);
            if (act === 'pin') state.pinnedId = (state.pinnedId === n.id) ? "" : n.id;
            if (act === 'del') state.nodes.splice(idx, 1);
            render();
            save();
          };
        });

        nodeEl.querySelectorAll(".jsInput").forEach(input => {
          input.oninput = () => {
            n[input.dataset.prop] = input.value;
            setStatus("Typing...");
            debouncedSave();
          };
        });

        el.canvas.appendChild(nodeEl);
      });
    }

    const debouncedSave = (() => {
      let timer;
      return () => {
        clearTimeout(timer);
        timer = setTimeout(save, 500);
      };
    })();

    container.querySelector(".jsLoad").onclick = () => {
      if (!el.raw.value.trim()) return;
      pushUndo();
      const parsed = parseMarkdown(el.raw.value);
      state.nodes = parsed.nodes;
      state.preamble = parsed.preamble;
      render();
      save();
    };

    container.querySelector(".jsCopy").onclick = () => {
      const md = nodesToMarkdown(state.preamble, state.nodes);
      navigator.clipboard.writeText(md).then(() => setStatus("Copied to Clipboard!"));
    };

    container.querySelector(".jsUndo").onclick = () => {
      if (undoStack.length === 0) return;
      state = JSON.parse(undoStack.pop());
      if (undoStack.length === 0) el.undo.disabled = true;
      render();
      save();
    };

    container.querySelector(".jsReset").onclick = () => {
      if (!confirm("Clear everything?")) return;
      state = { nodes: [], preamble: "", activeNodeId: "", pinnedId: "", activeTab: "structure" };
      localStorage.removeItem(STORAGE_KEY);
      render();
      setStatus("Reset complete");
    };

    el.tabs.forEach(btn => {
      btn.onclick = () => {
        state.activeTab = btn.dataset.tab;
        el.tabs.forEach(b => b.classList.toggle("active", b === btn));
        el.panels.forEach(p => p.classList.toggle("active", p.classList.contains(`panel${state.activeTab.charAt(0).toUpperCase() + state.activeTab.slice(1)}`)));
        if (state.activeTab === 'toc') {
          el.toc.innerHTML = state.nodes.map(n => `<div style="margin-left:${(n.level-1)*15}px; font-size:14px; padding:4px 0;">• ${n.title || 'Untitled'}</div>`).join("");
        }
      };
    });

    // Initial Load
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        state = JSON.parse(saved);
        render();
      } catch (e) { console.error("Restore failed", e); }
    }
  });
})();
