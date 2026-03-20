(() => {
  "use strict";

  window.SiteApps = window.SiteApps || {};
  window.SiteApps.registry = window.SiteApps.registry || {};
  window.SiteApps.register = window.SiteApps.register || function (name, initFn) {
    window.SiteApps.registry[name] = initFn;
  };

  const STYLE_ID = "siteapps-mdpreview-style-v5";
  const DYNAMIC_STYLE_ID = "siteapps-md-dynamic-styles";

  const THEMES = {
    paper: `/* Paper Theme */\n#md-render { background: #fdf6e3; color: #586e75; font-family: serif; }\nh1, h2, h3 { color: #268bd2; border-bottom: 1px solid #eee; margin: 10px 0; }`,
    terminal: `/* Dark Terminal */\n#md-render { background: #1a1a1a; color: #00ff41; font-family: monospace; }\nh1, h2, h3 { color: #fff; border-bottom: 1px solid #333; }\nblockquote { border-left: 4px solid #00ff41; color: #aaa; }`,
    modern: `/* Modern Clean */\n#md-render { background: #ffffff; color: #111; }\nh1, h2, h3 { margin: 10px 0 5px 0; }\np { margin-bottom: 15px; }`
  };

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
[data-app="mdpreview"]{
  font-family:-apple-system,system-ui,sans-serif;
  background:#fff; border:2px solid #111; padding:20px; border-radius:14px;
  max-width:1100px; margin:20px auto; color:#111;
}
[data-app="mdpreview"] .app-header { display:flex; justify-content:space-between; margin-bottom:15px; align-items: center;}
[data-app="mdpreview"] .main-grid { display: grid; grid-template-columns: 350px 1fr; gap: 20px; }
[data-app="mdpreview"] .side-bar { display: flex; flex-direction: column; gap: 10px; }
[data-app="mdpreview"] label { display:block; font-weight:900; font-size:11px; text-transform:uppercase; margin: 5px 0; color: #555; }
[data-app="mdpreview"] textarea {
  width:100%; border:2px solid #111; border-radius:8px; padding:10px;
  font-family: ui-monospace, monospace; font-size:13px; box-sizing: border-box;
}
[data-app="mdpreview"] #md-input { height: 350px; }
[data-app="mdpreview"] #css-input { height: 180px; background: #f8f8f8; }
[data-app="mdpreview"] .preview-container {
  border: 2px solid #111; border-radius: 8px; padding: 25px;
  height: 615px; overflow-y: auto; box-sizing: border-box; transition: background 0.3s;
}
[data-app="mdpreview"] .actions { margin-top: 20px; display: flex; gap: 8px; flex-wrap: wrap; }
[data-app="mdpreview"] button, [data-app="mdpreview"] select {
  padding: 8px 14px; font-weight: 900; border: 2px solid #111; border-radius: 8px; cursor: pointer; background: #fff;
}
[data-app="mdpreview"] .btn-primary { background: #111; color: #fff; }
[data-app="mdpreview"] select { background: #eee; }
@media (max-width: 900px) { [data-app="mdpreview"] .main-grid { grid-template-columns: 1fr; } }
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
    
    let dynamicStyle = document.getElementById(DYNAMIC_STYLE_ID);
    if (!dynamicStyle) {
      dynamicStyle = document.createElement("style");
      dynamicStyle.id = DYNAMIC_STYLE_ID;
      document.head.appendChild(dynamicStyle);
    }

    const storageKey = `siteapps:mdpreview:${container.getAttribute("data-storage-key") || "default"}`;

    container.innerHTML = `
      <div class="app-header">
        <h3>Markdown Lab</h3>
        <div class="header-controls">
          <label style="display:inline; margin-right:5px;">Theme:</label>
          <select id="theme-select">
            <option value="">-- Custom --</option>
            <option value="modern">Modern Clean</option>
            <option value="paper">Paper (Warm)</option>
            <option value="terminal">Terminal (Dark)</option>
          </select>
        </div>
      </div>
      
      <div class="main-grid">
        <div class="side-bar">
          <label>Markdown</label>
          <textarea id="md-input"></textarea>
          <label>Custom CSS (use #md-render for bg)</label>
          <textarea id="css-input"></textarea>
        </div>
        <div class="preview-side">
          <label>Live Preview</label>
          <div class="preview-container" id="md-render"></div>
        </div>
      </div>

      <div class="actions">
        <button class="btn-primary" id="btn-refresh">🔄 Refresh Content</button>
        <button id="btn-dl">💾 Save .md</button>
        <button style="color:red; border-color:red" id="btn-clr">🗑️ Reset</button>
      </div>
    `;

    const mdArea = container.querySelector("#md-input");
    const cssArea = container.querySelector("#css-input");
    const renderDiv = container.querySelector("#md-render");
    const themeSel = container.querySelector("#theme-select");

    const update = () => {
      renderDiv.innerHTML = parseMd(mdArea.value);
      dynamicStyle.textContent = cssArea.value;
      localStorage.setItem(`${storageKey}:content`, mdArea.value);
      localStorage.setItem(`${storageKey}:styles`, cssArea.value);
    };

    themeSel.onchange = () => {
      if (themeSel.value && THEMES[themeSel.value]) {
        cssArea.value = THEMES[themeSel.value];
        update();
      }
    };

    container.querySelector("#btn-refresh").onclick = update;
    container.querySelector("#btn-dl").onclick = () => {
      const blob = new Blob([mdArea.value], { type: "text/markdown" });
      const a = Object.assign(document.createElement("a"), {
        href: URL.createObjectURL(blob),
        download: "note.md"
      });
      a.click();
    };

    container.querySelector("#btn-clr").onclick = () => {
      if(confirm("Clear everything?")) {
        mdArea.value = "";
        cssArea.value = THEMES.modern;
        update();
      }
    };

    cssArea.oninput = () => {
      dynamicStyle.textContent = cssArea.value;
      localStorage.setItem(`${storageKey}:styles`, cssArea.value);
    };

    // Load
    mdArea.value = localStorage.getItem(`${storageKey}:content`) || "# Hello\nWelcome to the editor.";
    cssArea.value = localStorage.getItem(`${storageKey}:styles`) || THEMES.modern;
    update();
  });
})();
