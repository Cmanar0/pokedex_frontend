<template>
  <div class="comparison-page">
    <nav class="dashboard-nav">
      <div class="nav-brand" @click="router.push('/dashboard')">
        <h1>Pokédex</h1>
      </div>
      <div class="nav-actions">
        <button @click="handleLogout" class="logout-button">
          <span>Logout</span>
        </button>
      </div>
    </nav>
    <div class="comparison-container">
      <!-- Left Pokemon Section -->
      <div class="comparison-section left-section">
        <div v-if="leftPokemon" class="pokemon-detail">
          <button class="close-button" @click="clearLeftPokemon">
            <span class="close-icon">×</span>
          </button>
          <div class="pokemon-header">
            <router-link
              :to="`/pokemon/${leftPokemon.name}`"
              class="pokemon-name-link"
            >
              <h1>{{ formatName(leftPokemon.name) }}</h1>
            </router-link>
            <div class="types">
              <span
                v-for="type in leftPokemon.types"
                :key="type"
                class="type-badge"
                :class="type.toLowerCase()"
              >
                {{ type }}
              </span>
            </div>
          </div>
          <div class="pokemon-content">
            <div class="pokemon-image">
              <img
                :src="leftPokemon.sprite"
                :alt="leftPokemon.name"
                class="sprite"
              />
            </div>
            <div class="pokemon-info">
              <div class="info-section">
                <h3>Abilities</h3>
                <ul>
                  <li v-for="ability in leftPokemon.abilities" :key="ability">
                    {{ formatName(ability) }}
                  </li>
                </ul>
              </div>
              <div class="info-section">
                <h3>Stats</h3>
                <div class="stats">
                  <div class="stat">
                    <span class="stat-label">Height</span>
                    <span class="stat-value"
                      >{{ leftPokemon.height / 10 }}m</span
                    >
                  </div>
                  <div class="stat">
                    <span class="stat-label">Weight</span>
                    <span class="stat-value"
                      >{{ leftPokemon.weight / 10 }}kg</span
                    >
                  </div>
                </div>
              </div>
              <div class="favorite-section" v-if="isAuthenticated">
                <button
                  class="btn"
                  :class="{
                    'btn-primary': !isFavorite(leftPokemon.name),
                    'btn-secondary': isFavorite(leftPokemon.name),
                  }"
                  @click="handleFavorite(leftPokemon.name)"
                  :disabled="profileStore.isUpdatingFavorite"
                >
                  {{
                    isFavorite(leftPokemon.name)
                      ? 'Remove from Favorites'
                      : 'Add to Favorites'
                  }}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          <ListMenu
            class="list-menu"
            @select-pokemon="selectLeftPokemon"
            :is-comparison-mode="true"
            :selected-position="'left'"
          />
        </div>
      </div>

      <!-- Middle Section -->
      <div class="comparison-section middle-section">
        <div v-if="leftPokemon && rightPokemon" class="comparison-content">
          <div class="comparison-header">
            <h2>Comparison</h2>
          </div>

          <!-- Stats Comparison -->
          <div class="comparison-group">
            <h3>Height</h3>
            <div class="comparison-values">
              <span class="value left"
                >{{ (leftPokemon.height / 10).toFixed(1) }}m</span
              >
              <div class="divider"></div>
              <span class="value right"
                >{{ (rightPokemon.height / 10).toFixed(1) }}m</span
              >
            </div>
          </div>

          <div class="comparison-group">
            <h3>Weight</h3>
            <div class="comparison-values">
              <span class="value left"
                >{{ (leftPokemon.weight / 10).toFixed(1) }}kg</span
              >
              <div class="divider"></div>
              <span class="value right"
                >{{ (rightPokemon.weight / 10).toFixed(1) }}kg</span
              >
            </div>
          </div>

          <!-- Types Comparison -->
          <div class="comparison-group">
            <h3>Types</h3>
            <div class="comparison-values">
              <div class="types left">
                <div
                  v-for="type in leftPokemon.types"
                  :key="`left-${type}`"
                  class="type-badge"
                  :class="type.toLowerCase()"
                >
                  {{ type }}
                </div>
              </div>
              <div class="divider"></div>
              <div class="types right">
                <div
                  v-for="type in rightPokemon.types"
                  :key="`right-${type}`"
                  class="type-badge"
                  :class="type.toLowerCase()"
                >
                  {{ type }}
                </div>
              </div>
            </div>
          </div>

          <!-- Abilities Comparison -->
          <div class="comparison-group">
            <h3>Abilities</h3>
            <div class="comparison-values">
              <div class="abilities left">
                <div
                  v-for="ability in leftPokemon.abilities"
                  :key="`left-${ability}`"
                  class="ability-badge"
                >
                  {{ formatName(ability) }}
                </div>
              </div>
              <div class="divider"></div>
              <div class="abilities right">
                <div
                  v-for="ability in rightPokemon.abilities"
                  :key="`right-${ability}`"
                  class="ability-badge"
                >
                  {{ formatName(ability) }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="comparison-instructions">
          <h2>Compare Pokémon</h2>
          <p>Select two Pokémon to compare their stats and abilities</p>
        </div>
      </div>

      <!-- Right Pokemon Section -->
      <div class="comparison-section right-section">
        <div v-if="rightPokemon" class="pokemon-detail">
          <button class="close-button" @click="clearRightPokemon">
            <span class="close-icon">×</span>
          </button>
          <div class="pokemon-header">
            <router-link
              :to="`/pokemon/${rightPokemon.name}`"
              class="pokemon-name-link"
            >
              <h1>{{ formatName(rightPokemon.name) }}</h1>
            </router-link>
            <div class="types">
              <span
                v-for="type in rightPokemon.types"
                :key="type"
                class="type-badge"
                :class="type.toLowerCase()"
              >
                {{ type }}
              </span>
            </div>
          </div>
          <div class="pokemon-content">
            <div class="pokemon-image">
              <img
                :src="rightPokemon.sprite"
                :alt="rightPokemon.name"
                class="sprite"
              />
            </div>
            <div class="pokemon-info">
              <div class="info-section">
                <h3>Abilities</h3>
                <ul>
                  <li v-for="ability in rightPokemon.abilities" :key="ability">
                    {{ formatName(ability) }}
                  </li>
                </ul>
              </div>
              <div class="info-section">
                <h3>Stats</h3>
                <div class="stats">
                  <div class="stat">
                    <span class="stat-label">Height</span>
                    <span class="stat-value"
                      >{{ rightPokemon.height / 10 }}m</span
                    >
                  </div>
                  <div class="stat">
                    <span class="stat-label">Weight</span>
                    <span class="stat-value"
                      >{{ rightPokemon.weight / 10 }}kg</span
                    >
                  </div>
                </div>
              </div>
              <div class="favorite-section" v-if="isAuthenticated">
                <button
                  class="btn"
                  :class="{
                    'btn-primary': !isFavorite(rightPokemon.name),
                    'btn-secondary': isFavorite(rightPokemon.name),
                  }"
                  @click="handleFavorite(rightPokemon.name)"
                  :disabled="profileStore.isUpdatingFavorite"
                >
                  {{
                    isFavorite(rightPokemon.name)
                      ? 'Remove from Favorites'
                      : 'Add to Favorites'
                  }}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          <ListMenu
            @select-pokemon="selectRightPokemon"
            :is-comparison-mode="true"
            :selected-position="'right'"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getPokemonDetail } from '../api/pokemon';
