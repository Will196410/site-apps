(() => {
  "use strict";

  window.SiteApps = window.SiteApps || {};
  window.SiteApps.registry = window.SiteApps.registry || {};
  window.SiteApps.register = window.SiteApps.register || function (name, initFn) {
    window.SiteApps.registry[name] = initFn;
  };

  const STYLE_ID = "siteapps-replacer-clean-v3";

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .sa-replacer-box {
        font-family: sans-serif;
        color: #111;
        background: #fff;
        border: 2px solid #000;
        padding: 15px;
        border-radius: 8px;
        width: 100%;
        box-sizing: border-box;
      }
      .sa-replacer-box * { box-sizing: border-box; }
      .sa-replacer-box h3 { margin-top: 0; margin-bottom: 10px; }
      .sa-replacer-box textarea {
        width: 100%;
        height: 120px;
        margin: 5px 0 15px 0;
        border: 1px solid #333;
        font-family: monospace;
        padding: 8px;
      }
      .sa-replacer-controls {
        background: #eee;
        padding: 15px;
        border-radius: 4px;
        margin-bottom: 15px;
      }
      .sa-input-row { display: flex; gap: 10px; margin-bottom: 10px; flex-wrap: wrap; }
      .sa-input-row input { flex: 1; padding: 8px; border: 1px solid #333; min-width: 150px; }
      .sa-options { display: flex; gap: 15px; font-size: 13px; margin-bottom: 10px; flex-wrap: wrap; }
      .sa-btns { display: flex; gap: 8px; flex-wrap: wrap; }
      .sa-btns button {
        padding: 8px 12px;
        cursor: pointer;
        font-weight: bold;
        background: #fff;
        border: 1px solid #000;
      }
      .sa-btns .primary { background: #000; color: #fff; }
      .sa-status { font-size: 12px; margin-top: 8px; font-style: italic; }
    `;
    document.head.appendChild(style);
  }

  window.SiteApps.register("replacer", (container) => {
    ensureStyle();
    
    container.innerHTML = `
      <div class="sa-replacer-box">
        <h3>Text Search & Replace</h3>
        
        <label><b>Input Text:</b></label>
        <textarea id="sa-in" placeholder="Paste text here..."></textarea>

        <div class="sa-replacer-controls">
          <div class="sa-input-row">
            <input type="text" id="sa-find" placeholder="Find...">
            <input type="text" id="sa-replace" placeholder="Replace with...">
          </div>
          
          <div class="sa-options">
            <label><input type="checkbox" id="sa-case"> Case Sensitive</label>
            <label><input type="radio" name="sa-pos" value="any" checked> Anywhere</label>
            <label><input type="radio" name="sa-pos" value="start"> Start of Line</label>
            <label><input type="radio" name="sa-pos" value="end"> End of Line</label>
          </div>

          <div class="sa-btns">
            <button class="primary" id="sa-btn-filter">🔍 Filter Lines</button>
            <button class="primary" id="sa-btn-all">🔁 Replace All</button>
            <button id="sa-btn-step">⏯️ Step</button>
            <button id="sa-btn-copy">📋 Copy Result</button>
            <button id="sa-btn-clear">Clear</button>
          </div>
          <div id="sa-st" class="sa-status"></div>
        </div>

        <label><b>Result:</b></label>
        <textarea id="sa-out" readonly placeholder="Output shows here..."></textarea>
      </div>
    `;

    const elIn = container.querySelector("#sa-in");
    const elOut = container.querySelector("#sa-out");
    const elFind = container.querySelector("#sa-find");
    const elRep = container.querySelector("#sa-replace");
    const elCase = container.querySelector("#sa-case");
    const elSt = container.querySelector("#sa-st");

    const getReg = (global) => {
      let t = elFind.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pos = container.querySelector('input[name="sa-pos"]:checked').value;
      if (pos === "start") t = "^" + t;
      if (pos === "end") t = t + "$";
      return new RegExp(t, (global ? "g" : "") + (elCase.checked ? "" : "i") + (pos !== "any" ? "m" : ""));
    };

    container.querySelector("#sa-btn-filter").onclick = () => {
      if (!elFind.value) return elSt.textContent = "Enter a search term.";
      const rx = getReg(true);
      const lines = elIn.value.split(/\n/);
      const matches = lines.filter(l => rx.test(l));
      elOut.value = matches.join("\n");
      elSt.textContent = `Found ${matches.length} lines.`;
    };

    container.querySelector("#sa-btn-all").onclick = () => {
      elOut.value = elIn.value.replace(getReg(true), elRep.value);
      elSt.textContent = "Done.";
    };

    container.querySelector("#sa-btn-step").onclick = () => {
      const rx = getReg(false);
      if (rx.test(elIn.value)) {
        elIn.value = elIn.value.replace(rx, elRep.value);
        elOut.value = elIn.value;
        elSt.textContent = "One replacement made.";
      } else {
        elSt.textContent = "No matches.";
      }
    };

    container.querySelector("#sa-btn-copy").onclick = () => {
      navigator.clipboard.writeText(elOut.value);
      elSt.textContent = "Copied!";
    };

    container.querySelector("#sa-btn-clear").onclick = () => {
      elIn.value = ""; elOut.value = ""; elSt.textContent = "";
    };
  });
})();
