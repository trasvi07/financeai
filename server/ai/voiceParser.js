/**
 * Voice Parser Logic
 * Purpose: Extract { amount, category, title } from a string
 * Example: "I spent 500 on food for pizza"
 */
const parseVoiceCommand = (text) => {
  const normalized = text.toLowerCase();
  
  // 1. Extract Amount (looks for numbers)
  const amountMatch = normalized.match(/\d+/);
  const amount = amountMatch ? parseFloat(amountMatch[0]) : 0;

  // 2. Map Keywords to Categories
  const categoryMap = {
    'food': 'Food & Dining',
    'swiggy': 'Food & Dining',
    'zomato': 'Food & Dining',
    'uber': 'Transport',
    'petrol': 'Transport',
    'amazon': 'Shopping',
    'movie': 'Entertainment',
    'rent': 'Utilities',
    'bill': 'Utilities'
  };

  let category = 'Other';
  Object.keys(categoryMap).forEach(key => {
    if (normalized.includes(key)) category = categoryMap[key];
  });

  // 3. Extract Title (Everything after 'on' or 'for')
  let title = "Voice Entry";
  if (normalized.includes('on ')) {
    title = normalized.split('on ')[1];
  } else if (normalized.includes('for ')) {
    title = normalized.split('for ')[1];
  }

  return { amount, category, title: title.charAt(0).toUpperCase() + title.slice(1) };
};

module.exports = { parseVoiceCommand };