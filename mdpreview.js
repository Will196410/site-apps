(() => {
  "use strict";

  window.SiteApps = window.SiteApps || {};
  window.SiteApps.registry = window.SiteApps.registry || {};
  window.SiteApps.register = window.SiteApps.register || function (name, initFn) {
    window.SiteApps.registry[name] = initFn;
  };

  const STYLE_ID = "siteapps-mdpreview-style-v4";
  const DYNAMIC_STYLE_ID = "siteapps-md-dynamic-styles";

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
[data-app="mdpreview"]{
  font-family:-apple-system,system-ui,sans-serif;
  background:#fff;
  border:2px solid #111;
  padding:20px;
  border-radius:14px;
  max-width:1000px;
  margin:20px auto;
  color:#111;
}
[data-app="mdpreview"] .app-header { display:flex; justify-content:space-between; margin-bottom:15px; }
[data-app="mdpreview"] h3 { margin:0; font-weight:900; }

/* 3-Column / Area Layout */
[data-app="mdpreview"] .main-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
[data-app="mdpreview"] .side-bar { display: flex; flex-direction: column; gap: 15px; }

[data-app="mdpreview"] label { 
  display:block; 
  font-weight:900; 
  font-size:12px; 
  text-transform:uppercase; 
  margin-bottom:5px;
  color: #555;
}

[data-app="mdpreview"] textarea {
  width:100%;
  border:2px solid #111;
  border-radius:10px;
  padding:12px;
  font-family: ui-monospace, monospace;
  font-size:14px;
  box-sizing: border-box;
  resize: vertical;
}
[data-app="mdpreview"] #md-input { height: 350px; }
[data-app="mdpreview"] #css-input { height: 150px; background: #fdfdfd; border-style: dashed; }

[data-app="mdpreview"] .preview-container {
  border: 2px solid #111;
  border-radius: 10px;
  padding: 20px;
  background: #fff;
  height: 565px;
  overflow-y: auto;
  box-sizing: border-box;
}

[data-app="mdpreview"] .actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}
[data-app="mdpreview"] button {
  padding: 10px 16px;
  font-weight: 900;
  border: 2px solid #111;
  border-radius: 10px;
  cursor: pointer;
  background: #fff;
}
[data-app="mdpreview"] .btn-primary { background: #111; color: #fff; }
[data-app="mdpreview"] .btn-download { background: #0b5fff; color: #fff; border-color: #0b5fff; }

@media (max-width: 800px) {
  [data-app="mdpreview"] .main-grid { grid-template-columns: 1fr; }
  [data-app="mdpreview"] .preview-container { height: 400px; }
}
`;
    document.head.appendChild(style);
  }

  function parseMd(md) {
    if (!md) return "<em>Markdown preview will appear here...</em>";
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
    
    // Setup dynamic style tag for the custom CSS
    let dynamicStyle = document.getElementById(DYNAMIC_STYLE_ID);
    if (!dynamicStyle) {
      dynamicStyle = document.createElement("style");
      dynamicStyle.id = DYNAMIC_STYLE_ID;
      document.head.appendChild(dynamicStyle);
    }

    const storageKey = `siteapps:mdpreview:${container.getAttribute("data-storage-key") || "default"}`;

    container.innerHTML = `
      <div class="app-header">
        <h3>Markdown + CSS Designer</h3>
      </div>
      
      <div class="main-grid">
        <div class="side-bar">
          <div>
            <label>1. Markdown Content</label>
            <textarea id="md-input" placeholder="# Type here..."></textarea>
          </div>
          <div>
            <label>2. Custom CSS (Styles the Preview)</label>
            <textarea id="css-input" placeholder="h1 { color: blue; }"></textarea>
          </div>
        </div>
        
        <div class="preview-side">
          <label>3. Rendered Preview</label>
          <div class="preview-container" id="md-render"></div>
        </div>
      </div>

      <div class="actions">
        <button class="btn-primary" id="btn-refresh">🔄 Refresh View</button>
        <button class="btn-download" id="btn-dl">💾 Download .md</button>
        <button style="color:red; border-color:red" id="btn-clr">🗑️ Clear</button>
      </div>
    `;

    const mdArea = container.querySelector("#md-input");
    const cssArea = container.querySelector("#css-input");
    const renderDiv = container.querySelector("#md-render");

    const defaultCSS = `/* Default spacing fixes */
h1, h2, h3 { 
  margin-top: 10px; 
  margin-bottom: 5px; 
}
p { margin-bottom: 10px; }
blockquote { 
  border-left: 4px solid #111; 
  padding-left: 10px; 
  font-style: italic; 
}`;

    const update = () => {
      renderDiv.innerHTML = parseMd(mdArea.value);
      dynamicStyle.textContent = cssArea.value;
      
      localStorage.setItem(`${storageKey}:content`, mdArea.value);
      localStorage.setItem(`${storageKey}:styles`, cssArea.value);
    };

    container.querySelector("#btn-refresh").onclick = update;

    container.querySelector("#btn-dl").onclick = () => {
      const blob = new Blob([mdArea.value], { type: "text/markdown" });
      const a = Object.assign(document.createElement("a"), {
        href: URL.createObjectURL(blob),
        download: "notes.md"
      });
      a.click();
    };

    container.querySelector("#btn-clr").onclick = () => {
      if(confirm("Clear all?")) {
        mdArea.value = "";
        cssArea.value = defaultCSS;
        update();
      }
    };

    // Auto-save typing
    mdArea.oninput = () => localStorage.setItem(`${storageKey}:content`, mdArea.value);
    cssArea.oninput = () => {
      dynamicStyle.textContent = cssArea.value;
      localStorage.setItem(`${storageKey}:styles`, cssArea.value);
    };

    // Load initial data
    mdArea.value = localStorage.getItem(`${storageKey}:content`) || "# Sample Header\nType your content here...";
    cssArea.value = localStorage.getItem(`${storageKey}:styles`) || defaultCSS;
    
    update();
  });
})();
