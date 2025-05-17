<template>
  <div class="pokemon-detail-fullscreen">
    <div v-if="loading" class="loading">
      Loading...
    </div>
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
          <div v-if="evolutionChainLoading" class="loading">Loading evolution chain...</div>
          <div v-else-if="evolutionChainError" class="error">{{ evolutionChainError }}</div>
          <div v-else class="evolution-steps-row">
            <div
              v-for="(pokemon, index) in renderEvolutionChain(evolutionChain)"
              :key="pokemon"
              class="evolution-step-row"
            >
              <span class="pokemon-name-pill">{{ formatName(pokemon) }}</span>
              <span v-if="index < renderEvolutionChain(evolutionChain).length - 1" class="evolution-arrow-row">→</span>
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
            'btn-secondary': isFavorite
          }"
          @click="handleFavorite"
          :disabled="!isAuthenticated || profileStore.isUpdatingFavorite"
        >
          {{ isFavorite ? 'Remove from Favorites' : 'Add to Favorites' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// ===================== IMPORTS =====================
import { onMounted, ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { getPokemonDetail, getPokemonEvolutionChain } from '../api/pokemon';
import { useProfileStore } from '../stores/profile';
import { useAuthStore } from '../stores/auth';

// ===================== STORES =====================
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
const isFavorite = computed(() => profileStore.isFavorite(route.params.name as string));

// ===================== METHODS =====================
const formatName = (name) => {
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const handleFavorite = async () => {
  try {
    await profileStore.toggleFavorite(route.params.name as string);
  } catch (err: any) {
    error.value = err.message || 'Failed to update favorites';
  }
};

const fetchEvolutionChain = async (name) => {
  try {
    evolutionChainLoading.value = true;
    evolutionChainError.value = null;
    evolutionChain.value = await getPokemonEvolutionChain(name);
  } catch (err) {
    evolutionChainError.value = err.message || 'Failed to fetch evolution chain';
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
.pokemon-detail-fullscreen {
  min-height: 100vh;
  height: 100vh;
  width: 100vw;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 1rem;
}

.pokemon-detail-card {
  background: white;
  border-radius: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 2rem;
  max-width: 900px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  height: calc(100vh - 2rem);
  overflow-y: auto;
}

.pokemon-header {
  text-align: center;
  margin-bottom: 0.5rem;
  width: 100%;
}

.pokemon-header h1 {
  font-size: 2.25rem;
  margin-bottom: 0.75rem;
  color: #1e293b;
  text-transform: capitalize;
  letter-spacing: 0.025em;
}

.pokemon-main-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  flex: 1;
  min-height: 0;
}

.content-row {
  display: flex;
  gap: 2rem;
  width: 100%;
  justify-content: center;
  align-items: stretch;
}

.pokemon-image {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f1f5f9;
  border-radius: 1rem;
  padding: 1.5rem;
  min-width: 180px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  height: 100%;
}

.sprite {
  max-width: 140px;
  height: auto;
}

.types-section {
  flex: 1;
  min-width: 200px;
  display: flex;
  flex-direction: column;
}

.types {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-start;
  flex-wrap: wrap;
  padding: 0.25rem 0;
  flex: 1;
  align-items: center;
}

.type-badge {
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: capitalize;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  min-width: 80px;
  text-align: center;
}

.info-section {
  background: #f8fafc;
  padding: 1.25rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  flex: 1;
  min-width: 200px;
}

.info-section h2 {
  color: #1e293b;
  margin-bottom: 0.75rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.info-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.info-section li {
  padding: 0.375rem 0;
  color: #475569;
  text-transform: capitalize;
  font-size: 1rem;
}

.stats {
  display: flex;
  gap: 1.25rem;
  justify-content: flex-start;
}

.stat {
  background: white;
  padding: 0.75rem 1.25rem;
  border-radius: 0.75rem;
  text-align: center;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  min-width: 120px;
}

.stat-label {
  display: block;
  color: #64748b;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
}

.stat-value {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
}

.evolution-chain-row {
  width: 100%;
  background: #f1f5f9;
  border-radius: 0.75rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  padding: 1.25rem;
  margin: 0.5rem 0;
}

.evolution-chain-row h2 {
  margin-bottom: 0.75rem;
  color: #1e293b;
  font-size: 1.25rem;
  font-weight: 600;
  text-align: center;
}

.evolution-steps-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  width: 100%;
  flex-wrap: nowrap;
  overflow-x: auto;
  padding: 0.5rem 0;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.evolution-steps-row::-webkit-scrollbar {
  display: none;
}

.evolution-step-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.pokemon-name-pill {
  font-size: 1rem;
  color: #1e293b;
  text-transform: capitalize;
  padding: 0.5rem 1rem;
  background: white;
  border-radius: 9999px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  font-weight: 500;
  white-space: nowrap;
}

.evolution-arrow-row {
  color: #64748b;
  font-size: 1.5rem;
  font-weight: bold;
}

.pokemon-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 0.5rem;
  width: 100%;
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2563eb;
}

.btn-secondary {
  padding: 0.75rem 1.5rem;
  background-color: #e2e8f0;
  color: #475569;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #cbd5e1;
}

.btn-secondary:disabled {
  background-color: #f1f5f9;
  color: #94a3b8;
  cursor: not-allowed;
}

@media (max-width: 900px) {
  .content-row {
    flex-direction: column;
    gap: 1.25rem;
  }

  .pokemon-image {
    width: 100%;
    min-width: 0;
    aspect-ratio: 1;
  }

  .types-section {
    width: 100%;
    min-width: 0;
  }

  .types {
    justify-content: center;
  }
}

/* Type badge colors */
.type-badge.normal { background-color: #a8a878; }
.type-badge.fire { background-color: #f08030; }
.type-badge.water { background-color: #6890f0; }
.type-badge.electric { background-color: #f8d030; }
.type-badge.grass { background-color: #78c850; }
.type-badge.ice { background-color: #98d8d8; }
.type-badge.fighting { background-color: #c03028; }
.type-badge.poison { background-color: #a040a0; }
.type-badge.ground { background-color: #e0c068; }
.type-badge.flying { background-color: #a890f0; }
.type-badge.psychic { background-color: #f85888; }
.type-badge.bug { background-color: #a8b820; }
.type-badge.rock { background-color: #b8a038; }
.type-badge.ghost { background-color: #705898; }
.type-badge.dragon { background-color: #7038f8; }
.type-badge.dark { background-color: #705848; }
.type-badge.steel { background-color: #b8b8d0; }
.type-badge.fairy { background-color: #ee99ac; }
</style>
