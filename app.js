/**
 * SplitMate Campus - Complete Modular ES6+ Application Logic
 * Handles state, localStorage persistence, bill-splitting math,
 * debt simplification (min-cash-flow), Chart.js rendering, and CSV exports.
 */

'use strict';

// ============================================================================
// CONSTANTS & INITIAL DATA SEED
// ============================================================================
const STORAGE_KEY = 'splitmate_campus_data_v1';

const CATEGORY_CONFIG = {
  'Food & Dining': {
    icon: 'fa-utensils',
    cssClass: 'cat-avatar-food',
    color: '#F59E0B'
  },
  'Rent & Utilities': {
    icon: 'fa-bolt',
    cssClass: 'cat-avatar-rent',
    color: '#8B5CF6'
  },
  'Travel & Cabs': {
    icon: 'fa-taxi',
    cssClass: 'cat-avatar-travel',
    color: '#0284C7'
  },
  'Books & Printouts': {
    icon: 'fa-book-open',
    cssClass: 'cat-avatar-books',
    color: '#10B981'
  },
  'Entertainment': {
    icon: 'fa-film',
    cssClass: 'cat-avatar-entertainment',
    color: '#EC4899'
  },
  'Settlement': {
    icon: 'fa-handshake',
    cssClass: 'cat-avatar-default',
    color: '#64748B'
  }
};

const DEFAULT_SEEDS = {
  activeGroupId: 'group_hostel_204',
  groups: [
    {
      id: 'group_hostel_204',
      name: 'Hostel Room 204',
      description: 'Shared living, canteen dinners, cabs & campus bills',
      category: 'Student Living',
      budget: 10000,
      members: ['You', 'Aarav', 'Rohan', 'Kabir'],
      expenses: [
        {
          id: 'exp_1',
          title: 'Late Night Canteen & Pizza Feast',
          amount: 1400,
          category: 'Food & Dining',
          paidBy: 'You',
          date: '2026-11-10',
          splitMode: 'equal',
          shares: {
            'You': 350,
            'Aarav': 350,
            'Rohan': 350,
            'Kabir': 350
          }
        },
        {
          id: 'exp_2',
          title: 'Auto Rickshaw to Station',
          amount: 240,
          category: 'Travel & Cabs',
          paidBy: 'Aarav',
          date: '2026-11-09',
          splitMode: 'equal',
          shares: {
            'Aarav': 80,
            'You': 80,
            'Kabir': 80
          }
        },
        {
          id: 'exp_3',
          title: 'Lab Manual Printing & Spiral Binding',
          amount: 480,
          category: 'Books & Printouts',
          paidBy: 'Rohan',
          date: '2026-11-08',
          splitMode: 'exact',
          shares: {
            'You': 160,
            'Rohan': 160,
            'Kabir': 160
          }
        },
        {
          id: 'exp_4',
          title: 'Shared Wi-Fi 300Mbps Recharge',
          amount: 999,
          category: 'Rent & Utilities',
          paidBy: 'You',
          date: '2026-11-05',
          splitMode: 'percentage',
          percentages: {
            'You': 25,
            'Aarav': 25,
            'Rohan': 25,
            'Kabir': 25
          },
          shares: {
            'You': 249.75,
            'Aarav': 249.75,
            'Rohan': 249.75,
            'Kabir': 249.75
          }
        },
        {
          id: 'exp_5',
          title: 'Room Cleaning Supplies & Groceries',
          amount: 650,
          category: 'Rent & Utilities',
          paidBy: 'Kabir',
          date: '2026-11-04',
          splitMode: 'equal',
          shares: {
            'You': 162.5,
            'Aarav': 162.5,
            'Rohan': 162.5,
            'Kabir': 162.5
          }
        },
        {
          id: 'exp_6',
          title: 'Weekend Movie Tickets (PVR)',
          amount: 1200,
          category: 'Entertainment',
          paidBy: 'Aarav',
          date: '2026-11-02',
          splitMode: 'exact',
          shares: {
            'Aarav': 300,
            'You': 300,
            'Rohan': 300,
            'Kabir': 300
          }
        }
      ]
    },
    {
      id: 'group_manali_trip',
      name: 'Weekend Trip - Manali',
      description: 'Mountain road trip, homestay & cafe hopping',
      category: 'Travel & Trips',
      budget: 25000,
      members: ['You', 'Aarav', 'Pooja', 'Vikram'],
      expenses: [
        {
          id: 'exp_trip_1',
          title: 'Highway Tolls & Fuel',
          amount: 3200,
          category: 'Travel & Cabs',
          paidBy: 'Vikram',
          date: '2026-11-01',
          splitMode: 'equal',
          shares: { 'You': 800, 'Aarav': 800, 'Pooja': 800, 'Vikram': 800 }
        },
        {
          id: 'exp_trip_2',
          title: 'Old Manali Cafe Brunch',
          amount: 1850,
          category: 'Food & Dining',
          paidBy: 'You',
          date: '2026-11-02',
          splitMode: 'equal',
          shares: { 'You': 462.5, 'Aarav': 462.5, 'Pooja': 462.5, 'Vikram': 462.5 }
        }
      ]
    },
    {
      id: 'group_project_apollo',
      name: 'Project Team Apollo',
      description: 'Smart campus IoT project expenses & snacks',
      category: 'Academic Project',
      budget: 5000,
      members: ['You', 'Rohan', 'Neha'],
      expenses: [
        {
          id: 'exp_proj_1',
          title: 'ESP32 Microcontrollers & Sensors',
          amount: 1450,
          category: 'Books & Printouts',
          paidBy: 'Neha',
          date: '2026-11-03',
          splitMode: 'equal',
          shares: { 'You': 483.33, 'Rohan': 483.33, 'Neha': 483.34 }
        }
      ]
    }
  ]
};

// ============================================================================
// APPLICATION STATE
// ============================================================================
let appState = {
  activeGroupId: 'group_hostel_204',
  groups: [],
  filters: {
    category: 'all',
    searchQuery: '',
    sortBy: 'newest'
  },
  modalSplitMode: 'equal', // 'equal' | 'exact' | 'percentage'
  categoryChartInstance: null
};

