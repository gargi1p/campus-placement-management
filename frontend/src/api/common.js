import api from './axios';

export const assessmentApi = {
  start: (id, applicationId) => api.post(`/assessments/${id}/start`, { applicationId }),
  submit: (id, data) => api.post(`/assessments/${id}/submit`, data),
  getResult: (id) => api.get(`/assessments/${id}/result`),
  getResults: (id) => api.get(`/assessments/${id}/results`),
};

export const documentApi = {
  upload: (formData) => api.post('/documents/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getAll: () => api.get('/documents'),
  download: (id) => api.get(`/documents/${id}/download`),
  delete: (id) => api.delete(`/documents/${id}`),
};

export const offerApi = {
  create: (data) => api.post('/offers', data),
  getMy: () => api.get('/offers/my'),
  respond: (id, status) => api.patch(`/offers/${id}/respond`, { status }),
};

export const notificationApi = {
  getAll: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
};

export const analyticsApi = {
  getAnnouncements: () => api.get('/analytics/announcements'),
  getDashboard: () => api.get('/analytics/dashboard'),
  getPlacementRate: () => api.get('/analytics/placement-rate'),
  getDepartmentStats: () => api.get('/analytics/department-stats'),
  getYearWise: () => api.get('/analytics/year-wise'),
  getCompanySelections: () => api.get('/analytics/company-selections'),
  getPackageStats: () => api.get('/analytics/package-stats'),
};
