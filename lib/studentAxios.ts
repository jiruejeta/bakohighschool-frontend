import axios from 'axios';
import Cookies from 'js-cookie';

const studentApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
});

studentApi.interceptors.request.use(
  (config) => {
    const token = Cookies.get('bako_student_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (!(config.data instanceof FormData) && config.headers) {
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  (error) => Promise.reject(error)
);

studentApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('bako_student_token');
      Cookies.remove('bako_student');
      if (typeof window !== 'undefined') {
        window.location.href = '/student/login';
      }
    }
    return Promise.reject(error);
  }
);

export default studentApi;