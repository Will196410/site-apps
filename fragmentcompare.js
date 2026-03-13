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

  const STYLE_ID = "siteapps-fragment-compare-style-v3";

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
/* Fragment Compare — SiteApps pattern, high contrast, iPad safe */
[data-app="fragmentcompare"]{
  font-family:-apple-system,system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;
  background:#fff;
  border:2px solid #111;
  padding:18px;
  border-radius:14px;
  color:#111;
  width:min(100%, 1280px);
  margin:14px auto;
  box-sizing:border-box;
}

[data-app="fragmentcompare"] .top-row{
  display:flex;
  align-items:baseline;
  justify-content:space-between;
  gap:10px;
  flex-wrap:wrap;
  margin-bottom:10px;
}

[data-app="fragmentcompare"] h3{
  margin:0;
  font-size:20px;
  font-weight:900;
}

[data-app="fragmentcompare"] .status-row{
  display:flex;
  gap:10px;
  align-items:center;
  flex-wrap:wrap;
  justify-content:flex-end;
}

[data-app="fragmentcompare"] .badge{
  font-size:14px;
  font-weight:900;
  padding:6px 10px;
  border:2px solid #111;
  border-radius:999px;
  background:#fff;
}

[data-app="fragmentcompare"] .badge.good{ border-color:#0b3d0b; color:#0b3d0b; }
[data-app="fragmentcompare"] .badge.warn{ border-color:#7a0000; color:#7a0000; }
[data-app="fragmentcompare"] .badge.dim{ border-color:#444; color:#444; }

[data-app="fragmentcompare"] label{
  display:block;
  margin:10px 0 6px;
  font-weight:900;
  font-size:14px;
}

[data-app="fragmentcompare"] textarea{
  width:100%;
  min-height:240px;
  padding:12px;
  border:2px solid #111;
  border-radius:10px;
  font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace;
  font-size:15px;
  line-height:1.4;
  resize:vertical;
  box-sizing:border-box;
  background:#fff;
  color:#111;
  -webkit-appearance:none;
  appearance:none;
}

[data-app="fragmentcompare"] textarea:focus{
  outline:none;
  box-shadow:0 0 0 3px rgba(11,95,255,0.25);
}

[data-app="fragmentcompare"] .results{
  min-height:320px;
}

[data-app="fragmentcompare"] .controls,
[data-app="fragmentcompare"] .actions{
  display:flex;
  flex-wrap:wrap;
  gap:10px;
  margin-top:12px;
  align-items:center;
}

[data-app="fragmentcompare"] button{
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

[data-app="fragmentcompare"] .btn-primary{
  background:#0b5fff;
  border-color:#0b5fff;
  color:#fff;
}

[data-app="fragmentcompare"] .btn-copy{
  background:#111;
  border-color:#111;
  color:#fff;
}

[data-app="fragmentcompare"] .btn-clear{
  background:#fff;
  border-color:#7a0000;
  color:#7a0000;
}

[data-app="fragmentcompare"] .check,
[data-app="fragmentcompare"] .mode-wrap{
  display:flex;
  align-items:center;
  gap:10px;
  padding:8px 10px;
  border:2px solid #111;
  border-radius:10px;
  background:#fff;
}

[data-app="fragmentcompare"] input[type="checkbox"],
[data-app="fragmentcompare"] input[type="radio"]{
  width:20px;
  height:20px;
  margin:0;
}

[data-app="fragmentcompare"] .mode-wrap label,
[data-app="fragmentcompare"] .check label{
  margin:0;
  font-weight:900;
}

[data-app="fragmentcompare"] .result-wrap{
  position:relative;
}

[data-app="fragmentcompare"] .feedback{
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
  transition:opacity .2s;
  pointer-events:none;
}

[data-app="fragmentcompare"] .feedback.show{
  opacity:1;
}

@media (max-width:700px){
  [data-app="fragmentcompare"] .controls,
  [data-app="fragmentcompare"] .actions{
    flex-direction:column;
    align-items:stretch;
  }

  [data-app="fragmentcompare"] .controls button,
  [data-app="fragmentcompare"] .actions button{
    width:100%;
  }

  [data-app="fragmentcompare"] .mode-wrap,
  [data-app="fragmentcompare"] .check{
    width:100%;
    box-sizing:border-box;
    flex-wrap:wrap;
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
    if (k && k.trim()) return `siteapps:fragmentcompare:${k.trim()}`;
    return `siteapps:fragmentcompare:${location.pathname || "/"}`;
  }

  function normalizeLineEndings(s) {
    return String(s || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  }

  function normalizeSpaces(s) {
    return String(s || "").replace(/\s+/g, " ").trim();
  }

  function splitLines(s, ignoreEmpty) {
    const lines = normalizeLineEndings(s).split("\n");
    return ignoreEmpty ? lines.filter(line => line.trim() !== "") : lines;
  }

  function splitWords(s) {
    const text = normalizeLineEndings(s).trim();
    if (!text) return [];
    return text.split(/\s+/).filter(Boolean);
  }

  function splitSentences(s) {
    const text = normalizeLineEndings(s).replace(/\n+/g, " ").trim();
    if (!text) return [];

    const matches = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];
    return matches
      .map(part => normalizeSpaces(part))
      .filter(Boolean);
  }

  function buildPositions(items) {
    const map = new Map();
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!map.has(item)) map.set(item, []);
      map.get(item).push(i + 1);
    }
    return map;
  }

  function compareItems(aItems, bItems) {
    const posA = buildPositions(aItems);
    const posB = buildPositions(bItems);

    const allKeys = new Set([...posA.keys(), ...posB.keys()]);

    const onlyA = [];
    const onlyB = [];
    const same = [];
    const moved = [];

    const sortedKeys = Array.from(allKeys).sort((x, y) =>
      x.localeCompare(y, undefined, { sensitivity: "base" })
    );

    for (const item of sortedKeys) {
      const aPos = posA.get(item) || [];
      const bPos = posB.get(item) || [];
      const commonCount = Math.min(aPos.length, bPos.length);

      for (let i = 0; i < commonCount; i++) {
        const aPosNo = aPos[i];
        const bPosNo = bPos[i];

        if (aPosNo === bPosNo) {
          same.push({ text: item, a: aPosNo, b: bPosNo });
        } else {
          moved.push({ text: item, a: aPosNo, b: bPosNo });
        }
      }

      if (aPos.length > commonCount) {
        for (let i = commonCount; i < aPos.length; i++) {
          onlyA.push({ text: item, a: aPos[i] });
        }
      }

      if (bPos.length > commonCount) {
        for (let i = commonCount; i < bPos.length; i++) {
          onlyB.push({ text: item, b: bPos[i] });
        }
      }
    }

    same.sort((x, y) => x.a - y.a);
    moved.sort((x, y) => x.a - y.a);
    onlyA.sort((x, y) => x.a - y.a);
    onlyB.sort((x, y) => x.b - y.b);

    return { same, moved, onlyA, onlyB };
  }

  function getItemsForMode(text, mode, ignoreEmpty) {
    if (mode === "words") return splitWords(text);
    if (mode === "sentences") return splitSentences(text);
    return splitLines(text, ignoreEmpty);
  }

  function compareFragments(aText, bText, mode, ignoreEmpty) {
    const aItems = getItemsForMode(aText, mode, ignoreEmpty);
    const bItems = getItemsForMode(bText, mode, ignoreEmpty);

    const compared = compareItems(aItems, bItems);

    return {
      mode,
      ignoreEmpty,
      aCount: aItems.length,
      bCount: bItems.length,
      same: compared.same,
      moved: compared.moved,
      onlyA: compared.onlyA,
      onlyB: compared.onlyB
    };
  }

  function modeLabel(mode) {
    if (mode === "words") return "Words";
    if (mode === "sentences") return "Sentences";
    return "Lines";
  }

  function unitPlural(mode) {
    if (mode === "words") return "words";
    if (mode === "sentences") return "sentences";
    return "lines";
  }

  function unitSingular(mode) {
    if (mode === "words") return "word";
    if (mode === "sentences") return "sentence";
    return "line";
  }

  function formatReport(data) {
    const unit = unitPlural(data.mode);
    const unitOne = unitSingular(data.mode);

    const out = [];

    out.push("FRAGMENT COMPARISON");
    out.push("===================");
    out.push("");
    out.push(`Mode: ${modeLabel(data.mode)}`);
    out.push(`Fragment A ${unit}: ${data.aCount}`);
    out.push(`Fragment B ${unit}: ${data.bCount}`);
    if (data.mode === "lines") {
      out.push(`Ignore empty lines: ${data.ignoreEmpty ? "Yes" : "No"}`);
    }
    out.push("");
    out.push("SUMMARY");
    out.push("-------");
    out.push(`Same position: ${data.same.length}`);
    out.push(`Moved in B: ${data.moved.length}`);
    out.push(`In A but not B: ${data.onlyA.length}`);
    out.push(`In B but not A: ${data.onlyB.length}`);
    out.push("");

    out.push(`SAME ${unit.toUpperCase()}`);
    out.push("-".repeat(`SAME ${unit.toUpperCase()}`.length));
    if (!data.same.length) {
      out.push("(none)");
    } else {
      data.same.forEach(item => {
        out.push(`[A ${item.a} = B ${item.b}] ${item.text}`);
      });
    }
    out.push("");

    out.push(`MOVED ${unit.toUpperCase()} IN B`);
    out.push("-".repeat(`MOVED ${unit.toUpperCase()} IN B`.length));
    if (!data.moved.length) {
      out.push("(none)");
    } else {
      data.moved.forEach(item => {
        out.push(`[A ${item.a} -> B ${item.b}] ${item.text}`);
      });
    }
    out.push("");

    out.push(`IN A BUT NOT B (${unitOne.toUpperCase()} POSITIONS)`);
    out.push("-".repeat(`IN A BUT NOT B (${unitOne.toUpperCase()} POSITIONS)`.length));
    if (!data.onlyA.length) {
      out.push("(none)");
    } else {
      data.onlyA.forEach(item => {
        out.push(`[A ${item.a}] ${item.text}`);
      });
    }
    out.push("");

    out.push(`IN B BUT NOT A (${unitOne.toUpperCase()} POSITIONS)`);
    out.push("-".repeat(`IN B BUT NOT A (${unitOne.toUpperCase()} POSITIONS)`.length));
    if (!data.onlyB.length) {
      out.push("(none)");
    } else {
      data.onlyB.forEach(item => {
        out.push(`[B ${item.b}] ${item.text}`);
      });
    }

    return out.join("\n");
  }

  window.SiteApps.register("fragmentcompare", (container) => {
    ensureStyle();

    const storageKey = makeStorageKey(container);

    let copiedSinceChange = false;
    let lastCopyAt = null;
    let saveTimer = null;

    function setCopied(flag) {
      copiedSinceChange = !!flag;
      if (copiedSinceChange) lastCopyAt = new Date().toISOString();
      renderBadges();
      saveState();
    }

    function renderBadges() {
      if (copiedSinceChange) {
        copyBadge.className = "badge good";
        copyBadge.textContent = "Copied ✓";
        copyBadge.title = lastCopyAt ? `Last copied: ${lastCopyAt}` : "";
      } else {
        copyBadge.className = "badge warn";
        copyBadge.textContent = "Not copied";
        copyBadge.title = "You’ve changed something since last copy.";
      }
    }

    function markChanged() {
      copiedSinceChange = false;
      renderBadges();
      saveStateDebounced();
    }

    function currentMode() {
      if (modeWordsRB.checked) return "words";
      if (modeSentencesRB.checked) return "sentences";
      return "lines";
    }

    function saveState() {
      try {
        const state = {
          v: 3,
          aText: aTA.value,
          bText: bTA.value,
          resultText: resultTA.value,
          ignoreEmpty: ignoreEmptyCB.checked,
          mode: currentMode(),
          copiedSinceChange,
          lastCopyAt
        };
        localStorage.setItem(storageKey, JSON.stringify(state));
        saveBadge.className = "badge good";
        saveBadge.textContent = "Saved ✓";
      } catch {
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
      }, 500);
    }

    function restoreState() {
      try {
        const raw = localStorage.getItem(storageKey);
        if (!raw) return;
        const s = safeJsonParse(raw);
        if (!s || typeof s !== "object") return;

        if (typeof s.aText === "string") aTA.value = s.aText;
        if (typeof s.bText === "string") bTA.value = s.bText;
        if (typeof s.resultText === "string") resultTA.value = s.resultText;
        ignoreEmptyCB.checked = !!s.ignoreEmpty;

        if (s.mode === "words") {
          modeWordsRB.checked = true;
        } else if (s.mode === "sentences") {
          modeSentencesRB.checked = true;
        } else {
          modeLinesRB.checked = true;
        }

        copiedSinceChange = !!s.copiedSinceChange;
        lastCopyAt = typeof s.lastCopyAt === "string" ? s.lastCopyAt : null;
      } catch {}
    }

    container.innerHTML = "";

    const topRow = document.createElement("div");
    topRow.className = "top-row";

    const title = document.createElement("h3");
    title.textContent = "Text Fragment Comparator";

    const statusRow = document.createElement("div");
    statusRow.className = "status-row";

    const saveBadge = document.createElement("span");
    saveBadge.className = "badge dim";
    saveBadge.textContent = "";

    const copyBadge = document.createElement("span");
    copyBadge.className = "badge warn";
    copyBadge.textContent = "Not copied";

    statusRow.append(saveBadge, copyBadge);
    topRow.append(title, statusRow);

    const aLabel = document.createElement("label");
    aLabel.textContent = "Fragment A";

    const aTA = document.createElement("textarea");
    aTA.placeholder = "Paste fragment A here…";

    const bLabel = document.createElement("label");
    bLabel.textContent = "Fragment B";

    const bTA = document.createElement("textarea");
    bTA.placeholder = "Paste fragment B here…";

    const controls = document.createElement("div");
    controls.className = "controls";

    const compareBtn = document.createElement("button");
    compareBtn.type = "button";
    compareBtn.className = "btn-primary";
    compareBtn.textContent = "Compare fragments";

    const modeWrap = document.createElement("div");
    modeWrap.className = "mode-wrap";

    const modeName = `fragmentcompare-mode-${Math.random().toString(16).slice(2)}`;

    const modeLinesRB = document.createElement("input");
    modeLinesRB.type = "radio";
    modeLinesRB.name = modeName;
    modeLinesRB.id = `${modeName}-lines`;
    modeLinesRB.checked = true;

    const modeLinesLbl = document.createElement("label");
    modeLinesLbl.setAttribute("for", modeLinesRB.id);
    modeLinesLbl.textContent = "Lines";

    const modeWordsRB = document.createElement("input");
    modeWordsRB.type = "radio";
    modeWordsRB.name = modeName;
    modeWordsRB.id = `${modeName}-words`;

    const modeWordsLbl = document.createElement("label");
    modeWordsLbl.setAttribute("for", modeWordsRB.id);
    modeWordsLbl.textContent = "Words";

    const modeSentencesRB = document.createElement("input");
    modeSentencesRB.type = "radio";
    modeSentencesRB.name = modeName;
    modeSentencesRB.id = `${modeName}-sentences`;

    const modeSentencesLbl = document.createElement("label");
    modeSentencesLbl.setAttribute("for", modeSentencesRB.id);
    modeSentencesLbl.textContent = "Sentences";

    modeWrap.append(
      modeLinesRB, modeLinesLbl,
      modeWordsRB, modeWordsLbl,
      modeSentencesRB, modeSentencesLbl
    );

    const ignoreEmptyWrap = document.createElement("div");
    ignoreEmptyWrap.className = "check";

    const ignoreEmptyCB = document.createElement("input");
    ignoreEmptyCB.type = "checkbox";
    ignoreEmptyCB.id = `fragmentcompare-empty-${Math.random().toString(16).slice(2)}`;

    const ignoreEmptyLbl = document.createElement("label");
    ignoreEmptyLbl.setAttribute("for", ignoreEmptyCB.id);
    ignoreEmptyLbl.textContent = "Ignore empty lines";

    ignoreEmptyWrap.append(ignoreEmptyCB, ignoreEmptyLbl);

    const resultWrap = document.createElement("div");
    resultWrap.className = "result-wrap";

    const resultLabel = document.createElement("label");
    resultLabel.textContent = "Comparison result";

    const resultTA = document.createElement("textarea");
    resultTA.className = "results";
    resultTA.readOnly = true;
    resultTA.placeholder = "Comparison report will appear here…";

    const feedback = document.createElement("div");
    feedback.className = "feedback";
    feedback.textContent = "Copied!";

    resultWrap.append(resultLabel, resultTA, feedback);

    const actions = document.createElement("div");
    actions.className = "actions";

    function mkBtn(text, cls, fn) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = cls;
      b.textContent = text;
      b.addEventListener("click", fn);
      return b;
    }

    function syncUiForMode() {
      ignoreEmptyWrap.style.display = modeLinesRB.checked ? "flex" : "none";
    }

    function runCompare() {
      const aText = aTA.value || "";
      const bText = bTA.value || "";

      if (!aText.trim() && !bText.trim()) {
        alert("Please paste text into fragment A and fragment B.");
        return;
      }

      const result = compareFragments(aText, bText, currentMode(), ignoreEmptyCB.checked);
      resultTA.value = formatReport(result);
      markChanged();
    }

    async function copyResult() {
      const text = resultTA.value || "";
      if (!text.trim()) {
        alert("No comparison result to copy.");
        return;
      }

      try {
        await navigator.clipboard.writeText(text);
        feedback.classList.add("show");
        setTimeout(() => feedback.classList.remove("show"), 1200);
        setCopied(true);
        return;
      } catch {}

      try {
        resultTA.focus();
        resultTA.select();
        const ok = document.execCommand("copy");
        if (!ok) throw new Error("execCommand failed");
        feedback.classList.add("show");
        setTimeout(() => feedback.classList.remove("show"), 1200);
        setCopied(true);
      } catch {
        alert("Copy failed. Tap and hold to copy, or try a different browser.");
      }
    }

    function clearAll() {
      if (!confirm("Clear both fragments and the results?")) return;
      aTA.value = "";
      bTA.value = "";
      resultTA.value = "";
      ignoreEmptyCB.checked = false;
      modeLinesRB.checked = true;
      copiedSinceChange = false;
      lastCopyAt = null;
      syncUiForMode();
      renderBadges();
      saveStateDebounced();
    }

    compareBtn.addEventListener("click", runCompare);

    actions.append(
      mkBtn("📋 Copy result", "btn-copy", copyResult),
      mkBtn("🗑️ Clear all", "btn-clear", clearAll)
    );

    controls.append(compareBtn, modeWrap, ignoreEmptyWrap);

    container.append(
      topRow,
      aLabel,
      aTA,
      bLabel,
      bTA,
      controls,
      resultWrap,
      actions
    );

    aTA.addEventListener("input", () => {
      markChanged();
      saveStateDebounced();
    });

    bTA.addEventListener("input", () => {
      markChanged();
      saveStateDebounced();
    });

    ignoreEmptyCB.addEventListener("change", () => {
      markChanged();
      saveStateDebounced();
    });

    modeLinesRB.addEventListener("change", () => {
      syncUiForMode();
      markChanged();
      saveStateDebounced();
    });

    modeWordsRB.addEventListener("change", () => {
      syncUiForMode();
      markChanged();
      saveStateDebounced();
    });

    modeSentencesRB.addEventListener("change", () => {
      syncUiForMode();
      markChanged();
      saveStateDebounced();
    });

    restoreState();
    syncUiForMode();
    renderBadges();
    saveBadge.className = "badge good";
    saveBadge.textContent = "Saved ✓";
  });
})();
