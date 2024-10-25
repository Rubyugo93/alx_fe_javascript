// script.js

// Initial quotes array
let quotes = JSON.parse(localStorage.getItem('quotes')) || [];

// Function to display a random quote
function displayRandomQuote() {
    if (quotes.length === 0) {
        document.getElementById('quoteDisplay').innerHTML = '<p>No quotes available. Please add some!</p>';
        return;
    }
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];
    document.getElementById('quoteDisplay').innerHTML = `<p>${randomQuote.text} - <em>${randomQuote.category}</em></p>`;
}

// Event listener for showing a new quote
document.getElementById('newQuote').addEventListener('click', displayRandomQuote);

// Function to add a new quote
function addQuote(text, category) {
    const newQuote = { text, category };
    quotes.push(newQuote);
    localStorage.setItem('quotes', JSON.stringify(quotes));
    displayRandomQuote();
    postQuoteToServer(newQuote); // Post to server
}

// Event listener for adding a new quote
document.getElementById('addQuoteBtn').addEventListener('click', () => {
    const quoteText = document.getElementById('newQuoteText').value;
    const quoteCategory = document.getElementById('newQuoteCategory').value;
    if (quoteText && quoteCategory) {
        addQuote(quoteText, quoteCategory);
        document.getElementById('newQuoteText').value = '';
        document.getElementById('newQuoteCategory').value = '';
    } else {
        alert('Please enter both quote text and category.');
    }
});

// Function to fetch quotes from the server
async function fetchQuotesFromServer() {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts'); // Use your actual API
        if (!response.ok) throw new Error('Network response was not ok');
        const quotesData = await response.json();
        // Transform fetched data to match your structure
        return quotesData.map(quote => ({ text: quote.title, category: 'general' })); // Adjust as needed
    } catch (error) {
        console.error('Failed to fetch quotes:', error);
        return [];
    }
}

// Function to post a new quote to the server
async function postQuoteToServer(newQuote) {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newQuote),
        });
        if (!response.ok) throw new Error('Network response was not ok');
        const savedQuote = await response.json();
        console.log('Quote posted to server:', savedQuote);
    } catch (error) {
        console.error('Failed to post quote:', error);
    }
}

// Function to sync quotes with the server
async function syncQuotes() {
    const serverQuotes = await fetchQuotesFromServer();
    if (serverQuotes.length > 0) {
        quotes = [...new Set([...quotes, ...serverQuotes.map(q => JSON.stringify(q))])].map(q => JSON.parse(q));
        localStorage.setItem('quotes', JSON.stringify(quotes));
        showNotification('Quotes updated from server!');
    }
}

// Function to show notifications
function showNotification(message) {
    const notificationArea = document.getElementById('notificationArea');
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notificationArea.appendChild(notification);
    setTimeout(() => {
        notificationArea.removeChild(notification);
    }, 3000);
}

// Initial loading and syncing quotes
window.onload = async () => {
    await syncQuotes();
    displayRandomQuote(); // Show a random quote on load
};

// Periodically sync quotes every 5 minutes
setInterval(syncQuotes, 300000); // 300000 milliseconds = 5 minutes

// Export quotes to JSON
document.getElementById('exportBtn').addEventListener('click', () => {
    const quotesBlob = new Blob([JSON.stringify(quotes)], { type: 'application/json' });
    const url = URL.createObjectURL(quotesBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes.json';
    a.click();
    URL.revokeObjectURL(url);
});

// Import quotes from JSON
document.getElementById('importFile').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const importedQuotes = JSON.parse(e.target.result);
            quotes = [...quotes, ...importedQuotes]; // Combine with existing quotes
            localStorage.setItem('quotes', JSON.stringify(quotes));
            showNotification('Quotes imported successfully!');
            displayRandomQuote(); // Show a random quote after import
        } catch (error) {
            console.error('Failed to import quotes:', error);
        }
    };
    reader.readAsText(file);
});



  
