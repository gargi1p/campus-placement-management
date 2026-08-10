import api from './axios';

export const adminApi = {
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleUserStatus: (id) => api.patch(`/admin/users/${id}/toggle-status`),
  getStudents: (params) => api.get('/admin/students', { params }),
  getRecruiters: () => api.get('/admin/recruiters'),
  approveRecruiter: (id) => api.patch(`/admin/recruiters/${id}/approve`),
  getDepartments: () => api.get('/admin/departments'),
  createDepartment: (data) => api.post('/admin/departments', data),
  getCompanies: (params) => api.get('/admin/companies', { params }),
  createCompany: (data) => api.post('/admin/companies', data),
  getDrives: (params) => api.get('/admin/drives', { params }),
  getApplications: (params) => api.get('/admin/applications', { params }),
  getInterviews: () => api.get('/admin/interviews'),
  getAssessments: () => api.get('/admin/assessments'),
  getOffers: () => api.get('/admin/offers'),
  getDocuments: () => api.get('/admin/documents'),
  createAnnouncement: (data) => api.post('/admin/announcements', data),
  getAnnouncements: () => api.get('/admin/announcements'),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
};
