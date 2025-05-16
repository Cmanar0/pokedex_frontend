import { defineStore } from 'pinia';
import { getUserProfile, updateFavoritePokemon } from '../api/user';

export const useProfileStore = defineStore('profile', {
  state: () => ({
    favoritePokemon: [],
    loading: false,
    error: null,
    isUpdating: false
  }),

  getters: {
    getFavoritePokemon: (state) => state.favoritePokemon,
    isLoading: (state) => state.loading,
    hasError: (state) => state.error !== null,
    getError: (state) => state.error,
    isUpdatingFavorite: (state) => state.isUpdating
  },

  actions: {
    async fetchProfile() {
      if (this.loading) return;
      
      this.loading = true;
      this.error = null;
      
      try {
        const response = await getUserProfile();
        this.favoritePokemon = response.user.profile.favorite_pokemon;
      } catch (err) {
        this.error = err.message || 'Failed to fetch profile';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async toggleFavorite(pokemonName) {
      if (this.isUpdating) return;
      
      this.isUpdating = true;
      this.error = null;
      
      try {
        const response = await updateFavoritePokemon(pokemonName);
        this.favoritePokemon = response.favorite_pokemon;
        return response.message;
      } catch (err) {
        this.error = err.message || 'Failed to update favorites';
        throw err;
      } finally {
        this.isUpdating = false;
      }
    },

    isFavorite(pokemonName) {
      return this.favoritePokemon.includes(pokemonName);
    },

    clearError() {
      this.error = null;
    }
  }
}); 