(() => {
  "use strict";

  window.SiteApps = window.SiteApps || {};
  window.SiteApps.registry = window.SiteApps.registry || {};
  window.SiteApps.register = window.SiteApps.register || function (name, initFn) {
    window.SiteApps.registry[name] = initFn;
  };

  const STYLE_ID = "siteapps-md-manual-v2";

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
[data-app="md-editor"]{
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: #fff;
  border: 2px solid #111;
  padding: 20px;
  border-radius: 12px;
  color: #111;
  max-width: 900px;
  margin: 20px auto;
}
[data-app="md-editor"] .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
[data-app="md-editor"] h3 { margin: 0; font-weight: 900; }
[data-app="md-editor"] textarea {
  width: 100%;
  height: 250px;
  padding: 12px;
  border: 2px solid #111;
  border-radius: 8px;
  font-family: "SF Mono", "Monaco", "Inconsolata", monospace;
  font-size: 14px;
  box-sizing: border-box;
  display: block;
}
[data-app="md-editor"] .preview-box {
  margin-top: 20px;
  padding: 15px;
  border: 2px dashed #ccc;
  border-radius: 8px;
  background: #fafafa;
  min-height: 100px;
}
[data-app="md-editor"] .controls {
  display: flex;
  gap: 10px;
  margin-top: 15px;
  flex-wrap: wrap;
}
[data-app="md-editor"] button {
  padding: 10px 18px;
  font-weight: 800;
  border: 2px solid #111;
  border-radius: 8px;
  cursor: pointer;
  background: #fff;
}
[data-app="md-editor"] .btn-primary { background: #111; color: #fff; }
[data-app="md-editor"] .btn-save { background: #0066ff; color: #fff; border-color: #0066ff; }
[data-app="md-editor"] .status { font-size: 12px; font-weight: bold; color: #666; }
`;
    document.head.appendChild(style);
  }

  function parseMarkdown(text) {
    if (!text) return "<em>Nothing to preview...</em>";
    return text
      .replace(/&/g, "&amp;").replace(/</g, "&lt;") // Basic safety
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/\n/gim, '<br>');
  }

  window.SiteApps.register("md-editor", (container) => {
    if (!container) return;
    ensureStyle();

    const storageKey = `siteapps:md:${container.getAttribute("data-storage-key") || "main"}`;

    container.innerHTML = `
      <div class="header">
        <h3>Markdown Editor</h3>
        <span class="status" id="status-msg">All changes saved</span>
      </div>
      
      <textarea id="md-input" placeholder="Enter markdown here..."></textarea>
      
      <div class="controls">
        <button class="btn-primary" id="btn-refresh">🔄 Refresh Preview</button>
        <button class="btn-save" id="btn-download">💾 Download .md</button>
        <button id="btn-clear">🗑️ Clear</button>
      </div>

      <div class="preview-box" id="md-preview"></div>
    `;

    const input = container.querySelector("#md-input");
    const preview = container.querySelector("#md-preview");
    const status = container.querySelector("#status-msg");

    // Load saved data
    const savedData = localStorage.getItem(storageKey);
    if (savedData) input.value = savedData;

    const refreshPreview = () => {
      preview.innerHTML = parseMarkdown(input.value);
    };

    const saveToLocal = () => {
      localStorage.setItem(storageKey, input.value);
      status.textContent = "Saved to browser ✓";
      setTimeout(() => { status.textContent = "All changes saved"; }, 2000);
    };

    // Button Events
    container.querySelector("#btn-refresh").onclick = refreshPreview;

    container.querySelector("#btn-clear").onclick = () => {
      if (confirm("Clear everything?")) {
        input.value = "";
        refreshPreview();
        saveToLocal();
      }
    };

    container.querySelector("#btn-download").onclick = () => {
      const blob = new Blob([input.value], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "notes.md";
      a.click();
      URL.revokeObjectURL(url);
    };

    // Auto-save content while typing (without refreshing preview)
    let debounce;
    input.oninput = () => {
      clearTimeout(debounce);
      debounce = setTimeout(saveToLocal, 500);
    };

    // Initial render
    refreshPreview();
  });
})();
