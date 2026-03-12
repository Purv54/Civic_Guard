import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/',
    withCredentials: true,
});

// Request interceptor: add tokens or handle headers
api.interceptors.request.use((config) => {
    console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`);

    // Attaching token from localStorage if present (requested by user)
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // CSRF Token from cookies
    const getCookie = (name) => {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    };

    const csrftoken = getCookie('csrftoken');
    if (csrftoken) {
        config.headers['X-CSRFToken'] = csrftoken;
    }

    return config;
}, (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
});

// Response interceptor: handle global errors
api.interceptors.response.use((response) => {
    return response;
}, (error) => {
    console.error('[API Response Error]', error.response || error);

    // Auto logout if token expires (401)
    if (error.response?.status === 401) {
        console.warn('Unauthorized request. Clearing auth state...');
        // We might want to trigger a logout here via context or window event
        // localStorage.removeItem('token');
        // window.location.href = '/login';
    }

    return Promise.reject(error);
});

export default api;
