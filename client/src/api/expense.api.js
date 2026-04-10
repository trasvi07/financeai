import axios from 'axios';

// Create axios instance (adjust baseURL to your Render URL)
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true
});

// Add Token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 1. THE MISSING LINK: Smart Analysis
export const getSmartAnalysis = (params) => API.get('/expenses/summary', { params });
export const getSummary = (params) => API.get('/expenses/summary', { params });
// 2. Trends for Velocity Chart
export const getTrends = () => API.get('/expenses/trends');

// 3. Other standard exports
export const getExpenses = () => API.get('/expenses');
export const addExpense = (data) => API.post('/expenses', data);
export const updateExpense = (id, data) => API.put(`/expenses/${id}`, data);
export const deleteExpense = (id) => API.delete(`/expenses/${id}`);