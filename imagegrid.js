(() => {
  "use strict";

  // Ensure registry exists (works with your loader.js)
  window.SiteApps = window.SiteApps || {};
  window.SiteApps.registry = window.SiteApps.registry || {};
  window.SiteApps.register =
    window.SiteApps.register ||
    function (name, initFn) {
      window.SiteApps.registry[name] = initFn;
    };

  const APP = "imagegrid";
  const STYLE_ID = `siteapps-${APP}-style-v1`;
  const STORAGE_PREFIX = `siteapps:${APP}:`;

  // ---------- storage (namespaced, resilient) ----------
  function sGet(key, fallback) {
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + key);
      return raw == null ? fallback : JSON.parse(raw);
    } catch (_) {
      return fallback;
    }
  }
  function sSet(key, value) {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    } catch (_) {}
  }

  // ---------- helpers ----------
  function clamp(n, a, b) {
    n = Number(n);
    if (!isFinite(n)) return a;
    return Math.max(a, Math.min(b, n));
  }

function toBlobURL(file) {
  try { return URL.createObjectURL(file); } catch (_) { return ""; }
}
function revokeBlobURL(url) {
  try { url && url.startsWith("blob:") && URL.revokeObjectURL(url); } catch (_) {}
}
  
  function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result || ""));
      r.onerror = () => reject(new Error("Failed to read file"));
      r.readAsDataURL(file);
    });
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Image load failed"));
      img.src = src;
    });
  }

  // Draw image into rect with "cover"
  function drawCover(ctx, img, x, y, w, h) {
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    if (!iw || !ih) return;

    const scale = Math.max(w / iw, h / ih);
    const sw = w / scale;
    const sh = h / scale;
    const sx = (iw - sw) / 2;
    const sy = (ih - sh) / 2;

    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  }

  // Draw image into rect with "contain"
  function drawContain(ctx, img, x, y, w, h) {
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    if (!iw || !ih) return;

    const scale = Math.min(w / iw, h / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = x + (w - dw) / 2;
    const dy = y + (h - dh) / 2;

    ctx.drawImage(img, dx, dy, dw, dh);
  }

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
/* Image Grid Builder — iPad friendly */
[data-app="${APP}"]{
  font-family:-apple-system,system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;
  background:#fff;
  border:2px solid #111;
  padding:18px;
  border-radius:14px;
  color:#111;
  max-width:1100px;
  margin:14px auto;
}
[data-app="${APP}"] .top-row{
  display:flex;
  align-items:baseline;
  justify-content:space-between;
  gap:10px;
  flex-wrap:wrap;
  margin-bottom:10px;
}
[data-app="${APP}"] h3{
  margin:0;
  font-size:20px;
  font-weight:900;
}
[data-app="${APP}"] .note{
  font-size:13px;
  font-weight:700;
  color:#333;
}
[data-app="${APP}"] .tools{
  display:flex;
  flex-wrap:wrap;
  gap:10px;
  align-items:flex-end;
  margin:10px 0 14px;
  padding-top:10px;
  border-top:2px solid rgba(0,0,0,.08);
}
[data-app="${APP}"] label{
  display:block;
  font-weight:900;
  font-size:13px;
  margin:0 0 6px;
}
[data-app="${APP}"] input[type="number"],
[data-app="${APP}"] select{
  width:100%;
  box-sizing:border-box;
  border:2px solid #111;
  border-radius:10px;
  padding:10px;
  font-size:16px; /* iPad */
  background:#fff;
  color:#111;
}
[data-app="${APP}"] .tool{
  min-width:160px;
  flex: 1 1 160px;
}
[data-app="${APP}"] .tool.small{ min-width:120px; flex: 0 1 120px; }
[data-app="${APP}"] .btn{
  border:2px solid #111;
  background:#fff;
  color:#111;
  border-radius:12px;
  padding:10px 12px;
  font-size:15px;
  font-weight:900;
  cursor:pointer;
  user-select:none;
}
[data-app="${APP}"] .btn:active{ transform: translateY(1px); }

[data-app="${APP}"] .layout{
  display:grid;
  grid-template-columns: 1fr;
  gap:12px;
}
@media (min-width: 900px){
  [data-app="${APP}"] .layout{
    grid-template-columns: 1.2fr 0.8fr;
    align-items:start;
  }
}
[data-app="${APP}"] .gridWrap{
  border:2px solid #111;
  border-radius:14px;
  overflow:hidden;
  background:#f4f4f4;
}
[data-app="${APP}"] .grid{
  display:grid;
  gap: var(--gap, 8px);
  padding: var(--gap, 8px);
  background: var(--bg, #fff);
}
[data-app="${APP}"] .slot{
  position:relative;
  border:2px dashed rgba(0,0,0,.35);
  border-radius:12px;
  overflow:hidden;
  background: rgba(255,255,255,.2);
  min-height: 90px;
  touch-action: manipulation;
}
[data-app="${APP}"] .slot.filled{
  border-style: solid;
  border-color: rgba(0,0,0,.35);
}
[data-app="${APP}"] .slot.selected{
  outline: 4px solid rgba(0,0,0,.75);
  outline-offset: -2px;
}
[data-app="${APP}"] .thumb{
  width:100%;
  height:100%;
  object-fit: cover;
  display:block;
}
[data-app="${APP}"] .slot .meta{
  position:absolute;
  left:8px;
  bottom:8px;
  right:8px;
  display:flex;
  justify-content:space-between;
  gap:8px;
  align-items:center;
  pointer-events:none;
}
[data-app="${APP}"] .chip{
  font-size:12px;
  font-weight:900;
  padding:6px 10px;
  border-radius:999px;
  background: rgba(255,255,255,.85);
  border:2px solid rgba(0,0,0,.35);
  color:#111;
}
[data-app="${APP}"] .slot .actions{
  position:absolute;
  top:8px;
  right:8px;
  display:flex;
  gap:6px;
}
[data-app="${APP}"] .iconBtn{
  border:2px solid rgba(0,0,0,.45);
  background: rgba(255,255,255,.92);
  color:#111;
  border-radius:10px;
  padding:8px 10px;
  font-weight:900;
  font-size:13px;
  cursor:pointer;
}
[data-app="${APP}"] .side{
  border:2px solid rgba(0,0,0,.12);
  border-radius:14px;
  padding:12px;
  background:#fff;
}
[data-app="${APP}"] .side h4{
  margin:0 0 8px;
  font-size:16px;
  font-weight:900;
}
[data-app="${APP}"] .muted{
  font-size:13px;
  color:#333;
  font-weight:700;
}
[data-app="${APP}"] .hr{ height:1px; background: rgba(0,0,0,.12); margin:10px 0; }
[data-app="${APP}"] .toast{
  position: fixed;
  left: 50%;
  bottom: 18px;
  transform: translateX(-50%);
  background:#111;
  color:#fff;
  padding:10px 14px;
  border-radius:999px;
  font-weight:900;
  font-size:14px;
  opacity:0;
  pointer-events:none;
  transition: opacity .18s ease;
  z-index: 999999;
}
[data-app="${APP}"] .toast.show{ opacity:1; }
`;
    document.head.appendChild(style);
  }

  function init(root) {
    // iPad-safe: avoid double init on re-render
    if (root.__siteapps_inited) return;
    root.__siteapps_inited = true;

    ensureStyle();

    root.innerHTML = `
      <div class="top-row">
        <h3>Image Grid Builder</h3>
        <div class="note">Tap a slot to add/replace. Tap one slot then another to swap.</div>
      </div>

      <div class="tools">
        <div class="tool small">
          <label>Rows</label>
          <input type="number" min="1" max="20" step="1" data-k="rows">
        </div>

        <div class="tool small">
          <label>Cols</label>
          <input type="number" min="1" max="20" step="1" data-k="cols">
        </div>

        <div class="tool">
          <label>Layout</label>
          <select data-k="layout">
            <option value="square">Square cells (equal slots)</option>
            <option value="natural">Natural (size from photos)</option>
          </select>
        </div>

        <div class="tool">
          <label>Fit</label>
          <select data-k="fit">
            <option value="cover">Cover (crop to fill)</option>
            <option value="contain">Contain (no crop)</option>
          </select>
        </div>

        <div class="tool small">
          <label>Gap (px)</label>
          <input type="number" min="0" max="80" step="1" data-k="gap">
        </div>

        <div class="tool">
          <label>Background</label>
          <select data-k="bg">
            <option value="#000000">Black</option>
            <option value="#ffffff">White</option>
            <option value="#808080">Grey</option>
          </select>
        </div>

        <div class="tool">
          <label>Add images</label>
          <button class="btn" data-act="add">Choose Photos…</button>
          <input type="file" accept="image/*" multiple style="display:none" data-k="picker">
        </div>
      </div>

      <div class="layout">
        <div class="gridWrap">
          <div class="grid" data-k="grid"></div>
        </div>

        <div class="side">
          <h4>Export JPEG</h4>

          <div class="tool">
            <label>Output width (px)</label>
            <input type="number" min="100" max="20000" step="1" data-k="outW">
          </div>

          <div class="tool">
            <label>Output height (px)</label>
            <input type="number" min="100" max="20000" step="1" data-k="outH">
          </div>

          <div class="tool">
            <label>JPEG quality (0.10–1.00)</label>
            <input type="number" min="0.1" max="1" step="0.05" data-k="quality">
          </div>

          <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:10px;">
            <button class="btn" data-act="export">Export JPEG</button>
            <button class="btn" data-act="clearAll">Clear all</button>
          </div>

          <div class="hr"></div>
          <div class="muted">
            Tip: for a 2×2 with 3 photos, leave one slot empty — it exports as background colour.
          </div>
        </div>
      </div>

      <div class="toast" data-k="toast"></div>
    `;

    const $ = (sel) => root.querySelector(sel);
    const gridEl = $('[data-k="grid"]');
    const toastEl = $('[data-k="toast"]');

    const rowsEl = $('[data-k="rows"]');
    const colsEl = $('[data-k="cols"]');
    const layoutEl = $('[data-k="layout"]');
    const fitEl = $('[data-k="fit"]');
    const gapEl = $('[data-k="gap"]');
    const bgEl = $('[data-k="bg"]');

    const picker = $('[data-k="picker"]');
    const outWEl = $('[data-k="outW"]');
    const outHEl = $('[data-k="outH"]');
    const qEl = $('[data-k="quality"]');

    // ---- state ----
    let rows = clamp(sGet("rows", 2), 1, 20);
    let cols = clamp(sGet("cols", 2), 1, 20);
    let layout = sGet("layout", "square"); // square | natural
    let fit = sGet("fit", "cover"); // cover | contain
    let gap = clamp(sGet("gap", 8), 0, 80);
    let bg = sGet("bg", "#ffffff");

    let outW = clamp(sGet("outW", 2048), 100, 20000);
    let outH = clamp(sGet("outH", 2048), 100, 20000);
    let quality = clamp(sGet("quality", 0.92), 0.1, 1);

    // slots: { src, name, w, h }
    let slots = [];
    let selectedIndex = -1;
    let pendingReplaceIndex = -1;

    function toast(msg) {
      toastEl.textContent = msg;
      toastEl.classList.add("show");
      clearTimeout(toastEl.__t);
      toastEl.__t = setTimeout(() => toastEl.classList.remove("show"), 1200);
    }

    function slotCount() {
      return rows * cols;
    }

    function ensureSlots() {
      const n = slotCount();
      if (slots.length < n) {
        while (slots.length < n) slots.push({ src: "", name: "", w: 0, h: 0, _blob: "" });
      } else if (slots.length > n) {
        slots = slots.slice(0, n);
      }
    }

    function persistSettings() {
      sSet("rows", rows);
      sSet("cols", cols);
      sSet("layout", layout);
      sSet("fit", fit);
      sSet("gap", gap);
      sSet("bg", bg);
      sSet("outW", outW);
      sSet("outH", outH);
      sSet("quality", quality);
    }

    function applyGridStyle() {
      gridEl.style.setProperty("--gap", `${gap}px`);
      gridEl.style.setProperty("--bg", bg);
      gridEl.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
    }

    function computeNaturalRowColSizes() {
      // Natural mode: each row height is max aspect-driven height given fixed column widths,
      // but we don't have fixed width in preview; so we approximate for preview using CSS.
      // For export we compute from image dims (see export()).
      // Preview strategy: still use equal columns; allow slots to auto-height based on a CSS ratio var.
      // We'll compute a per-slot ratio and set padding-top accordingly.
    }

    function render() {
      ensureSlots();
      applyGridStyle();
      gridEl.innerHTML = "";

      const n = slotCount();

      for (let i = 0; i < n; i++) {
        const s = slots[i];
        const filled = !!s.src;

        const slot = document.createElement("div");
        slot.className = "slot" + (filled ? " filled" : "") + (i === selectedIndex ? " selected" : "");
        slot.setAttribute("data-idx", String(i));

        // Preview sizing:
        if (layout === "square") {
          // square cell: enforce 1:1
          slot.style.aspectRatio = "1 / 1";
        } else {
          // natural: if image exists use its ratio; else default square
          const ratio = filled && s.w && s.h ? `${s.w} / ${s.h}` : "1 / 1";
          slot.style.aspectRatio = ratio;
        }

        // Drag & drop support (desktop-ish)
        slot.draggable = true;

        if (filled) {
          const img = document.createElement("img");
          img.className = "thumb";
          img.alt = s.name || `Image ${i + 1}`;
          img.src = s.src;
          img.style.objectFit = fit === "contain" ? "contain" : "cover";
          slot.appendChild(img);
        }

        const actions = document.createElement("div");
        actions.className = "actions";

        const rep = document.createElement("button");
        rep.className = "iconBtn";
        rep.type = "button";
        rep.textContent = "Replace";
        rep.addEventListener("click", (e) => {
          e.stopPropagation();
          pendingReplaceIndex = i;
          picker.click();
        });

        const clr = document.createElement("button");
        clr.className = "iconBtn";
        clr.type = "button";
        clr.textContent = "Clear";
        clr.addEventListener("click", (e) => {
          e.stopPropagation();
          // slots[i] = { src: "", name: "", w: 0, h: 0 };
          revokeBlobURL(slots[i]._blob || "");
slots[i] = { src: "", name: "", w: 0, h: 0, _blob: "" };
          if (selectedIndex === i) selectedIndex = -1;
          render();
        });

        actions.appendChild(rep);
        actions.appendChild(clr);
        slot.appendChild(actions);

        const meta = document.createElement("div");
        meta.className = "meta";
        const chipL = document.createElement("div");
        chipL.className = "chip";
        chipL.textContent = `#${i + 1}`;
        const chipR = document.createElement("div");
        chipR.className = "chip";
        chipR.textContent = filled ? (s.name || "Image") : "Empty";
        meta.appendChild(chipL);
        meta.appendChild(chipR);
        slot.appendChild(meta);

        // Tap to select / swap / add
        slot.addEventListener("click", () => {

slot.addEventListener("click", () => {
  const isEmpty = !slots[i] || !slots[i].src;

  // If the slot is empty, tap should add/replace directly
  if (isEmpty) {
    selectedIndex = -1;
    pendingReplaceIndex = i;   // target this slot
    picker.click();            // open selector (user gesture)
    return;
  }

  // Otherwise: tap-to-select / tap-to-swap
  if (selectedIndex === -1) {
    selectedIndex = i;
    render();
    return;
  }
  if (selectedIndex === i) {
    selectedIndex = -1;
    render();
    return;
  }

  // swap
  const a = selectedIndex;
  const tmp = slots[a];
  slots[a] = slots[i];
  slots[i] = tmp;
  selectedIndex = -1;
  render();
  toast("Swapped");
});
          
          if (selectedIndex === i) {
            selectedIndex = -1;
            render();
            return;
          }
          // swap
          const a = selectedIndex;
          const tmp = slots[a];
          slots[a] = slots[i];
          slots[i] = tmp;
          selectedIndex = -1;
          render();
          toast("Swapped");
        });

        // Drag start
        slot.addEventListener("dragstart", (e) => {
          try {
            e.dataTransfer.setData("text/plain", String(i));
            e.dataTransfer.effectAllowed = "move";
          } catch (_) {}
        });

        // Drag over
        slot.addEventListener("dragover", (e) => {
          e.preventDefault();
          try { e.dataTransfer.dropEffect = "move"; } catch (_) {}
        });

        // Drop (swap)
        slot.addEventListener("drop", (e) => {
          e.preventDefault();
          let from = -1;
          try { from = Number(e.dataTransfer.getData("text/plain")); } catch (_) {}
          if (!isFinite(from) || from < 0 || from >= n || from === i) return;
          const tmp = slots[from];
          slots[from] = slots[i];
          slots[i] = tmp;
          selectedIndex = -1;
          render();
          toast("Swapped");
        });

        gridEl.appendChild(slot);
      }
    }

