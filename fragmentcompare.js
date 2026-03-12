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

  const STYLE_ID = "siteapps-fragment-compare-style-v1";

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

[data-app="fragmentcompare"] .section{
  margin-top:12px;
}

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

[data-app="fragmentcompare"] .check{
  display:flex;
  align-items:center;
  gap:10px;
  padding:8px 10px;
  border:2px solid #111;
  border-radius:10px;
}

[data-app="fragmentcompare"] input[type="checkbox"]{
  width:20px;
  height:20px;
  margin:0;
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

  function splitLines(s, ignoreEmpty) {
    const lines = normalizeLineEndings(s).split("\n");
    if (!ignoreEmpty) return lines;
    return lines.filter(line => line.trim() !== "");
  }

  function buildPositions(lines) {
    const map = new Map();
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!map.has(line)) map.set(line, []);
      map.get(line).push(i + 1); // 1-based for user display
    }
    return map;
  }

  function plural(n, one, many) {
    return `${n} ${n === 1 ? one : many}`;
  }

  function compareFragments(aText, bText, ignoreEmpty) {
    const aLines = splitLines(aText, ignoreEmpty);
    const bLines = splitLines(bText, ignoreEmpty);

    const posA = buildPositions(aLines);
    const posB = buildPositions(bLines);

    const allKeys = new Set([...posA.keys(), ...posB.keys()]);

    const onlyA = [];
    const onlyB = [];
    const same = [];
    const moved = [];

    const sortedKeys = Array.from(allKeys).sort((x, y) =>
      x.localeCompare(y, undefined, { sensitivity: "base" })
    );

    for (const line of sortedKeys) {
      const aPos = posA.get(line) || [];
      const bPos = posB.get(line) || [];
      const commonCount = Math.min(aPos.length, bPos.length);

      for (let i = 0; i < commonCount; i++) {
        const aLineNo = aPos[i];
        const bLineNo = bPos[i];

        if (aLineNo === bLineNo) {
          same.push({
            text: line,
            a: aLineNo,
            b: bLineNo
          });
        } else {
          moved.push({
            text: line,
            a: aLineNo,
            b: bLineNo
          });
        }
      }

      if (aPos.length > commonCount) {
        for (let i = commonCount; i < aPos.length; i++) {
          onlyA.push({
            text: line,
            a: aPos[i]
          });
        }
      }

      if (bPos.length > commonCount) {
        for (let i = commonCount; i < bPos.length; i++) {
          onlyB.push({
            text: line,
            b: bPos[i]
          });
        }
      }
    }

    same.sort((x, y) => x.a - y.a);
    moved.sort((x, y) => x.a - y.a);
    onlyA.sort((x, y) => x.a - y.a);
    onlyB.sort((x, y) => x.b - y.b);

    return {
      aCount: aLines.length,
      bCount: bLines.length,
      same,
      moved,
      onlyA,
      onlyB
    };
  }

  function formatReport(data, ignoreEmpty) {
    const out = [];

    out.push("FRAGMENT COMPARISON");
    out.push("===================");
    out.push("");
    out.push(`Fragment A lines: ${data.aCount}`);
    out.push(`Fragment B lines: ${data.bCount}`);
    out.push(`Ignore empty lines: ${ignoreEmpty ? "Yes" : "No"}`);
    out.push("");
    out.push("SUMMARY");
    out.push("-------");
    out.push(`Same position: ${data.same.length}`);
    out.push(`Moved in B: ${data.moved.length}`);
    out.push(`In A but not B: ${data.onlyA.length}`);
    out.push(`In B but not A: ${data.onlyB.length}`);
    out.push("");

    out.push("SAME");
    out.push("----");
    if (!data.same.length) {
      out.push("(none)");
    } else {
      data.same.forEach(item => {
        out.push(`[A ${item.a} = B ${item.b}] ${item.text}`);
      });
    }
    out.push("");

    out.push("MOVED IN B");
    out.push("----------");
    if (!data.moved.length) {
      out.push("(none)");
    } else {
      data.moved.forEach(item => {
        out.push(`[A ${item.a} -> B ${item.b}] ${item.text}`);
      });
    }
    out.push("");

    out.push("IN A BUT NOT B");
    out.push("--------------");
    if (!data.onlyA.length) {
      out.push("(none)");
    } else {
      data.onlyA.forEach(item => {
        out.push(`[A ${item.a}] ${item.text}`);
      });
    }
    out.push("");

    out.push("IN B BUT NOT A");
    out.push("--------------");
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

    function saveState() {
      try {
        const state = {
          v: 1,
          aText: aTA.value,
          bText: bTA.value,
          resultText: resultTA.value,
          ignoreEmpty: ignoreEmptyCB.checked,
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

    const ignoreEmptyWrap = document.createElement("div");
    ignoreEmptyWrap.className = "check";

    const ignoreEmptyCB = document.createElement("input");
    ignoreEmptyCB.type = "checkbox";
    ignoreEmptyCB.id = `fragmentcompare-empty-${Math.random().toString(16).slice(2)}`;

    const ignoreEmptyLbl = document.createElement("label");
    ignoreEmptyLbl.setAttribute("for", ignoreEmptyCB.id);
    ignoreEmptyLbl.style.margin = "0";
    ignoreEmptyLbl.textContent = "Ignore empty lines";

    ignoreEmptyWrap.append(ignoreEmptyCB, ignoreEmptyLbl);

    function mkBtn(text, cls, fn) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = cls;
      b.textContent = text;
      b.addEventListener("click", fn);
      return b;
    }

    function runCompare() {
      const aText = aTA.value || "";
      const bText = bTA.value || "";

      if (!aText.trim() && !bText.trim()) {
        alert("Please paste text into fragment A and fragment B.");
        return;
      }

      const result = compareFragments(aText, bText, ignoreEmptyCB.checked);
      resultTA.value = formatReport(result, ignoreEmptyCB.checked);
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
      copiedSinceChange = false;
      lastCopyAt = null;
      renderBadges();
      saveStateDebounced();
    }

    controls.append(
      mkBtn("Compare fragments", "btn-primary", runCompare),
      ignoreEmptyWrap
    );

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
    actions.append(
      mkBtn("📋 Copy result", "btn-copy", copyResult),
      mkBtn("🗑️ Clear all", "btn-clear", clearAll)
    );

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

    restoreState();
    renderBadges();
    saveBadge.className = "badge good";
    saveBadge.textContent = "Saved ✓";
  });
})();
