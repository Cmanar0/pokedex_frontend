<template>
  <div 
    class="pokemon-list-container"
    @scroll="handleScroll"
    ref="listContainer"
  >
    <div class="pokemon-grid">
      <div v-if="isLoading && (!pokemons || pokemons.length === 0)" class="loading-state">
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
          v-for="pokemon in pokemons"
          :key="pokemon.name"
          class="pokemon-card"
        >
          <div class="pokemon-header">
            <img :src="pokemon.sprite" :alt="pokemon.name" class="pokemon-sprite" />
            <button
              class="favorite-button"
              :class="{ 'is-favorite': isFavorite(pokemon.name) }"
              @click.stop="toggleFavorite(pokemon)"
            >
              <i class="bi bi-heart-fill"></i>
            </button>
          </div>
          
          <h3 class="pokemon-name">{{ pokemon.name }}</h3>
          
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
                {{ ability.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') }}
              </span>
            </div>
          </div>

          <div class="pokemon-actions">
            <button class="btn btn-primary btn-sm" @click.stop="viewDetails(pokemon)">
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
    default: false
  },
  isFavoriteMode: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:currentPage', 'update:pokemons', 'view-details', 'compare', 'toggle-favorite']);

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
      ability: props.selectedAbility
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
      ability: props.selectedAbility
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
      ability: props.selectedAbility
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
      const existingIds = new Set(pokemons.value.map(p => p.name));
      const uniqueNewResults = newResults.filter(p => !existingIds.has(p.name));
      
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
    query: { left: pokemon.name }
  });
};

const handleSelect = (pokemon) => {
  console.log('Selected Pokémon for comparison:', pokemon.name);
};

// Watch for filter changes
watch(
  [() => props.searchQuery, () => props.selectedType, () => props.selectedAbility],
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

.pokemon-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  padding: 0.5rem;
}

.pokemon-card {
  background: white;
  border-radius: var(--border-radius-lg);
  padding: 1.5rem;
  text-align: center;
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition-fast);
  display: flex;
  flex-direction: column;
  gap: 1rem;
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
  width: 120px;
  height: 120px;
  object-fit: contain;
}

.pokemon-name {
  margin: 0;
  color: var(--neutral-900);
  text-transform: capitalize;
  font-size: 1.25rem;
}

.pokemon-types {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
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
  top: 0.5rem;
  right: 0.5rem;
  background: white;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  color: var(--neutral-400);
  transition: all var(--transition-fast);
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm);
  z-index: 1;
}

.favorite-button:hover {
  color: var(--error);
  transform: scale(1.1);
}

.favorite-button.is-favorite {
  color: var(--error);
  background: var(--error-light);
}

.favorite-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.favorite-button i {
  font-size: 1.25rem;
  line-height: 1;
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
</style>