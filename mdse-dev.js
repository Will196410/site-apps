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

  const STYLE_ID = "siteapps-mdse-v4-full";
  const BUILD_CREATED_STAMP = "02 Apr 2026 15:10 GMT · Fixed Persistence · Full Feature";

  function formatBrowserRunStamp() {
    try {
      const dt = new Date();
      return dt.toLocaleString("en-GB", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
      }).replace(",", "") + ` · ${Intl.DateTimeFormat().resolvedOptions().timeZone || "local"}`;
    } catch (_) { return "Unavailable"; }
  }

  function ensureStyle() {
    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }
    style.textContent = `
      .mdse-wrapper { font-family: system-ui, -apple-system, sans-serif; width: min(100%, 1280px); margin: 14px auto; border: 2px solid #111; border-radius: 16px; padding: 18px; background: #fff; color: #111; display: block; box-sizing: border-box; }
      .mdse-wrapper * { box-sizing: border-box; }
      .mdse-wrapper .muted { color: #444; font-size: 13px; font-weight: 700; }
      .mdse-wrapper .btnrow { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin: 10px 0; }
      .mdse-wrapper .tabs { display: flex; gap: 10px; flex-wrap: wrap; margin: 0 0 10px; }
      .mdse-wrapper button { border: 2px solid #111; border-radius: 999px; padding: 6px 12px; font-weight: 800; font-size: 13px; background: #fff; cursor: pointer; transition: transform 0.1s, opacity 0.1s; }
      .mdse-wrapper button.primary { background: #111; color: #fff; }
      .mdse-wrapper button.warn { border-color: #a00; color: #a00; background: #fff8f8; }
      .mdse-wrapper button.ghost { background: #fbfbfb; border-color: #ddd; }
      .mdse-wrapper button.active { background: #111; color: #fff; }
      .mdse-wrapper button:disabled { opacity: 0.35; cursor: default; }
      
      .mdse-wrapper textarea, .mdse-wrapper input { width: 100%; border: 2px solid #111; border-radius: 12px; padding: 12px; font-size: 16px; background: #fbfbfb; }
      .mdse-wrapper .tabPanel { display: none; }
      .mdse-wrapper .tabPanel.active { display: block; }
      .mdse-wrapper .mdInput { min-height: 150px; max-height: 400px; resize: vertical; margin-bottom: 12px; }

      .mdse-wrapper .summaryPill { border: 2px solid rgba(0,0,0,.1); border-radius: 999px; padding: 4px 10px; font-size: 12px; font-weight: 800; background: #fff; margin-right: 5px; }
      
      .mdse-wrapper .node { margin: 10px 0 10px var(--indent, 0); border: 2px solid rgba(0,0,0,.15); border-radius: 14px; padding: 12px; position: relative; background: #fff; }
      .mdse-wrapper .node.activeNode { border-color: #0b5fff; box-shadow: 0 8px 20px rgba(11,95,255,.1); }
      .mdse-wrapper .node.pinnedNode { border-color: #8b5a00; background: #fffdf6; }
      .mdse-wrapper .indentGuide { border-left: 4px solid rgba(11,95,255,.1); padding-left: 10px; }
      
      .mdse-wrapper .nodeHeader { display: flex; flex-direction: column; gap: 8px; }
      .mdse-wrapper .headerMeta { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
      .mdse-wrapper .titleInput { font-weight: 800; font-size: 17px; min-height: 50px; }
      .mdse-wrapper .bodyWrap { display: none; margin-top: 10px; }
      .mdse-wrapper .bodyWrap.show { display: block; }
      .mdse-wrapper .bodyInput { min-height: 120px; }

      .mdse-wrapper .infoPill { font-size: 11px; font-weight: 900; padding: 2px 8px; border: 2px solid #eee; border-radius: 8px; background: #f9f9f9; }
      .mdse-wrapper .miniBtn { border: 1px solid #ddd; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 800; cursor: pointer; }
      
      .mdse-wrapper .tocItem { border-bottom: 1px solid #eee; padding: 10px 0; display: flex; align-items: center; gap: 10px; }
      .mdse-wrapper .tocLink { flex: 1; text-align: left; background: none; border: none; font-weight: 700; cursor: pointer; padding: 5px; border-radius: 4px; }
      .mdse-wrapper .tocLink:hover { background: #f0f7ff; }

      .mdse-wrapper .metaBadge { font-size: 12px; font-weight: 900; padding: 4px 10px; border-radius: 999px; border: 2px solid #111; }
      .mdse-wrapper .metaBadge.good { color: #0b3d0b; border-color: #0b3d0b; }
      .mdse-wrapper .metaBadge.warn { color: #a00; border-color: #a00; }
    `;
  }

  // --- Utilities ---
  const uid = () => `n_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const countWords = (t) => t ? t.trim().split(/\s+/).filter(Boolean).length : 0;

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
      } else if (current) current._lines.push(line);
      else preamble.push(line);
    }
    nodes.forEach(n => { n.body = n._lines.join("\n").trim(); delete n._lines; });
    return { preamble: preamble.join("\n").trim(), nodes };
  }

  window.SiteApps.register("mdseStage", (container) => {
    ensureStyle();
    const STORAGE_KEY = `mdse_v4_full_${location.pathname}`;
    
    let nodes = [];
    let preamble = "";
    let activeNodeId = "";
    let activeTab = "structure";
    let pinnedId = "";
    let undoStack = []; // Memory only!

    container.innerHTML = `
      <div class="mdse-wrapper">
        <div class="btnrow">
          <span class="metaBadge good jsSaveBadge">Saved ✓</span>
          <div class="tabs">
            <button class="tabbtn active" data-tab="structure">Structure</button>
            <button class="tabbtn" data-tab="toc">Contents</button>
          </div>
        </div>

        <div class="tabPanel panelStructure active">
          <textarea class="mdInput jsMainInput" placeholder="Paste Markdown here..."></textarea>
          <div class="btnrow">
            <button class="primary jsLoad">Load Markdown</button>
            <button class="ghost jsUndo" disabled>Undo</button>
            <button class="ghost jsCopy">Copy Result</button>
            <button class="warn jsReset">Reset App</button>
          </div>
          <div class="btnrow jsStats"></div>
          <div class="jsCanvas"></div>
        </div>

        <div class="tabPanel panelToc">
          <div class="jsTocList"></div>
        </div>
      </div>
    `;

    const el = {
      canvas: container.querySelector(".jsCanvas"),
      mainInput: container.querySelector(".jsMainInput"),
      saveBadge: container.querySelector(".jsSaveBadge"),
      stats: container.querySelector(".jsStats"),
      toc: container.querySelector(".jsTocList"),
      undo: container.querySelector(".jsUndo")
    };

    // --- Core Logic ---
    function getFamilyRange(idx) {
      const level = nodes[idx].level;
      let end = idx + 1;
      while (end < nodes.length && nodes[end].level > level) end++;
      return [idx, end];
    }

    function getMetrics(idx) {
      const [start, end] = getFamilyRange(idx);
      const direct = nodes.slice(idx + 1, end).filter(n => n.level === nodes[idx].level + 1).length;
      return { 
        words: countWords(nodes[idx].title) + countWords(nodes[idx].body),
        direct,
        total: (end - start) - 1
      };
    }

    function pushUndo() {
      undoStack.push(JSON.stringify({ nodes, preamble, activeNodeId }));
      if (undoStack.length > 20) undoStack.shift();
      el.undo.disabled = false;
    }

    function saveToStorage() {
      try {
        // Save ONLY the data, not the history stack.
        const blob = JSON.stringify({ nodes, preamble, activeNodeId, activeTab });
        localStorage.setItem(STORAGE_KEY, blob);
        el.saveBadge.textContent = "Saved ✓";
        el.saveBadge.className = "metaBadge good";
      } catch (e) {
        el.saveBadge.textContent = "Not Saved (Full)";
        el.saveBadge.className = "metaBadge warn";
      }
    }

    function render() {
      const totalWords = nodes.reduce((s, n) => s + countWords(n.title) + countWords(n.body), 0);
      el.stats.innerHTML = `
        <span class="summaryPill">${nodes.length} nodes</span>
        <span class="summaryPill">${totalWords} words</span>
      `;

      el.canvas.innerHTML = "";
      nodes.forEach((n, idx) => {
        const met = getMetrics(idx);
        const nodeEl = document.createElement("div");
        nodeEl.className = `node ${activeNodeId === n.id ? 'activeNode' : ''} ${n.level > 1 ? 'indentGuide' : ''} ${pinnedId === n.id ? 'pinnedNode' : ''}`;
        nodeEl.style.setProperty("--indent", `${(n.level - 1) * 22}px`);
        nodeEl.innerHTML = `
          <div class="nodeHeader">
            <div class="headerMeta">
              <span class="infoPill">H${n.level}</span>
              <span class="infoPill">${met.words}w</span>
              <span class="infoPill">${met.direct} direct / ${met.total} total sub</span>
              <button class="miniBtn jsNodeAct" data-act="body">${n.showBody ? 'Hide Body' : 'Show Body'}</button>
              <button class="miniBtn jsNodeAct" data-act="indent">→</button>
              <button class="miniBtn jsNodeAct" data-act="outdent">←</button>
              <button class="miniBtn jsNodeAct" data-act="pin">📌</button>
              <button class="miniBtn jsNodeAct" data-act="paste">Paste After</button>
              <button class="miniBtn jsNodeAct" data-act="del" style="color:red">×</button>
            </div>
            <textarea class="titleInput jsIn" data-p="title">${n.title}</textarea>
          </div>
          <div class="bodyWrap ${n.showBody ? 'show' : ''}">
            <textarea class="bodyInput jsIn" data-p="body">${n.body}</textarea>
          </div>
        `;

        nodeEl.onclick = () => {
          if (activeNodeId !== n.id) {
            activeNodeId = n.id;
            document.querySelectorAll('.node').forEach(e => e.classList.remove('activeNode'));
            nodeEl.classList.add('activeNode');
          }
        };

        nodeEl.querySelectorAll('.jsIn').forEach(input => {
          input.oninput = () => {
            n[input.dataset.p] = input.value;
            el.saveBadge.textContent = "Saving...";
            debouncedSave();
          };
        });

        nodeEl.querySelectorAll('.jsNodeAct').forEach(btn => {
          btn.onclick = async (e) => {
            e.stopPropagation();
            const act = btn.dataset.act;
            pushUndo();
            if (act === 'body') n.showBody = !n.showBody;
            if (act === 'indent') n.level = clamp(n.level + 1, 1, 6);
            if (act === 'outdent') n.level = clamp(n.level - 1, 1, 6);
            if (act === 'del' && confirm("Delete branch?")) {
              const [s, e] = getFamilyRange(idx);
              nodes.splice(s, e - s);
            }
            if (act === 'pin') {
              if (pinnedId && pinnedId !== n.id) {
                const pinIdx = nodes.findIndex(x => x.id === pinnedId);
                const [ps, pe] = getFamilyRange(pinIdx);
                const branch = nodes.splice(ps, pe - ps);
                const newIdx = nodes.findIndex(x => x.id === n.id);
                const [, targetEnd] = getFamilyRange(newIdx);
                nodes.splice(targetEnd, 0, ...branch);
                pinnedId = "";
              } else pinnedId = (pinnedId === n.id) ? "" : n.id;
            }
            if (act === 'paste') {
              const text = await navigator.clipboard.readText();
              const parsed = parseMarkdown(text);
              const [, end] = getFamilyRange(idx);
              const peerLevel = n.level;
              parsed.nodes.forEach(pn => pn.level = clamp(pn.level + (peerLevel - parsed.nodes[0].level), 1, 6));
              nodes.splice(end, 0, ...parsed.nodes);
            }
            render();
            saveToStorage();
          };
        });

        el.canvas.appendChild(nodeEl);
      });
    }

    function renderTOC() {
      el.toc.innerHTML = "";
      nodes.forEach(n => {
        const row = document.createElement("div");
        row.className = "tocItem";
        row.style.paddingLeft = `${(n.level - 1) * 15}px`;
        row.innerHTML = `<button class="tocLink">H${n.level} - ${n.title || '(Untitled)'}</button>`;
        row.querySelector('.tocLink').onclick = () => {
          activeNodeId = n.id;
          activeTab = "structure";
          container.querySelector('[data-tab="structure"]').click();
          setTimeout(() => {
            const target = el.canvas.querySelector(`.node.activeNode`);
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 50);
        };
        el.toc.appendChild(row);
      });
    }

    const debouncedSave = (() => {
      let t; return () => { clearTimeout(t); t = setTimeout(saveToStorage, 800); };
    })();

    // --- Event Listeners ---
    container.querySelector('.jsLoad').onclick = () => {
      if (!el.mainInput.value) return;
      pushUndo();
      const p = parseMarkdown(el.mainInput.value);
      nodes = p.nodes; preamble = p.preamble;
      render(); saveToStorage();
    };

    container.querySelector('.jsCopy').onclick = () => {
      const md = preamble + "\n\n" + nodes.map(n => `${"#".repeat(n.level)} ${n.title}\n\n${n.body}`).join("\n\n");
      navigator.clipboard.writeText(md).then(() => alert("Copied!"));
    };

    container.querySelector('.jsUndo').onclick = () => {
      const last = undoStack.pop();
      if (last) {
        const d = JSON.parse(last);
        nodes = d.nodes; preamble = d.preamble; activeNodeId = d.activeNodeId;
        render(); saveToStorage();
      }
      if (undoStack.length === 0) el.undo.disabled = true;
    };

    container.querySelector('.jsReset').onclick = () => {
      if (confirm("Reset everything?")) {
        localStorage.removeItem(STORAGE_KEY);
        location.reload();
      }
    };

    container.querySelectorAll('.tabbtn').forEach(btn => {
      btn.onclick = () => {
        activeTab = btn.dataset.tab;
        container.querySelectorAll('.tabbtn').forEach(b => b.classList.remove('active'));
        container.querySelectorAll('.tabPanel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        container.querySelector(`.panel${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`).classList.add('active');
        if (activeTab === 'toc') renderTOC();
      };
    });

    // --- Init ---
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const d = JSON.parse(saved);
      nodes = d.nodes || []; preamble = d.preamble || ""; 
      activeNodeId = d.activeNodeId || ""; activeTab = d.activeTab || "structure";
      render();
    }
  });
})();
