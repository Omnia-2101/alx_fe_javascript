const quotes = [
  { text: "The journey of a thousand miles begins with one step.", category: "Motivation" },
  { text: "Code is like humor. When you have to explain it, it’s bad.", category: "Programming" }
];

function loadQuotes() {
  const stored = localStorage.getItem("quotes");
  if (stored) {
    quotes.length = 0;
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
    quotes.push({ text, category });
    saveQuotes();
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
    populateCategories();
    filterQuotes();
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
  reader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        alert("Quotes imported successfully!");
        populateCategories();
        filterQuotes();
      } else {
        alert("Invalid format.");
      }
    } catch (error) {
      alert("Error parsing file.");
    }
  };
  reader.readAsText(event.target.files[0]);
}

function fetchQuotesFromServer() {
  return fetch("https://jsonplaceholder.typicode.com/posts")
    .then(response => response.json())
    .then(data => {
      return data.slice(0, 5).map(post => ({
        text: post.title,
        category: "Server"
      }));
    });
}

function syncWithServer() {
  fetchQuotesFromServer()
    .then(serverQuotes => {
      const combined = [...serverQuotes, ...quotes];
      const uniqueQuotes = Array.from(new Map(
        combined.map(q => [q.text, q])
      ).values());

      quotes.length = 0;
      quotes.push(...uniqueQuotes);
      saveQuotes();

      alert("Synced with server!");
      populateCategories();
      filterQuotes();
    })
    .catch(err => {
      console.error("Sync failed:", err);
      alert("Sync failed. Check your internet connection.");
    });
}

document.getElementById("newQuote").addEventListener("click", filterQuotes);
loadQuotes();
createAddQuoteForm();
populateCategories();

const last = sessionStorage.getItem("lastQuote");
if (last) {
  const quote = JSON.parse(last);
  document.getElementById("quoteDisplay").innerHTML = `"${quote.text}" - ${quote.category}`;
}