// ============================================================================
// LOCAL STORAGE & INITIALIZATION
// ============================================================================
function loadStateFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.groups && parsed.groups.length > 0) {
        appState.groups = parsed.groups;
        appState.activeGroupId = parsed.activeGroupId || parsed.groups[0].id;
        return;
      }
    }
  } catch (err) {
    console.error('Error loading state from localStorage:', err);
  }
  // Fallback to default seed data
  resetStateToDemoData(false);
}

function saveStateToStorage() {
  try {
    const dataToSave = {
      activeGroupId: appState.activeGroupId,
      groups: appState.groups
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  } catch (err) {
    console.error('Error saving state to localStorage:', err);
    showToast('Failed to persist to localStorage', 'error');
  }
}

function resetStateToDemoData(showUserToast = true) {
  appState.groups = JSON.parse(JSON.stringify(DEFAULT_SEEDS.groups));
  appState.activeGroupId = DEFAULT_SEEDS.activeGroupId;
  saveStateToStorage();
  if (showUserToast) {
    showToast('Demo student expenses restored!', 'normal');
  }
  renderAll();
}

function getActiveGroup() {
  return appState.groups.find(g => g.id === appState.activeGroupId) || appState.groups[0];
}

// ============================================================================
// MATH & DEBT SIMPLIFICATION ALGORITHM
// ============================================================================

/**
 * Calculates net balance for every member in the group.
 * Net balance = (Total money paid by person) - (Total share assigned to person)
 * A positive net balance means the person is owed money (creditor).
 * A negative net balance means the person owes money (debtor).
 */
function calculateGroupBalances(group) {
  const balances = {};
  
  // Initialize balances for all group members
  group.members.forEach(member => {
    balances[member] = 0;
  });

  group.expenses.forEach(exp => {
    const amount = Number(exp.amount) || 0;
    const paidBy = exp.paidBy;

    // Credit payer
    if (balances[paidBy] !== undefined) {
      balances[paidBy] += amount;
    } else {
      balances[paidBy] = amount;
    }

    // Debit shares
    if (exp.shares) {
      Object.entries(exp.shares).forEach(([member, share]) => {
        const shareNum = Number(share) || 0;
        if (balances[member] !== undefined) {
          balances[member] -= shareNum;
        } else {
          balances[member] = -shareNum;
        }
      });
    }
  });

  return balances;
}

/**
 * Debt Simplification Algorithm (Min-Cash-Flow Greedy Approach)
 * Simplifies a web of multiple bilateral debts into the minimum number
 * of transfers required to clear all balances.
 */
function simplifyDebts(balances) {
  // Separate into debtors (<0) and creditors (>0)
  const debtors = [];
  const creditors = [];

  Object.entries(balances).forEach(([person, netBalance]) => {
    // Round to 2 decimal places to avoid floating point issues
    const rounded = Math.round(netBalance * 100) / 100;
    if (rounded < -0.01) {
      debtors.push({ person, amount: Math.abs(rounded) });
    } else if (rounded > 0.01) {
      creditors.push({ person, amount: rounded });
    }
  });

  // Sort descending by amount for efficient matching
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const transactions = [];
  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];

    const transferAmount = Math.min(debtor.amount, creditor.amount);

    if (transferAmount > 0.01) {
      transactions.push({
        from: debtor.person,
        to: creditor.person,
        amount: Math.round(transferAmount * 100) / 100
      });
    }

    debtor.amount = Math.round((debtor.amount - transferAmount) * 100) / 100;
    creditor.amount = Math.round((creditor.amount - transferAmount) * 100) / 100;

    if (debtor.amount <= 0.01) {
      dIdx++;
    }
    if (creditor.amount <= 0.01) {
      cIdx++;
    }
  }

  return transactions;
}

// ============================================================================
// FORMATTERS & HELPERS
// ============================================================================
function formatINR(amount) {
  const num = Number(amount) || 0;
  return '₹' + num.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: num % 1 !== 0 ? 2 : 0
  });
}

function formatDate(dateStr) {
  if (!dateStr) return 'Recent';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const now = new Date();
    const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';

    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short'
    });
  } catch (e) {
    return dateStr;
  }
}

