window.SiteApps = window.SiteApps || {};
(() => {
  "use strict";

  // ============================================================
  // Markdown Structure Editor (Squarespace Footer) — Multi-instance
  //
  // Embed anywhere:
  //   <div class="markdown-structure-editor"></div>
  //
  // Optional stable storage per instance:
  //   <div class="markdown-structure-editor" data-storage-key="my-outline"></div>
  //
  // v10:
  // - Bodies hidden by default (per node), 👁 toggle, 📝 body indicator
  // - Reliable move via PIN + DROP button
  // - Duplicate node + children
  // - localStorage autosave + restore
  // - NEW: Copied flag (Copied ✓ / Not copied) persists across refresh
  // ============================================================

  const APP_CLASS = "markdown-structure-editor";
  const STYLE_ID = "mdse-style-v10";
  const INIT_FLAG = "mdseInit";
  const STORAGE_PREFIX = "mdse:v7:";

  const SAVE_DEBOUNCE_MS = 600;
  const SAVE_PULSE_MS = 2000;

  // ----------------------------
  // High-readability CSS
  // ----------------------------
  const APP_CSS = `
.${APP_CLASS}{
  font-family:-apple-system,system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;
  background:#fff;
  border:2px solid #111;
  padding:18px;
  border-radius:14px;
  color:#111;
  max-width:980px;
  margin:14px auto;
}
.${APP_CLASS} .header-top{
  display:flex;
  align-items:baseline;
  justify-content:space-between;
  gap:10px;
  margin-bottom:10px;
}
.${APP_CLASS} .app-title{
  margin:0;
  font-size:20px;
  font-weight:900;
  letter-spacing:0.2px;
}

.${APP_CLASS} .status-row{
  display:flex;
  gap:10px;
  align-items:center;
  flex-wrap:wrap;
  justify-content:flex-end;
}
.${APP_CLASS} .status-badge{
  font-size:14px;
  font-weight:900;
  padding:6px 10px;
  border:2px solid #111;
  border-radius:999px;
  background:#fff;
  color:#111;
}
.${APP_CLASS} .status-badge.dim{ color:#444; border-color:#444; }
.${APP_CLASS} .status-badge.good{ color:#0b3d0b; border-color:#0b3d0b; }
.${APP_CLASS} .status-badge.warn{ color:#7a0000; border-color:#7a0000; }

.${APP_CLASS} .md-input{
  width:100%;
  height:120px;
  margin:10px 0 14px;
  border:2px solid #111;
  border-radius:10px;
  padding:12px;
  box-sizing:border-box;
  font-size:16px;
  line-height:1.35;
  color:#111;
  background:#fff;
}

.${APP_CLASS} .button-group{
  display:flex;
  gap:10px;
  flex-wrap:wrap;
  margin-bottom:6px;
}
.${APP_CLASS} .button-group button{
  border-radius:10px;
  border:2px solid #111;
  cursor:pointer;
  padding:10px 12px;
  font-weight:900;
  font-size:14px;
  background:#fff;
  color:#111;
}
.${APP_CLASS} .load-btn{ background:#0b5fff; color:#fff; border-color:#0b5fff; flex:1; }
.${APP_CLASS} .save-back-btn{ background:#6f42c1; color:#fff; border-color:#6f42c1; flex:1; }
.${APP_CLASS} .export-btn{ background:#111; color:#fff; border-color:#111; flex:1; }
.${APP_CLASS} .reset-btn{ background:#fff; color:#7a0000; border-color:#7a0000; flex:0.8; }

.${APP_CLASS} .editor-canvas{ margin-top:10px; }

.${APP_CLASS} .node-item{
  background:#fff;
  margin:10px 0;
  padding:14px;
  border:2px solid #111;
  border-radius:12px;
}
.${APP_CLASS} .node-header-row{
  display:flex;
  align-items:flex-start;
  gap:10px;
  margin-bottom:10px;
}

.${APP_CLASS} .drag-handle{
  cursor:pointer;
  background:#f0f0f0;
  border:2px solid #111;
  border-radius:10px;
  padding:10px 12px;
  font-size:16px;
  font-weight:900;
  color:#111;
  flex-shrink:0;
}

.${APP_CLASS} .collapse-toggle{
  cursor:pointer;
  width:34px;
  height:40px;
  display:flex;
  align-items:center;
  justify-content:center;
  background:#f7f7f7;
  border-radius:10px;
  border:2px solid #111;
  font-size:16px;
  font-weight:900;
  flex-shrink:0;
}

.${APP_CLASS} .level-label{
  font-size:12px;
  color:#111;
  font-weight:900;
  min-width:28px;
  padding-top:12px;
  display:flex;
  align-items:center;
  gap:6px;
}
.${APP_CLASS} .has-body-icon{
  display:inline-block;
  font-size:16px;
  line-height:1;
}

.${APP_CLASS} .title-area{
  flex-grow:1;
  border:2px solid #111;
  font-size:18px;
  padding:8px 10px;
  background:#fff;
  font-weight:900;
  resize:none;
  overflow:hidden;
  min-height:1.2em;
  line-height:1.25;
  font-family:inherit;
  width:100%;
  border-radius:10px;
}

.${APP_CLASS} .body-preview{
  width:100%;
  border:2px solid #111;
  border-radius:10px;
  padding:10px 12px;
  font-size:15px;
  line-height:1.35;
  color:#111;
  background:#fbfbfb;
  font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace;
}

.${APP_CLASS} .btn-tools{
  display:flex;
  gap:6px;
  padding-top:2px;
  flex-shrink:0;
  flex-wrap:wrap;
  justify-content:flex-end;
}

.${APP_CLASS} .tool-btn{
  border:2px solid #111;
  border-radius:10px;
  padding:10px 10px;
  font-size:14px;
  font-weight:900;
  cursor:pointer;
  min-width:44px;
  background:#fff;
  color:#111;
}

.${APP_CLASS} .tool-btn.drop{
  background:#0b7a2b;
  color:#fff;
  border-color:#0b7a2b;
  min-width:68px;
}

.${APP_CLASS} .tool-btn:active,
.${APP_CLASS} .button-group button:active,
.${APP_CLASS} .drag-handle:active,
.${APP_CLASS} .collapse-toggle:active{
  transform:translateY(1px);
}

.${APP_CLASS} .moving-source{
  border-color:#0b5fff !important;
  box-shadow:0 6px 24px rgba(0,0,0,0.18);
  background:#f3f8ff !important;
}
.${APP_CLASS} .moving-source .title-area{
  border-color:#0b5fff !important;
  background:#0b5fff !important;
  color:#fff !important;
}
.${APP_CLASS} .moving-child-visual{
  background:#f6f6f6 !important;
  opacity:0.55;
  border-style:dashed !important;
}
.${APP_CLASS} .move-target-hint{
  border-color:#0b7a2b !important;
  background:#f2fff4 !important;
}
.${APP_CLASS} .is-collapsed-node{
  background:#fff7d1 !important;
  border-color:#8a6a00 !important;
}
.${APP_CLASS} .folded-note{
  font-size:13px;
  font-weight:900;
  color:#5a4800;
  padding-left:44px;
  margin-top:4px;
}
.${APP_CLASS} .version-footer{
  text-align:right;
  font-size:12px;
  color:#444;
  margin-top:14px;
  font-style:italic;
}
`;

  function ensureStyleInjected() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = APP_CSS;
    document.head.appendChild(style);
  }

  function ensureMarkup(container) {
    if (container.querySelector(".md-input") && container.querySelector(".editor-canvas")) return;

    container.innerHTML = "";

    const header = document.createElement("div");
    header.className = "header-section";

    const headerTop = document.createElement("div");
    headerTop.className = "header-top";

    const title = document.createElement("h3");
    title.className = "app-title";
    title.textContent = "Markdown Structure Editor";

    const statusRow = document.createElement("div");
    statusRow.className = "status-row";

    const saveBadge = document.createElement("span");
    saveBadge.className = "status-badge dim";
    saveBadge.textContent = "";

    const copyBadge = document.createElement("span");
    copyBadge.className = "status-badge dim";
    copyBadge.textContent = "";

    statusRow.append(saveBadge, copyBadge);
    headerTop.append(title, statusRow);

    const input = document.createElement("textarea");
    input.className = "md-input";
    input.placeholder = "Paste Markdown here...";

    const btnGroup = document.createElement("div");
    btnGroup.className = "button-group";

    const mkTopBtn = (cls, label) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = cls;
      b.textContent = label;
      return b;
    };

    btnGroup.append(
      mkTopBtn("load-btn", "Load Markdown"),
      mkTopBtn("save-back-btn", "Update Input Area"),
      mkTopBtn("export-btn", "Copy Result"),
      mkTopBtn("reset-btn", "Reset Everything")
    );

    const canvas = document.createElement("div");
    canvas.className = "editor-canvas";

    const footer = document.createElement("div");
    footer.className = "version-footer";
    footer.textContent = "v10 (copied flag + bodies hidden by default + 📝 + 👁 + DROP move)";

    header.append(headerTop, input, btnGroup);
    container.append(header, canvas, footer);
  }

  function safeJsonParse(s) {
    try { return JSON.parse(s); } catch { return null; }
  }

  function getInstanceStorageKey(container, instanceIndexOnPage) {
    const explicit = container.getAttribute("data-storage-key");
    if (explicit && explicit.trim()) return STORAGE_PREFIX + explicit.trim();
    const path = (location.pathname || "/").replace(/\s+/g, "");
    return `${STORAGE_PREFIX}${path}#${instanceIndexOnPage}`;
  }

  function initInstance(container, instanceIndexOnPage) {
    if (container.dataset[INIT_FLAG] === "1") return;
    container.dataset[INIT_FLAG] = "1";

    ensureStyleInjected();
    ensureMarkup(container);

    // Node shape:
    // { id:number, level:number, title:string, body:string, isCollapsed:boolean, showBody:boolean }
    let nodes = [];
    let idCounter = 1;

    let sourceId = null;
    let revealId = null;

    // NEW copied-flag state
    let copiedSinceChange = false;
    let lastCopyAt = null; // ISO string or null

    const storageKey = getInstanceStorageKey(container, instanceIndexOnPage);

    const inputEl = () => container.querySelector(".md-input");
    const canvasEl = () => container.querySelector(".editor-canvas");
    const saveBadgeEl = () => container.querySelector(".status-row .status-badge:nth-child(1)");
    const copyBadgeEl = () => container.querySelector(".status-row .status-badge:nth-child(2)");

    const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

    // ---- status badges ----
    let dirty = false;

    function setSaveBadge(text, mode = "dim") {
      const el = saveBadgeEl();
      if (!el) return;
      el.textContent = text || "";
      el.classList.remove("dim", "good", "warn");
      el.classList.add(mode);
    }

    function setCopyBadge() {
      const el = copyBadgeEl();
      if (!el) return;

      if (copiedSinceChange) {
        el.textContent = "Copied ✓";
        el.classList.remove("dim", "warn");
        el.classList.add("good");
        if (lastCopyAt) el.title = `Last copied: ${lastCopyAt}`;
      } else {
        el.textContent = "Not copied";
        el.classList.remove("good");
        el.classList.add("warn");
        el.title = "You’ve changed something since last copy.";
      }
    }

    function noteChanged() {
      // Any structural or text change means “not copied”
      copiedSinceChange = false;
      lastCopyAt = lastCopyAt; // keep old timestamp visible in tooltip if desired
      setCopyBadge();
    }

    function markDirty() {
      dirty = true;
      setSaveBadge("Unsaved…", "dim");
      noteChanged();
      scheduleSave();
    }

    function markSaved() {
      dirty = false;
      setSaveBadge("Saved ✓", "good");
    }

    function markStorageBlocked() {
      setSaveBadge("Not saved (storage blocked)", "warn");
    }

    // ---- autosave ----
    let saveTimer = null;

    function getSerializableState() {
      return {
        v: 1,
        md: inputEl() ? inputEl().value : "",
        nodes,
        idCounter,
        copiedSinceChange,
        lastCopyAt
      };
    }

    function saveNow() {
      try {
        localStorage.setItem(storageKey, JSON.stringify(getSerializableState()));
        markSaved();
      } catch {
        markStorageBlocked();
      }
    }

    function scheduleSave() {
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        saveTimer = null;
        saveNow();
      }, SAVE_DEBOUNCE_MS);
    }

    const pulse = setInterval(() => { if (dirty) saveNow(); }, SAVE_PULSE_MS);

    // ---- helpers ----
    function clearMoveState() { sourceId = null; }
    function revealAfterRender(nodeId) { revealId = nodeId; }

    function autoResize(el) {
      if (!el) return;
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    }

    function indexOfId(id) {
      return nodes.findIndex(n => n.id === id);
    }

    function getFamilyByIndex(index) {
      const fam = [index];
      if (index < 0 || index >= nodes.length) return fam;
      const pLevel = nodes[index].level;
      for (let i = index + 1; i < nodes.length; i++) {
        if (nodes[i].level > pLevel) fam.push(i);
        else break;
      }
      return fam;
    }

    function newNode(level, title = "", body = "", isCollapsed = false, showBody = false) {
      return { id: idCounter++, level, title, body, isCollapsed, showBody };
    }

    function normalizeNodesInPlace() {
      for (const n of nodes) {
        if (typeof n.showBody !== "boolean") n.showBody = false;
        if (typeof n.isCollapsed !== "boolean") n.isCollapsed = false;
        if (typeof n.body !== "string") n.body = "";
        if (typeof n.title !== "string") n.title = "";
        if (typeof n.level !== "number") n.level = 1;
      }
    }

    function computeMovingFamilyIdSet() {
      if (sourceId === null) return new Set();
      const sIdx = indexOfId(sourceId);
      if (sIdx < 0) return new Set();
      const famIdxs = getFamilyByIndex(sIdx);
      const set = new Set();
      famIdxs.forEach(i => set.add(nodes[i].id));
      return set;
    }

    // ---- actions ----
    function parseMarkdown() {
      const input = inputEl();
      if (!input) return;

      const text = input.value;
      if (!text.trim()) return;

      clearMoveState();

      const lines = text.split("\n");
      nodes = [];

      let currentBox = null;
      for (const line of lines) {
        const headerMatch = line.match(/^(#{1,6})\s+(.*)$/);
        if (headerMatch) {
          currentBox = newNode(headerMatch[1].length, headerMatch[2], "", false, false);
          nodes.push(currentBox);
        } else if (currentBox) {
          currentBox.body += line + "\n";
        }
      }

      nodes.forEach(n => n.showBody = false);

      if (nodes[0]) revealAfterRender(nodes[0].id);
      render({ preserveScroll: false });
      markDirty();
    }

    function toggleCollapseById(nodeId) {
      const idx = indexOfId(nodeId);
      if (idx < 0) return;
      nodes[idx].isCollapsed = !nodes[idx].isCollapsed;
      render({ preserveScroll: true });
      markDirty();
    }

    function toggleBodyById(nodeId) {
      const idx = indexOfId(nodeId);
      if (idx < 0) return;
      nodes[idx].showBody = !nodes[idx].showBody;
      revealAfterRender(nodeId);
      render({ preserveScroll: false });
      markDirty();
    }

    function toMarkdownString() {
      return nodes
        .map((n) => {
          const header = "#".repeat(n.level) + " " + (n.title ?? "");
          const body = (n.body ?? "");
          const bodyNormalized = body.replace(/\s+$/, "");
          return bodyNormalized ? `${header}\n${bodyNormalized}` : `${header}`;
        })
        .join("\n\n");
    }

    function saveToInput() {
      const input = inputEl();
      if (!input) return;
      input.value = toMarkdownString();
      // This is a change to the input field, but not necessarily “copy to Ulysses”.
      // So it should still flip to Not copied.
      markDirty();
    }

    async function exportMarkdown() {
      saveToInput();

      const input = inputEl();
      if (!input) return;

      const text = input.value;

      try {
        await navigator.clipboard.writeText(text);

        copiedSinceChange = true;
        lastCopyAt = new Date().toISOString();
        setCopyBadge();
        scheduleSave(); // persist copied flag

        alert("Copied!");
      } catch {
        // Fallback: select the text and ask user to copy
        input.focus();
        input.select();

        // Not counting this as copied because clipboard call failed
        alert("Copy failed (permission/browser). Text selected — use Copy.");
      }
    }

    function changeLevelById(nodeId, delta) {
      const idx = indexOfId(nodeId);
      if (idx < 0) return;

      clearMoveState();

      const fam = getFamilyByIndex(idx);
      fam.forEach(i => { nodes[i].level = clamp(nodes[i].level + delta, 1, 6); });

      revealAfterRender(nodeId);
      render({ preserveScroll: false });
      markDirty();
    }

    function addNewNodeAfterById(nodeId) {
      clearMoveState();

      const idx = indexOfId(nodeId);
      if (idx < 0) return;

      const fam = getFamilyByIndex(idx);
      const insertAt = fam.slice(-1)[0] + 1;

      const level = nodes[idx].level;
      const nn = newNode(level, "", "", false, false);
      nodes.splice(insertAt, 0, nn);

      revealAfterRender(nn.id);
      render({ preserveScroll: false });
      markDirty();
    }

    function duplicateBlockById(nodeId) {
      const idx = indexOfId(nodeId);
      if (idx < 0) return;

      clearMoveState();

      const fam = getFamilyByIndex(idx);
      const insertAt = fam.slice(-1)[0] + 1;

      const clones = fam.map(i => {
        const n = nodes[i];
        return newNode(n.level, n.title ?? "", n.body ?? "", !!n.isCollapsed, false);
      });

      nodes.splice(insertAt, 0, ...clones);

      if (clones[0]) revealAfterRender(clones[0].id);
      render({ preserveScroll: false });
      markDirty();
    }

    function deleteBlockById(nodeId) {
      const idx = indexOfId(nodeId);
      if (idx < 0) return;
      if (!confirm("Delete?")) return;

      clearMoveState();

      const fam = getFamilyByIndex(idx);
      nodes.splice(idx, fam.length);

      const next = nodes[Math.min(idx, nodes.length - 1)];
      if (next) revealAfterRender(next.id);

      render({ preserveScroll: false });
      markDirty();
    }

    function resetApp() {
      if (!confirm("Reset?")) return;

      nodes = [];
      idCounter = 1;
      clearMoveState();
      revealId = null;

      copiedSinceChange = false;
      lastCopyAt = null;

      const input = inputEl();
      if (input) input.value = "";

      try { localStorage.removeItem(storageKey); } catch {}

      render({ preserveScroll: true });
      setSaveBadge("", "dim");
      setCopyBadge();
    }

    function togglePinById(nodeId) {
      if (sourceId === null) sourceId = nodeId;
      else if (sourceId === nodeId) sourceId = null;
      else sourceId = nodeId;
      render({ preserveScroll: true });
      markDirty(); // pin state is part of interaction history; treat as change
    }

    function placePinnedAfterTargetId(targetId) {
      if (sourceId === null) return;

      const sIdx = indexOfId(sourceId);
      const tIdx = indexOfId(targetId);
      if (sIdx < 0 || tIdx < 0) { sourceId = null; render({ preserveScroll: true }); return; }

      const sourceFamIdxs = getFamilyByIndex(sIdx);
      if (sourceFamIdxs.includes(tIdx)) return;

      const moving = nodes.splice(sIdx, sourceFamIdxs.length);
      const movedRootId = moving[0]?.id ?? null;

      const newTIdx = indexOfId(targetId);
      const targetFamIdxs = getFamilyByIndex(newTIdx);
      const insertAt = targetFamIdxs.slice(-1)[0] + 1;

      nodes.splice(insertAt, 0, ...moving);

      sourceId = null;

      if (movedRootId !== null) revealAfterRender(movedRootId);
      render({ preserveScroll: false });
      markDirty();
    }

    // ---- render ----
    function render({ preserveScroll }) {
      const canvas = canvasEl();
      if (!canvas) return;

      const scrollPos = window.scrollY;
      canvas.innerHTML = "";

      const hidden = new Set();
      nodes.forEach((n, idx) => {
        if (n.isCollapsed) getFamilyByIndex(idx).slice(1).forEach(c => hidden.add(c));
      });

      const movingFamilyIds = computeMovingFamilyIdSet();

      nodes.forEach((node, index) => {
        if (hidden.has(index)) return;

        const fam = getFamilyByIndex(index);
        const hasChildren = fam.length > 1;

        const isSource = (node.id === sourceId);
        const isMovingChild = (sourceId !== null) && movingFamilyIds.has(node.id) && !isSource;
        const isValidTarget = (sourceId !== null) && !movingFamilyIds.has(node.id);

        const div = document.createElement("div");
        div.className = "node-item";
        div.dataset.nodeId = String(node.id);

        if (isSource) div.classList.add("moving-source");
        if (isMovingChild) div.classList.add("moving-child-visual");
        if (node.isCollapsed) div.classList.add("is-collapsed-node");
        if (isValidTarget) div.classList.add("move-target-hint");

        div.style.marginLeft = `${(node.level - 1) * 18}px`;

        const headerRow = document.createElement("div");
        headerRow.className = "node-header-row";

        const drag = document.createElement("div");
        drag.className = "drag-handle";
        drag.textContent = isSource ? "📍 PIN" : "⠿";
        drag.addEventListener("click", (e) => {
          e.stopPropagation();
          togglePinById(node.id);
        });

        let collapse;
        if (hasChildren) {
          collapse = document.createElement("div");
          collapse.className = "collapse-toggle";
          collapse.textContent = node.isCollapsed ? "▶" : "▼";
          collapse.addEventListener("click", (e) => {
            e.stopPropagation();
            toggleCollapseById(node.id);
          });
        } else {
          collapse = document.createElement("div");
          collapse.style.width = "34px";
          collapse.style.flexShrink = "0";
        }

        const hasBody = (node.body || "").trim().length > 0;

        const lvl = document.createElement("span");
        lvl.className = "level-label";
        lvl.textContent = `H${node.level}`;
        if (hasBody) {
          const note = document.createElement("span");
          note.className = "has-body-icon";
          note.textContent = "📝";
          note.title = "This section has body text";
          lvl.appendChild(note);
        }

        const title = document.createElement("textarea");
        title.className = "title-area";
        title.rows = 1;
        title.value = node.title ?? "";
        title.addEventListener("click", (e) => e.stopPropagation());
        title.addEventListener("input", () => {
          const idx = indexOfId(node.id);
          if (idx >= 0) nodes[idx].title = title.value;
          autoResize(title);
          markDirty();
        });

        const tools = document.createElement("div");
        tools.className = "btn-tools";
        tools.addEventListener("click", (e) => e.stopPropagation());

        const mkBtn = (text, cssText, onClick, aria, extraClass) => {
          const b = document.createElement("button");
          b.type = "button";
          b.className = "tool-btn" + (extraClass ? (" " + extraClass) : "");
          b.textContent = text;
          b.style.cssText = cssText;
          if (aria) b.setAttribute("aria-label", aria);
          b.addEventListener("click", onClick);
          return b;
        };

        if (isValidTarget) {
          tools.append(
            mkBtn("DROP", "", () => placePinnedAfterTargetId(node.id), "Drop pinned section here", "drop")
          );
        }

        tools.append(
          mkBtn(node.showBody ? "🙈" : "👁", "background:#fff;color:#111;", () => toggleBodyById(node.id),
            node.showBody ? "Hide body text" : "Show body text")
        );

        tools.append(
          mkBtn("+",  "background:#0b7a2b;color:#fff;border-color:#0b7a2b;", () => addNewNodeAfterById(node.id), "Add section after"),
          mkBtn("⧉", "background:#fff;color:#111;", () => duplicateBlockById(node.id), "Duplicate section (with children)"),
          mkBtn("←", "background:#fff;color:#111;", () => changeLevelById(node.id, -1), "Decrease heading level"),
          mkBtn("→", "background:#fff;color:#111;", () => changeLevelById(node.id,  1), "Increase heading level"),
          mkBtn("✕", "background:#fff;color:#7a0000;border-color:#7a0000;", () => deleteBlockById(node.id), "Delete section (with children)")
        );

        headerRow.append(drag, collapse, lvl, title, tools);
        div.appendChild(headerRow);

        if (node.isCollapsed) {
          const folded = document.createElement("div");
          folded.className = "folded-note";
          folded.textContent = `Branch Folded (${fam.length - 1} sub-sections)`;
          div.appendChild(folded);
        } else if (node.showBody) {
          const body = document.createElement("textarea");
          body.className = "body-preview";
          body.value = node.body ?? "";
          body.addEventListener("input", () => {
            const idx = indexOfId(node.id);
            if (idx >= 0) nodes[idx].body = body.value;
            markDirty();
          });
          div.appendChild(body);
        }

        canvas.appendChild(div);
        autoResize(title);
      });

      requestAnimationFrame(() => {
        if (revealId !== null) {
          const el = canvas.querySelector(`.node-item[data-node-id="${CSS.escape(String(revealId))}"]`);
          revealId = null;

          if (el) {
            el.scrollIntoView({ block: "center", behavior: "smooth" });
            el.style.outline = "4px solid #0b5fff";
            el.style.outlineOffset = "4px";
            setTimeout(() => {
              el.style.outline = "";
              el.style.outlineOffset = "";
            }, 900);

            const title = el.querySelector(".title-area");
            if (title) {
              try { title.focus({ preventScroll: true }); } catch { title.focus(); }
            }
            return;
          }
        }

        if (preserveScroll) window.scrollTo(0, scrollPos);
      });
    }

    // ---- restore ----
    function restoreIfAvailable() {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return false;

      const data = safeJsonParse(raw);
      if (!data || typeof data !== "object") return false;

      if (Array.isArray(data.nodes)) nodes = data.nodes;
      normalizeNodesInPlace();

      const maxId = nodes.reduce((m, n) => Math.max(m, Number(n.id) || 0), 0);
      idCounter = Math.max(maxId + 1, Number(data.idCounter) || 1);

      copiedSinceChange = !!data.copiedSinceChange;
      lastCopyAt = (typeof data.lastCopyAt === "string") ? data.lastCopyAt : null;

      const input = inputEl();
      if (input && typeof data.md === "string") input.value = data.md;

      setCopyBadge();

      if (nodes[0]) revealAfterRender(nodes[0].id);
      render({ preserveScroll: false });
      markSaved();
      return true;
    }

    // ---- bind top buttons ----
    const loadBtn = container.querySelector(".load-btn");
    const saveBtn = container.querySelector(".save-back-btn");
    const exportBtn = container.querySelector(".export-btn");
    const resetBtn = container.querySelector(".reset-btn");
    const input = inputEl();

    if (loadBtn) loadBtn.addEventListener("click", parseMarkdown);
    if (saveBtn) saveBtn.addEventListener("click", saveToInput);
    if (exportBtn) exportBtn.addEventListener("click", exportMarkdown);
    if (resetBtn) resetBtn.addEventListener("click", resetApp);

    if (input) input.addEventListener("input", () => markDirty());

    // ---- initial ----
    setSaveBadge("", "dim");
    setCopyBadge();
    render({ preserveScroll: true });

    const restored = (() => { try { return restoreIfAvailable(); } catch { return false; } })();
    if (!restored) {
      // default state: nothing copied yet
      copiedSinceChange = false;
      lastCopyAt = null;
      setCopyBadge();
    }

    // ---- cleanup if Squarespace swaps DOM ----
    const cleanupObserver = new MutationObserver(() => {
      if (!document.documentElement.contains(container)) {
        clearInterval(pulse);
        if (saveTimer) clearTimeout(saveTimer);
        cleanupObserver.disconnect();
      }
    });
    cleanupObserver.observe(document.documentElement, { childList: true, subtree: true });
  }

  // ----------------------------
  // Boot (Squarespace/AJAX friendly)
  // ----------------------------
  function initAll() {
    ensureStyleInjected();
    const containers = document.querySelectorAll(`.${APP_CLASS}`);
    containers.forEach((c, idx) => initInstance(c, idx));
  }

  function boot() {
    initAll();

    const t = setInterval(initAll, 300);
    setTimeout(() => clearInterval(t), 9000);

    const obs = new MutationObserver(() => initAll());
    obs.observe(document.documentElement, { childList: true, subtree: true });

    window.addEventListener("popstate", () => setTimeout(initAll, 0));
    window.addEventListener("hashchange", () => setTimeout(initAll, 0));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();

