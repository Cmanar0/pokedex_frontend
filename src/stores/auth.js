import { defineStore } from 'pinia';
import {
  login as apiLogin,
  logout as apiLogout,
  checkAuth,
  getCSRFToken as apiGetCSRFToken,
  register as apiRegister,
} from '../api/auth';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isLoading: false,
    authError: null,
    isAuthenticated: false
  }),

  getters: {
    isLoggedIn: (state) => state.isAuthenticated,
    currentUser: (state) => state.user,
    authError: (state) => state.authError,
    loadingState: (state) => state.isLoading,
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
      this.isLoading = true;
      try {
        const response = await checkAuth();
        this.isAuthenticated = true;
        this.user = response.user;
      } catch (error) {
        this.isAuthenticated = false;
        this.user = null;
      } finally {
        this.isLoading = false;
      }
    },

    async login(username, password) {
      this.isLoading = true;
      this.authError = null;
      try {
        const response = await apiLogin(username, password);
        this.user = response.user;
        this.isAuthenticated = true;
        return true;
      } catch (err) {
        this.authError = err.message || 'Login failed';
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    async register(userData) {
      this.isLoading = true;
      this.authError = null;
      try {
        const response = await apiRegister(userData);
        this.user = response.user;
        this.isAuthenticated = true;
        return true;
      } catch (err) {
        this.authError = err.message || 'Registration failed';
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    async logout() {
      this.isLoading = true;
      try {
        await apiLogout();
        this.user = null;
        this.isAuthenticated = false;
      } catch (err) {
        this.authError = err.message || 'Logout failed';
      } finally {
        this.isLoading = false;
      }
    },

    async checkAuth() {
      try {
        const response = await checkAuth();
        this.isAuthenticated = response.authenticated;
        return this.isAuthenticated;
      } catch {
        this.isAuthenticated = false;
        return false;
      }
    },

    clearError() {
      this.authError = null;
    }
  },
});
