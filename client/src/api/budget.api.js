import API from './axios'

export const getCurrentBudget  = ()     => API.get('/api/budget/current')
export const generateBudget    = (data) => API.post('/api/budget/generate', data)