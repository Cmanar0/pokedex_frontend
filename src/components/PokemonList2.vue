<template>
  <div
    class="pokemon-list-container"
    @scroll="handleScroll"
    ref="listContainer"
  >
    <div class="pokemon-grid">
      <div
        v-if="isLoading && (!pokemons || pokemons.length === 0)"
        class="loading-state"
      >
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">Loading Pokémon...</p>
      </div>
      <div v-else-if="!pokemons || pokemons.length === 0" class="empty-state">
        <div class="alert alert-info" role="alert">
          No Pokémon found matching your criteria.
        </div>
      </div>
      <template v-else>
        <div
          v-for="(pokemon, index) in pokemons"
          :key="pokemon.name"
          class="pokemon-card"
          :class="{
            'last-card': index === pokemons.length - 1,
          }"
        >
          <div class="pokemon-header">
            <img
              :src="pokemon.sprite"
              :alt="pokemon.name"
              class="pokemon-sprite"
            />
            <button
              class="favorite-button"
              :class="{ active: isFavorite(pokemon.name) }"
              @click.stop="toggleFavorite(pokemon)"
            >
              <i class="bi bi-heart-fill"></i>
            </button>
          </div>

          <h2 class="pokemon-name">{{ pokemon.name }}</h2>

          <div class="pokemon-types">
            <span
              v-for="type in pokemon.types"
              :key="type"
              :class="['type-badge', type.toLowerCase()]"
            >
              {{ type }}
            </span>
          </div>

          <div class="pokemon-details">
            <div class="detail-item">
              <span class="detail-label">Height:</span>
              <span class="detail-value">{{ pokemon.height / 10 }}m</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Weight:</span>
              <span class="detail-value">{{ pokemon.weight / 10 }}kg</span>
            </div>
          </div>

          <div class="pokemon-abilities">
            <h4>Abilities:</h4>
            <div class="ability-list">
              <span
                v-for="ability in pokemon.abilities"
                :key="ability"
                class="ability-badge"
              >
                {{
                  ability
                    .split('-')
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ')
                }}
              </span>
            </div>
          </div>

          <div class="pokemon-actions">
            <button
              class="btn btn-primary btn-sm"
              @click.stop="viewDetails(pokemon)"
            >
              <i class="bi bi-info-circle"></i> See Details
            </button>
            <button
              v-if="!isComparisonMode"
              class="btn btn-secondary btn-sm"
              @click.stop="comparePokemon(pokemon)"
            >
              <i class="bi bi-arrow-left-right"></i> Compare
            </button>
            <button
              v-else
              class="btn btn-secondary btn-sm"
              @click.stop="handleSelect(pokemon)"
            >
              <i class="bi bi-check-circle"></i> Select
            </button>
          </div>
        </div>
        <!-- Loading spinner for infinite scroll -->
        <div v-if="isLoading" class="loading-more">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading more...</span>
          </div>
          <p class="mt-2">Loading more Pokémon...</p>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, computed } from 'vue';
import { useRouter } from 'vue-router';
import { getPokemonList, getFavoritePokemonList } from '../api/pokemon';
import { useProfileStore } from '../stores/profile';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const profileStore = useProfileStore();
const authStore = useAuthStore();

const props = defineProps({
  searchQuery: String,
  selectedType: String,
  selectedAbility: String,
  currentPage: Number,
  isComparisonMode: {
    type: Boolean,
    default: false,
  },
  isFavoriteMode: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  'update:currentPage',
  'update:pokemons',
  'view-details',
  'compare',
  'toggle-favorite',
  'select-pokemon',
]);

const listContainer = ref(null);
const isLoading = ref(false);
const error = ref(null);
const pokemons = ref([]);
const lastScrollPosition = ref(0);

const isAuthenticated = computed(() => authStore.isAuthenticated);

const refreshPokemonList = async () => {
  isLoading.value = true;
  try {
    const params = {
      page: 1, // Always start from page 1 when refreshing
      search: props.searchQuery,
      type: props.selectedType,
      ability: props.selectedAbility,
    };

    const response = props.isFavoriteMode
      ? await getFavoritePokemonList(params)
      : await getPokemonList(params);

    pokemons.value = response.results || [];
    emit('update:pokemons', pokemons.value);
    emit('update:currentPage', 1);
  } catch (err) {
    error.value = 'Failed to refresh Pokémon list. Please try again later.';
    console.error('Error refreshing Pokémon list:', err);
    pokemons.value = [];
  } finally {
    isLoading.value = false;
  }
};

