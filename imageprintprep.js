(() => {
  "use strict";

  // ---- SiteApps registry (safe, minimal) ----
  window.SiteApps = window.SiteApps || {};
  window.SiteApps.registry = window.SiteApps.registry || {};
  window.SiteApps.register =
    window.SiteApps.register ||
    function (name, initFn) {
      window.SiteApps.registry[name] = initFn;
    };

  const STYLE_ID = "siteapps-imageprintprep-style-v3";

  function ensureStyle() {
    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }

    style.textContent = `
[data-app="imageprintprep"]{
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  max-width: 1050px;
  margin: 18px auto;
  border: 2px solid #111;
  border-radius: 16px;
  padding: 18px;
  background: #fff;
  color:#111;
}
[data-app="imageprintprep"] *{ box-sizing:border-box; }
[data-app="imageprintprep"] h3{ margin:0 0 8px; font-size: 18px; }
[data-app="imageprintprep"] .muted{ color:#444; font-size: 13px; font-weight: 800; }
[data-app="imageprintprep"] .err{
  margin: 10px 0 0;
  padding: 10px 12px;
  border: 2px solid #7a0000;
  border-radius: 12px;
  background: #fff5f5;
  color: #7a0000;
  font-weight: 900;
  display:none;
}

[data-app="imageprintprep"] .drop{
  border: 3px dashed #111;
  border-radius: 14px;
  padding: 18px;
  text-align:center;
  font-weight: 1000;
  cursor:pointer;
  background:#fafafa;
  user-select:none;
}
[data-app="imageprintprep"] .row{
  display:flex;
  gap:10px;
  flex-wrap:wrap;
  align-items:flex-end;
  margin-top: 12px;
}
[data-app="imageprintprep"] label{
  display:flex;
  flex-direction:column;
  gap:6px;
  font-weight: 900;
  font-size: 12px;
  color:#222;
}
[data-app="imageprintprep"] input,
[data-app="imageprintprep"] select{
  border:2px solid #111;
  border-radius: 12px;
  padding: 10px 12px;
  font-size: 15px;
  font-weight: 900;
  background:#fff;
  color:#111;
}
[data-app="imageprintprep"] input[type="checkbox"]{ width:18px; height:18px; }
[data-app="imageprintprep"] .check{
  flex-direction:row;
  align-items:center;
  gap:10px;
  margin-top: 6px;
}
[data-app="imageprintprep"] .pill{
  border:2px solid rgba(0,0,0,.15);
  border-radius:999px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 1000;
  color:#444;
  background:#fff;
}
[data-app="imageprintprep"] .warn{
  border-color:#7a0000;
  color:#7a0000;
  background:#fff5f5;
}
[data-app="imageprintprep"] .good{
  border-color:#0b3d0b;
  color:#0b3d0b;
  background:#f1fff1;
}
[data-app="imageprintprep"] .btnrow{
  display:flex;
  gap:10px;
  flex-wrap:wrap;
  margin-top: 12px;
}
[data-app="imageprintprep"] button{
  border:2px solid #111;
  border-radius: 12px;
  padding: 10px 12px;
  font-weight: 1000;
  background:#fff;
  cursor:pointer;
}
[data-app="imageprintprep"] button.primary{
  background:#111;
  color:#fff;
}
[data-app="imageprintprep"] button:disabled{ opacity:.55; cursor:not-allowed; }

[data-app="imageprintprep"] canvas{
  width:100%;
  max-width: 100%;
  margin-top: 14px;
  border:2px solid #111;
  border-radius: 12px;
  background:#fff;
}

@media (max-width: 900px){
  [data-app="imageprintprep"] .row label{ flex: 1 1 140px; }
}
`;
  }

  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const toNum = (v, d = 0) => {
    const x = parseFloat(String(v ?? "").replace(",", "."));
    return Number.isFinite(x) ? x : d;
  };

  function mmToIn(mm) { return mm / 25.4; }
  function inToMm(_in) { return _in * 25.4; }

  // Lazy-load jsPDF (UMD: window.jspdf.jsPDF)
  async function ensureJsPDF() {
    if (window.jspdf && window.jspdf.jsPDF) return window.jspdf.jsPDF;

    await new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-siteapps-jspdf="1"]');
      if (existing) {
        existing.addEventListener("load", () => resolve(true), { once: true });
        existing.addEventListener("error", () => reject(new Error("jsPDF load error")), { once: true });
        return;
      }
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      s.async = true;
      s.setAttribute("data-siteapps-jspdf", "1");
      s.onload = () => resolve(true);
      s.onerror = () => reject(new Error("jsPDF load error"));
      document.head.appendChild(s);
    });

    if (window.jspdf && window.jspdf.jsPDF) return window.jspdf.jsPDF;
    throw new Error("jsPDF loaded but window.jspdf.jsPDF not found");
  }

  // Average colour (simple + iPad-safe)
  function avgColourFromImage(img) {
    const temp = document.createElement("canvas");
    const tctx = temp.getContext("2d", { willReadFrequently: true });
    temp.width = 50;
    temp.height = 50;
    tctx.drawImage(img, 0, 0, 50, 50);
    const data = tctx.getImageData(0, 0, 50, 50).data;
    let r = 0, g = 0, b = 0, c = 0;
    for (let i = 0; i < data.length; i += 4) {
      r += data[i]; g += data[i + 1]; b += data[i + 2]; c++;
    }
    r = Math.round(r / c); g = Math.round(g / c); b = Math.round(b / c);
    return `rgb(${r},${g},${b})`;
  }

  const PRESETS = [
    { id: "custom", name: "Custom" },
    { id: "a4", name: "A4 (210×297mm)", wMm: 210, hMm: 297 },
    { id: "a3", name: "A3 (297×420mm)", wMm: 297, hMm: 420 },
    { id: "a2", name: "A2 (420×594mm)", wMm: 420, hMm: 594 },
    { id: "a1", name: "A1 (594×841mm)", wMm: 594, hMm: 841 },
    { id: "4x6", name: "Photo 4×6 in", wIn: 4, hIn: 6 },
    { id: "5x7", name: "Photo 5×7 in", wIn: 5, hIn: 7 },
    { id: "8x10", name: "Photo 8×10 in", wIn: 8, hIn: 10 },
    { id: "12x18", name: "Poster 12×18 in", wIn: 12, hIn: 18 },
    { id: "16x20", name: "Poster 16×20 in", wIn: 16, hIn: 20 },
  ];

  window.SiteApps.register("imageprintprep", (container) => {
    ensureStyle();

    // Visible error banner (helps on iPad)
    function showErr(msg) {
      const el = container.querySelector(".err");
      if (!el) return;
      el.textContent = msg;
      el.style.display = "block";
    }
    function clearErr() {
      const el = container.querySelector(".err");
      if (!el) return;
      el.textContent = "";
      el.style.display = "none";
    }

    container.setAttribute("data-app", "imageprintprep");
    container.innerHTML = `
<h3>Image Print Prep</h3>
<div class="muted">Set physical size + DPI → export JPG/PNG/WebP or a true PDF. Optional bleed + crop/fit + fill.</div>
<div class="err"></div>

<div class="drop">Tap to Upload Image</div>
<input class="file" type="file" accept="image/*" style="display:none">

<div class="row">
  <label>Preset <select class="preset"></select></label>

  <label class="check">
    <input class="orientation" type="checkbox"> Landscape
  </label>

  <label>Units
    <select class="units">
      <option value="mm">mm</option>
      <option value="in">in</option>
      <option value="px">px</option>
    </select>
  </label>

  <label>Width <input class="w" type="number" step="0.01" value="210"></label>
  <label>Height <input class="h" type="number" step="0.01" value="297"></label>
  <label>DPI <input class="dpi" type="number" step="1" value="300"></label>

  <label class="check">
    <input class="lock" type="checkbox" checked> Lock aspect ratio
  </label>
</div>

<div class="row">
  <label>Fit mode
    <select class="mode">
      <option value="contain">Fit (contain) — no crop</option>
      <option value="cover">Fill (cover) — crop</option>
    </select>
  </label>

  <label>Fill
    <select class="fill">
      <option value="white">White</option>
      <option value="black">Black</option>
      <option value="auto">Auto (from image)</option>
      <option value="custom">Custom colour</option>
      <option value="blur">Edge-blur fill</option>
    </select>
  </label>

  <label class="customWrap" style="display:none">Colour
    <input class="custom" type="color" value="#ffffff">
  </label>

  <label class="blurWrap" style="display:none">Blur strength
    <input class="blur" type="number" step="1" min="0" max="80" value="28">
  </label>

  <label class="check">
    <input class="guides" type="checkbox" checked> Show trim guides
  </label>
</div>

<div class="row">
  <label class="check">
    <input class="bleedOn" type="checkbox"> Include bleed
  </label>

  <label>Bleed (mm)
    <input class="bleedMm" type="number" step="0.1" value="3" disabled>
  </label>

  <span class="pill pxInfo">—</span>
  <span class="pill memInfo">—</span>
</div>

<div class="btnrow">
  <button class="primary gen">Generate</button>

  <label style="display:flex;flex-direction:column;gap:6px;font-weight:900;font-size:12px;">
    Export
    <select class="format">
      <option value="image/jpeg">JPG</option>
      <option value="image/png">PNG</option>
      <option value="image/webp">WebP</option>
      <option value="pdf">PDF</option>
    </select>
  </label>

  <label style="display:flex;flex-direction:column;gap:6px;font-weight:900;font-size:12px;">
    Quality (JPG/WebP)
    <input class="quality" type="number" min="0.1" max="1" step="0.05" value="0.95">
  </label>

  <button class="dl">Download</button>
</div>

<canvas class="cv"></canvas>
`;

    const $ = (sel) => container.querySelector(sel);

    const drop = $(".drop");
    const file = $(".file");

    const preset = $(".preset");
    const orientationToggle = $(".orientation");
    const units = $(".units");
    const wInp = $(".w");
    const hInp = $(".h");
    const dpiInp = $(".dpi");
    const lock = $(".lock");

    const modeSel = $(".mode");
    const fillSel = $(".fill");
    const customWrap = $(".customWrap");
    const customCol = $(".custom");
    const blurWrap = $(".blurWrap");
    const blurInp = $(".blur");

    const guides = $(".guides");
    const bleedOn = $(".bleedOn");
    const bleedMm = $(".bleedMm");

    const pxInfo = $(".pxInfo");
    const memInfo = $(".memInfo");

    const genBtn = $(".gen");
    const formatSel = $(".format");
    const qualityInp = $(".quality");
    const dlBtn = $(".dl");

    const canvas = $(".cv");
    const ctx = canvas.getContext("2d");

    let img = null;
    let imgAspect = null;

    // Presets
    PRESETS.forEach((p) => {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = p.name;
      preset.appendChild(opt);
    });
    preset.value = "a4";

    function currentUnits() { return units.value; }

    function getTrimSizeInInches() {
      const u = currentUnits();
      const w = toNum(wInp.value, 0);
      const h = toNum(hInp.value, 0);

      if (u === "px") {
        const dpi = Math.max(1, toNum(dpiInp.value, 300));
        return { wIn: w / dpi, hIn: h / dpi };
      }
      if (u === "mm") return { wIn: mmToIn(w), hIn: mmToIn(h) };
      return { wIn: w, hIn: h };
    }

    function getBleedInInches() {
      if (!bleedOn.checked) return 0;
      return mmToIn(Math.max(0, toNum(bleedMm.value, 0)));
    }

    function computeCanvasPixels() {
      const dpi = Math.max(1, toNum(dpiInp.value, 300));
      const { wIn, hIn } = getTrimSizeInInches();
      const bIn = getBleedInInches();
      const fullWIn = wIn + 2 * bIn;
      const fullHIn = hIn + 2 * bIn;
      const pxW = Math.round(fullWIn * dpi);
      const pxH = Math.round(fullHIn * dpi);
      return { pxW, pxH, dpi, wIn, hIn, bIn };
    }

    function updatePxInfo() {
      const { pxW, pxH, dpi, wIn, hIn, bIn } = computeCanvasPixels();
      const u = currentUnits();

      const trimText =
        u === "px"
          ? `Trim: ${Math.round(toNum(wInp.value, 0))}×${Math.round(toNum(hInp.value, 0))} px @ ${dpi}dpi`
          : `Trim: ${wIn.toFixed(2)}×${hIn.toFixed(2)} in @ ${dpi}dpi`;

      const bleedText = bIn > 0 ? ` • Bleed: ${inToMm(bIn).toFixed(1)}mm` : "";
      pxInfo.textContent = `${trimText} → Output: ${pxW}×${pxH} px${bleedText}`;

      const mp = (pxW * pxH) / 1_000_000;
      const approxMB = (pxW * pxH * 4) / (1024 * 1024);

      let cls = "pill good memInfo";
      let msg = `Canvas: ${mp.toFixed(1)}MP (~${approxMB.toFixed(0)}MB raw)`;
      if (mp > 80 || pxW > 12000 || pxH > 12000) {
        cls = "pill warn memInfo";
        msg = `Warning: ${mp.toFixed(1)}MP — may fail on iPad Safari`;
      } else if (mp > 50) {
        cls = "pill warn memInfo";
        msg = `Large: ${mp.toFixed(1)}MP — may be slow on iPad`;
      }
      memInfo.className = cls;
      memInfo.textContent = msg;
    }

    function applyPreset(id) {
      const p = PRESETS.find((x) => x.id === id);
      if (!p || id === "custom") return;

      if (p.wMm && p.hMm) {
        units.value = "mm";
        let wVal = p.wMm, hVal = p.hMm;
        if (orientationToggle.checked) [wVal, hVal] = [hVal, wVal];
        wInp.value = String(wVal);
        hInp.value = String(hVal);
      } else if (p.wIn && p.hIn) {
        units.value = "in";
        let wVal = p.wIn, hVal = p.hIn;
        if (orientationToggle.checked) [wVal, hVal] = [hVal, wVal];
        wInp.value = String(wVal);
        hInp.value = String(hVal);
      }
      updatePxInfo();
    }

    function swapWidthHeight() {
      const w = wInp.value;
      const h = hInp.value;
      wInp.value = h;
      hInp.value = w;
      updatePxInfo();
      if (img) draw();
    }

    function setAspectLockedFromImageIfNeeded() {
      if (!img || !lock.checked) return;
      imgAspect = img.width / img.height;
      const u = currentUnits();
      const w = toNum(wInp.value, 0);
      if (w <= 0 || !imgAspect) return;
      const newH = w / imgAspect;
      hInp.value = String(u === "px" ? Math.round(newH) : newH.toFixed(2));
    }

    function setAspectLockedFromHeightIfNeeded() {
      if (!img || !lock.checked) return;
      imgAspect = img.width / img.height;
      const u = currentUnits();
      const h = toNum(hInp.value, 0);
      if (h <= 0 || !imgAspect) return;
      const newW = h * imgAspect;
      wInp.value = String(u === "px" ? Math.round(newW) : newW.toFixed(2));
    }

    function drawGuides(pxW, pxH, trimInsetPx) {
      if (!guides.checked) return;
      ctx.save();
      ctx.lineWidth = Math.max(2, Math.round(Math.min(pxW, pxH) * 0.002));
      ctx.setLineDash([ctx.lineWidth * 2, ctx.lineWidth * 2]);
      ctx.strokeStyle = "rgba(0,0,0,.45)";
      ctx.strokeRect(
        trimInsetPx + 0.5,
        trimInsetPx + 0.5,
        pxW - 2 * trimInsetPx - 1,
        pxH - 2 * trimInsetPx - 1
      );
      ctx.restore();
    }

    function draw() {
      clearErr();
      if (!img) return;

      const { pxW, pxH, dpi, bIn } = computeCanvasPixels();
      const trimInsetPx = Math.round(bIn * dpi);

      canvas.width = pxW;
      canvas.height = pxH;

      const fillMode = fillSel.value;

      if (fillMode === "white") {
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, pxW, pxH);
      } else if (fillMode === "black") {
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, pxW, pxH);
      } else if (fillMode === "custom") {
        ctx.fillStyle = customCol.value || "#fff";
        ctx.fillRect(0, 0, pxW, pxH);
      } else if (fillMode === "auto") {
        ctx.fillStyle = avgColourFromImage(img);
        ctx.fillRect(0, 0, pxW, pxH);
      } else if (fillMode === "blur") {
        ctx.save();
        const bgRatio = Math.max(pxW / img.width, pxH / img.height);
        const bgW = img.width * bgRatio;
        const bgH = img.height * bgRatio;
        const bgX = (pxW - bgW) / 2;
        const bgY = (pxH - bgH) / 2;
        const blurPx = clamp(toNum(blurInp.value, 28), 0, 80);
        ctx.filter = blurPx ? `blur(${blurPx}px)` : "none";
        ctx.drawImage(img, bgX, bgY, bgW, bgH);
        ctx.restore();
        ctx.fillStyle = "rgba(255,255,255,.08)";
        ctx.fillRect(0, 0, pxW, pxH);
      } else {
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, pxW, pxH);
      }

      const mode = modeSel.value;
      const ratio =
        mode === "cover"
          ? Math.max(pxW / img.width, pxH / img.height)
          : Math.min(pxW / img.width, pxH / img.height);

      const drawW = img.width * ratio;
      const drawH = img.height * ratio;
      const x = (pxW - drawW) / 2;
      const y = (pxH - drawH) / 2;

      ctx.drawImage(img, x, y, drawW, drawH);

      if (trimInsetPx > 0) drawGuides(pxW, pxH, trimInsetPx);

      updatePxInfo();
    }

    // UI wiring
    drop.addEventListener("click", () => file.click());

    file.addEventListener("change", () => {
      clearErr();
      const f = file.files && file.files[0];
      if (!f) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const im = new Image();
        im.onload = () => {
          img = im;
          imgAspect = img.width / img.height;
          setAspectLockedFromImageIfNeeded();
          updatePxInfo();
          draw();
        };
        im.onerror = () => showErr("Couldn’t load that image.");
        im.src = e.target.result;
      };
      reader.onerror = () => showErr("Couldn’t read that file.");
      reader.readAsDataURL(f);
    });

    preset.addEventListener("change", () => applyPreset(preset.value));

    orientationToggle.addEventListener("change", () => swapWidthHeight());

    units.addEventListener("change", () => {
      const dpi = Math.max(1, toNum(dpiInp.value, 300));
      const u = currentUnits();

      // Convert by interpreting current entries as inches (from helper)
      const { wIn, hIn } = getTrimSizeInInches();

      if (u === "px") {
        wInp.value = String(Math.round(wIn * dpi));
        hInp.value = String(Math.round(hIn * dpi));
      } else if (u === "mm") {
        wInp.value = String(inToMm(wIn).toFixed(2));
        hInp.value = String(inToMm(hIn).toFixed(2));
      } else {
        wInp.value = String(wIn.toFixed(2));
        hInp.value = String(hIn.toFixed(2));
      }

      updatePxInfo();
      if (img && lock.checked) setAspectLockedFromImageIfNeeded();
      if (img) draw();
    });

    wInp.addEventListener("input", () => {
      if (img && lock.checked) setAspectLockedFromImageIfNeeded();
      updatePxInfo();
    });

    hInp.addEventListener("input", () => {
      if (img && lock.checked) setAspectLockedFromHeightIfNeeded();
      updatePxInfo();
    });

    dpiInp.addEventListener("input", updatePxInfo);

    lock.addEventListener("change", () => {
      if (img && lock.checked) setAspectLockedFromImageIfNeeded();
      updatePxInfo();
      if (img) draw();
    });

    fillSel.addEventListener("change", () => {
      customWrap.style.display = fillSel.value === "custom" ? "block" : "none";
      blurWrap.style.display = fillSel.value === "blur" ? "block" : "none";
      if (img) draw();
    });

    customCol.addEventListener("input", () => {
      if (img && fillSel.value === "custom") draw();
    });

    blurInp.addEventListener("input", () => {
      if (img && fillSel.value === "blur") draw();
    });

    bleedOn.addEventListener("change", () => {
      bleedMm.disabled = !bleedOn.checked;
      updatePxInfo();
      if (img) draw();
    });

    bleedMm.addEventListener("input", () => {
      updatePxInfo();
      if (img) draw();
    });

    modeSel.addEventListener("change", () => { if (img) draw(); });
    guides.addEventListener("change", () => { if (img) draw(); });

    genBtn.addEventListener("click", () => { if (img) draw(); });

    dlBtn.addEventListener("click", async () => {
      clearErr();
      if (!img) { showErr("Upload an image first."); return; }

      draw();

      const fmt = formatSel.value;
      const q = clamp(toNum(qualityInp.value, 0.95), 0.1, 1);

      if (fmt === "pdf") {
        let JsPDF;
        try {
          JsPDF = await ensureJsPDF();
        } catch (e) {
          showErr("Couldn’t load the PDF library. Check your connection and try again.");
          return;
        }

        const jpgData = canvas.toDataURL("image/jpeg", 1.0);
        const pdf = new JsPDF({
          orientation: canvas.width >= canvas.height ? "landscape" : "portrait",
          unit: "px",
          format: [canvas.width, canvas.height],
          compress: true,
        });
        pdf.addImage(jpgData, "JPEG", 0, 0, canvas.width, canvas.height, undefined, "FAST");
        pdf.save("print-ready.pdf");
        return;
      }

      canvas.toBlob(
        (blob) => {
          if (!blob) { showErr("Couldn’t create the image file."); return; }
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;

          const ext =
            fmt === "image/png" ? "png" :
            fmt === "image/webp" ? "webp" : "jpg";

          a.download = `print-ready.${ext}`;
          a.click();
          setTimeout(() => URL.revokeObjectURL(url), 800);
        },
        fmt,
        q
      );
    });

    // Init state
    applyPreset("a4");
    updatePxInfo();
    customWrap.style.display = "none";
    blurWrap.style.display = "none";
  });
})();
