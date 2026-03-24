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

  const STYLE_ID = "siteapps-replacer-style-v1";

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
/* Replacer — SiteApps pattern, high contrast, iPad safe */
[data-app="replacer"]{
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

[data-app="replacer"] .top-row{
  display:flex;
  align-items:baseline;
  justify-content:space-between;
  gap:10px;
  flex-wrap:wrap;
  margin-bottom:10px;
}

[data-app="replacer"] h3{
  margin:0;
  font-size:20px;
  font-weight:900;
}

[data-app="replacer"] .status-row{
  display:flex;
  gap:10px;
  align-items:center;
  flex-wrap:wrap;
  justify-content:flex-end;
}

[data-app="replacer"] .badge{
  font-size:14px;
  font-weight:900;
  padding:6px 10px;
  border:2px solid #111;
  border-radius:999px;
  background:#fff;
}

[data-app="replacer"] .badge.good{ border-color:#0b3d0b; color:#0b3d0b; }
[data-app="replacer"] .badge.warn{ border-color:#7a0000; color:#7a0000; }
[data-app="replacer"] .badge.dim{ border-color:#444; color:#444; }

[data-app="replacer"] label{
  display:block;
  margin:10px 0 6px;
  font-weight:900;
  font-size:14px;
}

[data-app="replacer"] .help,
[data-app="replacer"] .summary{
  margin:0 0 10px;
  font-size:14px;
  color:#333;
}

[data-app="replacer"] textarea,
[data-app="replacer"] input[type="text"],
[data-app="replacer"] select{
  width:100%;
  padding:12px;
  border:2px solid #111;
  border-radius:10px;
  box-sizing:border-box;
  background:#fff;
  color:#111;
  -webkit-appearance:none;
  appearance:none;
}

[data-app="replacer"] textarea{
  min-height:240px;
  font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace;
  font-size:15px;
  line-height:1.45;
  resize:vertical;
}

[data-app="replacer"] input[type="text"],
[data-app="replacer"] select{
  font-size:15px;
  line-height:1.2;
}

[data-app="replacer"] textarea:focus,
[data-app="replacer"] input[type="text"]:focus,
[data-app="replacer"] select:focus{
  outline:none;
  box-shadow:0 0 0 3px rgba(11,95,255,0.25);
}

[data-app="replacer"] .field-grid{
  display:grid;
  grid-template-columns:repeat(2, minmax(0, 1fr));
  gap:12px;
  margin-top:12px;
}

[data-app="replacer"] .field.full{
  grid-column:1 / -1;
}

[data-app="replacer"] .check-row{
  display:flex;
  align-items:center;
  gap:10px;
  padding:12px;
  border:2px solid #111;
  border-radius:10px;
  min-height:48px;
  box-sizing:border-box;
}

[data-app="replacer"] .check-row input{
  width:18px;
  height:18px;
  margin:0;
}

[data-app="replacer"] .check-row span{
  font-weight:700;
}

[data-app="replacer"] .controls,
[data-app="replacer"] .results-actions,
[data-app="replacer"] .text-actions{
  display:flex;
  flex-wrap:wrap;
  gap:10px;
  margin-top:12px;
  align-items:center;
}

[data-app="replacer"] button{
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

[data-app="replacer"] button:disabled{
  opacity:.45;
  cursor:default;
}

[data-app="replacer"] .btn-primary{
  background:#0b5fff;
  border-color:#0b5fff;
  color:#fff;
}

[data-app="replacer"] .btn-copy{
  background:#111;
  border-color:#111;
  color:#fff;
}

[data-app="replacer"] .btn-clear{
  background:#fff;
  border-color:#7a0000;
  color:#7a0000;
}

[data-app="replacer"] .panel{
  margin-top:14px;
  border:2px solid #111;
  border-radius:12px;
  padding:14px;
  background:#fff;
}

[data-app="replacer"] .results-wrap{
  margin-top:12px;
  border:2px solid #111;
  border-radius:12px;
  overflow:hidden;
  background:#fff;
}

[data-app="replacer"] table{
  width:100%;
  border-collapse:collapse;
}

[data-app="replacer"] thead th{
  text-align:left;
  padding:12px;
  border-bottom:2px solid #111;
  font-size:14px;
  font-weight:900;
  background:#f6f6f6;
}

[data-app="replacer"] tbody td{
  border-bottom:1px solid #111;
  vertical-align:top;
  padding:12px;
  font-size:14px;
}

[data-app="replacer"] tbody tr:last-child td{
  border-bottom:none;
}

[data-app="replacer"] tbody tr.current{
  background:#eef4ff;
}

[data-app="replacer"] .line-no,
[data-app="replacer"] .match-count{
  white-space:nowrap;
  font-weight:900;
}

[data-app="replacer"] .line-text{
  font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace;
  white-space:pre-wrap;
  word-break:break-word;
  line-height:1.4;
}

[data-app="replacer"] mark{
  background:#fff2a8;
  color:#111;
  padding:0;
}

[data-app="replacer"] .empty{
  margin-top:12px;
  border:2px dashed #444;
  border-radius:12px;
  padding:18px;
  font-weight:700;
  color:#444;
  background:#fafafa;
}

[data-app="replacer"] .feedback{
  position:absolute;
  top:10px;
  right:10px;
  background:#0b7a2b;
  color:#fff;
  padding:8px 12px;
  border-radius:10px;
  font-size:14px;
  font-weight:900;
  opacity:0;
  transform:translateY(-4px);
  transition:opacity .2s, transform .2s;
  pointer-events:none;
  max-width:min(90vw, 360px);
}

[data-app="replacer"] .feedback.show{
  opacity:1;
  transform:translateY(0);
}

@media (max-width:800px){
  [data-app="replacer"] .field-grid{
    grid-template-columns:1fr;
  }
}

@media (max-width:700px){
  [data-app="replacer"] .controls,
  [data-app="replacer"] .results-actions,
  [data-app="replacer"] .text-actions{
    flex-direction:column;
    align-items:stretch;
  }

  [data-app="replacer"] .controls button,
  [data-app="replacer"] .results-actions button,
  [data-app="replacer"] .text-actions button{
    width:100%;
  }

  [data-app="replacer"] thead{
    display:none;
  }

  [data-app="replacer"] table,
  [data-app="replacer"] tbody,
  [data-app="replacer"] tr,
  [data-app="replacer"] td{
    display:block;
    width:100%;
  }

  [data-app="replacer"] tbody tr{
    border-bottom:2px solid #111;
  }

  [data-app="replacer"] tbody tr:last-child{
    border-bottom:none;
  }

  [data-app="replacer"] tbody td{
    border-bottom:none;
    padding:8px 12px;
  }
}
`;
    document.head.appendChild(style);
  }

  function safeJsonParse(s) {
    try {
      return JSON.parse(s);
    } catch {
      return null;
    }
  }

  function makeStorageKey(container) {
    const k = container.getAttribute("data-storage-key");
    if (k && k.trim()) return `siteapps:replacer:${k.trim()}`;
    return `siteapps:replacer:${location.pathname || "/"}`;
  }

  function normalizeLineEndings(s) {
    return String(s || "").replace(/\r\n?/g, "\n");
  }

  function countLines(s) {
    const text = normalizeLineEndings(s).trimEnd();
    if (!text) return 0;
    return text.split("\n").length;
  }

  function copyTextFallback(text) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "readonly");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    ta.style.top = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand("copy");
    } catch (_) {
      // ignore
    }
    document.body.removeChild(ta);
  }

  async function copyText(text) {
    if (!text) return false;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (_) {
      // fall through
    }

    try {
      copyTextFallback(text);
      return true;
    } catch (_) {
      return false;
    }
  }

  function emptyResults() {
    return {
      lines: [],
      matches: []
    };
  }

  function getCompareText(text, caseSensitive) {
    return caseSensitive ? text : text.toLowerCase();
  }

  function findMatchesInLine(line, needle, options) {
    const text = String(line || "");
    const query = String(needle || "");
    if (!query) return [];

    const caseSensitive = !!options.caseSensitive;
    const mode = options.mode || "any";
    const hay = getCompareText(text, caseSensitive);
    const key = getCompareText(query, caseSensitive);

    if (!key) return [];

    if (mode === "start") {
      return hay.startsWith(key)
        ? [{ start: 0, end: query.length }]
        : [];
    }

    if (mode === "end") {
      return hay.endsWith(key)
        ? [{ start: text.length - query.length, end: text.length }]
        : [];
    }

    if (mode === "whole") {
      return hay === key
        ? [{ start: 0, end: text.length }]
        : [];
    }

    const spans = [];
    let from = 0;

    while (from <= hay.length - key.length) {
      const idx = hay.indexOf(key, from);
      if (idx < 0) break;
      spans.push({ start: idx, end: idx + query.length });
      from = idx + Math.max(query.length, 1);
    }

    return spans;
  }

  function computeSearchData(text, needle, options) {
    const source = normalizeLineEndings(text);
    const query = String(needle || "");
    if (!query) return emptyResults();

    const lines = source.split("\n");
    const lineResults = [];
    const matches = [];
    let absLineStart = 0;

    lines.forEach((line, index) => {
      const spans = findMatchesInLine(line, query, options);
      if (spans.length) {
        lineResults.push({
          lineNumber: index + 1,
          text: line,
          count: spans.length,
          spans
        });

        spans.forEach((span) => {
          matches.push({
            lineNumber: index + 1,
            lineText: line,
            absStart: absLineStart + span.start,
            absEnd: absLineStart + span.end,
            matchedText: line.slice(span.start, span.end)
          });
        });
      }

      absLineStart += line.length + 1;
    });

    return {
      lines: lineResults,
      matches
    };
  }

  function replaceLine(line, needle, replacement, options) {
    const spans = findMatchesInLine(line, needle, options);
    if (!spans.length) {
      return { text: line, count: 0 };
    }

    let out = "";
    let last = 0;

    spans.forEach((span) => {
      out += line.slice(last, span.start);
      out += replacement;
      last = span.end;
    });

    out += line.slice(last);

    return {
      text: out,
      count: spans.length
    };
  }

  function replaceAllText(text, needle, replacement, options) {
    const source = normalizeLineEndings(text);
    const lines = source.split("\n");
    let total = 0;

    const out = lines.map((line) => {
      const replaced = replaceLine(line, needle, replacement, options);
      total += replaced.count;
      return replaced.text;
    });

    return {
      text: out.join("\n"),
      count: total
    };
  }

  function appendHighlightedLine(target, line, spans) {
    target.textContent = "";

    if (!spans || !spans.length) {
      target.textContent = line;
      return;
    }

    let last = 0;

    spans.forEach((span) => {
      if (span.start > last) {
        target.appendChild(document.createTextNode(line.slice(last, span.start)));
      }
      const mark = document.createElement("mark");
      mark.textContent = line.slice(span.start, span.end);
      target.appendChild(mark);
      last = span.end;
    });

    if (last < line.length) {
      target.appendChild(document.createTextNode(line.slice(last)));
    }
  }

  window.SiteApps.register("replacer", (container) => {
    ensureStyle();

    const storageKey = makeStorageKey(container);

    let hasSearched = false;
    let currentResults = emptyResults();
    let currentMatchIndex = -1;
    let copiedSinceChange = false;
    let saveTimer = null;
    let toastTimer = null;

    container.innerHTML = "";

    const topRow = document.createElement("div");
    topRow.className = "top-row";

    const title = document.createElement("h3");
    title.textContent = "Replacer";

    const statusRow = document.createElement("div");
    statusRow.className = "status-row";

    const linesBadge = document.createElement("span");
    linesBadge.className = "badge dim";

    const matchesBadge = document.createElement("span");
    matchesBadge.className = "badge dim";

    const currentBadge = document.createElement("span");
    currentBadge.className = "badge dim";

    const saveBadge = document.createElement("span");
    saveBadge.className = "badge dim";

    const copyBadge = document.createElement("span");
    copyBadge.className = "badge warn";

    statusRow.append(linesBadge, matchesBadge, currentBadge, saveBadge, copyBadge);
    topRow.append(title, statusRow);

    const help = document.createElement("p");
    help.className = "help";
    help.textContent = "Paste text, search literal text, then search only or replace one match at a time or all at once.";

    const sourceLabel = document.createElement("label");
    sourceLabel.textContent = "Source text";

    const sourceTA = document.createElement("textarea");
    sourceTA.placeholder = "Paste text here...";

    const textActions = document.createElement("div");
    textActions.className = "text-actions";

    function makeBtn(text, cls, fn) {
      const b = document.createElement("button");
      b.type = "button";
      if (cls) b.className = cls;
      b.textContent = text;
      b.addEventListener("click", fn);
      return b;
    }

    const copyTextBtn = makeBtn("Copy text", "btn-copy", async () => {
      if (!sourceTA.value) {
        showToast("Nothing to copy");
        return;
      }
      const ok = await copyText(sourceTA.value);
      if (ok) markCopied("Text copied ✓");
      else showToast("Copy failed");
    });

    const clearTextBtn = makeBtn("Clear text", "btn-clear", () => {
      if (!sourceTA.value && !searchInput.value && !replaceInput.value) return;
      if (!confirm("Clear the text and the current search settings?")) return;
      sourceTA.value = "";
      searchInput.value = "";
      replaceInput.value = "";
      modeSelect.value = "any";
      caseChk.checked = false;
      hasSearched = false;
      currentResults = emptyResults();
      currentMatchIndex = -1;
      copiedSinceChange = false;
      renderAll();
      saveStateDebounced();
      showToast("Cleared");
    });

    textActions.append(copyTextBtn, clearTextBtn);

    const searchPanel = document.createElement("div");
    searchPanel.className = "panel";

    const searchPanelLabel = document.createElement("label");
    searchPanelLabel.textContent = "Search and replace";

    const searchHelp = document.createElement("p");
    searchHelp.className = "help";
    searchHelp.textContent = "Search is literal text, not regex. Search results show only lines that match the current search.";

    const fieldGrid = document.createElement("div");
    fieldGrid.className = "field-grid";

    const searchField = document.createElement("div");
    searchField.className = "field";
    const searchLabel = document.createElement("label");
    searchLabel.textContent = "Search for";
    const searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.placeholder = "rain";
    searchField.append(searchLabel, searchInput);

    const replaceField = document.createElement("div");
    replaceField.className = "field";
    const replaceLabel = document.createElement("label");
    replaceLabel.textContent = "Replace with";
    const replaceInput = document.createElement("input");
    replaceInput.type = "text";
    replaceInput.placeholder = "storm";
    replaceField.append(replaceLabel, replaceInput);

    const modeField = document.createElement("div");
    modeField.className = "field";
    const modeLabel = document.createElement("label");
    modeLabel.textContent = "Where to match";
    const modeSelect = document.createElement("select");
    [
      ["any", "Anywhere in line"],
      ["start", "Start of line"],
      ["end", "End of line"],
      ["whole", "Whole line"]
    ].forEach(([value, text]) => {
      const opt = document.createElement("option");
      opt.value = value;
      opt.textContent = text;
      modeSelect.appendChild(opt);
    });
    modeField.append(modeLabel, modeSelect);

    const caseField = document.createElement("div");
    caseField.className = "field";
    const caseLabel = document.createElement("label");
    caseLabel.textContent = "Options";
    const caseRow = document.createElement("label");
    caseRow.className = "check-row";
    const caseChk = document.createElement("input");
    caseChk.type = "checkbox";
    const caseText = document.createElement("span");
    caseText.textContent = "Case sensitive";
    caseRow.append(caseChk, caseText);
    caseField.append(caseLabel, caseRow);

    fieldGrid.append(searchField, replaceField, modeField, caseField);

    const controls = document.createElement("div");
    controls.className = "controls";

    const searchBtn = makeBtn("Search lines", "btn-primary", () => {
      runSearch({ preserveCurrent: false, silent: false });
    });

    const nextBtn = makeBtn("Find next", "", () => {
      if (!ensureNeedle()) return;
      if (!hasSearched) runSearch({ preserveCurrent: false, silent: true });
      if (!currentResults.matches.length) {
        showToast("No matches");
        return;
      }
      currentMatchIndex = currentMatchIndex < 0
        ? 0
        : (currentMatchIndex + 1) % currentResults.matches.length;
      focusCurrentMatch();
      renderResults();
    });

    const replaceCurrentBtn = makeBtn("Replace current", "btn-primary", () => {
      if (!ensureNeedle()) return;
      if (!hasSearched) runSearch({ preserveCurrent: false, silent: true });
      if (!currentResults.matches.length) {
        showToast("No matches");
        return;
      }

      const idx = currentMatchIndex >= 0 ? currentMatchIndex : 0;
      const match = currentResults.matches[idx];
      const original = normalizeLineEndings(sourceTA.value);
      const replacement = replaceInput.value;
      const updated =
        original.slice(0, match.absStart) +
        replacement +
        original.slice(match.absEnd);

      sourceTA.value = updated;
      hasSearched = true;
      currentResults = computeSearchData(updated, searchInput.value, getSearchOptions());
      currentMatchIndex = currentResults.matches.findIndex((item) => item.absStart >= match.absStart + replacement.length);
      if (currentMatchIndex < 0) currentMatchIndex = -1;

      markChanged();
      renderResults();

      if (currentMatchIndex >= 0) {
        focusCurrentMatch();
      } else {
        showToast("Replaced 1 match");
      }
    });

    const skipBtn = makeBtn("Skip", "", () => {
      if (!ensureNeedle()) return;
      if (!hasSearched) runSearch({ preserveCurrent: false, silent: true });
      if (!currentResults.matches.length) {
        showToast("No matches");
        return;
      }
      if (currentMatchIndex < 0) {
        currentMatchIndex = 0;
      } else if (currentMatchIndex + 1 < currentResults.matches.length) {
        currentMatchIndex += 1;
      } else {
        currentMatchIndex = -1;
        renderResults();
        showToast("No more matches");
        return;
      }
      focusCurrentMatch();
      renderResults();
    });

    const replaceAllBtn = makeBtn("Replace all", "btn-primary", () => {
      if (!ensureNeedle()) return;
      const result = replaceAllText(sourceTA.value, searchInput.value, replaceInput.value, getSearchOptions());
      if (!result.count) {
        showToast("No matches");
        return;
      }
      sourceTA.value = result.text;
      hasSearched = true;
      currentResults = computeSearchData(result.text, searchInput.value, getSearchOptions());
      currentMatchIndex = -1;
      markChanged();
      renderResults();
      showToast(`Replaced ${result.count} ${result.count === 1 ? "match" : "matches"}`);
    });

    controls.append(searchBtn, nextBtn, replaceCurrentBtn, skipBtn, replaceAllBtn);

    const resultsPanel = document.createElement("div");
    resultsPanel.className = "panel";

    const resultsLabel = document.createElement("label");
    resultsLabel.textContent = "Matching lines";

    const summary = document.createElement("p");
    summary.className = "summary";
    summary.textContent = "Run a search to list matching lines.";

    const resultsActions = document.createElement("div");
    resultsActions.className = "results-actions";

    const copyLinesBtn = makeBtn("Copy matching lines", "btn-copy", async () => {
      if (!hasSearched) runSearch({ preserveCurrent: false, silent: true });
      if (!currentResults.lines.length) {
        showToast("No matching lines");
        return;
      }
      const text = currentResults.lines.map((item) => item.text).join("\n");
      const ok = await copyText(text);
      if (ok) markCopied("Matching lines copied ✓");
      else showToast("Copy failed");
    });

    const copyMatchesBtn = makeBtn("Copy matched text", "btn-copy", async () => {
      if (!hasSearched) runSearch({ preserveCurrent: false, silent: true });
      if (!currentResults.matches.length) {
        showToast("No matched text");
        return;
      }
      const text = currentResults.matches.map((item) => item.matchedText).join("\n");
      const ok = await copyText(text);
      if (ok) markCopied("Matched text copied ✓");
      else showToast("Copy failed");
    });

    const clearSearchBtn = makeBtn("Clear search", "", () => {
      searchInput.value = "";
      replaceInput.value = "";
      modeSelect.value = "any";
      caseChk.checked = false;
      hasSearched = false;
      currentResults = emptyResults();
      currentMatchIndex = -1;
      markChanged();
      renderResults();
      showToast("Search cleared");
    });

    resultsActions.append(copyLinesBtn, copyMatchesBtn, clearSearchBtn);

    const resultsWrap = document.createElement("div");
    resultsWrap.className = "results-wrap";

    const resultsTable = document.createElement("table");
    const resultsHead = document.createElement("thead");
    const headRow = document.createElement("tr");
    ["Line", "Count", "Text"].forEach((text) => {
      const th = document.createElement("th");
      th.textContent = text;
      headRow.appendChild(th);
    });
    resultsHead.appendChild(headRow);

    const resultsBody = document.createElement("tbody");
    resultsTable.append(resultsHead, resultsBody);
    resultsWrap.appendChild(resultsTable);

    const emptyBox = document.createElement("div");
    emptyBox.className = "empty";
    emptyBox.textContent = "Enter search text, then tap Search lines.";

    const feedback = document.createElement("div");
    feedback.className = "feedback";

    resultsPanel.append(resultsLabel, summary, resultsActions, emptyBox, resultsWrap);

    container.append(
      topRow,
      help,
      sourceLabel,
      sourceTA,
      textActions,
      searchPanel,
      resultsPanel,
      feedback
    );

    searchPanel.append(searchPanelLabel, searchHelp, fieldGrid, controls);

    function showToast(message) {
      feedback.textContent = message;
      feedback.classList.add("show");
      if (toastTimer) clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        feedback.classList.remove("show");
      }, 1400);
    }

    function getSearchOptions() {
      return {
        caseSensitive: caseChk.checked,
        mode: modeSelect.value
      };
    }

    function ensureNeedle() {
      if (searchInput.value) return true;
      showToast("Enter search text first");
      return false;
    }

    function markCopied(message) {
      copiedSinceChange = true;
      renderBadges();
      saveState();
      showToast(message || "Copied");
    }

    function markChanged() {
      copiedSinceChange = false;
      renderBadges();
      saveStateDebounced();
    }

    function renderBadges() {
      const lineCount = countLines(sourceTA.value);
      linesBadge.className = lineCount ? "badge dim" : "badge warn";
      linesBadge.textContent = `${lineCount} ${lineCount === 1 ? "line" : "lines"}`;

      matchesBadge.className = currentResults.matches.length ? "badge good" : "badge dim";
      matchesBadge.textContent = `${currentResults.matches.length} ${currentResults.matches.length === 1 ? "match" : "matches"}`;

      if (currentMatchIndex >= 0 && currentResults.matches.length) {
        currentBadge.className = "badge good";
        currentBadge.textContent = `${currentMatchIndex + 1}/${currentResults.matches.length}`;
      } else {
        currentBadge.className = "badge dim";
        currentBadge.textContent = `0/${currentResults.matches.length}`;
      }

      if (copiedSinceChange) {
        copyBadge.className = "badge good";
        copyBadge.textContent = "Copied ✓";
      } else {
        copyBadge.className = "badge warn";
        copyBadge.textContent = "Not copied";
      }
    }

    function renderResults() {
      resultsBody.innerHTML = "";

      if (!searchInput.value) {
        summary.textContent = "Enter search text, then tap Search lines.";
        emptyBox.textContent = "Enter search text, then tap Search lines.";
        emptyBox.style.display = "block";
        resultsWrap.style.display = "none";
      } else if (!hasSearched) {
        summary.textContent = "Tap Search lines to list matching lines.";
        emptyBox.textContent = "Tap Search lines to list matching lines.";
        emptyBox.style.display = "block";
        resultsWrap.style.display = "none";
      } else if (!currentResults.lines.length) {
        summary.textContent = "No matching lines.";
        emptyBox.textContent = "No matching lines.";
        emptyBox.style.display = "block";
        resultsWrap.style.display = "none";
      } else {
        summary.textContent = `${currentResults.lines.length} matching ${currentResults.lines.length === 1 ? "line" : "lines"} • ${currentResults.matches.length} ${currentResults.matches.length === 1 ? "match" : "matches"}`;
        emptyBox.style.display = "none";
        resultsWrap.style.display = "block";

        const currentLineNumber = currentMatchIndex >= 0 && currentResults.matches[currentMatchIndex]
          ? currentResults.matches[currentMatchIndex].lineNumber
          : null;

        currentResults.lines.forEach((item) => {
          const tr = document.createElement("tr");
          if (currentLineNumber && currentLineNumber === item.lineNumber) {
            tr.className = "current";
          }

          const tdLine = document.createElement("td");
          tdLine.className = "line-no";
          tdLine.textContent = String(item.lineNumber);

          const tdCount = document.createElement("td");
          tdCount.className = "match-count";
          tdCount.textContent = String(item.count);

          const tdText = document.createElement("td");
          tdText.className = "line-text";
          appendHighlightedLine(tdText, item.text, item.spans);

          tr.append(tdLine, tdCount, tdText);
          resultsBody.appendChild(tr);
        });
      }

      copyLinesBtn.disabled = !currentResults.lines.length;
      copyMatchesBtn.disabled = !currentResults.matches.length;
      nextBtn.disabled = !searchInput.value;
      replaceCurrentBtn.disabled = !searchInput.value;
      replaceAllBtn.disabled = !searchInput.value;
      skipBtn.disabled = !searchInput.value;

      renderBadges();
    }

    function renderAll() {
      renderResults();
    }

    function runSearch({ preserveCurrent, silent }) {
      if (!ensureNeedle()) return;

      const previousMatch = preserveCurrent && currentMatchIndex >= 0 && currentResults.matches[currentMatchIndex]
        ? currentResults.matches[currentMatchIndex]
        : null;

      hasSearched = true;
      currentResults = computeSearchData(sourceTA.value, searchInput.value, getSearchOptions());

      if (previousMatch) {
        currentMatchIndex = currentResults.matches.findIndex((item) => item.absStart === previousMatch.absStart && item.absEnd === previousMatch.absEnd);
      } else {
        currentMatchIndex = -1;
      }

      if (currentMatchIndex < 0) currentMatchIndex = -1;

      renderResults();
      saveStateDebounced();

      if (!silent) {
        if (!currentResults.matches.length) {
          showToast("No matches");
        } else {
          showToast(`Found ${currentResults.matches.length} ${currentResults.matches.length === 1 ? "match" : "matches"}`);
        }
      }
    }

    function focusCurrentMatch() {
      if (currentMatchIndex < 0 || currentMatchIndex >= currentResults.matches.length) return;
      const match = currentResults.matches[currentMatchIndex];
      sourceTA.focus();
      sourceTA.setSelectionRange(match.absStart, match.absEnd);
      renderBadges();
    }

    function saveState() {
      try {
        const state = {
          v: 1,
          sourceText: normalizeLineEndings(sourceTA.value),
          searchText: searchInput.value,
          replaceText: replaceInput.value,
          caseSensitive: caseChk.checked,
          mode: modeSelect.value,
          hasSearched,
          copiedSinceChange
        };
        localStorage.setItem(storageKey, JSON.stringify(state));
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
      }, 350);
    }

    function restoreState() {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const state = safeJsonParse(raw);
      if (!state || typeof state !== "object") return;

      sourceTA.value = typeof state.sourceText === "string" ? state.sourceText : "";
      searchInput.value = typeof state.searchText === "string" ? state.searchText : "";
      replaceInput.value = typeof state.replaceText === "string" ? state.replaceText : "";
      caseChk.checked = !!state.caseSensitive;
      modeSelect.value = typeof state.mode === "string" ? state.mode : "any";
      hasSearched = !!state.hasSearched;
      copiedSinceChange = !!state.copiedSinceChange;

      if (hasSearched && searchInput.value) {
        currentResults = computeSearchData(sourceTA.value, searchInput.value, getSearchOptions());
      }
    }

    sourceTA.addEventListener("input", () => {
      currentMatchIndex = -1;
      if (hasSearched && searchInput.value) {
        currentResults = computeSearchData(sourceTA.value, searchInput.value, getSearchOptions());
      }
      markChanged();
      renderResults();
    });

    [searchInput, modeSelect, caseChk].forEach((el) => {
      el.addEventListener("input", () => {
        currentMatchIndex = -1;
        if (hasSearched && searchInput.value) {
          currentResults = computeSearchData(sourceTA.value, searchInput.value, getSearchOptions());
        } else {
          currentResults = emptyResults();
        }
        markChanged();
        renderResults();
      });
      el.addEventListener("change", () => {
        currentMatchIndex = -1;
        if (hasSearched && searchInput.value) {
          currentResults = computeSearchData(sourceTA.value, searchInput.value, getSearchOptions());
        } else {
          currentResults = emptyResults();
        }
        markChanged();
        renderResults();
      });
    });

    replaceInput.addEventListener("input", () => {
      markChanged();
    });

    restoreState();
    renderAll();
    saveBadge.className = "badge good";
    saveBadge.textContent = "Saved ✓";
  });
})();
