(() => {
  "use strict";

  // SiteApps Registry Setup
  window.SiteApps = window.SiteApps || {};
  window.SiteApps.registry = window.SiteApps.registry || {};
  window.SiteApps.register = window.SiteApps.register || function (name, initFn) {
    window.SiteApps.registry[name] = initFn;
  };

  const STYLE_ID = "siteapps-analyzer-final-v3";

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      [data-app="analyzer"] {
        font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
        background: #fff;
        padding: 20px;
        color: #000;
      }

      [data-app="analyzer"] .app-container {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
        max-width: 1300px;
        margin: 0 auto;
      }

      /* Nested Box Aesthetic (from your image) */
      [data-app="analyzer"] .nested-frame {
        background: #000;
        padding: 4px;
        border: 2px solid #000;
        box-shadow: 12px 12px 0px #000;
        border-radius: 4px;
      }

      [data-app="analyzer"] .content-area {
        background: #fff;
        border: 2px solid #000;
        height: 650px;
        overflow-y: auto;
        padding: 15px;
        position: relative;
      }

      [data-app="analyzer"] textarea {
        width: 100%;
        height: 100%;
        border: none;
        font-family: ui-monospace, monospace;
        font-size: 16px;
        line-height: 1.5;
        outline: none;
        color: #000;
        background: transparent;
      }

      [data-app="analyzer"] .btn-refresh {
        grid-column: 1 / -1;
        background: #000;
        color: #fff;
        border: 4px solid #000;
        padding: 15px;
        font-weight: 900;
        font-size: 20px;
        cursor: pointer;
        text-transform: uppercase;
        margin-top: 20px;
        transition: transform 0.1s;
      }

      [data-app="analyzer"] .btn-refresh:active {
        transform: translateY(4px);
      }

      /* High Contrast Issue List */
      [data-app="analyzer"] .issue-box {
        background: #000;
        color: #ffff00; /* Neon Yellow */
        padding: 10px;
        margin-bottom: 10px;
        font-weight: 800;
        border-left: 10px solid #fff;
        font-size: 14px;
      }

      [data-app="analyzer"] .line-tag {
        background: #fff;
        color: #000;
        padding: 2px 6px;
        margin-right: 10px;
        font-family: monospace;
      }

      [data-app="analyzer"] .stat-row {
        display: flex;
        gap: 10px;
        margin-bottom: 20px;
        flex-wrap: wrap;
      }

      [data-app="analyzer"] .badge {
        background: #000;
        color: #fff;
        padding: 8px 12px;
        font-weight: 900;
        text-transform: uppercase;
        font-size: 12px;
      }

      /* Annotations */
      [data-app="analyzer"] mark.issue {
        background: #000;
        color: #ffff00;
        font-weight: bold;
        padding: 0 2px;
        text-decoration: underline;
      }

      [data-app="analyzer"] h2 { margin-top: 0; text-transform: uppercase; border-bottom: 6px solid #000; display: inline-block; }

      @media (max-width: 900px) {
        [data-app="analyzer"] .app-container { grid-template-columns: 1fr; }
      }
    `;
    document.head.appendChild(style);
  }

  const FILTER_WORDS = new Set([
    "just", "really", "very", "felt", "feel", "think", "thought", "knew", "know", 
    "realized", "noticed", "decided", "started", "began", "seemed", "heard", "saw"
  ]);

  function getAnalysis(text) {
    const lines = text.split('\n');
    const allWordsWithMetadata = [];
    const issues = [];
    const proximityWindow = 15;
    const lastSeen = new Map();

    // Process text for issues
    let wordCount = 0;
    lines.forEach((line, lIdx) => {
      const tokens = line.split(/(\b\w+\b)/g);
      tokens.forEach(token => {
        const clean = token.toLowerCase().trim();
        const isWord = /^\w+$/.test(clean);
        
        if (isWord) {
          wordCount++;
          let issueFound = false;

          // 1. Check Filter Words
          if (FILTER_WORDS.has(clean)) {
            issues.push({ line: lIdx + 1, type: "Filter Word", word: token });
            issueFound = true;
          }

          // 2. Check Proximity (Echoes)
          if (clean.length > 3) {
            if (lastSeen.has(clean)) {
              const prevIdx = lastSeen.get(clean);
              if (wordCount - prevIdx <= proximityWindow) {
                issues.push({ line: lIdx + 1, type: "Repeated", word: token });
                issueFound = true;
              }
            }
            lastSeen.set(clean, wordCount);
          }
        }
      });
    });

    // Readability (ARI)
    const charCount = text.replace(/\s/g, '').length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length || 1;
    const ari = 4.71 * (charCount / (wordCount || 1)) + 0.5 * ((wordCount || 1) / sentences) - 21.43;
    const readingTime = Math.ceil(wordCount / 225);

    return { 
      issues, 
      wordCount, 
      readingTime, 
      grade: Math.max(1, Math.round(ari)),
      tokens: text.split(/(\b\w+\b)/g) 
    };
  }

  window.SiteApps.register("analyzer", (container) => {
    ensureStyle();
    container.setAttribute("data-app", "analyzer");
    
    container.innerHTML = `
      <div class="app-container">
        <div>
          <h2>Input Text</h2>
          <div class="nested-frame">
            <div class="content-area">
              <textarea id="source-input" placeholder="Paste your text here..."></textarea>
            </div>
          </div>
        </div>

        <div>
          <h2>Analysis View</h2>
          <div class="nested-frame">
            <div class="content-area" id="report-view">
              <p style="text-align:center; padding-top:100px;">Paste text and press Refresh to analyze.</p>
            </div>
          </div>
        </div>

        <button class="btn-refresh" id="refresh-btn">Refresh Analysis</button>
      </div>
    `;

    const input = container.querySelector("#source-input");
    const report = container.querySelector("#report-view");
    const btn = container.querySelector("#refresh-btn");

    btn.addEventListener("click", () => {
      const text = input.value;
      if (!text.trim()) return;

      const data = getAnalysis(text);

      // Header Stats
      let html = `
        <div class="stat-row">
          <div class="badge">Words: ${data.wordCount}</div>
          <div class="badge">Read Time: ${data.readingTime}m</div>
          <div class="badge">ARI Grade: ${data.grade}</div>
        </div>
        <hr style="border: 2px solid #000; margin-bottom: 20px;">
        <h3>Issues Found (${data.issues.length})</h3>
      `;

      // 1. Issues List (First)
      if (data.issues.length === 0) {
        html += `<p>No issues detected.</p>`;
      } else {
        data.issues.forEach(iss => {
          html += `
            <div class="issue-box">
              <span class="line-tag">Line ${iss.line}</span>
              [${iss.type}] : "${iss.word}"
            </div>
          `;
        });
      }

      // 2. Annotated View (Second)
      html += `
        <hr style="border: 2px solid #000; margin: 30px 0;">
        <h3>Annotated Text</h3>
        <div style="white-space: pre-wrap; line-height: 1.8; font-family: serif; font-size: 18px;">
      `;

      // Highlight logic for the view
      const issueWords = new Set(data.issues.map(i => i.word.toLowerCase()));
      data.tokens.forEach(t => {
        if (issueWords.has(t.toLowerCase().trim())) {
          html += `<mark class="issue">${t}</mark>`;
        } else {
          html += t;
        }
      });

      html += `</div>`;
      report.innerHTML = html;
      report.scrollTop = 0; // Reset scroll to top
    });
  });
})();
