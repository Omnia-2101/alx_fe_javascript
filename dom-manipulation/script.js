let quotes = JSON.parse(localStorage.getItem('quotes')) || [
  { text: "Believe in yourself.", category: "Motivation" },
  { text: "Code is like humor. When you have to explain it, it’s bad.", category: "Programming" }
];

document.getElementById("newQuote").addEventListener("click", displayRandomQuote);

function displayRandomQuote() {
  const category = localStorage.getItem("selectedCategory") || "all";
  const filteredQuotes = category === "all" ? quotes : quotes.filter(q => q.category === category);
  if (filteredQuotes.length === 0) {
    document.getElementById("quoteDisplay").innerHTML = "No quotes found for this category.";
    return;
  }
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  document.getElementById("quoteDisplay").innerHTML = filteredQuotes[randomIndex].text;
}

function addQuote() {
  const text = document.getElementById("newQuoteText").value;
  const category = document.getElementById("newQuoteCategory").value;
  if (!text || !category) return;
  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  displayRandomQuote();
}

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function populateCategories() {
  const select = document.getElementById("categoryFilter");
  const categories = [...new Set(quotes.map(q => q.category))];
  select.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });
  const savedCategory = localStorage.getItem("selectedCategory");
  if (savedCategory) select.value = savedCategory;
}

function filterQuotes() {
  const selected = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selected);
  displayRandomQuote();
}

function exportQuotes() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "quotes.json";
  link.click();
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (event) {
    const importedQuotes = JSON.parse(event.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    populateCategories();
    displayRandomQuote();
    alert('Quotes imported successfully!');
  };
  fileReader.readAsText(event.target.files[0]);
}

async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data = await response.json();
    const serverQuotes = data.slice(0, 5).map(post => ({
      text: post.title,
      category: "Server"
    }));
    quotes.push(...serverQuotes);
    saveQuotes();
    populateCategories();
    displayRandomQuote();
    showNotification("Quotes synced with server!");
  } catch (error) {
    console.error("Error fetching quotes:", error);
  }
}

function showNotification(message) {
  const note = document.getElementById("notification");
  note.textContent = message;
  setTimeout(() => (note.textContent = ""), 3000);
}

function syncQuotes() {
  fetchQuotesFromServer();
}

setInterval(syncQuotes, 15000);

populateCategories();
displayRandomQuote();
