import api from './api';

const notificationApi = {
    getNotifications: () => api.get('/notifications/'),
    markAsRead: (id) => api.patch(`/notifications/${id}/read/`),
};

export default notificationApi;
