(() => {
  "use strict";

  window.SiteApps = window.SiteApps || {};
  window.SiteApps.registry = window.SiteApps.registry || {};
  window.SiteApps.register =
    window.SiteApps.register ||
    function (name, initFn) {
      window.SiteApps.registry[name] = initFn;
    };

  const STYLE_ID = "siteapps-replacer-style-v1";

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
[data-app="replacer"]{
  font-family:-apple-system,system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;
  background:#fff;
  border:2px solid #111;
  padding:18px;
  border-radius:14px;
  color:#111;
  max-width:980px;
  margin:14px auto;
}
[data-app="replacer"] h3 { margin:0 0 15px 0; font-size:20px; font-weight:900; }
[data-app="replacer"] .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px; }
[data-app="replacer"] label { display:block; margin-bottom:6px; font-weight:900; font-size:14px; }
[data-app="replacer"] textarea {
  width:100%; min-height:120px; padding:10px; border:2px solid #111; border-radius:10px;
  font-family:ui-monospace,monospace; font-size:14px; box-sizing: border-box;
}
[data-app="replacer"] .search-config {
  background: #f4f4f4; padding: 15px; border-radius: 10px; border: 2px solid #111; margin-bottom: 15px;
}
[data-app="replacer"] .input-group { display: flex; gap: 10px; margin-bottom: 10px; flex-wrap: wrap; }
[data-app="replacer"] .input-field { flex: 1; min-width: 200px; }
[data-app="replacer"] input[type="text"] {
  width: 100%; padding: 8px; border: 2px solid #111; border-radius: 6px; font-family: inherit;
}
[data-app="replacer"] .options { display: flex; gap: 15px; font-size: 13px; font-weight: 700; align-items: center; flex-wrap: wrap; }
[data-app="replacer"] .btn-row { display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap; }
[data-app="replacer"] button {
  border:2px solid #111; border-radius:8px; cursor:pointer; padding:8px 14px;
  font-weight:900; font-size:13px; background:#fff;
}
[data-app="replacer"] .btn-main { background: #111; color: #fff; }
[data-app="replacer"] .btn-step { background: #ffcc00; }
[data-app="replacer"] .btn-copy { background: #0b7a2b; color: #fff; }
[data-app="replacer"] .highlight { background: #ffeb3b; font-weight: bold; border-radius: 3px; }

@media (max-width: 600px) { [data-app="replacer"] .grid { grid-template-columns: 1fr; } }
`;
    document.head.appendChild(style);
  }

  window.SiteApps.register("replacer", (container) => {
    ensureStyle();

    // UI Construction
    container.innerHTML = `
      <div data-app="replacer">
        <h3>Text Search & Replace</h3>
        
        <div class="grid">
          <div>
            <label>Input Text</label>
            <textarea id="rep-input" placeholder="Paste your text here..."></textarea>
          </div>
          <div>
            <label>Result / Matched Lines</label>
            <textarea id="rep-output" readonly placeholder="Results will appear here..."></textarea>
          </div>
        </div>

        <div class="search-config">
          <div class="input-group">
            <div class="input-field">
              <label>Search For</label>
              <input type="text" id="rep-find" placeholder="Target text...">
            </div>
            <div class="input-field">
              <label>Replace With</label>
              <input type="text" id="rep-replace" placeholder="New text...">
            </div>
          </div>

          <div class="options">
            <label><input type="checkbox" id="rep-case"> Case Sensitive</label>
            <label><input type="radio" name="pos" value="any" checked> Anywhere</label>
            <label><input type="radio" name="pos" value="start"> Start of Line</label>
            <label><input type="radio" name="pos" value="end"> End of Line</label>
          </div>

          <div class="btn-row">
            <button class="btn-main" id="btn-search">🔍 Filter Lines</button>
            <button class="btn-main" id="btn-rep-all">🔁 Replace All</button>
            <button class="btn-step" id="btn-step">⏯️ Step Replace</button>
            <button class="btn-copy" id="btn-copy">📋 Copy Result</button>
            <button id="btn-clear">🗑️ Clear</button>
          </div>
        </div>
        <div id="rep-status" style="font-size:12px; font-weight:bold; color:#555;"></div>
      </div>
    `;

    const inputArea = container.querySelector("#rep-input");
    const outputArea = container.querySelector("#rep-output");
    const findInput = container.querySelector("#rep-find");
    const replaceInput = container.querySelector("#rep-replace");
    const caseCheck = container.querySelector("#rep-case");
    const statusDiv = container.querySelector("#rep-status");

    function getRegex(global = true) {
      let term = findInput.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape regex
      const pos = container.querySelector('input[name="pos"]:checked').value;
      
      if (pos === "start") term = "^" + term;
      if (pos === "end") term = term + "$";
      
      const flags = (global ? "g" : "") + (caseCheck.checked ? "" : "i") + (pos !== "any" ? "m" : "");
      return new RegExp(term, flags);
    }

    // Actions
    container.querySelector("#btn-search").onclick = () => {
      const regex = getRegex();
      const lines = inputArea.value.split("\n");
      const matched = lines.filter(line => regex.test(line));
      outputArea.value = matched.join("\n");
      statusDiv.textContent = `Found ${matched.length} matching lines.`;
    };

    container.querySelector("#btn-rep-all").onclick = () => {
      const regex = getRegex();
      outputArea.value = inputArea.value.replace(regex, replaceInput.value);
      statusDiv.textContent = "All replacements completed.";
    };

    container.querySelector("#btn-step").onclick = () => {
      const regex = getRegex(false); // Non-global for stepping
      const currentText = inputArea.value;
      if (regex.test(currentText)) {
        const newText = currentText.replace(regex, replaceInput.value);
        inputArea.value = newText;
        outputArea.value = newText;
        statusDiv.textContent = "Replaced next occurrence.";
      } else {
        statusDiv.textContent = "No more occurrences found.";
      }
    };

    container.querySelector("#btn-copy").onclick = async () => {
      await navigator.clipboard.writeText(outputArea.value);
      const originalText = container.querySelector("#btn-copy").textContent;
      container.querySelector("#btn-copy").textContent = "✓ Copied!";
      setTimeout(() => {
        container.querySelector("#btn-copy").textContent = originalText;
      }, 1500);
    };

    container.querySelector("#btn-clear").onclick = () => {
      if (confirm("Clear everything?")) {
        inputArea.value = "";
        outputArea.value = "";
        findInput.value = "";
        replaceInput.value = "";
        statusDiv.textContent = "";
      }
    };
  });
})();
