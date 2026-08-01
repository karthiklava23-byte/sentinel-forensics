import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL 
  ? `${import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')}/api`
  : 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token to all outgoing requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sentinel_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authAPI = {
  login:    (email, password) => api.post('/auth/login', { email, password }),
  register: (userData)        => api.post('/auth/register', userData),
  getMe:    ()                => api.get('/auth/me'),
};

export const casesAPI = {
  getCases:     (params)           => api.get('/cases', { params }),
  getCaseDetail:(caseId)           => api.get(`/cases/${caseId}`),
  createCase:   (caseData)         => api.post('/cases', caseData),
  updateCase:   (caseId, data)     => api.put(`/cases/${caseId}`, data),
  deleteCase:   (caseId)           => api.delete(`/cases/${caseId}`),
};

export const evidenceAPI = {
  uploadEvidence: (caseId, formData) =>
    api.post(`/evidence/upload/${caseId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  analyzeEmail: (formData) =>
    api.post('/evidence/analyze-email', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  analyzeUrl: (url) => {
    const fd = new FormData();
    fd.append('url', url);
    return api.post('/evidence/analyze-url', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  analyzePcap: (formData) =>
    api.post('/evidence/analyze-pcap', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  analyzeMalware: (formData) =>
    api.post('/evidence/analyze-malware', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export const malwareAPI = {
  analyzeFile: (formData) =>
    api.post('/malware/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export const threatIntelAPI = {
  lookupIOC:     (ioc_type, ioc_value) => api.post('/threat-intel/lookup', { ioc_type, ioc_value }),
  lookupBulk:    (iocs)               => api.post('/threat-intel/lookup/bulk', { iocs }),
  getCaseTI:     (caseId)             => api.get(`/threat-intel/case/${caseId}`),
  getGlobalSummary: ()                => api.get('/threat-intel/summary'),
};

export const geminiAPI = {
  chat:         (req)    => api.post('/gemini/chat', req),
  generateReport:(caseId) => api.get(`/gemini/report/${caseId}`),
};

export const analyticsAPI = {
  getDashboardMetrics: () => api.get('/analytics/dashboard'),
};

export const adminAPI = {
  getUsers:      ()            => api.get('/admin/users'),
  getLogs:       ()            => api.get('/admin/logs'),
  updateSettings:(geminiApiKey) =>
    api.post(`/admin/settings?gemini_api_key=${encodeURIComponent(geminiApiKey)}`),
};

export default api;
