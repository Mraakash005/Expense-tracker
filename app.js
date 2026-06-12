// Load expenses from localStorage or start empty
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

// Add button click
document.getElementById('add-btn').addEventListener('click', function () {

  const amount = document.getElementById('amount').value.trim();
  const note = document.getElementById('note').value.trim();
  const category = document.getElementById('category').value;
  const date = document.getElementById('date').value;

  // Basic validation
  if (!amount || amount <= 0) {
    alert('Please enter a valid amount.');
    return;
  }
  if (!category) {
    alert('Please select a category.');
    return;
  }
  if (!date) {
    alert('Please select a date.');
    return;
  }

  // Create expense object
  const expense = {
    id: Date.now(),
    amount: parseFloat(amount),
    note: note || 'No note',
    category: category,
    date: date
  };

  // Add to array and save
  expenses.push(expense);
  localStorage.setItem('expenses', JSON.stringify(expenses));

  // Clear form
  document.getElementById('amount').value = '';
  document.getElementById('note').value = '';
  document.getElementById('category').value = '';
  document.getElementById('date').value = '';

  // Refresh UI
  updateUI();
});

// Update the whole UI
function updateUI() {
  renderList();
  updateSummary();
  renderChart();
}

// Render expense list
function renderList() {
  const list = document.getElementById('expense-list');

  if (expenses.length === 0) {
    list.innerHTML = '<li class="empty-msg">No expenses yet. Add one above!</li>';
    return;
  }

  // Show newest first
  const sorted = [...expenses].reverse();

  list.innerHTML = sorted.map(exp => `
    <li class="expense-item">
      <div class="left">
        <span class="name">${exp.note}</span>
        <span class="meta">
          <span class="category-badge">${exp.category}</span>
          &nbsp;${formatDate(exp.date)}
        </span>
      </div>
      <div class="right">
        <span class="amount">₹${exp.amount.toFixed(2)}</span>
        <button class="delete-btn" onclick="deleteExpense(${exp.id})">✕</button>
      </div>
    </li>
  `).join('');
}

// Update summary cards
function updateSummary() {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  const now = new Date();
  const thisMonth = expenses
    .filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, e) => sum + e.amount, 0);

  document.getElementById('total-spent').textContent = '₹' + total.toFixed(2);
  document.getElementById('this-month').textContent = '₹' + thisMonth.toFixed(2);
  document.getElementById('total-entries').textContent = expenses.length;
}

// Delete an expense
function deleteExpense(id) {
  expenses = expenses.filter(e => e.id !== id);
  localStorage.setItem('expenses', JSON.stringify(expenses));
  updateUI();
}

// Format date nicely
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Chart
let chartInstance = null;

function renderChart() {
  const categories = ['Food', 'Transport', 'Shopping', 'Health', 'Education', 'Entertainment', 'Other'];
  const colors = ['#A8D672', '#F5C842', '#5EB8FF', '#FF6B4A', '#C084FC', '#FB923C', '#94A3B8'];

  const data = categories.map(cat =>
    expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0)
  );

  const hasData = data.some(d => d > 0);

  const ctx = document.getElementById('categoryChart').getContext('2d');

  if (chartInstance) chartInstance.destroy();

  if (!hasData) return;

  chartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: categories,
      datasets: [{
        data: data,
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            font: { family: 'DM Sans', size: 12 },
            padding: 16,
            usePointStyle: true
          }
        }
      }
    }
  });
}
// Export to CSV
document.getElementById('export-btn').addEventListener('click', function () {
  if (expenses.length === 0) {
    alert('No expenses to export!');
    return;
  }

  const headers = ['Note', 'Amount (₹)', 'Category', 'Date'];
  const rows = expenses.map(e => [
    e.note,
    e.amount.toFixed(2),
    e.category,
    formatDate(e.date)
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'expenses.csv';
  a.click();

  URL.revokeObjectURL(url);
});
updateUI();