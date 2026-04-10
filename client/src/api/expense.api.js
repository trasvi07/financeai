import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// We export BOTH names so no matter which page calls what, it doesn't crash
export const getSmartAnalysis = (params) => API.get('/expenses/summary', { params });
export const getSummary = (params) => API.get('/expenses/summary', { params });
export const getTrends = () => API.get('/expenses/trends');
export const getExpenses = () => API.get('/expenses');
export const addExpense = (data) => API.post('/expenses', data);
export const deleteExpense = (id) => API.delete(`/expenses/${id}`);