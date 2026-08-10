import api from './axios';

export const studentApi = {
  getProfile: () => api.get('/students/profile'),
  updateProfile: (data) => api.put('/students/profile', data),
  getDrives: (params) => api.get('/students/drives', { params }),
  getEligibleDrives: () => api.get('/students/drives/eligible'),
  checkEligibility: (driveId) => api.get(`/students/drives/${driveId}/eligibility`),
  applyToDrive: (driveId) => api.post(`/students/drives/${driveId}/apply`),
  getApplications: (params) => api.get('/students/applications', { params }),
};
