<template>
  <div class="pokemon-detail-page">
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

    <main class="pokemon-detail-content">
      <div v-if="loading" class="loading">Loading...</div>
      <div v-else-if="error" class="error">
        {{ error }}
      </div>
      <div v-else-if="pokemon" class="pokemon-detail-card">
        <div class="pokemon-header">
          <h1>{{ formatName(pokemon.name) }}</h1>
        </div>
        <div class="pokemon-main-content">
          <div class="content-row">
            <div class="pokemon-image">
              <img :src="pokemon.sprite" :alt="pokemon.name" class="sprite" />
            </div>
            <div class="info-section types-section">
              <h2>Types</h2>
              <div class="types">
                <span
                  v-for="type in pokemon.types"
                  :key="type"
                  :class="['type-badge', type.toLowerCase()]"
                >
                  {{ type }}
                </span>
              </div>
            </div>
          </div>

          <div class="content-row">
            <div class="info-section">
              <h2>Stats</h2>
              <div class="stats">
                <div class="stat">
                  <span class="stat-label">Height</span>
                  <span class="stat-value">{{ pokemon.height / 10 }}m</span>
                </div>
                <div class="stat">
                  <span class="stat-label">Weight</span>
                  <span class="stat-value">{{ pokemon.weight / 10 }}kg</span>
                </div>
              </div>
            </div>
            <div class="info-section">
              <h2>Abilities</h2>
              <ul>
                <li v-for="ability in pokemon.abilities" :key="ability">
                  {{ formatName(ability) }}
                </li>
              </ul>
            </div>
          </div>

          <div class="evolution-chain-row" v-if="evolutionChain">
            <h2>Evolution Chain</h2>
            <div v-if="evolutionChainLoading" class="loading">
              Loading evolution chain...
            </div>
            <div v-else-if="evolutionChainError" class="error">
              {{ evolutionChainError }}
            </div>
            <div v-else class="evolution-steps-row">
              <div
                v-for="(pokemon, index) in renderEvolutionChain(evolutionChain)"
                :key="pokemon"
                class="evolution-step-row"
              >
                <span class="pokemon-name-pill">{{ formatName(pokemon) }}</span>
                <span
                  v-if="index < renderEvolutionChain(evolutionChain).length - 1"
                  class="evolution-arrow-row"
                  >→</span
                >
              </div>
            </div>
          </div>
        </div>
        <div class="pokemon-actions">
          <router-link
            :to="`/compare?left=${pokemon.name}`"
            class="btn btn-primary"
          >
            Compare
          </router-link>
          <button
            class="btn"
            :class="{
              'btn-primary': !isFavorite,
              'btn-secondary': isFavorite,
            }"
            @click="handleFavorite"
            :disabled="!isAuthenticated || profileStore.isUpdatingFavorite"
          >
            {{ isFavorite ? 'Remove from Favorites' : 'Add to Favorites' }}
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
// ===================== IMPORTS =====================
import { onMounted, ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getPokemonDetail, getPokemonEvolutionChain } from '../api/pokemon';
import { useProfileStore } from '../stores/profile';
import { useAuthStore } from '../stores/auth';

// ===================== STORES =====================
const router = useRouter();
const profileStore = useProfileStore();
const authStore = useAuthStore();

// ===================== STATE =====================
const route = useRoute();
const pokemon = ref<any>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const evolutionChain = ref(null);
const evolutionChainLoading = ref(false);
const evolutionChainError = ref(null);

// ===================== COMPUTED =====================
const isAuthenticated = computed(() => authStore.isAuthenticated);
const isFavorite = computed(() =>
  profileStore.isFavorite(route.params.name as string)
);

// ===================== METHODS =====================
const formatName = (name) => {
  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const handleFavorite = async () => {
  try {
    await profileStore.toggleFavorite(route.params.name as string);
  } catch (err: any) {
    error.value = err.message || 'Failed to update favorites';
  }
};

const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};

const fetchEvolutionChain = async (name) => {
  try {
    evolutionChainLoading.value = true;
    evolutionChainError.value = null;
    evolutionChain.value = await getPokemonEvolutionChain(name);
  } catch (err) {
    evolutionChainError.value =
      err.message || 'Failed to fetch evolution chain';
  } finally {
    evolutionChainLoading.value = false;
  }
};

const renderEvolutionChain = (chain) => {
  if (!chain) return null;

  const result = [];
  let current = chain;

  while (current) {
    result.push(current.name);
    current = current.evolves_to?.[0];
  }

  return result;
};

