<template>
  <div class="comparison-page">
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

    <main class="comparison-content">
      <div class="comparison-container">
        <!-- Left Side -->
        <div class="comparison-side">
          <template v-if="!leftPokemon">
            <div class="view-selector">
              <button
                @click="leftView = 'all'"
                :class="['view-button', { active: leftView === 'all' }]"
              >
                All Pokémon
              </button>
              <button
                @click="leftView = 'favorites'"
                :class="['view-button', { active: leftView === 'favorites' }]"
              >
                Favorite Pokémon
              </button>
            </div>
            <AllPokFilter
              v-if="leftView === 'all'"
              :isComparisonMode="true"
              :selectedPokemon="leftPokemon"
              @select-pokemon="handleLeftSelect"
            />
            <FavPokFilter
              v-else
              :isComparisonMode="true"
              :selectedPokemon="leftPokemon"
              @select-pokemon="handleLeftSelect"
            />
          </template>
          <template v-else>
            <div class="selected-pokemon">
              <button class="unselect-button" @click="leftPokemon = null">
                <i class="bi bi-x-lg"></i>
              </button>
              <div class="pokemon-header">
                <img
                  :src="leftPokemon.sprite"
                  :alt="leftPokemon.name"
                  class="pokemon-sprite"
                />
                <h3 class="pokemon-name">{{ leftPokemon.name }}</h3>
              </div>
              <div class="pokemon-types">
                <span
                  v-for="type in leftPokemon.types"
                  :key="type"
                  :class="['type-badge', type.toLowerCase()]"
                >
                  {{ type }}
                </span>
              </div>
              <div class="pokemon-details">
                <div class="detail-item">
                  <span class="detail-label">Height:</span>
                  <span class="detail-value"
                    >{{ leftPokemon.height / 10 }}m</span
                  >
                </div>
                <div class="detail-item">
                  <span class="detail-label">Weight:</span>
                  <span class="detail-value"
                    >{{ leftPokemon.weight / 10 }}kg</span
                  >
                </div>
              </div>
              <div class="pokemon-abilities">
                <h4>Abilities:</h4>
                <div class="ability-list">
                  <span
                    v-for="ability in leftPokemon.abilities"
                    :key="ability"
                    class="ability-badge"
                  >
                    {{
                      ability
                        .split('-')
                        .map(
                          (word) => word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(' ')
                    }}
                  </span>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- Middle Section -->
        <div class="comparison-section middle-section">
          <div v-if="leftPokemon && rightPokemon" class="comparison-content">
            <!-- <div class="comparison-header">
              <h2>Comparison</h2>
            </div> -->

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

        <!-- Right Side -->
        <div class="comparison-side">
          <template v-if="!rightPokemon">
            <div class="view-selector">
              <button
                @click="rightView = 'all'"
                :class="['view-button', { active: rightView === 'all' }]"
              >
                All Pokémon
              </button>
              <button
                @click="rightView = 'favorites'"
                :class="['view-button', { active: rightView === 'favorites' }]"
              >
                Favorite Pokémon
              </button>
            </div>
            <AllPokFilter
              v-if="rightView === 'all'"
              :isComparisonMode="true"
              :selectedPokemon="rightPokemon"
              @select-pokemon="handleRightSelect"
            />
            <FavPokFilter
              v-else
              :isComparisonMode="true"
              :selectedPokemon="rightPokemon"
              @select-pokemon="handleRightSelect"
            />
          </template>
          <template v-else>
            <div class="selected-pokemon">
              <button class="unselect-button" @click="rightPokemon = null">
                <i class="bi bi-x-lg"></i>
              </button>
              <div class="pokemon-header">
                <img
                  :src="rightPokemon.sprite"
                  :alt="rightPokemon.name"
                  class="pokemon-sprite"
                />
                <h3 class="pokemon-name">{{ rightPokemon.name }}</h3>
              </div>
              <div class="pokemon-types">
                <span
                  v-for="type in rightPokemon.types"
                  :key="type"
                  :class="['type-badge', type.toLowerCase()]"
                >
                  {{ type }}
                </span>
              </div>
              <div class="pokemon-details">
                <div class="detail-item">
                  <span class="detail-label">Height:</span>
                  <span class="detail-value"
                    >{{ rightPokemon.height / 10 }}m</span
                  >
                </div>
                <div class="detail-item">
                  <span class="detail-label">Weight:</span>
                  <span class="detail-value"
                    >{{ rightPokemon.weight / 10 }}kg</span
                  >
                </div>
              </div>
              <div class="pokemon-abilities">
                <h4>Abilities:</h4>
                <div class="ability-list">
                  <span
                    v-for="ability in rightPokemon.abilities"
                    :key="ability"
                    class="ability-badge"
                  >
                    {{
                      ability
                        .split('-')
                        .map(
                          (word) => word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(' ')
                    }}
                  </span>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import AllPokFilter from '../components/AllPokFilter.vue';
import FavPokFilter from '../components/FavPokFilter.vue';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const leftView = ref('all');
const rightView = ref('all');
const leftPokemon = ref(null);
const rightPokemon = ref(null);

const handleLeftSelect = (pokemon) => {
  console.log('PokemonComparison: Left side selected:', pokemon.name);
  leftPokemon.value = pokemon;
};

const handleRightSelect = (pokemon) => {
  console.log('PokemonComparison: Right side selected:', pokemon.name);
  rightPokemon.value = pokemon;
};

const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};

const formatName = (name) => {
  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

onMounted(() => {
  // Initialize with route params if they exist
  if (route.query.left) {
    leftPokemon.value = route.query.left;
  }
  if (route.query.right) {
    rightPokemon.value = route.query.right;
  }
});
</script>

<style scoped>
.comparison-page {
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

.comparison-content {
  padding: 1rem;
  width: 100%;
  height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
}

.comparison-container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
  height: 100%;
  overflow: hidden;
}

.comparison-side {
  max-height: 87vh;
  background: white;
  border-radius: var(--border-radius-lg);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow: hidden;
}

.middle-section {
  background: var(--neutral-100);
  border-radius: var(--border-radius-lg);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  max-height: 87vh;
}

.comparison-instructions h2 {
  color: var(--neutral-900);
  margin-bottom: 1rem;
}

.comparison-instructions p {
  color: var(--neutral-600);
}

.comparison-header {
  text-align: center;
  margin-bottom: 2rem;
}

.comparison-group {
  margin-bottom: 1rem;
  background: white;
  padding: 0.75rem;
  border-radius: var(--border-radius-lg);
  width: 100%;
}

.comparison-values {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--neutral-50);
  padding: 0.75rem;
  border-radius: var(--border-radius-md);
}

.value {
  flex: 1;
  text-align: center;
  font-weight: 500;
  font-size: 1rem;
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
  flex-direction: column;
  gap: 0.5rem;
}

.type-badge {
  padding: 0.25rem 0.75rem;
  border-radius: var(--border-radius-xl);
  color: white;
  font-weight: 500;
  font-size: 0.75rem;
  text-transform: capitalize;
  text-align: center;
}

.ability-badge {
  padding: 0.25rem 0.75rem;
  background: var(--neutral-100);
  border-radius: var(--border-radius-md);
  color: var(--neutral-900);
  font-size: 0.875rem;
  text-align: center;
}

.view-selector {
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem;
  background: var(--neutral-50);
  border-radius: var(--border-radius-lg);
}

.view-button {
  flex: 1;
  padding: 0.5rem;
  border: none;
  background: none;
  color: var(--neutral-600);
  font-size: 0.875rem;
  cursor: pointer;
  border-radius: var(--border-radius-md);
  transition: all var(--transition-fast);
}

.view-button:hover {
  background: var(--neutral-100);
}

.view-button.active {
  background: var(--primary-color);
  color: white;
}

/* Type colors */
.normal {
  background-color: #a8a878;
}
.fire {
  background-color: #f08030;
}
.water {
  background-color: #6890f0;
}
.electric {
  background-color: #f8d030;
}
.grass {
  background-color: #78c850;
}
.ice {
  background-color: #98d8d8;
}
.fighting {
  background-color: #c03028;
}
.poison {
  background-color: #a040a0;
}
.ground {
  background-color: #e0c068;
}
.flying {
  background-color: #a890f0;
}
.psychic {
  background-color: #f85888;
}
.bug {
  background-color: #a8b820;
}
.rock {
  background-color: #b8a038;
}
.ghost {
  background-color: #705898;
}
.dragon {
  background-color: #7038f8;
}
.dark {
  background-color: #705848;
}
.steel {
  background-color: #b8b8d0;
}
.fairy {
  background-color: #ee99ac;
}

@media (max-width: 1024px) {
  .comparison-container {
    grid-template-columns: 1fr;
    overflow-y: auto;
  }

  .comparison-side {
    min-height: 50vh;
  }

  .middle-section {
    min-height: 50vh;
  }
}

@media (max-width: 640px) {
  .comparison-content {
    padding: 0.5rem;
  }

  .comparison-side {
    padding: 0.75rem;
  }

  .view-button {
    font-size: 0.75rem;
    padding: 0.375rem;
  }
}

.selected-pokemon {
  position: relative;
  padding: 1.5rem;
  background: white;
  border-radius: var(--border-radius-lg);
  height: 100%;
  overflow-y: auto;
}

.unselect-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: var(--neutral-600);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  transition: color var(--transition-fast);
  z-index: 1;
}

.unselect-button:hover {
  color: var(--error);
}

.pokemon-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 2rem;
}

.pokemon-sprite {
  width: 150px;
  height: 150px;
  object-fit: contain;
  margin-bottom: 1rem;
}

.pokemon-name {
  font-size: 1.5rem;
  color: var(--neutral-900);
  text-transform: capitalize;
  margin-bottom: 1rem;
}

.pokemon-types {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin-bottom: 1rem;
}

.pokemon-details {
  background: var(--neutral-50);
  padding: 1rem;
  border-radius: var(--border-radius-lg);
  margin-bottom: 1rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.detail-label {
  color: var(--neutral-600);
  font-size: 0.875rem;
}

.detail-value {
  color: var(--neutral-900);
  font-weight: 500;
}

.pokemon-abilities {
  margin-top: 1rem;
}

.pokemon-abilities h4 {
  font-size: 1rem;
  color: var(--neutral-700);
  margin-bottom: 0.5rem;
}

.ability-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.ability-badge {
  background: var(--neutral-100);
  color: var(--neutral-700);
  padding: 0.25rem 0.75rem;
  border-radius: var(--border-radius-full);
  font-size: 0.875rem;
}
</style>
