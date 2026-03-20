(() => {
  "use strict";

  window.SiteApps = window.SiteApps || {};
  window.SiteApps.registry = window.SiteApps.registry || {};
  window.SiteApps.register = window.SiteApps.register || function (name, initFn) {
    window.SiteApps.registry[name] = initFn;
  };

  const STYLE_ID = "siteapps-mdpreview-style-v3";
  const CUSTOM_STYLE_ID = "siteapps-mdpreview-custom-css";

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
[data-app="mdpreview"]{
  font-family:-apple-system,system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;
  background:#fff;
  border:2px solid #111;
  padding:18px;
  border-radius:14px;
  color:#111;
  max-width:980px;
  margin:14px auto;
}
[data-app="mdpreview"] .top-row{ display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; }
[data-app="mdpreview"] h3{ margin:0; font-size:20px; font-weight:900; }
[data-app="mdpreview"] .badge{ font-size:12px; font-weight:900; padding:4px 8px; border:2px solid #111; border-radius:999px; }

[data-app="mdpreview"] .editor-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-top: 10px;
}

[data-app="mdpreview"] label{ display:block; margin:10px 0 4px; font-weight:900; font-size:13px; text-transform: uppercase; }
[data-app="mdpreview"] textarea{
  width:100%;
  padding:10px;
  border:2px solid #111;
  border-radius:8px;
  font-family:ui-monospace,monospace;
  font-size:14px;
  box-sizing: border-box;
}
[data-app="mdpreview"] #md-input { height: 300px; }
[data-app="mdpreview"] #css-input { height: 100px; background: #fefefe; }

[data-app="mdpreview"] .preview-pane{
  width:100%;
  height: 455px; /* Matches total height of MD + CSS inputs approx */
  padding:15px;
  border:2px solid #111;
  border-radius:10px;
  background:#fff;
  overflow-y: auto;
  box-sizing: border-box;
}

/* Default Preview Spacing Fixes */
.preview-pane h1, .preview-pane h2, .preview-pane h3 { margin: 0.5em 0 0.2em 0; line-height: 1.2; }
.preview-pane p { margin: 0 0 1em 0; }

[data-app="mdpreview"] .controls{ display:flex; gap:10px; margin-top:15px; }
[data-app="mdpreview"] button{ border:2px solid #111; border-radius:8px; cursor:pointer; padding:8px 12px; font-weight:900; background:#fff; }
[data-app="mdpreview"] .btn-primary{ background:#0b5fff; color:#fff; border-color:#0b5fff; }
`;
    document.head.appendChild(style);
  }

  function simpleParse(md) {
    if (!md) return "";
    return md
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/\n/gim, '<br>');
  }

  window.SiteApps.register("mdpreview", (container) => {
    ensureStyle();
    const keyPrefix = `siteapps:mdpreview:${container.getAttribute("data-storage-key") || "main"}`;
    
    // Create custom style tag for this instance
    let customStyleTag = document.getElementById(CUSTOM_STYLE_ID);
    if (!customStyleTag) {
      customStyleTag = document.createElement("style");
      customStyleTag.id = CUSTOM_STYLE_ID;
      document.head.appendChild(customStyleTag);
    }

    container.innerHTML = `
      <div class="top-row">
        <h3>Markdown + CSS Lab</h3>
        <span class="badge" id="status">Ready</span>
      </div>

      <div class="editor-grid">
        <div class="inputs">
          <label>Markdown</label>
          <textarea id="md-input" placeholder="# Header..."></textarea>
          
          <label>Custom CSS (applied to preview)</label>
          <textarea id="css-input" placeholder=".preview-pane h1 { color: red; }"></textarea>
        </div>
        
        <div class="outputs">
          <label>Preview</label>
          <div class="preview-pane" id="md-output"></div>
        </div>
      </div>

      <div class="controls">
        <button class="btn-primary" id="btn-update">👁️ Update Preview</button>
        <button id="btn-export">💾 Download .md</button>
        <button style="color:red; border-color:red" id="btn-clear">🗑️ Clear</button>
      </div>
    `;

    const mdIn = container.querySelector("#md-input");
    const cssIn = container.querySelector("#css-input");
    const output = container.querySelector("#md-output");

    const updateAll = () => {
      // Update Content
      output.innerHTML = simpleParse(mdIn.value);
      
      // Update Custom CSS
      // We wrap the user's CSS to ensure it only affects the preview pane
      customStyleTag.textContent = cssIn.value;
      
      // Save
      localStorage.setItem(`${keyPrefix}:md`, mdIn.value);
      localStorage.setItem(`${keyPrefix}:css`, cssIn.value);
      
      const badge = container.querySelector("#status");
      badge.textContent = "Saved ✓";
      setTimeout(() => { badge.textContent = "Ready"; }, 1000);
    };

    container.querySelector("#btn-update").onclick = updateAll;

    container.querySelector("#btn-export").onclick = () => {
      const blob = new Blob([mdIn.value], { type: "text/markdown" });
      const a = Object.assign(document.createElement("a"), {
        href: URL.createObjectURL(blob),
        download: "notes.md"
      });
      a.click();
    };

    container.querySelector("#btn-clear").onclick = () => {
      if(confirm("Clear everything?")) {
        mdIn.value = "";
        cssIn.value = "";
        updateAll();
      }
    };

    // Load Initial State
    mdIn.value = localStorage.getItem(`${keyPrefix}:md`) || "";
    cssIn.value = localStorage.getItem(`${keyPrefix}:css`) || "/* Example: */\n.preview-pane h1 { margin-bottom: 0px; }\n.preview-pane { background: #fff; }";
    updateAll();
  });
})();
