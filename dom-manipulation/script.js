/* Dynamic Quote Generator — Local Storage + JSON Import/Export
   Key features added:
   - Save / load quotes to localStorage
   - Store last viewed quote in sessionStorage
   - Export quotes to JSON file
   - Import quotes from JSON file (merge or replace)
   - Validation for imported data
*/

// Local storage key
const STORAGE_KEY = "dqg_quotes_v1";
const SESSION_LAST_KEY = "dqg_lastQuote_v1";

// Default quotes (used only if localStorage empty)
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

let quotes = [];

// ---------- Initialization ----------
init();

function init() {
  loadQuotesFromStorage();
  populateCategories();
  createAddQuoteForm();
  bindEvents();
  // If there was a last-viewed quote in session, show a subtle hint
  const last = sessionStorage.getItem(SESSION_LAST_KEY);
  if (last) {
    quoteDisplay.textContent = "You have a last viewed quote in this session. Click 'Show Last Viewed (session)'.";
  } else {
    // show an initial random quote
    showRandomQuote();
  }
}

// ---------- Storage helpers ----------
function saveQuotesToLocalStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
  } catch (e) {
    console.error("Failed to save to localStorage:", e);
    alert("Could not save quotes to localStorage. Storage might be full or unavailable.");
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
        // If corrupted, reset to defaults
        console.warn("Stored quotes corrupted or invalid. Resetting to defaults.");
        quotes = [...defaultQuotes];
        saveQuotesToLocalStorage();
      }
    }
  } catch (e) {
    console.error("Error loading quotes from localStorage:", e);
    quotes = [...defaultQuotes];
  }
}

// ---------- Validation ----------
function isValidQuotesArray(arr) {
  if (!Array.isArray(arr)) return false;
  return arr.every(item => {
    return item && typeof item === "object"
      && typeof item.text === "string"
      && typeof item.category === "string";
  });
}

// ---------- Events ----------
function bindEvents() {
  newQuoteBtn.addEventListener("click", showRandomQuote);
  showLastBtn.addEventListener("click", showLastViewedQuote);
  exportBtn.addEventListener("click", exportQuotesToJson);
  importFile.addEventListener("change", importFromJsonFile);
}

// ---------- Quote display ----------
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

  // Save last viewed quote to session storage (temp)
  try {
    sessionStorage.setItem(SESSION_LAST_KEY, JSON.stringify(q));
  } catch (e) {
    // not critical; just continue
    console.warn("Failed to save session data:", e);
  }
}

function showLastViewedQuote() {
  const raw = sessionStorage.getItem(SESSION_LAST_KEY);
  if (!raw) {
    quoteDisplay.textContent = "No last viewed quote in this session.";
    return;
  }
  try {
    const q = JSON.parse(raw);
    if (q && q.text) {
      quoteDisplay.textContent = q.text;
      // also ensure the category select reflects the category of last viewed if present
      if (q.category && Array.from(categorySelect.options).some(o => o.value === q.category)) {
        categorySelect.value = q.category;
      }
    } else {
      quoteDisplay.textContent = "Session quote data is invalid.";
    }
  } catch (e) {
    quoteDisplay.textContent = "Failed to read session data.";
  }
}

// ---------- Categories ----------
function populateCategories() {
  const uniqueCategories = [...new Set(quotes.map(q => q.category))];
  // remember current selection
  const current = categorySelect.value;
  categorySelect.innerHTML = "";
  uniqueCategories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });
  // restore if still exists
  if (current && Array.from(categorySelect.options).some(o => o.value === current)) {
    categorySelect.value = current;
  }
}

// ---------- Dynamic Add Quote Form ----------
function createAddQuoteForm() {
  formContainer.innerHTML = ""; // fresh
  const formWrapper = document.createElement("div");
  formWrapper.className = "form-section";

  const title = document.createElement("h3");
  title.textContent = "Add a New Quote";

  const quoteInput = document.createElement("input");
  quoteInput.type = "text";
  quoteInput.id = "newQuoteText";
  quoteInput.placeholder = "Enter a new quote";
  quoteInput.setAttribute("aria-label", "New quote text");

  const categoryInput = document.createElement("input");
  categoryInput.type = "text";
  categoryInput.id = "newQuoteCategory";
  categoryInput.placeholder = "Enter quote category";
  categoryInput.setAttribute("aria-label", "New quote category");

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.type = "button";
  addButton.addEventListener("click", addQuote);

  formWrapper.append(title, quoteInput, categoryInput, addButton);
  formContainer.appendChild(formWrapper);
}

// ---------- Add Quote ----------
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
  populateCategories();

  textEl.value = "";
  catEl.value = "";

  alert("Quote added successfully!");
}

// ---------- JSON Export ----------
function exportQuotesToJson() {
  const json = JSON.stringify(quotes, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  const filename = `dqg_quotes_${new Date().toISOString().slice(0,19).replace(/[:T]/g, "-")}.json`;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ---------- JSON Import ----------
function importFromJsonFile(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const mode = importModeSelect.value || "merge"; // 'merge' or 'replace'

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (!isValidQuotesArray(imported)) {
        alert("Imported file is not valid. Expect an array of objects with 'text' and 'category' strings.");
        importFile.value = ""; // reset input
        return;
      }

      if (mode === "replace") {
        quotes = [...imported];
      } else { // merge
        // avoid duplicates: consider text+category pair uniqueness
        const existingSet = new Set(quotes.map(q => q.text + "||" + q.category));
        imported.forEach(q => {
          const key = q.text + "||" + q.category;
          if (!existingSet.has(key)) {
            quotes.push(q);
          }
        });
      }

      saveQuotesToLocalStorage();
      populateCategories();
      importFile.value = "";
      alert("Quotes imported successfully!");
    } catch (err) {
      console.error("Error parsing imported file:", err);
      alert("Failed to import JSON: file may be invalid.");
      importFile.value = "";
    }
  };

  reader.onerror = function () {
    alert("Failed to read the file.");
    importFile.value = "";
  };

  reader.readAsText(file);
}
