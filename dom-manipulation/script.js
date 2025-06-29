let quotes = JSON.parse(localStorage.getItem('quotes')) || [
  { text: "Stay hungry, stay foolish.", category: "Motivation" },
  { text: "Code is like humor. When you have to explain it, it’s bad.", category: "Programming" }
];

function displayRandomQuote() {
  const category = document.getElementById('categoryFilter').value;
  const filtered = category === 'all' ? quotes : quotes.filter(q => q.category === category);
  if (filtered.length === 0) return;
  const random = filtered[Math.floor(Math.random() * filtered.length)];
  const container = document.getElementById('quoteDisplay');
  container.innerHTML = '';
  const p = document.createElement('p');
  p.textContent = random.text;
  container.appendChild(p);
}

function addQuote() {
  const text = document.getElementById('newQuoteText').value.trim();
  const category = document.getElementById('newQuoteCategory').value.trim();
  if (!text || !category) return;
  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  const p = document.createElement('p');
  p.textContent = newQuote.text;
  document.getElementById('quoteDisplay').appendChild(p);
  document.getElementById('newQuoteText').value = '';
  document.getElementById('newQuoteCategory').value = '';
}

function createAddQuoteForm() {
  document.getElementById('formContainer').innerHTML = `
    <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
    <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
    <button onclick="addQuote()">Add Quote</button>
  `;
}

function populateCategories() {
  const select = document.getElementById('categoryFilter');
  const categories = ['all', ...new Set(quotes.map(q => q.category))];
  select.innerHTML = categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
  const last = localStorage.getItem('lastSelectedCategory') || 'all';
  select.value = last;
}

function filterQuotes() {
  const category = document.getElementById('categoryFilter').value;
  localStorage.setItem('lastSelectedCategory', category);
  displayRandomQuote();
}

function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
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
  fileReader.onload = function(event) {
    const imported = JSON.parse(event.target.result);
    quotes.push(...imported);
    saveQuotes();
    populateCategories();
    alert('Quotes imported successfully!');
  };
  fileReader.readAsText(event.target.files[0]);
}

async function fetchQuotesFromServer() {
  try {
    const res = await fetch('https://jsonplaceholder.typicode.com/posts');
    const data = await res.json();
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
  const existingTexts = quotes.map(q => q.text);
  const newOnes = serverQuotes.filter(q => !existingTexts.includes(q.text));
  if (newOnes.length > 0) {
    quotes.push(...newOnes);
    saveQuotes();
    populateCategories();
    alert("Quotes synced with server!");
  }
}

document.getElementById('newQuote').addEventListener('click', displayRandomQuote);
setInterval(syncQuotes, 60000); // Sync every 60 seconds

createAddQuoteForm();
populateCategories();
displayRandomQuote();
