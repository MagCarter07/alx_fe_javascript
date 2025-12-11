/* Dynamic Quote Generator — Full Version
   Features:
   - Save/load quotes to localStorage
   - Store last viewed quote in sessionStorage
   - Export/import JSON
   - Dynamic category filtering with filterQuote()
   - Save/restore last selected category
   - Sync with server and conflict resolution
   - POST new quotes to server
   - Notifications for sync, conflicts, and POST
*/

// Local storage keys
const STORAGE_KEY = "dqg_quotes_v1";
const SESSION_LAST_KEY = "dqg_lastQuote_v1";
const FILTER_KEY = "dqg_lastFilter_v1";

// Mock server URL
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

// Default quotes
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
const categoryFilter = document.getElementById("categoryFilter");

let quotes = [];

// ---------- Initialization ----------
init();

function init() {
  loadQuotesFromStorage();
  populateCategories();
  createAddQuoteForm();
  bindEvents();

  // Restore last selected category filter
  const savedFilter = localStorage.getItem(FILTER_KEY);
  if (savedFilter && categoryFilter) categoryFilter.value = savedFilter;

  // Show last viewed quote or random
  const last = sessionStorage.getItem(SESSION_LAST_KEY);
  if (last) {
    quoteDisplay.textContent = "You have a last viewed quote in this session. Click 'Show Last Viewed (session)'.";
  } else {
    showRandomQuote();
  }

  // Start periodic sync
  setInterval(syncQuotes, 30000);
}

// ---------- Storage helpers ----------
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
        console.warn("Stored quotes corrupted. Resetting to defaults.");
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
  return arr.every(item => item && typeof item === "object" && typeof item.text === "string" && typeof item.category === "string");
}

// ---------- Events ----------
function bindEvents() {
  newQuoteBtn.addEventListener("click", showRandomQuote);
  showLastBtn.addEventListener("click", showLastViewedQuote);
  exportBtn.addEventListener("click", exportQuotesToJson);
  importFile.addEventListener("change", importFromJsonFile);
  if (categoryFilter) categoryFilter.addEventListener("change", filterQuote);
}

// ---------- Quote display ----------
function showRandomQuote() {
  const selectedCategory = categorySelect.value;
  const filtered = quotes.filter(q => selectedCategory === "all" || q.category === selectedCategory);

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
  const current = categorySelect.value;
  categorySelect.innerHTML = "";
  uniqueCategories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });
  if (current && Array.from(categorySelect.options).some(o => o.value === current)) {
    categorySelect.value = current;
  }

  // Also populate filter dropdown
  if (categoryFilter) {
    const selected = categoryFilter.value;
    categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
    uniqueCategories.forEach(cat => {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat;
      categoryFilter.appendChild(opt);
    });
    if (selected && Array.from(categoryFilter.options).some(o => o.value === selected)) {
      categoryFilter.value = selected;
    }
  }
}

// ---------- Dynamic Add Quote Form ----------
function createAddQuoteForm() {
  formContainer.innerHTML = "";
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
async function addQuote() {
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

  // POST new quote to server
  try {
    const res = await fetch(SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newQ)
    });
    if (res.ok) notify("Quote posted to server successfully!");
    else notify("Failed to post quote to server.", "error");
  } catch (err) {
    console.error("POST request failed:", err);
    notify("Error posting quote to server.", "error");
  }
}

// ---------- JSON Export ----------
function exportQuotesToJson() {
  const json = JSON.stringify(quotes, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `dqg_quotes_${new Date().toISOString().slice(0,19).replace(/[:T]/g,"-")}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ---------- JSON Import ----------
function importFromJsonFile(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  const mode = importModeSelect.value || "merge";
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (!isValidQuotesArray(imported)) {
        alert("Imported file is invalid. Expect array of {text, category}.");
        importFile.value = "";
        return;
      }
      if (mode === "replace") quotes = [...imported];
      else {
        const existingSet = new Set(quotes.map(q => q.text + "||" + q.category));
        imported.forEach(q => {
          const key = q.text + "||" + q.category;
          if (!existingSet.has(key)) quotes.push(q);
        });
      }
      saveQuotesToLocalStorage();
      populateCategories();
      importFile.value = "";
      alert("Quotes imported successfully!");
    } catch (err) {
      console.error("Error parsing JSON:", err);
      alert("Failed to import JSON file.");
      importFile.value = "";
    }
  };
  reader.readAsText(file);
}

// ---------- Filter quotes ----------
function filterQuote() {
  if (!categoryFilter) return;
  const selectedCategory = categoryFilter.value;
  localStorage.setItem(FILTER_KEY, selectedCategory);

  const filtered = quotes.filter(q => selectedCategory === "all" || q.category === selectedCategory);
  if (!filtered.length) {
    quoteDisplay.textContent = "No quotes available in this category.";
    return;
  }

  quoteDisplay.textContent = filtered[0].text;

  try {
    sessionStorage.setItem(SESSION_LAST_KEY, JSON.stringify(filtered[0]));
  } catch (e) {
    console.warn("Failed to save session data for filtered quote:", e);
  }
}

// ---------- Server Sync ----------
async function fetchQuotesFromServer() {
  try {
    const res = await fetch(SERVER_URL);
    const data = await res.json();
    return data.slice(0, 10).map(item => ({ id: item.id, text: item.title, category: item.body || "General" }));
  } catch (err) {
    console.error("fetchQuotesFromServer failed:", err);
    notify("Failed to fetch quotes from server.", "error");
    return [];
  }
}

async function syncQuotes() {
  notify("Syncing with server...");
  const serverQuotes = await fetchQuotesFromServer();
  if (!serverQuotes.length) return;

  const localSet = new Map(quotes.map(q => [q.text + "||" + q.category, q]));
  const serverSet = new Map(serverQuotes.map(q => [q.text + "||" + q.category, q]));

  const conflicts = [];
  const newFromServer = [];

  serverSet.forEach((value, key) => {
    if (!localSet.has(key)) newFromServer.push(value);
  });

  quotes.forEach(localQ => {
    serverQuotes.forEach(serverQ => {
      if (localQ.text === serverQ.text && localQ.category !== serverQ.category) {
        conflicts.push({ local: localQ, server: serverQ });
      }
    });
  });

  conflicts.forEach(conf => {
    const index = quotes.findIndex(q => q.text === conf.local.text);
    if (index !== -1) quotes[index] = conf.server;
  });

  newFromServer.forEach(sq => quotes.push(sq));

  saveQuotesToLocalStorage();
  populateCategories();

  notify(`Quotes synced with server! New: ${newFromServer.length}, Conflicts resolved: ${conflicts.length}`);
}

// ---------- Notifications ----------
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
