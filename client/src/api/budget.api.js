import API from './axios';

// Fetches the current elastic budget
export const getBudget = () => API.get('/api/budget/current');

// Updates specific budget parameters
export const updateBudget = (data) => API.put('/api/budget', data);

// The AI Engine trigger - recalculates based on 60/25/15 logic
export const buildBudgetWithAI = () => API.post('/api/budget/generate');