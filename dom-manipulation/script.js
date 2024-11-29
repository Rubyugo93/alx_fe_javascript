const quotes = [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
  { text: "Life is 10% what happens to us and 90% how we react to it.", category: "Life" },
  { text: "Do what you can, with what you have, where you are.", category: "Inspiration" }
];

async function fetchQuotes() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts');
    const data = await response.json();
    quotes.push(...data.map(item => ({ text: item.title, category: 'Server' })));
  } catch (error) {
    console.error('Error fetching quotes:', error);
  }
}

function showRandomQuote() {
  if (quotes.length === 0) {
    notifyUser("No quotes available to display.");
    return;
  }
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  updateQuoteDisplay(quote);
}

function updateQuoteDisplay(quote) {
  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = `<p>"${quote.text}" - <em>${quote.category}</em></p>`;
  sessionStorage.setItem('lastViewedQuote', JSON.stringify(quote));
}

function addQuote() {
  const newQuoteText = document.getElementById("newQuoteText").value.trim();
  const newQuoteCategory = document.getElementById("newQuoteCategory").value.trim();
  
  if (validateNewQuote(newQuoteText, newQuoteCategory)) {
    const newQuote = { text: newQuoteText, category: newQuoteCategory };
    quotes.push(newQuote);
    saveQuotes();
    populateCategories();
    clearQuoteInputFields();
    notifyUser("New quote added!");
    postQuoteToServer(newQuote);
  }
}

function validateNewQuote(text, category) {
  if (!text || !category) {
    alert("Please enter both the quote text and category.");
    return false;
  }
  if (quotes.some(quote => quote.text === text)) {
    alert("This quote already exists. Please add a unique quote.");
    return false;
  }
  return true;
}

function clearQuoteInputFields() {
  document.getElementById("newQuoteText").value = '';
  document.getElementById("newQuoteCategory").value = '';
}

function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

function loadQuotes() {
  const storedQuotes = localStorage.getItem('quotes');
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  }
}

function exportToJsonFile() {
  const json = JSON.stringify(quotes, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
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
        quotes = [...quotes, ...importedQuotes.filter(quote => validateNewQuote(quote.text, quote.category))];
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
  if (event.target.files.length > 0) {
    fileReader.readAsText(event.target.files[0]);
  }
}

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

function filterQuotes() {
  const selectedCategory = document.getElementById('categoryFilter').value;
  const filteredQuotes = selectedCategory === 'all' 
      ? quotes 
      : quotes.filter(quote => quote.category === selectedCategory);

  displayFilteredQuotes(filteredQuotes);
  localStorage.setItem('selectedCategory', selectedCategory);
}

function displayFilteredQuotes(filteredQuotes) {
  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = '';

  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = "<p>No quotes found for this category.</p>";
    return;
  }

  filteredQuotes.forEach(quote => {
    quoteDisplay.innerHTML += `<p>"${quote.text}" - <em>${quote.category}</em></p>`;
  });
}

function loadSelectedCategory() {
  const selectedCategory = localStorage.getItem('selectedCategory') || 'all';
  document.getElementById('categoryFilter').value = selectedCategory;
  filterQuotes();
}

function loadLastViewedQuote() {
  const lastQuote = sessionStorage.getItem('lastViewedQuote');
  if (lastQuote) {
    const quote = JSON.parse(lastQuote);
    updateQuoteDisplay(quote);
  }
}

function notifyUser(message) {
  const notificationArea = document.getElementById('notificationArea');
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;

  notificationArea.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 5000);
}

async function fetchQuotesFromServer() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts');
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
    const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
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

function mergeQuotes(localQuotes, serverQuotes) {
  const merged = [...serverQuotes];

  localQuotes.forEach(localQuote => {
    if (!serverQuotes.some(serverQuote => serverQuote.text === localQuote.text)) {
      merged.push(localQuote);
    }
  });

  return merged;
}

function resolveConflicts(serverQuotes) {
  const localQuotes = [...quotes];
  const mergedQuotes = mergeQuotes(localQuotes, serverQuotes);

  if (mergedQuotes.length !== quotes.length) {
    quotes = mergedQuotes;
    saveQuotes();
    populateCategories();
    filterQuotes();
    notifyUser('Data synced with server and conflicts resolved.');
  }
}

function syncQuotes() {
  fetchQuotesFromServer();
}

function createAddQuoteForm() {
  const formContainer = document.createElement('div');
  formContainer.innerHTML = `
    <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
    <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
    <button onclick="addQuote()">Add Quote</button>
  `;
  document.body.appendChild(formContainer);
}

window.onload = function() {
  loadQuotes();
  loadLastViewedQuote();
  populateCategories();
  loadSelectedCategory();
  syncQuotes();
  setInterval(showRandomQuote, 10000); // Show a new random quote every 10 seconds
};

document.getElementById('addQuoteBtn').addEventListener('click', addQuote);
document.getElementById('newQuote').addEventListener('click', showRandomQuote);
document.getElementById('exportBtn').addEventListener('click', exportToJsonFile);
document.getElementById('importFileInput').addEventListener('change', importFromJsonFile);
document.getElementById('categoryFilter').addEventListener('change', filterQuotes);

    