const loadMorePokemon = async () => {
  if (isLoading.value) return; // Prevent multiple simultaneous requests

  // For favorite mode, we need to check if we have more Pokémon to display
  if (props.isFavoriteMode) {
    const allFavoritePokemon = await getFavoritePokemonList({
      search: props.searchQuery,
      type: props.selectedType,
      ability: props.selectedAbility,
    });

    const currentCount = pokemons.value.length;
    const totalCount = allFavoritePokemon.results.length;

    // If we've displayed all Pokémon, don't load more
    if (currentCount >= totalCount) {
      return;
    }
  }

  // Store current scroll position
  if (listContainer.value) {
    lastScrollPosition.value = listContainer.value.scrollTop;
  }

  isLoading.value = true;
  try {
    const params = {
      page: props.currentPage,
      search: props.searchQuery,
      type: props.selectedType,
      ability: props.selectedAbility,
    };

    const response = props.isFavoriteMode
      ? await getFavoritePokemonList(params)
      : await getPokemonList(params);

    // For favorite mode, we need to handle pagination manually
    if (props.isFavoriteMode) {
      const allPokemon = response.results || [];
      const itemsPerPage = 20; // Assuming 20 items per page
      const startIndex = (props.currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const newPokemon = allPokemon.slice(startIndex, endIndex);

      // Only append if we have new Pokémon to show
      if (newPokemon.length > 0) {
        pokemons.value = [...pokemons.value, ...newPokemon];
        emit('update:pokemons', pokemons.value);
      }
    } else {
      // Regular pagination for non-favorite mode
      // Only append if we have new results and they're not duplicates
      const newResults = response.results || [];
      const existingIds = new Set(pokemons.value.map((p) => p.name));
      const uniqueNewResults = newResults.filter(
        (p) => !existingIds.has(p.name)
      );

      if (uniqueNewResults.length > 0) {
        pokemons.value = [...pokemons.value, ...uniqueNewResults];
        emit('update:pokemons', pokemons.value);
      }
    }

    // Restore scroll position after the DOM updates
    nextTick(() => {
      if (listContainer.value) {
        listContainer.value.scrollTop = lastScrollPosition.value;
      }
    });
  } catch (err) {
    error.value = 'Failed to load more Pokémon. Please try again later.';
    console.error('Error loading more Pokémon:', err);
  } finally {
    isLoading.value = false;
  }
};

const handleScroll = (event) => {
  const container = event.target;
  const scrollPosition = container.scrollTop + container.clientHeight;
  const scrollHeight = container.scrollHeight;

  // If we're near the bottom (within 100px)
  if (scrollHeight - scrollPosition < 100) {
    console.log('Near bottom of list');
    emit('update:currentPage', props.currentPage + 1);
    loadMorePokemon();
  }
};

const isFavorite = (pokemonName) => {
  return profileStore.isFavorite(pokemonName);
};

const toggleFavorite = async (pokemon) => {
  if (!isAuthenticated.value) {
    router.push('/login');
    return;
  }

  try {
    await profileStore.toggleFavorite(pokemon.name);
  } catch (err) {
    console.error('Failed to update favorites:', err);
  }
};

const viewDetails = (pokemon) => {
  router.push(`/pokemon/${pokemon.name}`);
};

const comparePokemon = (pokemon) => {
  router.push({
    path: '/compare',
    query: { left: pokemon.name },
  });
};

const handleSelect = (pokemon) => {
  console.log('PokemonList2: Selected Pokémon for comparison:', pokemon.name);
  emit('select-pokemon', pokemon);
};

// Watch for filter changes
watch(
  [
    () => props.searchQuery,
    () => props.selectedType,
    () => props.selectedAbility,
  ],
  () => {
    refreshPokemonList();
  }
);

onMounted(async () => {
  refreshPokemonList();
  if (isAuthenticated.value) {
    await profileStore.fetchProfile();
  }
  // Initial check for scroll position
  if (listContainer.value) {
    const container = listContainer.value;
    if (container.scrollHeight <= container.clientHeight) {
      console.log('Initial load - content fits viewport');
      emit('update:currentPage', props.currentPage + 1);
      loadMorePokemon();
    }
  }
});
</script>

<style scoped>
.pokemon-list-container {
  height: 600px;
  overflow-y: auto;
  padding: 1rem;
  background: var(--neutral-50);
  border-radius: var(--border-radius-lg);
}

/* Custom scrollbar styles */
.pokemon-list-container::-webkit-scrollbar {
  width: 8px;
}

.pokemon-list-container::-webkit-scrollbar-track {
  background: var(--neutral-100);
  border-radius: var(--border-radius-full);
}

.pokemon-list-container::-webkit-scrollbar-thumb {
  background: var(--neutral-300);
  border-radius: var(--border-radius-full);
}

.pokemon-list-container::-webkit-scrollbar-thumb:hover {
  background: var(--neutral-400);
}

.pokemon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
  width: 100%;
}

