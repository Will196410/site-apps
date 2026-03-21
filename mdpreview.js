(() => {
  "use strict";

  window.SiteApps = window.SiteApps || {};
  window.SiteApps.registry = window.SiteApps.registry || {};
  window.SiteApps.register = window.SiteApps.register || function (name, initFn) {
    window.SiteApps.registry[name] = initFn;
  };

  const STYLE_ID = "siteapps-mdlab-style-v9";
  const DYNAMIC_STYLE_ID = "siteapps-mdlab-dynamic-styles";

  const DEFAULT_THEMES = {
    modern: `/* Modern Clean */\n#md-render { background: #ffffff; color: #111; }\nh1, h2, h3 { margin: 10px 0 5px 0; }\np { margin-bottom: 15px; }`,
    paper: `/* Paper Theme */\n#md-render { background: #fdf6e3; color: #586e75; font-family: serif; }\nh1, h2, h3 { color: #268bd2; border-bottom: 1px solid #eee; margin: 10px 0; }`,
    terminal: `/* Dark Terminal */\n#md-render { background: #1a1a1a; color: #00ff41; font-family: monospace; }\nh1, h2, h3 { color: #fff; border-bottom: 1px solid #333; }\nblockquote { border-left: 4px solid #00ff41; color: #aaa; }`
  };

  const SNIPPETS = {
    table: "\n| Header 1 | Header 2 |\n| -------- | -------- |\n| Cell 1   | Cell 2   |\n",
    tasks: "\n- [ ] Task 1\n- [x] Task 2 (done)\n- [ ] Task 3\n",
    code: "\n```javascript\nconsole.log('Hello World');\n```\n",
    link: "[Display Text](https://example.com)"
  };

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
[data-app="markdown-lab"]{
  font-family:-apple-system,system-ui,sans-serif;
  background:#fff; border:2px solid #111; padding:20px; border-radius:14px;
  max-width:1150px; margin:20px auto; color:#111; box-shadow: 6px 6px 0px #eee;
}
[data-app="markdown-lab"] .app-header { display:flex; justify-content:space-between; margin-bottom:15px; align-items: center;}
[data-app="markdown-lab"] .main-grid { display: grid; grid-template-columns: 380px 1fr; gap: 20px; }
[data-app="markdown-lab"] .side-bar { display: flex; flex-direction: column; gap: 10px; }
[data-app="markdown-lab"] label { display:block; font-weight:900; font-size:11px; text-transform:uppercase; margin: 5px 0; color: #555; }
[data-app="markdown-lab"] .snippet-bar { display: flex; gap: 5px; margin-bottom: 5px; flex-wrap: wrap; }
[data-app="markdown-lab"] .btn-snippet { padding: 4px 8px; font-size: 10px; background: #f0f0f0; border: 1px solid #111; border-radius: 4px; cursor: pointer; font-weight: bold; }
[data-app="markdown-lab"] textarea {
  width:100%; border:2px solid #111; border-radius:8px; padding:10px;
  font-family: ui-monospace, monospace; font-size:13px; box-sizing: border-box;
}
[data-app="markdown-lab"] #md-input { height: 380px; }
[data-app="markdown-lab"] #css-input { height: 160px; background: #fafafa; }
[data-app="markdown-lab"] .preview-container {
  border: 2px solid #111; border-radius: 8px; padding: 25px;
  height: 660px; overflow-y: auto; box-sizing: border-box; transition: background 0.2s;
}
[data-app="markdown-lab"] .status-bar {
  display: flex; gap: 20px; padding: 10px 15px; background: #f9f9f9; border: 2px solid #111;
  border-radius: 8px; margin-top: 15px; font-size: 12px; font-weight: 800; text-transform: uppercase;
}
[data-app="markdown-lab"] .actions { margin-top: 15px; display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
[data-app="markdown-lab"] button, [data-app="markdown-lab"] select {
  padding: 8px 14px; font-weight: 900; border: 2px solid #111; border-radius: 8px; cursor: pointer; background: #fff;
}
[data-app="markdown-lab"] .btn-primary { background: #111; color: #fff; }
[data-app="markdown-lab"] table { border-collapse: collapse; width: 100%; margin-bottom: 1em; }
[data-app="markdown-lab"] table th, [data-app="markdown-lab"] table td { border: 1px solid #ccc; padding: 8px; text-align: left; }
@media (max-width: 950px) { [data-app="markdown-lab"] .main-grid { grid-template-columns: 1fr; } }
`;
    document.head.appendChild(style);
  }

  function parseMd(md) {
    if (!md) return "<em>Lab is empty...</em>";
    return md
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^- \[ \] (.*$)/gim, '<div><input type="checkbox" disabled> $1</div>')
      .replace(/^- \[x\] (.*$)/gim, '<div><input type="checkbox" checked disabled> $1</div>')
      .replace(/\|(.+)\|/gim, (match) => {
         if (match.includes('---')) return ""; 
         const cells = match.split('|').filter(c => c.trim() !== "").map(c => `<td>${c.trim()}</td>`).join('');
         return `<tr>${cells}</tr>`;
      })
      .replace(/(<tr>.*<\/tr>)+/gim, '<table>$1</table>')
      .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
      .replace(/\n/gim, '<br>');
  }

  window.SiteApps.register("markdown-lab", (container) => {
    ensureStyle();
    
    let dynamicStyle = document.getElementById(DYNAMIC_STYLE_ID);
    if (!dynamicStyle) {
      dynamicStyle = document.createElement("style");
      dynamicStyle.id = DYNAMIC_STYLE_ID;
      document.head.appendChild(dynamicStyle);
    }

    const storageKey = `siteapps:mdlab:${container.getAttribute("data-storage-key") || "default"}`;

    container.innerHTML = `
      <div class="app-header">
        <h3>Markdown Lab 🧪</h3>
        <div>
          <label style="display:inline; margin-right:5px;">Styles:</label>
          <select id="theme-select"></select>
        </div>
      </div>
      
      <div class="main-grid">
        <div class="side-bar">
          <label>Editor</label>
          <div class="snippet-bar">
            <button class="btn-snippet" data-snip="table">+ Table</button>
            <button class="btn-snippet" data-snip="tasks">+ Tasks</button>
            <button class="btn-snippet" data-snip="code">{ } Code</button>
            <button class="btn-snippet" data-snip="link">🔗 Link</button>
          </div>
          <textarea id="md-input"></textarea>
          
          <label>CSS Lab</label>
          <textarea id="css-input"></textarea>
          <button id="btn-save-tpl" style="font-size:10px; margin-top:5px;">💾 Save Style Template</button>
        </div>
        
        <div class="preview-side">
          <label>Output</label>
          <div class="preview-container" id="md-render"></div>
        </div>
      </div>

      <div class="status-bar">
        <span id="stat-words">0 Words</span>
        <span id="stat-chars">0 Chars</span>
        <span id="stat-time">0 Min Read</span>
      </div>

      <div class="actions">
        <button id="btn-dl" class="btn-primary">💾 Save .md</button>
        <button id="btn-clr" style="color:red; border-color:red">🗑️ Reset</button>
        <span id="save-indicator" style="font-size:11px; font-weight:bold; color: #aaa; margin-left: auto;">READY</span>
      </div>
    `;

    const mdArea = container.querySelector("#md-input");
    const cssArea = container.querySelector("#css-input");
    const renderDiv = container.querySelector("#md-render");
    const themeSel = container.querySelector("#theme-select");
    const indicator = container.querySelector("#save-indicator");

    // Stats Elements
    const sWords = container.querySelector("#stat-words");
    const sChars = container.querySelector("#stat-chars");
    const sTime = container.querySelector("#stat-time");

    const updateStats = (text) => {
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      const chars = text.length;
      const readingTime = Math.ceil(words / 225);

      sWords.textContent = `${words} Words`;
      sChars.textContent = `${chars} Chars`;
      sTime.textContent = `${readingTime} Min Read`;
    };

    const updatePreview = () => {
      renderDiv.innerHTML = parseMd(mdArea.value);
      dynamicStyle.textContent = cssArea.value;
      updateStats(mdArea.value);
      localStorage.setItem(`${storageKey}:content`, mdArea.value);
      localStorage.setItem(`${storageKey}:styles`, cssArea.value);
      indicator.textContent = "SAVED ✓";
    };

    container.querySelectorAll('.btn-snippet').forEach(btn => {
      btn.onclick = () => {
        const text = SNIPPETS[btn.getAttribute('data-snip')];
        const start = mdArea.selectionStart;
        const end = mdArea.selectionEnd;
        mdArea.value = mdArea.value.substring(0, start) + text + mdArea.value.substring(end);
        mdArea.focus();
        updatePreview();
      };
    });

    let debounceTimer;
    mdArea.addEventListener('input', () => {
      indicator.textContent = "UPDATING...";
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(updatePreview, 300);
    });

    cssArea.addEventListener('input', () => {
      dynamicStyle.textContent = cssArea.value;
      localStorage.setItem(`${storageKey}:styles`, cssArea.value);
    });

    const refreshThemes = () => {
      const custom = JSON.parse(localStorage.getItem('siteapps:mdlab:custom_templates') || "{}");
      themeSel.innerHTML = '<option value="" disabled selected>Load Style...</option>';
      Object.keys(DEFAULT_THEMES).forEach(k => themeSel.add(new Option(`Preset: ${k}`, `d:${k}`)));
      Object.keys(custom).forEach(k => themeSel.add(new Option(`Mine: ${k}`, `c:${k}`)));
    };

    themeSel.onchange = () => {
      const val = themeSel.value;
      if (val.startsWith('d:')) cssArea.value = DEFAULT_THEMES[val.split(':')[1]];
      else cssArea.value = JSON.parse(localStorage.getItem('siteapps:mdlab:custom_templates'))[val.split(':')[1]];
      updatePreview();
    };

    container.querySelector("#btn-save-tpl").onclick = () => {
      const name = prompt("Template Name:");
      if (name) {
        const custom = JSON.parse(localStorage.getItem('siteapps:mdlab:custom_templates') || "{}");
        custom[name] = cssArea.value;
        localStorage.setItem('siteapps:mdlab:custom_templates', JSON.stringify(custom));
        refreshThemes();
      }
    };

    container.querySelector("#btn-dl").onclick = () => {
      const blob = new Blob([mdArea.value], { type: "text/markdown" });
      const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "lab-note.md" });
      a.click();
    };

    container.querySelector("#btn-clr").onclick = () => { if(confirm("Clear content?")) { mdArea.value = ""; updatePreview(); } };

    // Initial Load
    mdArea.value = localStorage.getItem(`${storageKey}:content`) || "# Markdown Lab\nBegin your work...";
    cssArea.value = localStorage.getItem(`${storageKey}:styles`) || DEFAULT_THEMES.modern;
    refreshThemes();
    updatePreview();
  });
})();
