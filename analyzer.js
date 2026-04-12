(() => {
  "use strict";

  window.SiteApps = window.SiteApps || {};
  window.SiteApps.registry = window.SiteApps.registry || {};
  window.SiteApps.register = window.SiteApps.register || function (name, initFn) {
    window.SiteApps.registry[name] = initFn;
  };

  const STYLE_ID = "siteapps-analyzer-v6-pro";
  const STORAGE_KEY = "siteapps:analyzer:v6:state";

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      [data-app="analyzer"] {
        font-family: ui-sans-serif, system-ui, sans-serif;
        background: #fff;
        padding: 20px;
        color: #000;
        max-width: 100%;
      }

      [data-app="analyzer"] .section { margin-bottom: 25px; }
      [data-app="analyzer"] .frame { border: 2px solid #000; background: #fff; border-radius: 4px; overflow: hidden; }
      
      [data-app="analyzer"] textarea, 
      [data-app="analyzer"] input[type="text"] {
        width: 100%;
        border: none;
        padding: 15px;
        font-family: ui-monospace, monospace;
        font-size: 16px;
        outline: none;
        box-sizing: border-box;
      }

      [data-app="analyzer"] .options-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
        padding: 15px;
        background: #f0f0f0;
        border: 2px solid #000;
        border-bottom: none;
      }

      [data-app="analyzer"] .option-item { font-weight: 900; text-transform: uppercase; font-size: 12px; display: flex; align-items: center; gap: 8px; }

      [data-app="analyzer"] .btn-refresh {
        background: #000; color: #fff; border: 2px solid #000;
        padding: 15px; font-weight: 900; font-size: 18px;
        cursor: pointer; text-transform: uppercase; width: 100%;
      }
      [data-app="analyzer"] .btn-refresh:hover { background: #ffff00; color: #000; }

      /* Tables & Lists */
      [data-app="analyzer"] table { width: 100%; border-collapse: collapse; margin-top: 10px; }
      [data-app="analyzer"] th { background: #000; color: #fff; text-align: left; padding: 10px; cursor: pointer; text-transform: uppercase; font-size: 12px; }
      [data-app="analyzer"] td { padding: 8px 10px; border-bottom: 1px solid #ddd; font-family: monospace; }
      [data-app="analyzer"] .freq-row:hover { background: #ffff00; color: #000; }

      [data-app="analyzer"] .issue-summary { background: #000; color: #fff; padding: 15px; margin-bottom: 20px; }
      [data-app="analyzer"] .issue-item { color: #ffff00; font-family: monospace; margin-bottom: 4px; font-weight: bold; }
      
      [data-app="analyzer"] .line-container { display: flex; border-bottom: 1px solid #eee; }
      [data-app="analyzer"] .line-number { width: 50px; color: #888; text-align: right; padding-right: 15px; border-right: 1px solid #ddd; margin-right: 15px; background: #fafafa; }
      [data-app="analyzer"] .line-content { flex: 1; white-space: pre-wrap; padding: 2px 0; font-family: ui-monospace, monospace; }
      
      [data-app="analyzer"] mark.highlight { background: #000; color: #ffff00; padding: 0 2px; font-weight: bold; }
      [data-app="analyzer"] .ari-guide { font-size: 12px; background: #eee; padding: 10px; margin-top: 10px; border-radius: 4px; }
    `;
    document.head.appendChild(style);
  }

  const DEFAULT_FILTERS = ["just", "very", "really", "felt", "feel", "think", "thought", "actually", "suddenly", "started to", "began to"];

  function runAnalysis(text, options) {
    const lines = text.split('\n');
    const issues = [];
    const freqMap = {};
    const lastSeen = new Map();
    const customWords = options.customFilters.split(',').map(w => w.trim().toLowerCase()).filter(Boolean);
    const filterSet = new Set([...DEFAULT_FILTERS, ...customWords]);

    let wordCount = 0;
    let charCount = 0;
    
    lines.forEach((line, lIdx) => {
      const words = line.match(/\b[\w'-]+\b/g) || [];
      words.forEach(word => {
        const clean = word.toLowerCase();
        wordCount++;
        charCount += clean.length;
        freqMap[clean] = (freqMap[clean] || 0) + 1;

        if (options.showFilters && filterSet.has(clean)) {
          issues.push({ line: lIdx + 1, word: word, type: "Filter" });
        }

        if (options.showRepeats && clean.length > 3) {
          if (lastSeen.has(clean)) {
            const prevIdx = lastSeen.get(clean);
            if (wordCount - prevIdx <= 15) issues.push({ line: lIdx + 1, word: word, type: "Repeat" });
          }
          lastSeen.set(clean, wordCount);
        }
      });
    });

    const sentences = text.split(/[.!?]+/).filter(Boolean).length || 1;
    const ari = 4.71 * (charCount / (wordCount || 1)) + 0.5 * (wordCount / sentences) - 21.43;

    return { 
      issues, 
      wordCount, 
      freqMap,
      silentTime: Math.ceil(wordCount / 225),
      spokenTime: Math.ceil(wordCount / 140),
      grade: Math.max(1, Math.round(ari)) 
    };
  }

  function getGradeMeaning(grade) {
    if (grade <= 6) return "Elementary (Easy to read)";
    if (grade <= 8) return "Middle School (Conversational)";
    if (grade <= 12) return "High School (Standard Prose)";
    if (grade <= 14) return "College (Academic/Technical)";
    return "Professor/Doctorate (Complex/Dense)";
  }

  window.SiteApps.register("analyzer", (container) => {
    ensureStyle();
    container.setAttribute("data-app", "analyzer");

    container.innerHTML = `
      <div class="section">
        <h2>Drafting Area</h2>
        <div class="frame"><textarea id="input-text" placeholder="Paste text here..."></textarea></div>
      </div>

      <div class="options-grid">
        <label class="option-item"><input type="checkbox" id="check-filters" checked> Filter Words</label>
        <label class="option-item"><input type="checkbox" id="check-repeats" checked> Repetitions</label>
        <div style="grid-column: 1 / -1;">
          <label class="option-item" style="margin-bottom:5px;">Custom Filter Words (comma separated)</label>
          <div class="frame"><input type="text" id="custom-filters" placeholder="e.g. atmospheric, definitely, basically"></div>
        </div>
      </div>
      <button class="btn-refresh" id="refresh-btn">Update Analysis & Save</button>

      <div id="results-section" style="display:none;">
        <div class="section">
          <h2>Reading Stats</h2>
          <div id="stats" style="font-weight:900; margin-bottom:10px; display:flex; gap:20px; flex-wrap:wrap;"></div>
          <div class="ari-guide" id="ari-guide"></div>
        </div>

        <div class="section">
          <h2>Word Frequency</h2>
          <div class="frame" style="max-height:200px; overflow-y:auto;">
            <table id="freq-table">
              <thead><tr><th data-sort="word">Word</th><th data-sort="count">Count</th></tr></thead>
              <tbody id="freq-body"></tbody>
            </table>
          </div>
        </div>

        <div class="issue-summary" id="issue-list"></div>

        <div class="section">
          <h2>Annotated Inspector</h2>
          <div class="frame"><div id="annotated-text"></div></div>
        </div>
      </div>
    `;

    const els = {
      input: container.querySelector("#input-text"),
      refresh: container.querySelector("#refresh-btn"),
      results: container.querySelector("#results-section"),
      stats: container.querySelector("#stats"),
      guide: container.querySelector("#ari-guide"),
      issueList: container.querySelector("#issue-list"),
      annotated: container.querySelector("#annotated-text"),
      freqBody: container.querySelector("#freq-body"),
      filterChk: container.querySelector("#check-filters"),
      repeatChk: container.querySelector("#check-repeats"),
      customInp: container.querySelector("#custom-filters")
    };

    // Load State
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    if (saved.text) {
      els.input.value = saved.text;
      els.filterChk.checked = saved.filters;
      els.repeatChk.checked = saved.repeats;
      els.customInp.value = saved.custom || "";
    }

    function update() {
      const text = els.input.value;
      const options = {
        showFilters: els.filterChk.checked,
        showRepeats: els.repeatChk.checked,
        customFilters: els.customInp.value
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        text, filters: options.showFilters, repeats: options.showRepeats, custom: options.customFilters
      }));

      const data = runAnalysis(text, options);
      els.results.style.display = "block";

      els.stats.innerHTML = `
        <span>WORDS: ${data.wordCount}</span>
        <span>SILENT: ~${data.silentTime}m</span>
        <span>SPOKEN: ~${data.spokenTime}m</span>
        <span>ARI GRADE: ${data.grade}</span>
      `;

      els.guide.innerHTML = `<strong>Grade ${data.grade} Meaning:</strong> ${getGradeMeaning(data.grade)}<br>
        <small>The Automated Readability Index (ARI) uses the formula: $4.71 \times (\frac{\text{chars}}{\text{words}}) + 0.5 \times (\frac{\text{words}}{\text{sentences}}) - 21.43$</small>`;

      // Frequency Table
      const freqArray = Object.entries(data.freqMap).sort((a, b) => b[1] - a[1]);
      els.freqBody.innerHTML = freqArray.slice(0, 50).map(([w, c]) => `<tr class="freq-row"><td>${w}</td><td>${c}</td></tr>`).join('');

      // Issues
      els.issueList.innerHTML = `<h3>Issues (${data.issues.length})</h3>`;
      data.issues.forEach(iss => {
        els.issueList.innerHTML += `<div class="issue-item">L${iss.line} [${iss.type}] "${iss.word}"</div>`;
      });

      // Annotations
      const issueWords = new Set(data.issues.map(i => i.word.toLowerCase()));
      els.annotated.innerHTML = text.split('\n').map((line, idx) => {
        const content = line.split(/(\b\w+\b)/g).map(t => 
          issueWords.has(t.toLowerCase().trim()) ? `<mark class="highlight">${t}</mark>` : t
        ).join('');
        return `<div class="line-container"><div class="line-number">${idx+1}</div><div class="line-content">${content}</div></div>`;
      }).join('');
    }

    els.refresh.addEventListener("click", update);
    if (els.input.value) update();
  });
})();
