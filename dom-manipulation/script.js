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
