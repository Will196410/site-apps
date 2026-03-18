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

  const STYLE_ID = "siteapps-tagtable-style-v1";

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
/* Tag Table — SiteApps pattern, high contrast, iPad safe */
[data-app="tagtable"]{
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

[data-app="tagtable"] .top-row{
  display:flex;
  align-items:baseline;
  justify-content:space-between;
  gap:10px;
  flex-wrap:wrap;
  margin-bottom:10px;
}

[data-app="tagtable"] h3{
  margin:0;
  font-size:20px;
  font-weight:900;
}

[data-app="tagtable"] .status-row{
  display:flex;
  gap:10px;
  align-items:center;
  flex-wrap:wrap;
  justify-content:flex-end;
}

[data-app="tagtable"] .badge{
  font-size:14px;
  font-weight:900;
  padding:6px 10px;
  border:2px solid #111;
  border-radius:999px;
  background:#fff;
}

[data-app="tagtable"] .badge.good{ border-color:#0b3d0b; color:#0b3d0b; }
[data-app="tagtable"] .badge.warn{ border-color:#7a0000; color:#7a0000; }
[data-app="tagtable"] .badge.dim{ border-color:#444; color:#444; }

[data-app="tagtable"] label{
  display:block;
  margin:10px 0 6px;
  font-weight:900;
  font-size:14px;
}

[data-app="tagtable"] .help{
  margin:0 0 10px;
  font-size:14px;
  color:#333;
}

[data-app="tagtable"] textarea{
  width:100%;
  min-height:180px;
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

[data-app="tagtable"] textarea:focus{
  outline:none;
  box-shadow:0 0 0 3px rgba(11,95,255,0.25);
}

[data-app="tagtable"] .controls,
[data-app="tagtable"] .table-actions{
  display:flex;
  flex-wrap:wrap;
  gap:10px;
  margin-top:12px;
  align-items:center;
}

[data-app="tagtable"] button{
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

[data-app="tagtable"] .btn-primary{
  background:#0b5fff;
  border-color:#0b5fff;
  color:#fff;
}

[data-app="tagtable"] .btn-copy{
  background:#111;
  border-color:#111;
  color:#fff;
}

[data-app="tagtable"] .btn-clear{
  background:#fff;
  border-color:#7a0000;
  color:#7a0000;
}

[data-app="tagtable"] .table-wrap{
  margin-top:12px;
  border:2px solid #111;
  border-radius:12px;
  overflow:hidden;
  background:#fff;
}

[data-app="tagtable"] table{
  width:100%;
  border-collapse:collapse;
}

[data-app="tagtable"] thead th{
  text-align:left;
  padding:12px;
  border-bottom:2px solid #111;
  font-size:14px;
  font-weight:900;
  background:#f6f6f6;
}

[data-app="tagtable"] thead th:last-child{
  width:112px;
  text-align:center;
}

[data-app="tagtable"] tbody td{
  border-bottom:1px solid #111;
  vertical-align:middle;
  padding:0;
}

[data-app="tagtable"] tbody tr:last-child td{
  border-bottom:none;
}

[data-app="tagtable"] .copy-row{
  width:100%;
  display:block;
  border:none;
  background:#fff;
  color:#111;
  text-align:left;
  padding:12px;
  border-radius:0;
  font-weight:700;
  font-size:15px;
  line-height:1.35;
  word-break:break-word;
}

[data-app="tagtable"] .copy-row:active,
[data-app="tagtable"] .copy-row:focus{
  outline:none;
  background:#eef4ff;
}

[data-app="tagtable"] .actions-cell{
  padding:8px;
  text-align:center;
}

[data-app="tagtable"] .delete-row{
  min-width:84px;
  background:#fff;
  border-color:#7a0000;
  color:#7a0000;
}

[data-app="tagtable"] .empty{
  margin-top:12px;
  border:2px dashed #444;
  border-radius:12px;
  padding:18px;
  font-weight:700;
  color:#444;
  background:#fafafa;
}

[data-app="tagtable"] .feedback{
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

[data-app="tagtable"] .feedback.show{
  opacity:1;
  transform:translateY(0);
}

[data-app="tagtable"] .file-input{
  display:none;
}

@media (max-width:700px){
  [data-app="tagtable"] .controls,
  [data-app="tagtable"] .table-actions{
    flex-direction:column;
    align-items:stretch;
  }

  [data-app="tagtable"] .controls button,
  [data-app="tagtable"] .table-actions button{
    width:100%;
  }

  [data-app="tagtable"] thead{
    display:none;
  }

  [data-app="tagtable"] table,
  [data-app="tagtable"] tbody,
  [data-app="tagtable"] tr,
  [data-app="tagtable"] td{
    display:block;
    width:100%;
  }

  [data-app="tagtable"] tbody tr{
    border-bottom:2px solid #111;
  }

  [data-app="tagtable"] tbody tr:last-child{
    border-bottom:none;
  }

  [data-app="tagtable"] tbody td{
    border-bottom:none;
  }

  [data-app="tagtable"] .actions-cell{
    padding:0 12px 12px;
  }

  [data-app="tagtable"] .delete-row{
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
    if (k && k.trim()) return `siteapps:tagtable:${k.trim()}`;
    return `siteapps:tagtable:${location.pathname || "/"}`;
  }

  function normalizeLineEndings(s) {
    return String(s || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  }

  function normalizeRecord(s) {
    return String(s || "").replace(/\s+/g, " ").trim();
  }

  function recordKey(s) {
    return normalizeRecord(s).toLocaleLowerCase();
  }

  function splitRecords(s) {
    return normalizeLineEndings(s)
      .split("\n")
      .map(normalizeRecord)
      .filter(Boolean);
  }

  function sortRecords(list) {
    return list.slice().sort((a, b) => {
      const primary = a.localeCompare(b, undefined, {
        sensitivity: "base",
        numeric: true
      });
      if (primary !== 0) return primary;
      return a.localeCompare(b, undefined, {
        sensitivity: "variant",
        numeric: true
      });
    });
  }

  function mergeRecords(existing, incoming) {
    const map = new Map();

    existing.forEach((item) => {
      const text = normalizeRecord(item);
      if (!text) return;
      const key = recordKey(text);
      if (!map.has(key)) map.set(key, text);
    });

    let added = 0;
    let skipped = 0;

    incoming.forEach((item) => {
      const text = normalizeRecord(item);
      if (!text) return;
      const key = recordKey(text);
      if (map.has(key)) {
        skipped += 1;
      } else {
        map.set(key, text);
        added += 1;
      }
    });

    return {
      records: sortRecords(Array.from(map.values())),
      added,
      skipped
    };
  }

  function exportFilename() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `tag-table-${yyyy}-${mm}-${dd}.txt`;
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

  function downloadTextFile(filename, text) {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function parseImportedText(text) {
    const parsed = safeJsonParse(text);

    if (parsed && Array.isArray(parsed.records)) {
      return parsed.records.map(normalizeRecord).filter(Boolean);
    }

    return splitRecords(text);
  }

  window.SiteApps.register("tagtable", (container) => {
    ensureStyle();

    const storageKey = makeStorageKey(container);

    let records = [];
    let copiedSinceChange = false;
    let lastCopyAt = null;
    let saveTimer = null;
    let toastTimer = null;

    container.innerHTML = "";

    const topRow = document.createElement("div");
    topRow.className = "top-row";

    const title = document.createElement("h3");
    title.textContent = "Tag Table";

    const statusRow = document.createElement("div");
    statusRow.className = "status-row";

    const countBadge = document.createElement("span");
    countBadge.className = "badge dim";
    countBadge.textContent = "0 records";

    const saveBadge = document.createElement("span");
    saveBadge.className = "badge dim";
    saveBadge.textContent = "";

    const copyBadge = document.createElement("span");
    copyBadge.className = "badge warn";
    copyBadge.textContent = "Not copied";

    statusRow.append(countBadge, saveBadge, copyBadge);
    topRow.append(title, statusRow);

    const inputLabel = document.createElement("label");
    inputLabel.textContent = "Paste entries — one per line";

    const help = document.createElement("p");
    help.className = "help";
    help.textContent = "Add lines to the table, then tap any saved entry to copy it.";

    const inputTA = document.createElement("textarea");
    inputTA.placeholder = "tag-one\ntag-two\ntag-three";

    const controls = document.createElement("div");
    controls.className = "controls";

    function makeBtn(text, cls, fn) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = cls;
      b.textContent = text;
      b.addEventListener("click", fn);
      return b;
    }

    const addBtn = makeBtn("Add lines", "btn-primary", addLinesFromInput);
    const clearInputBtn = makeBtn("Clear input", "", clearInput);
    const exportBtn = makeBtn("Export list", "btn-copy", exportList);
    const importBtn = makeBtn("Import file", "", () => fileInput.click());
    const clearAllBtn = makeBtn("Clear all", "btn-clear", clearAll);

    controls.append(addBtn, clearInputBtn, exportBtn, importBtn, clearAllBtn);

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.className = "file-input";
    fileInput.accept = ".txt,.json,text/plain,application/json";

    const tableLabel = document.createElement("label");
    tableLabel.textContent = "Saved entries";

    const tableWrap = document.createElement("div");
    tableWrap.className = "table-wrap";

    const table = document.createElement("table");

    const thead = document.createElement("thead");
    const headRow = document.createElement("tr");

    const headText = document.createElement("th");
    headText.textContent = "Tap entry to copy";

    const headActions = document.createElement("th");
    headActions.textContent = "Delete";

    headRow.append(headText, headActions);
    thead.appendChild(headRow);

    const tbody = document.createElement("tbody");
    table.append(thead, tbody);
    tableWrap.appendChild(table);

    const emptyBox = document.createElement("div");
    emptyBox.className = "empty";
    emptyBox.textContent = "No entries yet.";

    const feedback = document.createElement("div");
    feedback.className = "feedback";
    feedback.textContent = "Copied!";

    container.append(
      topRow,
      inputLabel,
      help,
      inputTA,
      controls,
      fileInput,
      tableLabel,
      emptyBox,
      tableWrap,
      feedback
    );

    function showToast(message) {
      feedback.textContent = message;
      feedback.classList.add("show");
      if (toastTimer) clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        feedback.classList.remove("show");
      }, 1400);
    }

    function renderBadges() {
      countBadge.textContent = `${records.length} ${records.length === 1 ? "record" : "records"}`;

      if (copiedSinceChange) {
        copyBadge.className = "badge good";
        copyBadge.textContent = "Copied ✓";
        copyBadge.title = lastCopyAt ? `Last copied: ${lastCopyAt}` : "";
      } else {
        copyBadge.className = "badge warn";
        copyBadge.textContent = "Not copied";
        copyBadge.title = "No entry copied since the last data change.";
      }
    }

    function saveState() {
      try {
        const state = {
          v: 1,
          records,
          draftText: inputTA.value,
          copiedSinceChange,
          lastCopyAt
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
      }, 400);
    }

    function markDataChanged() {
      copiedSinceChange = false;
      lastCopyAt = null;
      renderBadges();
      saveStateDebounced();
    }

    function markDraftChanged() {
      saveStateDebounced();
    }

    function restoreState() {
      try {
        const raw = localStorage.getItem(storageKey);
        if (!raw) return;
        const s = safeJsonParse(raw);
        if (!s || typeof s !== "object") return;

        if (typeof s.draftText === "string") inputTA.value = s.draftText;
        if (Array.isArray(s.records)) {
          records = mergeRecords([], s.records).records;
        }

        copiedSinceChange = !!s.copiedSinceChange;
        lastCopyAt = typeof s.lastCopyAt === "string" ? s.lastCopyAt : null;
      } catch (_) {
        // ignore
      }
    }

    function renderTable() {
      tbody.innerHTML = "";

      if (!records.length) {
        emptyBox.style.display = "block";
        tableWrap.style.display = "none";
      } else {
        emptyBox.style.display = "none";
        tableWrap.style.display = "block";
      }

      records.forEach((text) => {
        const tr = document.createElement("tr");

        const tdText = document.createElement("td");
        const copyBtn = document.createElement("button");
        copyBtn.type = "button";
        copyBtn.className = "copy-row";
        copyBtn.textContent = text;
        copyBtn.title = "Tap to copy";
        copyBtn.addEventListener("click", async () => {
          const ok = await copyText(text);
          if (ok) {
            copiedSinceChange = true;
            lastCopyAt = new Date().toISOString();
            renderBadges();
            saveState();
            showToast(`Copied: ${text}`);
          } else {
            alert("Copy failed. Tap and hold, or try a different browser.");
          }
        });
        tdText.appendChild(copyBtn);

        const tdDelete = document.createElement("td");
        tdDelete.className = "actions-cell";

        const deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.className = "delete-row";
        deleteBtn.textContent = "Delete";
        deleteBtn.title = `Delete ${text}`;
        deleteBtn.addEventListener("click", () => {
          records = records.filter((item) => recordKey(item) !== recordKey(text));
          renderTable();
          markDataChanged();
          showToast("Deleted");
        });

        tdDelete.appendChild(deleteBtn);
        tr.append(tdText, tdDelete);
        tbody.appendChild(tr);
      });

      renderBadges();
    }

    function addLinesFromInput() {
      const incoming = splitRecords(inputTA.value);
      if (!incoming.length) {
        alert("Please paste one or more lines first.");
        return;
      }

      const merged = mergeRecords(records, incoming);
      records = merged.records;
      renderTable();
      markDataChanged();

      const bits = [];
      bits.push(`Added ${merged.added}`);
      if (merged.skipped) bits.push(`Skipped ${merged.skipped} duplicate${merged.skipped === 1 ? "" : "s"}`);
      showToast(bits.join(" • "));
    }

    function clearInput() {
      inputTA.value = "";
      markDraftChanged();
    }

    function clearAll() {
      if (!records.length && !inputTA.value.trim()) return;
      if (!confirm("Clear the saved entries and the input area?")) return;

      records = [];
      inputTA.value = "";
      copiedSinceChange = false;
      lastCopyAt = null;
      renderTable();
      saveStateDebounced();
      showToast("Cleared");
    }

    function exportList() {
      if (!records.length) {
        alert("There are no saved entries to export.");
        return;
      }

      const text = records.join("\n");
      try {
        downloadTextFile(exportFilename(), text);
        showToast("Exported");
      } catch (_) {
        alert("Export failed on this device.");
      }
    }

    fileInput.addEventListener("change", async () => {
      const file = fileInput.files && fileInput.files[0];
      if (!file) return;

      try {
        const text = await file.text();
        const imported = parseImportedText(text);

        if (!imported.length) {
          alert("That file did not contain any usable entries.");
          fileInput.value = "";
          return;
        }

        const merged = mergeRecords(records, imported);
        records = merged.records;
        renderTable();
        markDataChanged();

        const bits = [];
        bits.push(`Imported ${merged.added}`);
        if (merged.skipped) bits.push(`Skipped ${merged.skipped} duplicate${merged.skipped === 1 ? "" : "s"}`);
        showToast(bits.join(" • "));
      } catch (_) {
        alert("Import failed.");
      } finally {
        fileInput.value = "";
      }
    });

    inputTA.addEventListener("input", markDraftChanged);

    restoreState();
    renderTable();
    saveBadge.className = "badge good";
    saveBadge.textContent = "Saved ✓";
  });
})();
