(() => {
  "use strict";

  window.SiteApps = window.SiteApps || {};
  window.SiteApps.registry = window.SiteApps.registry || {};
  window.SiteApps.register = window.SiteApps.register || function (name, initFn) {
    window.SiteApps.registry[name] = initFn;
  };

  const STYLE_ID = "siteapps-analyzer-v4-fullwidth";

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

      [data-app="analyzer"] .section {
        margin-bottom: 30px;
        width: 100%;
      }

      [data-app="analyzer"] .frame {
        border: 2px solid #000;
        background: #fff;
        border-radius: 4px;
        overflow: hidden;
      }

      [data-app="analyzer"] textarea {
        width: 100%;
        min-height: 300px;
        border: none;
        padding: 15px;
        font-family: ui-monospace, monospace;
        font-size: 16px;
        line-height: 1.5;
        outline: none;
        box-sizing: border-box;
        display: block;
      }

      [data-app="analyzer"] .btn-refresh {
        background: #000;
        color: #fff;
        border: 2px solid #000;
        padding: 12px 24px;
        font-weight: 900;
        font-size: 16px;
        cursor: pointer;
        text-transform: uppercase;
        margin-bottom: 20px;
      }

      [data-app="analyzer"] .btn-refresh:hover {
        background: #ffff00;
        color: #000;
      }

      /* Issue Summary List */
      [data-app="analyzer"] .issue-summary {
        background: #000;
        color: #fff;
        padding: 15px;
        margin-bottom: 20px;
      }

      [data-app="analyzer"] .issue-item {
        color: #ffff00; /* High Contrast Yellow */
        font-family: ui-monospace, monospace;
        margin-bottom: 4px;
        font-weight: bold;
      }

      [data-app="analyzer"] .issue-line-ref {
        color: #fff;
        margin-right: 10px;
        border: 1px solid #444;
        padding: 0 4px;
      }

      /* Results Text View */
      [data-app="analyzer"] .results-display {
        background: #fff;
        padding: 20px;
        font-family: ui-monospace, monospace;
        font-size: 15px;
        line-height: 1.6;
        color: #111;
      }

      [data-app="analyzer"] .line-container {
        display: flex;
        border-bottom: 1px solid #eee;
      }

      [data-app="analyzer"] .line-number {
        width: 40px;
        color: #999;
        text-align: right;
        padding-right: 15px;
        user-select: none;
        border-right: 1px solid #ddd;
        margin-right: 15px;
      }

      [data-app="analyzer"] .line-content {
        flex: 1;
        white-space: pre-wrap;
      }

      [data-app="analyzer"] mark.highlight {
        background: #000;
        color: #ffff00;
        padding: 0 2px;
        font-weight: bold;
      }

      [data-app="analyzer"] .stats-bar {
        display: flex;
        gap: 20px;
        margin-bottom: 10px;
        font-weight: 900;
        text-transform: uppercase;
        font-size: 13px;
      }

      [data-app="analyzer"] h2 {
        font-size: 18px;
        text-transform: uppercase;
        margin-bottom: 10px;
        border-left: 5px solid #000;
        padding-left: 10px;
      }
    `;
    document.head.appendChild(style);
  }

  const FILTERS = new Set([
    "just", "very", "really", "felt", "feel", "started to", "began to", "seemed", "actually", "suddenly"
  ]);

  function runAnalysis(text) {
    const lines = text.split('\n');
    const issues = [];
    const lastSeen = new Map();
    const proximity = 15;
    let globalWordIdx = 0;

    // Analysis Logic
    lines.forEach((line, lIdx) => {
      const words = line.match(/\b[\w'-]+\b/g) || [];
      words.forEach(word => {
        const clean = word.toLowerCase();
        
        // Check Filter Words
        if (FILTERS.has(clean)) {
          issues.push({ line: lIdx + 1, word: word, type: "Filter" });
        }

        // Check Repetition Proximity
        if (clean.length > 3) {
          if (lastSeen.has(clean)) {
            const prevIdx = lastSeen.get(clean);
            if (globalWordIdx - prevIdx <= proximity) {
              issues.push({ line: lIdx + 1, word: word, type: "Repeat" });
            }
          }
          lastSeen.set(clean, globalWordIdx);
        }
        globalWordIdx++;
      });
    });

    // Stats
    const wordCount = text.trim().split(/\s+/).length || 0;
    const charCount = text.replace(/\s/g, '').length;
    const sentences = text.split(/[.!?]+/).filter(Boolean).length || 1;
    const ari = 4.71 * (charCount / wordCount) + 0.5 * (wordCount / sentences) - 21.43;

    return { 
      issues, 
      wordCount, 
      readingTime: Math.ceil(wordCount / 225), 
      grade: Math.max(1, Math.round(ari)) 
    };
  }

  window.SiteApps.register("analyzer", (container) => {
    ensureStyle();
    container.setAttribute("data-app", "analyzer");

    container.innerHTML = `
      <div class="section">
        <h2>Input Text</h2>
        <div class="frame">
          <textarea id="input-text" placeholder="Paste your text fragment here..."></textarea>
        </div>
      </div>

      <button class="btn-refresh" id="refresh-btn">Refresh & Analyze</button>

      <div class="section" id="results-section" style="display:none;">
        <h2>Analysis Results</h2>
        <div id="stats" class="stats-bar"></div>
        
        <div class="issue-summary" id="issue-list"></div>

        <div class="frame">
          <div class="results-display" id="annotated-text"></div>
        </div>
      </div>
    `;

    const input = container.querySelector("#input-text");
    const refreshBtn = container.querySelector("#refresh-btn");
    const resultsSection = container.querySelector("#results-section");
    const statsBar = container.querySelector("#stats");
    const issueList = container.querySelector("#issue-list");
    const annotatedText = container.querySelector("#annotated-text");

    refreshBtn.addEventListener("click", () => {
      const text = input.value;
      if (!text.trim()) return;

      const data = runAnalysis(text);
      resultsSection.style.display = "block";

      // 1. Stats
      statsBar.innerHTML = `
        <span>Words: ${data.wordCount}</span>
        <span>Reading Time: ~${data.readingTime} min</span>
        <span>ARI Grade: ${data.grade}</span>
      `;

      // 2. Issue Summary (Listed First)
      issueList.innerHTML = `<h3>Issues Identified (${data.issues.length})</h3>`;
      if (data.issues.length === 0) {
        issueList.innerHTML += `<div class="issue-item">No issues found.</div>`;
      } else {
        data.issues.forEach(iss => {
          issueList.innerHTML += `
            <div class="issue-item">
              <span class="issue-line-ref">Line ${iss.line}</span> [${iss.type}] "${iss.word}"
            </div>
          `;
        });
      }

      // 3. Whole Text with Line Numbers & Highlights
      const issueWords = new Set(data.issues.map(i => i.word.toLowerCase()));
      const lines = text.split('\n');
      
      annotatedText.innerHTML = "";
      lines.forEach((line, idx) => {
        const lineRow = document.createElement("div");
        lineRow.className = "line-container";
        
        const num = document.createElement("div");
        num.className = "line-number";
        num.textContent = idx + 1;

        const content = document.createElement("div");
        content.className = "line-content";
        
        // Highlight logic
        const tokens = line.split(/(\b\w+\b)/g);
        tokens.forEach(token => {
          if (issueWords.has(token.toLowerCase().trim())) {
            const m = document.createElement("mark");
            m.className = "highlight";
            m.textContent = token;
            content.appendChild(m);
          } else {
            content.appendChild(document.createTextNode(token));
          }
        });

        lineRow.appendChild(num);
        lineRow.appendChild(content);
        annotatedText.appendChild(lineRow);
      });

      // Scroll to results
      resultsSection.scrollIntoView({ behavior: 'smooth' });
    });
  });
})();
