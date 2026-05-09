(() => {
  "use strict";

  window.SiteApps = window.SiteApps || {};
  window.SiteApps.registry = window.SiteApps.registry || {};
  window.SiteApps.register = window.SiteApps.register || function (name, initFn) {
    window.SiteApps.registry[name] = initFn;
  };

  const STYLE_ID = "siteapps-analyzer-v9-pos-phrases";
  const STORAGE_KEY = "siteapps:analyzer:v9:config";

  const DEFAULT_FILTERS = [
    "just", "very", "really", "felt", "feel", "think", "thought",
    "actually", "suddenly", "started to", "began to", "seemed", "looked"
  ];

  const DEFAULT_SWITCHES = {
    summary: true,
    sentenceLen: true,
    repeats: true,
    filterWords: true,
    posAdverbs: false,
    posVerbs: false,
    posNouns: false,
    posAdjectives: false
  };

  const COMMON_VERBS = new Set([
    "am", "are", "is", "was", "were", "be", "being", "been",
    "have", "has", "had", "do", "does", "did",
    "say", "says", "said", "go", "goes", "went", "gone",
    "make", "makes", "made", "take", "takes", "took", "taken",
    "see", "sees", "saw", "seen", "look", "looks", "looked",
    "feel", "feels", "felt", "think", "thinks", "thought",
    "know", "knows", "knew", "known", "come", "comes", "came",
    "give", "gives", "gave", "given", "get", "gets", "got",
    "find", "finds", "found", "tell", "tells", "told",
    "ask", "asks", "asked", "want", "wants", "wanted",
    "need", "needs", "needed", "try", "tries", "tried",
    "turn", "turns", "turned", "move", "moves", "moved",
    "stand", "stands", "stood", "sit", "sits", "sat",
    "walk", "walks", "walked", "run", "runs", "ran",
    "hold", "holds", "held", "keep", "keeps", "kept",
    "leave", "leaves", "left", "hear", "hears", "heard",
    "watch", "watches", "watched", "pull", "pulls", "pulled",
    "push", "pushes", "pushed", "open", "opens", "opened",
    "close", "closes", "closed", "kill", "kills", "killed",
    "live", "lives", "lived", "die", "dies", "died"
  ]);

  const COMMON_ADJECTIVES = new Set([
    "good", "bad", "great", "small", "large", "big", "little",
    "old", "young", "new", "dark", "light", "bright", "cold",
    "hot", "warm", "cool", "red", "blue", "green", "black",
    "white", "grey", "gray", "hard", "soft", "sharp", "dull",
    "long", "short", "thin", "thick", "high", "low", "deep",
    "shallow", "quiet", "loud", "quick", "slow", "heavy",
    "empty", "full", "strange", "familiar", "dead", "alive",
    "angry", "afraid", "tired", "silent", "wild", "human"
  ]);

  const COMMON_NOUNS = new Set([
    "man", "woman", "child", "boy", "girl", "people", "person",
    "hand", "hands", "face", "eyes", "eye", "head", "body",
    "door", "room", "house", "street", "road", "tree", "water",
    "fire", "air", "earth", "stone", "ship", "boat", "horse",
    "city", "village", "voice", "sound", "word", "time", "day",
    "night", "light", "shadow", "blood", "name", "mother", "father"
  ]);

  const DETERMINERS = new Set([
    "a", "an", "the", "this", "that", "these", "those",
    "my", "your", "his", "her", "its", "our", "their"
  ]);

  const PREPOSITIONS = new Set([
    "in", "on", "at", "by", "with", "from", "to", "into", "onto",
    "under", "over", "through", "across", "behind", "before", "after",
    "between", "among", "around", "near", "beside", "inside", "outside",
    "of", "for", "about"
  ]);

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
        box-sizing: border-box;
        overflow-x: hidden;
      }

      [data-app="analyzer"] * {
        box-sizing: border-box;
      }

      [data-app="analyzer"] .section {
        margin-bottom: 30px;
      }

      [data-app="analyzer"] .frame {
        border: 2px solid #000;
        background: #fff;
        border-radius: 4px;
        overflow: hidden;
      }

      [data-app="analyzer"] #input-text {
        width: 100%;
        min-height: 500px;
        border: none;
        padding: 20px;
        font-family: ui-monospace, monospace;
        font-size: 16px;
        line-height: 1.6;
        outline: none;
        display: block;
      }

      [data-app="analyzer"] .control-stack {
        display: flex;
        flex-direction: column;
        gap: 20px;
        margin-bottom: 20px;
        width: 100%;
      }

      [data-app="analyzer"] .panel {
        background: #f9f9f9;
        padding: 15px;
        border: 2px solid #000;
        border-radius: 4px;
        width: 100%;
        min-width: 0;
      }

      [data-app="analyzer"] .panel h3 {
        margin-top: 0;
      }

      [data-app="analyzer"] .switch-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px 16px;
      }

      [data-app="analyzer"] .switch-item {
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 900;
        text-transform: uppercase;
        font-size: 12px;
        margin-bottom: 8px;
        cursor: pointer;
        line-height: 1.4;
      }

      [data-app="analyzer"] .switch-item input {
        flex: 0 0 auto;
      }

      [data-app="analyzer"] .filter-input-group {
        display: flex;
        gap: 5px;
        margin-bottom: 10px;
        width: 100%;
      }

      [data-app="analyzer"] .filter-input-group input {
        flex: 1 1 auto;
        min-width: 0;
        padding: 8px;
        border: 2px solid #000;
        outline: none;
      }

      [data-app="analyzer"] .btn-small {
        background: #000;
        color: #fff;
        border: none;
        padding: 8px 12px;
        cursor: pointer;
        font-weight: bold;
        text-transform: uppercase;
        font-size: 11px;
        white-space: nowrap;
      }

      [data-app="analyzer"] .btn-small:hover {
        background: #ffff00;
        color: #000;
      }

      [data-app="analyzer"] .filter-table-wrap {
        max-height: 200px;
        overflow-y: auto;
        overflow-x: auto;
        border: 1px solid #ddd;
        background: #fff;
        width: 100%;
      }

      [data-app="analyzer"] table {
        width: 100%;
        border-collapse: collapse;
        font-size: 13px;
      }

      [data-app="analyzer"] th {
        background: #eee;
        padding: 8px;
        text-align: left;
        position: sticky;
        top: 0;
      }

      [data-app="analyzer"] td {
        padding: 6px 8px;
        border-bottom: 1px solid #eee;
        word-break: break-word;
      }

      [data-app="analyzer"] .btn-main {
        background: #000;
        color: #fff;
        border: 2px solid #000;
        padding: 18px;
        font-weight: 900;
        font-size: 18px;
        cursor: pointer;
        text-transform: uppercase;
        width: 100%;
        margin-bottom: 40px;
      }

      [data-app="analyzer"] .btn-main:hover {
        background: #ffff00;
        color: #000;
      }

      [data-app="analyzer"] .stats-banner {
        display: flex;
        gap: 20px;
        background: #000;
        color: #fff;
        padding: 15px;
        font-weight: 900;
        font-size: 14px;
        margin-bottom: 20px;
        flex-wrap: wrap;
      }

      [data-app="analyzer"] .grade-info {
        font-size: 12px;
        color: #666;
        margin-bottom: 20px;
      }

      [data-app="analyzer"] .pos-banner {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-bottom: 20px;
        font-size: 12px;
        font-weight: 900;
      }

      [data-app="analyzer"] .pos-pill {
        border: 2px solid #000;
        padding: 6px 8px;
        background: #fff;
      }

      [data-app="analyzer"] .line-container {
        display: flex;
        border-bottom: 1px solid #f0f0f0;
      }

      [data-app="analyzer"] .line-num {
        width: 45px;
        color: #aaa;
        text-align: right;
        padding-right: 12px;
        border-right: 1px solid #eee;
        margin-right: 12px;
        font-family: monospace;
        user-select: none;
        flex: 0 0 auto;
      }

      [data-app="analyzer"] .line-txt {
        flex: 1;
        min-width: 0;
        white-space: pre-wrap;
        padding: 4px 0;
        font-family: ui-monospace, monospace;
        line-height: 1.6;
        overflow-wrap: anywhere;
      }

      [data-app="analyzer"] mark.hl {
        background: #000;
        color: #ffff00;
        padding: 0 2px;
        font-weight: bold;
      }

      [data-app="analyzer"] mark.pos {
        background: #fff;
        color: #000;
        padding: 0 2px;
        border: 2px solid #000;
        font-weight: bold;
      }

      [data-app="analyzer"] mark.pos-adverb {
        border-style: dashed;
      }

      [data-app="analyzer"] mark.pos-verb {
        border-style: solid;
      }

      [data-app="analyzer"] mark.pos-noun {
        border-style: double;
      }

      [data-app="analyzer"] mark.pos-adjective {
        border-style: dotted;
      }

      [data-app="analyzer"] .summary-box {
        background: #000;
        color: #ffff00;
        padding: 15px;
        margin-bottom: 20px;
        font-family: monospace;
        border-left: 10px solid #ffff00;
        overflow-wrap: anywhere;
      }

      @media (max-width: 640px) {
        [data-app="analyzer"] {
          padding: 12px;
        }

        [data-app="analyzer"] #input-text {
          min-height: 360px;
          padding: 14px;
          font-size: 15px;
        }

        [data-app="analyzer"] .switch-grid {
          grid-template-columns: 1fr;
        }

        [data-app="analyzer"] .filter-input-group {
          flex-direction: column;
        }

        [data-app="analyzer"] .filter-input-group input,
        [data-app="analyzer"] .filter-input-group button {
          width: 100%;
        }

        [data-app="analyzer"] .btn-main {
          font-size: 16px;
          padding: 15px;
        }

        [data-app="analyzer"] .stats-banner {
          gap: 10px;
          font-size: 12px;
        }

        [data-app="analyzer"] .line-num {
          width: 36px;
          padding-right: 8px;
          margin-right: 8px;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function escapeHTML(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function getARI(chars, words, sentences) {
    if (words === 0 || sentences === 0) return 0;
    return 4.71 * (chars / words) + 0.5 * (words / sentences) - 21.43;
  }

  function findFilterMatches(line, filters) {
    const matches = [];

    filters.forEach(filter => {
      const cleanFilter = String(filter || "").trim();
      if (!cleanFilter) return;

      const escaped = escapeRegExp(cleanFilter);

      /*
        Boundary handling:
        - prevents "just" matching inside "adjust"
        - allows phrase filters such as "started to"
        - works case-insensitively
      */
      const pattern = new RegExp(`(^|[^\\w'-])(${escaped})(?=$|[^\\w'-])`, "gi");

      let match;
      while ((match = pattern.exec(line)) !== null) {
        const prefixLength = match[1] ? match[1].length : 0;
        const start = match.index + prefixLength;
        const end = start + match[2].length;

        matches.push({
          text: match[2],
          filter: cleanFilter.toLowerCase(),
          start,
          end
        });
      }
    });

    /*
      Prefer longer matches over shorter overlapping matches.
      Example: if filters include both "started" and "started to",
      "started to" wins.
    */
    matches.sort((a, b) => {
      const lengthDiff = (b.end - b.start) - (a.end - a.start);
      if (lengthDiff !== 0) return lengthDiff;
      return a.start - b.start;
    });

    const accepted = [];

    matches.forEach(candidate => {
      const overlaps = accepted.some(existing => {
        return candidate.start < existing.end && candidate.end > existing.start;
      });

      if (!overlaps) accepted.push(candidate);
    });

    accepted.sort((a, b) => a.start - b.start);
    return accepted;
  }

  function classifyPOS(word, prevWord, nextWord) {
    const clean = word.toLowerCase();
    const prev = (prevWord || "").toLowerCase();
    const next = (nextWord || "").toLowerCase();

    if (!clean || clean.length < 2) return null;

    const lyExceptions = new Set([
      "family", "friendly", "lovely", "lonely", "early", "silly",
      "holy", "ugly", "woolly", "jelly", "belly", "likely"
    ]);

    if (clean.endsWith("ly") && !lyExceptions.has(clean)) {
      return "adverb";
    }

    if (
      COMMON_VERBS.has(clean) ||
      clean.endsWith("ing") ||
      clean.endsWith("ed") ||
      (clean.endsWith("en") && clean.length > 4)
    ) {
      return "verb";
    }

    if (
      COMMON_ADJECTIVES.has(clean) ||
      clean.endsWith("ous") ||
      clean.endsWith("ful") ||
      clean.endsWith("less") ||
      clean.endsWith("able") ||
      clean.endsWith("ible") ||
      clean.endsWith("al") ||
      clean.endsWith("ive") ||
      clean.endsWith("ic") ||
      clean.endsWith("ish") ||
      clean.endsWith("ary")
    ) {
      return "adjective";
    }

    if (
      COMMON_NOUNS.has(clean) ||
      clean.endsWith("tion") ||
      clean.endsWith("sion") ||
      clean.endsWith("ment") ||
      clean.endsWith("ness") ||
      clean.endsWith("ity") ||
      clean.endsWith("ship") ||
      clean.endsWith("hood") ||
      clean.endsWith("ance") ||
      clean.endsWith("ence")
    ) {
      return "noun";
    }

    if (DETERMINERS.has(prev)) return "noun";
    if (PREPOSITIONS.has(prev) && !COMMON_VERBS.has(clean)) return "noun";

    if (
      next &&
      !DETERMINERS.has(clean) &&
      !PREPOSITIONS.has(clean) &&
      COMMON_NOUNS.has(next)
    ) {
      return "adjective";
    }

    if (clean.endsWith("s") && clean.length > 3 && !clean.endsWith("ss")) {
      return "noun";
    }

    return null;
  }

  function selectedPOSTypes(switches) {
    const selected = new Set();

    if (switches.posAdverbs) selected.add("adverb");
    if (switches.posVerbs) selected.add("verb");
    if (switches.posNouns) selected.add("noun");
    if (switches.posAdjectives) selected.add("adjective");

    return selected;
  }

  function posLabel(type) {
    if (type === "adverb") return "Adverb";
    if (type === "verb") return "Verb";
    if (type === "noun") return "Noun";
    if (type === "adjective") return "Adjective";
    return "";
  }

  window.SiteApps.register("analyzer", (container) => {
    ensureStyle();

    let saved = null;

    try {
      saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    } catch {
      saved = null;
    }

    let config = saved || {
      text: "",
      filters: [...DEFAULT_FILTERS],
      switches: { ...DEFAULT_SWITCHES }
    };

    config.filters = Array.isArray(config.filters) ? config.filters : [...DEFAULT_FILTERS];
    config.switches = { ...DEFAULT_SWITCHES, ...(config.switches || {}) };

    const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(config));

    container.innerHTML = `
      <div class="section">
        <h2>Drafting Area</h2>
        <div class="frame">
          <textarea id="input-text" placeholder="Paste your text here..."></textarea>
        </div>
      </div>

      <div class="control-stack">
        <div class="panel">
          <h3>Options & Switches</h3>

          <div class="switch-grid">
            <label class="switch-item">
              <input type="checkbox" id="sw-summary"> Show Issues Summary
            </label>
            <label class="switch-item">
              <input type="checkbox" id="sw-filterWords"> Check Filter Words
            </label>
            <label class="switch-item">
              <input type="checkbox" id="sw-repeats"> Check Repetitions
            </label>
            <label class="switch-item">
              <input type="checkbox" id="sw-sentenceLen"> Check Sentence Length
            </label>
          </div>

          <h3 style="margin-top:18px;">Parts of Speech</h3>

          <div class="switch-grid">
            <label class="switch-item">
              <input type="checkbox" id="sw-posAdverbs"> Highlight Adverbs
            </label>
            <label class="switch-item">
              <input type="checkbox" id="sw-posVerbs"> Highlight Verbs
            </label>
            <label class="switch-item">
              <input type="checkbox" id="sw-posNouns"> Highlight Nouns
            </label>
            <label class="switch-item">
              <input type="checkbox" id="sw-posAdjectives"> Highlight Adjectives
            </label>
          </div>

          <p style="font-size:10px; margin-top:10px; opacity:0.7">
            Sentence Check flags &gt;30 words as Long or &lt;5 words as Choppy.
            Parts of speech are estimated using lightweight rules.
          </p>
        </div>

        <div class="panel">
          <h3>Filter Management</h3>
          <div class="filter-input-group">
            <input type="text" id="new-filter" placeholder="Add word or phrase...">
            <button class="btn-small" id="add-filter">Add</button>
            <button class="btn-small" id="reset-filters">Reset Defaults</button>
          </div>
          <div class="filter-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Word / Phrase</th>
                  <th style="width:40px"></th>
                </tr>
              </thead>
              <tbody id="filter-body"></tbody>
            </table>
          </div>
        </div>
      </div>

      <button class="btn-main" id="refresh-btn">Analyze & Save</button>

      <div id="results" style="display:none;">
        <div class="stats-banner" id="stats-banner"></div>
        <div class="grade-info" id="grade-info"></div>
        <div class="pos-banner" id="pos-banner"></div>
        <div id="summary-view"></div>
        <div class="frame">
          <div id="annotated-view"></div>
        </div>
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
      posBanner: container.querySelector("#pos-banner"),
      summary: container.querySelector("#summary-view"),
      annotated: container.querySelector("#annotated-view"),

      swSummary: container.querySelector("#sw-summary"),
      swFilters: container.querySelector("#sw-filterWords"),
      swRepeats: container.querySelector("#sw-repeats"),
      swSent: container.querySelector("#sw-sentenceLen"),

      swPosAdverbs: container.querySelector("#sw-posAdverbs"),
      swPosVerbs: container.querySelector("#sw-posVerbs"),
      swPosNouns: container.querySelector("#sw-posNouns"),
      swPosAdjectives: container.querySelector("#sw-posAdjectives")
    };

    const renderFilters = () => {
      els.filterBody.innerHTML = [...config.filters].sort().map(f => `
        <tr>
          <td>${escapeHTML(f)}</td>
          <td><button class="btn-small btn-del" data-word="${escapeHTML(f)}">×</button></td>
        </tr>
      `).join("");
    };

    els.input.value = config.text || "";

    els.swSummary.checked = config.switches.summary;
    els.swFilters.checked = config.switches.filterWords;
    els.swRepeats.checked = config.switches.repeats;
    els.swSent.checked = config.switches.sentenceLen;

    els.swPosAdverbs.checked = config.switches.posAdverbs;
    els.swPosVerbs.checked = config.switches.posVerbs;
    els.swPosNouns.checked = config.switches.posNouns;
    els.swPosAdjectives.checked = config.switches.posAdjectives;

    renderFilters();

    els.addBtn.onclick = () => {
      const val = els.newFilter.value.trim().toLowerCase();

      if (val && !config.filters.includes(val)) {
        config.filters.push(val);
        els.newFilter.value = "";
        renderFilters();
        save();
      }
    };

    els.newFilter.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        els.addBtn.click();
      }
    });

    els.filterBody.onclick = (e) => {
      if (e.target.classList.contains("btn-del")) {
        const word = e.target.dataset.word;
        config.filters = config.filters.filter(f => f !== word);
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
        sentenceLen: els.swSent.checked,
        posAdverbs: els.swPosAdverbs.checked,
        posVerbs: els.swPosVerbs.checked,
        posNouns: els.swPosNouns.checked,
        posAdjectives: els.swPosAdjectives.checked
      };

      save();

      const lines = text.split("\n");
      const issues = [];
      const filterList = config.filters
        .map(f => String(f || "").trim().toLowerCase())
        .filter(Boolean);

      const lastSeen = new Map();

      const posCounts = {
        adverb: 0,
        verb: 0,
        noun: 0,
        adjective: 0
      };

      let wordTotal = 0;
      let charTotal = 0;

      const selectedPOS = selectedPOSTypes(config.switches);
      const filterMatchesByLine = new Map();

      lines.forEach((line, lIdx) => {
        const lineNumber = lIdx + 1;
        const words = line.match(/\b[\w'-]+\b/g) || [];
        const lowerWords = words.map(w => w.toLowerCase());
        const sentences = line.split(/[.!?]+/).filter(s => s.trim().length > 0);

        if (config.switches.filterWords) {
          const filterMatches = findFilterMatches(line, filterList);

          if (filterMatches.length) {
            filterMatchesByLine.set(lineNumber, filterMatches);

            filterMatches.forEach(match => {
              issues.push({
                line: lineNumber,
                type: "Filter",
                word: match.text,
                start: match.start,
                end: match.end
              });
            });
          }
        }

        if (config.switches.sentenceLen) {
          sentences.forEach(s => {
            const sWords = s.match(/\b[\w'-]+\b/g) || [];

            if (sWords.length > 30) {
              issues.push({
                line: lineNumber,
                type: "Long Sentence",
                word: `(${sWords.length} words)`
              });
            }

            if (sWords.length > 0 && sWords.length < 5) {
              issues.push({
                line: lineNumber,
                type: "Choppy",
                word: `(${sWords.length} words)`
              });
            }
          });
        }

        words.forEach((word, wIdx) => {
          const clean = word.toLowerCase();
          const prev = lowerWords[wIdx - 1] || "";
          const next = lowerWords[wIdx + 1] || "";

          wordTotal++;
          charTotal += clean.length;

          if (config.switches.repeats && clean.length > 3) {
            if (lastSeen.has(clean)) {
              if (wordTotal - lastSeen.get(clean) <= 15) {
                issues.push({ line: lineNumber, type: "Repeat", word });
              }
            }

            lastSeen.set(clean, wordTotal);
          }

          const pos = classifyPOS(word, prev, next);
          if (pos && posCounts[pos] !== undefined) {
            posCounts[pos]++;
          }
        });
      });

      const sentenceCount = text.split(/[.!?]+/).filter(Boolean).length || 1;
      const ari = Math.round(getARI(charTotal, wordTotal, sentenceCount));

      els.results.style.display = "block";

      els.stats.innerHTML = `
        <span>WORDS: ${wordTotal}</span>
        <span>READ TIME: ~${Math.ceil(wordTotal / 225)}M</span>
        <span>SPOKEN: ~${Math.ceil(wordTotal / 140)}M</span>
        <span>ARI GRADE: ${ari}</span>
      `;

      els.grade.innerHTML = `
        The complexity level is comparable to <strong>Grade ${ari}</strong>.
        Formula: 4.71 × (chars ÷ words) + 0.5 × (words ÷ sentences) - 21.43
      `;

      const anyPOS = selectedPOS.size > 0;

      els.posBanner.innerHTML = anyPOS ? `
        <span class="pos-pill">Adverbs: ${posCounts.adverb}</span>
        <span class="pos-pill">Verbs: ${posCounts.verb}</span>
        <span class="pos-pill">Nouns: ${posCounts.noun}</span>
        <span class="pos-pill">Adjectives: ${posCounts.adjective}</span>
        <span class="pos-pill">Legend: dashed = adverb, solid = verb, double = noun, dotted = adjective</span>
      ` : "";

      els.summary.innerHTML = (config.switches.summary && issues.length) ? `
        <div class="summary-box">
          <strong>CRITICAL ISSUES (${issues.length}):</strong><br>
          ${issues.map(i => `L${i.line} [${escapeHTML(i.type)}] ${escapeHTML(i.word)}`).join("<br>")}
        </div>
      ` : "";

      const isInsideFilterMatch = (lineNumber, start, end) => {
        const matches = filterMatchesByLine.get(lineNumber) || [];
        return matches.some(match => start >= match.start && end <= match.end);
      };

      els.annotated.innerHTML = lines.map((line, idx) => {
        const lineNumber = idx + 1;
        const wordsForContext = line.match(/\b[\w'-]+\b/g) || [];
        let contextIndex = 0;
        let output = "";
        let lastIndex = 0;

        const tokenPattern = /\b[\w'-]+\b/g;
        let match;

        while ((match = tokenPattern.exec(line)) !== null) {
          const part = match[0];
          const start = match.index;
          const end = start + part.length;

          output += escapeHTML(line.slice(lastIndex, start));

          const prev = wordsForContext[contextIndex - 1] || "";
          const next = wordsForContext[contextIndex + 1] || "";
          const pos = classifyPOS(part, prev, next);

          contextIndex++;

          if (isInsideFilterMatch(lineNumber, start, end)) {
            output += `<mark class="hl">${escapeHTML(part)}</mark>`;
          } else if (pos && selectedPOS.has(pos)) {
            output += `<mark class="pos pos-${pos}" title="${posLabel(pos)}">${escapeHTML(part)}</mark>`;
          } else {
            output += escapeHTML(part);
          }

          lastIndex = end;
        }

        output += escapeHTML(line.slice(lastIndex));

        return `
          <div class="line-container">
            <div class="line-num">${lineNumber}</div>
            <div class="line-txt">${output}</div>
          </div>
        `;
      }).join("");

      els.results.scrollIntoView({ behavior: "smooth" });
    };

    if (config.text) els.refresh.click();
  });
})();
