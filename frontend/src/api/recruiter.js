import api from './axios';

export const recruiterApi = {
  getProfile: () => api.get('/recruiters/profile'),
  updateCompany: (data) => api.put('/recruiters/company', data),
  getDrives: (params) => api.get('/recruiters/drives', { params }),
  createDrive: (data) => api.post('/recruiters/drives', data),
  updateDrive: (id, data) => api.put(`/recruiters/drives/${id}`, data),
  publishDrive: (id) => api.patch(`/recruiters/drives/${id}/publish`),
  getApplicants: (driveId, params) => api.get(`/recruiters/drives/${driveId}/applicants`, { params }),
  shortlistApplicant: (id) => api.patch(`/recruiters/applications/${id}/shortlist`),
  rejectApplicant: (id, reason) => api.patch(`/recruiters/applications/${id}/reject`, { reason }),
  createRound: (data) => api.post('/recruiters/rounds', data),
  scheduleInterview: (data) => api.post('/recruiters/interviews', data),
  recordInterviewResult: (id, data) => api.patch(`/recruiters/interviews/${id}/result`, data),
  createAssessment: (data) => api.post('/recruiters/assessments', data),
  addQuestion: (assessmentId, data) => api.post(`/recruiters/assessments/${assessmentId}/questions`, data),
};
