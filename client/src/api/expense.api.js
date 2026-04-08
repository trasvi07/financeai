import API from './axios';

// Get all expenses (with optional month/year/category filters)
export const getExpenses = (params) => API.get('/api/expenses', { params });

// Add a new expense
export const addExpense = (data) => API.post('/api/expenses', data);

// Update an existing expense (THE MISSING ONE!)
export const updateExpense = (id, data) => API.put(`/api/expenses/${id}`, data);

// Delete an expense
export const deleteExpense = (id) => API.delete(`/api/expenses/${id}`);

// Get monthly summary for charts (THE MISSING ONE!)
export const getSummary = (params) => API.get('/api/expenses/summary', { params });

// Get 6-month trends for line chart (THE MISSING ONE!)
export const getTrends = () => API.get('/api/expenses/trends');
export const getRecurringSuggestions = () => API.get('/api/expenses/detect-recurring');