// ===================== LIFECYCLE HOOKS =====================
onMounted(async () => {
  try {
    loading.value = true;
    error.value = null;
    pokemon.value = await getPokemonDetail(route.params.name as string);
    if (isAuthenticated.value) {
      await profileStore.fetchProfile();
    }
    await fetchEvolutionChain(route.params.name as string);
  } catch (err: any) {
    error.value = err.message || 'Failed to fetch Pokémon details';
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.pokemon-detail-page {
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
  cursor: pointer;
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

.pokemon-detail-content {
  padding: 1rem;
  width: 100%;
  max-width: 100%;
  margin: 0;
  height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
}

.pokemon-detail-card {
  background: white;
  border-radius: var(--border-radius-lg);
  padding: 1.5rem;
  box-shadow: var(--shadow-md);
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.pokemon-header {
  margin-bottom: 1rem;
}

.pokemon-header h1 {
  margin: 0;
  color: var(--neutral-900);
  font-size: 1.75rem;
  text-transform: capitalize;
}

.pokemon-main-content {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  flex: 1;
  overflow: hidden;
}

.content-row {
  display: flex;
  gap: 1rem;
  align-items: stretch;
  height: 100%;
}

.pokemon-image {
  flex: 0 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--neutral-50);
  border-radius: var(--border-radius-lg);
  padding: 1rem;
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
  height: 300px;
}

.sprite {
  width: 100%;
  height: auto;
  max-width: 180px;
  object-fit: contain;
}

.info-section {
  flex: 1;
  background: var(--neutral-50);
  padding: 1rem;
  border-radius: var(--border-radius-lg);
  display: flex;
  flex-direction: column;
  min-width: 0;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  height: 100%;
}

.info-section h2 {
  margin: 0 0 0.75rem;
  color: var(--neutral-900);
  font-size: 1.125rem;
}

.types {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
  padding: 0.5rem;
}

.type-badge {
  padding: 0.375rem 0.75rem;
  border-radius: var(--border-radius-full);
  color: white;
  font-size: 0.875rem;
  text-transform: capitalize;
  white-space: nowrap;
}

.stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  padding: 0.5rem;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--neutral-600);
  text-transform: uppercase;
}

.stat-value {
  font-size: 1rem;
  color: var(--neutral-900);
  font-weight: 500;
}

.info-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.info-section li {
  text-align: center;
  padding: 0.25rem 0;
}

.pokemon-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--neutral-200);
  flex-wrap: wrap;
}

.pokemon-actions .btn {
  flex: 1;
  min-width: 150px;
  text-align: center;
}

.evolution-chain-row {
  background: var(--neutral-50);
  padding: 1rem;
  border-radius: var(--border-radius-lg);
  grid-column: 1 / -1;
  text-align: center;
}

.evolution-chain-row h2 {
  margin: 0 0 0.75rem;
  color: var(--neutral-900);
  font-size: 1.125rem;
}

.evolution-steps-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  padding: 0.5rem;
}

.evolution-step-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.pokemon-name-pill {
  background: white;
  padding: 0.375rem 0.75rem;
  border-radius: var(--border-radius-full);
  color: var(--neutral-900);
  font-size: 0.875rem;
  text-transform: capitalize;
  white-space: nowrap;
}

.evolution-arrow-row {
  color: var(--neutral-400);
  font-size: 1.125rem;
}

/* Type colors */
.normal { background-color: #A8A878; }
.fire { background-color: #F08030; }
.water { background-color: #6890F0; }
.electric { background-color: #F8D030; }
.grass { background-color: #78C850; }
.ice { background-color: #98D8D8; }
.fighting { background-color: #C03028; }
.poison { background-color: #A040A0; }
.ground { background-color: #E0C068; }
.flying { background-color: #A890F0; }
.psychic { background-color: #F85888; }
.bug { background-color: #A8B820; }
.rock { background-color: #B8A038; }
.ghost { background-color: #705898; }
.dragon { background-color: #7038F8; }
.dark { background-color: #705848; }
.steel { background-color: #B8B8D0; }
.fairy { background-color: #EE99AC; }

/* Responsive adjustments */
@media (max-width: 1200px) {
  .pokemon-detail-content {
    height: auto;
    min-height: calc(100vh - 64px);
  }

  .pokemon-detail-card {
    overflow: visible;
  }

  .pokemon-main-content {
    grid-template-columns: 1fr;
    overflow: visible;
    align-items: center;
  }

  .content-row {
    flex-direction: column;
    align-items: center;
    width: 100%;
    height: auto;
  }

  .pokemon-image {
    max-width: 250px;
    height: 250px;
  }

  .info-section {
    max-width: 500px;
    height: auto;
  }
}

@media (max-width: 768px) {
  .pokemon-detail-content {
    padding: 0.75rem;
  }

  .pokemon-detail-card {
    padding: 1rem;
  }

  .info-section {
    max-width: 100%;
  }

  .pokemon-header h1 {
    font-size: 1.5rem;
  }

  .info-section h2 {
    font-size: 1rem;
  }

  .type-badge {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
  }

  .stat-label {
    font-size: 0.7rem;
  }

  .stat-value {
    font-size: 0.875rem;
  }

  .pokemon-name-pill {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
  }

  .evolution-arrow-row {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .pokemon-detail-content {
    padding: 0.5rem;
  }

  .pokemon-detail-card {
    padding: 0.75rem;
  }

  .pokemon-image {
    max-width: 200px;
  }

  .pokemon-actions {
    flex-direction: column;
  }

  .pokemon-actions .btn {
    width: 100%;
  }

  .stats {
    grid-template-columns: 1fr;
  }

  .evolution-steps-row {
    gap: 0.5rem;
  }
}

/* Loading and error states */
.loading, .error {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  width: 100%;
  text-align: center;
  color: var(--neutral-600);
}

.error {
  color: var(--error);
}
</style>
