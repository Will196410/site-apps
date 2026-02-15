(() => {
  "use strict";

  // Registry helpers (works with your loader.js)
  window.SiteApps = window.SiteApps || {};
  window.SiteApps.registry = window.SiteApps.registry || {};
  window.SiteApps.register =
    window.SiteApps.register ||
    function (name, initFn) {
      window.SiteApps.registry[name] = initFn;
    };

  const STYLE_ID = "siteapps-palette-style-v1";

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
[data-app="palette"]{
  --gap:16px; --radius:14px;
  font-family:system-ui,-apple-system,Segoe UI,Roboto,Inter,Arial,sans-serif;
  max-width:1100px; margin:14px auto;
  border:2px solid #111; border-radius:16px;
  padding:18px; background:#fff; color:#111;
}
[data-app="palette"] .pe-uploader{
  border:2px dashed rgba(0,0,0,.25);
  border-radius:var(--radius);
  padding:28px;
  text-align:center;
  cursor:pointer;
  transition:.15s border-color,.15s background;
  position:relative;
}
[data-app="palette"] .pe-uploader.pe-drag{ border-color:rgba(0,0,0,.55); background:rgba(0,0,0,.04); }
[data-app="palette"] .pe-file{
  position:absolute;
  opacity:0;
  width:1px;
  height:1px;
  pointer-events:none; /* IMPORTANT for iOS */
}

[data-app="palette"] .pe-drop-help strong{ display:block; font-size:1.05rem; margin-bottom:4px; }
[data-app="palette"] .pe-cta{ text-decoration:underline; font-weight:800; }
[data-app="palette"] .pe-sub{ opacity:.75; font-size:.92rem; }

[data-app="palette"] .pe-controls{
  display:grid; grid-template-columns:1fr;
  gap:10px; margin:14px 0 6px;
}
[data-app="palette"] .pe-row{
  display:grid; grid-template-columns:auto 1fr auto;
  align-items:center; gap:10px;
}
[data-app="palette"] .pe-checkbox{ grid-template-columns:auto 1fr; }
[data-app="palette"] input[type="range"]{ width:100%; }
[data-app="palette"] output{ font-weight:900; }

[data-app="palette"] .pe-btn{
  appearance:none;
  border:2px solid #111;
  border-radius:12px;
  padding:10px 14px;
  background:#fff;
  cursor:pointer;
  transition:.12s transform,.12s box-shadow;
  font-weight:900;
}
[data-app="palette"] .pe-btn:hover{ transform:translateY(-1px); box-shadow:0 6px 14px rgba(0,0,0,.10); }
[data-app="palette"] .pe-btn:disabled{ opacity:.5; cursor:not-allowed; transform:none; box-shadow:none; }

[data-app="palette"] .pe-stage{
  display:grid; grid-template-columns:1fr;
  gap:var(--gap);
  margin-top:var(--gap);
}
[data-app="palette"] .pe-preview{ justify-self:center; max-width:100%; }
[data-app="palette"] .pe-preview img{ max-width:100%; height:auto; border-radius:var(--radius); display:none; border:1px solid rgba(0,0,0,.15); }
[data-app="palette"] .pe-palette{
  display:grid;
  grid-template-columns:repeat(auto-fill, minmax(180px,1fr));
  gap:var(--gap);
}
[data-app="palette"] .pe-swatch{
  border-radius:var(--radius);
  overflow:hidden;
  border:1px solid rgba(0,0,0,.12);
  background:#f6f6f6;
  display:flex;
  flex-direction:column;
}
[data-app="palette"] .pe-chip{ height:96px; }
[data-app="palette"] .pe-info{ padding:10px; display:grid; gap:6px; }
[data-app="palette"] .pe-line{ display:flex; align-items:center; justify-content:space-between; gap:10px; }
[data-app="palette"] .pe-tag{ font-weight:900; font-size:.92rem; }
[data-app="palette"] .pe-copy{
  border:2px solid #111;
  background:#fff;
  cursor:pointer;
  padding:6px 8px;
  border-radius:10px;
  font-weight:900;
}
[data-app="palette"] .pe-copy:hover{ background:rgba(0,0,0,.06); }

[data-app="palette"] .pe-actions{ display:flex; gap:10px; margin-top:10px; flex-wrap:wrap; }

[data-app="palette"] .pe-listwrap{ margin-top:18px; }
[data-app="palette"] .pe-h3{ margin:0 0 8px; font-size:1.05rem; font-weight:900; }
[data-app="palette"] .pe-list table{ width:100%; border-collapse:collapse; font-size:.95rem; }
[data-app="palette"] .pe-list th, [data-app="palette"] .pe-list td{
  border-bottom:1px solid rgba(0,0,0,.10);
  padding:8px 6px;
  text-align:left;
}
[data-app="palette"] .pe-sample{
  width:36px; height:24px;
  border-radius:8px;
  border:1px solid rgba(0,0,0,.12);
  display:inline-block;
}

[data-app="palette"] .pe-toast{
  position:fixed;
  left:50%;
  transform:translateX(-50%);
  bottom:24px;
  background:rgba(0,0,0,.88);
  color:#fff;
  padding:10px 14px;
  border-radius:999px;
  font-size:.95rem;
  opacity:0;
  pointer-events:none;
  transition:.2s opacity,.2s transform;
  z-index:10000;
}
[data-app="palette"] .pe-toast.show{
  opacity:1;
  transform:translate(-50%, -6px);
}
[data-app="palette"] textarea:focus,
[data-app="palette"] button:focus,
[data-app="palette"] input:focus{
  outline:3px solid rgba(11,95,255,.35);
  outline-offset:2px;
}

@media (min-width: 900px){
  [data-app="palette"] .pe-stage{ grid-template-columns:1fr 1.6fr; align-items:start; }
  [data-app="palette"] .pe-preview{ position:sticky; top:10px; }
}
`;
    document.head.appendChild(style);
  }

  // --- Utilities ---
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const toHex = (n) => n.toString(16).padStart(2, "0");
  const rgbToHex = (r, g, b) => `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();

  const rgbToHsl = (r, g, b) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; }
    else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
  };

  const relativeLuminance = (r, g, b) => {
    const srgb = [r, g, b]
      .map((v) => v / 255)
      .map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
    return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
  };
  const bestTextColor = (r, g, b) => (relativeLuminance(r, g, b) > 0.54 ? "#000" : "#fff");

  // sRGB <-> Lab
  function srgbToLab(r, g, b) {
    const srgb = [r, g, b]
      .map((v) => v / 255)
      .map((c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));

    const X = srgb[0] * 0.4124564 + srgb[1] * 0.3575761 + srgb[2] * 0.1804375;
    const Y = srgb[0] * 0.2126729 + srgb[1] * 0.7151522 + srgb[2] * 0.0721750;
    const Z = srgb[0] * 0.0193339 + srgb[1] * 0.1191920 + srgb[2] * 0.9503041;

    const xr = X / 0.95047, yr = Y / 1.0, zr = Z / 1.08883;
    const f = (t) => (t > 0.008856 ? Math.cbrt(t) : (7.787 * t + 16 / 116));
    const fx = f(xr), fy = f(yr), fz = f(zr);
    const L = (116 * fy - 16), a = 500 * (fx - fy), b2 = 200 * (fy - fz);
    return [L, a, b2];
  }

  function labToSrgb(L, a, b) {
    const fy = (L + 16) / 116, fx = fy + (a / 500), fz = fy - (b / 200);
    const invf = (t) => {
      const t3 = t * t * t;
      return t3 > 0.008856 ? t3 : (t - 16 / 116) / 7.787;
    };
    const xr = invf(fx), yr = invf(fy), zr = invf(fz);
    const X = xr * 0.95047, Y = yr * 1.0, Z = zr * 1.08883;

    let rl = 3.2404542 * X + (-1.5371385) * Y + (-0.4985314) * Z;
    let gl = -0.9692660 * X + 1.8760108 * Y + 0.0415560 * Z;
    let bl = 0.0556434 * X + (-0.2040259) * Y + 1.0572252 * Z;

    const comp = (c) =>
      c <= 0 ? 0 : c >= 1 ? 1 : (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);

    const r = Math.round(comp(rl) * 255);
    const g = Math.round(comp(gl) * 255);
    const b2 = Math.round(comp(bl) * 255);
    return [clamp(r, 0, 255), clamp(g, 0, 255), clamp(b2, 0, 255)];
  }

  // K-means in Lab
  function kmeansLab(pointsLab, k, maxIter = 20) {
    const centroids = [];
    const rand = () => pointsLab[Math.floor(Math.random() * pointsLab.length)];
    centroids.push(rand());

    while (centroids.length < k) {
      const d2 = pointsLab.map((p) => {
        let minD = Infinity;
        for (const c of centroids) {
          const dx = p[0] - c[0], dy = p[1] - c[1], dz = p[2] - c[2];
          const ds = dx * dx + dy * dy + dz * dz;
          if (ds < minD) minD = ds;
        }
        return minD;
      });

      const sum = d2.reduce((a, b) => a + b, 0);
      let r = Math.random() * sum, idx = 0;
      for (let i = 0; i < d2.length; i++) { r -= d2[i]; if (r <= 0) { idx = i; break; } }
      centroids.push(pointsLab[idx]);
    }

    let assignments = new Array(pointsLab.length).fill(0);

    for (let iter = 0; iter < maxIter; iter++) {
      let moved = 0;

      for (let i = 0; i < pointsLab.length; i++) {
        const p = pointsLab[i];
        let best = 0, bestD = Infinity;
        for (let c = 0; c < k; c++) {
          const cc = centroids[c];
          const dx = p[0] - cc[0], dy = p[1] - cc[1], dz = p[2] - cc[2];
          const ds = dx * dx + dy * dy + dz * dz;
          if (ds < bestD) { bestD = ds; best = c; }
        }
        if (assignments[i] !== best) { assignments[i] = best; moved++; }
      }

      const sums = Array.from({ length: k }, () => [0, 0, 0, 0]);
      for (let i = 0; i < pointsLab.length; i++) {
        const g = assignments[i], p = pointsLab[i];
        sums[g][0] += p[0]; sums[g][1] += p[1]; sums[g][2] += p[2]; sums[g][3]++;
      }

      let drift = 0;
      for (let c = 0; c < k; c++) {
        if (sums[c][3] === 0) { centroids[c] = rand(); continue; }
        const nc = [sums[c][0] / sums[c][3], sums[c][1] / sums[c][3], sums[c][2] / sums[c][3]];
        const dx = centroids[c][0] - nc[0], dy = centroids[c][1] - nc[1], dz = centroids[c][2] - nc[2];
        drift += Math.sqrt(dx * dx + dy * dy + dz * dz);
        centroids[c] = nc;
      }

      if (drift < 0.1 || moved === 0) break;
    }

    return { centroids, assignments };
  }

  function pixelsFromImageData(imgData, sampleStep = 4, includeExtremes = false) {
    const outLab = [];
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4 * sampleStep) {
      const a = data[i + 3];
      if (a < 127) continue;

      const r = data[i], g = data[i + 1], b = data[i + 2];

      if (!includeExtremes) {
        const lum = relativeLuminance(r, g, b);
        if (lum > 0.97 || lum < 0.06) continue;
      }

      outLab.push(srgbToLab(r, g, b));
    }

    return outLab;
  }

  function download(filename, content, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        ta.style.top = "0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        const ok = document.execCommand("copy");
        ta.remove();
        return !!ok;
      } catch {
        return false;
      }
    }
  }

  window.SiteApps.register("palette", (container) => {
    ensureStyle();

    container.innerHTML = "";
    container.setAttribute("data-app", "palette");

    // Build DOM (single instance, scoped)
    container.innerHTML = `
<div class="pe-app">
  <div class="pe-uploader" aria-label="Image uploader" role="button" tabindex="0">
    <input class="pe-file" type="file" accept="image/*" aria-label="Choose a photo">
    <div class="pe-drop-help">
      <strong>Drop a photo here</strong> or <span class="pe-cta">click to upload</span>
      <div class="pe-sub">JPEG, PNG, WebP • processed on-device</div>
    </div>
  </div>

  <div class="pe-controls" role="group" aria-label="Palette controls">
    <label class="pe-row">
      <span><strong>Number of colours:</strong></span>
      <input class="pe-count" type="range" min="3" max="16" value="8" step="1" />
      <output class="pe-count-label">8</output>
    </label>

    <label class="pe-row pe-checkbox">
      <input class="pe-include-extremes" type="checkbox" />
      <span><strong>Include near-white & near-black</strong></span>
    </label>

    <button class="pe-btn pe-extract" disabled>Extract palette</button>
  </div>

  <div class="pe-stage">
    <div class="pe-preview"><img class="pe-img" alt="Uploaded preview" /></div>
    <div class="pe-palette" aria-live="polite"></div>
  </div>

  <div class="pe-actions">
    <button class="pe-btn pe-copy-hex" disabled>Copy HEX list</button>
    <button class="pe-btn pe-copy-css" disabled>Copy CSS variables</button>
    <button class="pe-btn pe-copy-tsv" disabled>Copy table (TSV)</button>
    <button class="pe-btn pe-dl-png" disabled>Download PNG</button>
    <button class="pe-btn pe-dl-svg" disabled>Download SVG</button>
    <button class="pe-btn pe-dl-json" disabled>Download JSON</button>
    <button class="pe-btn pe-dl-csv" disabled>Download CSV</button>
    <button class="pe-btn pe-dl-css" disabled>Download CSS</button>
    <button class="pe-btn pe-dl-gpl" disabled>Download .gpl</button>
  </div>

  <div class="pe-listwrap">
    <h3 class="pe-h3">Full palette listing</h3>
    <div class="pe-list" aria-live="polite"></div>
  </div>

  <canvas class="pe-canvas" width="0" height="0" style="display:none;"></canvas>
  <canvas class="pe-dl-canvas" width="0" height="0" style="display:none;"></canvas>
  <div class="pe-toast" role="status" aria-live="polite"></div>
</div>
`;

    const $ = (sel) => container.querySelector(sel);

    const dropzone = $(".pe-uploader");
    const fileInput = $(".pe-file");
    const imgEl = $(".pe-img");
    const canvas = $(".pe-canvas");
    const dlCanvas = $(".pe-dl-canvas");

    const paletteEl = $(".pe-palette");
    const listWrap = $(".pe-list");

    const countRange = $(".pe-count");
    const countLabel = $(".pe-count-label");
    const includeExt = $(".pe-include-extremes");
    const extractBtn = $(".pe-extract");

    const copyHexBtn = $(".pe-copy-hex");
    const copyCssBtn = $(".pe-copy-css");
    const copyTsvBtn = $(".pe-copy-tsv");
    const dlPngBtn = $(".pe-dl-png");
    const dlSvgBtn = $(".pe-dl-svg");
    const dlJsonBtn = $(".pe-dl-json");
    const dlCsvBtn = $(".pe-dl-csv");
    const dlCssBtn = $(".pe-dl-css");
    const dlGplBtn = $(".pe-dl-gpl");

    const toastEl = $(".pe-toast");
    function toast(msg) {
      toastEl.textContent = msg;
      toastEl.classList.add("show");
      clearTimeout(toast._t);
      toast._t = setTimeout(() => toastEl.classList.remove("show"), 1400);
    }

    function enableActions(enabled) {
      [
        extractBtn,
        copyHexBtn, copyCssBtn, copyTsvBtn,
        dlPngBtn, dlSvgBtn, dlJsonBtn, dlCsvBtn, dlCssBtn, dlGplBtn
      ].forEach((b) => (b.disabled = !enabled));
    }

    countRange.addEventListener("input", () => {
      countLabel.textContent = String(countRange.value);
    });

    async function loadFile(file) {
      if (!file) return;
let lastObjectUrl = null;

if (lastObjectUrl) URL.revokeObjectURL(lastObjectUrl);
lastObjectUrl = URL.createObjectURL(file);
imgEl.src = lastObjectUrl;
      
      const url = URL.createObjectURL(file);
      imgEl.style.display = "none";
      imgEl.src = url;

      await new Promise((res, rej) => {
        imgEl.onload = res;
        imgEl.onerror = rej;
      });

      const maxSide = 900;
      const w = imgEl.naturalWidth || 1;
      const h = imgEl.naturalHeight || 1;
      const scale = Math.min(1, maxSide / Math.max(w, h));

      canvas.width = Math.max(1, Math.floor(w * scale));
      canvas.height = Math.max(1, Math.floor(h * scale));

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(imgEl, 0, 0, canvas.width, canvas.height);

      imgEl.style.display = "block";
      enableActions(true);
      toast("Image ready");
    }

    // Drag & drop
    ["dragenter", "dragover"].forEach((evt) => {
      dropzone.addEventListener(evt, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add("pe-drag");
      });
    });
    ["dragleave", "drop"].forEach((evt) => {
      dropzone.addEventListener(evt, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove("pe-drag");
      });
    });
    dropzone.addEventListener("drop", (e) => {
      const file = e.dataTransfer?.files?.[0];
      if (file) loadFile(file);
    });
