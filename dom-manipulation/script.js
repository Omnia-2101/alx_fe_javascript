let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The journey of a thousand miles begins with one step.", category: "Inspiration" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
];

const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categoryFilter = document.getElementById("categoryFilter");
const notification = document.getElementById("notification");

function showRandomQuote() {
  displayRandomQuote();
}

function displayRandomQuote() {
  const selectedCategory = categoryFilter?.value || "all";
  const filteredQuotes = selectedCategory === "all" ? quotes : quotes.filter(q => q.category === selectedCategory);
  const random = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[random];
  quoteDisplay.innerHTML = `<p>${quote.text}</p><small>${quote.category}</small>`;
  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();
  if (!text || !category) return alert("Please fill both fields.");

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  displayRandomQuote();
  populateCategories();
}

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function populateCategories() {
  const unique = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  unique.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categoryFilter.appendChild(opt);
  });
  categoryFilter.value = localStorage.getItem("selectedCategory") || "all";
}

function filterQuotes() {
  localStorage.setItem("selectedCategory", categoryFilter.value);
  displayRandomQuote();
}

function exportQuotes() {
  const blob = new Blob([JSON.stringify(quotes)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "quotes.json";
  link.click();
}

function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = function(e) {
    const imported = JSON.parse(e.target.result);
    quotes.push(...imported);
    saveQuotes();
    populateCategories();
    alert("Quotes imported successfully!");
  };
  reader.readAsText(event.target.files[0]);
}

async function fetchQuotesFromServer() {
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data = await res.json();
    const serverQuotes = data.slice(0, 5).map(post => ({ text: post.title, category: "Server" }));
    quotes = [...quotes, ...serverQuotes];
    saveQuotes();
    displayRandomQuote();
    showNotification("Quotes synced with server!");
  } catch (err) {
    console.error("Failed to fetch from server");
  }
}

async function syncQuotes() {
  try {
    await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(quotes)
    });
    fetchQuotesFromServer();
  } catch (err) {
    console.error("Sync failed", err);
  }
}

function showNotification(msg) {
  notification.textContent = msg;
  notification.style.display = "block";
  setTimeout(() => {
    notification.style.display = "none";
  }, 3000);
}

window.onload = () => {
  populateCategories();
  displayRandomQuote();
  if (sessionStorage.getItem("lastQuote")) {
    const last = JSON.parse(sessionStorage.getItem("lastQuote"));
    quoteDisplay.innerHTML = `<p>${last.text}</p><small>${last.category}</small>`;
  }
  setInterval(syncQuotes, 10000); // sync every 10 sec
};

newQuoteBtn.addEventListener("click", displayRandomQuote);
