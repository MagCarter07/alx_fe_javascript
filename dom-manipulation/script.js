// ======================================
// INITIAL DATA
// ======================================
let quotes = [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
  { text: "Do one thing every day that scares you.", category: "Life" },
  { text: "Success is not final, failure is not fatal.", category: "Success" }
];

// ======================================
// DOM ELEMENTS
// ======================================
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categorySelect = document.getElementById("categorySelect");
const formContainer = document.getElementById("formContainer");

// ======================================
// INITIALIZATION
// ======================================
populateCategories();
createAddQuoteForm();

// ======================================
// FUNCTION: Show Random Quote
// ======================================
function showRandomQuote() {
  const selectedCategory = categorySelect.value;

  const filteredQuotes = quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available in this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  quoteDisplay.textContent = filteredQuotes[randomIndex].text;
}

newQuoteBtn.addEventListener("click", showRandomQuote);

// ======================================
// FUNCTION: Populate Category Dropdown
// ======================================
function populateCategories() {
  // Clear old options
  categorySelect.innerHTML = "";

  const uniqueCategories = [...new Set(quotes.map(q => q.category))];

  uniqueCategories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });
}

// ======================================
// FUNCTION: Create the Add Quote Form
// ======================================
function createAddQuoteForm() {
  const formWrapper = document.createElement("div");
  formWrapper.className = "form-section";

  const title = document.createElement("h3");
  title.textContent = "Add a New Quote";

  const quoteInput = document.createElement("input");
  quoteInput.type = "text";
  quoteInput.id = "newQuoteText";
  quoteInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.type = "text";
  categoryInput.id = "newQuoteCategory";
  categoryInput.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.onclick = addQuote;

  formWrapper.append(title, quoteInput, categoryInput, addButton);
  formContainer.appendChild(formWrapper);
}

// ======================================
// FUNCTION: Add User Quote
// ======================================
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (text === "" || category === "") {
    alert("Please fill in both fields.");
    return;
  }

  const newQuote = { text, category };
  quotes.push(newQuote);

  populateCategories();
  
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  alert("Quote added successfully!");
}
