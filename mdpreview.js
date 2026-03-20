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

  const STYLE_ID = "siteapps-md-editor-style-v1";

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
/* Markdown Editor — high contrast + dual pane */
[data-app="md-editor"]{
  font-family:-apple-system,system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;
  background:#fff;
  border:2px solid #111;
  padding:18px;
  border-radius:14px;
  color:#111;
  max-width:1100px;
  margin:14px auto;
}
[data-app="md-editor"] .top-row{
  display:flex;
  align-items:baseline;
  justify-content:space-between;
  gap:10px;
  flex-wrap:wrap;
  margin-bottom:15px;
}
[data-app="md-editor"] h3{ margin:0; font-size:20px; font-weight:900; }

[data-app="md-editor"] .badge{
  font-size:14px;
  font-weight:900;
  padding:6px 10px;
  border:2px solid #111;
  border-radius:999px;
  background:#fff;
}
[data-app="md-editor"] .badge.good{ border-color:#0b3d0b; color:#0b3d0b; }
[data-app="md-editor"] .badge.dim{ border-color:#444; color:#444; }

/* Grid Layout */
[data-app="md-editor"] .editor-grid{
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 10px;
}

[data-app="md-editor"] .pane-label{
  font-weight: 900;
  font-size: 14px;
  margin-bottom: 6px;
  display: block;
}

[data-app="md-editor"] textarea, 
[data-app="md-editor"] .preview-area{
  width: 100%;
  height: 400px;
  padding: 12px;
  border: 2px solid #111;
  border-radius: 10px;
  font-size: 15px;
  overflow-y: auto;
  box-sizing: border-box;
}

[data-app="md-editor"] textarea{
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  line-height: 1.4;
  resize: vertical;
}

[data-app="md-editor"] .preview-area{
  background: #f9f9f9;
  line-height: 1.6;
}

/* Basic Preview Styling */
[data-app="md-editor"] .preview-area h1{ border-bottom: 2px solid #111; padding-bottom: 5px; }
[data-app="md-editor"] .preview-area code{ background: #eee; padding: 2px 4px; border-radius: 4px; }
[data-app="md-editor"] .preview-area blockquote{ border-left: 4px solid #111; margin: 0; padding-left: 15px; font-style: italic; }

[data-app="md-editor"] .actions{
  display: flex;
  gap: 10px;
  margin-top: 15px;
  flex-wrap: wrap;
}

[data-app="md-editor"] button{
  border: 2px solid #111;
  border-radius: 10px;
  cursor: pointer;
  padding: 10px 16px;
  font-weight: 900;
  font-size: 14px;
  background: #fff;
}

[data-app="md-editor"] .btn-save{ background: #0b5fff; color: #fff; border-color: #0b5fff; }
[data-app="md-editor"] .btn-clear{ color: #7a0000; border-color: #7a0000; }

@media (max-width: 800px){
  [data-app="md-editor"] .editor-grid { grid-template-columns: 1fr; }
  [data-app="md-editor"] textarea, [data-app="md-editor"] .preview-area { height: 300px; }
}
`;
    document.head.appendChild(style);
  }

  // A very lightweight MD parser
  function simpleMarkdownParse(md) {
    let html = md
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") // Sanitize
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
      .replace(/\*\*(.*)\*\*/gim, '<b>$1</b>')
      .replace(/\*(.*)\*/gim, '<i>$1</i>')
      .replace(/`(.*)`/gim, '<code>$1</code>')
      .replace(/\n$/gim, '<br />')
      .replace(/\n/gim, '<br />');
    return html.trim();
  }

  window.SiteApps.register("md-editor", (container) => {
    ensureStyle();
    
    const storageKey = `siteapps:mdeditor:${container.getAttribute("data-storage-key") || "default"}`;
    let saveTimer = null;

    // UI Construction
    container.innerHTML = `
      <div class="top-row">
        <h3>Markdown Live Editor</h3>
        <div class="status-row">
          <span class="badge dim" id="save-status">Saved ✓</span>
        </div>
      </div>
      
      <div class="editor-grid">
        <div>
          <label class="pane-label">Markdown Input</label>
          <textarea id="md-input" placeholder="Type # Header to start..."></textarea>
        </div>
        <div>
          <label class="pane-label">Live Preview</label>
          <div id="md-preview" class="preview-area"></div>
        </div>
      </div>

      <div class="actions">
        <button class="btn-save" id="btn-download">💾 Download .md File</button>
        <button class="btn-clear" id="btn-clear">🗑️ Clear</button>
      </div>
    `;

    const input = container.querySelector("#md-input");
    const preview = container.querySelector("#md-preview");
    const status = container.querySelector("#save-status");
    const downloadBtn = container.querySelector("#btn-download");
    const clearBtn = container.querySelector("#btn-clear");

    function updatePreview() {
      preview.innerHTML = simpleMarkdownParse(input.value);
    }

    function saveState() {
      try {
        localStorage.setItem(storageKey, JSON.stringify({ content: input.value }));
        status.className = "badge good";
        status.textContent = "Saved ✓";
      } catch (e) {
        status.textContent = "Error Saving";
      }
    }

    function triggerAutoSave() {
      status.className = "badge dim";
      status.textContent = "Typing...";
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(saveState, 800);
    }

    function downloadFile() {
      const blob = new Blob([input.value], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "document.md";
      a.click();
      URL.revokeObjectURL(url);
    }

    // Events
    input.addEventListener("input", () => {
      updatePreview();
      triggerAutoSave();
    });

    downloadBtn.addEventListener("click", downloadFile);

    clearBtn.addEventListener("click", () => {
      if (confirm("Clear all text?")) {
        input.value = "";
        updatePreview();
        saveState();
      }
    });

    // Initial Load
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      if (saved && saved.content) {
        input.value = saved.content;
      }
    } catch (e) {}
    
    updatePreview();
  });
})();
