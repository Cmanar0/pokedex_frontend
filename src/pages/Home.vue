 <template>
  <div class="home-page">
    <nav class="top-bar">
      <div class="nav-brand" @click="router.push('/')">
        <h1>Pokédex</h1>
      </div>
      <div class="nav-actions">
        <template v-if="!authStore.isAuthenticated">
          <button
            @click="router.push('/login')"
            class="auth-button login"
          >
            Login
          </button>
          <button
            @click="router.push('/register')"
            class="auth-button register"
          >
            Register
          </button>
        </template>
        <template v-else>
          <button
            @click="router.push('/dashboard')"
            class="auth-button dashboard"
          >
            Dashboard
          </button>
          <button
            @click="handleLogout"
            class="auth-button logout"
            :disabled="authStore.isLoading"
          >
            <span v-if="authStore.isLoading" class="loading-spinner"></span>
            <span v-else>Logout</span>
          </button>
        </template>
      </div>
    </nav>

    <main class="home-content">
      <div class="hero-section">
        <h2>Welcome to Pokédex</h2>
        <p>Explore the world of Pokémon, compare stats, and build your favorite collection!</p>
        <div class="cta-buttons">
          <button
            v-if="!authStore.isAuthenticated"
            @click="router.push('/register')"
            class="cta-button primary"
          >
            Get Started
          </button>
          <button
            v-else
            @click="router.push('/dashboard')"
            class="cta-button primary"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const handleLogout = async () => {
  await authStore.logout();
  router.push('/');
};
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background-color: var(--neutral-50);
}

.top-bar {
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
  cursor: pointer;
}

.nav-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.auth-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  font-size: 0.875rem;
  transition: all var(--transition-fast);
}

.auth-button.login {
  background-color: var(--primary-color);
  color: white;
}

.auth-button.login:hover {
  background-color: var(--primary-dark);
}

.auth-button.register {
  background-color: var(--secondary-color);
  color: white;
}

.auth-button.register:hover {
  background-color: var(--secondary-dark);
}

.auth-button.dashboard {
  background-color: var(--primary-color);
  color: white;
}

.auth-button.dashboard:hover {
  background-color: var(--primary-dark);
}

.auth-button.logout {
  background-color: var(--error);
  color: white;
}

.auth-button.logout:hover:not(:disabled) {
  background-color: #dc2626;
}

.auth-button.logout:disabled {
  background-color: var(--neutral-400);
  cursor: not-allowed;
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

.home-content {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.hero-section {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  margin-top: 2rem;
}

.hero-section h2 {
  font-size: 2.5rem;
  color: var(--neutral-900);
  margin-bottom: 1rem;
}

.hero-section p {
  font-size: 1.125rem;
  color: var(--neutral-600);
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.cta-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  font-size: 1rem;
  transition: all var(--transition-fast);
}

.cta-button.primary {
  background-color: var(--primary-color);
  color: white;
}

.cta-button.primary:hover {
  background-color: var(--primary-dark);
  transform: translateY(-2px);
}

@media (max-width: 640px) {
  .top-bar {
    padding: 1rem;
  }

  .nav-brand h1 {
    font-size: 1.25rem;
  }

  .auth-button {
    padding: 0.375rem 0.75rem;
    font-size: 0.75rem;
  }

  .hero-section {
    padding: 2rem 1rem;
  }

  .hero-section h2 {
    font-size: 2rem;
  }

  .hero-section p {
    font-size: 1rem;
  }
}
</style>