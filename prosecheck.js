(() => {
  "use strict";

  window.SiteApps = window.SiteApps || {};
  window.SiteApps.registry = window.SiteApps.registry || {};
  window.SiteApps.register = window.SiteApps.register || function (name, initFn) {
    window.SiteApps.registry[name] = initFn;
  };

  const STYLE_ID = "siteapps-analyzer-style-v1";

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      [data-app="analyzer"] {
        font-family: ui-sans-serif, system-ui, sans-serif;
        background: #000; /* High contrast black */
        color: #fff;
        padding: 20px;
        border: 4px solid #fff;
        border-radius: 8px;
        width: min(100%, 1200px);
        margin: 20px auto;
        box-sizing: border-box;
      }

      /* Accessibility: High Contrast Focus */
      [data-app="analyzer"] *:focus {
        outline: 4px solid #ffff00 !important;
      }

      [data-app="analyzer"] h3 { font-size: 24px; color: #ffff00; margin-top: 0; }
      
      [data-app="analyzer"] .layout {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
      }

      [data-app="analyzer"] textarea {
        width: 100%;
        min-height: 500px;
        background: #111;
        color: #fff;
        border: 2px solid #fff;
        padding: 15px;
        font-family: ui-monospace, monospace;
        font-size: 16px;
        resize: vertical;
      }

      [data-app="analyzer"] .report-view {
        background: #fff;
        color: #000;
        padding: 15px;
        border-radius: 4px;
        height: 500px;
        overflow-y: auto;
        border: 4px solid #ffff00;
      }

      [data-app="analyzer"] .stats-bar {
        display: flex;
        gap: 15px;
        margin-bottom: 15px;
        flex-wrap: wrap;
      }

      [data-app="analyzer"] .stat-pill {
        background: #000;
        color: #ffff00;
        padding: 5px 12px;
        font-weight: 900;
        border: 2px solid #000;
        font-size: 14px;
      }

      [data-app="analyzer"] .issue-item {
        border-left: 8px solid #000;
        padding: 10px;
        margin-bottom: 10px;
        background: #f0f0f0;
        font-size: 14px;
      }

      [data-app="analyzer"] .issue-line {
        font-weight: 900;
        background: #000;
        color: #fff;
        padding: 2px 6px;
        margin-right: 8px;
      }

      /* High Contrast Annotations */
      [data-app="analyzer"] .annotated-text {
        line-height: 1.6;
        white-space: pre-wrap;
        font-family: serif;
        font-size: 18px;
        margin-top: 20px;
        padding: 15px;
        border-top: 4px solid #000;
      }

      [data-app="analyzer"] mark.repetition {
        background: #000;
        color: #ffff00;
        font-weight: bold;
        text-decoration: underline;
        padding: 0 2px;
      }

      [data-app="analyzer"] .btn-refresh {
        background: #ffff00;
        color: #000;
        border: 4px solid #000;
        padding: 12px 24px;
        font-weight: 900;
        cursor: pointer;
        text-transform: uppercase;
        margin-top: 10px;
      }

      @media (max-width: 900px) {
        [data-app="analyzer"] .layout { grid-template-columns: 1fr; }
      }
    `;
    document.head.appendChild(style);
  }

  function calculateReadability(text) {
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const chars = text.replace(/\s/g, "").length;

    if (words.length === 0 || sentences.length === 0) return { score: 0, label: "N/A" };

    // Automated Readability Index (ARI)
    const score = 4.71 * (chars / words.length) + 0.5 * (words.length / sentences.length) - 21.43;
    
    let label = "Expert";
    if (score < 14) label = "Professor";
    if (score < 12) label = "College";
    if (score < 10) label = "High School";
    if (score < 8) label = "Middle School";
    if (score < 6) label = "Elementary";

    return { score: Math.round(score), label, wordCount: words.length };
  }

  function findIssues(text) {
    const lines = text.split('\n');
    const issues = [];
    const proximityMap = new Map(); // word -> last index seen
    const wordList = [];
    
    // Flatten words with line and local index metadata
    let globalIdx = 0;
    lines.forEach((line, lineIdx) => {
      const words = line.split(/(\s+)/); // Keep whitespace to reconstruct text exactly
      words.forEach(word => {
        const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
        if (cleanWord.length > 2) { // Only track words longer than 2 chars
          if (proximityMap.has(cleanWord)) {
            const lastSeenIdx = proximityMap.get(cleanWord);
            if (globalIdx - lastSeenIdx < 15) { // Proximity threshold
              issues.push({
                line: lineIdx + 1,
                word: word,
                type: "Repetition"
              });
            }
          }
          proximityMap.set(cleanWord, globalIdx);
        }
        wordList.push({ text: word, isIssue: false });
        if (cleanWord.length > 0) globalIdx++;
      });
    });

    return issues;
  }

  window.SiteApps.register("analyzer", (container) => {
    ensureStyle();
    container.innerHTML = `
      <div data-app="analyzer">
        <h3>Text Analysis Report</h3>
        <div class="layout">
          <div class="input-side">
            <textarea id="source-text" placeholder="Paste your text here..."></textarea>
            <button class="btn-refresh" id="refresh-btn">Update Analysis</button>
          </div>
          <div class="report-view" id="report-view">
            <p>Paste text and press Refresh to see issues.</p>
          </div>
        </div>
      </div>
    `;

    const sourceTA = container.querySelector("#source-text");
    const refreshBtn = container.querySelector("#refresh-btn");
    const reportView = container.querySelector("#report-view");

    function runAnalysis() {
      const text = sourceTA.value;
      if (!text.trim()) {
        reportView.innerHTML = "<p>Please enter some text.</p>";
        return;
      }

      const readability = calculateReadability(text);
      const issues = findIssues(text);
      const readingTime = Math.ceil(readability.wordCount / 225);

      let html = `
        <div class="stats-bar">
          <div class="stat-pill">Words: ${readability.wordCount}</div>
          <div class="stat-pill">Reading Time: ~${readingTime} min</div>
          <div class="stat-pill">Grade Level: ${readability.label} (${readability.score})</div>
        </div>
        <hr border="2" color="#000">
        <h4>Issues Found (${issues.length})</h4>
      `;

      if (issues.length === 0) {
        html += `<p>No repetitions found in close proximity. Great flow!</p>`;
      } else {
        issues.forEach(iss => {
          html += `
            <div class="issue-item">
              <span class="issue-line">Line ${iss.line}</span>
              <strong>"${iss.word}"</strong> repeated in close proximity.
            </div>
          `;
        });
      }

      // Annotated View
      html += `<h4>Annotated Text</h4><div class="annotated-text">`;
      
      const words = text.split(/(\b\w+\b)/g);
      const proximityCheck = new Map();
      let wordCounter = 0;

      words.forEach(part => {
        const clean = part.toLowerCase().replace(/[^\w]/g, '');
        if (clean.length > 2) {
          if (proximityCheck.has(clean) && (wordCounter - proximityCheck.get(clean) < 15)) {
            html += `<mark class="repetition">${part}</mark>`;
          } else {
            html += part;
          }
          proximityCheck.set(clean, wordCounter);
          wordCounter++;
        } else {
          html += part;
        }
      });

      html += `</div>`;
      reportView.innerHTML = html;
    }

    refreshBtn.addEventListener("click", runAnalysis);
  });
})();
