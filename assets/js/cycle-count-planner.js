(() => {
  "use strict";

  const $ = id => document.getElementById(id);
  const DAY = 86400000;
  const SAVE_KEY = "dixani-cycle-count-planner-v1";
  const fields = [
    "sku", "description", "location", "abc",
    "lastCountDate", "risk", "interval"
  ];

  let items = [];
  let history = [];
  let visits = [];
  let workload = [];
  let stale = true;
  let generated = false;

  const aliases = {
    sku: ["sku", "item code", "code"],
    description: ["description", "item description", "name"],
    location: ["location", "bin", "bin location"],
    abc: ["abc", "abc class", "class"],
    lastCountDate: ["last count date", "last count", "count date"],
    risk: ["risk", "risk level", "priority"],
    interval: ["interval days", "interval", "interval override"]
  };

  function today() {
    const d = new Date();
    return [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, "0"),
      String(d.getDate()).padStart(2, "0")
    ].join("-");
  }

  function dateNumber(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return NaN;
    const n = Date.parse(value + "T00:00:00Z");
    if (!Number.isFinite(n)) return NaN;
    return new Date(n).toISOString().slice(0, 10) === value
      ? n / DAY
      : NaN;
  }

  function dateText(day) {
    return new Date(day * DAY).toISOString().slice(0, 10);
  }

  function keyOf(item) {
    return JSON.stringify([item.sku.trim(), item.location.trim()]);
  }

  function message(text, type = "success") {
    $("plannerMessage").textContent = text;
    $("plannerMessage").className = "ccp-message " + type;
  }

  function attempt(fn) {
    try {
      fn();
    } catch (error) {
      message(error.message || "The operation could not be completed.", "error");
    }
  }

  function whole(value, label, max = 3650) {
    const n = Number(value);
    if (!String(value).trim() || !Number.isInteger(n) || n < 1 || n > max) {
      throw new Error(`${label} must be a whole number from 1 to ${max}.`);
    }
    return n;
  }

  function markStale() {
    stale = true;
    $("staleNotice").hidden = !generated;
    $("exportSchedule").disabled = true;
    $("printSchedule").disabled = true;
    $("scheduleBody").querySelectorAll("button, input").forEach(el => {
      el.disabled = true;
    });
  }

  function normalizeHeader(value) {
    return String(value).replace(/^\uFEFF/, "").trim().toLowerCase()
      .replace(/[_-]+/g, " ").replace(/\s+/g, " ");
  }

  function parseDelimited(text) {
    const first = text.split(/\r?\n/)[0] || "";
    const delimiter = first.includes("\t") ? "\t" : ",";
    const matrix = [];
    let row = [], cell = "", quoted = false;

    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (c === '"') {
        if (quoted && text[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          quoted = !quoted;
        }
      } else if (c === delimiter && !quoted) {
        row.push(cell);
        cell = "";
      } else if ((c === "\n" || c === "\r") && !quoted) {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(cell);
        if (row.some(v => v.trim())) matrix.push(row);
        row = [];
        cell = "";
      } else {
        cell += c;
      }
    }

    if (quoted) throw new Error("The CSV contains an unclosed quotation mark.");
    row.push(cell);
    if (row.some(v => v.trim())) matrix.push(row);
    return matrix;
  }

  function validateItems(source) {
    if (!Array.isArray(source) || !source.length) {
      throw new Error("Add at least one inventory item.");
    }
    if (source.length > 5000) {
      throw new Error("Use a maximum of 5,000 SKU-location tasks per plan.");
    }

    const seen = new Set();

    return source.map((raw, index) => {
      if (!raw || typeof raw !== "object") {
        throw new Error(`Invalid item at row ${index + 1}.`);
      }

      const item = {};
      fields.forEach(field => {
        item[field] = String(raw[field] ?? "").trim();
      });

      item.abc = item.abc.toUpperCase();
      item.risk = item.risk
        ? item.risk[0].toUpperCase() + item.risk.slice(1).toLowerCase()
        : "";

      if (!item.sku) throw new Error(`Row ${index + 1}: enter an SKU.`);
      if (!["A", "B", "C"].includes(item.abc)) {
        throw new Error(`Row ${index + 1}: ABC Class must be A, B or C.`);
      }

      if (item.lastCountDate) {
        if (!Number.isFinite(dateNumber(item.lastCountDate))) {
          throw new Error(`Row ${index + 1}: use YYYY-MM-DD for Last Count Date.`);
        }
        if (item.lastCountDate > today()) {
          throw new Error(`Row ${index + 1}: the last count cannot be in the future.`);
        }
      }

      if (!["", "Critical", "High", "Medium", "Low"].includes(item.risk)) {
        throw new Error(`Row ${index + 1}: invalid Risk Level.`);
      }

      if (item.interval) {
        item.interval = String(whole(item.interval, `Row ${index + 1} interval`));
      }

      const key = keyOf(item);
      if (seen.has(key)) {
        throw new Error(`Duplicate SKU-location combination: ${item.sku}, ${item.location || "no location"}.`);
      }
      seen.add(key);
      return item;
    });
  }

  function readSettings() {
    return {
      start: $("planStart").value,
      days: $("planDays").value,
      capacity: $("dailyCapacity").value,
      A: $("intervalA").value,
      B: $("intervalB").value,
      C: $("intervalC").value,
      working: [...document.querySelectorAll('[name="workingDay"]:checked')]
        .map(el => Number(el.value)),
      excluded: $("excludedDates").value
    };
  }

  function validateSettings(raw) {
    if (!raw || !Number.isFinite(dateNumber(raw.start))) {
      throw new Error("Choose a valid planning start date.");
    }
    if (![30, 60, 90, 180, 365].includes(Number(raw.days))) {
      throw new Error("Choose a supported planning horizon.");
    }
    if (!Array.isArray(raw.working) || !raw.working.length ||
        raw.working.some(n => !Number.isInteger(n) || n < 0 || n > 6)) {
      throw new Error("Select at least one valid working day.");
    }

    const excluded = String(raw.excluded || "").split(/[\s,;]+/).filter(Boolean);
    excluded.forEach(value => {
      if (!Number.isFinite(dateNumber(value))) {
        throw new Error(`Invalid excluded date: ${value}. Use YYYY-MM-DD.`);
      }
    });

    return {
      start: raw.start,
      days: Number(raw.days),
      capacity: whole(raw.capacity, "Daily capacity", 10000),
      A: whole(raw.A, "A-class interval"),
      B: whole(raw.B, "B-class interval"),
      C: whole(raw.C, "C-class interval"),
      working: [...new Set(raw.working)],
      excluded: [...new Set(excluded)].join("\n")
    };
  }

  function applySettings(s) {
    $("planStart").value = s.start;
    $("planDays").value = String(s.days);
    $("dailyCapacity").value = s.capacity;
    ["A", "B", "C"].forEach(c => $("interval" + c).value = s[c]);
    $("excludedDates").value = s.excluded;
    document.querySelectorAll('[name="workingDay"]').forEach(el => {
      el.checked = s.working.includes(Number(el.value));
    });
  }

  function resetPlan() {
    visits = [];
    workload = [];
    generated = false;
    stale = true;
    $("planResults").hidden = true;
    $("exportSchedule").disabled = true;
    $("printSchedule").disabled = true;
  }

  function replaceInventory(next) {
    if ((items.length || history.length) &&
        !confirm("Replace the current inventory and completion history? Download a backup first if needed.")) {
      return;
    }

    items = next;
    history = [];
    resetPlan();
    renderInventory();
    message(`${items.length} counting tasks loaded.`);
  }

  function importText(text) {
    const matrix = parseDelimited(text.replace(/^\uFEFF/, "").trim());
    if (matrix.length < 2) {
      throw new Error("Include a header row and at least one inventory row.");
    }

    const headers = matrix[0].map(normalizeHeader);
    const map = {};
    Object.entries(aliases).forEach(([field, names]) => {
      map[field] = headers.findIndex(h => names.includes(h));
    });

    if (map.sku < 0 || map.abc < 0) {
      throw new Error("Required columns: SKU and ABC Class.");
    }

    const next = matrix.slice(1).map(row => {
      const item = {};
      fields.forEach(field => {
        item[field] = map[field] < 0 ? "" : (row[map[field]] || "");
      });
      return item;
    });

    replaceInventory(validateItems(next));
  }

  function makeInput(item, field, index) {
    let el;
    const options = field === "abc" ? ["A", "B", "C"]
      : field === "risk" ? ["", "Critical", "High", "Medium", "Low"] : null;

    if (options) {
      el = document.createElement("select");
      options.forEach(value => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value || "Not supplied";
        option.selected = item[field] === value;
        el.append(option);
      });
    } else {
      el = document.createElement("input");
      el.type = field === "lastCountDate" ? "date"
        : field === "interval" ? "number" : "text";
      el.value = item[field] || "";
      if (field === "interval") {
        el.min = "1";
        el.max = "3650";
        el.step = "1";
        el.placeholder = "Use class";
      }
      if (field === "lastCountDate") el.max = today();
    }

    el.dataset.index = index;
    el.dataset.field = field;
    el.setAttribute("aria-label", `${field}, row ${index + 1}`);
    return el;
  }

  function renderInventory() {
    const body = $("inventoryBody");
    body.replaceChildren();
    const query = $("inventorySearch").value.toLowerCase().trim();
    let visible = 0;

    items.forEach((item, index) => {
      if (query && !`${item.sku} ${item.description} ${item.location}`
        .toLowerCase().includes(query)) return;

      visible++;
      const tr = document.createElement("tr");
      fields.forEach(field => {
        const td = document.createElement("td");
        td.append(makeInput(item, field, index));
        tr.append(td);
      });

      const td = document.createElement("td");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "ccp-btn danger";
      button.textContent = "Remove";
      button.dataset.remove = index;
      td.append(button);
      tr.append(td);
      body.append(tr);
    });

    $("inventoryCount").textContent =
      `${visible} of ${items.length} counting tasks`;
  }

  function generate() {
    const clean = validateItems(items);
    const s = validateSettings(readSettings());
    const start = dateNumber(s.start);
    const end = start + s.days - 1;
    const excluded = new Set(s.excluded.split("\n"));
    const riskOrder = { Critical: 0, High: 1, Medium: 2, Low: 3, "": 4 };

    const latest = new Map();
    const completedByDate = new Map();
    history.forEach(record => {
      completedByDate.set(record.completed,
        (completedByDate.get(record.completed) || 0) + 1);
      const key = keyOf(record.item);
      const old = latest.get(key) || "";
      if (record.completed > old) latest.set(key, record.completed);
    });

    const queue = clean.map(item => {
      const last = [item.lastCountDate, latest.get(keyOf(item)) || ""]
        .sort().pop();
      const interval = Number(item.interval || s[item.abc]);

      return {
        item: { ...item },
        interval,
        due: last ? dateNumber(last) + interval : start,
        initial: !last,
        previous: last || ""
      };
    });

    const result = [];
    const daily = [];

    function priority(a, b) {
      return a.due - b.due ||
        riskOrder[a.item.risk] - riskOrder[b.item.risk] ||
        a.item.abc.localeCompare(b.item.abc) ||
        keyOf(a.item).localeCompare(keyOf(b.item));
    }

    for (let day = start; day <= end; day++) {
      const date = dateText(day);
      const weekday = new Date(day * DAY).getUTCDay();
      const capacity = s.working.includes(weekday) && !excluded.has(date)
        ? s.capacity : 0;
      const completedToday = completedByDate.get(date) || 0;
      // Retain actual work on excluded days, but never assign new work there.
      if (!capacity && !completedToday) continue;

      const dueNow = queue.filter(task => task.due <= day).sort(priority);
      const available = Math.max(0, capacity - completedToday);
      const selected = dueNow.slice(0, available);

      selected.forEach(task => {
        result.push({
          item: { ...task.item },
          due: dateText(task.due),
          scheduled: date,
          completed: "",
          initial: task.initial,
          previous: task.previous
        });

        // The next visit assumes this planned count takes place.
        task.previous = date;
        task.due = day + task.interval;
        task.initial = false;
      });

      daily.push({ date, capacity });

      if (result.length > 50000) {
        throw new Error("This plan exceeds 50,000 visits. Shorten the horizon or use smaller inventory groups.");
      }
    }

    queue.filter(task => task.due <= end).sort(priority).forEach(task => {
      result.push({
        item: { ...task.item },
        due: dateText(task.due),
        scheduled: "",
        completed: "",
        initial: task.initial,
        previous: task.previous
      });
    });

    const completedInRange = history
      .filter(record => {
        const d = dateNumber(record.completed);
        return d >= start && d <= end;
      })
      .map(record => ({
        ...record,
        item: { ...record.item }
      }));

    items = clean;
    visits = [...completedInRange, ...result];
    workload = daily;
    generated = true;
    stale = false;

    $("planResults").hidden = false;
    $("staleNotice").hidden = true;
    $("exportSchedule").disabled = false;
    $("printSchedule").disabled = false;

    $("planSummary").textContent =
      `${s.start} to ${dateText(end)} · ${items.length} SKU-location tasks · ` +
      `${s.capacity} planned counts per working day. ` +
      "The schedule starts on or after each due date; non-working days can cause delays.";

    renderInventory();
    renderPlan();
    message("Schedule generated. Review delayed and unscheduled counts before assigning work.");
  }

  function overdue(visit) {
    return !visit.completed && !visit.initial && visit.due < today();
  }

  function status(visit) {
    if (visit.completed) return "Completed";
    if (!visit.scheduled) {
      return overdue(visit) ? "Unscheduled / overdue" : "Unscheduled";
    }
    if (overdue(visit)) return "Overdue";
    if (visit.initial) return "Initial count";
    return "Open";
  }

  function delay(visit) {
    if (!visit.scheduled) return "";
    return Math.max(0, dateNumber(visit.scheduled) - dateNumber(visit.due));
  }

  function cell(row, text) {
    const td = document.createElement("td");
    td.textContent = String(text ?? "");
    row.append(td);
    return td;
  }

  function filteredVisits() {
    const query = $("scheduleSearch").value.trim().toLowerCase();
    const filter = $("statusFilter").value;
    const abc = $("abcFilter").value;

    return visits.map((visit, index) => ({ visit, index })).filter(({ visit }) => {
      if (query && !`${visit.item.sku} ${visit.item.description} ${visit.item.location}`
        .toLowerCase().includes(query)) return false;
      if (abc !== "all" && visit.item.abc !== abc) return false;
      if (filter === "completed" && !visit.completed) return false;
      if (filter === "open" && visit.completed) return false;
      if (filter === "overdue" && !overdue(visit)) return false;
      if (filter === "unscheduled" && (visit.scheduled || visit.completed)) return false;
      return true;
    });
  }

  function renderPlan() {
    const scheduled = visits.filter(v => v.scheduled);
    const completed = visits.filter(v => v.completed);
    const unscheduled = visits.filter(v => !v.scheduled && !v.completed);
    const late = scheduled.filter(v => delay(v) > 0);

    $("scheduledKpi").textContent = scheduled.length;
    $("completedKpi").textContent = completed.length;
    $("overdueKpi").textContent = visits.filter(overdue).length;
    $("lateKpi").textContent = late.length;
    $("unscheduledKpi").textContent = unscheduled.length;

    const warnings = [];
    if (!workload.some(day => day.capacity > 0)) {
      warnings.push("There are no available working days in this horizon.");
    }
    const overCapacity = workload.filter(day =>
      completed.filter(v => v.completed === day.date).length > day.capacity
    );
    if (overCapacity.length) {
      warnings.push(`Recorded completions exceed the current capacity on ${overCapacity.length} day(s). History is retained; no additional work is allocated on those dates.`);
    }
    if (late.length) {
      warnings.push(`${late.length} visits are scheduled after their due date or initial-count target because of the planning start, working days or capacity.`);
    }
    if (unscheduled.length) {
      warnings.push(`${unscheduled.length} due tasks could not fit. Only the next unallocated count per item is listed; later repeats are not estimated.`);
    }

    $("capacityWarnings").hidden = !warnings.length;
    $("capacityWarnings").textContent = warnings.join(" ");

    const dailyBody = $("dailyBody");
    dailyBody.replaceChildren();
    workload.forEach(day => {
      const tr = document.createElement("tr");
      cell(tr, day.date);
      // Completed work consumes capacity on its actual completion date.
      // Preserve the original scheduled date in the detailed history.
      cell(tr, visits.filter(v =>
        (v.completed || v.scheduled) === day.date
      ).length);
      cell(tr, day.capacity);
      cell(tr, completed.filter(v => v.completed === day.date).length);
      dailyBody.append(tr);
    });

    const body = $("scheduleBody");
    body.replaceChildren();
    const shown = filteredVisits();

    shown.forEach(({ visit, index }) => {
      const tr = document.createElement("tr");
      const itemCell = cell(tr, "");
      const strong = document.createElement("strong");
      strong.textContent = visit.item.sku;
      const small = document.createElement("small");
      small.textContent = visit.item.description;
      itemCell.append(strong, small);

      cell(tr, visit.item.location || "—");
      cell(tr, visit.item.abc);
      cell(tr, visit.item.risk || "Not supplied");
      cell(tr, visit.initial ? `${visit.due} (initial target)` : visit.due);
      cell(tr, visit.scheduled || "Not allocated");
      cell(tr, visit.scheduled ? delay(visit) : "—");

      const statusCell = cell(tr, "");
      const badge = document.createElement("span");
      badge.className = "ccp-badge " +
        (visit.completed ? "completed" : overdue(visit) ? "overdue"
          : !visit.scheduled ? "unscheduled" : "");
      badge.textContent = status(visit);
      statusCell.append(badge);

      const completionCell = cell(tr, "");
      const actionCell = cell(tr, "");

      if (visit.completed) {
        completionCell.textContent = visit.completed;
        actionCell.textContent = "Recorded";
      } else {
        const dateInput = document.createElement("input");
        dateInput.type = "date";
        dateInput.max = today();
        dateInput.value = today();
        dateInput.id = "completion-" + index;
        dateInput.disabled = stale;
        dateInput.setAttribute("aria-label", `Completion date for ${visit.item.sku}`);
        completionCell.append(dateInput);

        const button = document.createElement("button");
        button.type = "button";
        button.className = "ccp-btn secondary";
        button.textContent = "Complete";
        button.dataset.complete = index;
        button.disabled = stale;
        actionCell.append(button);
      }

      body.append(tr);
    });

    $("noScheduleRows").hidden = shown.length > 0;
  }

  function complete(index) {
    if (stale) throw new Error("Regenerate the schedule before recording completion.");
    const visit = visits[index];
    if (!visit || visit.completed) return;

    const completed = $("completion-" + index).value;
    if (!Number.isFinite(dateNumber(completed)) || completed > today()) {
      throw new Error("Enter a valid completion date that is not in the future.");
    }
    if (completed < $("planStart").value) {
      throw new Error("Completion must be on or after the planning start date.");
    }

    const earlierOpen = visits.some(other =>
      other !== visit &&
      !other.completed &&
      keyOf(other.item) === keyOf(visit.item) &&
      other.due < visit.due
    );
    if (earlierOpen) {
      throw new Error("Complete the earliest open visit for this SKU-location first.");
    }

    if (visit.previous && completed <= visit.previous) {
      throw new Error("Completion must be after the previous count date.");
    }

    history.push({
      ...visit,
      item: { ...visit.item },
      completed
    });
    visit.completed = completed;

    renderPlan();
    markStale();
    message("Completion recorded. Regenerate the schedule to update future visits, then save or download a backup.");
  }

  function csvCell(value) {
    let text = String(value ?? "");
    // Prevent spreadsheet applications from treating imported text as formulas.
    if (/^[\s]*[=+\-@]/.test(text)) text = "'" + text;
    return /[",\r\n]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
  }

  function download(name, content, type) {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function downloadCsv(name, rows) {
    download(name, "\uFEFF" + rows.map(row => row.map(csvCell).join(",")).join("\r\n"),
      "text/csv;charset=utf-8");
  }

  function exportSchedule() {
    if (!generated || stale) throw new Error("Generate an up-to-date schedule first.");
    const rows = [[
      "SKU", "Description", "Location", "ABC Class", "Risk Level",
      "Due Date", "Initial Count", "Scheduled Date", "Delay Days",
      "Status", "Completion Date"
    ]];

    visits.forEach(v => rows.push([
      v.item.sku, v.item.description, v.item.location, v.item.abc,
      v.item.risk, v.due, v.initial ? "Yes" : "No", v.scheduled,
      delay(v), status(v), v.completed
    ]));

    downloadCsv("dixani-cycle-count-schedule.csv", rows);
    message("Full schedule exported, including rows hidden by filters.");
  }

  function snapshot() {
    return {
      version: 1,
      savedAt: new Date().toISOString(),
      items: validateItems(items),
      settings: validateSettings(readSettings()),
      history
    };
  }

  function restore(data) {
    if (!data || data.version !== 1 || !Array.isArray(data.history)) {
      throw new Error("This is not a supported DIXANI planner backup.");
    }

    const nextItems = validateItems(data.items);
    const settings = validateSettings(data.settings);
    if (data.history.length > 50000) throw new Error("Backup history is too large.");

    const seen = new Set();
    const nextHistory = data.history.map(record => {
      if (!record || typeof record !== "object") throw new Error("Invalid completion record.");
      const item = validateItems([record.item])[0];

      if (!Number.isFinite(dateNumber(record.completed)) ||
          record.completed > today() ||
          !Number.isFinite(dateNumber(record.due)) ||
          (record.scheduled && !Number.isFinite(dateNumber(record.scheduled)))) {
        throw new Error("The backup contains an invalid completion date or visit date.");
      }

      const identity = keyOf(item) + "|" + record.completed;
      if (seen.has(identity)) throw new Error("The backup contains duplicate completions.");
      seen.add(identity);

      return {
        item,
        due: record.due,
        scheduled: record.scheduled || "",
        completed: record.completed,
        initial: record.initial === true,
        previous: record.previous || ""
      };
    });

    if ((items.length || history.length) &&
        !confirm("Replace the current workspace with this saved copy?")) return;

    items = nextItems;
    history = nextHistory;
    applySettings(settings);
    resetPlan();
    renderInventory();
    message("Saved inventory, settings and completion history restored. Generate the schedule to refresh dates.");
  }

  async function readFile(input, handler) {
    const file = input.files[0];
    if (!file) return;
    try {
      if (file.size > 10 * 1024 * 1024) throw new Error("Use a file smaller than 10 MB.");
      handler(await file.text());
    } catch (error) {
      message(error.message, "error");
    } finally {
      input.value = "";
    }
  }

  $("inventoryBody").addEventListener("input", event => {
    const field = event.target.dataset.field;
    if (!field) return;
    items[Number(event.target.dataset.index)][field] = event.target.value;
    markStale();
  });

  $("inventoryBody").addEventListener("change", event => {
    const field = event.target.dataset.field;
    if (!field) return;
    items[Number(event.target.dataset.index)][field] = event.target.value;
    markStale();
  });

  $("inventoryBody").addEventListener("click", event => {
    const button = event.target.closest("[data-remove]");
    if (!button) return;
    const index = Number(button.dataset.remove);
    if (!confirm("Remove this inventory task? Completed history is retained.")) return;
    items.splice(index, 1);
    markStale();
    renderInventory();
  });

  $("addItem").addEventListener("click", () => {
    if (items.length >= 5000) return message("Maximum 5,000 inventory tasks.", "error");
    items.push({
      sku: "", description: "", location: "", abc: "A",
      lastCountDate: "", risk: "", interval: ""
    });
    $("inventorySearch").value = "";
    markStale();
    renderInventory();
  });

  $("loadSample").addEventListener("click", () => {
    const base = dateNumber(today());
    replaceInventory([
      {
        sku: "A-1001", description: "Industrial bearing", location: "A-01",
        abc: "A", lastCountDate: dateText(base - 45), risk: "High", interval: ""
      },
      {
        sku: "A-2040", description: "Hydraulic seal kit", location: "A-03",
        abc: "A", lastCountDate: dateText(base - 20), risk: "Medium", interval: ""
      },
      {
        sku: "B-1108", description: "Packing tape", location: "B-08",
        abc: "B", lastCountDate: dateText(base - 100), risk: "High", interval: ""
      },
      {
        sku: "C-4012", description: "Control module", location: "C-02",
        abc: "C", lastCountDate: "", risk: "Critical", interval: "30"
      },
      {
        sku: "B-3105", description: "Safety gloves", location: "B-05",
        abc: "B", lastCountDate: dateText(base - 65), risk: "Low", interval: ""
      }
    ]);
  });

  $("downloadTemplate").addEventListener("click", () => {
    downloadCsv("dixani-cycle-count-template.csv", [
      ["SKU", "Description", "Location", "ABC Class", "Last Count Date", "Risk Level", "Interval Days"],
      ["ITEM-001", "Example item", "A-01", "A", "", "High", ""]
    ]);
  });

  $("csvFile").addEventListener("change", event => readFile(event.target, importText));
  $("importPaste").addEventListener("click", () => attempt(() => importText($("pasteData").value)));
  $("inventorySearch").addEventListener("input", renderInventory);

  [
    "planStart", "planDays", "dailyCapacity",
    "intervalA", "intervalB", "intervalC", "excludedDates"
  ].forEach(id => {
    $(id).addEventListener("input", markStale);
    $(id).addEventListener("change", markStale);
  });
  document.querySelectorAll('[name="workingDay"]').forEach(el => {
    el.addEventListener("change", markStale);
  });

  $("generatePlan").addEventListener("click", () => attempt(generate));
  ["scheduleSearch", "statusFilter", "abcFilter"].forEach(id => {
    $(id).addEventListener(id === "scheduleSearch" ? "input" : "change", () => {
      if (generated) renderPlan();
    });
  });

  $("scheduleBody").addEventListener("click", event => {
    const button = event.target.closest("[data-complete]");
    if (button) attempt(() => complete(Number(button.dataset.complete)));
  });

  $("exportSchedule").addEventListener("click", () => attempt(exportSchedule));

  $("printSchedule").addEventListener("click", () => attempt(() => {
    if (!generated || stale) throw new Error("Regenerate the schedule before printing.");
    $("scheduleSearch").value = "";
    $("statusFilter").value = "all";
    $("abcFilter").value = "all";
    renderPlan();
    window.print();
  }));

  $("saveLocal").addEventListener("click", () => attempt(() => {
    localStorage.setItem(SAVE_KEY, JSON.stringify(snapshot()));
    $("storageStatus").textContent = "Saved on this browser and device. Later changes require another save.";
    message("Workspace saved on this device.");
  }));

  $("loadLocal").addEventListener("click", () => attempt(() => {
    const text = localStorage.getItem(SAVE_KEY);
    if (!text) throw new Error("No saved planner workspace was found in this browser.");
    restore(JSON.parse(text));
  }));

  $("downloadBackup").addEventListener("click", () => attempt(() => {
    download("dixani-cycle-count-backup.json",
      JSON.stringify(snapshot(), null, 2), "application/json");
    message("Backup downloaded with inventory, settings and completion history.");
  }));

  $("restoreBackup").addEventListener("change", event => {
    readFile(event.target, text => restore(JSON.parse(text)));
  });

  $("deleteLocal").addEventListener("click", () => attempt(() => {
    if (!confirm("Delete the saved planner copy from this browser? Current working data will remain.")) return;
    localStorage.removeItem(SAVE_KEY);
    $("storageStatus").textContent = "Device save deleted.";
  }));

  $("clearWorkspace").addEventListener("click", () => {
    if (!confirm("Clear current inventory, schedule and completion history? Download a backup first if needed.")) return;
    items = [];
    history = [];
    resetPlan();
    renderInventory();
    message("Workspace cleared. Any separately saved device copy remains available.");
  });

  $("planStart").value = today();
  resetPlan();
  renderInventory();
})();