.pokemon-card {
  background: white;
  border-radius: var(--border-radius-lg);
  padding: 1.5rem;
  text-align: center;
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition-fast);
  position: relative;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.pokemon-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.pokemon-header {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
}

.pokemon-sprite {
  width: 220px;
  height: 220px;
  object-fit: contain;
  margin-bottom: 1rem;
}

.pokemon-card h3 {
  margin: 0 0 0.5rem;
  color: var(--neutral-900);
  text-transform: capitalize;
  font-size: 1.125rem;
}

.pokemon-types {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
  width: 100%;
  margin-bottom: 1rem;
}

.type-badge {
  padding: 0.25rem 0.75rem;
  border-radius: var(--border-radius-full);
  font-size: 0.875rem;
  font-weight: 500;
  color: white;
  text-transform: capitalize;
}

.pokemon-details {
  display: flex;
  margin-bottom: 1rem;
  justify-content: space-around;
  padding: 0.5rem;
  background: var(--neutral-50);
  border-radius: var(--border-radius-md);
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-label {
  font-size: 0.75rem;
  color: var(--neutral-600);
  text-transform: uppercase;
}

.detail-value {
  font-weight: 500;
  color: var(--neutral-900);
}

.pokemon-abilities {
  text-align: left;
  margin-bottom: 1rem;
}

.pokemon-abilities h4 {
  font-size: 0.875rem;
  color: var(--neutral-600);
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
  padding: 0.25rem 0.5rem;
  border-radius: var(--border-radius-full);
  font-size: 0.75rem;
  text-transform: capitalize;
}

.pokemon-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  justify-content: center;
  margin-top: auto;
  width: 100%;
}

.pokemon-actions .btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.favorite-button {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: none;
  border: none;
  color: var(--neutral-400);
  cursor: pointer;
  padding: 0.25rem;
  transition: color var(--transition-fast);
}

.favorite-button:hover {
  color: var(--error);
}

.favorite-button.active {
  color: var(--error);
}

.loading-state,
.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
}

.loading-more {
  grid-column: 1 / -1;
  text-align: center;
  padding: 1rem;
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  margin-top: 1rem;
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

/* Responsive adjustments */
@media (max-width: 1200px) {
  .pokemon-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1rem;
  }

  .pokemon-card {
    padding: 1rem;
    min-height: 180px;
  }

  .pokemon-sprite {
    width: 100px;
    height: 100px;
  }

  .pokemon-card h3 {
    font-size: 1rem;
  }
}

@media (max-width: 768px) {
  .pokemon-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 0.75rem;
  }

  .pokemon-card {
    padding: 0.75rem;
    min-height: 160px;
  }

  .pokemon-sprite {
    width: 80px;
    height: 80px;
    margin-bottom: 0.5rem;
  }

  .pokemon-card h3 {
    font-size: 0.875rem;
    margin-bottom: 0.25rem;
  }

  .type-badge {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
  }
}

@media (max-width: 480px) {
  .pokemon-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 0.5rem;
  }

  .pokemon-card {
    padding: 0.5rem;
    min-height: 140px;
  }

  .pokemon-sprite {
    width: 60px;
    height: 60px;
    margin-bottom: 0.25rem;
  }

  .pokemon-card h3 {
    font-size: 0.75rem;
  }

  .type-badge {
    padding: 0.125rem 0.375rem;
    font-size: 0.625rem;
  }

  .favorite-button {
    top: 0.25rem;
    right: 0.25rem;
    font-size: 0.875rem;
  }
}

.last-card {
  margin-bottom: 8rem;
}
</style>
