(() => {
  "use strict";

  // Ensure registry exists (works with your loader.js)
  window.SiteApps = window.SiteApps || {};
  window.SiteApps.registry = window.SiteApps.registry || {};
  window.SiteApps.register =
    window.SiteApps.register ||
    function (name, initFn) {
      window.SiteApps.registry[name] = initFn;
    };

  const STYLE_ID = "siteapps-prosecheck-style-v1";
  const BUILD_STAMP = "11 Apr 2026 21:04 BST";
  const CHATGPT_VERSION = "GPT-5.4 Thinking";

  const FILTER_WORDS = new Set([
    "saw", "seen", "hear", "heard", "felt", "feel", "feels",
    "thought", "think", "thinks", "wondered", "wonder", "wonders",
    "noticed", "notice", "notices", "seemed", "seem", "seems",
    "realized", "realised", "realize", "realise",
    "knew", "know", "knows", "watched", "watch", "watches",
    "looked", "look", "looks", "decided", "decide", "decides"
  ]);

  const FILTER_PHRASES = [
    "could see",
    "could hear",
    "started to",
    "began to",
    "was able to",
    "in order to",
    "a little",
    "a bit",
    "sort of",
    "kind of",
    "seemed to"
  ];

  const STOP_WORDS = new Set([
    "a","an","and","are","as","at","be","been","but","by","for","from","had","has","have",
    "he","her","hers","him","his","i","in","into","is","it","its","me","my","of","on","or",
    "our","ours","she","so","that","the","their","theirs","them","they","this","to","too",
    "us","was","we","were","with","you","your","yours"
  ]);

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
[data-app="prosecheck"]{
  font-family:-apple-system,system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;
  background:#fff;
  border:2px solid #111;
  padding:18px;
  border-radius:14px;
  color:#111;
  width:min(100%, 1280px);
  margin:14px auto;
  box-sizing:border-box;
  position:relative;
}

[data-app="prosecheck"] .top-row{
  display:flex;
  align-items:baseline;
  justify-content:space-between;
  gap:10px;
  flex-wrap:wrap;
  margin-bottom:10px;
}

[data-app="prosecheck"] h3{
  margin:0;
  font-size:20px;
  font-weight:900;
}

[data-app="prosecheck"] .status-row{
  display:flex;
  gap:10px;
  align-items:center;
  flex-wrap:wrap;
  justify-content:flex-end;
}

[data-app="prosecheck"] .badge{
  font-size:14px;
  font-weight:900;
  padding:6px 10px;
  border:2px solid #111;
  border-radius:999px;
  background:#fff;
}

[data-app="prosecheck"] .badge.good{ border-color:#0b3d0b; color:#0b3d0b; }
[data-app="prosecheck"] .badge.warn{ border-color:#7a0000; color:#7a0000; }
[data-app="prosecheck"] .badge.dim{ border-color:#444; color:#444; }

[data-app="prosecheck"] .help{
  margin:0 0 10px;
  font-size:14px;
  color:#333;
}

[data-app="prosecheck"] .tabs{
  display:flex;
  gap:8px;
  flex-wrap:wrap;
  margin:12px 0;
}

[data-app="prosecheck"] .tab-btn{
  border:2px solid #111;
  border-radius:999px;
  cursor:pointer;
  padding:10px 14px;
  font-weight:900;
  font-size:14px;
  background:#fff;
  color:#111;
  -webkit-appearance:none;
  appearance:none;
}

[data-app="prosecheck"] .tab-btn.active{
  background:#111;
  color:#fff;
}

[data-app="prosecheck"] .panel{
  display:none;
}

[data-app="prosecheck"] .panel.active{
  display:block;
}

[data-app="prosecheck"] label{
  display:block;
  margin:10px 0 6px;
  font-weight:900;
  font-size:14px;
}

[data-app="prosecheck"] textarea{
  width:100%;
  min-height:320px;
  padding:12px;
  border:2px solid #111;
  border-radius:10px;
  font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace;
  font-size:15px;
  line-height:1.5;
  resize:vertical;
  box-sizing:border-box;
  background:#fff;
  color:#111;
  -webkit-appearance:none;
  appearance:none;
}

[data-app="prosecheck"] textarea:focus,
[data-app="prosecheck"] button:focus,
[data-app="prosecheck"] .issue-link:focus{
  outline:none;
  box-shadow:0 0 0 3px rgba(11,95,255,0.25);
}

[data-app="prosecheck"] .controls{
  display:flex;
  flex-wrap:wrap;
  gap:10px;
  margin-top:12px;
  align-items:center;
}

[data-app="prosecheck"] button{
  border:2px solid #111;
  border-radius:10px;
  cursor:pointer;
  padding:10px 12px;
  font-weight:900;
  font-size:14px;
  background:#fff;
  color:#111;
  -webkit-appearance:none;
  appearance:none;
}

[data-app="prosecheck"] .btn-primary{
  background:#0b5fff;
  border-color:#0b5fff;
  color:#fff;
}

[data-app="prosecheck"] .btn-clear{
  background:#fff;
  border-color:#7a0000;
  color:#7a0000;
}

[data-app="prosecheck"] .summary-grid{
  display:grid;
  grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
  gap:10px;
  margin:12px 0;
}

[data-app="prosecheck"] .summary-card{
  border:2px solid #111;
  border-radius:12px;
  padding:12px;
  background:#fff;
}

[data-app="prosecheck"] .summary-card h4{
  margin:0 0 6px;
  font-size:14px;
  font-weight:900;
  text-transform:uppercase;
  letter-spacing:.02em;
}

[data-app="prosecheck"] .summary-big{
  font-size:24px;
  font-weight:900;
  line-height:1.1;
  margin:0 0 4px;
}

[data-app="prosecheck"] .summary-small{
  font-size:13px;
  color:#333;
  margin:0;
}

[data-app="prosecheck"] .section{
  margin-top:14px;
  border:2px solid #111;
  border-radius:12px;
  overflow:hidden;
  background:#fff;
}

[data-app="prosecheck"] .section-head{
  padding:10px 12px;
  border-bottom:2px solid #111;
  background:#f6f6f6;
  font-weight:900;
  font-size:14px;
}

[data-app="prosecheck"] .section-body{
  padding:12px;
}

[data-app="prosecheck"] .issue-list{
  display:flex;
  flex-direction:column;
  gap:10px;
}

[data-app="prosecheck"] .issue-item{
  border:2px solid #111;
  border-left-width:8px;
  border-radius:10px;
  background:#fff;
  padding:10px 12px;
}

[data-app="prosecheck"] .issue-item.filter{
  border-left-style:solid;
}

[data-app="prosecheck"] .issue-item.repeat-word{
  border-left-style:dashed;
}

[data-app="prosecheck"] .issue-item.repeat-phrase{
  border-left-style:dotted;
}

[data-app="prosecheck"] .issue-top{
  display:flex;
  gap:8px;
  flex-wrap:wrap;
  align-items:center;
  margin-bottom:6px;
}

[data-app="prosecheck"] .issue-tag{
  display:inline-block;
  border:2px solid #111;
  border-radius:999px;
  padding:2px 8px;
  font-size:12px;
  font-weight:900;
  background:#fff;
}

[data-app="prosecheck"] .issue-line{
  font-size:12px;
  font-weight:900;
  letter-spacing:.02em;
}

[data-app="prosecheck"] .issue-text{
  font-size:14px;
  line-height:1.45;
  margin:0 0 8px;
}

[data-app="prosecheck"] .issue-link{
  display:inline-block;
  border:2px solid #111;
  border-radius:8px;
  padding:6px 10px;
  font-size:13px;
  font-weight:900;
  text-decoration:none;
  color:#111;
  background:#fff;
}

[data-app="prosecheck"] .annotated-wrap{
  border:2px solid #111;
  border-radius:12px;
  overflow:auto;
  max-height:720px;
  background:#fff;
}

[data-app="prosecheck"] .annotated-line{
  display:grid;
  grid-template-columns:64px 1fr;
  gap:0;
  border-bottom:1px solid #ddd;
  align-items:start;
}

[data-app="prosecheck"] .annotated-line:last-child{
  border-bottom:none;
}

[data-app="prosecheck"] .line-no{
  font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace;
  font-size:13px;
  padding:10px 8px;
  border-right:2px solid #111;
  background:#f7f7f7;
  color:#333;
  text-align:right;
  user-select:none;
}

[data-app="prosecheck"] .line-text{
  font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace;
  font-size:14px;
  line-height:1.55;
  padding:10px 12px;
  white-space:pre-wrap;
  word-break:break-word;
}

[data-app="prosecheck"] .mark{
  font-weight:900;
  padding:0 1px;
  border-width:2px;
  border-style:solid;
  border-color:#111;
  border-radius:4px;
  color:#111;
  background:#fff;
}

[data-app="prosecheck"] .mark.filter{
  text-decoration:underline 3px solid #111;
  text-underline-offset:2px;
}

[data-app="prosecheck"] .mark.repeat-word{
  background-image:repeating-linear-gradient(
    -45deg,
    transparent 0,
    transparent 4px,
    rgba(0,0,0,0.18) 4px,
    rgba(0,0,0,0.18) 8px
  );
}

[data-app="prosecheck"] .mark.repeat-phrase{
  background-image:repeating-linear-gradient(
    90deg,
    transparent 0,
    transparent 5px,
    rgba(0,0,0,0.22) 5px,
    rgba(0,0,0,0.22) 7px
  );
}

[data-app="prosecheck"] .mark-label{
  font-size:10px;
  font-weight:900;
  vertical-align:top;
  margin-right:4px;
  letter-spacing:.03em;
}

[data-app="prosecheck"] .empty{
  border:2px dashed #444;
  border-radius:12px;
  padding:18px;
  font-weight:700;
  color:#444;
  background:#fafafa;
}

[data-app="prosecheck"] .legend{
  display:flex;
  flex-wrap:wrap;
  gap:8px;
  margin-bottom:10px;
}

[data-app="prosecheck"] .legend .issue-tag{
  font-size:11px;
}

[data-app="prosecheck"] .buildstamp{
  margin-top:14px;
  font-size:11px;
  line-height:1.3;
  color:#666;
  text-align:right;
  user-select:text;
  -webkit-user-select:text;
}

@media (max-width:700px){
  [data-app="prosecheck"] .controls{
    flex-direction:column;
    align-items:stretch;
  }

  [data-app="prosecheck"] .controls button{
    width:100%;
  }

  [data-app="prosecheck"] .annotated-line{
    grid-template-columns:56px 1fr;
  }

  [data-app="prosecheck"] .buildstamp{
    text-align:left;
  }
}
`;
    document.head.appendChild(style);
  }

  function safeJsonParse(s) {
    try { return JSON.parse(s); } catch { return null; }
  }

  function makeStorageKey(container) {
    const k = container.getAttribute("data-storage-key");
    if (k && k.trim()) return `siteapps:prosecheck:${k.trim()}`;
    return `siteapps:prosecheck:${location.pathname || "/"}`;
  }

  function normalizeLineEndings(s) {
    return String(s || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function minutesLabel(mins) {
    if (mins < 1) return "< 1 min";
    if (mins < 10) return `${mins.toFixed(1)} min`;
    return `${Math.round(mins)} min`;
  }

  function estimateSyllables(word) {
    const w = String(word || "").toLowerCase().replace(/[^a-z]/g, "");
    if (!w) return 0;
    if (w.length <= 3) return 1;

    const stripped = w
      .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "")
      .replace(/^y/, "");

    const matches = stripped.match(/[aeiouy]{1,2}/g);
    return Math.max(1, matches ? matches.length : 1);
  }

  function tokenizeTextWithLines(text) {
    const lines = normalizeLineEndings(text).split("\n");
    const tokens = [];
    const wordRe = /[A-Za-z][A-Za-z'’-]*/g;

    lines.forEach((line, lineIndex) => {
      const lineNo = lineIndex + 1;
      wordRe.lastIndex = 0;

      let m;
      while ((m = wordRe.exec(line))) {
        const raw = m[0];
        const norm = raw
          .toLowerCase()
          .replace(/[’]/g, "'")
          .replace(/^'+|'+$/g, "");

        tokens.push({
          raw,
          norm,
          line: lineNo,
          start: m.index,
          end: m.index + raw.length,
          index: tokens.length
        });
      }
    });

    return { lines, tokens };
  }

  function analyseText(text) {
    const src = normalizeLineEndings(text);
    const { lines, tokens } = tokenizeTextWithLines(src);

    const issues = [];
    const marksByLine = new Map();
    let issueCounter = 0;

    function addMark(issueType, line, start, end, label) {
      if (!marksByLine.has(line)) marksByLine.set(line, []);
      marksByLine.get(line).push({
        type: issueType,
        line,
        start,
        end,
        label
      });
    }

    function addIssue(issue) {
      issue.id = `pc-issue-${issueCounter++}`;
      issues.push(issue);
      if (issue.mark) {
        addMark(issue.type, issue.mark.line, issue.mark.start, issue.mark.end, issue.labelShort);
      }
    }

    const words = tokens.map(t => t.norm).filter(Boolean);
    const wordCount = words.length;
    const sentenceMatches = src.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];
    const sentenceCount = Math.max(1, sentenceMatches.filter(s => s.trim()).length);
    const charCount = src.replace(/\s/g, "").length;
    const syllableCount = words.reduce((sum, w) => sum + estimateSyllables(w), 0);

    const avgSentenceLength = wordCount / sentenceCount;
    const avgSyllablesPerWord = wordCount ? syllableCount / wordCount : 0;

    const fleschReadingEase = wordCount
      ? (206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord))
      : 0;

    const fleschKincaidGrade = wordCount
      ? ((0.39 * avgSentenceLength) + (11.8 * avgSyllablesPerWord) - 15.59)
      : 0;

    tokens.forEach((token) => {
      if (!FILTER_WORDS.has(token.norm)) return;

      addIssue({
        type: "filter",
        label: "Filter word",
        labelShort: "FILTER",
        line: token.line,
        message: `Filter word “${token.raw}”. Consider whether the sentence would be stronger if the moment were rendered more directly.`,
        mark: {
          line: token.line,
          start: token.start,
          end: token.end
        }
      });
    });

    FILTER_PHRASES.forEach((phrase) => {
      const phraseRe = new RegExp(`\\b${phrase.replace(/\s+/g, "\\s+")}\\b`, "gi");

      lines.forEach((line, idx) => {
        const lineLower = line.toLowerCase();
        phraseRe.lastIndex = 0;

        let m;
        while ((m = phraseRe.exec(lineLower))) {
          addIssue({
            type: "filter",
            label: "Filter phrase",
            labelShort: "FILTER",
            line: idx + 1,
            message: `Filter phrase “${line.slice(m.index, m.index + m[0].length)}”. This may add distance or drag.`,
            mark: {
              line: idx + 1,
              start: m.index,
              end: m.index + m[0].length
            }
          });
        }
      });
    });

    const lastSeenWord = new Map();
    tokens.forEach((token) => {
      if (!token.norm || token.norm.length < 4) return;
      if (STOP_WORDS.has(token.norm)) return;

      const prev = lastSeenWord.get(token.norm);
      if (prev && (token.index - prev.index) <= 30) {
        addIssue({
          type: "repeat-word",
          label: "Repeated word",
          labelShort: "REPEAT",
          line: token.line,
          message: `Word repeated in close proximity: “${token.raw}”. Previous use was on line ${prev.line}.`,
          mark: {
            line: token.line,
            start: token.start,
            end: token.end
          }
        });
      }
      lastSeenWord.set(token.norm, token);
    });

    const phraseMap = new Map();

    for (let n = 2; n <= 3; n += 1) {
      for (let i = 0; i <= tokens.length - n; i += 1) {
        const slice = tokens.slice(i, i + n);
        const norms = slice.map(t => t.norm);
        if (norms.some(x => !x)) continue;

        const contentWords = norms.filter(w => !STOP_WORDS.has(w));
        if (!contentWords.length) continue;

        const phrase = norms.join(" ");
        const display = slice.map(t => t.raw).join(" ");

        if (phrase.length < 8) continue;

        const current = {
          phrase,
          display,
          startToken: slice[0],
          endToken: slice[slice.length - 1]
        };

        const prev = phraseMap.get(phrase);
        if (prev && (current.startToken.index - prev.startToken.index) <= 80) {
          addIssue({
            type: "repeat-phrase",
            label: "Repeated phrase",
            labelShort: "PHRASE",
            line: current.startToken.line,
            message: `Phrase repeated in close proximity: “${display}”. Previous use was on line ${prev.startToken.line}.`,
            mark: {
              line: current.startToken.line,
              start: current.startToken.start,
              end: current.endToken.line === current.startToken.line
                ? current.endToken.end
                : current.startToken.end
            }
          });
        }

        phraseMap.set(phrase, current);
      }
    }

    issues.sort((a, b) => {
      if (a.line !== b.line) return a.line - b.line;
      const typeOrder = { "filter": 1, "repeat-word": 2, "repeat-phrase": 3 };
      if ((typeOrder[a.type] || 9) !== (typeOrder[b.type] || 9)) {
        return (typeOrder[a.type] || 9) - (typeOrder[b.type] || 9);
      }
      return (a.mark?.start || 0) - (b.mark?.start || 0);
    });

    return {
      source: src,
      lines,
      tokens,
      issues,
      marksByLine,
      stats: {
        lineCount: lines.length,
        wordCount,
        sentenceCount,
        charCount,
        syllableCount,
        avgSentenceLength,
        fleschReadingEase,
        fleschKincaidGrade,
        silentRead180: wordCount / 180,
        aloudRead130: wordCount / 130
      }
    };
  }

  function readabilityLabel(score) {
    if (score >= 90) return "Very easy";
    if (score >= 80) return "Easy";
    if (score >= 70) return "Fairly easy";
    if (score >= 60) return "Standard";
    if (score >= 50) return "Fairly difficult";
    if (score >= 30) return "Difficult";
    return "Very difficult";
  }

  function gradeLabel(grade) {
    if (grade < 1) return "Very simple";
    if (grade < 6) return "Primary level";
    if (grade < 9) return "Secondary level";
    if (grade < 13) return "Teen to adult";
    return "Adult / dense";
  }

  function renderAnnotatedLine(lineText, marks) {
    const escapedLine = escapeHtml(lineText);
    if (!marks || !marks.length) return escapedLine;

    const sorted = marks.slice().sort((a, b) => {
      if (a.start !== b.start) return a.start - b.start;
      return (b.end - b.start) - (a.end - a.start);
    });

    const kept = [];
    let furthestEnd = -1;

    sorted.forEach((m) => {
      if (m.start < furthestEnd) return;
      kept.push(m);
      furthestEnd = m.end;
    });

    let out = "";
    let pos = 0;

    kept.forEach((m) => {
      const start = Math.max(0, Math.min(lineText.length, m.start));
      const end = Math.max(start, Math.min(lineText.length, m.end));

      out += escapeHtml(lineText.slice(pos, start));
      out += `<span class="mark ${m.type}" id="line-${m.line}-pos-${m.start}"><span class="mark-label">[${escapeHtml(m.label)}]</span>${escapeHtml(lineText.slice(start, end))}</span>`;
      pos = end;
    });

    out += escapeHtml(lineText.slice(pos));
    return out;
  }

  window.SiteApps.register("prosecheck", (container) => {
    if (!container || container.__siteAppProseCheckInit) return;
    container.__siteAppProseCheckInit = true;

    ensureStyle();

    const storageKey = makeStorageKey(container);

    let activeTab = "source";
    let analysis = analyseText("");
    let saveTimer = null;

    container.innerHTML = "";

    const topRow = document.createElement("div");
    topRow.className = "top-row";

    const title = document.createElement("h3");
    title.textContent = "Prose Check";

    const statusRow = document.createElement("div");
    statusRow.className = "status-row";

    const issueBadge = document.createElement("span");
    issueBadge.className = "badge dim";
    issueBadge.textContent = "0 issues";

    const wordsBadge = document.createElement("span");
    wordsBadge.className = "badge dim";
    wordsBadge.textContent = "0 words";

    const saveBadge = document.createElement("span");
    saveBadge.className = "badge dim";
    saveBadge.textContent = "";

    statusRow.append(issueBadge, wordsBadge, saveBadge);
    topRow.append(title, statusRow);

    const help = document.createElement("p");
    help.className = "help";
    help.textContent = "Paste prose into Source. Press Refresh report after editing. The report flags filter words, repeated words and repeated short phrases nearby, then estimates reading time and readability.";

    const tabs = document.createElement("div");
    tabs.className = "tabs";

    const sourceTabBtn = document.createElement("button");
    sourceTabBtn.type = "button";
    sourceTabBtn.className = "tab-btn active";
    sourceTabBtn.textContent = "Source";

    const reportTabBtn = document.createElement("button");
    reportTabBtn.type = "button";
    reportTabBtn.className = "tab-btn";
    reportTabBtn.textContent = "Report";

    tabs.append(sourceTabBtn, reportTabBtn);

    const sourcePanel = document.createElement("div");
    sourcePanel.className = "panel active";

    const sourceLabel = document.createElement("label");
    sourceLabel.textContent = "Original text";

    const inputTA = document.createElement("textarea");
    inputTA.placeholder = "Paste a fragment of prose here, then press Refresh report.";

    const controls = document.createElement("div");
    controls.className = "controls";

    const refreshBtn = document.createElement("button");
    refreshBtn.type = "button";
    refreshBtn.className = "btn-primary";
    refreshBtn.textContent = "Refresh report";

    const clearBtn = document.createElement("button");
    clearBtn.type = "button";
    clearBtn.className = "btn-clear";
    clearBtn.textContent = "Clear";

    controls.append(refreshBtn, clearBtn);
    sourcePanel.append(sourceLabel, inputTA, controls);

    const reportPanel = document.createElement("div");
    reportPanel.className = "panel";

    const summaryGrid = document.createElement("div");
    summaryGrid.className = "summary-grid";

    const issuesSection = document.createElement("div");
    issuesSection.className = "section";

    const issuesHead = document.createElement("div");
    issuesHead.className = "section-head";
    issuesHead.textContent = "Issues";

    const issuesBody = document.createElement("div");
    issuesBody.className = "section-body";

    const issuesList = document.createElement("div");
    issuesList.className = "issue-list";

    const reportEmpty = document.createElement("div");
    reportEmpty.className = "empty";
    reportEmpty.textContent = "No text analysed yet.";

    issuesBody.append(reportEmpty, issuesList);
    issuesSection.append(issuesHead, issuesBody);

    const annotatedSection = document.createElement("div");
    annotatedSection.className = "section";

    const annotatedHead = document.createElement("div");
    annotatedHead.className = "section-head";
    annotatedHead.textContent = "Annotated text";

    const annotatedBody = document.createElement("div");
    annotatedBody.className = "section-body";

    const legend = document.createElement("div");
    legend.className = "legend";
    legend.innerHTML = `
      <span class="issue-tag">[FILTER] filter word or phrase</span>
      <span class="issue-tag">[REPEAT] repeated word nearby</span>
      <span class="issue-tag">[PHRASE] repeated phrase nearby</span>
    `;

    const annotatedWrap = document.createElement("div");
    annotatedWrap.className = "annotated-wrap";

    annotatedBody.append(legend, annotatedWrap);
    annotatedSection.append(annotatedHead, annotatedBody);

    reportPanel.append(summaryGrid, issuesSection, annotatedSection);

    const buildStamp = document.createElement("div");
    buildStamp.className = "buildstamp";
    buildStamp.textContent = `Build ${BUILD_STAMP} • ${CHATGPT_VERSION}`;

    container.append(topRow, help, tabs, sourcePanel, reportPanel, buildStamp);

    function saveState() {
      try {
        localStorage.setItem(storageKey, JSON.stringify({
          v: 1,
          text: inputTA.value,
          activeTab
        }));
        saveBadge.className = "badge good";
        saveBadge.textContent = "Saved ✓";
      } catch (_) {
        saveBadge.className = "badge warn";
        saveBadge.textContent = "Not saved";
      }
    }

    function saveStateDebounced() {
      saveBadge.className = "badge dim";
      saveBadge.textContent = "Unsaved…";
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        saveTimer = null;
        saveState();
      }, 300);
    }

    function restoreState() {
      try {
        const raw = localStorage.getItem(storageKey);
        if (!raw) return;
        const state = safeJsonParse(raw);
        if (!state || typeof state !== "object") return;

        if (typeof state.text === "string") {
          inputTA.value = state.text;
          analysis = analyseText(state.text);
        }
        if (state.activeTab === "report" || state.activeTab === "source") {
          activeTab = state.activeTab;
        }
      } catch (_) {
        // ignore
      }
    }

    function switchTab(nextTab) {
      activeTab = nextTab;
      sourceTabBtn.classList.toggle("active", nextTab === "source");
      reportTabBtn.classList.toggle("active", nextTab === "report");
      sourcePanel.classList.toggle("active", nextTab === "source");
      reportPanel.classList.toggle("active", nextTab === "report");
      saveStateDebounced();
    }

    function renderSummary() {
      const stats = analysis.stats;
      const issueCount = analysis.issues.length;

      wordsBadge.textContent = `${stats.wordCount} ${stats.wordCount === 1 ? "word" : "words"}`;

      if (!issueCount) {
        issueBadge.className = "badge good";
        issueBadge.textContent = "0 issues";
      } else {
        issueBadge.className = "badge warn";
        issueBadge.textContent = `${issueCount} ${issueCount === 1 ? "issue" : "issues"}`;
      }

      summaryGrid.innerHTML = "";

      const cards = [
        {
          title: "Length",
          big: `${stats.wordCount} words`,
          small: `${stats.lineCount} lines • ${stats.sentenceCount} sentences`
        },
        {
          title: "Reading time",
          big: minutesLabel(stats.silentRead180),
          small: "Approx. silent reading at 180 wpm"
        },
        {
          title: "Reading aloud",
          big: minutesLabel(stats.aloudRead130),
          small: "Approx. aloud pace at 130 wpm"
        },
        {
          title: "Flesch reading ease",
          big: Number.isFinite(stats.fleschReadingEase) ? stats.fleschReadingEase.toFixed(1) : "—",
          small: readabilityLabel(stats.fleschReadingEase)
        },
        {
          title: "F-K grade",
          big: Number.isFinite(stats.fleschKincaidGrade) ? stats.fleschKincaidGrade.toFixed(1) : "—",
          small: gradeLabel(stats.fleschKincaidGrade)
        },
        {
          title: "Average sentence",
          big: Number.isFinite(stats.avgSentenceLength) ? `${stats.avgSentenceLength.toFixed(1)} words` : "—",
          small: "Longer sentences usually lower readability"
        }
      ];

      cards.forEach((card) => {
        const el = document.createElement("div");
        el.className = "summary-card";
        el.innerHTML = `
          <h4>${escapeHtml(card.title)}</h4>
          <p class="summary-big">${escapeHtml(card.big)}</p>
          <p class="summary-small">${escapeHtml(card.small)}</p>
        `;
        summaryGrid.appendChild(el);
      });
    }

    function renderIssues() {
      issuesList.innerHTML = "";

      if (!analysis.source.trim()) {
        reportEmpty.style.display = "block";
        reportEmpty.textContent = "No text analysed yet.";
        return;
      }

      if (!analysis.issues.length) {
        reportEmpty.style.display = "block";
        reportEmpty.textContent = "No issues found by the current checks.";
        return;
      }

      reportEmpty.style.display = "none";

      analysis.issues.forEach((issue) => {
        const item = document.createElement("div");
        item.className = `issue-item ${issue.type}`;

        const jumpId = issue.mark ? `line-${issue.mark.line}-pos-${issue.mark.start}` : "";

        item.innerHTML = `
          <div class="issue-top">
            <span class="issue-tag">${escapeHtml(issue.label)}</span>
            <span class="issue-line">Line ${issue.line}</span>
          </div>
          <p class="issue-text">${escapeHtml(issue.message)}</p>
          ${jumpId ? `<a href="#${escapeHtml(jumpId)}" class="issue-link">Jump to marked text</a>` : ""}
        `;

        const link = item.querySelector(".issue-link");
        if (link) {
          link.addEventListener("click", (ev) => {
            ev.preventDefault();
            const target = document.getElementById(jumpId);
            if (target) target.scrollIntoView({ block: "center", behavior: "smooth" });
          });
        }

        issuesList.appendChild(item);
      });
    }

    function renderAnnotatedText() {
      annotatedWrap.innerHTML = "";
      if (!analysis.source.trim()) return;

      analysis.lines.forEach((line, idx) => {
        const lineNo = idx + 1;
        const marks = analysis.marksByLine.get(lineNo) || [];

        const row = document.createElement("div");
        row.className = "annotated-line";

        const no = document.createElement("div");
        no.className = "line-no";
        no.textContent = String(lineNo);

        const text = document.createElement("div");
        text.className = "line-text";
        text.innerHTML = renderAnnotatedLine(line, marks);

        row.append(no, text);
        annotatedWrap.appendChild(row);
      });
    }

    function runAnalysisAndRender(openReport) {
      analysis = analyseText(inputTA.value || "");
      renderSummary();
      renderIssues();
      renderAnnotatedText();
      if (openReport) switchTab("report");
      saveStateDebounced();
    }

    sourceTabBtn.addEventListener("click", () => switchTab("source"));
    reportTabBtn.addEventListener("click", () => {
      renderSummary();
      renderIssues();
      renderAnnotatedText();
      switchTab("report");
    });

    refreshBtn.addEventListener("click", () => runAnalysisAndRender(true));

    clearBtn.addEventListener("click", () => {
      if (!inputTA.value.trim()) return;
      if (!confirm("Clear the source text and report?")) return;

      inputTA.value = "";
      analysis = analyseText("");
      renderSummary();
      renderIssues();
      renderAnnotatedText();
      switchTab("source");
      saveStateDebounced();
    });

    inputTA.addEventListener("input", saveStateDebounced);

    restoreState();
    renderSummary();
    renderIssues();
    renderAnnotatedText();
    switchTab(activeTab);
    saveBadge.className = "badge good";
    saveBadge.textContent = "Saved ✓";
  });
})();
