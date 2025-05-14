import { defineStore } from 'pinia';
import {
  login as apiLogin,
  logout as apiLogout,
  checkAuth,
  getCSRFToken as apiGetCSRFToken,
} from '../api/auth';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null,
  }),

  getters: {
    isLoggedIn: (state) => state.isAuthenticated,
    currentUser: (state) => state.user,
    authError: (state) => state.error,
    isLoading: (state) => state.loading,
  },

  actions: {
    async getCSRFToken() {
      try {
        await apiGetCSRFToken();
      } catch (error) {
        console.error('Failed to get CSRF token:', error);
      }
    },

    async initializeAuth() {
      this.loading = true;
      try {
        const response = await checkAuth();
        this.isAuthenticated = true;
        this.user = response.user;
      } catch (error) {
        this.isAuthenticated = false;
        this.user = null;
      } finally {
        this.loading = false;
      }
    },

    async login(username, password) {
      this.loading = true;
      this.error = null;
      try {
        await this.getCSRFToken();
        const response = await apiLogin({ username, password });
        this.isAuthenticated = true;
        this.user = response.user || { username }; // adjust based on backend
        return true;
      } catch (error) {
        this.error = error.message || 'Login failed';
        return false;
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      this.loading = true;
      try {
        await apiLogout();
        this.isAuthenticated = false;
        this.user = null;
        this.error = null;
      } catch (error) {
        this.error = 'Logout failed';
      } finally {
        this.loading = false;
      }
    },

    clearError() {
      this.error = null;
    },
  },
});
