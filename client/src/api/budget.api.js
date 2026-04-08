import API from './axios';

// The primary function used by the Budget Page
export const getBudget = () => API.get('/api/budget/current');

// ALIAS: This fixes the DashboardPage crash by supporting the old name
export const getCurrentBudget = getBudget;

// Updates specific budget parameters
export const updateBudget = (data) => API.put('/api/budget', data);

// The AI Engine trigger
export const buildBudgetWithAI = () => API.post('/api/budget/generate');