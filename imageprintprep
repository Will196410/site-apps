(() => {
  "use strict";

  window.SiteApps = window.SiteApps || {};
  window.SiteApps.registry = window.SiteApps.registry || {};
  window.SiteApps.register =
    window.SiteApps.register ||
    function (name, initFn) {
      window.SiteApps.registry[name] = initFn;
    };

  const STYLE_ID = "siteapps-imageprintprep-style";

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
  max-width: 1000px;
  margin: 20px auto;
  border:2px solid #111;
  border-radius:16px;
  padding:20px;
  background:#fff;
}
[data-app="imageprintprep"] h3{ margin:0 0 16px; }

[data-app="imageprintprep"] input,
[data-app="imageprintprep"] select{
  padding:10px;
  border:2px solid #111;
  border-radius:10px;
  font-weight:700;
}

[data-app="imageprintprep"] button{
  padding:10px 14px;
  border:2px solid #111;
  border-radius:10px;
  font-weight:900;
  cursor:pointer;
  background:#fff;
}
[data-app="imageprintprep"] button.primary{
  background:#111;
  color:#fff;
}

[data-app="imageprintprep"] .grid{
  display:grid;
  gap:12px;
  margin-top:16px;
}

[data-app="imageprintprep"] canvas{
  max-width:100%;
  margin-top:20px;
  border:2px solid #111;
  border-radius:10px;
}

[data-app="imageprintprep"] .drop{
  border:3px dashed #111;
  border-radius:14px;
  padding:30px;
  text-align:center;
  font-weight:900;
  cursor:pointer;
  background:#fafafa;
}
`;
  }

  window.SiteApps.register("imageprintprep", (container) => {

    ensureStyle();
    container.setAttribute("data-app","imageprintprep");

    container.innerHTML = `
<h3>Print Preparation Tool (iPad Optimised)</h3>

<div class="drop">Tap to Upload Image</div>
<input type="file" accept="image/*" style="display:none">

<div class="grid">

<label>Output Width (px)
<input type="number" class="outW" value="4000">
</label>

<label>Output Height (px)
<input type="number" class="outH" value="3000">
</label>

<label>
<input type="checkbox" class="contain" checked>
Maintain aspect ratio (letterbox)
</label>

<label>Fill Colour
<select class="fill">
  <option value="white">White</option>
  <option value="black">Black</option>
  <option value="auto">Auto (average image)</option>
  <option value="custom">Custom</option>
</select>
</label>

<input type="color" class="customColour" value="#ffffff" style="display:none">

<label>Export Format
<select class="format">
  <option value="image/jpeg">JPG (print safe)</option>
  <option value="image/png">PNG</option>
  <option value="image/webp">WebP</option>
</select>
</label>

<label>Quality (JPG/WebP)
<input type="number" min="0.1" max="1" step="0.1" value="0.95" class="quality">
</label>

<button class="primary process">Generate</button>
<button class="download">Download</button>

</div>

<canvas></canvas>
`;

    const drop = container.querySelector(".drop");
    const fileInput = container.querySelector("input[type=file]");
    const canvas = container.querySelector("canvas");
    const ctx = canvas.getContext("2d");

    const outW = container.querySelector(".outW");
    const outH = container.querySelector(".outH");
    const contain = container.querySelector(".contain");
    const fillSel = container.querySelector(".fill");
    const customColour = container.querySelector(".customColour");
    const formatSel = container.querySelector(".format");
    const qualityInput = container.querySelector(".quality");
    const processBtn = container.querySelector(".process");
    const downloadBtn = container.querySelector(".download");

    let image = null;

    drop.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", () => {
      if (!fileInput.files[0]) return;
      const reader = new FileReader();
      reader.onload = e => {
        const img = new Image();
        img.onload = () => {
          image = img;
          drawPreview();
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(fileInput.files[0]);
    });

    fillSel.addEventListener("change", () => {
      customColour.style.display = fillSel.value === "custom" ? "block" : "none";
    });

    function getAverageColour(img) {
      const temp = document.createElement("canvas");
      const tctx = temp.getContext("2d");
      temp.width = 50;
      temp.height = 50;
      tctx.drawImage(img,0,0,50,50);
      const data = tctx.getImageData(0,0,50,50).data;
      let r=0,g=0,b=0,count=0;
      for(let i=0;i<data.length;i+=4){
        r+=data[i];
        g+=data[i+1];
        b+=data[i+2];
        count++;
      }
      return `rgb(${Math.round(r/count)},${Math.round(g/count)},${Math.round(b/count)})`;
    }

    function drawPreview(){
      if(!image) return;

      const w = parseInt(outW.value);
      const h = parseInt(outH.value);

      canvas.width = w;
      canvas.height = h;

      let fillColour = "#ffffff";
      if(fillSel.value==="black") fillColour="#000000";
      if(fillSel.value==="custom") fillColour=customColour.value;
      if(fillSel.value==="auto") fillColour=getAverageColour(image);

      ctx.fillStyle = fillColour;
      ctx.fillRect(0,0,w,h);

      let drawW = w;
      let drawH = h;
      let offsetX = 0;
      let offsetY = 0;

      if(contain.checked){
        const ratio = Math.min(w/image.width, h/image.height);
        drawW = image.width * ratio;
        drawH = image.height * ratio;
        offsetX = (w - drawW)/2;
        offsetY = (h - drawH)/2;
      }

      ctx.drawImage(image, offsetX, offsetY, drawW, drawH);
    }

    processBtn.addEventListener("click", drawPreview);

    downloadBtn.addEventListener("click", () => {
      if(!image) return;

      const format = formatSel.value;
      const quality = parseFloat(qualityInput.value) || 0.95;

      canvas.toBlob(blob=>{
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "print-ready-image";
        a.click();
        URL.revokeObjectURL(url);
      }, format, quality);
    });

  });
})();
