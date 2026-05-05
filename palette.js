(() => {
  "use strict";

  window.SiteApps = window.SiteApps || {};
  window.SiteApps.registry = window.SiteApps.registry || {};
  window.SiteApps.register = window.SiteApps.register || function (name, initFn) {
    window.SiteApps.registry[name] = initFn;
  };

  const STYLE_ID = "siteapps-palette-style-v4";
  const BUILD_STAMP = "05 May 2026 07:05 BST · GPT-5.5 Thinking";

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
[data-app="palette"]{--gap:16px;--radius:14px;--ink:#111;--paper:#fff;--muted:rgba(0,0,0,.68);--line:rgba(0,0,0,.15);font-family:system-ui,-apple-system,Segoe UI,Roboto,Inter,Arial,sans-serif;max-width:1220px;margin:14px auto;border:2px solid var(--ink);border-radius:16px;padding:18px;background:var(--paper);color:var(--ink)}
[data-app="palette"] *{box-sizing:border-box}
[data-app="palette"] .pe-title{margin:0 0 6px;font-size:1.35rem;line-height:1.15}
[data-app="palette"] .pe-intro{margin:0 0 14px;color:var(--muted);max-width:84ch}
[data-app="palette"] .pe-uploader{border:2px dashed rgba(0,0,0,.25);border-radius:var(--radius);padding:28px;text-align:center;cursor:pointer;transition:.15s border-color,.15s background;position:relative}
[data-app="palette"] .pe-uploader.pe-drag{border-color:rgba(0,0,0,.55);background:rgba(0,0,0,.04)}
[data-app="palette"] .pe-file{position:absolute;opacity:0;width:1px;height:1px;pointer-events:none}
[data-app="palette"] .pe-drop-help strong{display:block;font-size:1.05rem;margin-bottom:4px}
[data-app="palette"] .pe-cta{text-decoration:underline;font-weight:800}
[data-app="palette"] .pe-sub{opacity:.75;font-size:.92rem}
[data-app="palette"] .pe-panel{border:1px solid var(--line);border-radius:var(--radius);background:#fafafa;padding:14px}
[data-app="palette"] .pe-panel-title{margin:0 0 10px;font-size:1.05rem;font-weight:950}
[data-app="palette"] .pe-controls{display:grid;grid-template-columns:1fr;gap:10px;margin:14px 0 6px}
[data-app="palette"] .pe-row{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:10px}
[data-app="palette"] .pe-checkbox{grid-template-columns:auto 1fr}
[data-app="palette"] input[type="range"]{width:100%}
[data-app="palette"] input[type="color"]{width:64px;height:42px;padding:2px;border:2px solid #111;border-radius:10px;background:#fff}
[data-app="palette"] input[type="text"],[data-app="palette"] select{width:100%;min-height:42px;border:2px solid #111;border-radius:10px;padding:8px 10px;background:#fff;color:#111;font:inherit;font-weight:750}
[data-app="palette"] output{font-weight:900;min-width:3ch;text-align:right}
[data-app="palette"] .pe-small{font-size:.9rem;color:var(--muted);line-height:1.35}
[data-app="palette"] .pe-btn{appearance:none;border:2px solid #111;border-radius:12px;padding:10px 14px;background:#fff;cursor:pointer;transition:.12s transform,.12s box-shadow,.12s background;font-weight:900}
[data-app="palette"] .pe-btn:hover{transform:translateY(-1px);box-shadow:0 6px 14px rgba(0,0,0,.10)}
[data-app="palette"] .pe-btn:disabled{opacity:.5;cursor:not-allowed;transform:none;box-shadow:none}
[data-app="palette"] .pe-btn.pe-primary{background:#111;color:#fff}
[data-app="palette"] .pe-stage{display:grid;grid-template-columns:1fr;gap:var(--gap);margin-top:var(--gap)}
[data-app="palette"] .pe-preview{justify-self:center;max-width:100%}
[data-app="palette"] .pe-preview img{max-width:100%;height:auto;border-radius:var(--radius);display:none;border:1px solid rgba(0,0,0,.15)}
[data-app="palette"] .pe-grade-canvas{max-width:100%;height:auto;border-radius:var(--radius);display:none;border:1px solid rgba(0,0,0,.18);background:#eee}
[data-app="palette"] .pe-palette,[data-app="palette"] .pe-harmony-palette{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:var(--gap)}
[data-app="palette"] .pe-swatch{border-radius:var(--radius);overflow:hidden;border:1px solid rgba(0,0,0,.12);background:#f6f6f6;display:flex;flex-direction:column}
[data-app="palette"] .pe-chip{height:96px;display:flex;align-items:end;padding:8px;font-weight:950;cursor:pointer}
[data-app="palette"] .pe-chip span{background:rgba(255,255,255,.82);color:#000;padding:3px 7px;border-radius:999px;font-size:.78rem}
[data-app="palette"] .pe-info{padding:10px;display:grid;gap:6px}
[data-app="palette"] .pe-line{display:flex;align-items:center;justify-content:space-between;gap:10px}
[data-app="palette"] .pe-tag{font-weight:900;font-size:.92rem;overflow-wrap:anywhere}
[data-app="palette"] .pe-copy{border:2px solid #111;background:#fff;cursor:pointer;padding:6px 8px;border-radius:10px;font-weight:900;flex:0 0 auto}
[data-app="palette"] .pe-actions{display:flex;gap:10px;margin-top:10px;flex-wrap:wrap}
[data-app="palette"] .pe-wheel-layout{display:grid;grid-template-columns:1fr;gap:16px;align-items:start}
[data-app="palette"] .pe-wheel-wrap{display:grid;place-items:center;gap:10px}
[data-app="palette"] .pe-wheel-box{position:relative;width:min(320px,88vw);aspect-ratio:1}
[data-app="palette"] .pe-wheel-canvas{width:100%;height:100%;display:block;border-radius:50%;border:2px solid #111;cursor:crosshair;background:#fff}
[data-app="palette"] .pe-wheel-marker{position:absolute;width:18px;height:18px;border:3px solid #000;border-radius:999px;box-shadow:0 0 0 3px #fff,0 2px 8px rgba(0,0,0,.35);transform:translate(-50%,-50%);pointer-events:none}
[data-app="palette"] .pe-wheel-marker.pe-related{width:13px;height:13px;border-width:2px;box-shadow:0 0 0 2px #fff,0 2px 8px rgba(0,0,0,.35);opacity:.9}
[data-app="palette"] .pe-wheel-form,[data-app="palette"] .pe-grade-form{display:grid;gap:10px}
[data-app="palette"] .pe-base-row{display:grid;grid-template-columns:auto 1fr;gap:10px;align-items:center}
[data-app="palette"] .pe-quick-picks{display:flex;flex-wrap:wrap;gap:8px}
[data-app="palette"] .pe-quick-pick{width:34px;height:34px;border-radius:999px;border:2px solid #111;cursor:pointer;background:#ddd}
[data-app="palette"] .pe-method-note{margin-top:6px;padding:10px;border-radius:12px;background:#fff;border:1px solid rgba(0,0,0,.12)}
[data-app="palette"] .pe-angle-list{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}
[data-app="palette"] .pe-angle-pill{border:1px solid rgba(0,0,0,.2);border-radius:999px;padding:4px 8px;background:#fff;font-size:.86rem;font-weight:850}
[data-app="palette"] .pe-listwrap{margin-top:18px}
[data-app="palette"] .pe-h3{margin:0 0 8px;font-size:1.05rem;font-weight:900}
[data-app="palette"] .pe-list table{width:100%;border-collapse:collapse;font-size:.95rem}
[data-app="palette"] .pe-list th,[data-app="palette"] .pe-list td{border-bottom:1px solid rgba(0,0,0,.10);padding:8px 6px;text-align:left;vertical-align:top}
[data-app="palette"] .pe-sample{width:36px;height:24px;border-radius:8px;border:1px solid rgba(0,0,0,.12);display:inline-block}
[data-app="palette"] .pe-grid-2{display:grid;grid-template-columns:1fr;gap:16px;margin-top:16px}
[data-app="palette"] .pe-grade-grid{display:grid;grid-template-columns:1fr;gap:16px;margin-top:16px}
[data-app="palette"] .pe-grade-picks{display:grid;grid-template-columns:1fr;gap:10px}
[data-app="palette"] .pe-toast{position:fixed;left:50%;transform:translateX(-50%);bottom:24px;background:rgba(0,0,0,.88);color:#fff;padding:10px 14px;border-radius:999px;font-size:.95rem;opacity:0;pointer-events:none;transition:.2s opacity,.2s transform;z-index:10000}
[data-app="palette"] .pe-toast.show{opacity:1;transform:translate(-50%,-6px)}
[data-app="palette"] .pe-meta{margin-top:18px;padding-top:12px;border-top:1px solid rgba(0,0,0,.12);color:var(--muted);font-size:.86rem}
[data-app="palette"] button:focus,[data-app="palette"] input:focus,[data-app="palette"] select:focus{outline:3px solid rgba(11,95,255,.35);outline-offset:2px}
@media (min-width:820px){[data-app="palette"] .pe-wheel-layout{grid-template-columns:minmax(280px,360px) 1fr}[data-app="palette"] .pe-grid-2{grid-template-columns:1fr 1fr}[data-app="palette"] .pe-grade-grid{grid-template-columns:1fr 1fr;align-items:start}[data-app="palette"] .pe-grade-picks{grid-template-columns:1fr 1fr 1fr}}
@media (min-width:940px){[data-app="palette"] .pe-stage{grid-template-columns:1fr 1.6fr;align-items:start}[data-app="palette"] .pe-preview{position:sticky;top:10px}}
@media (max-width:620px){[data-app="palette"]{padding:12px}[data-app="palette"] .pe-row{grid-template-columns:1fr;align-items:start}}
`;
    document.head.appendChild(style);
  }

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

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
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
  }

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
    return [
      Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
      Math.round(hue2rgb(p, q, h) * 255),
      Math.round(hue2rgb(p, q, h - 1 / 3) * 255)
    ];
  }

  function hslToHex(h, s, l) {
    const rgb = hslToRgb(h, s, l);
    return rgbToHex(rgb[0], rgb[1], rgb[2]);
  }

  function relativeLuminance(r, g, b) {
    const srgb = [r, g, b]
      .map((v) => v / 255)
      .map((c) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
    return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
  }

  const bestTextColor = (r, g, b) => relativeLuminance(r, g, b) > 0.54 ? "#000" : "#fff";

  function srgbToLab(r, g, b) {
    const srgb = [r, g, b]
      .map((v) => v / 255)
      .map((c) => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
    const X = srgb[0] * 0.4124564 + srgb[1] * 0.3575761 + srgb[2] * 0.1804375;
    const Y = srgb[0] * 0.2126729 + srgb[1] * 0.7151522 + srgb[2] * 0.0721750;
    const Z = srgb[0] * 0.0193339 + srgb[1] * 0.1191920 + srgb[2] * 0.9503041;
    const f = (t) => t > 0.008856 ? Math.cbrt(t) : (7.787 * t + 16 / 116);
    const fx = f(X / 0.95047), fy = f(Y), fz = f(Z / 1.08883);
    return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
  }

  function labToSrgb(L, a, b) {
    const fy = (L + 16) / 116, fx = fy + a / 500, fz = fy - b / 200;
    const invf = (t) => {
      const t3 = t * t * t;
      return t3 > 0.008856 ? t3 : (t - 16 / 116) / 7.787;
    };
    const X = invf(fx) * 0.95047, Y = invf(fy), Z = invf(fz) * 1.08883;
    const rl = 3.2404542 * X - 1.5371385 * Y - 0.4985314 * Z;
    const gl = -0.9692660 * X + 1.8760108 * Y + 0.0415560 * Z;
    const bl = 0.0556434 * X - 0.2040259 * Y + 1.0572252 * Z;
    const comp = (c) => c <= 0 ? 0 : c >= 1 ? 1 : c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
    return [
      clamp(Math.round(comp(rl) * 255), 0, 255),
      clamp(Math.round(comp(gl) * 255), 0, 255),
      clamp(Math.round(comp(bl) * 255), 0, 255)
    ];
  }

  function kmeansLab(pointsLab, k, maxIter = 20) {
    const centroids = [];
    const rand = () => pointsLab[Math.floor(Math.random() * pointsLab.length)];
    centroids.push(rand());
    while (centroids.length < k) {
      const d2 = pointsLab.map((p) => {
        let minD = Infinity;
        for (const c of centroids) {
          const dx = p[0] - c[0], dy = p[1] - c[1], dz = p[2] - c[2];
          minD = Math.min(minD, dx * dx + dy * dy + dz * dz);
        }
        return minD;
      });
      const sum = d2.reduce((a, b) => a + b, 0) || 1;
      let r = Math.random() * sum, idx = 0;
      for (let i = 0; i < d2.length; i++) {
        r -= d2[i];
        if (r <= 0) { idx = i; break; }
      }
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
        const group = assignments[i], p = pointsLab[i];
        sums[group][0] += p[0]; sums[group][1] += p[1]; sums[group][2] += p[2]; sums[group][3]++;
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
    const outLab = [], data = imgData.data;
    for (let i = 0; i < data.length; i += 4 * sampleStep) {
      if (data[i + 3] < 127) continue;
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
    complementary: { label: "Complementary", note: "One colour opposite the base hue. Good for strong subject/background separation.", offsets: [0, 180] },
    split: { label: "Split complementary", note: "Base colour plus two colours either side of the direct complement. Often easier than a hard complement.", offsets: [0, 150, 210] },
    triadic: { label: "Triadic", note: "Three hues evenly spaced around the wheel. Energetic, but easy to overdo.", offsets: [0, 120, 240] },
    tetradic: { label: "Tetradic / rectangle", note: "Two complementary pairs. Best when one colour dominates.", offsets: [0, 60, 180, 240] },
    analogous: { label: "Analogous", note: "Nearby hues. Useful for atmosphere and subtle grades.", offsets: [-30, 0, 30] },
    monochrome: { label: "Monochrome tonal set", note: "Same hue, varied tone. Useful for mood checks.", offsets: [0, 0, 0, 0] },
    square: { label: "Square", note: "Four colours spaced 90° apart. Strong and decorative.", offsets: [0, 90, 180, 270] }
  };

  function buildHarmony(baseHsl, methodKey, satAdjust = 0, lightAdjust = 0) {
    const method = HARMONY_METHODS[methodKey] || HARMONY_METHODS.complementary;
    const [baseH, baseS, baseL] = baseHsl;
    const s = clamp(baseS + satAdjust, 5, 100);
    const l = clamp(baseL + lightAdjust, 8, 92);
    return method.offsets.map((off, i) => {
      let h = mod(baseH + off, 360), ss = s, ll = l;
      let role = i === 0 ? "Base" : (off === 180 ? "Complement" : `${off > 0 ? "+" : ""}${off}°`);
      if (methodKey === "monochrome") {
        const variants = [
          { ss: clamp(s + 6, 5, 100), ll: clamp(l - 24, 8, 92), role: "Deep" },
          { ss: s, ll: clamp(l - 8, 8, 92), role: "Shadow" },
          { ss: clamp(s - 8, 5, 100), ll: clamp(l + 10, 8, 92), role: "Mid" },
          { ss: clamp(s - 18, 5, 100), ll: clamp(l + 28, 8, 92), role: "Highlight" }
        ];
        ss = variants[i].ss; ll = variants[i].ll; role = variants[i].role;
      }
      const rgb = hslToRgb(h, ss, ll);
      return { hex: rgbToHex(rgb[0], rgb[1], rgb[2]), rgb, hsl: [Math.round(h), Math.round(ss), Math.round(ll)], name: `--harmony-${String(i + 1).padStart(2, "0")}`, role, offset: off };
    });
  }

  function overlayBlendChannel(base, blend) {
    base /= 255; blend /= 255;
    const out = base < 0.5 ? 2 * base * blend : 1 - 2 * (1 - base) * (1 - blend);
    return clamp(Math.round(out * 255), 0, 255);
  }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function smoothstep(edge0, edge1, x) {
    const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
  }

  function applyGradeToImageData(imgData, opts) {
    const d = imgData.data;
    const sh = opts.shadowRgb, mid = opts.midRgb, hi = opts.highlightRgb;
    const strength = opts.strength / 100;
    const satBoost = opts.saturation / 100;
    const contrast = opts.contrast / 100;
    const protect = opts.protectWhites / 100;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] < 1) continue;
      let r = d[i], g = d[i + 1], b = d[i + 2];
      const lum = relativeLuminance(r, g, b);
      let sw = 1 - smoothstep(0.12, 0.58, lum);
      let hw = smoothstep(0.42, 0.94, lum);
      let mw = clamp(1 - Math.abs(lum - 0.5) * 2, 0, 1);
      if (protect > 0) {
        const whiteGuard = smoothstep(0.78, 1.0, lum) * protect;
        sw *= 1 - whiteGuard;
        mw *= 1 - whiteGuard * 0.7;
        hw *= 1 - whiteGuard * 0.35;
      }
      const sum = Math.max(0.0001, sw + mw + hw);
      sw /= sum; mw /= sum; hw /= sum;
      const tint = [sh[0] * sw + mid[0] * mw + hi[0] * hw, sh[1] * sw + mid[1] * mw + hi[1] * hw, sh[2] * sw + mid[2] * mw + hi[2] * hw];
      const or = overlayBlendChannel(r, tint[0]), og = overlayBlendChannel(g, tint[1]), ob = overlayBlendChannel(b, tint[2]);
      r = lerp(r, or, strength); g = lerp(g, og, strength); b = lerp(b, ob, strength);
      if (contrast !== 0) {
        const c = contrast * 1.15;
        r = (r - 128) * (1 + c) + 128;
        g = (g - 128) * (1 + c) + 128;
        b = (b - 128) * (1 + c) + 128;
      }
      if (satBoost !== 0) {
        const grey = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        const factor = 1 + satBoost;
        r = grey + (r - grey) * factor;
        g = grey + (g - grey) * factor;
        b = grey + (b - grey) * factor;
      }
      d[i] = clamp(Math.round(r), 0, 255);
      d[i + 1] = clamp(Math.round(g), 0, 255);
      d[i + 2] = clamp(Math.round(b), 0, 255);
    }
    return imgData;
  }

  window.SiteApps.register("palette", (container) => {
    ensureStyle();
    container.innerHTML = "";
    container.setAttribute("data-app", "palette");
    container.innerHTML = `
<div class="pe-app">
  <h2 class="pe-title">Photo palette extractor + colour wheel + grade preview</h2>
  <p class="pe-intro">Extract colours from a photo, build complementary palettes, preview a restrained colour grade, then export the graded image as a PNG.</p>
  <div class="pe-uploader" aria-label="Image uploader" role="button" tabindex="0">
    <input class="pe-file" type="file" accept="image/*" aria-label="Choose a photo">
    <div class="pe-drop-help"><strong>Drop a photo here</strong> or <span class="pe-cta">click to upload</span><div class="pe-sub">JPEG, PNG, WebP • processed on-device</div></div>
  </div>
  <div class="pe-controls pe-panel" role="group" aria-label="Palette controls">
    <h3 class="pe-panel-title">Extract colours from photo</h3>
    <label class="pe-row"><span><strong>Number of colours:</strong></span><input class="pe-count" type="range" min="3" max="16" value="8" step="1" /><output class="pe-count-label">8</output></label>
    <label class="pe-row pe-checkbox"><input class="pe-include-extremes" type="checkbox" /><span><strong>Include near-white & near-black</strong></span></label>
    <button class="pe-btn pe-primary pe-extract" disabled>Extract palette</button>
  </div>
  <div class="pe-stage"><div class="pe-preview"><img class="pe-img" alt="Uploaded preview" /></div><div class="pe-palette" aria-live="polite"></div></div>
  <div class="pe-actions">
    <button class="pe-btn pe-copy-hex" disabled>Copy HEX list</button><button class="pe-btn pe-copy-css" disabled>Copy CSS variables</button><button class="pe-btn pe-copy-tsv" disabled>Copy table (TSV)</button><button class="pe-btn pe-dl-png" disabled>Download palette PNG</button><button class="pe-btn pe-dl-svg" disabled>Download palette SVG</button><button class="pe-btn pe-dl-json" disabled>Download JSON</button><button class="pe-btn pe-dl-csv" disabled>Download CSV</button><button class="pe-btn pe-dl-css" disabled>Download CSS</button><button class="pe-btn pe-dl-gpl" disabled>Download .gpl</button>
  </div>
  <div class="pe-grid-2">
    <section class="pe-panel pe-wheel-panel" aria-label="Colour wheel and harmony controls">
      <h3 class="pe-panel-title">Colour wheel / palette method</h3>
      <div class="pe-wheel-layout">
        <div class="pe-wheel-wrap"><div class="pe-wheel-box"><canvas class="pe-wheel-canvas" width="420" height="420" aria-label="Interactive colour wheel"></canvas><div class="pe-wheel-marker pe-base-marker" aria-hidden="true"></div></div><div class="pe-small">Click or tap the wheel to choose the base hue.</div></div>
        <div class="pe-wheel-form">
          <label class="pe-base-row"><input class="pe-base-color" type="color" value="#3366CC" aria-label="Base colour" /><input class="pe-base-hex" type="text" value="#3366CC" aria-label="Base HEX colour" /></label>
          <label class="pe-row"><span><strong>Harmony method:</strong></span><select class="pe-method"><option value="complementary">Complementary</option><option value="split">Split complementary</option><option value="triadic">Triadic</option><option value="tetradic">Tetradic / rectangle</option><option value="analogous">Analogous</option><option value="monochrome">Monochrome tonal set</option><option value="square">Square</option></select><span></span></label>
          <label class="pe-row"><span><strong>Saturation:</strong></span><input class="pe-sat-adjust" type="range" min="-50" max="50" value="0" step="1" /><output class="pe-sat-label">0</output></label>
          <label class="pe-row"><span><strong>Lightness:</strong></span><input class="pe-light-adjust" type="range" min="-40" max="40" value="0" step="1" /><output class="pe-light-label">0</output></label>
          <div class="pe-method-note"></div><div class="pe-angle-list" aria-live="polite"></div>
          <div class="pe-actions"><button class="pe-btn pe-copy-harmony-hex">Copy harmony HEX</button><button class="pe-btn pe-copy-harmony-css">Copy harmony CSS</button><button class="pe-btn pe-copy-harmony-tsv">Copy harmony table</button></div>
        </div>
      </div>
    </section>
    <section class="pe-panel" aria-label="Suggested colour grade notes"><h3 class="pe-panel-title">How to use this for photo grading</h3><div class="pe-small"><strong>Practical rule:</strong> pick one dominant colour direction, one support colour, and one accent. The grade preview is intentionally restrained so you can test a mood before moving to Lightroom.</div><div class="pe-quick-picks" aria-label="Quick base colour choices"></div></section>
  </div>
  <div class="pe-listwrap"><h3 class="pe-h3">Generated harmony palette</h3><div class="pe-harmony-palette" aria-live="polite"></div></div>
  <section class="pe-panel pe-grade-grid" aria-label="Grade preview" style="margin-top:18px;">
    <div><h3 class="pe-panel-title">Grade preview</h3><canvas class="pe-grade-canvas" width="0" height="0" aria-label="Graded image preview"></canvas><div class="pe-small" style="margin-top:8px;">Preview uses a working canvas for speed. Export uses the loaded image dimensions where possible.</div></div>
    <div class="pe-grade-form">
      <div class="pe-grade-picks"><label><strong>Shadows</strong><input class="pe-shadow-color" type="color" value="#163A5F"></label><label><strong>Midtones</strong><input class="pe-mid-color" type="color" value="#6F6A60"></label><label><strong>Highlights</strong><input class="pe-highlight-color" type="color" value="#D89A4A"></label></div>
      <label class="pe-row"><span><strong>Grade strength:</strong></span><input class="pe-grade-strength" type="range" min="0" max="80" value="22" step="1"><output class="pe-grade-strength-label">22</output></label>
      <label class="pe-row"><span><strong>Contrast:</strong></span><input class="pe-grade-contrast" type="range" min="-40" max="40" value="6" step="1"><output class="pe-grade-contrast-label">6</output></label>
      <label class="pe-row"><span><strong>Saturation:</strong></span><input class="pe-grade-saturation" type="range" min="-50" max="50" value="0" step="1"><output class="pe-grade-saturation-label">0</output></label>
      <label class="pe-row"><span><strong>Protect whites:</strong></span><input class="pe-protect-whites" type="range" min="0" max="100" value="60" step="1"><output class="pe-protect-whites-label">60</output></label>
      <div class="pe-actions"><button class="pe-btn pe-primary pe-apply-grade" disabled>Apply preview grade</button><button class="pe-btn pe-use-harmony-grade">Use harmony as grade</button><button class="pe-btn pe-grade-warm">Warm highlights / cool shadows</button><button class="pe-btn pe-grade-cool">Cool muted grade</button><button class="pe-btn pe-grade-reset">Reset grade</button><button class="pe-btn pe-export-grade" disabled>Export graded PNG</button></div>
    </div>
  </section>
  <div class="pe-listwrap"><h3 class="pe-h3">Full extracted palette listing</h3><div class="pe-list pe-extracted-list" aria-live="polite"></div></div>
  <div class="pe-listwrap"><h3 class="pe-h3">Full harmony listing</h3><div class="pe-list pe-harmony-list" aria-live="polite"></div></div>
  <canvas class="pe-canvas" width="0" height="0" style="display:none;"></canvas><canvas class="pe-full-canvas" width="0" height="0" style="display:none;"></canvas><canvas class="pe-dl-canvas" width="0" height="0" style="display:none;"></canvas><div class="pe-toast" role="status" aria-live="polite"></div><div class="pe-meta">Build ${BUILD_STAMP}</div>
</div>`;

    const $ = (sel) => container.querySelector(sel);
    const dropzone = $(".pe-uploader"), fileInput = $(".pe-file"), imgEl = $(".pe-img"), canvas = $(".pe-canvas"), fullCanvas = $(".pe-full-canvas"), dlCanvas = $(".pe-dl-canvas"), gradeCanvas = $(".pe-grade-canvas");
    const paletteEl = $(".pe-palette"), listWrap = $(".pe-extracted-list"), countRange = $(".pe-count"), countLabel = $(".pe-count-label"), includeExt = $(".pe-include-extremes"), extractBtn = $(".pe-extract");
    const copyHexBtn = $(".pe-copy-hex"), copyCssBtn = $(".pe-copy-css"), copyTsvBtn = $(".pe-copy-tsv"), dlPngBtn = $(".pe-dl-png"), dlSvgBtn = $(".pe-dl-svg"), dlJsonBtn = $(".pe-dl-json"), dlCsvBtn = $(".pe-dl-csv"), dlCssBtn = $(".pe-dl-css"), dlGplBtn = $(".pe-dl-gpl");
    const wheelCanvas = $(".pe-wheel-canvas"), wheelBox = $(".pe-wheel-box"), baseMarker = $(".pe-base-marker"), baseColorInput = $(".pe-base-color"), baseHexInput = $(".pe-base-hex"), methodSelect = $(".pe-method"), satAdjust = $(".pe-sat-adjust"), satLabel = $(".pe-sat-label"), lightAdjust = $(".pe-light-adjust"), lightLabel = $(".pe-light-label"), methodNote = $(".pe-method-note"), angleList = $(".pe-angle-list"), harmonyPaletteEl = $(".pe-harmony-palette"), harmonyListEl = $(".pe-harmony-list"), quickPicks = $(".pe-quick-picks");
    const copyHarmonyHex = $(".pe-copy-harmony-hex"), copyHarmonyCss = $(".pe-copy-harmony-css"), copyHarmonyTsv = $(".pe-copy-harmony-tsv");
    const shadowColor = $(".pe-shadow-color"), midColor = $(".pe-mid-color"), highlightColor = $(".pe-highlight-color"), gradeStrength = $(".pe-grade-strength"), gradeContrast = $(".pe-grade-contrast"), gradeSaturation = $(".pe-grade-saturation"), protectWhites = $(".pe-protect-whites");
    const gradeStrengthLabel = $(".pe-grade-strength-label"), gradeContrastLabel = $(".pe-grade-contrast-label"), gradeSaturationLabel = $(".pe-grade-saturation-label"), protectWhitesLabel = $(".pe-protect-whites-label");
    const applyGradeBtn = $(".pe-apply-grade"), useHarmonyGradeBtn = $(".pe-use-harmony-grade"), warmGradeBtn = $(".pe-grade-warm"), coolGradeBtn = $(".pe-grade-cool"), resetGradeBtn = $(".pe-grade-reset"), exportGradeBtn = $(".pe-export-grade");
    const toastEl = $(".pe-toast");
    let lastPalette = [], lastHarmony = [], lastObjectUrl = null;

    function toast(msg) {
      toastEl.textContent = msg;
      toastEl.classList.add("show");
      clearTimeout(toast._t);
      toast._t = setTimeout(() => toastEl.classList.remove("show"), 1400);
    }

    function enableActions(enabled) {
      [extractBtn, copyHexBtn, copyCssBtn, copyTsvBtn, dlPngBtn, dlSvgBtn, dlJsonBtn, dlCsvBtn, dlCssBtn, dlGplBtn].forEach((b) => b.disabled = !enabled);
      applyGradeBtn.disabled = !enabled;
      exportGradeBtn.disabled = !enabled;
    }

    countRange.addEventListener("input", () => { countLabel.textContent = String(countRange.value); });

    async function loadFile(file) {
      if (!file) return;
      if (lastObjectUrl) URL.revokeObjectURL(lastObjectUrl);
      lastObjectUrl = URL.createObjectURL(file);
      imgEl.style.display = "none";
      imgEl.src = lastObjectUrl;
      await new Promise((res, rej) => { imgEl.onload = res; imgEl.onerror = rej; });
      const w = imgEl.naturalWidth || 1, h = imgEl.naturalHeight || 1;
      const previewScale = Math.min(1, 900 / Math.max(w, h));
      canvas.width = Math.max(1, Math.floor(w * previewScale));
      canvas.height = Math.max(1, Math.floor(h * previewScale));
      canvas.getContext("2d", { willReadFrequently: true }).drawImage(imgEl, 0, 0, canvas.width, canvas.height);
      fullCanvas.width = w;
      fullCanvas.height = h;
      fullCanvas.getContext("2d", { willReadFrequently: true }).drawImage(imgEl, 0, 0, w, h);
      imgEl.style.display = "block";
      enableActions(true);
      applyGradePreview(false);
      toast("Image ready");
    }

    ["dragenter", "dragover"].forEach((evt) => dropzone.addEventListener(evt, (e) => { e.preventDefault(); e.stopPropagation(); dropzone.classList.add("pe-drag"); }));
    ["dragleave", "drop"].forEach((evt) => dropzone.addEventListener(evt, (e) => { e.preventDefault(); e.stopPropagation(); dropzone.classList.remove("pe-drag"); }));
    dropzone.addEventListener("drop", (e) => { const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]; if (file) loadFile(file); });
    function openPicker() { fileInput.value = ""; fileInput.click(); }
    dropzone.addEventListener("click", openPicker);
    dropzone.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openPicker(); } });
    fileInput.addEventListener("change", () => loadFile(fileInput.files && fileInput.files[0]));

    function renderListTable(palette, targetEl, includeRole) {
      const rows = palette.map((c, i) => {
        const rgb = `rgb(${c.rgb[0]}, ${c.rgb[1]}, ${c.rgb[2]})`;
        const hsl = `hsl(${c.hsl[0]} ${c.hsl[1]}% ${c.hsl[2]}%)`;
        return `<tr><td>${String(i + 1).padStart(2, "0")}</td><td><span class="pe-sample" style="background:${c.hex}"></span></td><td>${c.hex}</td><td>${rgb}</td><td>${hsl}</td><td>${c.name}</td>${includeRole ? `<td>${c.role || ""}</td>` : ""}</tr>`;
      }).join("");
      targetEl.innerHTML = `<div class="pe-list"><table><thead><tr><th>#</th><th>Sample</th><th>HEX</th><th>RGB</th><th>HSL</th><th>CSS Var</th>${includeRole ? "<th>Role</th>" : ""}</tr></thead><tbody>${rows}</tbody></table></div>`;
    }

    function setBaseColour(hex, silent) {
      const rgb = hexToRgb(hex);
      if (!rgb) { if (!silent) toast("Invalid HEX colour"); return; }
      const cleanHex = rgbToHex(rgb[0], rgb[1], rgb[2]);
      baseColorInput.value = cleanHex;
      baseHexInput.value = cleanHex;
      renderHarmony();
    }

    function makeSwatchEl(item) {
      const [r, g, b] = item.rgb;
      const [h, s, l] = item.hsl;
      const el = document.createElement("div");
      el.className = "pe-swatch";
      const chip = document.createElement("div");
      chip.className = "pe-chip";
      chip.style.background = item.hex;
      chip.style.color = bestTextColor(r, g, b);
      chip.title = `${item.hex} · hsl(${h} ${s}% ${l}%)`;
      chip.innerHTML = `<span>${item.role || item.hex}</span>`;
      chip.addEventListener("click", () => { setBaseColour(item.hex); toast("Base colour set from swatch"); });
      const info = document.createElement("div");
      info.className = "pe-info";
      const addLine = (label, value) => {
        const row = document.createElement("div");
        row.className = "pe-line";
        const tag = document.createElement("div");
        tag.className = "pe-tag";
        tag.textContent = value;
        const btn = document.createElement("button");
        btn.className = "pe-copy";
        btn.type = "button";
        btn.textContent = "Copy";
        btn.addEventListener("click", async (e) => { e.stopPropagation(); toast((await copyText(value)) ? `Copied ${label}` : "Copy failed"); });
        row.append(tag, btn);
        info.append(row);
      };
      if (item.role) addLine("role", item.role);
      addLine("HEX", item.hex);
      addLine("RGB", `rgb(${r}, ${g}, ${b})`);
      addLine("HSL", `hsl(${h} ${s}% ${l}%)`);
      const useBtn = document.createElement("button");
      useBtn.className = "pe-copy";
      useBtn.type = "button";
      useBtn.textContent = "Use as base";
      useBtn.addEventListener("click", (e) => { e.stopPropagation(); setBaseColour(item.hex); toast("Base colour set"); });
      info.append(useBtn);
      el.append(chip, info);
      return el;
    }

    function drawWheel() {
      const ctx = wheelCanvas.getContext("2d", { willReadFrequently: true });
      const w = wheelCanvas.width, h = wheelCanvas.height, cx = w / 2, cy = h / 2, radius = Math.min(w, h) / 2 - 4;
      const img = ctx.createImageData(w, h);
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const dx = x - cx, dy = y - cy, dist = Math.sqrt(dx * dx + dy * dy), idx = (y * w + x) * 4;
          if (dist <= radius) {
            const angle = mod(Math.atan2(dy, dx) * 180 / Math.PI + 360, 360);
            const sat = clamp((dist / radius) * 100, 0, 100);
            const rgb = hslToRgb(angle, sat, 50);
            img.data[idx] = rgb[0]; img.data[idx + 1] = rgb[1]; img.data[idx + 2] = rgb[2]; img.data[idx + 3] = 255;
          } else {
            img.data[idx + 3] = 0;
          }
        }
      }
      ctx.putImageData(img, 0, 0);
    }

    function markerPositionForHsl(h, s) {
      const rect = wheelCanvas.getBoundingClientRect();
      const cx = rect.width / 2, cy = rect.height / 2, radius = rect.width / 2 - 4;
      const a = mod(h, 360) * Math.PI / 180;
      const dist = clamp(s, 0, 100) / 100 * radius;
      return { x: cx + Math.cos(a) * dist, y: cy + Math.sin(a) * dist };
    }

    function placeBaseMarker() {
      const rgb = hexToRgb(baseHexInput.value) || [51, 102, 204];
      const hsl = rgbToHsl(rgb[0], rgb[1], rgb[2]);
      const p = markerPositionForHsl(hsl[0], hsl[1]);
      baseMarker.style.left = `${p.x}px`;
      baseMarker.style.top = `${p.y}px`;
      const method = HARMONY_METHODS[methodSelect.value] || HARMONY_METHODS.complementary;
      wheelBox.querySelectorAll(".pe-related").forEach((m) => m.remove());
      method.offsets.slice(1).forEach((off) => {
        const pp = markerPositionForHsl(hsl[0] + off, hsl[1]);
        const m = document.createElement("div");
        m.className = "pe-wheel-marker pe-related";
        m.style.left = `${pp.x}px`;
        m.style.top = `${pp.y}px`;
        wheelBox.appendChild(m);
      });
    }

    function wheelEventToColour(e) {
      const rect = wheelCanvas.getBoundingClientRect();
      const x = e.clientX - rect.left, y = e.clientY - rect.top, cx = rect.width / 2, cy = rect.height / 2;
      const dx = x - cx, dy = y - cy, dist = Math.sqrt(dx * dx + dy * dy), radius = rect.width / 2 - 4;
      if (dist > radius) return null;
      const angle = mod(Math.atan2(dy, dx) * 180 / Math.PI + 360, 360);
      const sat = clamp((dist / radius) * 100, 0, 100);
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
      lastHarmony.forEach((c) => harmonyPaletteEl.appendChild(makeSwatchEl(c)));
      renderListTable(lastHarmony, harmonyListEl, true);
      methodNote.textContent = method.note;
      angleList.innerHTML = method.offsets.map((offset, i) => {
        const angle = mod(baseHsl[0] + offset, 360);
        const label = methodKey === "monochrome" ? lastHarmony[i].role : `${lastHarmony[i].role}: ${Math.round(angle)}°`;
        return `<span class="pe-angle-pill">${label}</span>`;
      }).join("");
      placeBaseMarker();
    }

    wheelCanvas.addEventListener("click", (e) => { const hex = wheelEventToColour(e); if (hex) { setBaseColour(hex); toast("Base colour picked"); } });
    baseColorInput.addEventListener("input", () => setBaseColour(baseColorInput.value, true));
    baseHexInput.addEventListener("change", () => setBaseColour(baseHexInput.value));
    baseHexInput.addEventListener("keydown", (e) => { if (e.key === "Enter") setBaseColour(baseHexInput.value); });
    [methodSelect, satAdjust, lightAdjust].forEach((el) => el.addEventListener("input", renderHarmony));

    function harmonyHexText() { return lastHarmony.map((c) => c.hex).join(", "); }
    function harmonyCssText() { return `:root{\n${lastHarmony.map((c) => `  ${c.name}: ${c.hex}; /* ${c.role} */`).join("\n")}\n}`; }
    function harmonyTsvText() {
      const header = ["index", "role", "hex", "rgb", "hsl", "css_var"].join("\t");
      const lines = lastHarmony.map((c, i) => [i + 1, c.role, c.hex, `rgb(${c.rgb[0]}, ${c.rgb[1]}, ${c.rgb[2]})`, `hsl(${c.hsl[0]} ${c.hsl[1]}% ${c.hsl[2]}%)`, c.name].join("\t"));
      return [header, ...lines].join("\n");
    }
    copyHarmonyHex.addEventListener("click", async () => toast((await copyText(harmonyHexText())) ? "Harmony HEX copied" : "Copy failed"));
    copyHarmonyCss.addEventListener("click", async () => toast((await copyText(harmonyCssText())) ? "Harmony CSS copied" : "Copy failed"));
    copyHarmonyTsv.addEventListener("click", async () => toast((await copyText(harmonyTsvText())) ? "Harmony table copied" : "Copy failed"));

    function renderQuickPicks(picks) {
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

    function getGradeOptions() {
      return {
        shadowRgb: hexToRgb(shadowColor.value) || [22, 58, 95],
        midRgb: hexToRgb(midColor.value) || [111, 106, 96],
        highlightRgb: hexToRgb(highlightColor.value) || [216, 154, 74],
        strength: parseInt(gradeStrength.value, 10) || 0,
        contrast: parseInt(gradeContrast.value, 10) || 0,
        saturation: parseInt(gradeSaturation.value, 10) || 0,
        protectWhites: parseInt(protectWhites.value, 10) || 0
      };
    }

    function updateGradeLabels() {
      gradeStrengthLabel.textContent = gradeStrength.value;
      gradeContrastLabel.textContent = gradeContrast.value;
      gradeSaturationLabel.textContent = gradeSaturation.value;
      protectWhitesLabel.textContent = protectWhites.value;
    }

    function applyGradePreview(showToast = true) {
      updateGradeLabels();
      if (canvas.width === 0 || canvas.height === 0) return;
      gradeCanvas.width = canvas.width;
      gradeCanvas.height = canvas.height;
      gradeCanvas.style.display = "block";
      const ctx = gradeCanvas.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(canvas, 0, 0);
      const imgData = ctx.getImageData(0, 0, gradeCanvas.width, gradeCanvas.height);
      ctx.putImageData(applyGradeToImageData(imgData, getGradeOptions()), 0, 0);
      if (showToast) toast("Grade preview applied");
    }

    function useHarmonyAsGrade() {
      if (!lastHarmony.length) renderHarmony();
      const hs = lastHarmony;
      shadowColor.value = (hs[1] && hs[1].hex) || (hs[0] && hs[0].hex) || "#163A5F";
      midColor.value = (hs[0] && hs[0].hex) || "#6F6A60";
      highlightColor.value = (hs[2] && hs[2].hex) || (hs[1] && hs[1].hex) || "#D89A4A";
      gradeStrength.value = "22";
      gradeContrast.value = "6";
      gradeSaturation.value = "0";
      protectWhites.value = "60";
      applyGradePreview();
    }

    applyGradeBtn.addEventListener("click", () => applyGradePreview(true));
    [shadowColor, midColor, highlightColor, gradeStrength, gradeContrast, gradeSaturation, protectWhites].forEach((el) => {
      el.addEventListener("input", () => {
        updateGradeLabels();
        clearTimeout(applyGradePreview._t);
        applyGradePreview._t = setTimeout(() => applyGradePreview(false), 160);
      });
    });
    useHarmonyGradeBtn.addEventListener("click", useHarmonyAsGrade);
    warmGradeBtn.addEventListener("click", () => { shadowColor.value = "#163A5F"; midColor.value = "#6F6A60"; highlightColor.value = "#D89A4A"; gradeStrength.value = "24"; gradeContrast.value = "8"; gradeSaturation.value = "2"; protectWhites.value = "65"; applyGradePreview(); });
    coolGradeBtn.addEventListener("click", () => { shadowColor.value = "#203D52"; midColor.value = "#59676C"; highlightColor.value = "#C8BFA8"; gradeStrength.value = "18"; gradeContrast.value = "2"; gradeSaturation.value = "-8"; protectWhites.value = "70"; applyGradePreview(); });
    resetGradeBtn.addEventListener("click", () => { shadowColor.value = "#163A5F"; midColor.value = "#6F6A60"; highlightColor.value = "#D89A4A"; gradeStrength.value = "22"; gradeContrast.value = "6"; gradeSaturation.value = "0"; protectWhites.value = "60"; applyGradePreview(); });
    exportGradeBtn.addEventListener("click", () => {
      if (fullCanvas.width === 0) return;
      const ctx = fullCanvas.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(imgEl, 0, 0, fullCanvas.width, fullCanvas.height);
      const imgData = ctx.getImageData(0, 0, fullCanvas.width, fullCanvas.height);
      ctx.putImageData(applyGradeToImageData(imgData, getGradeOptions()), 0, 0);
      const a = document.createElement("a");
      a.download = "graded-image.png";
      a.href = fullCanvas.toDataURL("image/png");
      a.click();
      toast("Exported graded PNG");
    });

    async function extract() {
      if (canvas.width === 0 || canvas.height === 0) return;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const lab = pixelsFromImageData(imgData, 4, includeExt.checked);
      if (lab.length < 8) { toast("Not enough pixels to sample"); return; }
      const k = parseInt(countRange.value, 10);
      const { centroids } = kmeansLab(lab, k, 20);
      const colours = centroids.map((c) => {
        const rgb = labToSrgb(c[0], c[1], c[2]);
        const hsl = rgbToHsl(rgb[0], rgb[1], rgb[2]);
        return { rgb, hsl, hex: rgbToHex(rgb[0], rgb[1], rgb[2]) };
      }).sort((a, b) => (a.hsl[2] - b.hsl[2]) || (a.hsl[0] - b.hsl[0]));
      paletteEl.innerHTML = "";
      lastPalette = colours.map((c, i) => {
        const item = { hex: c.hex, rgb: c.rgb, hsl: c.hsl, name: `--color-${String(i + 1).padStart(2, "0")}` };
        paletteEl.appendChild(makeSwatchEl(item));
        return item;
      });
      renderListTable(lastPalette, listWrap, false);
      renderQuickPicks(lastPalette.map((c) => c.hex));
      if (lastPalette.length) {
        const mid = lastPalette[Math.min(lastPalette.length - 1, Math.max(0, Math.floor(lastPalette.length / 2)))];
        setBaseColour(mid.hex, true);
      }
      copyHexBtn.onclick = async () => toast((await copyText(lastPalette.map((c) => c.hex).join(", "))) ? "HEX list copied" : "Copy failed");
      copyCssBtn.onclick = async () => toast((await copyText(`:root{\n${lastPalette.map((c) => `  ${c.name}: ${c.hex};`).join("\n")}\n}`)) ? "CSS variables copied" : "Copy failed");
      copyTsvBtn.onclick = async () => {
        const header = ["index", "hex", "rgb", "hsl", "css_var"].join("\t");
        const lines = lastPalette.map((c, i) => [i + 1, c.hex, `rgb(${c.rgb[0]}, ${c.rgb[1]}, ${c.rgb[2]})`, `hsl(${c.hsl[0]} ${c.hsl[1]}% ${c.hsl[2]}%)`, c.name].join("\t"));
        toast((await copyText([header, ...lines].join("\n"))) ? "Table copied (TSV)" : "Copy failed");
      };
      dlJsonBtn.onclick = () => { download("palette.json", JSON.stringify({ extracted: lastPalette, harmony: lastHarmony, grade: getGradeOptions() }, null, 2), "application/json"); toast("Downloaded JSON"); };
      dlCsvBtn.onclick = () => {
        const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
        const header = ["set", "index", "role", "hex", "r", "g", "b", "h", "s", "l", "css_var"];
        const rows = [
          ...lastPalette.map((c, i) => ["extracted", i + 1, "", c.hex, c.rgb[0], c.rgb[1], c.rgb[2], c.hsl[0], c.hsl[1], c.hsl[2], c.name]),
          ...lastHarmony.map((c, i) => ["harmony", i + 1, c.role, c.hex, c.rgb[0], c.rgb[1], c.rgb[2], c.hsl[0], c.hsl[1], c.hsl[2], c.name])
        ];
        download("palette.csv", [header, ...rows].map((r) => r.map(esc).join(",")).join("\n"), "text/csv");
        toast("Downloaded CSV");
      };
      dlCssBtn.onclick = () => { download("palette.css", `:root{\n${lastPalette.map((c) => `  ${c.name}: ${c.hex};`).join("\n")}\n\n${lastHarmony.map((c) => `  ${c.name}: ${c.hex}; /* ${c.role} */`).join("\n")}\n}\n`, "text/css"); toast("Downloaded CSS"); };
      dlPngBtn.onclick = () => {
        const swatches = [...lastPalette, ...lastHarmony];
        const swatchW = 140, height = 180, width = Math.max(1, swatches.length) * swatchW;
        dlCanvas.width = width; dlCanvas.height = height;
        const c = dlCanvas.getContext("2d");
        c.fillStyle = "#fff"; c.fillRect(0, 0, width, height); c.textAlign = "center"; c.textBaseline = "middle"; c.font = "15px system-ui";
        swatches.forEach((item, i) => {
          const x = i * swatchW;
          c.fillStyle = item.hex; c.fillRect(x, 0, swatchW, height - 54);
          c.fillStyle = "#000"; c.fillRect(x, height - 54, swatchW, 54);
          c.fillStyle = "#fff"; c.fillText(item.hex, x + swatchW / 2, height - 34);
          c.font = "12px system-ui"; c.fillText(item.role || "Extracted", x + swatchW / 2, height - 15); c.font = "15px system-ui";
        });
        const a = document.createElement("a");
        a.download = "palette.png"; a.href = dlCanvas.toDataURL("image/png"); a.click(); toast("Downloaded PNG");
      };
      dlSvgBtn.onclick = () => {
        const swatches = [...lastPalette, ...lastHarmony], sw = 170, h = 210, w = Math.max(1, swatches.length) * sw;
        const blocks = swatches.map((c, i) => `<g><rect x="${i * sw}" y="0" width="${sw}" height="${h - 58}" fill="${c.hex}"/><rect x="${i * sw}" y="${h - 58}" width="${sw}" height="58" fill="#000"/><text x="${i * sw + sw / 2}" y="${h - 34}" text-anchor="middle" font-family="system-ui,-apple-system,Segoe UI,Roboto" font-size="16" fill="#fff">${c.hex}</text><text x="${i * sw + sw / 2}" y="${h - 14}" text-anchor="middle" font-family="system-ui,-apple-system,Segoe UI,Roboto" font-size="12" fill="#fff">${c.role || "Extracted"}</text></g>`).join("");
        download("palette.svg", `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="100%" height="100%" fill="#fff"/>${blocks}</svg>`, "image/svg+xml");
        toast("Downloaded SVG");
      };
      dlGplBtn.onclick = () => {
        const head = `GIMP Palette\nName: Extracted + Harmony Palette\nColumns: ${Math.max(lastPalette.length, lastHarmony.length)}\n#`;
        const lines = [...lastPalette, ...lastHarmony].map((c) => `${String(c.rgb[0]).padStart(3, " ")} ${String(c.rgb[1]).padStart(3, " ")} ${String(c.rgb[2]).padStart(3, " ")}\t${c.role || c.hex} ${c.hex}`);
        download("palette.gpl", [head, ...lines].join("\n"), "text/plain"); toast("Downloaded .gpl");
      };
      useHarmonyAsGrade();
      toast(`Found ${lastPalette.length} colours`);
    }

    extractBtn.addEventListener("click", extract);
    enableActions(false);
    drawWheel();
    renderQuickPicks(["#1E3A5F", "#2F6F4E", "#6B5B95", "#A64B2A", "#D98C00", "#3B6EA8", "#7B2D26", "#B07D62", "#708238", "#4A4A4A"]);
    renderHarmony();
    updateGradeLabels();
    window.addEventListener("resize", placeBaseMarker);
    toast("Ready");
  });
})();
