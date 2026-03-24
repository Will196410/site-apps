(() => {
  "use strict";

  window.SiteApps = window.SiteApps || {};
  window.SiteApps.registry = window.SiteApps.registry || {};
  window.SiteApps.register =
    window.SiteApps.register ||
    function (name, initFn) {
      window.SiteApps.registry[name] = initFn;
    };

  const STYLE_ID = "siteapps-replacer-style-v2";

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
[data-app="replacer"] {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background: #fff;
  border: 2px solid #111;
  padding: 16px;
  border-radius: 12px;
  color: #111;
  box-sizing: border-box;
  width: 100%;
}
[data-app="replacer"] h3 { margin: 0 0 12px 0; font-size: 18px; font-weight: 900; }
[data-app="replacer"] .layout-grid { display: flex; flex-direction: column; gap: 12px; }
[data-app="replacer"] label { display: block; margin-bottom: 4px; font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
[data-app="replacer"] textarea {
  width: 100%; min-height: 140px; padding: 10px; border: 2px solid #111; border-radius: 8px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 14px; box-sizing: border-box; resize: vertical;
}
[data-app="replacer"] .config-panel {
  background: #f9f9f9; padding: 14px; border-radius: 8px; border: 2px solid #111; margin-top: 10px;
}
[data-app="replacer"] .field-row { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 12px; }
[data-app="replacer"] .field-row > div { flex: 1; min-width: 180px; }
[data-app="replacer"] input[type="text"] {
  width: 100%; padding: 8px; border: 2px solid #111; border-radius: 6px; box-sizing: border-box;
}
[data-app="replacer"] .options-bar { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; font-size: 13px; font-weight: 700; margin-bottom: 12px; }
[data-app="replacer"] .btn-group { display: flex; gap: 8px; flex-wrap: wrap; }
[data-app="replacer"] button {
  border: 2px solid #111; border-radius: 6px; cursor: pointer; padding: 8px 14px;
  font-weight: 800; font-size: 13px; background: #fff; transition: transform 0.1s;
}
[data-app="replacer"] button:active { transform: translateY(1px); }
[data-app="replacer"] .btn-primary { background: #111; color: #fff; }
[data-app="replacer"] .btn-step { background: #ffd400; }
[data-app="replacer"] .btn-copy { background: #00853e; color: #fff; border-color: #00853e; }
[data-app="replacer"] .status-msg { margin-top: 10px; font-size: 12px; font-weight: 700; color: #555; height: 1.2em; }
`;
    document.head.appendChild(style);
  }

  window.SiteApps.register("replacer", (container) => {
    ensureStyle();
    
    container.innerHTML = `
      <div data-app="replacer">
        <h3>Text Search & Replace</h3>
        
        <div class="layout-grid">
          <div>
            <label>Input Text</label>
            <textarea id="rep-input" placeholder="Paste text here..."></textarea>
          </div>

          <div class="config-panel">
            <div class="field-row">
              <div>
                <label>Find</label>
                <input type="text" id="rep-find" placeholder="Search target...">
              </div>
              <div>
                <label>Replace With</label>
                <input type="text" id="rep-replace" placeholder="New text...">
              </div>
            </div>

            <div class="options-bar">
              <label style="cursor:pointer"><input type="checkbox" id="rep-case"> Case Sensitive</label>
              <label style="cursor:pointer"><input type="radio" name="pos" value="any" checked> Anywhere</label>
              <label style="cursor:pointer"><input type="radio" name="pos" value="start"> Start of Line</label>
              <label style="cursor:pointer"><input type="radio" name="pos" value="end"> End of Line</label>
            </div>

            <div class="btn-group">
              <button class="btn-primary" id="btn-search">🔍 Filter Lines</button>
              <button class="btn-primary" id="btn-rep-all">🔁 Replace All</button>
              <button class="btn-step" id="btn-step">⏯️ Step</button>
              <button class="btn-copy" id="btn-copy">📋 Copy Result</button>
              <button id="btn-clear">Clear</button>
            </div>
            <div class="status-msg" id="rep-status"></div>
          </div>

          <div>
            <label>Result</label>
            <textarea id="rep-output" readonly placeholder="Results appear here..."></textarea>
          </div>
        </div>
      </div>
    `;

    const input = container.querySelector("#rep-input");
    const output = container.querySelector("#rep-output");
    const find = container.querySelector("#rep-find");
    const replace = container.querySelector("#rep-replace");
    const caseSens = container.querySelector("#rep-case");
    const status = container.querySelector("#rep-status");

    const getRegex = (isGlobal = true) => {
      let term = find.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pos = container.querySelector('input[name="pos"]:checked').value;
      
      if (pos === "start") term = "^" + term;
      if (pos === "end") term = term + "$";
      
      const flags = (isGlobal ? "g" : "") + (caseSens.checked ? "" : "i") + (pos !== "any" ? "m" : "");
      return new RegExp(term, flags);
    };

    container.querySelector("#btn-search").onclick = () => {
      if (!find.value) return (status.textContent = "Enter a search term.");
      const regex = getRegex();
      const lines = input.value.split(/\r?\n/);
      const matched = lines.filter(line => regex.test(line));
      output.value = matched.join("\n");
      status.textContent = `Found ${matched.length} matching lines.`;
    };

    container.querySelector("#btn-rep-all").onclick = () => {
      const regex = getRegex();
      output.value = input.value.replace(regex, replace.value);
      status.textContent = "Replacement complete.";
    };

    container.querySelector("#btn-step").onclick = () => {
      const regex = getRegex(false);
      if (regex.test(input.value)) {
        input.value = input.value.replace(regex, replace.value);
        output.value = input.value;
        status.textContent = "Replaced next occurrence.";
      } else {
        status.textContent = "No more matches found.";
      }
    };

    container.querySelector("#btn-copy").onclick = async () => {
      if (!output.value) return;
      await navigator.clipboard.writeText(output.value);
      status.textContent = "Copied to clipboard!";
      setTimeout(() => status.textContent = "", 2000);
    };

    container.querySelector("#btn-clear").onclick = () => {
      input.value = ""; output.value = ""; find.value = ""; replace.value = ""; status.textContent = "";
    };
  });
})();
