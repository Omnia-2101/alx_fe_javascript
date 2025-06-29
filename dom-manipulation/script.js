let quotes = JSON.parse(localStorage.getItem('quotes')) || [
  { text: "Stay hungry, stay foolish.", category: "Motivation" },
  { text: "Code is like humor. When you have to explain it, it’s bad.", category: "Programming" }
];

function showRandomQuote() {
  const category = document.getElementById('categoryFilter').value;
  let filteredQuotes = category === 'all' ? quotes : quotes.filter(q => q.category === category);
  if (filteredQuotes.length === 0) return;
  const randomQuote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
  document.getElementById('quoteDisplay').innerHTML = '';
  const p = document.createElement('p');
  p.textContent = randomQuote.text;
  document.getElementById('quoteDisplay').appendChild(p);
}

function addQuote() {
  const textInput = document.getElementById('newQuoteText');
  const categoryInput = document.getElementById('newQuoteCategory');
  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (!text || !category) return;

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();

  const p = document.createElement('p');
  p.textContent = newQuote.text;
  document.getElementById('quoteDisplay').appendChild(p);

  textInput.value = '';
  categoryInput.value = '';
}

function createAddQuoteForm() {
  const formContainer = document.getElementById('formContainer');
  formContainer.innerHTML = `
    <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
    <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
    <button onclick="addQuote()">Add Quote</button>
  `;
}

function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

function populateCategories() {
  const filter = document.getElementById('categoryFilter');
  const categories = ['all', ...new Set(quotes.map(q => q.category))];
  filter.innerHTML = categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
  const lastSelected = localStorage.getItem('lastSelectedCategory') || 'all';
  filter.value = lastSelected;
}

function filterQuotes() {
  const selected = document.getElementById('categoryFilter').value;
  localStorage.setItem('lastSelectedCategory', selected);
  showRandomQuote();
}

function exportQuotes() {
  const blob = new Blob([JSON.stringify(quotes)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (event) {
    const importedQuotes = JSON.parse(event.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    populateCategories();
    alert('Quotes imported successfully!');
  };
  fileReader.readAsText(event.target.files[0]);
}

async function fetchQuotesFromServer() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts');
    const data = await response.json();
    return data.slice(0, 5).map(item => ({
      text: item.title,
      category: "Server"
    }));
  } catch {
    return [];
  }
}

async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();
  const localTexts = quotes.map(q => q.text);
  const newQuotes = serverQuotes.filter(q => !localTexts.includes(q.text));
  if (newQuotes.length > 0) {
    quotes.push(...newQuotes);
    saveQuotes();
    populateCategories();
    alert("Quotes synced with server!");
  }
}

document.getElementById('newQuote').addEventListener('click', showRandomQuote);

createAddQuoteForm();
populateCategories();
showRandomQuote();
