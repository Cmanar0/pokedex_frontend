<template>
  <div class="dashboard">
    <nav class="dashboard-nav">
      <div class="nav-brand" @click="router.push('/dashboard')">
        <h1>Pokédex</h1>
      </div>
      <div class="nav-actions">
        <button
          @click="handleLogout"
          class="logout-button"
          :disabled="authStore.isLoading"
        >
          <span v-if="authStore.isLoading" class="loading-spinner"></span>
          <span v-else>Logout</span>
        </button>
      </div>
    </nav>

    <main class="dashboard-content">
      <div class="view-selector">
        <button
          @click="activeView = 'all'"
          :class="['view-button', { active: activeView === 'all' }]"
        >
          All Pokémon
        </button>
        <button
          @click="activeView = 'favorites'"
          :class="['view-button', { active: activeView === 'favorites' }]"
        >
          Favorite Pokémon
        </button>
      </div>

      <component :is="activeView === 'all' ? AllPokFilter : FavPokFilter" />
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { ref } from 'vue';
import AllPokFilter from '../components/AllPokFilter.vue';
import FavPokFilter from '../components/FavPokFilter.vue';

const router = useRouter();
const authStore = useAuthStore();
const activeView = ref('all');

const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background-color: var(--neutral-300);
  width: 100%;
}

.dashboard-nav {
  background: white;
  padding: 1rem 2rem;
  box-shadow: var(--shadow-sm);
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.nav-brand h1 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--primary-color);
}

.logout-button {
  padding: 0.5rem 1rem;
  background-color: var(--error);
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color var(--transition-fast);
}

.logout-button:hover:not(:disabled) {
  background-color: #dc2626;
}

.logout-button:disabled {
  background-color: var(--neutral-400);
  cursor: not-allowed;
}

.dashboard-content {
  padding: 2rem;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-card {
  background: white;
  padding: 2rem;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  margin-bottom: 2rem;
}

.welcome-card h2 {
  margin: 0;
  color: var(--neutral-900);
  font-size: 1.5rem;
}

.welcome-card p {
  margin: 0.5rem 0 0;
  color: var(--neutral-600);
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.view-selector {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.view-button {
  padding: 0.75rem 1.5rem;
  background-color: white;
  color: var(--neutral-700);
  border: 2px solid var(--neutral-300);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all var(--transition-fast);
}

.view-button:hover {
  background-color: var(--neutral-100);
  border-color: var(--neutral-400);
}

.view-button.active {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.view-button.active:hover {
  background-color: var(--primary-color-dark);
  border-color: var(--primary-color-dark);
}
</style>
