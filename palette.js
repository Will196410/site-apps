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

  const STYLE_ID = "siteapps-palette-style-v2";
  const BUILD_STAMP = "05 May 2026 06:00 BST · GPT-5.5 Thinking";

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
[data-app="palette"]{
  --gap:16px; --radius:14px;
  --ink:#111; --paper:#fff; --muted:rgba(0,0,0,.68); --line:rgba(0,0,0,.15);
  font-family:system-ui,-apple-system,Segoe UI,Roboto,Inter,Arial,sans-serif;
  max-width:1180px; margin:14px auto;
  border:2px solid var(--ink); border-radius:16px;
  padding:18px; background:var(--paper); color:var(--ink);
}
[data-app="palette"] *{ box-sizing:border-box; }
[data-app="palette"] .pe-title{ margin:0 0 6px; font-size:1.35rem; line-height:1.15; }
[data-app="palette"] .pe-intro{ margin:0 0 14px; color:var(--muted); max-width:78ch; }
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
  position:absolute; opacity:0; width:1px; height:1px; pointer-events:none;
}
[data-app="palette"] .pe-drop-help strong{ display:block; font-size:1.05rem; margin-bottom:4px; }
[data-app="palette"] .pe-cta{ text-decoration:underline; font-weight:800; }
[data-app="palette"] .pe-sub{ opacity:.75; font-size:.92rem; }

[data-app="palette"] .pe-panel{
  border:1px solid var(--line);
  border-radius:var(--radius);
  background:#fafafa;
  padding:14px;
}
[data-app="palette"] .pe-panel-title{ margin:0 0 10px; font-size:1.05rem; font-weight:950; }
[data-app="palette"] .pe-controls{
  display:grid; grid-template-columns:1fr;
  gap:10px; margin:14px 0 6px;
}
[data-app="palette"] .pe-row{
  display:grid; grid-template-columns:auto 1fr auto;
  align-items:center; gap:10px;
}
[data-app="palette"] .pe-row-2{
  display:grid; grid-template-columns:1fr 1fr;
  gap:10px;
}
[data-app="palette"] .pe-checkbox{ grid-template-columns:auto 1fr; }
[data-app="palette"] input[type="range"]{ width:100%; }
[data-app="palette"] input[type="color"]{
  width:64px; height:42px; padding:2px;
  border:2px solid #111; border-radius:10px; background:#fff;
}
[data-app="palette"] input[type="text"],
[data-app="palette"] select{
  width:100%; min-height:42px;
  border:2px solid #111; border-radius:10px;
  padding:8px 10px; background:#fff; color:#111;
  font:inherit; font-weight:750;
}
[data-app="palette"] output{ font-weight:900; min-width:2.5ch; text-align:right; }
[data-app="palette"] .pe-small{ font-size:.9rem; color:var(--muted); line-height:1.35; }

