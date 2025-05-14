import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/',
  withCredentials: true,
});

const getCSRFToken = () => {
  return document.cookie
    .split('; ')
    .find((row) => row.startsWith('csrftoken='))
    ?.split('=')[1];
};

api.interceptors.request.use((config) => {
  if (['post', 'put', 'patch', 'delete'].includes(config.method)) {
    const csrf = getCSRFToken();
    if (csrf) {
      config.headers['X-CSRFToken'] = csrf;
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
    } else {
    }
    return Promise.reject(
      error.response?.data || { message: 'Unexpected error occurred' }
    );
  }
);

const apiService = {
  async get(url, config = {}) {
    return (await api.get(url, config)).data;
  },

  async post(url, data = {}, config = {}) {
    return (await api.post(url, data, config)).data;
  },

  async put(url, data = {}, config = {}) {
    return (await api.put(url, data, config)).data;
  },

  async delete(url, config = {}) {
    return (await api.delete(url, config)).data;
  },

  async getRaw(url, config = {}) {
    return api.get(url, config); // full response object
  },
};

export default apiService;
