let transactions = [];
let categoryChart = null;

const addBtn = document.getElementById("addTransaction");
const amountInput = document.getElementById("amount");
const categorySelect = document.getElementById("category");
const categoryWrapper = document.getElementById("categoryWrapper");
const titleInput = document.getElementById("title");
const filterType = document.getElementById("filterType");

const totalBalance = document.getElementById("totalBalance");
const totalIncome = document.getElementById("totalIncome");
const totalExpense = document.getElementById("totalExpense");
const transactionsListEl = document.getElementById("transactions");

function switchTab(targetTab) {
  document
    .querySelectorAll(".tab")
    .forEach((t) => t.classList.remove("active"));
  document
    .querySelectorAll(".tab-content")
    .forEach((c) => c.classList.add("hidden"));

  targetTab.classList.add("active");
  const contentId = `${targetTab.dataset.tab}Tab`;
  document.getElementById(contentId).classList.remove("hidden");

  if (targetTab.dataset.tab === "charts") {
    updateCategoryChart();
  }
}

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => switchTab(tab));
});

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function getFormData() {
  const type = document.querySelector(
    'input[name="transactionType"]:checked'
  ).value;
  const amount = parseFloat(amountInput.value);
  const category = type === "income" ? "Income" : categorySelect.value;
  const title = titleInput.value.trim();
  return { type, amount, category, title };
}

function validateFormData({ type, amount, category, title }) {
  if (!amount || amount <= 0) return "Enter a valid amount > 0";
  if (type === "expense" && !category) return "Please select a category";
  if (!title || title.length > 30) return "Title must be 30 characters or less";
  return null;
}

function createTransaction({ type, amount, category, title }) {
  return {
    id: Date.now(),
    type,
    amount,
    category,
    title: title || category,
    date: new Date().toISOString(),
  };
}

function clearForm() {
  amountInput.value = "";
  categorySelect.value = "";
  titleInput.value = "";
}

function addTransaction() {
  const data = getFormData();
  const error = validateFormData(data);
  if (error) return alert(error);

  transactions.unshift(createTransaction(data));
  updateUI();
  clearForm();
}

addBtn.addEventListener("click", addTransaction);

document
  .querySelectorAll('input[name="transactionType"]')
  .forEach((radio) =>
    radio.addEventListener("change", (e) =>
      categoryWrapper.classList.toggle("hidden", e.target.value === "income")
    )
  );

function filterTransactions(type = "All") {
  return transactions.filter((t) => type === "All" || t.type === type);
}

function renderTransactions() {
  const selectedType = filterType.value;
  const filtered = filterTransactions(selectedType);

  if (filtered.length === 0) {
    transactionsListEl.innerHTML = `<li class="empty-state"><p>No transactions yet!</p></li>`;
    return;
  }

  transactionsListEl.innerHTML = filtered
    .map(
      (t) => `
    <li class="transaction-item">
      <div class="transaction-info">
        <strong>${t.title}</strong><br/>
        <small>${t.category}</small>
        <small class="transaction-date">• ${new Date(
          t.date
        ).toLocaleDateString()}</small>
      </div>
      <div class="transaction-amount ${t.type}">
        ${formatCurrency(t.amount)}
      </div>
    </li>
  `
    )
    .join("");
}

function updateUI() {
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  totalBalance.textContent = formatCurrency(income - expense);
  totalIncome.textContent = formatCurrency(income);
  totalExpense.textContent = formatCurrency(expense);

  renderTransactions();
  updateCategoryChart();
}

function updateCategoryChart() {
  const expenses = transactions.filter((t) => t.type === "expense");
  if (!expenses.length) return;

  const categoryData = {};
  expenses.forEach(
    (t) =>
      (categoryData[t.category] = (categoryData[t.category] || 0) + t.amount)
  );

  const ctx = document.getElementById("categoryChart").getContext("2d");
  if (categoryChart) categoryChart.destroy();

  categoryChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: Object.keys(categoryData),
      datasets: [
        {
          data: Object.values(categoryData),
          backgroundColor: [
            "#0ea5e9",
            "#8b5cf6",
            "#10b981",
            "#ef4444",
            "#f59e0b",
            "#ec4899",
          ],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: "right" } },
    },
  });
}

filterType.addEventListener("change", renderTransactions);

updateUI();
