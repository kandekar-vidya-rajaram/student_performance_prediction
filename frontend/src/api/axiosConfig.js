import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000'; // Change to your Flask backend URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth endpoints
export const authAPI = {
  login: (username, password, role) =>
    api.post('/login', { username, password, role }),
  signup: (username, password, role) =>
    api.post('/signup', { username, password, role }),
  forgotPassword: (email) =>
    api.post('/forgot_password', { email }),
};

// Student endpoints
export const studentAPI = {
  getProfile: (studentId) =>
    api.get(`/student/${studentId}`),
  updateProfile: (studentId, data) =>
    api.put(`/student/${studentId}`, data),
  predictPerformance: (data) =>
    api.post('/predict', data),
  getAllStudents: () =>
    api.get('/students'),
  addStudent: (data) =>
    api.post('/student', data),
  deleteStudent: (studentId) =>
    api.delete(`/student/${studentId}`),
  submitFeedback: (data) =>
    api.post('/student/feedback', data),
  getFeedback: (studentId) =>
    api.get(`/student/${studentId}/feedback`),
};

// Chart/Analytics endpoints
export const chartsAPI = {
  getCharts: () =>
    api.get('/charts'),
  getPerformanceTrend: () =>
    api.get('/performance_trend'),
  getSummary: () =>
    api.get('/analytics/summary'),
  getPerformance: () =>
    api.get('/analytics/performance'),
  getCGPADistribution: () =>
    api.get('/analytics/cgpa-distribution'),
  getStudyHours: () =>
    api.get('/analytics/study-hours'),
  getTopPerformers: () =>
    api.get('/analytics/top-performers'),
  getAttendanceDistribution: () =>
    api.get('/analytics/attendance-distribution'),
};

export default api;
