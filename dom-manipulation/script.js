let quotes = [
  { text: "The journey of a thousand miles begins with one step.", category: "Motivation" },
  { text: "Code is like humor. When you have to explain it, it’s bad.", category: "Programming" }
];

function displayRandomQuote() {
  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  const display = document.getElementById("quoteDisplay");
  display.innerText = `"${quote.text}" - ${quote.category}`;
}

function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (text && category) {
    quotes.push({ text, category });
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
    displayRandomQuote(); // Use updated function name
  } else {
    alert("Please fill in both fields.");
  }
}

document.getElementById("newQuote").addEventListener("click", displayRandomQuote);
