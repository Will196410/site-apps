(() => {
  "use strict";

  window.SiteApps = window.SiteApps || {};
  window.SiteApps.registry = window.SiteApps.registry || {};
  window.SiteApps.register = window.SiteApps.register || function (name, initFn) {
    window.SiteApps.registry[name] = initFn;
  };

  const STYLE_ID = "siteapps-mdpreview-style-v7";
  const DYNAMIC_STYLE_ID = "siteapps-md-dynamic-styles";

  const DEFAULT_THEMES = {
    modern: `/* Modern Clean */\n#md-render { background: #ffffff; color: #111; }\nh1, h2, h3 { margin: 10px 0 5px 0; }\np { margin-bottom: 15px; }`,
    paper: `/* Paper Theme */\n#md-render { background: #fdf6e3; color: #586e75; font-family: serif; }\nh1, h2, h3 { color: #268bd2; border-bottom: 1px solid #eee; margin: 10px 0; }`,
    terminal: `/* Dark Terminal */\n#md-render { background: #1a1a1a; color: #00ff41; font-family: monospace; }\nh1, h2, h3 { color: #fff; border-bottom: 1px solid #333; }\nblockquote { border-left: 4px solid #00ff41; color: #aaa; }`
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
[data-app="mdpreview"] .actions { margin-top: 20px; display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
[data-app="mdpreview"] button, [data-app="mdpreview"] select {
  padding: 8px 14px; font-weight: 900; border: 2px solid #111; border-radius: 8px; cursor: pointer; background: #fff;
}
[data-app="mdpreview"] .template-row { display: flex; gap: 5px; margin-top: 5px; }
[data-app="mdpreview"] .template-row button { padding: 4px 8px; font-size: 10px; }
[data-app="mdpreview"] .btn-primary { background: #111; color: #fff; }
@media (max-width: 900px) { [data-app="mdpreview"] .main-grid { grid-template-columns: 1fr; } }
`;
    document.head.appendChild(style);
  }

  function parseMd(md) {
    if (!md) return "<em>Typing...</em>";
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
    const templatesKey = `siteapps:mdpreview:custom_templates`;

    container.innerHTML = `
      <div class="app-header">
        <h3>Markdown Lab</h3>
        <div>
          <label style="display:inline; margin-right:5px;">Templates:</label>
          <select id="theme-select"></select>
        </div>
      </div>
      
      <div class="main-grid">
        <div class="side-bar">
          <label>Markdown</label>
          <textarea id="md-input"></textarea>
          <label>Custom CSS</label>
          <textarea id="css-input"></textarea>
          <div class="template-row">
            <button id="btn-save-tpl">💾 Save CSS as Template</button>
            <button id="btn-del-tpl" style="color:red; border-color:red">🗑️ Delete Selected</button>
          </div>
        </div>
        <div class="preview-side">
          <label>Preview</label>
          <div class="preview-container" id="md-render"></div>
        </div>
      </div>

      <div class="actions">
        <button id="btn-dl">💾 Save .md</button>
        <button style="color:red; border-color:red" id="btn-clr">🗑️ Reset Editor</button>
        <span id="save-indicator" style="font-size:12px; opacity:0.6;">Saved</span>
      </div>
    `;

    const mdArea = container.querySelector("#md-input");
    const cssArea = container.querySelector("#css-input");
    const renderDiv = container.querySelector("#md-render");
    const themeSel = container.querySelector("#theme-select");
    const indicator = container.querySelector("#save-indicator");

    let debounceTimer;

    const getCustomTemplates = () => JSON.parse(localStorage.getItem(templatesKey) || "{}");

    const refreshTemplateDropdown = () => {
      const custom = getCustomTemplates();
      themeSel.innerHTML = '<option value="" disabled selected>Select a template...</option>';
      
      const groupDefaults = document.createElement('optgroup');
      groupDefaults.label = "Presets";
      Object.keys(DEFAULT_THEMES).forEach(k => {
        const opt = new Option(k.charAt(0).toUpperCase() + k.slice(1), `default:${k}`);
        groupDefaults.appendChild(opt);
      });
      
      const groupCustom = document.createElement('optgroup');
      groupCustom.label = "My Templates";
      Object.keys(custom).forEach(k => {
        const opt = new Option(k, `custom:${k}`);
        groupCustom.appendChild(opt);
      });

      themeSel.appendChild(groupDefaults);
      themeSel.appendChild(groupCustom);
    };

    const updatePreview = () => {
      renderDiv.innerHTML = parseMd(mdArea.value);
      dynamicStyle.textContent = cssArea.value;
      localStorage.setItem(`${storageKey}:content`, mdArea.value);
      localStorage.setItem(`${storageKey}:styles`, cssArea.value);
      indicator.textContent = "Saved ✓";
    };

    mdArea.addEventListener('input', () => {
      indicator.textContent = "Updating...";
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(updatePreview, 300);
    });

    cssArea.addEventListener('input', () => {
      dynamicStyle.textContent = cssArea.value;
      localStorage.setItem(`${storageKey}:styles`, cssArea.value);
    });

    themeSel.onchange = () => {
      const [type, name] = themeSel.value.split(':');
      if (type === 'default') {
        cssArea.value = DEFAULT_THEMES[name];
      } else {
        cssArea.value = getCustomTemplates()[name];
      }
      updatePreview();
    };

    container.querySelector("#btn-save-tpl").onclick = () => {
      const name = prompt("Enter a name for this CSS template:");
      if (name) {
        const custom = getCustomTemplates();
        custom[name] = cssArea.value;
        localStorage.setItem(templatesKey, JSON.stringify(custom));
        refreshTemplateDropdown();
      }
    };

    container.querySelector("#btn-del-tpl").onclick = () => {
      const val = themeSel.value;
      if (!val || !val.startsWith('custom:')) return alert("Select a custom template to delete.");
      const name = val.split(':')[1];
      if (confirm(`Delete template "${name}"?`)) {
        const custom = getCustomTemplates();
        delete custom[name];
        localStorage.setItem(templatesKey, JSON.stringify(custom));
        refreshTemplateDropdown();
      }
    };

    container.querySelector("#btn-dl").onclick = () => {
      const blob = new Blob([mdArea.value], { type: "text/markdown" });
      const a = Object.assign(document.createElement("a"), {
        href: URL.createObjectURL(blob),
        download: "note.md"
      });
      a.click();
    };

    container.querySelector("#btn-clr").onclick = () => {
      if(confirm("Clear content? (Your templates will be safe)")) {
        mdArea.value = "";
        updatePreview();
      }
    };

    // Initial Load
    mdArea.value = localStorage.getItem(`${storageKey}:content`) || "# My Notes\nStart typing...";
    cssArea.value = localStorage.getItem(`${storageKey}:styles`) || DEFAULT_THEMES.modern;
    refreshTemplateDropdown();
    updatePreview();
  });
})();
