(() => {
  "use strict";

  const STYLE_ID = "siteapps-md-v3";

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      [data-app="md-editor"] {
        font-family: -apple-system, system-ui, sans-serif;
        background: #fff;
        border: 2px solid #111;
        padding: 20px;
        border-radius: 14px;
        color: #111;
        max-width: 800px;
        margin: 20px auto;
        box-shadow: 4px 4px 0px #111;
      }
      [data-app="md-editor"] h3 { margin-top: 0; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; }
      [data-app="md-editor"] textarea {
        width: 100%;
        height: 200px;
        padding: 12px;
        border: 2px solid #111;
        border-radius: 8px;
        font-family: monospace;
        font-size: 15px;
        box-sizing: border-box;
        outline: none;
      }
      [data-app="md-editor"] .controls {
        display: flex;
        gap: 10px;
        margin: 15px 0;
        flex-wrap: wrap;
      }
      [data-app="md-editor"] button {
        padding: 10px 15px;
        font-weight: 900;
        border: 2px solid #111;
        border-radius: 8px;
        cursor: pointer;
        background: #fff;
        transition: transform 0.1s;
      }
      [data-app="md-editor"] button:active { transform: translateY(2px); }
      [data-app="md-editor"] .btn-primary { background: #00ff62; }
      [data-app="md-editor"] .btn-save { background: #0084ff; color: #fff; }
      [data-app="md-editor"] .preview-pane {
        border: 2px solid #111;
        background: #fdfdfd;
        padding: 15px;
        border-radius: 8px;
        min-height: 50px;
        line-height: 1.5;
      }
      [data-app="md-editor"] blockquote { border-left: 5px solid #111; margin-left: 0; padding-left: 15px; font-style: italic; }
    `;
    document.head.appendChild(style);
  }

  function parseMd(text) {
    if (!text.trim()) return "<em>Preview will appear here...</em>";
    return text
      .replace(/&/g, "&amp;").replace(/</g, "&lt;") 
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/\n/gim, '<br>');
  }

  function initApp(container) {
    if (!container || container.getAttribute('data-initialized')) return;
    ensureStyle();

    const storageKey = `md_store_${container.getAttribute("data-storage-key") || "default"}`;

    container.innerHTML = `
      <h3>Markdown Note</h3>
      <textarea placeholder="Write something in # Markdown..."></textarea>
      <div class="controls">
        <button class="btn-primary" id="ref-btn">Update Preview</button>
        <button class="btn-save" id="dl-btn">Save to File (.md)</button>
        <button id="clr-btn">Clear</button>
      </div>
      <div class="preview-pane"></div>
    `;

    const area = container.querySelector('textarea');
    const prev = container.querySelector('.preview-pane');

    // Load
    const saved = localStorage.getItem(storageKey);
    if (saved) area.value = saved;

    const refresh = () => {
      prev.innerHTML = parseMd(area.value);
      localStorage.setItem(storageKey, area.value);
    };

    container.querySelector('#ref-btn').onclick = refresh;
    
    container.querySelector('#clr-btn').onclick = () => {
      if(confirm("Delete everything?")) { area.value = ""; refresh(); }
    };

    container.querySelector('#dl-btn').onclick = () => {
      const blob = new Blob([area.value], {type: "text/markdown"});
      const a = Object.assign(document.createElement('a'), {
        href: URL.createObjectURL(blob),
        download: "markdown-note.md"
      });
      a.click();
    };

    // Auto-save typing (but no live preview to prevent errors)
    area.oninput = () => localStorage.setItem(storageKey, area.value);

    container.setAttribute('data-initialized', 'true');
    refresh();
  }

  // BOOTSTRAPPER: This ensures it runs even if your loader doesn't call it.
  const run = () => {
    document.querySelectorAll('[data-app="md-editor"]').forEach(initApp);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }

})();
