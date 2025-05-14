import { defineStore } from 'pinia'
import { login as apiLogin, logout as apiLogout, checkAuth } from '../api/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null
  }),

  getters: {
    isLoggedIn: (state) => state.isAuthenticated,
    currentUser: (state) => state.user,
    authError: (state) => state.error,
    isLoading: (state) => state.loading
  },

  actions: {
    async initializeAuth() {
      this.loading = true
      try {
        const response = await checkAuth()
        if (response.ok) {
          const userData = await response.json()
          this.isAuthenticated = true
          this.user = userData
        } else {
          this.isAuthenticated = false
          this.user = null
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        this.isAuthenticated = false
        this.user = null
      } finally {
        this.loading = false
      }
    },

    async login(username, password) {
      this.loading = true
      this.error = null
      try {
        const response = await apiLogin(username, password)
        if (response.ok) {
          const userData = await response.json()
          this.isAuthenticated = true
          this.user = userData
          return true
        } else {
          const errorData = await response.json()
          this.error = errorData.message || 'Login failed'
          return false
        }
      } catch (error) {
        console.error('Login error:', error)
        this.error = 'Network error occurred'
        return false
      } finally {
        this.loading = false
      }
    },

    async logout() {
      this.loading = true
      try {
        await apiLogout()
        this.isAuthenticated = false
        this.user = null
        this.error = null
      } catch (error) {
        console.error('Logout error:', error)
        this.error = 'Logout failed'
      } finally {
        this.loading = false
      }
    },

    clearError() {
      this.error = null
    }
  }
}) 