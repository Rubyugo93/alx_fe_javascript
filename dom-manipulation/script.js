// Array of quote objects with text and category properties
let quotes = [
    { text: "The journey of a thousand miles begins with one step.", category: "Motivation" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "Get busy living or get busy dying.", category: "Motivation" }
];

// Define API endpoint for simulated server interaction
const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts';

// Load quotes from local storage if available
function loadQuotes() {
    const storedQuotes = localStorage.getItem('quotes');
    if (storedQuotes) {
        quotes = JSON.parse(storedQuotes);
    }
}

// Save the current quotes array to local storage
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Display a notification to the user
function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '10px';
    notification.style.right = '10px';
    notification.style.backgroundColor = '#28a745';
    notification.style.color = '#fff';
    notification.style.padding = '10px';
    notification.style.borderRadius = '5px';
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000); // Remove notification after 3 seconds
}

// Populate the dropdown with unique categories
function populateCategories() {
    const categoryFilter = document.getElementById('categoryFilter');
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';

    const categories = Array.from(new Set(quotes.map(quote => quote.category)));
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });

    // Restore last selected category filter
    const lastSelectedCategory = localStorage.getItem('selectedCategory');
    if (lastSelectedCategory) {
        categoryFilter.value = lastSelectedCategory;
        filterQuotes();
    }
}

// Display quotes based on selected category
function filterQuotes() {
    const selectedCategory = document.getElementById('categoryFilter').value;
    localStorage.setItem('selectedCategory', selectedCategory);

    const filteredQuotes = selectedCategory === 'all'
        ? quotes
        : quotes.filter(quote => quote.category === selectedCategory);

    const quoteDisplay = document.getElementById('quoteDisplay');
    quoteDisplay.innerHTML = filteredQuotes.map(quote =>
        `<p><strong>${quote.category}:</strong> ${quote.text}</p>`
    ).join('');
}

// Show a random quote
function showRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const selectedQuote = quotes[randomIndex];
    const quoteDisplay = document.getElementById('quoteDisplay');
    quoteDisplay.innerHTML = `<p><strong>${selectedQuote.category}:</strong> ${selectedQuote.text}</p>`;
}

// Add a new quote and update categories
function addQuote() {
    const newQuoteText = document.getElementById('newQuoteText').value.trim();
    const newQuoteCategory = document.getElementById('newQuoteCategory').value.trim();

    if (newQuoteText && newQuoteCategory) {
        const newQuote = { text: newQuoteText, category: newQuoteCategory };
        quotes.push(newQuote); // Add new quote to array
        saveQuotes();          // Save updated array to local storage
        populateCategories();   // Update category filter dropdown
        alert('Quote added successfully!');
        
        // Clear input fields
        document.getElementById('newQuoteText').value = '';
        document.getElementById('newQuoteCategory').value = '';
    } else {
        alert('Please enter both a quote and a category.');
    }
}

// Fetch quotes from server
async function fetchQuotesFromServer() {
    try {
        const response = await fetch(SERVER_URL);
        const serverQuotes = await response.json();

        // Map server data to local format and replace local quotes if newer
        const mappedQuotes = serverQuotes.map(q => ({
            text: q.title,
            category: q.body
        }));

        resolveConflicts(mappedQuotes);
    } catch (error) {
        console.error('Error fetching quotes from server:', error);
    }
}

// Sync local quotes to server
async function syncQuotesToServer() {
    try {
        for (const quote of quotes) {
            await fetch(SERVER_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: quote.text,
                    body: quote.category
                })
            });
        }
        showNotification("Quotes synced with server!");
    } catch (error) {
        console.error('Error syncing quotes to server:', error);
    }
}

// Resolve conflicts based on server data taking precedence
function resolveConflicts(serverQuotes) {
    const localQuotes = quotes;
    let hasConflict = false;

    // Compare local and server quotes to detect conflicts
    serverQuotes.forEach(serverQuote => {
        const localQuote = localQuotes.find(q => q.text === serverQuote.text);
        
        if (!localQuote) {
            // New quote from server, add to local
            quotes.push(serverQuote);
            hasConflict = true;
        } else if (localQuote.category !== serverQuote.category) {
            // Conflict detected, server data takes precedence
            localQuote.category = serverQuote.category;
            hasConflict = true;
        }
    });

    if (hasConflict) {
        saveQuotes();
        showNotification('Conflicts were found and resolved with server data!');
    }
}

// Periodically sync data
setInterval(fetchQuotesFromServer, 60000); // Fetch every 60 seconds
setInterval(syncQuotesToServer, 120000);   // Sync to server every 120 seconds

// Initial setup on page load
loadQuotes();
populateCategories();
document.getElementById('newQuote').addEventListener('click', showRandomQuote);

