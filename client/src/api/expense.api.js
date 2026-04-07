import API from './axios'

export const getExpenses    = (params) => API.get('/api/expenses', { params })
export const addExpense     = (data)   => API.post('/api/expenses', data)
export const updateExpense  = (id, data) => API.put(`/api/expenses/${id}`, data)
export const deleteExpense  = (id)     => API.delete(`/api/expenses/${id}`)
export const getSummary     = (params) => API.get('/api/expenses/summary', { params })
export const getTrends      = ()       => API.get('/api/expenses/trends')