(() => {
  "use strict";

  window.SiteApps = window.SiteApps || {};
  window.SiteApps.registry = window.SiteApps.registry || {};
  window.SiteApps.register = window.SiteApps.register || function (name, initFn) {
    window.SiteApps.registry[name] = initFn;
  };

  const STYLE_ID = "siteapps-analyzer-v7-full";
  const STORAGE_KEY = "siteapps:analyzer:v7:config";
  const DEFAULT_FILTERS = ["just", "very", "really", "felt", "feel", "think", "thought", "actually", "suddenly", "started to", "began to", "seemed", "looked"];

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      [data-app="analyzer"] { font-family: ui-sans-serif, system-ui, sans-serif; background: #fff; padding: 20px; color: #000; max-width: 100%; }
      [data-app="analyzer"] .section { margin-bottom: 30px; }
      [data-app="analyzer"] .frame { border: 2px solid #000; background: #fff; border-radius: 4px; overflow: hidden; }
      
      /* Drafting Area */
      [data-app="analyzer"] #input-text { width: 100%; min-height: 500px; border: none; padding: 20px; font-family: ui-monospace, monospace; font-size: 16px; line-height: 1.6; outline: none; box-sizing: border-box; display: block; }

      /* Control Bar */
      [data-app="analyzer"] .control-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
      [data-app="analyzer"] .panel { background: #f9f9f9; padding: 15px; border: 2px solid #000; border-radius: 4px; }
      [data-app="analyzer"] .switch-item { display: flex; align-items: center; gap: 10px; font-weight: 900; text-transform: uppercase; font-size: 12px; margin-bottom: 8px; cursor: pointer; }

      /* Filter Table */
      [data-app="analyzer"] .filter-input-group { display: flex; gap: 5px; margin-bottom: 10px; }
      [data-app="analyzer"] .filter-input-group input { flex: 1; padding: 8px; border: 2px solid #000; outline: none; }
      [data-app="analyzer"] .btn-small { background: #000; color: #fff; border: none; padding: 8px 12px; cursor: pointer; font-weight: bold; text-transform: uppercase; font-size: 11px; }
      [data-app="analyzer"] .btn-small:hover { background: #ffff00; color: #000; }
      [data-app="analyzer"] .filter-table-wrap { max-height: 200px; overflow-y: auto; border: 1px solid #ddd; background: #fff; }
      [data-app="analyzer"] table { width: 100%; border-collapse: collapse; font-size: 13px; }
      [data-app="analyzer"] th { background: #eee; padding: 8px; text-align: left; position: sticky; top: 0; }
      [data-app="analyzer"] td { padding: 6px 8px; border-bottom: 1px solid #eee; }

      /* Buttons & Stats */
      [data-app="analyzer"] .btn-main { background: #000; color: #fff; border: 2px solid #000; padding: 18px; font-weight: 900; font-size: 18px; cursor: pointer; text-transform: uppercase; width: 100%; margin-bottom: 40px; }
      [data-app="analyzer"] .btn-main:hover { background: #ffff00; color: #000; }
      
      [data-app="analyzer"] .stats-banner { display: flex; gap: 20px; background: #000; color: #fff; padding: 15px; font-weight: 900; font-size: 14px; margin-bottom: 20px; flex-wrap: wrap; }
      [data-app="analyzer"] .grade-info { font-size: 12px; color: #666; margin-bottom: 20px; }

      /* Annotations */
      [data-app="analyzer"] .line-container { display: flex; border-bottom: 1px solid #f0f0f0; }
      [data-app="analyzer"] .line-num { width: 45px; color: #aaa; text-align: right; padding-right: 12px; border-right: 1px solid #eee; margin-right: 12px; font-family: monospace; user-select: none; }
      [data-app="analyzer"] .line-txt { flex: 1; white-space: pre-wrap; padding: 4px 0; font-family: ui-monospace, monospace; line-height: 1.6; }
      [data-app="analyzer"] mark.hl { background: #000; color: #ffff00; padding: 0 2px; font-weight: bold; }
      [data-app="analyzer"] .summary-box { background: #000; color: #ffff00; padding: 15px; margin-bottom: 20px; font-family: monospace; border-left: 10px solid #ffff00; }
    `;
    document.head.appendChild(style);
  }

  function getARI(chars, words, sentences) {
    if (words === 0 || sentences === 0) return 0;
    return 4.71 * (chars / words) + 0.5 * (words / sentences) - 21.43;
  }

  window.SiteApps.register("analyzer", (container) => {
    ensureStyle();
    
    // Initial State
    let config = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
      text: "",
      filters: [...DEFAULT_FILTERS],
      switches: { summary: true, sentenceLen: true, repeats: true, filterWords: true }
    };

    const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(config));

    container.innerHTML = `
      <div class="section">
        <h2>Drafting Area</h2>
        <div class="frame"><textarea id="input-text" placeholder="Paste your text here..."></textarea></div>
      </div>

      <div class="control-grid">
        <div class="panel">
          <h3>Filter Management</h3>
          <div class="filter-input-group">
            <input type="text" id="new-filter" placeholder="Add word...">
            <button class="btn-small" id="add-filter">Add</button>
            <button class="btn-small" id="reset-filters">Reset Defaults</button>
          </div>
          <div class="filter-table-wrap">
            <table>
              <thead><tr><th>Word</th><th style="width:40px"></th></tr></thead>
              <tbody id="filter-body"></tbody>
            </table>
          </div>
        </div>
        <div class="panel">
          <h3>Options & Switches</h3>
          <label class="switch-item"><input type="checkbox" id="sw-summary"> Show Issues Summary</label>
          <label class="switch-item"><input type="checkbox" id="sw-filterWords"> Check Filter Words</label>
          <label class="switch-item"><input type="checkbox" id="sw-repeats"> Check Repetitions</label>
          <label class="switch-item"><input type="checkbox" id="sw-sentenceLen"> Check Sentence Length</label>
          <p style="font-size:10px; margin-top:10px; opacity:0.7">Sentence Check flags $>30$ words (Long) or $<5$ words (Choppy).</p>
        </div>
      </div>

      <button class="btn-main" id="refresh-btn">Analyze & Save</button>

      <div id="results" style="display:none;">
        <div class="stats-banner" id="stats-banner"></div>
        <div class="grade-info" id="grade-info"></div>
        <div id="summary-view"></div>
        <div class="frame"><div id="annotated-view"></div></div>
      </div>
    `;

    const els = {
      input: container.querySelector("#input-text"),
      filterBody: container.querySelector("#filter-body"),
      newFilter: container.querySelector("#new-filter"),
      addBtn: container.querySelector("#add-filter"),
      resetBtn: container.querySelector("#reset-filters"),
      refresh: container.querySelector("#refresh-btn"),
      results: container.querySelector("#results"),
      stats: container.querySelector("#stats-banner"),
      grade: container.querySelector("#grade-info"),
      summary: container.querySelector("#summary-view"),
      annotated: container.querySelector("#annotated-view"),
      swSummary: container.querySelector("#sw-summary"),
      swFilters: container.querySelector("#sw-filterWords"),
      swRepeats: container.querySelector("#sw-repeats"),
      swSent: container.querySelector("#sw-sentenceLen")
    };

    const renderFilters = () => {
      els.filterBody.innerHTML = config.filters.sort().map(f => `
        <tr><td>${f}</td><td><button class="btn-small btn-del" data-word="${f}">×</button></td></tr>
      `).join('');
    };

    // UI Initialization
    els.input.value = config.text;
    els.swSummary.checked = config.switches.summary;
    els.swFilters.checked = config.switches.filterWords;
    els.swRepeats.checked = config.switches.repeats;
    els.swSent.checked = config.switches.sentenceLen;
    renderFilters();

    // Event Handlers
    els.addBtn.onclick = () => {
      const val = els.newFilter.value.trim().toLowerCase();
      if (val && !config.filters.includes(val)) {
        config.filters.push(val);
        els.newFilter.value = "";
        renderFilters();
        save();
      }
    };

    els.filterBody.onclick = (e) => {
      if (e.target.classList.contains('btn-del')) {
        config.filters = config.filters.filter(f => f !== e.target.dataset.word);
        renderFilters();
        save();
      }
    };

    els.resetBtn.onclick = () => {
      config.filters = [...DEFAULT_FILTERS];
      renderFilters();
      save();
    };

    els.refresh.onclick = () => {
      const text = els.input.value;
      config.text = text;
      config.switches = {
        summary: els.swSummary.checked,
        filterWords: els.swFilters.checked,
        repeats: els.swRepeats.checked,
        sentenceLen: els.swSent.checked
      };
      save();

      const lines = text.split('\n');
      const issues = [];
      const filterSet = new Set(config.filters);
      const lastSeen = new Map();
      let wordTotal = 0;
      let charTotal = 0;

      // Analysis Loop
      lines.forEach((line, lIdx) => {
        const words = line.match(/\b[\w'-]+\b/g) || [];
        const sentences = line.split(/[.!?]+/).filter(s => s.trim().length > 0);

        // Sentence Length Check
        if (config.switches.sentenceLen) {
          sentences.forEach(s => {
            const sWords = s.match(/\b[\w'-]+\b/g) || [];
            if (sWords.length > 30) issues.push({ line: lIdx + 1, type: "Long Sentence", word: `(${sWords.length} words)` });
            if (sWords.length > 0 && sWords.length < 5) issues.push({ line: lIdx + 1, type: "Choppy", word: `(${sWords.length} words)` });
          });
        }

        words.forEach(word => {
          const clean = word.toLowerCase();
          wordTotal++;
          charTotal += clean.length;

          if (config.switches.filterWords && filterSet.has(clean)) {
            issues.push({ line: lIdx + 1, type: "Filter", word });
          }

          if (config.switches.repeats && clean.length > 3) {
            if (lastSeen.has(clean)) {
              if (wordTotal - lastSeen.get(clean) <= 15) issues.push({ line: lIdx + 1, type: "Repeat", word });
            }
            lastSeen.set(clean, wordTotal);
          }
        });
      });

      const sentenceCount = text.split(/[.!?]+/).filter(Boolean).length || 1;
      const ari = Math.round(getARI(charTotal, wordTotal, sentenceCount));

      // Display Results
      els.results.style.display = "block";
      els.stats.innerHTML = `
        <span>WORDS: ${wordTotal}</span>
        <span>READ TIME: ~${Math.ceil(wordTotal / 225)}M</span>
        <span>SPOKEN: ~${Math.ceil(wordTotal / 140)}M</span>
        <span>ARI GRADE: ${ari}</span>
      `;

      els.grade.innerHTML = `The complexity level is comparable to <strong>Grade ${ari}</strong>. (Formula: $4.71 \times (\frac{\text{chars}}{\text{words}}) + 0.5 \times (\frac{\text{words}}{\text{sentences}}) - 21.43$)`;

      els.summary.innerHTML = (config.switches.summary && issues.length) ? `
        <div class="summary-box">
          <strong>CRITICAL ISSUES (${issues.length}):</strong><br>
          ${issues.map(i => `L${i.line} [${i.type}] ${i.word}`).join('<br>')}
        </div>
      ` : "";

      const issueWords = new Set(issues.filter(i => i.type !== "Long Sentence" && i.type !== "Choppy").map(i => i.word.toLowerCase()));
      
      els.annotated.innerHTML = lines.map((line, idx) => {
        const content = line.split(/(\b\w+\b)/g).map(t => 
          issueWords.has(t.toLowerCase().trim()) ? `<mark class="hl">${t}</mark>` : t
        ).join('');
        return `<div class="line-container"><div class="line-num">${idx+1}</div><div class="line-txt">${content}</div></div>`;
      }).join('');
      
      els.results.scrollIntoView({ behavior: 'smooth' });
    };

    if (config.text) els.refresh.click();
  });
})();
