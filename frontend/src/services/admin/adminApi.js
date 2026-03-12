import api from '../api';

const adminApi = {
    // Dashboard stats
    getDashboardStats: () => api.get('admin/dashboard/'),

    // Complaints management
    getComplaints: (params) => api.get('admin/complaints/', { params }),
    getComplaintDetail: (id) => api.get(`admin/complaints/${id}/`),
    updateComplaint: (id, data) => api.patch(`admin/complaints/${id}/`, data),
    deleteComplaint: (id) => api.delete(`admin/complaints/${id}/`),

    // Engagement monitoring
    getEngagementSummary: () => api.get('admin/engagement-summary/'),
};

export default adminApi;
