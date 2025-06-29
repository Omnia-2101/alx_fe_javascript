let quotes = [
  { text: "Stay curious.", category: "Motivation" },
  { text: "Learn from failure.", category: "Inspiration" }
];

function displayRandomQuote() {
  const random = quotes[Math.floor(Math.random() * quotes.length)];
  document.getElementById("quoteDisplay").innerText = `"${random.text}" - ${random.category}`;
}

function addQuote() {
  const text = document.getElementById("newQuoteText").value;
  const category = document.getElementById("newQuoteCategory").value;

  if (text && category) {
    quotes.push({ text, category });
    document.getElementById("newQuoteText").value = '';
    document.getElementById("newQuoteCategory").value = '';
    displayRandomQuote();
  }
}

document.getElementById("newQuote").addEventListener("click", displayRandomQuote);
