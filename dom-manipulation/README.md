Dynamic Quote Generator — Advanced Version

An interactive, web-based quote management system featuring dynamic filtering, persistent storage, and simulated server synchronization with conflict resolution.

📌 Project Overview

This project transforms a basic quote generator into a full-featured, dynamic application.
It allows users to add quotes, filter them by category, and sync data with a simulated server, ensuring consistency across sessions.

The app demonstrates core frontend concepts including DOM manipulation, LocalStorage persistence, JSON structuring, asynchronous operations, and conflict resolution.

✨ Features

1. Dynamic Quote Display (Task 1 – Mandatory)

Displays stored quotes dynamically on load.

Allows adding new quotes from a form.

Instantly updates the DOM when quotes are added.

Persists all data using LocalStorage.

2. Dynamic Content Filtering System (Task 2 – Mandatory)

A dynamic filter dropdown populated from the quotes' categories.

Users can filter quotes by category in real time.

The last selected category is stored and restored from LocalStorage.

New categories update automatically.

3. Category Persistence & Enhanced Storage (Task 3 – Mandatory)

Every quote added updates both the visual list and stored data.

Category list remains accurate and up to date.

LocalStorage tracks:

Quotes

Categories

Selected filter

4. Server Sync & Conflict Resolution (Task 4 – Mandatory)

Simulated using JSONPlaceholder (or any mock REST API).

Includes:

Automatic periodic sync between the browser and server.

Conflict resolution (server-wins strategy).

UI notifications when sync or conflict resolution occurs.

Optional user-driven conflict handling.

📂 Project Structure
/Dynamic-Quote-Generator
│── index.html
│── styles.css
│── script.js
│── README.md

🛠️ Technologies Used

HTML5

CSS3

JavaScript (ES6+)

Web Storage API

Fetch API

JSONPlaceholder / Mock API

🚀 How It Works

1. Loading

Quotes are loaded from LocalStorage or seeded initially.

2. Adding Quotes

Users can submit:

Quote text

Author

Category

and the UI updates instantly.

3. Filtering

Categories populate automatically.

Filtering is instant and dynamic.

Filter preference is saved.

4. Syncing with Server

Every few seconds:

Local and server data are compared.

Conflicts resolved based on server precedence.

LocalStorage updates.

User notified of changes.

⚡ Core Functions

populateCategories()

filterQuotes()

addQuote()

syncWithServer()

resolveConflicts()

loadQuotesFromStorage()

📦 Installation & Setup
git clone https://github.com/your-username/Dynamic-Quote-Generator.git

Open index.html in your browser and you're good to go.

🧪 Testing

Make sure to test:

Adding quotes

Category updates

Filtering behavior

Storage persistence

Server sync and conflict management

Notifications

👩🏽‍💻 Author
Built by Magnus Afiawo

Frontend Developer • Sound Engineer • Geographer • Tech Learner (ALX)

Dedicated to building clean, functional and user-focused web applications.
