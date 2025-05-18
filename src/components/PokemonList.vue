<template>
  <div class="pokemon-list" ref="listContainer" @scroll.passive="handleScroll">
    <!-- Loading Spinner -->
    <div v-if="isLoading && !pokemons.length" class="loading-container">
      <div class="loading-spinner"></div>
    </div>

    <!-- Pokémon Grid -->
    <div v-else class="pokemon-grid">
      <div v-for="pokemon in pokemons" :key="pokemon.name" class="pokemon-card">
        <!-- Image -->
        <div class="pokemon-image">
          <img
            v-if="pokemon.sprite"
            :src="pokemon.sprite"
            :alt="pokemon.name"
            class="sprite"
          />
        </div>

        <!-- Body -->
        <div class="pokemon-content">
          <div class="pokemon-header">
            <router-link
              :to="`/pokemon/${pokemon.name}`"
              class="pokemon-name-link"
            >
              <h3>{{ formatName(pokemon.name) }}</h3>
            </router-link>

            <!-- Types -->
            <div class="pokemon-types">
              <div class="section-label">Type:</div>
              <div class="type-badges">
                <span
                  v-for="type in pokemon.types"
                  :key="type"
                  class="type-badge"
                  :class="type.toLowerCase()"
                >
                  {{ type }}
                </span>
              </div>
            </div>

            <!-- Abilities -->
            <div class="pokemon-abilities">
              <div class="section-label">Abilities:</div>
              <div class="ability-badges">
                <span
                  v-for="ability in pokemon.abilities"
                  :key="ability"
                  class="ability-badge"
                >
                  {{ formatName(ability) }}
                </span>
              </div>
            </div>

            <!-- Stats -->
            <div class="pokemon-stats">
              <div class="stat">
                <span class="stat-label">Height:</span>
                <span class="stat-value"
                  >{{ (pokemon.height / 10).toFixed(1) }}m</span
                >
              </div>
              <div class="stat">
                <span class="stat-label">Weight:</span>
                <span class="stat-value"
                  >{{ (pokemon.weight / 10).toFixed(1) }}kg</span
                >
              </div>
            </div>
          </div>

          <!-- Buttons -->
          <div class="pokemon-actions">
            <template v-if="isComparisonMode">
              <button
                class="btn btn-primary"
                @click="handleSelect(pokemon.name)"
              >
                Select for {{ selectedPosition === 'left' ? 'Left' : 'Right' }}
              </button>
            </template>
            <template v-else>
              <router-link
                :to="`/pokemon/${pokemon.name}`"
                class="btn btn-secondary"
                style="background-color: var(--secondary-color); color: white"
              >
                See Details
              </router-link>
              <router-link
                :to="`/compare?left=${pokemon.name}`"
                class="btn btn-primary"
              >
                Compare
              </router-link>
            </template>
            <button
              v-if="isAuthenticated"
              class="btn"
              :class="{
                'btn-primary': !isFavorite(pokemon.name),
                'btn-secondary': isFavorite(pokemon.name),
              }"
              @click="handleFavorite(pokemon.name)"
              :disabled="profileStore.isUpdatingFavorite"
            >
              {{
                isFavorite(pokemon.name)
                  ? 'Remove from Favorites'
                  : 'Add to Favorites'
              }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading indicator at bottom -->
    <div v-if="isLoading && pokemons.length" class="loading-container">
      <div class="loading-spinner"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useProfileStore } from '../stores/profile';
import { useAuthStore } from '../stores/auth';

const props = defineProps({
  pokemons: Array,
  isLoading: Boolean,
  isComparisonMode: Boolean,
  selectedPosition: String,
  isAuthenticated: Boolean,
});

const emit = defineEmits(['select-pokemon', 'load-more']);

const router = useRouter();
const profileStore = useProfileStore();
const listContainer = ref(null);
const lastScrollPosition = ref(0);

const isFavorite = (name) => profileStore.isFavorite(name);

const formatName = (name) =>
  name
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

const handleSelect = (name) => emit('select-pokemon', name);

const handleFavorite = async (name) => {
  await profileStore.toggleFavorite(name);
};

const handleScroll = () => {
  const el = listContainer.value;
  if (!el || props.isLoading) return;

  // Save current scroll position
  lastScrollPosition.value = el.scrollTop;

  const scrollBottom = el.scrollTop + el.clientHeight;
  if (scrollBottom >= el.scrollHeight - 100) {
    emit('load-more');
  }
};

// Watch for changes in the pokemons array
watch(() => props.pokemons, () => {
  // Use nextTick to ensure the DOM has updated
  nextTick(() => {
    if (listContainer.value) {
      listContainer.value.scrollTop = lastScrollPosition.value;
    }
  });
}, { deep: true });
</script>

<style scoped>
.pokemon-list {
  width: 100%;
  padding: 1rem;
  max-height: v-bind('isComparisonMode ? "calc(100vh - 200px)" : "none"');
  overflow-y: v-bind('isComparisonMode ? "auto" : "visible"');
  scrollbar-width: thin;
  scrollbar-color: var(--neutral-300) var(--neutral-100);
}

.pokemon-list::-webkit-scrollbar {
  width: 8px;
}

.pokemon-list::-webkit-scrollbar-track {
  background: var(--neutral-100);
  border-radius: 4px;
}

.pokemon-list::-webkit-scrollbar-thumb {
  background-color: var(--neutral-300);
  border-radius: 4px;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100px;
  padding: 1rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--neutral-200);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.pokemon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.pokemon-card {
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  transition: transform var(--transition-fast),
    box-shadow var(--transition-fast);
}

.pokemon-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.pokemon-image {
  background: var(--neutral-100);
  padding: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom: 1px solid var(--neutral-200);
  height: 160px;
}

.sprite {
  width: auto;
  min-height: 160px;
  object-fit: contain;
}

.pokemon-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.pokemon-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.pokemon-name-link {
  text-decoration: none;
  color: inherit;
  transition: color 0.2s;
}

.pokemon-name-link:hover {
  color: var(--primary-color);
}

.pokemon-name-link h3 {
  margin: 0;
  cursor: pointer;
}

.section-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--neutral-600);
  margin-bottom: 0.5rem;
}

.type-badges,
.ability-badges {
  display: flex;
  flex-wrap: wrap;
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

.ability-badge {
  padding: 0.25rem 0.75rem;
  border-radius: var(--border-radius-md);
  background-color: var(--neutral-100);
  color: var(--neutral-700);
  font-size: 0.875rem;
  text-transform: capitalize;
}

.pokemon-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.stat {
  background: var(--neutral-50);
  padding: 0.75rem;
  border-radius: var(--border-radius-md);
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 0.75rem;
  color: var(--neutral-600);
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1rem;
  font-weight: 600;
  color: var(--neutral-900);
}

.pokemon-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: auto;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
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
</style>
