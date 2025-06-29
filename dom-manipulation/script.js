const quotes = [];

function loadQuotes() {
  const stored = localStorage.getItem("quotes");
  if (stored) {
    quotes.push(...JSON.parse(stored));
  }
}

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selectedCategory);
  let filtered = quotes;
  if (selectedCategory !== "all") {
    filtered = quotes.filter(q => q.category === selectedCategory);
  }
  const display = document.getElementById("quoteDisplay");
  if (filtered.length === 0) {
    display.innerHTML = "No quotes found.";
    return;
  }
  const quote = filtered[Math.floor(Math.random() * filtered.length)];
  display.innerHTML = `"${quote.text}" - ${quote.category}`;
  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  const select = document.getElementById("categoryFilter");
  select.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });
  const saved = localStorage.getItem("selectedCategory");
  if (saved) {
    select.value = saved;
    filterQuotes();
  }
}

function createAddQuoteForm() {
  const formContainer = document.getElementById("formContainer");
  const inputText = document.createElement("input");
  inputText.id = "newQuoteText";
  inputText.placeholder = "Enter a new quote";
  const inputCategory = document.createElement("input");
  inputCategory.id = "newQuoteCategory";
  inputCategory.placeholder = "Enter quote category";
  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.onclick = addQuote;
  formContainer.appendChild(inputText);
  formContainer.appendChild(inputCategory);
  formContainer.appendChild(addButton);
}

function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();
  if (text && category) {
    const newQuote = { text, category };
    quotes.push(newQuote);
    saveQuotes();
    postQuoteToServer(newQuote);
    populateCategories();
    filterQuotes();
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
  }
}

function exportQuotes() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        filterQuotes();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid file format.");
      }
    } catch {
      alert("Could not read JSON file.");
    }
  };
  reader.readAsText(event.target.files[0]);
}

async function fetchQuotesFromServer() {
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data = await res.json();
    return data.slice(0, 5).map(post => ({
      text: post.title,
      category: "Server"
    }));
  } catch {
    return [];
  }
}

async function postQuoteToServer(quote) {
  try {
    await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(quote)
    });
  } catch {
    console.warn("Could not post to server.");
  }
}

async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();
  const combined = [...serverQuotes, ...quotes];
  const unique = Array.from(new Map(combined.map(q => [q.text, q])).values());
  quotes.length = 0;
  quotes.push(...unique);
  saveQuotes();
  populateCategories();
  filterQuotes();
  const notif = document.createElement("div");
  notif.textContent = "Quotes synced with server.";
  notif.style.background = "#d4edda";
  notif.style.padding = "10px";
  notif.style.marginTop = "10px";
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 3000);
}

setInterval(syncQuotes, 30000); 

document.getElementById("newQuote").addEventListener("click", filterQuotes);
loadQuotes();
createAddQuoteForm();
populateCategories();
const last = sessionStorage.getItem("lastQuote");
if (last) {
  const quote = JSON.parse(last);
  document.getElementById("quoteDisplay").innerHTML = `"${quote.text}" - ${quote.category}`;
}