import ListMenu from '../components/ListMenu.vue';
import { useAuthStore } from '../stores/auth';
import { useProfileStore } from '../stores/profile';

const route = useRoute();
const router = useRouter();
const leftPokemon = ref(null);
const rightPokemon = ref(null);
const authStore = useAuthStore();
const profileStore = useProfileStore();

const isAuthenticated = computed(() => authStore.isAuthenticated);
const isFavorite = (pokemonName) => profileStore.isFavorite(pokemonName);

const handleFavorite = async (pokemonName) => {
  try {
    await profileStore.toggleFavorite(pokemonName);
  } catch (error) {
    console.error('Failed to update favorite:', error);
  }
};

const formatName = (name) => {
  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const updateUrl = () => {
  const query = {};
  if (leftPokemon.value) query.left = leftPokemon.value.name;
  if (rightPokemon.value) query.right = rightPokemon.value.name;
  router.replace({ query });
};

const selectLeftPokemon = async (pokemonName) => {
  try {
    leftPokemon.value = await getPokemonDetail(pokemonName);
    updateUrl();
  } catch (error) {
    console.error('Failed to fetch Pokemon details:', error);
  }
};

const selectRightPokemon = async (pokemonName) => {
  try {
    rightPokemon.value = await getPokemonDetail(pokemonName);
    updateUrl();
  } catch (error) {
    console.error('Failed to fetch Pokemon details:', error);
  }
};

const clearLeftPokemon = () => {
  leftPokemon.value = null;
  updateUrl();
};

const clearRightPokemon = () => {
  rightPokemon.value = null;
  updateUrl();
};

const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};