function getInsertionPositions(startAtFirstEmpty) {
  // If we're replacing a specific slot, only use that one.
  if (pendingReplaceIndex >= 0) return [pendingReplaceIndex];

  // Otherwise, fill empty slots first (common case).
  if (startAtFirstEmpty) {
    const empties = [];
    for (let i = 0; i < slots.length; i++) {
      if (!slots[i].src) empties.push(i);
    }
    return empties;
  }

  // Or: fill from slot 0 onward.
  return Array.from({ length: slots.length }, (_, i) => i);
}

async function fileToSlot(file, idx) {
  // Clean up old blob URL in that slot
  revokeBlobURL(slots[idx]._blob || "");

  const blobUrl = toBlobURL(file);
  if (!blobUrl) return false;

  let w = 0, h = 0;
  try {
    const img = await loadImage(blobUrl);
    w = img.naturalWidth || img.width || 0;
    h = img.naturalHeight || img.height || 0;
  } catch (_) {
    // If we can't load it, revoke and bail
    revokeBlobURL(blobUrl);
    return false;
  }

  slots[idx] = {
    src: blobUrl,
    _blob: blobUrl,
    name: file.name || `Image ${idx + 1}`,
    w, h
  };

  return true;
}

async function addFiles(files, startAtFirstEmpty = true) {
  const list = Array.from(files || []).filter(Boolean);
  if (!list.length) return;

  ensureSlots();

  const positions = getInsertionPositions(startAtFirstEmpty);
  if (!positions.length) {
    pendingReplaceIndex = -1;
    toast("No empty slots");
    return;
  }

  let used = 0;
  for (let f = 0; f < list.length; f++) {
    if (used >= positions.length) break;

    const idx = positions[used];
    const ok = await fileToSlot(list[f], idx);

    // Only advance to the next slot if we successfully filled this one
    if (ok) used++;
  }

  pendingReplaceIndex = -1;
  render();
  toast(used ? "Added" : "Couldn’t add image");
}
    
    function clearAll() {
      slots.forEach(s => revokeBlobURL(s._blob || ""));
      slots = [];
      selectedIndex = -1;
      pendingReplaceIndex = -1;
      ensureSlots();
      render();
      toast("Cleared");
    }

    async function exportJPEG() {
      ensureSlots();

      const W = clamp(outWEl.value, 100, 20000);
      const H = clamp(outHEl.value, 100, 20000);
      const Q = clamp(qEl.value, 0.1, 1);

      // Persist
      outW = W; outH = H; quality = Q;
      persistSettings();

      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");

      // Background
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Layout computation
      const g = gap;
      const nRows = rows;
      const nCols = cols;

      if (layout === "square") {
        // equal square slots, centered inside available area
        const availW = W - g * (nCols + 1);
        const availH = H - g * (nRows + 1);
        const cell = Math.floor(Math.min(availW / nCols, availH / nRows));
        const gridW = cell * nCols + g * (nCols + 1);
        const gridH = cell * nRows + g * (nRows + 1);
        const ox = Math.floor((W - gridW) / 2);
        const oy = Math.floor((H - gridH) / 2);

        // Draw each slot
        const imagePromises = slots.map((s) => (s.src ? loadImage(s.src).catch(() => null) : Promise.resolve(null)));
        const imgs = await Promise.all(imagePromises);

        for (let r = 0; r < nRows; r++) {
          for (let c = 0; c < nCols; c++) {
            const i = r * nCols + c;
            const x = ox + g + c * (cell + g);
            const y = oy + g + r * (cell + g);
            const img = imgs[i];
            if (!img) continue;

            if (fit === "contain") drawContain(ctx, img, x, y, cell, cell);
            else drawCover(ctx, img, x, y, cell, cell);
          }
        }
      } else {
        // natural: row heights + col widths derived from max image dims per row/col
        // Strategy: use max width per column and max height per row (from the images in those positions),
        // then scale whole grid uniformly to fit inside output while preserving those proportions.

        // Build base sizes
        const colW = new Array(nCols).fill(1);
        const rowH = new Array(nRows).fill(1);

        for (let r = 0; r < nRows; r++) {
          for (let c = 0; c < nCols; c++) {
            const i = r * nCols + c;
            const s = slots[i];
            if (s && s.w && s.h) {
              colW[c] = Math.max(colW[c], s.w);
              rowH[r] = Math.max(rowH[r], s.h);
            }
          }
        }

        const baseW = colW.reduce((a, b) => a + b, 0);
        const baseH = rowH.reduce((a, b) => a + b, 0);

        const availW = W - g * (nCols + 1);
        const availH = H - g * (nRows + 1);

        const scale = Math.min(availW / baseW, availH / baseH);
        const scaledColW = colW.map((v) => Math.floor(v * scale));
        const scaledRowH = rowH.map((v) => Math.floor(v * scale));

        const gridW = scaledColW.reduce((a, b) => a + b, 0) + g * (nCols + 1);
        const gridH = scaledRowH.reduce((a, b) => a + b, 0) + g * (nRows + 1);

        const ox = Math.floor((W - gridW) / 2);
        const oy = Math.floor((H - gridH) / 2);

        const imagePromises = slots.map((s) => (s.src ? loadImage(s.src).catch(() => null) : Promise.resolve(null)));
        const imgs = await Promise.all(imagePromises);

        // Draw
        let y = oy + g;
        for (let r = 0; r < nRows; r++) {
          let x = ox + g;
          for (let c = 0; c < nCols; c++) {
            const i = r * nCols + c;
            const w = scaledColW[c];
            const h = scaledRowH[r];
            const img = imgs[i];
            if (img) {
              if (fit === "contain") drawContain(ctx, img, x, y, w, h);
              else drawCover(ctx, img, x, y, w, h);
            }
            x += w + g;
          }
          y += scaledRowH[r] + g;
        }
      }

      // Export
      const dataUrl = canvas.toDataURL("image/jpeg", Q);

      // Trigger download
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `grid-${rows}x${cols}-${W}x${H}-q${String(Q).replace(".", "_")}.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      toast("Exported JPEG");
    }

    // ---- wire up controls ----
    rowsEl.value = String(rows);
    colsEl.value = String(cols);
    layoutEl.value = layout;
    fitEl.value = fit;
    gapEl.value = String(gap);
    bgEl.value = bg;
    outWEl.value = String(outW);
    outHEl.value = String(outH);
    qEl.value = String(quality);

    function syncFromUI() {
      rows = clamp(rowsEl.value, 1, 20);
      cols = clamp(colsEl.value, 1, 20);
      layout = String(layoutEl.value || "square");
      fit = String(fitEl.value || "cover");
      gap = clamp(gapEl.value, 0, 80);
      bg = String(bgEl.value || "#ffffff");
      persistSettings();
      selectedIndex = -1;
      ensureSlots();
      render();
    }

    rowsEl.addEventListener("change", syncFromUI);
    colsEl.addEventListener("change", syncFromUI);
    layoutEl.addEventListener("change", syncFromUI);
    fitEl.addEventListener("change", syncFromUI);
    gapEl.addEventListener("change", syncFromUI);
    bgEl.addEventListener("change", syncFromUI);

    root.querySelector('[data-act="add"]').addEventListener("click", () => {
      pendingReplaceIndex = -1;
      picker.click();
    });


picker.addEventListener("change", async () => {
  // IMPORTANT: copy the FileList BEFORE clearing the input (Safari!)
  const files = Array.from(picker.files || []);
  picker.value = ""; // now safe

  try {
    await addFiles(files, true);
  } catch (_) {
    toast("Couldn’t add image");
  }
});    

    root.querySelector('[data-act="clearAll"]').addEventListener("click", clearAll);
    root.querySelector('[data-act="export"]').addEventListener("click", () => {
      exportJPEG().catch(() => toast("Export failed"));
    });

    // Allow dropping files onto the grid (desktop)
    gridEl.addEventListener("dragover", (e) => { e.preventDefault(); });
    gridEl.addEventListener("drop", async (e) => {
      e.preventDefault();
      const dt = e.dataTransfer;
      if (!dt) return;
      const files = dt.files;
      if (files && files.length) {
        try { await addFiles(files, true); } catch (_) {}
      }
    });

    // Initial render
    ensureSlots();
    render();
  }

  window.SiteApps.register(APP, init);

  // If injected late, try initAll
  try { window.SiteApps.initAll && window.SiteApps.initAll(); } catch (_) {}
})();