//    dropzone.addEventListener("click", () => fileInput.click());
function openPicker() {
  // iOS: ensure selecting the same file twice still triggers "change"
  fileInput.value = "";
  fileInput.click();
}

dropzone.addEventListener("click", openPicker);

// keyboard support (nice on desktop)
dropzone.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    openPicker();
  }
});
    
    fileInput.addEventListener("change", () => loadFile(fileInput.files?.[0]));

    // Palette state
    let lastPalette = []; // [{hex, rgb:[r,g,b], hsl:[h,s,l], name:"--color-01"}]

    function renderListTable(palette) {
      const rows = palette
        .map((c, i) => {
          const rgb = `rgb(${c.rgb[0]}, ${c.rgb[1]}, ${c.rgb[2]})`;
          const hsl = `hsl(${c.hsl[0]} ${c.hsl[1]}% ${c.hsl[2]}%)`;
          return `<tr>
<td>${String(i + 1).padStart(2, "0")}</td>
<td><span class="pe-sample" style="background:${c.hex}"></span></td>
<td>${c.hex}</td>
<td>${rgb}</td>
<td>${hsl}</td>
<td>${c.name}</td>
</tr>`;
        })
        .join("");
      listWrap.innerHTML = `<div class="pe-list">
<table>
<thead><tr><th>#</th><th>Sample</th><th>HEX</th><th>RGB</th><th>HSL</th><th>CSS Var</th></tr></thead>
<tbody>${rows}</tbody>
</table>
</div>`;
    }

    function makeSwatchEl({ hex, rgb, hsl }) {
      const [r, g, b] = rgb;
      const [h, s, l] = hsl;
      const text = bestTextColor(r, g, b);

      const el = document.createElement("div");
      el.className = "pe-swatch";

      const chip = document.createElement("div");
      chip.className = "pe-chip";
      chip.style.background = hex;
      chip.style.color = text;
      chip.title = hex;

      const info = document.createElement("div");
      info.className = "pe-info";

      const line = (label, value) => {
        const row = document.createElement("div");
        row.className = "pe-line";

        const tag = document.createElement("div");
        tag.className = "pe-tag";
        tag.textContent = value;

        const btn = document.createElement("button");
        btn.className = "pe-copy";
        btn.type = "button";
        btn.setAttribute("aria-label", `Copy ${label}`);
        btn.textContent = "Copy";
        btn.addEventListener("click", async () => {
          const ok = await copyText(value);
          toast(ok ? `Copied ${label}` : "Copy failed");
        });

        row.append(tag, btn);
        return row;
      };

      info.append(line("HEX", hex));
      info.append(line("RGB", `rgb(${r}, ${g}, ${b})`));
      info.append(line("HSL", `hsl(${h} ${s}% ${l}%)`));

      el.append(chip, info);
      return el;
    }

    async function extract() {
      if (canvas.width === 0 || canvas.height === 0) return;

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      const lab = pixelsFromImageData(imgData, 4, includeExt.checked);
      if (lab.length < 8) {
        toast("Not enough pixels to sample");
        return;
      }

      const k = parseInt(countRange.value, 10);
      const { centroids } = kmeansLab(lab, k, 20);

      const colours = centroids.map((c) => {
        const [r, g, b] = labToSrgb(c[0], c[1], c[2]);
        const [h, s, l] = rgbToHsl(r, g, b);
        return { r, g, b, h, s, l, hex: rgbToHex(r, g, b) };
      });

      // stable, useful ordering
      colours.sort((a, b) => (a.l - b.l) || (a.h - b.h));

      paletteEl.innerHTML = "";
      lastPalette = colours.map((c, i) => {
        const name = `--color-${String(i + 1).padStart(2, "0")}`;
        paletteEl.appendChild(makeSwatchEl({ hex: c.hex, rgb: [c.r, c.g, c.b], hsl: [c.h, c.s, c.l] }));
        return { hex: c.hex, rgb: [c.r, c.g, c.b], hsl: [c.h, c.s, c.l], name };
      });

      renderListTable(lastPalette);

      // Copy actions
      copyHexBtn.onclick = async () => {
        const text = lastPalette.map((c) => c.hex).join(", ");
        toast((await copyText(text)) ? "HEX list copied" : "Copy failed");
      };

      copyCssBtn.onclick = async () => {
        const css = lastPalette.map((c) => `  ${c.name}: ${c.hex};`).join("\n");
        const block = `:root{\n${css}\n}`;
        toast((await copyText(block)) ? "CSS variables copied" : "Copy failed");
      };

      copyTsvBtn.onclick = async () => {
        const header = ["index", "hex", "rgb", "hsl", "css_var"].join("\t");
        const lines = lastPalette.map((c, i) => {
          const rgb = `rgb(${c.rgb[0]}, ${c.rgb[1]}, ${c.rgb[2]})`;
          const hsl = `hsl(${c.hsl[0]} ${c.hsl[1]}% ${c.hsl[2]}%)`;
          return [i + 1, c.hex, rgb, hsl, c.name].join("\t");
        });
        const tsv = [header, ...lines].join("\n");
        toast((await copyText(tsv)) ? "Table copied (TSV)" : "Copy failed");
      };

      // Downloads
      dlJsonBtn.onclick = () => {
        const payload = lastPalette.map((c) => ({ hex: c.hex, rgb: c.rgb, hsl: c.hsl, var: c.name }));
        download("palette.json", JSON.stringify(payload, null, 2), "application/json");
        toast("Downloaded JSON");
      };

      dlCsvBtn.onclick = () => {
        const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
        const header = ["index", "hex", "r", "g", "b", "h", "s", "l", "css_var"];
        const rows = lastPalette.map((c, i) => [i + 1, c.hex, c.rgb[0], c.rgb[1], c.rgb[2], c.hsl[0], c.hsl[1], c.hsl[2], c.name]);
        const csv = [header, ...rows].map((r) => r.map(esc).join(",")).join("\n");
        download("palette.csv", csv, "text/csv");
        toast("Downloaded CSV");
      };

      dlCssBtn.onclick = () => {
        const css = lastPalette.map((c) => `  ${c.name}: ${c.hex};`).join("\n");
        download("palette.css", `:root{\n${css}\n}\n`, "text/css");
        toast("Downloaded CSS");
      };

      dlPngBtn.onclick = () => {
        const hexes = lastPalette.map((c) => c.hex);
        const swatchW = 120, height = 160, width = hexes.length * swatchW;

        dlCanvas.width = width;
        dlCanvas.height = height;

        const c = dlCanvas.getContext("2d");
        c.fillStyle = "#fff";
        c.fillRect(0, 0, width, height);
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.font = "16px system-ui";

        hexes.forEach((hex, i) => {
          const x = i * swatchW;
          c.fillStyle = hex;
          c.fillRect(x, 0, swatchW, height - 40);
          c.fillStyle = "#000";
          c.fillRect(x, height - 40, swatchW, 40);
          c.fillStyle = "#fff";
          c.fillText(hex, x + swatchW / 2, height - 20);
        });

        const a = document.createElement("a");
        a.download = "palette.png";
        a.href = dlCanvas.toDataURL("image/png");
        a.click();
        toast("Downloaded PNG");
      };

      dlSvgBtn.onclick = () => {
        const sw = 160, h = 200, w = lastPalette.length * sw;
        const blocks = lastPalette.map((c, i) => {
          const x = i * sw;
          return `
<g>
  <rect x="${x}" y="0" width="${sw}" height="${h - 48}" fill="${c.hex}"/>
  <rect x="${x}" y="${h - 48}" width="${sw}" height="48" fill="#000"/>
  <text x="${x + sw / 2}" y="${h - 22}" text-anchor="middle"
    font-family="system-ui,-apple-system,Segoe UI,Roboto" font-size="16" fill="#fff">${c.hex}</text>
</g>`;
        }).join("");

        const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="100%" height="100%" fill="#fff"/>
  ${blocks}
</svg>`;
        download("palette.svg", svg, "image/svg+xml");
        toast("Downloaded SVG");
      };

      dlGplBtn.onclick = () => {
        const head = `GIMP Palette
Name: Extracted Palette
Columns: ${lastPalette.length}
#`;
        const lines = lastPalette.map((c) => {
          const [r, g, b] = c.rgb;
          return `${String(r).padStart(3, " ")} ${String(g).padStart(3, " ")} ${String(b).padStart(3, " ")}\t${c.hex}`;
        });
        download("palette.gpl", [head, ...lines].join("\n"), "text/plain");
        toast("Downloaded .gpl");
      };

      toast(`Found ${lastPalette.length} colours`);
    }

    extractBtn.addEventListener("click", extract);

    // Disable until image loaded
    enableActions(false);

    toast("Ready");
  });
})();
