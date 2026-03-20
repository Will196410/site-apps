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

  const STYLE_ID = "siteapps-mdpreview-style-v1";

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
/* Markdown Live Preview — high contrast + iPad friendly */
[data-app="mdpreview"]{
  font-family:-apple-system,system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;
  background:#fff;
  border:2px solid #111;
  padding:18px;
  border-radius:14px;
  color:#111;
  max-width:1180px;
  margin:14px auto;
}

[data-app="mdpreview"] .top-row{
  display:flex;
  align-items:baseline;
  justify-content:space-between;
  gap:10px;
  flex-wrap:wrap;
  margin-bottom:10px;
}

[data-app="mdpreview"] h3{
  margin:0;
  font-size:20px;
  font-weight:900;
}

[data-app="mdpreview"] .status-row{
  display:flex;
  gap:10px;
  align-items:center;
  flex-wrap:wrap;
  justify-content:flex-end;
}

[data-app="mdpreview"] .badge{
  font-size:14px;
  font-weight:900;
  padding:6px 10px;
  border:2px solid #111;
  border-radius:999px;
  background:#fff;
}

[data-app="mdpreview"] .badge.good{ border-color:#0b3d0b; color:#0b3d0b; }
[data-app="mdpreview"] .badge.warn{ border-color:#7a0000; color:#7a0000; }
[data-app="mdpreview"] .badge.dim{ border-color:#444; color:#444; }

[data-app="mdpreview"] label{
  display:block;
  margin:10px 0 6px;
  font-weight:900;
  font-size:14px;
}

[data-app="mdpreview"] input[type="text"]{
  width:100%;
  padding:12px;
  border:2px solid #111;
  border-radius:10px;
  font-size:15px;
  line-height:1.35;
  box-sizing:border-box;
}

[data-app="mdpreview"] input[type="text"]:focus,
[data-app="mdpreview"] textarea:focus{
  outline:none;
  box-shadow:0 0 0 3px rgba(11,95,255,0.25);
}

[data-app="mdpreview"] .workspace{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:14px;
  margin-top:12px;
}

[data-app="mdpreview"] .pane{
  min-width:0;
}

[data-app="mdpreview"] .pane-head{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:10px;
  flex-wrap:wrap;
}

[data-app="mdpreview"] .hint{
  font-size:12px;
  color:#444;
  font-weight:700;
}

[data-app="mdpreview"] textarea{
  width:100%;
  min-height:460px;
  padding:12px;
  border:2px solid #111;
  border-radius:10px;
  font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace;
  font-size:15px;
  line-height:1.45;
  resize:vertical;
  box-sizing:border-box;
}

[data-app="mdpreview"] .preview{
  min-height:460px;
  padding:14px;
  border:2px solid #111;
  border-radius:10px;
  background:#fff;
  overflow:auto;
  line-height:1.6;
  word-break:break-word;
}

[data-app="mdpreview"] .preview-empty{
  color:#666;
  font-style:italic;
}

[data-app="mdpreview"] .preview h1,
[data-app="mdpreview"] .preview h2,
[data-app="mdpreview"] .preview h3,
[data-app="mdpreview"] .preview h4,
[data-app="mdpreview"] .preview h5,
[data-app="mdpreview"] .preview h6{
  margin:1.1em 0 .45em;
  line-height:1.25;
}

[data-app="mdpreview"] .preview h1{ font-size:2em; }
[data-app="mdpreview"] .preview h2{ font-size:1.6em; }
[data-app="mdpreview"] .preview h3{ font-size:1.3em; }
[data-app="mdpreview"] .preview h4{ font-size:1.1em; }

[data-app="mdpreview"] .preview p{
  margin:.8em 0;
}

[data-app="mdpreview"] .preview ul,
[data-app="mdpreview"] .preview ol{
  margin:.8em 0 .8em 1.4em;
  padding:0;
}

[data-app="mdpreview"] .preview blockquote{
  margin:1em 0;
  padding:.1em 1em;
  border-left:4px solid #111;
  background:#f7f7f7;
}

[data-app="mdpreview"] .preview pre{
  margin:1em 0;
  padding:12px;
  border:2px solid #111;
  border-radius:10px;
  background:#f7f7f7;
  overflow:auto;
}

[data-app="mdpreview"] .preview code{
  font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace;
  font-size:.95em;
}

[data-app="mdpreview"] .preview :not(pre) > code{
  padding:.12em .35em;
  border:1px solid #111;
  border-radius:6px;
  background:#f7f7f7;
}

[data-app="mdpreview"] .preview hr{
  border:none;
  border-top:2px solid #111;
  margin:1.2em 0;
}

[data-app="mdpreview"] .preview a{
  color:#0b5fff;
  text-decoration:underline;
}

[data-app="mdpreview"] .preview img{
  display:block;
  max-width:100%;
  height:auto;
  margin:1em 0;
  border-radius:8px;
}

[data-app="mdpreview"] .preview table{
  width:100%;
  border-collapse:collapse;
  margin:1em 0;
  font-size:14px;
}

[data-app="mdpreview"] .preview th,
[data-app="mdpreview"] .preview td{
  border:2px solid #111;
  padding:8px 10px;
  text-align:left;
  vertical-align:top;
}

[data-app="mdpreview"] .preview thead th{
  background:#f3f3f3;
}

[data-app="mdpreview"] .controls,
[data-app="mdpreview"] .actions{
  display:flex;
  flex-wrap:wrap;
  gap:10px;
  margin-top:12px;
  align-items:center;
}

[data-app="mdpreview"] .controls button,
[data-app="mdpreview"] .actions button{
  border:2px solid #111;
  border-radius:10px;
  cursor:pointer;
  padding:10px 12px;
  font-weight:900;
  font-size:14px;
  background:#fff;
  color:#111;
}

[data-app="mdpreview"] .btn-primary{
  background:#0b5fff;
  border-color:#0b5fff;
  color:#fff;
}

[data-app="mdpreview"] .btn-save{
  background:#0b7a2b;
  border-color:#0b7a2b;
  color:#fff;
}

[data-app="mdpreview"] .btn-copy{
  background:#111;
  border-color:#111;
  color:#fff;
}

[data-app="mdpreview"] .btn-clear{
  background:#fff;
  border-color:#7a0000;
  color:#7a0000;
}

[data-app="mdpreview"] .feedback{
  display:inline-flex;
  align-items:center;
  min-height:22px;
  font-size:14px;
  font-weight:900;
  color:#0b7a2b;
}

@media (max-width:900px){
  [data-app="mdpreview"] .workspace{
    grid-template-columns:1fr;
  }
}

@media (max-width:700px){
  [data-app="mdpreview"] .controls,
  [data-app="mdpreview"] .actions{
    flex-direction:column;
    align-items:stretch;
  }

  [data-app="mdpreview"] .controls button,
  [data-app="mdpreview"] .actions button{
    width:100%;
  }

  [data-app="mdpreview"] textarea,
  [data-app="mdpreview"] .preview{
    min-height:320px;
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
    if (k && k.trim()) return `siteapps:mdpreview:${k.trim()}`;
    return `siteapps:mdpreview:${(location.pathname || "/")}`;
  }

  function normalizeLineEndings(s) {
    return String(s || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  }

  function escapeHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeAttr(s) {
    return escapeHtml(s);
  }

  function sanitizeUrl(url) {
    const s = String(url || "").trim();
    if (!s) return "#";
    if (/^(https?:|mailto:|tel:)/i.test(s)) return s;
    if (/^(\/|\.\/|\.\.\/|#)/.test(s)) return s;
    return "#";
  }

  function sanitizeFilename(name) {
    let out = String(name || "").trim();
    out = out.replace(/[\\/:*?"<>|]+/g, "-");
    out = out.replace(/\s+/g, " ");
    if (!out) out = "markdown-note";
    if (!/\.md$/i.test(out)) out += ".md";
    return out;
  }

  function splitTableRow(line) {
    let s = String(line || "").trim();
    if (s.startsWith("|")) s = s.slice(1);
    if (s.endsWith("|")) s = s.slice(0, -1);
    return s.split("|").map(cell => cell.trim());
  }

  function parseInline(text) {
    let s = String(text || "");
    const tokens = [];

    function stash(html) {
      const key = `@@TOK${tokens.length}@@`;
      tokens.push(html);
      return key;
    }

    // code spans first
    s = s.replace(/`([^`\n]+)`/g, (_, code) => {
      return stash(`<code>${escapeHtml(code)}</code>`);
    });

    // images
    s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g, (_, alt, url, title) => {
  const safeUrl = sanitizeUrl(url);
  const safeAlt = escapeAttr(alt);
  const safeTitle = title ? ` title="${escapeAttr(title)}"` : "";
  return stash(`<img src="${escapeAttr(safeUrl)}" alt="${safeAlt}"${safeTitle}>`);
});

    // links
    s = s.replace(/$begin:math:display$\(\[\^$end:math:display$]+)\]$begin:math:text$\(\[\^\)\\s\]\+\)\(\?\:\\s\+\"\(\[\^\"\]\*\)\"\)\?$end:math:text$/g, (_, label, url, title) => {
      const safeUrl = sanitizeUrl(url);
      const safeTitle = title ? ` title="${escapeAttr(title)}"` : "";
      return stash(
        `<a href="${escapeAttr(safeUrl)}" target="_blank" rel="noreferrer noopener"${safeTitle}>${escapeHtml(label)}</a>`
      );
    });

    s = escapeHtml(s);

    // emphasis
    s = s.replace(/~~(.+?)~~/g, "<del>$1</del>");
    s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/__(.+?)__/g, "<strong>$1</strong>");
    s = s.replace(/\*(.+?)\*/g, "<em>$1</em>");
    s = s.replace(/_(.+?)_/g, "<em>$1</em>");

    tokens.forEach((html, i) => {
      s = s.split(`@@TOK${i}@@`).join(html);
    });

    return s;
  }

  function parseTable(lines, startIndex) {
    const headers = splitTableRow(lines[startIndex]);
    const aligns = splitTableRow(lines[startIndex + 1]).map(cell => {
      const s = cell.replace(/\s+/g, "");
      const left = s.startsWith(":");
      const right = s.endsWith(":");
      if (left && right) return "center";
      if (right) return "right";
      if (left) return "left";
      return "";
    });

    const rows = [];
    let i = startIndex + 2;

    while (i < lines.length && /\|/.test(lines[i]) && !/^\s*$/.test(lines[i])) {
      rows.push(splitTableRow(lines[i]));
      i++;
    }

    let html = "<table><thead><tr>";
    headers.forEach((cell, idx) => {
      const align = aligns[idx] ? ` style="text-align:${aligns[idx]}"` : "";
      html += `<th${align}>${parseInline(cell)}</th>`;
    });
    html += "</tr></thead>";

    if (rows.length) {
      html += "<tbody>";
      rows.forEach(row => {
        html += "<tr>";
        headers.forEach((_, idx) => {
          const align = aligns[idx] ? ` style="text-align:${aligns[idx]}"` : "";
          html += `<td${align}>${parseInline(row[idx] || "")}</td>`;
        });
        html += "</tr>";
      });
      html += "</tbody>";
    }

    html += "</table>";

    return { html, nextIndex: i - 1 };
  }

  function markdownToHtml(md) {
    const src = normalizeLineEndings(md).replace(/\u00A0/g, " ");
    const lines = src.split("\n");
    const out = [];

    let inCode = false;
    let codeFence = "";
    let codeLang = "";
    let codeLines = [];

    let para = [];
    let quote = [];
    let inUl = false;
    let inOl = false;

    function closePara() {
      if (!para.length) return;
      out.push(`<p>${parseInline(para.join("\n")).replace(/\n/g, "<br>")}</p>`);
      para = [];
    }

    function closeQuote() {
      if (!quote.length) return;
      out.push(`<blockquote><p>${parseInline(quote.join("\n")).replace(/\n/g, "<br>")}</p></blockquote>`);
      quote = [];
    }

    function closeLists() {
      if (inUl) {
        out.push("</ul>");
        inUl = false;
      }
      if (inOl) {
        out.push("</ol>");
        inOl = false;
      }
    }

    function closeAll() {
      closePara();
      closeQuote();
      closeLists();
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const fenceMatch = line.match(/^(\s*)(```|~~~)\s*([\w-]+)?\s*$/);

      if (inCode) {
        if (fenceMatch && fenceMatch[2] === codeFence) {
          const langAttr = codeLang ? ` class="language-${escapeAttr(codeLang)}"` : "";
          out.push(`<pre><code${langAttr}>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
          inCode = false;
          codeFence = "";
          codeLang = "";
          codeLines = [];
        } else {
          codeLines.push(line);
        }
        continue;
      }

      if (fenceMatch) {
        closeAll();
        inCode = true;
        codeFence = fenceMatch[2];
        codeLang = fenceMatch[3] || "";
        codeLines = [];
        continue;
      }

      if (/^\s*$/.test(line)) {
        closeAll();
        continue;
      }

      const tableSepMatch =
        i + 1 < lines.length &&
        /\|/.test(line) &&
        /^[:|\-\s]+$/.test(lines[i + 1]) &&
        lines[i + 1].includes("-");

      if (tableSepMatch) {
        closeAll();
        const table = parseTable(lines, i);
        out.push(table.html);
        i = table.nextIndex;
        continue;
      }

      const headingMatch = line.match(/^ {0,3}(#{1,6})\s+(.*?)\s*#*\s*$/);
      if (headingMatch) {
        closeAll();
        const level = headingMatch[1].length;
        out.push(`<h${level}>${parseInline(headingMatch[2])}</h${level}>`);
        continue;
      }

      if (/^ {0,3}([-*_])(?:\s*\1){2,}\s*$/.test(line)) {
        closeAll();
        out.push("<hr>");
        continue;
      }

      const quoteMatch = line.match(/^ {0,3}>\s?(.*)$/);
      if (quoteMatch) {
        closePara();
        closeLists();
        quote.push(quoteMatch[1]);
        continue;
      } else {
        closeQuote();
      }

      const ulMatch = line.match(/^ {0,3}[-*+]\s+(.*)$/);
      if (ulMatch) {
        closePara();
        closeQuote();
        if (inOl) {
          out.push("</ol>");
          inOl = false;
        }
        if (!inUl) {
          out.push("<ul>");
          inUl = true;
        }
        out.push(`<li>${parseInline(ulMatch[1])}</li>`);
        continue;
      }

      const olMatch = line.match(/^ {0,3}\d+\.\s+(.*)$/);
      if (olMatch) {
        closePara();
        closeQuote();
        if (inUl) {
          out.push("</ul>");
          inUl = false;
        }
        if (!inOl) {
          out.push("<ol>");
          inOl = true;
        }
        out.push(`<li>${parseInline(olMatch[1])}</li>`);
        continue;
      }

      closeLists();
      para.push(line);
    }

    if (inCode) {
      const langAttr = codeLang ? ` class="language-${escapeAttr(codeLang)}"` : "";
      out.push(`<pre><code${langAttr}>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
    }

    closeAll();

    return out.join("\n");
  }

  function downloadTextFile(filename, text) {
    const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  window.SiteApps.register("mdpreview", (container) => {
    ensureStyle();

    const storageKey = makeStorageKey(container);

    let savedSinceDownload = false;
    let lastDownloadedAt = null;
    let lastCopiedAt = null;
    let saveTimer = null;
    let feedbackTimer = null;

    container.innerHTML = "";

    const topRow = document.createElement("div");
    topRow.className = "top-row";

    const title = document.createElement("h3");
    title.textContent = "Markdown Writer & Live Preview";

    const statusRow = document.createElement("div");
    statusRow.className = "status-row";

    const saveBadge = document.createElement("span");
    saveBadge.className = "badge dim";
    saveBadge.textContent = "Saved ✓";

    const fileBadge = document.createElement("span");
    fileBadge.className = "badge warn";
    fileBadge.textContent = "Not downloaded";

    statusRow.append(saveBadge, fileBadge);
    topRow.append(title, statusRow);

    const fileLabel = document.createElement("label");
    fileLabel.textContent = "File name:";

    const fileInput = document.createElement("input");
    fileInput.type = "text";
    fileInput.placeholder = "my-note.md";
    fileInput.value = "markdown-note.md";

    const workspace = document.createElement("div");
    workspace.className = "workspace";

    const editorPane = document.createElement("div");
    editorPane.className = "pane";

    const editorHead = document.createElement("div");
    editorHead.className = "pane-head";

    const editorLabel = document.createElement("label");
    editorLabel.style.margin = "0";
    editorLabel.textContent = "Markdown:";

    const editorHint = document.createElement("span");
    editorHint.className = "hint";
    editorHint.textContent = "Type on the left, preview updates live.";

    editorHead.append(editorLabel, editorHint);

    const editorTA = document.createElement("textarea");
    editorTA.placeholder = [
      "# Title",
      "",
      "Write **Markdown** here.",
      "",
      "- Bullet one",
      "- Bullet two",
      "",
      "[A link](https://example.com)"
    ].join("\n");

    const previewPane = document.createElement("div");
    previewPane.className = "pane";

    const previewHead = document.createElement("div");
    previewHead.className = "pane-head";

    const previewLabel = document.createElement("label");
    previewLabel.style.margin = "0";
    previewLabel.textContent = "Preview:";

    const previewHint = document.createElement("span");
    previewHint.className = "hint";
    previewHint.textContent = "Lightweight built-in renderer.";

    previewHead.append(previewLabel, previewHint);

    const preview = document.createElement("div");
    preview.className = "preview";

    editorPane.append(editorHead, editorTA);
    previewPane.append(previewHead, preview);
    workspace.append(editorPane, previewPane);

    const actions = document.createElement("div");
    actions.className = "actions";

    const feedback = document.createElement("div");
    feedback.className = "feedback";
    feedback.textContent = "";

    function mkBtn(text, cls, fn) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = cls;
      b.textContent = text;
      b.addEventListener("click", fn);
      return b;
    }

    function renderPreview() {
      const raw = normalizeLineEndings(editorTA.value);
      if (!raw.trim()) {
        preview.innerHTML = `<p class="preview-empty">Live preview appears here…</p>`;
        return;
      }
      preview.innerHTML = markdownToHtml(raw);
    }

    function renderBadges() {
      if (savedSinceDownload) {
        fileBadge.className = "badge good";
        fileBadge.textContent = "Downloaded ✓";
        fileBadge.title = lastDownloadedAt ? `Last download: ${lastDownloadedAt}` : "";
      } else {
        fileBadge.className = "badge warn";
        fileBadge.textContent = "Not downloaded";
        fileBadge.title = "You’ve changed the document since the last download.";
      }
    }

    function showFeedback(msg, ms = 1400) {
      feedback.textContent = msg;
      if (feedbackTimer) clearTimeout(feedbackTimer);
      feedbackTimer = setTimeout(() => {
        feedback.textContent = "";
        feedbackTimer = null;
      }, ms);
    }

    function markChanged() {
      savedSinceDownload = false;
      renderBadges();
      saveStateDebounced();
    }

    function saveState() {
      try {
        const state = {
          v: 1,
          fileName: fileInput.value,
          markdown: editorTA.value,
          savedSinceDownload,
          lastDownloadedAt,
          lastCopiedAt
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
      }, 400);
    }

    function restoreState() {
      try {
        const raw = localStorage.getItem(storageKey);
        if (!raw) return;
        const state = safeJsonParse(raw);
        if (!state || typeof state !== "object") return;

        if (typeof state.fileName === "string" && state.fileName.trim()) {
          fileInput.value = state.fileName;
        }
        if (typeof state.markdown === "string") {
          editorTA.value = state.markdown;
        }
        savedSinceDownload = !!state.savedSinceDownload;
        lastDownloadedAt = typeof state.lastDownloadedAt === "string" ? state.lastDownloadedAt : null;
        lastCopiedAt = typeof state.lastCopiedAt === "string" ? state.lastCopiedAt : null;
      } catch {}
    }

    async function copyMarkdown() {
      const text = editorTA.value || "";
      if (!text.trim()) {
        alert("No Markdown to copy.");
        return;
      }

      try {
        await navigator.clipboard.writeText(text);
        lastCopiedAt = new Date().toISOString();
        saveState();
        showFeedback("Copied!");
      } catch {
        try {
          editorTA.focus();
          editorTA.select();
          const ok = document.execCommand("copy");
          if (!ok) throw new Error("copy failed");
          lastCopiedAt = new Date().toISOString();
          saveState();
          showFeedback("Copied!");
        } catch {
          alert("Copy failed. Tap and hold to copy, or try a different browser.");
        }
      }
    }

    function downloadMarkdown() {
      const text = normalizeLineEndings(editorTA.value || "");
      if (!text.trim()) {
        alert("There’s no Markdown to save yet.");
        return;
      }
      const filename = sanitizeFilename(fileInput.value);
      fileInput.value = filename;
      downloadTextFile(filename, text);
      savedSinceDownload = true;
      lastDownloadedAt = new Date().toISOString();
      renderBadges();
      saveState();
      showFeedback("Markdown file downloaded.");
    }

    function clearAll() {
      if (!confirm("Clear the Markdown and preview?")) return;
      editorTA.value = "";
      fileInput.value = "markdown-note.md";
      savedSinceDownload = false;
      lastDownloadedAt = null;
      lastCopiedAt = null;
      renderPreview();
      renderBadges();
      saveStateDebounced();
      showFeedback("Cleared.");
    }

    actions.append(
      mkBtn("💾 Download .md", "btn-save", downloadMarkdown),
      mkBtn("📋 Copy Markdown", "btn-copy", copyMarkdown),
      mkBtn("🗑️ Clear all", "btn-clear", clearAll),
      feedback
    );

    container.append(topRow, fileLabel, fileInput, workspace, actions);

    editorTA.addEventListener("input", () => {
      renderPreview();
      markChanged();
    });

    fileInput.addEventListener("input", () => {
      markChanged();
    });

    restoreState();
    renderPreview();
    renderBadges();
    saveBadge.className = "badge good";
    saveBadge.textContent = "Saved ✓";
  });
})();
