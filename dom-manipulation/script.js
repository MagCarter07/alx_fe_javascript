/* Dynamic Quote Generator — Local Storage + JSON Import/Export + Category Filtering
   (Only updated where necessary — full structure preserved)
*/

// Local storage keys
const STORAGE_KEY = "dqg_quotes_v1";
const SESSION_LAST_KEY = "dqg_lastQuote_v1";
const FILTER_KEY = "dqg_lastFilter_v1";

const defaultQuotes = [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
  { text: "Do one thing every day that scares you.", category: "Life" },
  { text: "Success is not final, failure is not fatal.", category: "Success" }
];

// DOM elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const showLastBtn = document.getElementById("showLast");
const categorySelect = document.getElementById("categorySelect");
const formContainer = document.getElementById("formContainer");
const exportBtn = document.getElementById("exportBtn");
const importFile = document.getElementById("importFile");
const importModeSelect = document.getElementById("importMode");

// NEW (Filtering)
const categoryFilter = document.getElementById("categoryFilter");

let quotes = [];


// ==========================
// INITIALIZATION
// ==========================
init();

function init() {
  loadQuotesFromStorage();
  populateCategories();         // existing dropdown for generator
  populateCategoriesFilter();   // NEW — filter dropdown
  loadSavedFilter();            // NEW — restore last selected filter
  createAddQuoteForm();
  bindEvents();

  const last = sessionStorage.getItem(SESSION_LAST_KEY);
  if (last) {
    quoteDisplay.textContent = "You have a last viewed quote in this session. Click 'Show Last Viewed (session)'.";
  } else {
    showRandomQuote();
  }
}


// ==========================
// STORAGE HELPERS
// ==========================
function saveQuotesToLocalStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
  } catch (e) {
    console.error("Failed to save to localStorage:", e);
    alert("Could not save quotes to localStorage.");
  }
}

function loadQuotesFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      quotes = [...defaultQuotes];
      saveQuotesToLocalStorage();
    } else {
      const parsed = JSON.parse(raw);
      if (isValidQuotesArray(parsed)) {
        quotes = parsed;
      } else {
        quotes = [...defaultQuotes];
        saveQuotesToLocalStorage();
      }
    }
  } catch (e) {
    quotes = [...defaultQuotes];
  }
}


// ==========================
// VALIDATION
// ==========================
function isValidQuotesArray(arr) {
  if (!Array.isArray(arr)) return false;
  return arr.every(item =>
    item &&
    typeof item.text === "string" &&
    typeof item.category === "string"
  );
}


// ==========================
// EVENTS
// ==========================
function bindEvents() {
  newQuoteBtn.addEventListener("click", showRandomQuote);
  showLastBtn.addEventListener("click", showLastViewedQuote);
  exportBtn.addEventListener("click", exportQuotesToJson);
  importFile.addEventListener("change", importFromJsonFile);

  // NEW FILTER EVENT
  categoryFilter.addEventListener("change", filterQuotes);
}


// ==========================
// RANDOM QUOTE (UNCHANGED)
// ==========================
function showRandomQuote() {
  const selectedCategory = categorySelect.value;
  const filtered = quotes.filter(q => q.category === selectedCategory);

  if (!filtered.length) {
    quoteDisplay.textContent = "No quotes available in this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filtered.length);
  const q = filtered[randomIndex];
  quoteDisplay.textContent = q.text;

  try {
    sessionStorage.setItem(SESSION_LAST_KEY, JSON.stringify(q));
  } catch (e) {
    console.warn("Failed to save session data:", e);
  }
}


// ==========================
// SHOW LAST VIEWED
// ==========================
function showLastViewedQuote() {
  const raw = sessionStorage.getItem(SESSION_LAST_KEY);
  if (!raw) {
    quoteDisplay.textContent = "No last viewed quote in this session.";
    return;
  }
  try {
    const q = JSON.parse(raw);
    quoteDisplay.textContent = q.text;

    if (q.category) categorySelect.value = q.category;

  } catch (e) {
    quoteDisplay.textContent = "Session quote data invalid.";
  }
}


// ==========================
// CATEGORY POPULATION (EXISTING)
// ==========================
function populateCategories() {
  const uniqueCategories = [...new Set(quotes.map(q => q.category))];

  const current = categorySelect.value;
  categorySelect.innerHTML = "";

  uniqueCategories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });

  if (current && [...categorySelect.options].some(o => o.value === current)) {
    categorySelect.value = current;
  }
}


// ==========================
// NEW — POPULATE FILTER DROPDOWN
// ==========================
function populateCategoriesFilter() {
  const unique = ["all", ...new Set(quotes.map(q => q.category))];

  const current = categoryFilter.value;

  categoryFilter.innerHTML = "";
  unique.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categoryFilter.appendChild(opt);
  });

  if (current && [...categoryFilter.options].some(o => o.value === current)) {
    categoryFilter.value = current;
  }
}


// ==========================
// NEW — FILTER QUOTES BY CATEGORY
// ==========================
function filterQuotes() {
  const selected = categoryFilter.value;

  // Save last selected filter
  localStorage.setItem(FILTER_KEY, selected);

  let list = quotes;

  if (selected !== "all") {
    list = quotes.filter(q => q.category === selected);
  }

  // Display filtered quotes
  quoteDisplay.textContent = list.length
    ? `Showing ${list.length} quotes in "${selected}" category`
    : "No quotes in this category.";
}