function getInitials(name) {
  if (!name) return '?';
  if (name.toLowerCase() === 'you') return 'ME';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function showToast(message, type = 'normal') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let icon = 'fa-circle-check';
  if (type === 'error') icon = 'fa-circle-exclamation';
  if (type === 'warning') icon = 'fa-triangle-exclamation';

  toast.innerHTML = `
    <i class="fa-solid ${icon}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.25s ease';
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 250);
  }, 3200);
}

// ============================================================================
// RENDERING FUNCTIONS
// ============================================================================

/**
 * Main render coordinator
 */
function renderAll() {
  const group = getActiveGroup();
  renderGroupSelector();
  renderGroupHero(group);
  renderSummaryMetrics(group);
  renderSettlements(group);
  renderCategoryChart(group);
  renderExpensesFeed(group);
}

/**
 * Render group switcher dropdown
 */
function renderGroupSelector() {
  const select = document.getElementById('activeGroupSelect');
  if (!select) return;

  select.innerHTML = '';
  appState.groups.forEach(g => {
    const opt = document.createElement('option');
    opt.value = g.id;
    opt.textContent = g.name;
    if (g.id === appState.activeGroupId) {
      opt.selected = true;
    }
    select.appendChild(opt);
  });
}

/**
 * Render group hero card with member avatar pills & user net balance
 */
function renderGroupHero(group) {
  const titleEl = document.getElementById('currentGroupTitle');
  const descEl = document.getElementById('currentGroupDesc');
  const membersListEl = document.getElementById('groupMembersList');
  const netPillValEl = document.getElementById('userNetBalanceValue');
  const netPillSubEl = document.getElementById('userNetBalanceSub');

  if (titleEl) titleEl.textContent = group.name;
  if (descEl) descEl.textContent = group.description || 'Shared student ledger';

  if (membersListEl) {
    membersListEl.innerHTML = '';
    group.members.forEach(member => {
      const isYou = member.toLowerCase() === 'you';
      const chip = document.createElement('div');
      chip.className = `member-chip ${isYou ? 'is-you' : ''}`;
      chip.innerHTML = `
        <span class="member-avatar">${getInitials(member)}</span>
        <span>${member}</span>
      `;
      membersListEl.appendChild(chip);
    });
  }

  // Calculate user net balance
  const balances = calculateGroupBalances(group);
  const userBalance = Math.round((balances['You'] || 0) * 100) / 100;

  if (netPillValEl && netPillSubEl) {
    netPillValEl.className = 'pill-value';
    if (userBalance > 0.01) {
      netPillValEl.classList.add('positive');
      netPillValEl.textContent = `+${formatINR(userBalance)}`;
      netPillSubEl.textContent = 'You are owed in total';
    } else if (userBalance < -0.01) {
      netPillValEl.classList.add('negative');
      netPillValEl.textContent = `-${formatINR(Math.abs(userBalance))}`;
      netPillSubEl.textContent = 'You owe the group';
    } else {
      netPillValEl.textContent = '₹0.00';
      netPillSubEl.textContent = 'All settled up!';
    }
  }
}

/**
 * Render 3 Summary Metric Cards:
 * 1. Total Group Spend
 * 2. You Are Owed (Emerald Green)
 * 3. You Owe (Coral Red)
 */
function renderSummaryMetrics(group) {
  const totalSpendEl = document.getElementById('metricTotalSpend');
  const spendSubEl = document.getElementById('metricSpendSub');
  const youAreOwedEl = document.getElementById('metricYouAreOwed');
  const youOweEl = document.getElementById('metricYouOwe');

  // Total Group Spend
  const totalSpend = group.expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
  if (totalSpendEl) totalSpendEl.textContent = formatINR(totalSpend);
  if (spendSubEl) spendSubEl.textContent = `Across ${group.expenses.length} transaction${group.expenses.length === 1 ? '' : 's'}`;

  // Balances calculation
  const balances = calculateGroupBalances(group);
  const settlements = simplifyDebts(balances);

  let owedToYou = 0;
  let youOwe = 0;

  settlements.forEach(st => {
    if (st.to.toLowerCase() === 'you') {
      owedToYou += st.amount;
    }
    if (st.from.toLowerCase() === 'you') {
      youOwe += st.amount;
    }
  });

  if (youAreOwedEl) youAreOwedEl.textContent = `+${formatINR(owedToYou)}`;
  if (youOweEl) youOweEl.textContent = `-${formatINR(youOwe)}`;
}

/**
 * Render "Who Owes Whom" settlements panel
 */
function renderSettlements(group) {
  const container = document.getElementById('settlementsList');
  if (!container) return;

  const balances = calculateGroupBalances(group);
  const settlements = simplifyDebts(balances);

  container.innerHTML = '';

  if (settlements.length === 0) {
    container.innerHTML = `
      <div class="all-settled-box">
        <i class="fa-solid fa-circle-check"></i>
        <div style="font-weight: 700; color: var(--slate-800); margin-bottom: 0.25rem;">Everything Settled Up!</div>
        <p style="font-size: 0.8rem;">No pending balances among roommates right now.</p>
      </div>
    `;
    return;
  }

  settlements.forEach(st => {
    const card = document.createElement('div');
    card.className = 'settlement-card';
    card.innerHTML = `
      <div class="settlement-flow">
        <div class="person-badge debtor">
          <span class="mini-avatar">${getInitials(st.from)}</span>
          <span>${st.from}</span>
        </div>
        <div class="flow-arrow">
          <i class="fa-solid fa-arrow-right"></i>
        </div>
        <div class="person-badge creditor">
          <span class="mini-avatar">${getInitials(st.to)}</span>
          <span>${st.to}</span>
        </div>
      </div>
      <div class="settlement-amount-wrap">
        <span class="settlement-amount">${formatINR(st.amount)}</span>
        <button class="btn-settle-action" data-from="${st.from}" data-to="${st.to}" data-amount="${st.amount}">
          Settle
        </button>
      </div>
    `;

    // Hook quick settle click
    const settleBtn = card.querySelector('.btn-settle-action');
    if (settleBtn) {
      settleBtn.addEventListener('click', () => {
        openSettleModal(st.from, st.to, st.amount);
      });
    }

    container.appendChild(card);
  });
}

/**
 * Render Category Breakdown Doughnut Chart & Legend List
 */
function renderCategoryChart(group) {
  const canvas = document.getElementById('categoryChart');
  const badgeEl = document.getElementById('chartTotalBadge');
  const centerCategoryEl = document.getElementById('chartTopCategory');
  const breakdownListEl = document.getElementById('categoryBreakdownList');
  const budgetRatioEl = document.getElementById('budgetMeterRatio');
  const budgetFillEl = document.getElementById('budgetMeterFill');

  if (!canvas) return;

  // Aggregate spending by category
  const categoryTotals = {};
  let totalSpend = 0;

  group.expenses.forEach(exp => {
    const cat = exp.category || 'Other';
    const amt = Number(exp.amount) || 0;
    categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
    totalSpend += amt;
  });

  if (badgeEl) badgeEl.textContent = `${formatINR(totalSpend)} Total`;

  // Update budget meter
  const groupBudget = group.budget || 10000;
  if (budgetRatioEl) budgetRatioEl.textContent = `${formatINR(totalSpend)} / ${formatINR(groupBudget)}`;
  if (budgetFillEl) {
    const pct = Math.min(Math.round((totalSpend / groupBudget) * 100), 100);
    budgetFillEl.style.width = `${pct}%`;
    budgetFillEl.className = 'progress-bar-fill';
    if (pct > 90) {
      budgetFillEl.classList.add('danger');
    } else if (pct > 70) {
      budgetFillEl.classList.add('warning');
    }
  }

  // Find top category
  let topCategory = 'None';
  let maxSpent = 0;
  Object.entries(categoryTotals).forEach(([cat, val]) => {
    if (val > maxSpent) {
      maxSpent = val;
      topCategory = cat;
    }
  });
  if (centerCategoryEl) centerCategoryEl.textContent = topCategory;

  // Prepare chart dataset
  const categories = Object.keys(categoryTotals);
  const dataValues = Object.values(categoryTotals);
  const bgColors = categories.map(cat => CATEGORY_CONFIG[cat]?.color || '#64748B');

  // Render or update Chart.js
  if (appState.categoryChartInstance) {
    appState.categoryChartInstance.destroy();
  }

  if (categories.length === 0) {
    // If no expenses, show empty gray circle
    const ctx = canvas.getContext('2d');
    appState.categoryChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['No Expenses'],
        datasets: [{
          data: [1],
          backgroundColor: ['#E2E8F0'],
          borderWidth: 0
        }]
      },
      options: {
        cutout: '72%',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false }
        }
      }
    });
  } else {
    const ctx = canvas.getContext('2d');
    appState.categoryChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: categories,
        datasets: [{
          data: dataValues,
          backgroundColor: bgColors,
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverOffset: 4
        }]
      },
      options: {
        cutout: '72%',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                const val = context.raw || 0;
                const pct = totalSpend > 0 ? Math.round((val / totalSpend) * 100) : 0;
                return ` ${context.label}: ${formatINR(val)} (${pct}%)`;
              }
            }
          }
        }
      }
    });
  }

  // Render category breakdown list below the chart
  if (breakdownListEl) {
    breakdownListEl.innerHTML = '';
    categories.forEach(cat => {
      const amt = categoryTotals[cat];
      const pct = totalSpend > 0 ? Math.round((amt / totalSpend) * 100) : 0;
      const color = CATEGORY_CONFIG[cat]?.color || '#64748B';

      const item = document.createElement('div');
      item.className = 'cat-breakdown-item';
      item.innerHTML = `
        <div class="cat-breakdown-left">
          <span class="cat-color-dot" style="background-color: ${color};"></span>
          <span class="cat-name">${cat}</span>
        </div>
        <div class="cat-breakdown-right">
          <span class="cat-amount">${formatINR(amt)}</span>
          <span class="cat-percent">${pct}%</span>
        </div>
      `;
      breakdownListEl.appendChild(item);
    });
  }
}

/**
 * Render Expense History Feed with search, filters and sorting
 */
function renderExpensesFeed(group) {
  const feedContainer = document.getElementById('expensesFeedList');
  const emptyState = document.getElementById('emptyFeedState');
  const countSubEl = document.getElementById('feedCountSubtitle');

  if (!feedContainer) return;

  let expenses = [...group.expenses];

  // 1. Filter by category
  if (appState.filters.category !== 'all') {
    expenses = expenses.filter(exp => exp.category === appState.filters.category);
  }

  // 2. Filter by search query
  const q = (appState.filters.searchQuery || '').trim().toLowerCase();
  if (q) {
    expenses = expenses.filter(exp => {
      const titleMatch = (exp.title || '').toLowerCase().includes(q);
      const payerMatch = (exp.paidBy || '').toLowerCase().includes(q);
      const catMatch = (exp.category || '').toLowerCase().includes(q);
      const amtMatch = String(exp.amount || '').includes(q);
      return titleMatch || payerMatch || catMatch || amtMatch;
    });
  }

  // 3. Sort
  const sortBy = appState.filters.sortBy || 'newest';
  expenses.sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.date || 0) - new Date(a.date || 0);
    if (sortBy === 'oldest') return new Date(a.date || 0) - new Date(b.date || 0);
    if (sortBy === 'highest') return (b.amount || 0) - (a.amount || 0);
    if (sortBy === 'lowest') return (a.amount || 0) - (b.amount || 0);
    return 0;
  });

  if (countSubEl) {
    countSubEl.textContent = `Showing ${expenses.length} expense${expenses.length === 1 ? '' : 's'}`;
  }

  feedContainer.innerHTML = '';

  if (expenses.length === 0) {
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  expenses.forEach(exp => {
    const catConfig = CATEGORY_CONFIG[exp.category] || CATEGORY_CONFIG['Food & Dining'];
    const formattedDate = formatDate(exp.date);
    const isPayerYou = (exp.paidBy || '').toLowerCase() === 'you';

    // Calculate personal share impact
    const userShare = Number(exp.shares?.['You'] || 0);
    let shareTagHtml = '';

    if (isPayerYou) {
      const lentAmount = (exp.amount || 0) - userShare;
      if (lentAmount > 0) {
        shareTagHtml = `<span class="user-share-pill lent">You lent ${formatINR(lentAmount)}</span>`;
      } else {
        shareTagHtml = `<span class="user-share-pill neutral">You paid full</span>`;
      }
    } else {
      if (userShare > 0) {
        shareTagHtml = `<span class="user-share-pill borrowed">Your share: ${formatINR(userShare)}</span>`;
      } else {
        shareTagHtml = `<span class="user-share-pill neutral">Not involved</span>`;
      }
    }

    // Split mode description tag
    let splitSummary = 'Split equally';
    if (exp.splitMode === 'exact') splitSummary = 'Exact amounts';
    if (exp.splitMode === 'percentage') splitSummary = 'Percentage split';

    const card = document.createElement('div');
    card.className = 'expense-item-card';
    card.innerHTML = `
      <div class="expense-left">
        <div class="cat-avatar-icon ${catConfig.cssClass}">
          <i class="fa-solid ${catConfig.icon}"></i>
        </div>
        <div class="expense-info">
          <div class="expense-title" title="${exp.title}">${exp.title}</div>
          <div class="expense-meta-row">
            <span class="meta-payer">${isPayerYou ? 'Paid by You' : 'Paid by ' + exp.paidBy}</span>
            <span>&bull;</span>
            <span class="meta-date">${formattedDate}</span>
            <span>&bull;</span>
            <span class="meta-split-tag">${splitSummary}</span>
          </div>
        </div>
      </div>
      <div class="expense-right">
        <div class="expense-values">
          <span class="expense-total">${formatINR(exp.amount)}</span>
          ${shareTagHtml}
        </div>
        <button class="btn-delete-expense" data-id="${exp.id}" title="Delete expense" aria-label="Delete expense">
          <i class="fa-regular fa-trash-can"></i>
        </button>
      </div>
    `;

    // Hook delete button
    const deleteBtn = card.querySelector('.btn-delete-expense');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteExpense(exp.id, exp.title);
      });
    }

    feedContainer.appendChild(card);
  });
}

function deleteExpense(expenseId, title) {
  const group = getActiveGroup();
  const idx = group.expenses.findIndex(e => e.id === expenseId);
  if (idx !== -1) {
    group.expenses.splice(idx, 1);
    saveStateToStorage();
    renderAll();
    showToast(`Deleted "${title || 'Expense'}"`, 'warning');
  }
}

// ============================================================================
// ADD EXPENSE MODAL & DYNAMIC BILL-SPLITTING LOGIC
// ============================================================================

function openAddExpenseModal() {
  const modal = document.getElementById('addExpenseModal');
  const form = document.getElementById('addExpenseForm');
  const group = getActiveGroup();

  if (!modal || !form) return;

  // Reset form
  form.reset();

  // Populate Payer dropdown
  const payerSelect = document.getElementById('expensePayerSelect');
  if (payerSelect) {
    payerSelect.innerHTML = '';
    group.members.forEach(member => {
      const opt = document.createElement('option');
      opt.value = member;
      opt.textContent = member === 'You' ? 'You (Myself)' : member;
      payerSelect.appendChild(opt);
    });
  }

  // Set today's date
  const dateInput = document.getElementById('expenseDateInput');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
  }

  // Reset split mode to equal
  setSplitMode('equal');

  modal.classList.remove('hidden');
  document.getElementById('expenseTitleInput')?.focus();
}

function closeAddExpenseModal() {
  const modal = document.getElementById('addExpenseModal');
  if (modal) modal.classList.add('hidden');
}

function setSplitMode(mode) {
  appState.modalSplitMode = mode;

  // Update tabs
  const tabs = document.querySelectorAll('.split-tab');
  tabs.forEach(tab => {
    const isActive = tab.dataset.mode === mode;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  // Update split helper text
  const descEl = document.getElementById('splitModeDesc');
  if (descEl) {
    if (mode === 'equal') descEl.textContent = 'Split equally across selected roommates';
    if (mode === 'exact') descEl.textContent = 'Specify custom rupee amounts per person';
    if (mode === 'percentage') descEl.textContent = 'Assign exact percentages totaling 100%';
  }

  renderSplitMembersContainer();
  validateSplit();
}

function renderSplitMembersContainer() {
  const container = document.getElementById('splitMembersContainer');
  const group = getActiveGroup();
  const totalAmount = parseFloat(document.getElementById('expenseAmountInput')?.value) || 0;
  const mode = appState.modalSplitMode;

  if (!container) return;
  container.innerHTML = '';

  if (mode === 'equal') {
    // Checkbox list with live share tag
    group.members.forEach(member => {
      const row = document.createElement('div');
      row.className = 'split-member-row';
      row.innerHTML = `
        <div class="split-member-left">
          <input type="checkbox" class="split-checkbox equal-member-check" data-member="${member}" checked id="check_${member}">
          <label for="check_${member}" class="split-member-name">${member}</label>
        </div>
        <div class="split-member-right">
          <span class="split-calc-tag equal-share-tag" data-member="${member}">₹0.00</span>
        </div>
      `;
      container.appendChild(row);
    });

    // Update equal share values
    updateEqualSplitCalculations();

    // Attach change listeners to checkboxes
    container.querySelectorAll('.equal-member-check').forEach(chk => {
      chk.addEventListener('change', () => {
        updateEqualSplitCalculations();
        validateSplit();
      });
    });

  } else if (mode === 'exact') {
    // Exact Rupee Inputs
    const defaultShare = group.members.length > 0 ? (totalAmount / group.members.length).toFixed(2) : 0;

    group.members.forEach(member => {
      const row = document.createElement('div');
      row.className = 'split-member-row';
      row.innerHTML = `
        <div class="split-member-left">
          <span class="split-member-name">${member}</span>
        </div>
        <div class="split-member-right">
          <div class="split-input-wrap">
            <span class="split-input-prefix">₹</span>
            <input type="number" class="exact-member-input" data-member="${member}" value="${defaultShare}" min="0" step="any">
          </div>
        </div>
      `;
      container.appendChild(row);
    });

    container.querySelectorAll('.exact-member-input').forEach(inp => {
      inp.addEventListener('input', validateSplit);
    });

  } else if (mode === 'percentage') {
    // Percentage Inputs
    const defaultPct = group.members.length > 0 ? (100 / group.members.length).toFixed(1) : 0;

    group.members.forEach(member => {
      const approxRupee = ((parseFloat(defaultPct) / 100) * totalAmount).toFixed(2);
      const row = document.createElement('div');
      row.className = 'split-member-row';
      row.innerHTML = `
        <div class="split-member-left">
          <span class="split-member-name">${member}</span>
        </div>
        <div class="split-member-right">
          <span class="split-calc-tag pct-calc-rupee" data-member="${member}">₹${approxRupee}</span>
          <div class="split-input-wrap">
            <span class="split-input-prefix">%</span>
            <input type="number" class="pct-member-input" data-member="${member}" value="${defaultPct}" min="0" max="100" step="any">
          </div>
        </div>
      `;
      container.appendChild(row);
    });

    container.querySelectorAll('.pct-member-input').forEach(inp => {
      inp.addEventListener('input', () => {
        updatePercentageCalculations();
        validateSplit();
      });
    });
  }
}

function updateEqualSplitCalculations() {
  const totalAmount = parseFloat(document.getElementById('expenseAmountInput')?.value) || 0;
  const checkedBoxes = document.querySelectorAll('.equal-member-check:checked');
  const count = checkedBoxes.length;
  const sharePerPerson = count > 0 ? totalAmount / count : 0;

  document.querySelectorAll('.equal-share-tag').forEach(tag => {
    const member = tag.dataset.member;
    const isChecked = document.getElementById(`check_${member}`)?.checked;
    if (isChecked) {
      tag.textContent = formatINR(sharePerPerson);
      tag.style.opacity = '1';
    } else {
      tag.textContent = '₹0.00';
      tag.style.opacity = '0.35';
    }
  });
}

function updatePercentageCalculations() {
  const totalAmount = parseFloat(document.getElementById('expenseAmountInput')?.value) || 0;
  document.querySelectorAll('.pct-member-input').forEach(inp => {
    const member = inp.dataset.member;
    const pct = parseFloat(inp.value) || 0;
    const rupee = (pct / 100) * totalAmount;
    const tag = document.querySelector(`.pct-calc-rupee[data-member="${member}"]`);
    if (tag) tag.textContent = formatINR(rupee);
  });
}

/**
 * Live validation for exact and percentage split sums
 */
function validateSplit() {
  const alertBox = document.getElementById('splitValidationAlert');
  const alertText = document.getElementById('validationAlertText');
  const alertBadge = document.getElementById('validationAlertBadge');
  const alertIcon = document.getElementById('validationAlertIcon');
  const saveBtn = document.getElementById('btnSaveExpense');
  const totalAmount = parseFloat(document.getElementById('expenseAmountInput')?.value) || 0;
  const mode = appState.modalSplitMode;

  if (!alertBox || !alertText || !alertBadge) return true;

  if (mode === 'equal') {
    const checked = document.querySelectorAll('.equal-member-check:checked');
    if (checked.length === 0) {
      alertBox.classList.remove('hidden', 'valid');
      alertText.textContent = 'Select at least 1 member to split';
      alertBadge.textContent = '0 selected';
      if (alertIcon) alertIcon.className = 'fa-solid fa-circle-exclamation alert-icon';
      if (saveBtn) saveBtn.disabled = true;
      return false;
    }
    alertBox.classList.add('hidden');
    if (saveBtn) saveBtn.disabled = false;
    return true;
  }

  if (mode === 'exact') {
    alertBox.classList.remove('hidden');
    let sum = 0;
    document.querySelectorAll('.exact-member-input').forEach(inp => {
      sum += parseFloat(inp.value) || 0;
    });

    const diff = Math.round((totalAmount - sum) * 100) / 100;

    if (Math.abs(diff) < 0.05 && totalAmount > 0) {
      alertBox.classList.add('valid');
      alertText.textContent = 'Exact match! All amounts accounted for.';
      alertBadge.textContent = '✓ Balanced';
      if (alertIcon) alertIcon.className = 'fa-solid fa-circle-check alert-icon';
      if (saveBtn) saveBtn.disabled = false;
      return true;
    } else {
      alertBox.classList.remove('valid');
      if (alertIcon) alertIcon.className = 'fa-solid fa-circle-exclamation alert-icon';
      if (diff > 0) {
        alertText.textContent = 'Amounts must add up to total';
        alertBadge.textContent = `${formatINR(diff)} remaining`;
      } else {
        alertText.textContent = 'Sum exceeds total amount';
        alertBadge.textContent = `Over by ${formatINR(Math.abs(diff))}`;
      }
      if (saveBtn) saveBtn.disabled = true;
      return false;
    }
  }

  if (mode === 'percentage') {
    alertBox.classList.remove('hidden');
    let sum = 0;
    document.querySelectorAll('.pct-member-input').forEach(inp => {
      sum += parseFloat(inp.value) || 0;
    });

    const diff = Math.round((100 - sum) * 10) / 10;

    if (Math.abs(diff) < 0.1) {
      alertBox.classList.add('valid');
      alertText.textContent = '100% matched! Split is balanced.';
      alertBadge.textContent = '✓ 100%';
      if (alertIcon) alertIcon.className = 'fa-solid fa-circle-check alert-icon';
      if (saveBtn) saveBtn.disabled = false;
      return true;
    } else {
      alertBox.classList.remove('valid');
      if (alertIcon) alertIcon.className = 'fa-solid fa-circle-exclamation alert-icon';
      if (diff > 0) {
        alertText.textContent = 'Percentages must add up to 100%';
        alertBadge.textContent = `${diff}% left`;
      } else {
        alertText.textContent = 'Percentages exceed 100%';
        alertBadge.textContent = `Over by ${Math.abs(diff)}%`;
      }
      if (saveBtn) saveBtn.disabled = true;
      return false;
    }
  }

  return true;
}

/**
 * Handle form submission for adding a new expense
 */
function handleSaveExpense(e) {
  e.preventDefault();

  const titleInput = document.getElementById('expenseTitleInput');
  const amountInput = document.getElementById('expenseAmountInput');
  const categorySelect = document.getElementById('expenseCategorySelect');
  const payerSelect = document.getElementById('expensePayerSelect');
  const dateInput = document.getElementById('expenseDateInput');

  const title = (titleInput?.value || '').trim();
  const amount = parseFloat(amountInput?.value) || 0;
  const category = categorySelect?.value || 'Food & Dining';
  const paidBy = payerSelect?.value || 'You';
  const date = dateInput?.value || new Date().toISOString().split('T')[0];
  const mode = appState.modalSplitMode;

  // Validation
  if (!title) {
    showToast('Please provide an expense title', 'error');
    titleInput?.focus();
    return;
  }

  if (amount <= 0) {
    showToast('Please enter an amount greater than ₹0', 'error');
    amountInput?.focus();
    return;
  }

  if (!validateSplit()) {
    showToast('Please balance the member split first', 'error');
    return;
  }

  const group = getActiveGroup();
  const shares = {};
  let percentages = null;

  if (mode === 'equal') {
    const checked = Array.from(document.querySelectorAll('.equal-member-check:checked')).map(el => el.dataset.member);
    const splitAmount = Math.round((amount / checked.length) * 100) / 100;
    checked.forEach(member => {
      shares[member] = splitAmount;
    });
  } else if (mode === 'exact') {
    document.querySelectorAll('.exact-member-input').forEach(inp => {
      const val = parseFloat(inp.value) || 0;
      if (val > 0) {
        shares[inp.dataset.member] = val;
      }
    });
  } else if (mode === 'percentage') {
    percentages = {};
    document.querySelectorAll('.pct-member-input').forEach(inp => {
      const pct = parseFloat(inp.value) || 0;
      percentages[inp.dataset.member] = pct;
      shares[inp.dataset.member] = Math.round(((pct / 100) * amount) * 100) / 100;
    });
  }

  const newExpense = {
    id: 'exp_' + Date.now(),
    title,
    amount,
    category,
    paidBy,
    date,
    splitMode: mode,
    shares,
    ...(percentages ? { percentages } : {})
  };

  group.expenses.unshift(newExpense);
  saveStateToStorage();
  closeAddExpenseModal();
  renderAll();
  showToast(`Added "${title}" (${formatINR(amount)})`);
}

// ============================================================================
// SETTLEMENT MODAL LOGIC
// ============================================================================

function openSettleModal(debtor = null, creditor = null, suggestedAmount = null) {
  const modal = document.getElementById('settleModal');
  const payerSelect = document.getElementById('settlePayerSelect');
  const receiverSelect = document.getElementById('settleReceiverSelect');
  const amountInput = document.getElementById('settleAmountInput');
  const group = getActiveGroup();

  if (!modal || !payerSelect || !receiverSelect) return;

  // Populate options
  payerSelect.innerHTML = '';
  receiverSelect.innerHTML = '';

  group.members.forEach(member => {
    const opt1 = document.createElement('option');
    opt1.value = member;
    opt1.textContent = member;
    payerSelect.appendChild(opt1);

    const opt2 = document.createElement('option');
    opt2.value = member;
    opt2.textContent = member;
    receiverSelect.appendChild(opt2);
  });

  if (debtor) payerSelect.value = debtor;
  if (creditor) receiverSelect.value = creditor;
  if (suggestedAmount && amountInput) {
    amountInput.value = suggestedAmount;
  }

  modal.classList.remove('hidden');
}

function closeSettleModal() {
  const modal = document.getElementById('settleModal');
  if (modal) modal.classList.add('hidden');
}

function handleConfirmSettlement(e) {
  e.preventDefault();

  const payer = document.getElementById('settlePayerSelect')?.value;
  const receiver = document.getElementById('settleReceiverSelect')?.value;
  const amount = parseFloat(document.getElementById('settleAmountInput')?.value) || 0;

  if (payer === receiver) {
    showToast('Payer and receiver cannot be the same person', 'error');
    return;
  }

  if (amount <= 0) {
    showToast('Please enter a valid settlement amount', 'error');
    return;
  }

  const group = getActiveGroup();
  const settlementExpense = {
    id: 'exp_settle_' + Date.now(),
    title: `Settlement: ${payer} ➔ ${receiver}`,
    amount,
    category: 'Settlement',
    paidBy: payer,
    date: new Date().toISOString().split('T')[0],
    splitMode: 'exact',
    shares: {
      [receiver]: amount
    }
  };

  group.expenses.unshift(settlementExpense);
  saveStateToStorage();
  closeSettleModal();
  renderAll();
  showToast(`Settled ${formatINR(amount)} between ${payer} and ${receiver}! 🎉`);
}

// ============================================================================
// CREATE NEW GROUP MODAL LOGIC
// ============================================================================

function openNewGroupModal() {
  const modal = document.getElementById('newGroupModal');
  const form = document.getElementById('newGroupForm');
  if (form) form.reset();
  const membersInput = document.getElementById('newGroupMembersInput');
  if (membersInput) membersInput.value = 'You, ';
  if (modal) modal.classList.remove('hidden');
}

function closeNewGroupModal() {
  const modal = document.getElementById('newGroupModal');
  if (modal) modal.classList.add('hidden');
}

function handleCreateNewGroup(e) {
  e.preventDefault();

  const nameInput = document.getElementById('newGroupNameInput');
  const descInput = document.getElementById('newGroupDescInput');
  const membersInput = document.getElementById('newGroupMembersInput');

  const name = (nameInput?.value || '').trim();
  const desc = (descInput?.value || '').trim();
  const rawMembers = (membersInput?.value || '').split(',').map(m => m.trim()).filter(Boolean);

  if (!name) {
    showToast('Please enter a group name', 'error');
    return;
  }

  // Ensure "You" is included
  const membersSet = new Set(rawMembers);
  if (!membersSet.has('You')) {
    membersSet.add('You');
  }

  const finalMembers = Array.from(membersSet);

  if (finalMembers.length < 2) {
    showToast('A group must have at least 2 members to split expenses', 'error');
    return;
  }

  const newGroup = {
    id: 'group_' + Date.now(),
    name,
    description: desc || 'Student shared ledger',
    category: 'Campus Living',
    budget: 12000,
    members: finalMembers,
    expenses: []
  };

  appState.groups.push(newGroup);
  appState.activeGroupId = newGroup.id;
  saveStateToStorage();
  closeNewGroupModal();
  renderAll();
  showToast(`Created group "${name}"!`);
}

// ============================================================================
// CSV EXPORT GENERATOR
// ============================================================================

function exportGroupToCSV() {
  const group = getActiveGroup();

  if (group.expenses.length === 0) {
    showToast('No expenses to export in this group', 'warning');
    return;
  }

  const headers = [
    'Expense ID',
    'Date',
    'Title',
    'Category',
    'Paid By',
    'Total Amount (INR)',
    'Split Mode',
    'Member Breakdown'
  ];

  const rows = group.expenses.map(exp => {
    let breakdownStr = '';
    if (exp.shares) {
      breakdownStr = Object.entries(exp.shares)
        .map(([m, s]) => `${m}: ₹${s}`)
        .join('; ');
    }

    return [
      `"${exp.id}"`,
      `"${exp.date || ''}"`,
      `"${(exp.title || '').replace(/"/g, '""')}"`,
      `"${exp.category || ''}"`,
      `"${exp.paidBy || ''}"`,
      exp.amount || 0,
      `"${exp.splitMode || ''}"`,
      `"${breakdownStr.replace(/"/g, '""')}"`
    ].join(',');
  });

  // UTF-8 BOM so Excel opens with ₹ without corrupting
  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  const safeGroupName = group.name.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dateStr = new Date().toISOString().split('T')[0];
  link.href = url;
  link.download = `SplitMate_${safeGroupName}_${dateStr}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showToast(`Exported "${group.name}" CSV! 📊`);
}

// ============================================================================
// EVENT LISTENERS & SETUP
// ============================================================================

function setupEventListeners() {
  // Group switcher
  const groupSelect = document.getElementById('activeGroupSelect');
  if (groupSelect) {
    groupSelect.addEventListener('change', (e) => {
      appState.activeGroupId = e.target.value;
      saveStateToStorage();
      renderAll();
    });
  }

  // Add Expense Modal open/close
  document.getElementById('btnOpenAddExpenseModal')?.addEventListener('click', openAddExpenseModal);
  document.getElementById('btnCloseExpenseModal')?.addEventListener('click', closeAddExpenseModal);
  document.getElementById('btnCancelExpense')?.addEventListener('click', closeAddExpenseModal);
  document.getElementById('btnEmptyAddExpense')?.addEventListener('click', openAddExpenseModal);

  // Split tabs
  document.querySelectorAll('.split-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      setSplitMode(tab.dataset.mode);
    });
  });

  // Live amount input updates split distributions
  document.getElementById('expenseAmountInput')?.addEventListener('input', () => {
    if (appState.modalSplitMode === 'equal') {
      updateEqualSplitCalculations();
    } else if (appState.modalSplitMode === 'percentage') {
      updatePercentageCalculations();
    }
    validateSplit();
  });

  // Form submission
  document.getElementById('addExpenseForm')?.addEventListener('submit', handleSaveExpense);

  // Settle Modal open/close
  document.getElementById('btnQuickSettle')?.addEventListener('click', () => openSettleModal());
  document.getElementById('btnCloseSettleModal')?.addEventListener('click', closeSettleModal);
  document.getElementById('btnCancelSettle')?.addEventListener('click', closeSettleModal);
  document.getElementById('settleForm')?.addEventListener('submit', handleConfirmSettlement);

  // New Group Modal open/close
  document.getElementById('btnNewGroupModal')?.addEventListener('click', openNewGroupModal);
  document.getElementById('btnCloseNewGroupModal')?.addEventListener('click', closeNewGroupModal);
  document.getElementById('btnCancelNewGroup')?.addEventListener('click', closeNewGroupModal);
  document.getElementById('newGroupForm')?.addEventListener('submit', handleCreateNewGroup);

  // Reset Demo Data
  document.getElementById('btnResetDemoData')?.addEventListener('click', () => {
    if (confirm('Reset to sample student expenses? Any custom modifications will be replaced.')) {
      resetStateToDemoData(true);
    }
  });

  // Export CSV
  document.getElementById('btnExportCsv')?.addEventListener('click', exportGroupToCSV);

  // Search input & Clear button
  const searchInput = document.getElementById('expenseSearchInput');
  const clearBtn = document.getElementById('btnClearSearch');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      appState.filters.searchQuery = e.target.value;
      if (clearBtn) {
        clearBtn.classList.toggle('hidden', !e.target.value);
      }
      renderExpensesFeed(getActiveGroup());
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      appState.filters.searchQuery = '';
      clearBtn.classList.add('hidden');
      renderExpensesFeed(getActiveGroup());
    });
  }

  // Category filter pills
  document.querySelectorAll('.filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      appState.filters.category = pill.dataset.category;
      renderExpensesFeed(getActiveGroup());
    });
  });

  // Sort dropdown
  document.getElementById('expenseSortSelect')?.addEventListener('change', (e) => {
    appState.filters.sortBy = e.target.value;
    renderExpensesFeed(getActiveGroup());
  });

  // Keyboard accessibility: ESC closes open modal
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAddExpenseModal();
      closeSettleModal();
      closeNewGroupModal();
    }
  });

  // Close modals on clicking outside dialog
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        backdrop.classList.add('hidden');
      }
    });
  });

  // Network connection status monitoring
  window.addEventListener('online', updateNetworkStatus);
  window.addEventListener('offline', updateNetworkStatus);
}

function updateNetworkStatus() {
  const badge = document.getElementById('offlineBadge');
  if (!badge) return;

  const isOnline = navigator.onLine;
  if (isOnline) {
    badge.className = 'connection-pill online';
    badge.title = 'Status: Online';
    badge.querySelector('.status-label').textContent = 'Online';
    showToast('You are back online!', 'normal');
  } else {
    badge.className = 'connection-pill offline';
    badge.title = 'Status: Offline (Local storage active)';
    badge.querySelector('.status-label').textContent = 'Offline';
    showToast('Working offline. All data is saved locally!', 'warning');
  }
}

// ============================================================================
// SERVICE WORKER REGISTRATION (OFFLINE PWA)
// ============================================================================
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then((reg) => {
          console.log('[SplitMate PWA] Service Worker registered successfully:', reg.scope);
        })
        .catch((err) => {
          console.warn('[SplitMate PWA] Service Worker registration failed:', err);
        });
    });
  }
}

// ============================================================================
// APP ENTRY POINT
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  loadStateFromStorage();
  setupEventListeners();
  renderAll();
  registerServiceWorker();
  updateNetworkStatus();
});
