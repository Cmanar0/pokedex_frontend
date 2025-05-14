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
/* Keep your existing styles as-is */
.dashboard {
  min-height: 100vh;
  background-color: #f8fafc;
  width: 100%;
}

.dashboard-nav {
  background: white;
  padding: 1rem 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.nav-brand h1 {
  margin: 0;
  font-size: 1.5rem;
  color: #2c3e50;
}

.logout-button {
  padding: 0.5rem 1rem;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.3s;
}

.logout-button:hover:not(:disabled) {
  background-color: #c82333;
}

.logout-button:disabled {
  background-color: #a0aec0;
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
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.welcome-card h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.5rem;
}

.welcome-card p {
  margin: 0.5rem 0 0;
  color: #666;
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
