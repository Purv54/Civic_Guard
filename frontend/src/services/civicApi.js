import api from './api';

const civicApi = {
    getHeatmapData: () => api.get('/public/heatmap/'),
    getRouteRisk: (params) => api.get('/public/route-risk/', { params }),
    getTrends: () => api.get('/admin/trends/'),
    getEmergencyStatus: () => api.get('/admin/emergency/'),
    updateEmergencyMode: (data) => api.patch('/admin/emergency/', data),
};

export default civicApi;
