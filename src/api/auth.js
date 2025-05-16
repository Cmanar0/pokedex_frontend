import apiService from '../services/api-request';

export const authAPI = {
  async getCSRFToken() {
    return await apiService.getRaw('/csrf/');
  },

  async login(credentials) {
    return await apiService.post('/auth/login/', credentials);
  },

  async register(userData) {
    return await apiService.post('/auth/register/', userData);
  },

  async logout() {
    return await apiService.post('/auth/logout/', {});
  },

  async checkAuth() {
    return await apiService.get('/auth/me/');
  },
};

export const login = authAPI.login;
export const register = authAPI.register;
export const logout = authAPI.logout;
export const checkAuth = authAPI.checkAuth;
export const getCSRFToken = authAPI.getCSRFToken;

export default authAPI;