// ==========================
// NEW — RESTORE SAVED FILTER
// ==========================
function loadSavedFilter() {
  const saved = localStorage.getItem(FILTER_KEY);
  if (saved && categoryFilter.querySelector(`option[value="${saved}"]`)) {
    categoryFilter.value = saved;
    filterQuotes();
  }
}


// ==========================
// ADD QUOTE (UPDATED TO REFRESH FILTER LIST)
// ==========================
function addQuote() {
  const textEl = document.getElementById("newQuoteText");
  const catEl = document.getElementById("newQuoteCategory");

  const text = textEl.value.trim();
  const category = catEl.value.trim();

  if (!text || !category) {
    alert("Please fill in both the quote text and the category.");
    return;
  }

  const newQ = { text, category };
  quotes.push(newQ);
  saveQuotesToLocalStorage();

  // Update both dropdowns
  populateCategories();
  populateCategoriesFilter();

  textEl.value = "";
  catEl.value = "";

  alert("Quote added successfully!");
}


// ==========================
// EXPORT JSON (UNCHANGED)
// ==========================
function exportQuotesToJson() {
  const json = JSON.stringify(quotes, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  const filename = `dqg_quotes_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.json`;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}


// ==========================
// IMPORT JSON (UPDATED: refresh filters)
// ==========================
function importFromJsonFile(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const mode = importModeSelect.value || "merge";

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (!isValidQuotesArray(imported)) {
        alert("Invalid file format.");
        importFile.value = "";
        return;
      }

      if (mode === "replace") {
        quotes = [...imported];
      } else {
        const existingSet = new Set(quotes.map(q => q.text + "||" + q.category));
        imported.forEach(q => {
          const key = q.text + "||" + q.category;
          if (!existingSet.has(key)) quotes.push(q);
        });
      }

      saveQuotesToLocalStorage();
      populateCategories();
      populateCategoriesFilter();

      alert("Quotes imported successfully!");
      importFile.value = "";
    } catch (err) {
      alert("Failed to import JSON.");
      importFile.value = "";
    }
  };

  reader.readAsText(file);
}

// ======================================================
// SERVER SYNC + CONFLICT RESOLUTION SYSTEM
// ======================================================

// Mock server URL (JSONPlaceholder simulation)
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

// Local versioning
let lastServerSync = 0;

// --- Fetch quotes from server ---
async function fetchServerQuotes() {
  try {
    const res = await fetch(SERVER_URL);
    const data = await res.json();

    // Convert server format -> our format
    const serverQuotes = data.slice(0, 10).map(item => ({
      id: item.id,
      text: item.title,
      category: item.body || "General"
    }));

    return serverQuotes;
  } catch (err) {
    console.error("Server fetch failed:", err);
    notify("Failed to sync with server.", "error");
    return [];
  }
}

// --- Push new local quotes to server ---
async function pushNewQuotesToServer(newQuotes) {
  for (const q of newQuotes) {
    try {
      await fetch(SERVER_URL, {
        method: "POST",
        body: JSON.stringify({
          title: q.text,
          body: q.category
        }),
        headers: { "Content-Type": "application/json" }
      });
    } catch (err) {
      console.warn("Failed to upload quote:", q);
    }
  }
}


// ======================================================
// MAIN SYNC LOGIC
// ======================================================
async function syncWithServer() {
  notify("Syncing with server...");

  const serverQuotes = await fetchServerQuotes();
  if (!serverQuotes.length) return;

  const localSet = new Map(
    quotes.map(q => [q.text + "||" + q.category, q])
  );

  const serverSet = new Map(
    serverQuotes.map(q => [q.text + "||" + q.category, q])
  );

  const conflicts = [];
  const newFromServer = [];

  serverSet.forEach((value, key) => {
    if (!localSet.has(key)) {
      newFromServer.push(value);
    }
  });

  // Conflict: local quote changed but matches server on text but category changed
  quotes.forEach(localQ => {
    serverQuotes.forEach(serverQ => {
      if (localQ.text === serverQ.text && localQ.category !== serverQ.category) {
        conflicts.push({ local: localQ, server: serverQ });
      }
    });
  });

  // Apply server-precedence auto-resolution
  if (conflicts.length) {
    conflicts.forEach(conf => {
      const index = quotes.findIndex(q => q.text === conf.local.text);
      if (index !== -1) {
        quotes[index] = conf.server; // server wins
      }
    });
  }

  // Insert new server additions
  newFromServer.forEach(sq => quotes.push(sq));

  saveQuotesToLocalStorage();
  populateCategories();
  populateCategoriesFilter();

  notify(`Sync complete. New: ${newFromServer.length}, Conflicts resolved: ${conflicts.length}`);

  lastServerSync = Date.now();
}


// ======================================================
// PERIODIC SYNC (runs every 30 seconds)
// ======================================================
setInterval(syncWithServer, 30000);


// ======================================================
// NOTIFICATION SYSTEM
// ======================================================
function notify(message, type = "info") {
  let box = document.getElementById("notifyBox");

  if (!box) {
    box = document.createElement("div");
    box.id = "notifyBox";
    box.style.position = "fixed";
    box.style.bottom = "20px";
    box.style.right = "20px";
    box.style.padding = "12px 16px";
    box.style.borderRadius = "8px";
    box.style.background = "#333";
    box.style.color = "white";
    box.style.fontSize = "14px";
    box.style.zIndex = "9999";
    box.style.opacity = "0";
    box.style.transition = "opacity .3s";
    document.body.appendChild(box);
  }

  box.textContent = message;
  box.style.background = type === "error" ? "#c0392b" : "#27ae60";
  box.style.opacity = "1";

  setTimeout(() => box.style.opacity = "0", 3000);
}

