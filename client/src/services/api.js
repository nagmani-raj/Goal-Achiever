import axios from 'axios';

const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.trim() ||
  'https://goal-achiever-bqb1.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Monthly Goals ───
export const monthlyAPI = {
  getAll: () => api.get('/monthly'),
  getByMonth: (month) => api.get(`/monthly/${month}`),
  create: (data) => api.post('/monthly', data),
  toggle: (id) => api.patch(`/monthly/${id}/toggle`),
  delete: (id) => api.delete(`/monthly/${id}`),
};

// ─── Daily Goals ───
export const dailyAPI = {
  getAllTopics: () => api.get('/daily'),
  get: (date) => api.get(`/daily/${date}`),
  addTopic: (date, data) => api.post(`/daily/${date}/topic`, data),
  addWork: (date, topicId, data) => api.post(`/daily/${date}/topic/${topicId}/work`, data),
  toggleWork: (date, topicId, workId) => api.patch(`/daily/${date}/topic/${topicId}/work/${workId}/toggle`),
  deleteTopic: (date, topicId) => api.delete(`/daily/${date}/topic/${topicId}`),
  deleteWork: (date, topicId, workId) => api.delete(`/daily/${date}/topic/${topicId}/work/${workId}`),
};

// ─── Streak ───
export const streakAPI = {
  get: () => api.get('/streak'),
  getHistory: () => api.get('/streak/history'),
  calculate: (date) => api.post('/streak/calculate', { date }),
};

// Target Topics
export const targetAPI = {
  getAll: () => api.get('/targets'),
  create: (data) => api.post('/targets', data),
  toggleQuestion: (topicId, questionId) => api.patch(`/targets/${topicId}/questions/${questionId}/toggle`),
  extend: (topicId, extraDays) => api.patch(`/targets/${topicId}/extend`, { extraDays }),
  removeName: (name, listType) => api.patch('/targets/names/remove', { name, listType }),
  reset: () => api.delete('/targets'),
  delete: (topicId) => api.delete(`/targets/${topicId}`),
};

export default api;
