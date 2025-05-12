import { defineStore } from 'pinia'
import { login as apiLogin, logout as apiLogout, checkAuth } from '../api/auth'
import { useRouter } from 'vue-router'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: false,
  }),

  actions: {
    async login(username, password) {
      try {
        const response = await apiLogin(username, password)
        if (response.ok) {
          this.isAuthenticated = true
          return true
        }
        return false
      } catch (error) {
        console.error('Login error:', error)
        return false
      }
    },

    async logout() {
      try {
        await apiLogout()
        this.isAuthenticated = false
      } catch (error) {
        console.error('Logout error:', error)
      }
    },

    async checkAuthStatus() {
      try {
        const response = await checkAuth()
        this.isAuthenticated = response.ok
        return response.ok
      } catch (error) {
        console.error('Auth check error:', error)
        this.isAuthenticated = false
        return false
      }
    }
  }
}) 