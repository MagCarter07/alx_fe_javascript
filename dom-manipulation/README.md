Dynamic Quote Generator — Advanced DOM Manipulation

This project is part of the ALX Front-End JavaScript module, focusing on mastering DOM manipulation, interactive UI generation, and dynamic content handling using pure JavaScript.

The task requires building a web application that generates quotes dynamically based on user actions, while also allowing users to add new quotes and categories directly from the interface.

📌 Project Overview

The Dynamic Quote Generator is a simple but powerful web application that:

Displays a random quote from a selected category

Allows users to add new quotes dynamically

Updates the DOM in real time

Demonstrates advanced DOM manipulation techniques

Uses no frameworks — just HTML, CSS, and JavaScript

📁 Project Structure
alx_fe_javascript/
└── dom-manipulation/
├── index.html
├── script.js
└── README.md

✨ Features

1. Random Quote Display

Users can pick a category.

Clicking Show New Quote displays a random quote from that category.

If a category has no quotes yet, the UI responds appropriately.

2. Dynamic Category Handling

Categories are generated automatically based on the available quote data.

When a new quote is added, the category list updates instantly.

3. Add Quotes Dynamically

Users can create new content through a dynamic form:

Enter quote text

Enter category

Submit
When submitted:

The quote is added to the main dataset

The category dropdown updates instantly

No page reload required

4. Fully JavaScript-Driven UI

No HTML form is hard-coded.
The form is generated dynamically using JavaScript via document.createElement.

🛠️ Technologies Used

HTML5 — structure and markup

CSS3 — minimal styling

JavaScript (ES6+) — dynamic DOM creation, event handling, array manipulation

📌 How It Works
Main Functions
Function Purpose
showRandomQuote() Displays a random quote from the selected category
createAddQuoteForm() Dynamically generates the Add Quote form
addQuote() Pushes user input into the quotes dataset and updates UI
populateCategories() Refreshes the category dropdown when new categories appear
🚀 Getting Started

1. Clone the repository
   git clone https://github.com/<your-username>/alx_fe_javascript

2. Navigate to the project directory
   cd alx_fe_javascript/dom-manipulation

3. Open the project in a browser

Simply open:

index.html

Your Dynamic Quote Generator will run immediately.
