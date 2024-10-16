

let quotes = [];


document.addEventListener('DOMContentLoaded', () => {
    loadQuotes();
    document.getElementById('newQuote').addEventListener('click', showRandomQuote);
    document.getElementById('addQuoteBtn').addEventListener('click', addQuote);
    document.getElementById('exportBtn').addEventListener('click', exportQuotesToJSON);
    document.getElementById('importFile').addEventListener('change', importFromJsonFile);
});


function loadQuotes() {
    const storedQuotes = JSON.parse(localStorage.getItem('quotes')) || [];
    quotes = storedQuotes; 
    if (quotes.length > 0) {
        showRandomQuote(); 
}


function showRandomQuote() {
    if (quotes.length === 0) {
        document.getElementById('quoteDisplay').innerText = "No quotes available!";
        return;
    }
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];
    document.getElementById('quoteDisplay').innerText = `"${randomQuote.text}" - ${randomQuote.category}`;

    
    sessionStorage.setItem('lastQuote', JSON.stringify(randomQuote));
}


function addQuote() {
    const quoteText = document.getElementById('newQuoteText').value;
    const quoteCategory = document.getElementById('newQuoteCategory').value;
    
    if (quoteText && quoteCategory) {
        const newQuote = { text: quoteText, category: quoteCategory };
        quotes.push(newQuote);
        saveQuotes(); 
        alert('Quote added successfully!');
        document.getElementById('newQuoteText').value = '';
        document.getElementById('newQuoteCategory').value = '';
    } else {
        alert('Please enter both a quote and a category.');
    }
}


function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}


function exportQuotesToJSON() {
    const dataStr = JSON.stringify(quotes, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes.json';
    a.click();
    URL.revokeObjectURL(url); 
}


function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        try {
            const importedQuotes = JSON.parse(event.target.result);
            if (Array.isArray(importedQuotes)) {
                quotes.push(...importedQuotes); 
                saveQuotes(); 
