const CATEGORY_TYPES = {
  'Rent': 'FIXED', 'Education': 'FIXED', 'Utilities': 'FIXED', 'Medical': 'FIXED',
  'Investment': 'SAVINGS', 'Savings': 'SAVINGS', 'Debt': 'SAVINGS',
  'Food': 'DAILY', 'Transport': 'DAILY', 'Shopping': 'DAILY', 
  'Travel': 'DAILY', 'Entertainment': 'DAILY', 'Other': 'DAILY'
};

function generateBudget(income, history = []) {
  const spendData = {};
  history.forEach(item => {
    spendData[item.category] = (spendData[item.category] || 0) + item.amount;
  });

  const allocations = Object.keys(CATEGORY_TYPES).map(cat => {
    const type = CATEGORY_TYPES[cat];
    const actualSpend = spendData[cat] || 0;
    
    let limit = 0;
    if (type === 'FIXED') {
      // If you spent more than expected on a bill, the limit moves up to match it
      limit = Math.max(actualSpend, income * 0.1); 
    }

    return { category: cat, type, limit, spent: actualSpend };
  });

  // Set a 20% goal for Savings
  const savingsGoal = income * 0.20;
  let moneyLeft = income - savingsGoal - allocations.filter(a => a.type === 'FIXED').reduce((sum, a) => sum + a.limit, 0);

  allocations.forEach(a => {
    if (a.type === 'SAVINGS') {
      a.limit = Math.round(savingsGoal / 3);
    } else if (a.type === 'DAILY') {
      // Divide what's left among your daily spending habits
      a.limit = Math.max(Math.round(moneyLeft / 6), 0);
    }
  });

  return allocations;
}

module.exports = { generateBudget };