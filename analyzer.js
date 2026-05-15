(() => {
  "use strict";

  window.SiteApps = window.SiteApps || {};
  window.SiteApps.registry = window.SiteApps.registry || {};
  window.SiteApps.register = window.SiteApps.register || function (name, initFn) {
    window.SiteApps.registry[name] = initFn;
  };

  const STYLE_ID = "siteapps-analyzer-v11-tense-parser";
  const STORAGE_KEY = "siteapps:analyzer:v11:config";

  const DEFAULT_FILTERS = [
    "just", "very", "really", "felt", "feel", "think", "thought",
    "actually", "suddenly", "started to", "began to", "seemed", "looked"
  ];

  const DEFAULT_SWITCHES = {
    summary: true,
    sentenceLen: true,
    repeats: true,
    filterWords: true,
    tenseCheck: true,
    rememberText: false,
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

  const LY_EXCEPTIONS = new Set([
    "family", "friendly", "lovely", "lonely", "early", "silly",
    "holy", "ugly", "woolly", "jelly", "belly", "likely"
  ]);

  const PAST_VERBS = new Set([
    "was", "were", "had", "did",
    "said", "went", "made", "took", "saw", "felt", "thought",
    "knew", "came", "gave", "got", "found", "told", "asked",
    "wanted", "needed", "tried", "turned", "moved", "stood",
    "sat", "walked", "ran", "held", "kept", "left", "heard",
    "watched", "pulled", "pushed", "opened", "closed", "killed",
    "lived", "died", "became", "began", "broke", "brought",
    "built", "caught", "chose", "cut", "drew", "drove", "fell",
    "fought", "grew", "hid", "lost", "met", "paid", "put",
    "read", "rose", "sent", "slept", "spoke", "struck", "swore",
    "threw", "wore", "won", "wrote"
  ]);

  const PRESENT_AUX = new Set([
    "am", "are", "is", "do", "does", "have", "has"
  ]);

  const PAST_AUX = new Set([
    "was", "were", "did", "had"
  ]);

  const FUTURE_MARKERS = new Set([
    "will", "shall", "won't", "shan't"
  ]);

  const MODAL_MARKERS = new Set([
    "would", "could", "should", "might", "may", "must", "can"
  ]);

  const PERFECT_PARTICIPLES = new Set([
    "been", "gone", "seen", "known", "given", "taken", "made",
    "found", "told", "left", "heard", "held", "kept", "felt",
    "thought", "said", "done", "come", "become", "written",
    "spoken", "broken", "chosen", "fallen", "forgotten", "hidden",
    "lost", "met", "sent", "slept", "worn", "won"
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

      [data-app="analyzer"] mark.hl-phrase {
        background: #000;
        color: #ffff00;
        padding: 0 2px;
        font-weight: bold;
        box-shadow: inset 0 -3px 0 #ffff00;
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

      [data-app="analyzer"] mark.tense {
        background: #ffff00;
        color: #000;
        padding: 0 2px;
        border: 3px solid #000;
        font-weight: bold;
      }

      [data-app="analyzer"] mark.tense-past {
        box-shadow: inset 0 -4px 0 #000;
      }

      [data-app="analyzer"] mark.tense-future {
        outline: 3px dashed #000;
        outline-offset: 1px;
      }

      [data-app="analyzer"] mark.tense-modal,
      [data-app="analyzer"] mark.tense-perfect,
      [data-app="analyzer"] mark.tense-unknown {
        outline: 2px dotted #000;
        outline-offset: 1px;
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

  function getARI(chars, words, sentences) {
    if (words === 0 || sentences === 0) return 0;
    return 4.71 * (chars / words) + 0.5 * (words / sentences) - 21.43;
  }

  function isWordText(value) {
    return /^[A-Za-z0-9_’'-]+$/.test(value);
  }

  function normalizeWord(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[’]/g, "'");
  }

  function tokenizeLine(line, lineNumber) {
    const tokens = [];
    const tokenPattern = /[A-Za-z0-9_]+(?:[’'][A-Za-z0-9_]+)?(?:-[A-Za-z0-9_]+)*|[^\sA-Za-z0-9_]/g;
    let match;

    while ((match = tokenPattern.exec(line)) !== null) {
      const text = match[0];
      const start = match.index;
      const end = start + text.length;
      const kind = isWordText(text) ? "word" : "punct";

      tokens.push({
        text,
        clean: kind === "word" ? normalizeWord(text) : text,
        kind,
        line: lineNumber,
        lineText: line,
        start,
        end
      });
    }

    return tokens;
  }

  function splitSentences(tokens) {
    const sentences = [];
    let current = [];

    tokens.forEach(token => {
      current.push(token);

      if (token.kind === "punct" && /[.!?]/.test(token.text)) {
        const words = current.filter(t => t.kind === "word");

        if (words.length) {
          sentences.push({
            tokens: current,
            wordCount: words.length,
            start: current[0].start,
            end: current[current.length - 1].end
          });
        }

        current = [];
      }
    });

    const trailingWords = current.filter(t => t.kind === "word");

    if (trailingWords.length) {
      sentences.push({
        tokens: current,
        wordCount: trailingWords.length,
        start: current[0].start,
        end: current[current.length - 1].end
      });
    }

    return sentences;
  }

  function parseProse(text) {
    const lines = text.split("\n");

    return lines.map((lineText, index) => {
      const lineNumber = index + 1;
      const tokens = tokenizeLine(lineText, lineNumber);
      const wordTokens = tokens.filter(t => t.kind === "word");
      const sentences = splitSentences(tokens);

      return {
        lineNumber,
        text: lineText,
        tokens,
        wordTokens,
        sentences
      };
    });
  }

  function compileFilter(filter) {
    const raw = String(filter || "").trim();
    const normalized = normalizeWord(raw);

    if (!normalized) return null;

    const parts = normalized
      .split(/\s+/)
      .map(part => part.trim())
      .filter(Boolean);

    if (!parts.length) return null;

    return {
      raw,
      normalized,
      parts,
      length: parts.length
    };
  }

  function findFilterMatchesInLine(lineModel, compiledFilters) {
    const matches = [];
    const words = lineModel.wordTokens;

    if (!words.length) return matches;

    compiledFilters.forEach(filter => {
      if (!filter || !filter.parts.length) return;

      for (let i = 0; i <= words.length - filter.parts.length; i++) {
        let ok = true;

        for (let j = 0; j < filter.parts.length; j++) {
          if (words[i + j].clean !== filter.parts[j]) {
            ok = false;
            break;
          }
        }

        if (!ok) continue;

        const first = words[i];
        const last = words[i + filter.parts.length - 1];

        matches.push({
          line: lineModel.lineNumber,
          type: "Filter",
          word: lineModel.text.slice(first.start, last.end),
          filter: filter.raw,
          start: first.start,
          end: last.end,
          tokenStart: i,
          tokenEnd: i + filter.parts.length,
          length: last.end - first.start,
          partCount: filter.parts.length
        });
      }
    });

    matches.sort((a, b) => {
      if (b.partCount !== a.partCount) return b.partCount - a.partCount;
      if (b.length !== a.length) return b.length - a.length;
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
    const clean = normalizeWord(word);
    const prev = normalizeWord(prevWord);
    const next = normalizeWord(nextWord);

    if (!clean || clean.length < 2) return null;

    if (clean.endsWith("ly") && !LY_EXCEPTIONS.has(clean)) {
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

  function looksPastParticiple(clean) {
    if (!clean) return false;
    if (PERFECT_PARTICIPLES.has(clean)) return true;
    if (clean.endsWith("ed") && clean.length > 3) return true;
    if (clean.endsWith("en") && clean.length > 4) return true;
    return false;
  }

  function looksPastSimple(clean) {
    if (!clean) return false;
    if (PAST_VERBS.has(clean)) return true;
    if (clean.endsWith("ed") && clean.length > 3) return true;
    return false;
  }

  function classifySentenceTense(sentence) {
    const words = sentence.tokens
      .filter(t => t.kind === "word")
      .map(t => ({
        text: t.text,
        clean: normalizeWord(t.text),
        start: t.start,
        end: t.end
      }));

    if (!words.length) {
      return {
        tense: "unknown",
        label: "Unknown",
        reason: "No words found",
        severity: 0
      };
    }

    let hasPresent = false;
    let hasPast = false;
    let hasFuture = false;
    let hasModal = false;
    let hasPerfect = false;
    let hasProgressive = false;

    const evidence = [];

    for (let i = 0; i < words.length; i++) {
      const clean = words[i].clean;
      const next = words[i + 1] ? words[i + 1].clean : "";
      const prev = words[i - 1] ? words[i - 1].clean : "";

      if (FUTURE_MARKERS.has(clean)) {
        hasFuture = true;
        evidence.push(words[i].text);
      }

      if (MODAL_MARKERS.has(clean)) {
        hasModal = true;
        evidence.push(words[i].text);
      }

      if (PAST_AUX.has(clean)) {
        hasPast = true;
        evidence.push(words[i].text);
      }

      if (PRESENT_AUX.has(clean)) {
        hasPresent = true;
      }

      if ((clean === "has" || clean === "have" || clean === "had") && looksPastParticiple(next)) {
        hasPerfect = true;
        if (words[i + 1]) evidence.push(`${words[i].text} ${words[i + 1].text}`);
      }

      if ((clean === "is" || clean === "are" || clean === "am") && next.endsWith("ing")) {
        hasPresent = true;
        hasProgressive = true;
      }

      if ((clean === "was" || clean === "were") && next.endsWith("ing")) {
        hasPast = true;
        hasProgressive = true;
        if (words[i + 1]) evidence.push(`${words[i].text} ${words[i + 1].text}`);
      }

      if (looksPastSimple(clean)) {
        const followsPresentPerfect =
          (prev === "has" || prev === "have") && looksPastParticiple(clean);

        if (!followsPresentPerfect) {
          hasPast = true;
          evidence.push(words[i].text);
        }
      }

      if (
        COMMON_VERBS.has(clean) &&
        !PAST_VERBS.has(clean) &&
        !PAST_AUX.has(clean) &&
        !FUTURE_MARKERS.has(clean) &&
        !MODAL_MARKERS.has(clean)
      ) {
        hasPresent = true;
      }

      if (
        clean.endsWith("s") &&
        clean.length > 3 &&
        !clean.endsWith("ss") &&
        !COMMON_NOUNS.has(clean)
      ) {
        hasPresent = true;
      }
    }

    if (hasFuture) {
      return {
        tense: "future",
        label: "Future / Non-present",
        reason: `Future marker: ${evidence.slice(0, 3).join(", ")}`,
        severity: 3
      };
    }

    if (hasPast) {
      return {
        tense: "past",
        label: "Past / Non-present",
        reason: `Past-tense evidence: ${evidence.slice(0, 3).join(", ")}`,
        severity: 3
      };
    }

    if (hasModal) {
      return {
        tense: "modal",
        label: "Modal / Conditional",
        reason: `Modal marker: ${evidence.slice(0, 3).join(", ")}`,
        severity: 2
      };
    }

    if (hasPerfect) {
      return {
        tense: "perfect",
        label: "Perfect aspect",
        reason: `Perfect construction: ${evidence.slice(0, 3).join(", ")}`,
        severity: 2
      };
    }

    if (hasPresent || hasProgressive) {
      return {
        tense: "present",
        label: "Present",
        reason: "Likely present tense",
        severity: 0
      };
    }

    return {
      tense: "unknown",
      label: "Unclear tense",
      reason: "No clear finite verb detected",
      severity: 1
    };
  }

  function buildTenseSpans(tenseMatches) {
    return tenseMatches.map(match => ({
      start: match.start,
      end: match.end,
      priority: 80,
      className: `tense tense-${match.tense}`,
      title: `${match.label}: ${match.reason}`
    }));
  }

  function buildHighlightSpans(lineModel, filterMatches, selectedPOS) {
    const spans = [];

    filterMatches.forEach(match => {
      spans.push({
        start: match.start,
        end: match.end,
        priority: 100,
        className: match.partCount > 1 ? "hl hl-phrase" : "hl",
        title: `Filter: ${match.filter || match.word}`
      });
    });

    const words = lineModel.wordTokens;

    words.forEach((token, index) => {
      const prev = words[index - 1] ? words[index - 1].text : "";
      const next = words[index + 1] ? words[index + 1].text : "";
      const pos = classifyPOS(token.text, prev, next);

      if (pos && selectedPOS.has(pos)) {
        spans.push({
          start: token.start,
          end: token.end,
          priority: 20,
          className: `pos pos-${pos}`,
          title: posLabel(pos)
        });
      }
    });

    return spans;
  }

  function acceptNonOverlappingSpans(spans) {
    spans.sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      if ((b.end - b.start) !== (a.end - a.start)) {
        return (b.end - b.start) - (a.end - a.start);
      }
      return a.start - b.start;
    });

    const accepted = [];

    spans.forEach(candidate => {
      const overlaps = accepted.some(existing => {
        return candidate.start < existing.end && candidate.end > existing.start;
      });

      if (!overlaps) accepted.push(candidate);
    });

    accepted.sort((a, b) => a.start - b.start);
    return accepted;
  }

  function renderLineWithSpans(lineText, spans) {
    if (!spans.length) return escapeHTML(lineText);

    let output = "";
    let pos = 0;

    spans.forEach(span => {
      if (span.start > pos) {
        output += escapeHTML(lineText.slice(pos, span.start));
      }

      const marked = lineText.slice(span.start, span.end);
      output += `<mark class="${span.className}" title="${escapeHTML(span.title)}">${escapeHTML(marked)}</mark>`;

      pos = span.end;
    });

    if (pos < lineText.length) {
      output += escapeHTML(lineText.slice(pos));
    }

    return output;
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

    const save = () => {
      const toSave = {
        filters: config.filters,
        switches: config.switches,
        text: config.switches.rememberText ? config.text : ""
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    };

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
              <input type="checkbox" id="sw-tenseCheck"> Flag Non-Present Tense
            </label>
            <label class="switch-item">
              <input type="checkbox" id="sw-repeats"> Check Repetitions
            </label>
            <label class="switch-item">
              <input type="checkbox" id="sw-sentenceLen"> Check Sentence Length
            </label>
            <label class="switch-item">
              <input type="checkbox" id="sw-rememberText"> Remember Text On This Device
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
            Tense detection flags likely past, future, perfect, modal, or unclear sentences.
            Parts of speech are estimated using lightweight rules. Filter phrases are matched using the hybrid span parser.
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
      swTense: container.querySelector("#sw-tenseCheck"),
      swRepeats: container.querySelector("#sw-repeats"),
      swSent: container.querySelector("#sw-sentenceLen"),
      swRememberText: container.querySelector("#sw-rememberText"),

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

    els.input.value = config.switches.rememberText ? (config.text || "") : "";

    els.swSummary.checked = config.switches.summary;
    els.swFilters.checked = config.switches.filterWords;
    els.swTense.checked = config.switches.tenseCheck;
    els.swRepeats.checked = config.switches.repeats;
    els.swSent.checked = config.switches.sentenceLen;
    els.swRememberText.checked = config.switches.rememberText;

    els.swPosAdverbs.checked = config.switches.posAdverbs;
    els.swPosVerbs.checked = config.switches.posVerbs;
    els.swPosNouns.checked = config.switches.posNouns;
    els.swPosAdjectives.checked = config.switches.posAdjectives;

    renderFilters();

    els.addBtn.onclick = () => {
      const val = normalizeWord(els.newFilter.value.trim());

      if (val && !config.filters.map(normalizeWord).includes(val)) {
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
        tenseCheck: els.swTense.checked,
        repeats: els.swRepeats.checked,
        sentenceLen: els.swSent.checked,
        rememberText: els.swRememberText.checked,
        posAdverbs: els.swPosAdverbs.checked,
        posVerbs: els.swPosVerbs.checked,
        posNouns: els.swPosNouns.checked,
        posAdjectives: els.swPosAdjectives.checked
      };

      save();

      const prose = parseProse(text);
      const compiledFilters = config.filters.map(compileFilter).filter(Boolean);
      const selectedPOS = selectedPOSTypes(config.switches);

      const issues = [];
      const filterMatchesByLine = new Map();
      const tenseMatchesByLine = new Map();
      const lastSeen = new Map();

      const tenseCounts = {
        present: 0,
        past: 0,
        future: 0,
        modal: 0,
        perfect: 0,
        unknown: 0
      };

      const posCounts = {
        adverb: 0,
        verb: 0,
        noun: 0,
        adjective: 0
      };

      let wordTotal = 0;
      let charTotal = 0;
      let sentenceTotal = 0;

      prose.forEach(lineModel => {
        const lineNumber = lineModel.lineNumber;

        if (config.switches.filterWords) {
          const matches = findFilterMatchesInLine(lineModel, compiledFilters);

          if (matches.length) {
            filterMatchesByLine.set(lineNumber, matches);

            matches.forEach(match => {
              issues.push({
                line: lineNumber,
                type: "Filter",
                word: match.word,
                start: match.start,
                end: match.end
              });
            });
          }
        }

        lineModel.sentences.forEach(sentence => {
          sentenceTotal++;

          const tense = classifySentenceTense(sentence);

          if (tenseCounts[tense.tense] !== undefined) {
            tenseCounts[tense.tense]++;
          }

          if (config.switches.tenseCheck && tense.tense !== "present") {
            const match = {
              line: lineNumber,
              type: "Tense",
              word: tense.label,
              start: sentence.start,
              end: sentence.end,
              tense: tense.tense,
              label: tense.label,
              reason: tense.reason
            };

            if (!tenseMatchesByLine.has(lineNumber)) {
              tenseMatchesByLine.set(lineNumber, []);
            }

            tenseMatchesByLine.get(lineNumber).push(match);

            issues.push({
              line: lineNumber,
              type: tense.label,
              word: tense.reason
            });
          }

          if (config.switches.sentenceLen) {
            if (sentence.wordCount > 30) {
              issues.push({
                line: lineNumber,
                type: "Long Sentence",
                word: `(${sentence.wordCount} words)`
              });
            }

            if (sentence.wordCount > 0 && sentence.wordCount < 5) {
              issues.push({
                line: lineNumber,
                type: "Choppy",
                word: `(${sentence.wordCount} words)`
              });
            }
          }
        });

        lineModel.wordTokens.forEach((token, index) => {
          const clean = token.clean;
          const prev = lineModel.wordTokens[index - 1] ? lineModel.wordTokens[index - 1].text : "";
          const next = lineModel.wordTokens[index + 1] ? lineModel.wordTokens[index + 1].text : "";

          wordTotal++;
          charTotal += clean.length;

          if (config.switches.repeats && clean.length > 3) {
            if (lastSeen.has(clean)) {
              if (wordTotal - lastSeen.get(clean) <= 15) {
                issues.push({
                  line: lineNumber,
                  type: "Repeat",
                  word: token.text
                });
              }
            }

            lastSeen.set(clean, wordTotal);
          }

          const pos = classifyPOS(token.text, prev, next);

          if (pos && posCounts[pos] !== undefined) {
            posCounts[pos]++;
          }
        });
      });

      if (sentenceTotal < 1) sentenceTotal = 1;

      const ari = Math.round(getARI(charTotal, wordTotal, sentenceTotal));
      const nonPresentTotal = tenseCounts.past + tenseCounts.future + tenseCounts.modal + tenseCounts.perfect + tenseCounts.unknown;

      els.results.style.display = "block";

      els.stats.innerHTML = `
        <span>WORDS: ${wordTotal}</span>
        <span>SENTENCES: ${sentenceTotal}</span>
        <span>NON-PRESENT: ${nonPresentTotal}</span>
        <span>READ TIME: ~${Math.ceil(wordTotal / 225)}M</span>
        <span>SPOKEN: ~${Math.ceil(wordTotal / 140)}M</span>
        <span>ARI GRADE: ${ari}</span>
      `;

      els.grade.innerHTML = `
        The complexity level is comparable to <strong>Grade ${ari}</strong>.
        Formula: 4.71 × (chars ÷ words) + 0.5 × (words ÷ sentences) - 21.43
      `;

      const anyPOS = selectedPOS.size > 0;

      const tenseBanner = config.switches.tenseCheck ? `
        <span class="pos-pill">Present: ${tenseCounts.present}</span>
        <span class="pos-pill">Past: ${tenseCounts.past}</span>
        <span class="pos-pill">Future: ${tenseCounts.future}</span>
        <span class="pos-pill">Modal: ${tenseCounts.modal}</span>
        <span class="pos-pill">Perfect / Unclear: ${tenseCounts.perfect + tenseCounts.unknown}</span>
        <span class="pos-pill">Tense legend: heavy yellow mark = probably not present tense</span>
      ` : "";

      const posBanner = anyPOS ? `
        <span class="pos-pill">Adverbs: ${posCounts.adverb}</span>
        <span class="pos-pill">Verbs: ${posCounts.verb}</span>
        <span class="pos-pill">Nouns: ${posCounts.noun}</span>
        <span class="pos-pill">Adjectives: ${posCounts.adjective}</span>
        <span class="pos-pill">POS legend: dashed = adverb, solid = verb, double = noun, dotted = adjective</span>
      ` : "";

      els.posBanner.innerHTML = `${tenseBanner}${posBanner}`;

      els.summary.innerHTML = (config.switches.summary && issues.length) ? `
        <div class="summary-box">
          <strong>CRITICAL ISSUES (${issues.length}):</strong><br>
          ${issues.map(i => `L${i.line} [${escapeHTML(i.type)}] ${escapeHTML(i.word)}`).join("<br>")}
        </div>
      ` : "";

      els.annotated.innerHTML = prose.map(lineModel => {
        const filterMatches = filterMatchesByLine.get(lineModel.lineNumber) || [];
        const tenseMatches = tenseMatchesByL
