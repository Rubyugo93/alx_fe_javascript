// Initial Quotes Array
let quotes = [
    { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
    { text: "Life is 10% what happens to us and 90% how we react to it.", category: "Life" },
    { text: "Do what you can, with what you have, where you are.", category: "Inspiration" }
];

// Server URL for mock API (replace with actual API if available)
const serverUrl = 'https://jsonplaceholder.typicode.com/posts';

// Display a Random Quote
function showRandomQuote() {
    if (quotes.length === 0) {
        alert("No quotes available to display.");
        return;
    }
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    displayQuote(randomQuote);
    sessionStorage.setItem('lastViewedQuote', JSON.stringify(randomQuote)); // Save to session storage
}

// Add a New Quote
function addQuote() {
    const text = document.getElementById("newQuoteText").value.trim();
    const category = document.getElementById("newQuoteCategory").value.trim();
  
    if (text && category) {
        const newQuote = { text, category };
        quotes.push(newQuote);
        saveQuotes();         // Save to local storage
        populateCategories(); // Update categories dropdown
        resetInputFields();   // Clear input fields
        notifyUser("New quote added!");
        postQuoteToServer(newQuote); // Post to server
    } else {
        alert("Please enter both the quote text and category.");
    }
}

// Reset input fields
function resetInputFields() {
    document.getElementById("newQuoteText").value = '';
    document.getElementById("newQuoteCategory").value = '';
}

// Save Quotes to Local Storage
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Load Quotes from Local Storage
function loadQuotes() {
    const storedQuotes = localStorage.getItem('quotes');
    if (storedQuotes) quotes = JSON.parse(storedQuotes);
}

// Display Quote Helper
function displayQuote(quote) {
    const quoteDisplay = document.getElementById("quoteDisplay");
    quoteDisplay.innerHTML = `<p>"${quote.text}" - <em>${quote.category}</em></p>`;
}

// Export Quotes to JSON File
function exportToJsonFile() {
    const json = JSON.stringify(quotes, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes.json';
    a.click();
    
    URL.revokeObjectURL(url); // Clean up URL object
}

// Import Quotes from JSON File
function importFromJsonFile(event) {
    if (event.target.files.length === 0) return;

    const fileReader = new FileReader();
    fileReader.onload = event => {
        try {
            const importedQuotes = JSON.parse(event.target.result);
            if (Array.isArray(importedQuotes)) {
                quotes.push(...importedQuotes);
                saveQuotes();
                populateCategories();
                notifyUser('Quotes imported successfully!');
            } else {
                alert('Invalid JSON format. Please upload an array of quotes.');
            }
        } catch (error) {
            alert('Failed to import quotes: Invalid JSON file.');
            console.error('Import Error:', error);
        }
    };
    fileReader.readAsText(event.target.files[0]);
}

// Populate Categories Dropdown
function populateCategories() {
    const categories = [...new Set(quotes.map(quote => quote.category))];
    const categoryFilter = document.getElementById('categoryFilter');
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

// Filter Quotes by Category
function filterQuotes() {
    const selectedCategory = document.getElementById('categoryFilter').value;
    const filteredQuotes = selectedCategory === 'all' 
        ? quotes 
        : quotes.filter(quote => quote.category === selectedCategory);
    
    const quoteDisplay = document.getElementById("quoteDisplay");
    quoteDisplay.innerHTML = filteredQuotes.length
        ? filteredQuotes.map(quote => `<p>"${quote.text}" - <em>${quote.category}</em></p>`).join('')
        : "<p>No quotes found for this category.</p>";
    
    localStorage.setItem('selectedCategory', selectedCategory);
}

// Load Last Viewed Quote from Session Storage
function loadLastViewedQuote() {
    const lastQuote = sessionStorage.getItem('lastViewedQuote');
    if (lastQuote) displayQuote(JSON.parse(lastQuote));
}

// Notify User
function notifyUser(message) {
    const notificationArea = document.getElementById('notificationArea');
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;

    notificationArea.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
}

// Sync with Server: Fetch and Post Quotes
async function syncQuotes() {
    try {
        const response = await fetch(serverUrl);
        const data = await response.json();
        const serverQuotes = data.map(item => ({
            text: item.title,
            category: 'Server'
        }));
        resolveConflicts(serverQuotes);
    } catch (error) {
        console.error('Error fetching quotes from server:', error);
    }
}

async function postQuoteToServer(quote) {
    try {
        const response = await fetch(serverUrl, {
            method: 'POST',
            body: JSON.stringify(quote),
            headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        });
        const data = await response.json();
        console.log('Quote posted successfully:', data);
    } catch (error) {
        console.error('Error posting quote to server:', error);
    }
}

// Resolve Conflicts by Merging Local and Server Quotes
function resolveConflicts(serverQuotes) {
    quotes = mergeQuotes(quotes, serverQuotes);
    saveQuotes();
    populateCategories();
    filterQuotes();
    notifyUser('Data synced with server and conflicts resolved.');
}

function mergeQuotes(localQuotes, serverQuotes) {
    const merged = [...serverQuotes];
    localQuotes.forEach(localQuote => {
        if (!serverQuotes.some(serverQuote => serverQuote.text === localQuote.text)) {
            merged.push(localQuote);
        }
    });
    return merged;
}

// Initial Setup on Page Load
window.onload = function() {
    loadQuotes();
    loadLastViewedQuote();
    populateCategories();
    const selectedCategory = localStorage.getItem('selectedCategory') || 'all';
    document.getElementById('categoryFilter').value = selectedCategory;
    filterQuotes();
    syncQuotes();
};

// Event Listeners
document.getElementById('addQuoteBtn').addEventListener('click', addQuote);
document.getElementById('newQuote').addEventListener('click', showRandomQuote);
document.getElementById('exportBtn').addEventListener('click', exportToJsonFile);
document.getElementById('importFile').addEventListener('change', importFromJsonFile);
document.getElementById('categoryFilter').addEventListener('change', filterQuotes);

// Periodic Sync with Server (Every 10 Minutes)
setInterval(syncQuotes, 600000);
