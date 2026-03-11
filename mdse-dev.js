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
  border: 2px solid #111;
  border-radius: 12px;
  padding: 12px;
  font-size: 16px;
  line-height: 1.45;
  background: #fbfbfb;
  color: #111;
}
[data-app="mdse"] .mdInput {
  display: block; width: 100%; max-height: 300px; overflow-y: auto; margin-bottom: 12px; resize: vertical;
}
[data-app="mdse"] button {
  border: 2px solid #111; border-radius: 999px; padding: 8px 14px;
  font-weight: 800; font-size: 13px; background: #fff; cursor: pointer;
}
[data-app="mdse"] button.primary { background: #111; color: #fff; }
[data-app="mdse"] button.warn { border-color: #a00; color: #a00; }
[data-app="mdse"] .btnrow { display: flex; gap: 10px; flex-wrap: wrap; margin: 12px 0; }
[data-app="mdse"] .hdr { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; width: 100%; margin-bottom: 8px; }
[data-app="mdse"] .title {
  flex: 1 1 100%; width: 100%; border: 2px solid rgba(0,0,0,.15); border-radius: 12px;
  padding: 10px; font-size: 16px; font-weight: 500; resize: none; overflow: hidden; background: #fdfdfd;
}
[data-app="mdse"] .node-type-heading .title { font-weight: 800; font-size: 18px; background: #fff; }
[data-app="mdse"] .tabs { display: flex; gap: 10px; margin: 10px 0; }
[data-app="mdse"] .tabbtn { border: 2px solid #111; border-radius: 999px; padding: 6px 12px; font-weight: 800; cursor: pointer; background: #fff; }
[data-app="mdse"] .tabbtn.active { background: #111; color: #fff; }
[data-app="mdse"] .tabPanel { display: none; }
[data-app="mdse"] .tabPanel.active { display: block; }

/* Badges */
[data-app="mdse"] .status-header { display: flex; justify-content: flex-end; margin-bottom: 12px; }
[data-app="mdse"] .badge { padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 700; border: 1px solid #111; margin-left: 5px; }
[data-app="mdse"] .badge.good { background: #eefbee; color: #2b7a2e; }
[data-app="mdse"] .badge.warn { background: #fff5f5; color: #c00; }

/* Node Styling */
[data-app="mdse"] .node { width: 100%; border: 2px solid rgba(0,0,0,.1); border-radius: 14px; padding: 12px; margin: 8px 0; background: #fff; }
[data-app="mdse"] .node.activeNode { border-color: #0b5fff; box-shadow: 0 4px 12px rgba(11,95,255,.1); }
[data-app="mdse"] .node.node-type-paragraph { border-style: dashed; background: #fafafa; }
[data-app="mdse"] .pill { border: 2px solid #111; border-radius: 8px; padding: 2px 6px; font-weight: 900; font-size: 11px; background: #fff; }
[data-app="mdse"] .pill.para { background: #111; color: #fff; }
[data-app="mdse"] .pill.gray { border-color: #ccc; color: #666; cursor: pointer; }

/* Indentation levels 1-12 (to support nested paras) */
${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(l => `[data-app="mdse"] .level-${l} { margin-left: ${(l - 1) * 20}px; }`).join("\n")}

[data-app="mdse"] .tools { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 10px; padding-top: 10px; border-top: 1px solid #eee; display: none; }
[data-app="mdse"] .activeNode .tools { display: flex; }
[data-app="mdse"] .movingSource { background: #fff9c4 !important; border: 2px dashed #fbc02d !important; }
[data-app="mdse"] .moveTarget { border: 2px dashed #4caf50 !important; cursor: cell; }
`;
  }

  // ---- Utilities ----
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const uid = () => `n_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;

  function autoResizeTA(el) {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = (el.scrollHeight + 2) + 'px';
  }

  // ---- Core Logic: Paragraph-Aware Parser ----
  function parseMarkdown(text) {
    const lines = (text || "").split(/\r?\n/);
    const out = [];
    let currentHeadingLevel = 1;
    let paraBuffer = [];

    const flushPara = () => {
      if (paraBuffer.length > 0) {
        out.push({
          id: uid(),
          type: "p",
          level: currentHeadingLevel + 1,
          content: paraBuffer.join("\n").trim(),
          isCollapsed: false
        });
        paraBuffer = [];
      }
    };

    for (let line of lines) {
      const headingMatch = line.match(/^(#{1,6})\s+(.*)/);
      
      if (headingMatch) {
        flushPara(); // Save any preceding text as a paragraph node
        currentHeadingLevel = headingMatch[1].length;
        out.push({
          id: uid(),
          type: "h",
          level: currentHeadingLevel,
          content: headingMatch[2].trim(),
          isCollapsed: false
        });
      } else if (line.trim() === "") {
        flushPara(); // Blank lines separate paragraph nodes
      } else {
        paraBuffer.push(line);
      }
    }
    flushPara(); // Final flush
    return out;
  }

  function toMarkdown(nodes) {
    return nodes.map(n => {
      if (n.type === "h") return "#".repeat(n.level) + " " + n.content;
      return n.content;
    }).join("\n\n");
  }

  // ---- App Initialization ----
  window.SiteApps.register("mdse", (container) => {
    ensureStyle();
    const STORAGE_KEY = `siteapps:mdse:${location.pathname}`;
    
    let nodes = [];
    let activeNodeId = null;
    let sourceId = null;
    let undoStack = [];

    container.innerHTML = `
      <div class="status-header">
        <span class="badge dim" id="saveBadge">Saved ✓</span>
      </div>
      <h3>Outline & Paragraph Editor</h3>
      <div class="tabs">
        <button class="tabbtn active">Structure</button>
      </div>
      <div class="tabPanel active">
        <textarea class="mdInput" placeholder="Paste Markdown here..."></textarea>
        <div class="btnrow">
          <button class="primary" id="btnLoad">Load & Split</button>
          <button id="btnCopy">Copy Markdown</button>
          <button id="btnUndo">Undo</button>
          <button class="warn" id="btnReset">Reset</button>
        </div>
        <div id="canvas"></div>
      </div>
    `;

    const canvas = container.querySelector("#canvas");
    const taInput = container.querySelector(".mdInput");
    const saveBadge = container.querySelector("#saveBadge");

    function pushUndo() {
      undoStack.push(JSON.stringify(nodes));
      if (undoStack.length > 20) undoStack.shift();
    }

    function save() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nodes));
      saveBadge.className = "badge good";
      saveBadge.textContent = "Saved ✓";
    }

    function render() {
      canvas.innerHTML = "";
      
      const hiddenIndices = new Set();
      nodes.forEach((n, i) => {
        if (n.isCollapsed) {
          for (let j = i + 1; j < nodes.length; j++) {
            if (nodes[j].level > n.level) hiddenIndices.add(j);
            else break;
          }
        }
      });

      nodes.forEach((n, idx) => {
        if (hiddenIndices.has(idx)) return;

        const isSource = sourceId === n.id;
        const isTarget = sourceId && sourceId !== n.id;

        const div = document.createElement("div");
        div.className = `node level-${n.level} node-type-${n.type === 'h' ? 'heading' : 'paragraph'}`;
        if (activeNodeId === n.id) div.classList.add("activeNode");
        if (isSource) div.classList.add("movingSource");
        if (isTarget) div.classList.add("moveTarget");

        const hasChildren = nodes[idx+1] && nodes[idx+1].level > n.level;

        div.innerHTML = `
          <div class="hdr">
            <span class="pill gray move-btn">${isSource ? '📍 PIN' : '⠿'}</span>
            <span class="pill gray fold-btn">${hasChildren ? (n.isCollapsed ? '▶' : '▼') : '•'}</span>
            <span class="pill ${n.type === 'p' ? 'para' : ''}">${n.type === 'h' ? 'H'+n.level : '¶'}</span>
            <textarea class="title" rows="1">${n.content}</textarea>
          </div>
          <div class="tools">
            <button class="mini-btn cmd-promote">←</button>
            <button class="mini-btn cmd-demote">→</button>
            <button class="mini-btn cmd-add">+ Para</button>
            <button class="mini-btn cmd-add-h">+ Head</button>
            <button class="mini-btn warn cmd-del">Delete</button>
          </div>
        `;

        // Event Listeners
        const ta = div.querySelector("textarea");
        autoResizeTA(ta);

        ta.addEventListener("input", () => {
          n.content = ta.value;
          autoResizeTA(ta);
          save();
        });

        div.addEventListener("click", (e) => {
          if (isTarget) {
            moveNode(sourceId, n.id);
            return;
          }
          activeNodeId = n.id;
          render();
        });

        div.querySelector(".move-btn").addEventListener("click", (e) => {
          e.stopPropagation();
          sourceId = isSource ? null : n.id;
          render();
        });

        div.querySelector(".fold-btn").addEventListener("click", (e) => {
          e.stopPropagation();
          n.isCollapsed = !n.isCollapsed;
          render();
        });

        div.querySelector(".cmd-promote").onclick = () => { pushUndo(); n.level = clamp(n.level - 1, 1, 12); render(); save(); };
        div.querySelector(".cmd-demote").onclick = () => { pushUndo(); n.level = clamp(n.level + 1, 1, 12); render(); save(); };
        div.querySelector(".cmd-del").onclick = () => { pushUndo(); nodes.splice(idx, 1); render(); save(); };
        
        div.querySelector(".cmd-add").onclick = () => { 
          pushUndo(); 
          nodes.splice(idx + 1, 0, { id: uid(), type: "p", level: n.level, content: "", isCollapsed: false });
          render();
        };

        div.querySelector(".cmd-add-h").onclick = () => { 
          pushUndo(); 
          nodes.splice(idx + 1, 0, { id: uid(), type: "h", level: clamp(n.level, 1, 6), content: "New Heading", isCollapsed: false });
          render();
        };

        canvas.appendChild(div);
      });
    }

    function moveNode(sId, tId) {
      pushUndo();
      const sIdx = nodes.findIndex(n => n.id === sId);
      const branch = [nodes[sIdx]];
      for (let i = sIdx + 1; i < nodes.length; i++) {
        if (nodes[i].level > nodes[sIdx].level) branch.push(nodes[i]);
        else break;
      }
      nodes.splice(sIdx, branch.length);
      const tIdx = nodes.findIndex(n => n.id === tId);
      nodes.splice(tIdx + 1, 0, ...branch);
      sourceId = null;
      render();
      save();
    }

    container.querySelector("#btnLoad").onclick = () => {
      pushUndo();
      nodes = parseMarkdown(taInput.value);
      render();
      save();
    };

    container.querySelector("#btnCopy").onclick = () => {
      const md = toMarkdown(nodes);
      taInput.value = md;
      navigator.clipboard.writeText(md);
      saveBadge.textContent = "Copied! ✓";
    };

    container.querySelector("#btnUndo").onclick = () => {
      if (undoStack.length > 0) {
        nodes = JSON.parse(undoStack.pop());
        render();
        save();
      }
    };

    container.querySelector("#btnReset").onclick = () => {
      if (confirm("Clear all?")) {
        nodes = [];
        render();
        localStorage.removeItem(STORAGE_KEY);
      }
    };

    // Load Initial State
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      nodes = JSON.parse(saved);
      render();
    }
  });
})();
