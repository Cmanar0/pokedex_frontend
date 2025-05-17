<template>
  <div class="dashboard">
    <nav class="dashboard-nav">
      <div class="nav-brand">
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
      <div class="welcome-card">
        <h2>Welcome, {{ authStore.currentUser?.username || 'Trainer' }}!</h2>
        <p>Explore Pokémon, types, and abilities using the tools below.</p>
      </div>

      <!-- Inject your new ListMenu component -->
      <ListMenu />
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import ListMenu from '../components/ListMenu.vue';

const router = useRouter();
const authStore = useAuthStore();

const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background-color: var(--neutral-50);
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
  background-color: #DC2626;
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
</style>
