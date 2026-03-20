(() => {
  "use strict";

  // Ensure registry exists
  window.SiteApps = window.SiteApps || {};
  window.SiteApps.registry = window.SiteApps.registry || {};
  window.SiteApps.register =
    window.SiteApps.register ||
    function (name, initFn) {
      window.SiteApps.registry[name] = initFn;
    };

  const STYLE_ID = "siteapps-mdpreview-style-v2";

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
[data-app="mdpreview"] .top-row{
  display:flex;
  align-items:baseline;
  justify-content:space-between;
  gap:10px;
  flex-wrap:wrap;
  margin-bottom:10px;
}
[data-app="mdpreview"] h3{ margin:0; font-size:20px; font-weight:900; }
[data-app="mdpreview"] .badge{
  font-size:14px;
  font-weight:900;
  padding:6px 10px;
  border:2px solid #111;
  border-radius:999px;
  background:#fff;
}
[data-app="mdpreview"] .badge.good{ border-color:#0b3d0b; color:#0b3d0b; }
[data-app="mdpreview"] .badge.warn{ border-color:#7a0000; color:#7a0000; }

[data-app="mdpreview"] label{ display:block; margin:10px 0 6px; font-weight:900; font-size:14px; }
[data-app="mdpreview"] textarea{
  width:100%;
  min-height:200px;
  padding:12px;
  border:2px solid #111;
  border-radius:10px;
  font-family:ui-monospace,SFMono-Regular,monospace;
  font-size:15px;
  line-height:1.4;
  box-sizing: border-box;
}

[data-app="mdpreview"] .preview-pane{
  width:100%;
  min-height:100px;
  padding:12px;
  border:2px solid #111;
  border-radius:10px;
  background:#fafafa;
  margin-top:10px;
  line-height:1.6;
  box-sizing: border-box;
}

[data-app="mdpreview"] .controls{
  display:flex;
  flex-wrap:wrap;
  gap:10px;
  margin:15px 0;
}
[data-app="mdpreview"] button{
  border:2px solid #111;
  border-radius:10px;
  cursor:pointer;
  padding:10px 14px;
  font-weight:900;
  font-size:14px;
  background:#fff;
}
[data-app="mdpreview"] .btn-primary{ background:#0b5fff; color:#fff; border-color:#0b5fff; }
[data-app="mdpreview"] .btn-save{ background:#0b7a2b; color:#fff; border-color:#0b7a2b; }
[data-app="mdpreview"] .btn-clear{ color:#7a0000; border-color:#7a0000; }

[data-app="mdpreview"] blockquote { border-left: 4px solid #111; padding-left: 10px; margin-left: 0; font-style: italic; }
[data-app="mdpreview"] code { background: #eee; padding: 2px 4px; border-radius: 4px; }
`;
    document.head.appendChild(style);
  }

  function simpleParse(md) {
    if (!md) return "<em>No content to preview...</em>";
    return md
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/`(.*)`/gim, '<code>$1</code>')
      .replace(/\n/gim, '<br>');
  }

  window.SiteApps.register("mdpreview", (container) => {
    ensureStyle();

    const storageKey = `siteapps:mdpreview:${container.getAttribute("data-storage-key") || "main"}`;

    container.innerHTML = `
      <div class="top-row">
        <h3>Markdown Previewer</h3>
        <div class="status-row">
          <span class="badge good" id="status-badge">Ready</span>
        </div>
      </div>

      <label>Markdown Editor:</label>
      <textarea id="md-input" placeholder="Type your # Markdown here..."></textarea>

      <div class="controls">
        <button class="btn-primary" id="btn-render">👁️ Update Preview</button>
        <button class="btn-save" id="btn-export">💾 Download .md</button>
        <button class="btn-clear" id="btn-clear">🗑️ Clear</button>
      </div>

      <label>Rendered View:</label>
      <div class="preview-pane" id="md-output"></div>
    `;

    const input = container.querySelector("#md-input");
    const output = container.querySelector("#md-output");
    const badge = container.querySelector("#status-badge");

    // Persist to localStorage
    const saveToStorage = () => {
      localStorage.setItem(storageKey, input.value);
      badge.textContent = "Saved ✓";
      badge.className = "badge good";
    };

    const render = () => {
      output.innerHTML = simpleParse(input.value);
      saveToStorage();
    };

    // Events
    container.querySelector("#btn-render").onclick = render;

    container.querySelector("#btn-export").onclick = () => {
      const blob = new Blob([input.value], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "document.md";
      a.click();
      URL.revokeObjectURL(url);
    };

    container.querySelector("#btn-clear").onclick = () => {
      if (confirm("Are you sure you want to clear all text?")) {
        input.value = "";
        render();
      }
    };

    // Tracking changes
    input.oninput = () => {
      badge.textContent = "Unsaved changes";
      badge.className = "badge warn";
    };

    // Restore State
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      input.value = saved;
      render();
    }
  });
})();
