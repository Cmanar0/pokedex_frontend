<template>
  <div class="pokemon-detail-container">
    <div v-if="loading" class="loading">
      Loading...
    </div>
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    <div v-else-if="pokemon" class="pokemon-detail">
      <div class="pokemon-header">
        <h1>{{ formatName(pokemon.name) }}</h1>
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

      <div class="pokemon-content">
        <div class="pokemon-image">
          <img
            :src="pokemon.sprite"
            :alt="pokemon.name"
            class="sprite"
          />
        </div>

        <div class="pokemon-info">
          <div class="info-section">
            <h2>Abilities</h2>
            <ul>
              <li v-for="ability in pokemon.abilities" :key="ability">
                {{ formatName(ability) }}
              </li>
            </ul>
          </div>

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
import { getPokemonDetail } from '../api/pokemon';
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

// ===================== LIFECYCLE HOOKS =====================
onMounted(async () => {
  try {
    loading.value = true;
    error.value = null;
    pokemon.value = await getPokemonDetail(route.params.name as string);
    if (isAuthenticated.value) {
      await profileStore.fetchProfile();
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to fetch Pokémon details';
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.pokemon-detail-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.loading, .error {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: var(--neutral-700);
}

.error {
  color: var(--error);
}

.pokemon-detail {
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  padding: 2rem;
}

.pokemon-header {
  text-align: center;
  margin-bottom: 2rem;
}

.pokemon-header h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: var(--neutral-900);
  text-transform: capitalize;
}

.types {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.type-badge {
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius-xl);
  color: white;
  font-weight: 500;
  font-size: 0.875rem;
  text-transform: capitalize;
}

/* Pokemon Type Colors */
.type-badge.normal { background-color: var(--type-normal); }
.type-badge.fire { background-color: var(--type-fire); }
.type-badge.water { background-color: var(--type-water); }
.type-badge.electric { background-color: var(--type-electric); }
.type-badge.grass { background-color: var(--type-grass); }
.type-badge.ice { background-color: var(--type-ice); }
.type-badge.fighting { background-color: var(--type-fighting); }
.type-badge.poison { background-color: var(--type-poison); }
.type-badge.ground { background-color: var(--type-ground); }
.type-badge.flying { background-color: var(--type-flying); }
.type-badge.psychic { background-color: var(--type-psychic); }
.type-badge.bug { background-color: var(--type-bug); }
.type-badge.rock { background-color: var(--type-rock); }
.type-badge.ghost { background-color: var(--type-ghost); }
.type-badge.dragon { background-color: var(--type-dragon); }
.type-badge.dark { background-color: var(--type-dark); }
.type-badge.steel { background-color: var(--type-steel); }
.type-badge.fairy { background-color: var(--type-fairy); }

.pokemon-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.pokemon-image {
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--neutral-50);
  border-radius: var(--border-radius-lg);
  padding: 2rem;
}

.sprite {
  max-width: 200px;
  height: auto;
}

.pokemon-info {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.info-section {
  background: var(--neutral-50);
  padding: 1.5rem;
  border-radius: var(--border-radius-lg);
}

.info-section h2 {
  color: var(--neutral-900);
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.info-section ul {
  list-style: none;
  padding: 0;
}

.info-section li {
  padding: 0.5rem 0;
  color: var(--neutral-700);
  text-transform: capitalize;
}

.stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.stat {
  background: white;
  padding: 1rem;
  border-radius: var(--border-radius-md);
  text-align: center;
}

.stat-label {
  display: block;
  color: var(--neutral-600);
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.stat-value {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--neutral-900);
}

.pokemon-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  font-weight: 500;
  transition: all var(--transition-fast);
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--primary-dark);
}

.btn-secondary {
  padding: 0.75rem 1.5rem;
  background-color: var(--neutral-200);
  color: var(--neutral-700);
  border: none;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  font-weight: 500;
  transition: all var(--transition-fast);
}

.btn-secondary:hover:not(:disabled) {
  background-color: var(--neutral-300);
}

.btn-secondary:disabled {
  background-color: var(--neutral-300);
  color: var(--neutral-500);
  cursor: not-allowed;
}
</style>
