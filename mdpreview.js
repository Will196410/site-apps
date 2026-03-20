(() => {
  "use strict";

  // Registry setup
  window.SiteApps = window.SiteApps || {};
  window.SiteApps.registry = window.SiteApps.registry || {};
  window.SiteApps.register = window.SiteApps.register || function (name, initFn) {
    window.SiteApps.registry[name] = initFn;
  };

  const STYLE_ID = "siteapps-mdpreview-style-v1";

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
[data-app="mdpreview"]{
  font-family:-apple-system,system-ui,sans-serif;
  background:#fff;
  border:2px solid #111;
  padding:18px;
  border-radius:14px;
  color:#111;
  max-width:1000px;
  margin:14px auto;
}
[data-app="mdpreview"] .header{
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom:12px;
}
[data-app="mdpreview"] h3{ margin:0; font-weight:900; font-size:20px; }
[data-app="mdpreview"] .badge{
  font-size:14px;
  font-weight:900;
  padding:6px 10px;
  border:2px solid #111;
  border-radius:999px;
  background:#fff;
}
[data-app="mdpreview"] .badge.good{ border-color:#0b3d0b; color:#0b3d0b; }
[data-app="mdpreview"] .badge.dim{ border-color:#444; color:#444; }

[data-app="mdpreview"] .editor-container{
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}
[data-app="mdpreview"] label{ display:block; margin-bottom:6px; font-weight:900; font-size:14px; }
[data-app="mdpreview"] textarea, 
[data-app="mdpreview"] .preview-area{
  width:100%;
  height:400px;
  padding:12px;
  border:2px solid #111;
  border-radius:10px;
  box-sizing: border-box;
}
[data-app="mdpreview"] textarea{
  font-family: ui-monospace, monospace;
  font-size:15px;
  resize: none;
}
[data-app="mdpreview"] .preview-area{
  background:#f9f9f9;
  overflow-y: auto;
  line-height: 1.5;
}
[data-app="mdpreview"] .actions{
  display:flex;
  gap:10px;
  margin-top:15px;
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
[data-app="mdpreview"] .btn-download{ background:#0b5fff; color:#fff; border-color:#0b5fff; }
[data-app="mdpreview"] .btn-clear{ color:#7a0000; border-color:#7a0000; }

@media (max-width:750px){
  [data-app="mdpreview"] .editor-container{ grid-template-columns: 1fr; }
}
`;
    document.head.appendChild(style);
  }

  function parse(md) {
    if (!md) return "";
    return md
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/\n/gim, '<br>');
  }

  window.SiteApps.register("mdpreview", (container) => {
    ensureStyle();
    const storageKey = `siteapps:mdpreview:${container.getAttribute("data-storage-key") || "default"}`;

    container.innerHTML = `
      <div class="header">
        <h3>Markdown Preview</h3>
        <span class="badge good" id="status-badge">Ready</span>
      </div>
      <div class="editor-container">
        <div>
          <label>Editor</label>
          <textarea id="input" placeholder="Type # Header..."></textarea>
        </div>
        <div>
          <label>Preview</label>
          <div id="preview" class="preview-area"></div>
        </div>
      </div>
      <div class="actions">
        <button class="btn-download" id="dl-btn">💾 Save .md File</button>
        <button class="btn-clear" id="clr-btn">🗑️ Clear All</button>
      </div>
    `;

    const ta = container.querySelector("#input");
    const out = container.querySelector("#preview");
    const status = container.querySelector("#status-badge");

    const update = () => {
      out.innerHTML = parse(ta.value);
      localStorage.setItem(storageKey, ta.value);
      status.textContent = "Saved ✓";
      status.className = "badge good";
    };

    let saveTimer;
    ta.addEventListener("input", () => {
      status.textContent = "Typing...";
      status.className = "badge dim";
      clearTimeout(saveTimer);
      saveTimer = setTimeout(update, 300);
    });

    container.querySelector("#dl-btn").onclick = () => {
      const blob = new Blob([ta.value], { type: "text/markdown" });
      const a = Object.assign(document.createElement("a"), {
        href: URL.createObjectURL(blob),
        download: "document.md"
      });
      a.click();
    };

    container.querySelector("#clr-btn").onclick = () => {
      if (confirm("Clear all text?")) {
        ta.value = "";
        update();
      }
    };

    // Initial Load
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      ta.value = saved;
      update();
    }
  });
})();