[data-app="palette"] .pe-btn{
  appearance:none;
  border:2px solid #111;
  border-radius:12px;
  padding:10px 14px;
  background:#fff;
  cursor:pointer;
  transition:.12s transform,.12s box-shadow,.12s background;
  font-weight:900;
}
[data-app="palette"] .pe-btn:hover{ transform:translateY(-1px); box-shadow:0 6px 14px rgba(0,0,0,.10); }
[data-app="palette"] .pe-btn:disabled{ opacity:.5; cursor:not-allowed; transform:none; box-shadow:none; }
[data-app="palette"] .pe-btn.pe-primary{ background:#111; color:#fff; }

[data-app="palette"] .pe-stage{
  display:grid; grid-template-columns:1fr;
  gap:var(--gap);
  margin-top:var(--gap);
}
[data-app="palette"] .pe-preview{ justify-self:center; max-width:100%; }
[data-app="palette"] .pe-preview img{ max-width:100%; height:auto; border-radius:var(--radius); display:none; border:1px solid rgba(0,0,0,.15); }
[data-app="palette"] .pe-palette,
[data-app="palette"] .pe-harmony-palette{
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
[data-app="palette"] .pe-chip{ height:96px; display:flex; align-items:end; padding:8px; font-weight:950; }
[data-app="palette"] .pe-chip span{ background:rgba(255,255,255,.82); color:#000; padding:3px 7px; border-radius:999px; font-size:.78rem; }
[data-app="palette"] .pe-info{ padding:10px; display:grid; gap:6px; }
[data-app="palette"] .pe-line{ display:flex; align-items:center; justify-content:space-between; gap:10px; }
[data-app="palette"] .pe-tag{ font-weight:900; font-size:.92rem; overflow-wrap:anywhere; }
[data-app="palette"] .pe-copy{
  border:2px solid #111;
  background:#fff;
  cursor:pointer;
  padding:6px 8px;
  border-radius:10px;
  font-weight:900;
  flex:0 0 auto;
}
[data-app="palette"] .pe-copy:hover{ background:rgba(0,0,0,.06); }

[data-app="palette"] .pe-actions{ display:flex; gap:10px; margin-top:10px; flex-wrap:wrap; }
[data-app="palette"] .pe-wheel-layout{ display:grid; grid-template-columns:1fr; gap:16px; align-items:start; }
[data-app="palette"] .pe-wheel-wrap{ display:grid; place-items:center; gap:10px; }
[data-app="palette"] .pe-wheel-box{
  position:relative;
  width:min(320px, 88vw);
  aspect-ratio:1;
}
[data-app="palette"] .pe-wheel-canvas{
  width:100%; height:100%; display:block;
  border-radius:50%; border:2px solid #111;
  cursor:crosshair; background:#fff;
}
[data-app="palette"] .pe-wheel-marker{
  position:absolute;
  width:18px; height:18px;
  border:3px solid #000;
  border-radius:999px;
  box-shadow:0 0 0 3px #fff, 0 2px 8px rgba(0,0,0,.35);
  transform:translate(-50%,-50%);
  pointer-events:none;
}
[data-app="palette"] .pe-wheel-marker.pe-related{
  width:13px; height:13px; border-width:2px;
  box-shadow:0 0 0 2px #fff, 0 2px 8px rgba(0,0,0,.35);
  opacity:.9;
}
[data-app="palette"] .pe-wheel-form{ display:grid; gap:10px; }
[data-app="palette"] .pe-base-row{ display:grid; grid-template-columns:auto 1fr; gap:10px; align-items:center; }
[data-app="palette"] .pe-quick-picks{ display:flex; flex-wrap:wrap; gap:8px; }
[data-app="palette"] .pe-quick-pick{
  width:34px; height:34px; border-radius:999px;
  border:2px solid #111; cursor:pointer; background:#ddd;
}
[data-app="palette"] .pe-method-note{ margin-top:6px; padding:10px; border-radius:12px; background:#fff; border:1px solid rgba(0,0,0,.12); }
[data-app="palette"] .pe-angle-list{ display:flex; gap:8px; flex-wrap:wrap; margin-top:8px; }
[data-app="palette"] .pe-angle-pill{ border:1px solid rgba(0,0,0,.2); border-radius:999px; padding:4px 8px; background:#fff; font-size:.86rem; font-weight:850; }
[data-app="palette"] .pe-harmony-actions{ display:flex; flex-wrap:wrap; gap:8px; margin-top:10px; }
[data-app="palette"] .pe-listwrap{ margin-top:18px; }
[data-app="palette"] .pe-h3{ margin:0 0 8px; font-size:1.05rem; font-weight:900; }
[data-app="palette"] .pe-list table{ width:100%; border-collapse:collapse; font-size:.95rem; }
[data-app="palette"] .pe-list th, [data-app="palette"] .pe-list td{
  border-bottom:1px solid rgba(0,0,0,.10);
  padding:8px 6px;
  text-align:left;
  vertical-align:top;
}
[data-app="palette"] .pe-sample{
  width:36px; height:24px;
  border-radius:8px;
  border:1px solid rgba(0,0,0,.12);
  display:inline-block;
}
[data-app="palette"] .pe-grid-2{ display:grid; grid-template-columns:1fr; gap:16px; margin-top:16px; }
[data-app="palette"] .pe-toast{
  position:fixed;
  left:50%; transform:translateX(-50%);
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
[data-app="palette"] .pe-meta{ margin-top:18px; padding-top:12px; border-top:1px solid rgba(0,0,0,.12); color:var(--muted); font-size:.86rem; }
[data-app="palette"] textarea:focus,
[data-app="palette"] button:focus,
[data-app="palette"] input:focus,
[data-app="palette"] select:focus{
  outline:3px solid rgba(11,95,255,.35);
  outline-offset:2px;
}

@media (min-width: 820px){
  [data-app="palette"] .pe-wheel-layout{ grid-template-columns:minmax(280px, 360px) 1fr; }
  [data-app="palette"] .pe-grid-2{ grid-template-columns:1fr 1fr; }
}
@media (min-width: 900px){
  [data-app="palette"] .pe-stage{ grid-template-columns:1fr 1.6fr; align-items:start; }
  [data-app="palette"] .pe-preview{ position:sticky; top:10px; }
}
@media (max-width: 620px){
  [data-app="palette"]{ padding:12px; }
  [data-app="palette"] .pe-row{ grid-template-columns:1fr; align-items:start; }
  [data-app="palette"] .pe-row-2{ grid-template-columns:1fr; }
}
`;
    document.head.appendChild(style);
  }

  // --- Utilities ---
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const mod = (n, m) => ((n % m) + m) % m;
  const toHex = (n) => n.toString(16).padStart(2, "0");
  const rgbToHex = (r, g, b) => `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();

  function hexToRgb(hex) {
    let s = String(hex || "").trim().replace(/^#/, "");
    if (s.length === 3) s = s.split("").map((c) => c + c).join("");
    if (!/^[0-9a-fA-F]{6}$/.test(s)) return null;
    return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
  }

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
    return [Math.round(h * 360) % 360, Math.round(s * 100), Math.round(l * 100)];
  };

  function hslToRgb(h, s, l) {
    h = mod(h, 360) / 360;
    s = clamp(s, 0, 100) / 100;
    l = clamp(l, 0, 100) / 100;
    if (s === 0) {
      const v = Math.round(l * 255);
      return [v, v, v];
    }
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const r = hue2rgb(p, q, h + 1 / 3);
    const g = hue2rgb(p, q, h);
    const b = hue2rgb(p, q, h - 1 / 3);
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  function hslToHex(h, s, l) {
    const [r, g, b] = hslToRgb(h, s, l);
    return rgbToHex(r, g, b);
  }

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

    const rl = 3.2404542 * X + (-1.5371385) * Y + (-0.4985314) * Z;
    const gl = -0.9692660 * X + 1.8760108 * Y + 0.0415560 * Z;
    const bl = 0.0556434 * X + (-0.2040259) * Y + 1.0572252 * Z;

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

  const HARMONY_METHODS = {
    complementary: {
      label: "Complementary",
      note: "One colour opposite the base hue. Useful for strong subject/background separation or a simple colour-grade tension.",
      offsets: [0, 180]
    },
    split: {
      label: "Split complementary",
      note: "The base colour plus two colours either side of the direct complement. Often easier to use than a hard complement.",
      offsets: [0, 150, 210]
    },
    triadic: {
      label: "Triadic",
      note: "Three hues evenly spaced around the wheel. Energetic, graphic, and easy to overdo in natural photos.",
      offsets: [0, 120, 240]
    },
    tetradic: {
      label: "Tetradic / rectangle",
      note: "Two complementary pairs. Useful for exploring a richer grade, but usually one colour should dominate.",
      offsets: [0, 60, 180, 240]
    },
    analogous: {
      label: "Analogous",
      note: "Nearby hues. Better for gentle, cohesive palettes where you do not want a dramatic opposite colour.",
      offsets: [-30, 0, 30]
    },
    monochrome: {
      label: "Monochrome tonal set",
      note: "Same hue, varied lightness and saturation. Good for checking whether a grade is relying on tone rather than hue contrast.",
      offsets: [0, 0, 0, 0]
    },
    square: {
      label: "Square",
      note: "Four colours spaced 90° apart. Strong and decorative; for photography, treat this as a scouting tool rather than a rule.",
      offsets: [0, 90, 180, 270]
    }
  };

  function buildHarmony(baseHsl, methodKey, satAdjust = 0, lightAdjust = 0) {
    const method = HARMONY_METHODS[methodKey] || HARMONY_METHODS.complementary;
    const [baseH, baseS, baseL] = baseHsl;
    const s = clamp(baseS + satAdjust, 5, 100);
    const l = clamp(baseL + lightAdjust, 8, 92);

    return method.offsets.map((off, i) => {
      let h = mod(baseH + off, 360);
      let ss = s;
      let ll = l;
      let role = i === 0 ? "Base" : `${method.label} ${i}`;

      if (methodKey === "monochrome") {
        const variants = [
          { ss: clamp(s + 6, 5, 100), ll: clamp(l - 24, 8, 92), role: "Deep" },
          { ss: s, ll: clamp(l - 8, 8, 92), role: "Shadow" },
          { ss: clamp(s - 8, 5, 100), ll: clamp(l + 10, 8, 92), role: "Mid" },
          { ss: clamp(s - 18, 5, 100), ll: clamp(l + 28, 8, 92), role: "Highlight" }
        ];
        ss = variants[i].ss;
        ll = variants[i].ll;
        role = variants[i].role;
      } else if (i !== 0) {
        role = off === 180 ? "Complement" : `${off > 0 ? "+" : ""}${off}°`;
      }

      const rgb = hslToRgb(h, ss, ll);
      const hex = rgbToHex(rgb[0], rgb[1], rgb[2]);
      return { hex, rgb, hsl: [Math.round(h), Math.round(ss), Math.round(ll)], name: `--harmony-${String(i + 1).padStart(2, "0")}`, role, offset: off };
    });
  }

  window.SiteApps.register("palette", (container) => {
    ensureStyle();

    container.innerHTML = "";
    container.setAttribute("data-app", "palette");

    container.innerHTML = `
<div class="pe-app">
  <h2 class="pe-title">Photo palette extractor + colour wheel</h2>
  <p class="pe-intro">Extract colours from a photo, choose a base colour, then build complementary and related palettes for colour grading.</p>

  <div class="pe-uploader" aria-label="Image uploader" role="button" tabindex="0">
    <input class="pe-file" type="file" accept="image/*" aria-label="Choose a photo">
    <div class="pe-drop-help">
      <strong>Drop a photo here</strong> or <span class="pe-cta">click to upload</span>
      <div class="pe-sub">JPEG, PNG, WebP • processed on-device</div>
    </div>
  </div>

  <div class="pe-controls pe-panel" role="group" aria-label="Palette controls">
    <h3 class="pe-panel-title">Extract colours from photo</h3>
    <label class="pe-row">
      <span><strong>Number of colours:</strong></span>
      <input class="pe-count" type="range" min="3" max="16" value="8" step="1" />
      <output class="pe-count-label">8</output>
    </label>

    <label class="pe-row pe-checkbox">
      <input class="pe-include-extremes" type="checkbox" />
      <span><strong>Include near-white & near-black</strong></span>
    </label>

    <button class="pe-btn pe-primary pe-extract" disabled>Extract palette</button>
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

  <div class="pe-grid-2">
    <section class="pe-panel pe-wheel-panel" aria-label="Colour wheel and harmony controls">
      <h3 class="pe-panel-title">Colour wheel / grading palette</h3>
      <div class="pe-wheel-layout">
        <div class="pe-wheel-wrap">
          <div class="pe-wheel-box">
            <canvas class="pe-wheel-canvas" width="420" height="420" aria-label="Interactive colour wheel"></canvas>
            <div class="pe-wheel-marker pe-base-marker" aria-hidden="true"></div>
          </div>
          <div class="pe-small">Click or tap the wheel to choose the base hue. Use the sliders to adjust the grade.</div>
        </div>

        <div class="pe-wheel-form">
          <label class="pe-base-row">
            <input class="pe-base-color" type="color" value="#3366CC" aria-label="Base colour" />
            <input class="pe-base-hex" type="text" value="#3366CC" aria-label="Base HEX colour" />
          </label>

          <label class="pe-row">
            <span><strong>Harmony method:</strong></span>
            <select class="pe-method">
              <option value="complementary">Complementary</option>
              <option value="split">Split complementary</option>
              <option value="triadic">Triadic</option>
              <option value="tetradic">Tetradic / rectangle</option>
              <option value="analogous">Analogous</option>
              <option value="monochrome">Monochrome tonal set</option>
              <option value="square">Square</option>
            </select>
            <span></span>
          </label>

          <label class="pe-row">
            <span><strong>Saturation:</strong></span>
            <input class="pe-sat-adjust" type="range" min="-50" max="50" value="0" step="1" />
            <output class="pe-sat-label">0</output>
          </label>

          <label class="pe-row">
            <span><strong>Lightness:</strong></span>
            <input class="pe-light-adjust" type="range" min="-40" max="40" value="0" step="1" />
            <output class="pe-light-label">0</output>
          </label>

          <div class="pe-method-note"></div>
          <div class="pe-angle-list" aria-live="polite"></div>

          <div class="pe-harmony-actions">
            <button class="pe-btn pe-copy-harmony-hex">Copy harmony HEX</button>
            <button class="pe-btn pe-copy-harmony-css">Copy harmony CSS</button>
            <button class="pe-btn pe-copy-harmony-tsv">Copy harmony table</button>
          </div>
        </div>
      </div>
    </section>

    <section class="pe-panel" aria-label="Suggested colour grade notes">
      <h3 class="pe-panel-title">How to use this for photo grading</h3>
      <div class="pe-small">
        <strong>Practical rule:</strong> do not force every generated colour into the image. Pick one dominant colour, one support colour, and one accent. For example, cool shadows with warmer highlights is often more useful than making every hue equally strong.
        <br><br>
        <strong>Lightroom-style thinking:</strong> use hue as the direction, saturation as restraint, and lightness as mood. Complementary palettes are good for contrast; analogous palettes are good for atmosphere.
      </div>
      <div class="pe-quick-picks" aria-label="Quick base colour choices"></div>
    </section>
  </div>

  <div class="pe-listwrap">
    <h3 class="pe-h3">Generated harmony palette</h3>
    <div class="pe-harmony-palette" aria-live="polite"></div>
  </div>

  <div class="pe-listwrap">
    <h3 class="pe-h3">Full extracted palette listing</h3>
    <div class="pe-list pe-extracted-list" aria-live="polite"></div>
  </div>

  <div class="pe-listwrap">
    <h3 class="pe-h3">Full harmony listing</h3>
    <div class="pe-list pe-harmony-list" aria-live="polite"></div>
  </div>

  <canvas class="pe-canvas" width="0" height="0" style="display:none;"></canvas>
  <canvas class="pe-dl-canvas" width="0" height="0" style="display:none;"></canvas>
  <div class="pe-toast" role="status" aria-live="polite"></div>
  <div class="pe-meta">Build ${BUILD_STAMP}</div>
</div>
`;

    const $ = (sel) => container.querySelector(sel);

    const dropzone = $(".pe-uploader");
    const fileInput = $(".pe-file");
    const imgEl = $(".pe-img");
    const canvas = $(".pe-canvas");
    const dlCanvas = $(".pe-dl-canvas");

    const paletteEl = $(".pe-palette");
    const listWrap = $(".pe-extracted-list");

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

    const wheelCanvas = $(".pe-wheel-canvas");
    const wheelBox = $(".pe-wheel-box");
    const baseMarker = $(".pe-base-marker");
    const baseColorInput = $(".pe-base-color");
    const baseHexInput = $(".pe-base-hex");
    const methodSelect = $(".pe-method");
    const satAdjust = $(".pe-sat-adjust");
    const satLabel = $(".pe-sat-label");
    const lightAdjust = $(".pe-light-adjust");
    const lightLabel = $(".pe-light-label");
    const methodNote = $(".pe-method-note");
    const angleList = $(".pe-angle-list");
    const harmonyPaletteEl = $(".pe-harmony-palette");
    const harmonyListEl = $(".pe-harmony-list");
    const quickPicks = $(".pe-quick-picks");
    const copyHarmonyHex = $(".pe-copy-harmony-hex");
    const copyHarmonyCss = $(".pe-copy-harmony-css");
    const copyHarmonyTsv = $(".pe-copy-harmony-tsv");

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

    let lastObjectUrl = null;
    async function loadFile(file) {
      if (!file) return;
      if (lastObjectUrl) URL.revokeObjectURL(lastObjectUrl);
      lastObjectUrl = URL.createObjectURL(file);

      imgEl.style.display = "none";
      imgEl.src = lastObjectUrl;

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

    function openPicker() {
      fileInput.value = "";
      fileInput.click();
    }
    dropzone.addEventListener("click", openPicker);
    dropzone.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openPicker();
      }
    });
    fileInput.addEventListener("change", () => loadFile(fileInput.files?.[0]));

    let lastPalette = []; // extracted palette
    let lastHarmony = []; // generated wheel palette

    function paletteToTableRows(palette) {
      return palette.map((c, i) => {
        const rgb = `rgb(${c.rgb[0]}, ${c.rgb[1]}, ${c.rgb[2]})`;
        const hsl = `hsl(${c.hsl[0]} ${c.hsl[1]}% ${c.hsl[2]}%)`;
        const role = c.role ? `<td>${c.role}</td>` : "";
        return `<tr>
<td>${String(i + 1).padStart(2, "0")}</td>
<td><span class="pe-sample" style="background:${c.hex}"></span></td>
<td>${c.hex}</td>
<td>${rgb}</td>
<td>${hsl}</td>
<td>${c.name}</td>
${role}
</tr>`;
      }).join("");
    }

    function renderListTable(palette, targetEl, includeRole = false) {
      const roleHead = includeRole ? "<th>Role</th>" : "";
      targetEl.innerHTML = `<div class="pe-list">
<table>
<thead><tr><th>#</th><th>Sample</th><th>HEX</th><th>RGB</th><th>HSL</th><th>CSS Var</th>${roleHead}</tr></thead>
<tbody>${paletteToTableRows(palette)}</tbody>
</table>
</div>`;
    }

    function setBaseColour(hex, silent = false) {
      const rgb = hexToRgb(hex);
      if (!rgb) {
        if (!silent) toast("Invalid HEX colour");
        return;
      }
      const cleanHex = rgbToHex(rgb[0], rgb[1], rgb[2]);
      baseColorInput.value = cleanHex;
      baseHexInput.value = cleanHex;
      renderHarmony();
    }

    function makeSwatchEl({ hex, rgb, hsl, role }, opts = {}) {
      const [r, g, b] = rgb;
      const [h, s, l] = hsl;
      const text = bestTextColor(r, g, b);

      const el = document.createElement("div");
      el.className = "pe-swatch";

      const chip = document.createElement("div");
      chip.className = "pe-chip";
      chip.style.background = hex;
      chip.style.color = text;
      chip.title = `${hex} · hsl(${h} ${s}% ${l}%)`;
      chip.innerHTML = `<span>${role || hex}</span>`;
      chip.addEventListener("click", () => {
        setBaseColour(hex);
        toast("Base colour set from swatch");
      });

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
        btn.addEventListener("click", async (e) => {
          e.stopPropagation();
          const ok = await copyText(value);
          toast(ok ? `Copied ${label}` : "Copy failed");
        });

        row.append(tag, btn);
        return row;
      };

      if (role) info.append(line("role", role));
      info.append(line("HEX", hex));
      info.append(line("RGB", `rgb(${r}, ${g}, ${b})`));
      info.append(line("HSL", `hsl(${h} ${s}% ${l}%)`));

      if (opts.showSetBase !== false) {
        const btn = document.createElement("button");
        btn.className = "pe-copy";
        btn.type = "button";
        btn.textContent = "Use as base";
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          setBaseColour(hex);
          toast("Base colour set");
        });
        info.append(btn);
      }

      el.append(chip, info);
      return el;
    }

    function drawWheel() {
      const ctx = wheelCanvas.getContext("2d", { willReadFrequently: true });
      const w = wheelCanvas.width;
      const h = wheelCanvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(w, h) / 2 - 4;
      const img = ctx.createImageData(w, h);

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const dx = x - cx;
          const dy = y - cy;
          const d = Math.sqrt(dx * dx + dy * dy);
          const idx = (y * w + x) * 4;
          if (d <= radius) {
            let angle = Math.atan2(dy, dx) * 180 / Math.PI;
            angle = mod(angle + 360, 360);
            const sat = clamp((d / radius) * 100, 0, 100);
            const [r, g, b] = hslToRgb(angle, sat, 50);
            img.data[idx] = r;
            img.data[idx + 1] = g;
            img.data[idx + 2] = b;
            img.data[idx + 3] = 255;
          } else {
            img.data[idx] = 255;
            img.data[idx + 1] = 255;
            img.data[idx + 2] = 255;
            img.data[idx + 3] = 0;
          }
        }
      }
      ctx.putImageData(img, 0, 0);
    }

    function markerPositionForHsl(h, s) {
      const rect = wheelCanvas.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const radius = rect.width / 2 - 4;
      const a = mod(h, 360) * Math.PI / 180;
      const d = (clamp(s, 0, 100) / 100) * radius;
      return { x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d };
    }

    function placeBaseMarker() {
      const rgb = hexToRgb(baseHexInput.value) || [51, 102, 204];
      const [h, s] = rgbToHsl(rgb[0], rgb[1], rgb[2]);
      const p = markerPositionForHsl(h, s);
      baseMarker.style.left = `${p.x}px`;
      baseMarker.style.top = `${p.y}px`;
      const method = HARMONY_METHODS[methodSelect.value] || HARMONY_METHODS.complementary;

      wheelBox.querySelectorAll(".pe-related").forEach((m) => m.remove());
      method.offsets.slice(1).forEach((off) => {
        const pp = markerPositionForHsl(h + off, s);
        const m = document.createElement("div");
        m.className = "pe-wheel-marker pe-related";
        m.style.left = `${pp.x}px`;
        m.style.top = `${pp.y}px`;
        wheelBox.appendChild(m);
      });
    }

    function wheelEventToColour(e) {
      const rect = wheelCanvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const dx = x - cx;
      const dy = y - cy;
      const d = Math.sqrt(dx * dx + dy * dy);
      const radius = rect.width / 2 - 4;
      if (d > radius) return null;
      const angle = mod(Math.atan2(dy, dx) * 180 / Math.PI + 360, 360);
      const sat = clamp((d / radius) * 100, 0, 100);
      const current = hexToRgb(baseHexInput.value) || [51, 102, 204];
      const currentHsl = rgbToHsl(current[0], current[1], current[2]);
      return hslToHex(angle, sat, currentHsl[2]);
    }

    function renderHarmony() {
      const rgb = hexToRgb(baseHexInput.value) || [51, 102, 204];
      const baseHsl = rgbToHsl(rgb[0], rgb[1], rgb[2]);
      const methodKey = methodSelect.value;
      const method = HARMONY_METHODS[methodKey] || HARMONY_METHODS.complementary;
      const satDelta = parseInt(satAdjust.value, 10) || 0;
      const lightDelta = parseInt(lightAdjust.value, 10) || 0;

      satLabel.textContent = String(satDelta);
      lightLabel.textContent = String(lightDelta);

      lastHarmony = buildHarmony(baseHsl, methodKey, satDelta, lightDelta);
      harmonyPaletteEl.innerHTML = "";
      lastHarmony.forEach((c) => harmonyPaletteEl.appendChild(makeSwatchEl(c, { showSetBase: true })));
      renderListTable(lastHarmony, harmonyListEl, true);

      methodNote.textContent = method.note;
      angleList.innerHTML = method.offsets.map((o, i) => {
        const angle = mod(baseHsl[0] + o, 360);
        const label = methodKey === "monochrome" ? lastHarmony[i].role : `${lastHarmony[i].role}: ${Math.round(angle)}°`;
        return `<span class="pe-angle-pill">${label}</span>`;
      }).join("");

      placeBaseMarker();
    }

    wheelCanvas.addEventListener("click", (e) => {
      const hex = wheelEventToColour(e);
      if (!hex) return;
      setBaseColour(hex);
      toast("Base colour picked");
    });

    baseColorInput.addEventListener("input", () => setBaseColour(baseColorInput.value, true));
    baseHexInput.addEventListener("change", () => setBaseColour(baseHexInput.value));
    baseHexInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") setBaseColour(baseHexInput.value);
    });
    [methodSelect, satAdjust, lightAdjust].forEach((el) => el.addEventListener("input", renderHarmony));

    function harmonyHexText() {
      return lastHarmony.map((c) => c.hex).join(", ");
    }
    function harmonyCssText() {
      const css = lastHarmony.map((c) => `  ${c.name}: ${c.hex}; /* ${c.role} */`).join("\n");
      return `:root{\n${css}\n}`;
    }
    function harmonyTsvText() {
      const header = ["index", "role", "hex", "rgb", "hsl", "css_var"].join("\t");
      const lines = lastHarmony.map((c, i) => {
        const rgb = `rgb(${c.rgb[0]}, ${c.rgb[1]}, ${c.rgb[2]})`;
        const hsl = `hsl(${c.hsl[0]} ${c.hsl[1]}% ${c.hsl[2]}%)`;
        return [i + 1, c.role, c.hex, rgb, hsl, c.name].join("\t");
      });
      return [header, ...lines].join("\n");
    }

    copyHarmonyHex.addEventListener("click", async () => {
      toast((await copyText(harmonyHexText())) ? "Harmony HEX copied" : "Copy failed");
    });
    copyHarmonyCss.addEventListener("click", async () => {
      toast((await copyText(harmonyCssText())) ? "Harmony CSS copied" : "Copy failed");
    });
    copyHarmonyTsv.addEventListener("click", async () => {
      toast((await copyText(harmonyTsvText())) ? "Harmony table copied" : "Copy failed");
    });

    function renderQuickPicks() {
      const picks = [
        "#1E3A5F", "#2F6F4E", "#6B5B95", "#A64B2A", "#D98C00",
        "#3B6EA8", "#7B2D26", "#B07D62", "#708238", "#4A4A4A"
      ];
      quickPicks.innerHTML = "";
      picks.forEach((hex) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "pe-quick-pick";
        b.style.background = hex;
        b.title = `Use ${hex} as base`;
        b.addEventListener("click", () => setBaseColour(hex));
        quickPicks.appendChild(b);
      });
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
        const item = { hex: c.hex, rgb: [c.r, c.g, c.b], hsl: [c.h, c.s, c.l], name };
        paletteEl.appendChild(makeSwatchEl(item, { showSetBase: true }));
        return item;
      });

      renderListTable(lastPalette, listWrap, false);
      renderExtractedQuickPicks();

      // Auto-seed the wheel from a middle extracted colour, avoiding the darkest swatch.
      if (lastPalette.length) {
        const mid = lastPalette[Math.min(lastPalette.length - 1, Math.max(0, Math.floor(lastPalette.length / 2)))];
        setBaseColour(mid.hex, true);
      }

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
        const payload = {
          extracted: lastPalette.map((c) => ({ hex: c.hex, rgb: c.rgb, hsl: c.hsl, var: c.name })),
          harmony: lastHarmony.map((c) => ({ role: c.role, hex: c.hex, rgb: c.rgb, hsl: c.hsl, var: c.name }))
        };
        download("palette.json", JSON.stringify(payload, null, 2), "application/json");
        toast("Downloaded JSON");
      };

      dlCsvBtn.onclick = () => {
        const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
        const header = ["set", "index", "role", "hex", "r", "g", "b", "h", "s", "l", "css_var"];
        const extractedRows = lastPalette.map((c, i) => ["extracted", i + 1, "", c.hex, c.rgb[0], c.rgb[1], c.rgb[2], c.hsl[0], c.hsl[1], c.hsl[2], c.name]);
        const harmonyRows = lastHarmony.map((c, i) => ["harmony", i + 1, c.role, c.hex, c.rgb[0], c.rgb[1], c.rgb[2], c.hsl[0], c.hsl[1], c.hsl[2], c.name]);
        const csv = [header, ...extractedRows, ...harmonyRows].map((r) => r.map(esc).join(",")).join("\n");
        download("palette.csv", csv, "text/csv");
        toast("Downloaded CSV");
      };

      dlCssBtn.onclick = () => {
        const css = lastPalette.map((c) => `  ${c.name}: ${c.hex};`).join("\n");
        const harmonyCss = lastHarmony.map((c) => `  ${c.name}: ${c.hex}; /* ${c.role} */`).join("\n");
        download("palette.css", `:root{\n${css}\n\n${harmonyCss}\n}\n`, "text/css");
        toast("Downloaded CSS");
      };

      dlPngBtn.onclick = () => {
        const swatches = [...lastPalette.map((c) => ({ ...c, set: "Extracted" })), ...lastHarmony.map((c) => ({ ...c, set: "Harmony" }))];
        const swatchW = 140, height = 180, width = Math.max(1, swatches.length) * swatchW;

        dlCanvas.width = width;
        dlCanvas.height = height;

        const c = dlCanvas.getContext("2d");
        c.fillStyle = "#fff";
        c.fillRect(0, 0, width, height);
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.font = "15px system-ui";

        swatches.forEach((item, i) => {
          const x = i * swatchW;
          c.fillStyle = item.hex;
          c.fillRect(x, 0, swatchW, height - 54);
          c.fillStyle = "#000";
          c.fillRect(x, height - 54, swatchW, 54);
          c.fillStyle = "#fff";
          c.fillText(item.hex, x + swatchW / 2, height - 34);
          c.font = "12px system-ui";
          c.fillText(item.role || item.set, x + swatchW / 2, height - 15);
          c.font = "15px system-ui";
        });

        const a = document.createElement("a");
        a.download = "palette.png";
        a.href = dlCanvas.toDataURL("image/png");
        a.click();
        toast("Downloaded PNG");
      };

      dlSvgBtn.onclick = () => {
        const swatches = [...lastPalette.map((c) => ({ ...c, set: "Extracted" })), ...lastHarmony.map((c) => ({ ...c, set: "Harmony" }))];
        const sw = 170, h = 210, w = Math.max(1, swatches.length) * sw;
        const blocks = swatches.map((c, i) => {
          const x = i * sw;
          const label = c.role || c.set || "";
          return `
<g>
  <rect x="${x}" y="0" width="${sw}" height="${h - 58}" fill="${c.hex}"/>
  <rect x="${x}" y="${h - 58}" width="${sw}" height="58" fill="#000"/>
  <text x="${x + sw / 2}" y="${h - 34}" text-anchor="middle"
    font-family="system-ui,-apple-system,Segoe UI,Roboto" font-size="16" fill="#fff">${c.hex}</text>
  <text x="${x + sw / 2}" y="${h - 14}" text-anchor="middle"
    font-family="system-ui,-apple-system,Segoe UI,Roboto" font-size="12" fill="#fff">${label}</text>
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
Name: Extracted + Harmony Palette
Columns: ${Math.max(lastPalette.length, lastHarmony.length)}
#`;
        const lines = [...lastPalette, ...lastHarmony].map((c) => {
          const [r, g, b] = c.rgb;
          return `${String(r).padStart(3, " ")} ${String(g).padStart(3, " ")} ${String(b).padStart(3, " ")}\t${c.role || c.hex} ${c.hex}`;
        });
        download("palette.gpl", [head, ...lines].join("\n"), "text/plain");
        toast("Downloaded .gpl");
      };

      toast(`Found ${lastPalette.length} colours`);
    }

    function renderExtractedQuickPicks() {
      if (!lastPalette.length) return;
      quickPicks.innerHTML = "";
      lastPalette.forEach((c) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "pe-quick-pick";
        b.style.background = c.hex;
        b.title = `Use extracted colour ${c.hex} as base`;
        b.addEventListener("click", () => setBaseColour(c.hex));
        quickPicks.appendChild(b);
      });
    }

    extractBtn.addEventListener("click", extract);

    // Initial state
    enableActions(false);
    drawWheel();
    renderQuickPicks();
    renderHarmony();
    window.addEventListener("resize", placeBaseMarker);
    toast("Ready");
  });
})();