onMounted(async () => {
  // Load Pokemon from URL parameters
  const { left, right } = route.query;
  if (left) await selectLeftPokemon(left);
  if (right) await selectRightPokemon(right);
});

// Watch for URL changes
watch(
  () => route.query,
  async (newQuery) => {
    if (
      newQuery.left &&
      (!leftPokemon.value || leftPokemon.value.name !== newQuery.left)
    ) {
      await selectLeftPokemon(newQuery.left);
    }
    if (
      newQuery.right &&
      (!rightPokemon.value || rightPokemon.value.name !== newQuery.right)
    ) {
      await selectRightPokemon(newQuery.right);
    }
  }
);
</script>

<style scoped>
.comparison-page {
  min-height: 100vh;
  background-color: var(--neutral-50);
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

.dashboard-nav {
  background: white;
  padding: 0.75rem 1.5rem;
  box-shadow: var(--shadow-sm);
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  flex-shrink: 0;
}

.nav-brand {
  cursor: pointer;
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

.logout-button:hover {
  background-color: #dc2626;
}

.comparison-container {
  display: grid;
  grid-template-columns: minmax(0, 30%) minmax(0, 40%) minmax(0, 30%);
  gap: 0.75rem;
  padding: 0.75rem;
  flex: 1;
  min-height: 0;
  background-color: var(--neutral-50);
  overflow: hidden;
  width: 100%;
}

.comparison-section {
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  padding: 0.5rem;
  position: relative;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.middle-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  background: var(--neutral-100);
}

.comparison-instructions h2 {
  color: var(--neutral-900);
  margin-bottom: 1rem;
}

.comparison-instructions p {
  color: var(--neutral-600);
}

.pokemon-detail {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  min-width: 0;
}

.close-button {
  position: absolute;
  top: 0px;
  right: 5px;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--neutral-900);
  cursor: pointer;
  padding: 0.5rem;
  line-height: 1;
  z-index: 1;
  scale: 1.5;
  transition: color var(--transition-fast);
}

.close-button:hover {
  color: var(--error);
}

.pokemon-header {
  text-align: center;
  margin-bottom: 0.75rem;
  min-width: 0;
}

.pokemon-header h2 {
  font-size: 1.25rem;
  color: var(--neutral-900);
  margin-bottom: 0.5rem;
  text-transform: capitalize;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.types {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  padding: 0 0.5rem;
  min-width: 0;
}

.type-badge {
  padding: 0.25rem 0.75rem;
  border-radius: var(--border-radius-xl);
  color: white;
  font-weight: 500;
  font-size: 0.75rem;
  text-transform: capitalize;
  white-space: nowrap;
}

.pokemon-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
  overflow: hidden;
  min-width: 0;
}

.pokemon-image {
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--neutral-50);
  border-radius: var(--border-radius-lg);
  padding: 0.75rem;
  flex-shrink: 0;
}

