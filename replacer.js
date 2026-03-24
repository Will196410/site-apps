(() => {
  "use strict";

  window.SiteApps = window.SiteApps || {};
  window.SiteApps.registry = window.SiteApps.registry || {};
  window.SiteApps.register = window.SiteApps.register || function (name, initFn) {
    window.SiteApps.registry[name] = initFn;
  };

  const STYLE_ID = "siteapps-replacer-v5";

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .sa-wrap { font-family: -apple-system, sans-serif; color: #000; background: #fff; border: 3px solid #000; padding: 20px; border-radius: 12px; width: 100%; box-sizing: border-box; }
      .sa-wrap * { box-sizing: border-box; }
      .sa-wrap textarea { width: 100%; height: 180px; margin: 8px 0; border: 2px solid #000; font-family: ui-monospace, monospace; padding: 12px; border-radius: 8px; font-size: 14px; }
      .sa-panel { background: #fdfdfd; padding: 15px; border: 2px solid #000; border-radius: 8px; margin: 10px 0; }
      .sa-flex { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 12px; }
      .sa-flex input { flex: 1; padding: 12px; border: 2px solid #000; border-radius: 6px; font-size: 15px; }
      .sa-checks { display: flex; gap: 15px; font-size: 13px; font-weight: 800; margin-bottom: 15px; flex-wrap: wrap; align-items: center; }
      .sa-btns { display: flex; gap: 8px; flex-wrap: wrap; }
      .sa-btns button { padding: 10px 16px; cursor: pointer; font-weight: 900; background: #fff; border: 2px solid #000; border-radius: 6px; font-size: 12px; text-transform: uppercase; }
      .sa-btns .btn-black { background: #000; color: #fff; }
      .sa-btns .btn-green { background: #15803d; color: #fff; border-color: #15803d; }
      .sa-status { font-size: 13px; margin-top: 12px; font-weight: 700; color: #2563eb; min-height: 1.2em; }
    `;
    document.head.appendChild(style);
  }

  window.SiteApps.register("replacer", (container) => {
    ensureStyle();
    
    container.innerHTML = `
      <div class="sa-wrap">
        <label><b>1. PASTE TEXT HERE</b></label>
        <textarea id="sa-in" placeholder="Paste your 30+ lines of text here..."></textarea>

        <div class="sa-panel">
          <div class="sa-flex">
            <input type="text" id="sa-find" placeholder="Search (e.g. location or rain)">
            <input type="text" id="sa-replace" placeholder="Replace with...">
          </div>
          
          <div class="sa-checks">
            <label style="display:flex;align-items:center;gap:5px"><input type="checkbox" id="sa-case"> Case Sensitive</label>
            <label><input type="radio" name="sa-p" value="any" checked> Anywhere</label>
            <label><input type="radio" name="sa-p" value="start"> Start of Line</label>
            <label><input type="radio" name="sa-p" value="end"> End of Line</label>
          </div>

          <div class="sa-btns">
            <button class="btn-black" id="btn-filter">🔍 Filter Lines</button>
            <button class="btn-black" id="btn-all">🔁 Replace All</button>
            <button id="btn-step">⏯️ Step</button>
            <button class="btn-green" id="btn-copy-out">📋 Copy Result</button>
            <button class="btn-green" id="btn-copy-match">✂️ Copy Matched Words</button>
            <button id="btn-clear">Clear</button>
          </div>
          <div id="sa-st" class="sa-status"></div>
        </div>

        <label><b>2. VIEW RESULTS</b></label>
        <textarea id="sa-out" readonly placeholder="Matching lines or replaced text will show here..."></textarea>
      </div>
    `;

    const elIn = container.querySelector("#sa-in");
    const elOut = container.querySelector("#sa-out");
    const elFind = container.querySelector("#sa-find");
    const elRep = container.querySelector("#sa-replace");
    const elCase = container.querySelector("#sa-case");
    const elSt = container.querySelector("#sa-st");

    const getRegex = (isGlobal) => {
      // Escape special chars but handle the curly quote bug
      let pattern = elFind.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/['’]/g, "['’]");
      const pos = container.querySelector('input[name="sa-p"]:checked').value;
      
      if (pos === "start") pattern = "^" + pattern;
      if (pos === "end") pattern = pattern + "$";
      
      const flags = (isGlobal ? "g" : "") + (elCase.checked ? "" : "i") + (pos !== "any" ? "m" : "");
      return new RegExp(pattern, flags);
    };

    // Filter Logic
    container.querySelector("#btn-filter").onclick = () => {
      const query = elFind.value.trim();
      if (!query) return elSt.textContent = "Please enter a search term.";
      
      const rx = getRegex(false); // test line by line
      const lines = elIn.value.split(/\r?\n/);
      const matches = lines.filter(line => rx.test(line.trim()));
      
      elOut.value = matches.join("\n");
      elSt.textContent = `Found ${matches.length} matching lines.`;
    };

    // Replace All Logic
    container.querySelector("#btn-all").onclick = () => {
      const rx = getRegex(true);
      elOut.value = elIn.value.replace(rx, elRep.value);
      elSt.textContent = "Replaced all occurrences in Result box.";
    };

    // Step Logic
    container.querySelector("#btn-step").onclick = () => {
      const rx = getRegex(false);
      if (rx.test(elIn.value)) {
        elIn.value = elIn.value.replace(rx, elRep.value);
        elOut.value = elIn.value;
        elSt.textContent = "Replaced next occurrence.";
      } else {
        elSt.textContent = "No more matches in Input.";
      }
    };

    // COPY MATCHED WORDS (Requested Feature)
    container.querySelector("#btn-copy-match").onclick = () => {
      const rx = getRegex(true);
      const allMatches = elIn.value.match(rx);
      if (allMatches) {
        const textToCopy = allMatches.join("\n");
        navigator.clipboard.writeText(textToCopy);
        elSt.textContent = `Copied ${allMatches.length} matching words to clipboard!`;
      } else {
        elSt.textContent = "No specific words found to copy.";
      }
    };

    container.querySelector("#btn-copy-out").onclick = () => {
      if (!elOut.value) return;
      navigator.clipboard.writeText(elOut.value);
      elSt.textContent = "Result copied!";
    };

    container.querySelector("#btn-clear").onclick = () => {
      elIn.value = ""; elOut.value = ""; elSt.textContent = "Cleared.";
    };
  });
})();
