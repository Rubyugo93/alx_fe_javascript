
let quotes = [
    { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Inspiration" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "Do not take life too seriously. You will never get out of it alive.", category: "Humor" }
];


function showRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quoteDisplay = document.getElementById('quoteDisplay');
    quoteDisplay.innerHTML = `<p>${quotes[randomIndex].text}</p><p><strong>Category:</strong> ${quotes[randomIndex].category}</p>`;
}


document.getElementById('newQuote').addEventListener('click', showRandomQuote);


function addQuote() {
    const newQuoteText = document.getElementById('newQuoteText').value;
    const newQuoteCategory = document.getElementById('newQuoteCategory').value;

    if (newQuoteText && newQuoteCategory) {
        
        quotes.push({ text: newQuoteText, category: newQuoteCategory });

        
        document.getElementById('newQuoteText').value = '';
        document.getElementById('newQuoteCategory').value = '';

        
        alert('New quote added!');
    } else {
        alert('Please enter both a quote and a category.');
    }
}


document.addEventListener('DOMContentLoaded', showRandomQuote);