.sprite {
  max-width: 120px;
  height: auto;
}

.pokemon-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  overflow-y: auto;
  flex: 1;
  min-width: 0;
  padding-bottom: 4rem;
}

.info-section {
  background: var(--neutral-50);
  padding: 0.75rem;
  border-radius: var(--border-radius-lg);
  flex-shrink: 0;
  min-width: 0;
}

.info-section h3 {
  color: var(--neutral-900);
  margin-bottom: 1rem;
  font-size: 1.25rem;
}

.info-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
  min-width: 0;
}

.info-section li {
  padding: 0.25rem 0;
  color: var(--neutral-700);
  text-transform: capitalize;
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

.empty-state {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

/* Pokemon Type Colors */
.type-badge.normal {
  background-color: var(--type-normal);
}
.type-badge.fire {
  background-color: var(--type-fire);
}
.type-badge.water {
  background-color: var(--type-water);
}
.type-badge.electric {
  background-color: var(--type-electric);
}
.type-badge.grass {
  background-color: var(--type-grass);
}
.type-badge.ice {
  background-color: var(--type-ice);
}
.type-badge.fighting {
  background-color: var(--type-fighting);
}
.type-badge.poison {
  background-color: var(--type-poison);
}
.type-badge.ground {
  background-color: var(--type-ground);
}
.type-badge.flying {
  background-color: var(--type-flying);
}
.type-badge.psychic {
  background-color: var(--type-psychic);
}
.type-badge.bug {
  background-color: var(--type-bug);
}
.type-badge.rock {
  background-color: var(--type-rock);
}
.type-badge.ghost {
  background-color: var(--type-ghost);
}
.type-badge.dragon {
  background-color: var(--type-dragon);
}
.type-badge.dark {
  background-color: var(--type-dark);
}
.type-badge.steel {
  background-color: var(--type-steel);
}
.type-badge.fairy {
  background-color: var(--type-fairy);
}

.comparison-content {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding: 0.5rem;
  min-width: 0;
}

.comparison-header {
  text-align: center;
  margin-bottom: 2rem;
}

.pokemon-names {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}

.pokemon-name {
  font-size: 1.25rem;
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius-md);
}

.pokemon-name.left {
  background-color: var(--primary-color);
  color: white;
}

.pokemon-name.right {
  background-color: var(--secondary-color);
  color: white;
}

.vs {
  font-size: 1rem;
  font-weight: 600;
  color: var(--neutral-600);
}

.comparison-group {
  margin-bottom: 1rem;
  background: white;
  padding: 0.75rem;
  border-radius: var(--border-radius-lg);
  min-width: 0;
}

.comparison-values {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--neutral-50);
  padding: 0.75rem;
  border-radius: var(--border-radius-md);
  min-width: 0;
}

.value {
  flex: 1;
  text-align: center;
  font-weight: 500;
  font-size: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.value.left {
  color: var(--primary-color);
}

.value.right {
  color: var(--secondary-color);
}

.divider {
  width: 1px;
  height: 24px;
  background-color: var(--neutral-300);
}

.types,
.abilities {
  flex: 1;
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  min-width: 0;
}

.types .type-badge,
.abilities .ability-badge {
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.favorite-section {
  position: absolute;
  bottom: 1rem;
  left: 0.75rem;
  right: 0.75rem;
  padding: 0.75rem;
  background: var(--neutral-50);
  border-radius: var(--border-radius-lg);
  text-align: center;
  z-index: 1;
}

.favorite-section .btn {
  width: 100%;
  padding: 0.75rem;
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pokemon-name-link {
  text-decoration: none;
  color: inherit;
  transition: color 0.2s;
}

.pokemon-name-link:hover {
  color: var(--primary-color);
}

.pokemon-name-link h2 h1 {
  margin: 0 0 0.5rem 0;
  cursor: pointer;
}

.pokemon-name-link h2:hover {
  color: var(--primary-color);
}
</style>
