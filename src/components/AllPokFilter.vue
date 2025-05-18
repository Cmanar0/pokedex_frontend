<template>
  <div class="pokemon-filter">
    <div class="search-section mb-4">
      <div class="row g-3">
        <div class="col-md-4">
          <div class="input-group">
            <span class="input-group-text">
              <i class="bi bi-search"></i>
            </span>
            <input
              v-model="searchQuery"
              type="text"
              class="form-control"
              placeholder="Search Pokémon..."
            />
          </div>
        </div>
        <div class="col-md-4">
          <div class="position-relative">
            <select
              v-model="selectedType"
              class="form-select"
              :disabled="isLoadingTypes"
            >
              <option value="">All Types</option>
              <option
                v-for="type in types"
                :key="type.name"
                :value="type.name"
              >
                {{ type.name.charAt(0).toUpperCase() + type.name.slice(1) }}
              </option>
            </select>
            <div v-if="isLoadingTypes" class="select-loading">
              <div class="spinner-border spinner-border-sm text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="position-relative">
            <div class="custom-select">
              <div 
                class="select-header" 
                @click="toggleAbilityDropdown"
                :class="{ 'is-open': isAbilityDropdownOpen }"
              >
                <span v-if="selectedAbility">
                  {{ formatAbilityName(selectedAbility) }}
                </span>
                <span v-else>All Abilities</span>
                <i class="bi bi-chevron-down"></i>
              </div>
              <div v-if="isAbilityDropdownOpen" class="select-dropdown">
                <div class="search-box">
                  <input
                    v-model="abilitySearchQuery"
                    type="text"
                    class="form-control"
                    placeholder="Search abilities..."
                    @click.stop
                  />
                </div>
                <div class="options-list">
                  <div
                    v-for="ability in filteredAbilities"
                    :key="ability.name"
                    class="option-item"
                    :class="{ 'selected': selectedAbility === ability.name }"
                    @click="selectAbility(ability.name)"
                  >
                    {{ formatAbilityName(ability.name) }}
                  </div>
                  <div v-if="filteredAbilities.length === 0" class="no-results">
                    No abilities found
                  </div>
                </div>
              </div>
            </div>
            <div v-if="isLoadingAbilities" class="select-loading">
              <div class="spinner-border spinner-border-sm text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <PokemonList2
      v-model:current-page="currentPage"
      v-model:pokemons="pokemon"
      :search-query="searchQuery"
      :selected-type="selectedType"
      :selected-ability="selectedAbility"
      :is-comparison-mode="props.isComparisonMode"
      @select-pokemon="emit('select-pokemon', $event)"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import { getTypes, getAbilities, getPokemonList } from '../api/pokemon';
import PokemonList2 from './PokemonList2.vue';
import 'bootstrap-select';

defineOptions({
  name: 'AllPokFilter'
});

const props = defineProps({
  isComparisonMode: {
    type: Boolean,
    default: false
  },
  selectedPokemon: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['select-pokemon']);

const searchQuery = ref('');
const selectedType = ref('');
const selectedAbility = ref('');
const types = ref([]);
const abilities = ref([]);
const isLoading = ref(false);
const isLoadingTypes = ref(false);
const isLoadingAbilities = ref(false);
const error = ref(null);
const currentPage = ref(1);
const pokemon = ref([]);
const abilitySearchQuery = ref('');
const isAbilityDropdownOpen = ref(false);

const filteredAbilities = computed(() => {
  if (!abilitySearchQuery.value) return abilities.value;
  return abilities.value.filter(ability => 
    ability.name.toLowerCase().includes(abilitySearchQuery.value.toLowerCase())
  );
});

const formatAbilityName = (name) => {
  return name.split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const refreshPokemonList = async () => {
  isLoading.value = true;
  try {
    const params = {
      page: currentPage.value,
      search: searchQuery.value,
      type: selectedType.value,
      ability: selectedAbility.value
    };
    const response = await getPokemonList(params);
    pokemon.value = response.results || [];
  } catch (err) {
    error.value = 'Failed to refresh Pokémon list. Please try again later.';
    console.error('Error refreshing Pokémon list:', err);
    pokemon.value = [];
  } finally {
    isLoading.value = false;
  }
};

const loadMorePokemon = async () => {
  if (isLoading.value) return; // Prevent multiple simultaneous requests
  
  isLoading.value = true;
  try {
    const params = {
      page: currentPage.value,
      search: searchQuery.value,
      type: selectedType.value,
      ability: selectedAbility.value
    };
    const response = await getPokemonList(params);
    // Append new results to existing array
    pokemon.value = [...pokemon.value, ...(response.results || [])];
  } catch (err) {
    error.value = 'Failed to load more Pokémon. Please try again later.';
    console.error('Error loading more Pokémon:', err);
  } finally {
    isLoading.value = false;
  }
};

// Watch for changes in any of the filter values
watch(
  [searchQuery, selectedType, selectedAbility],
  ([newSearch, newType, newAbility]) => {
    console.log('Filter changes:');
    console.log('Search:', {
      new: newSearch
    });
    console.log('Type:', {
      new: newType
    });
    console.log('Ability:', {
      new: newAbility
    });
    
    // Reset to first page when filters change
    currentPage.value = 1;
    // Refresh the Pokémon list with new filters
    refreshPokemonList();
  }
);

const filteredPokemon = computed(() => {
  return pokemon.value;
});

const isFavorite = (pokemonId) => {
  const favorites = JSON.parse(localStorage.getItem('favoritePokemon') || '[]');
  return favorites.includes(pokemonId);
};

const toggleFavorite = (pokemon) => {
  const favorites = JSON.parse(localStorage.getItem('favoritePokemon') || '[]');
  const index = favorites.indexOf(pokemon.id);
  if (index === -1) {
    favorites.push(pokemon.id);
  } else {
    favorites.splice(index, 1);
  }
  localStorage.setItem('favoritePokemon', JSON.stringify(favorites));
};

const fetchTypesAndAbilities = async () => {
  isLoadingTypes.value = true;
  isLoadingAbilities.value = true;
  try {
    const [typesResponse, abilitiesResponse] = await Promise.all([
      getTypes(),
      getAbilities()
    ]);
    types.value = typesResponse;
    abilities.value = abilitiesResponse;
  } catch (err) {
    console.error('Error loading filter options:', err);
  } finally {
    isLoadingTypes.value = false;
    isLoadingAbilities.value = false;
  }
};

const handleScrollEnd = () => {
  console.log('Reached end of Pokemon list');
  currentPage.value++;
  loadMorePokemon();
};

const toggleAbilityDropdown = () => {
  isAbilityDropdownOpen.value = !isAbilityDropdownOpen.value;
};

const selectAbility = (abilityName) => {
  selectedAbility.value = abilityName;
  isAbilityDropdownOpen.value = false;
};

const handleClickOutside = (event) => {
  const select = document.querySelector('.custom-select');
  if (select && !select.contains(event.target)) {
    isAbilityDropdownOpen.value = false;
  }
};

onMounted(async () => {
  await fetchTypesAndAbilities();
  // Initialize select2 for abilities
  const abilitySelect = document.querySelector('[data-bs-toggle="select2"]');
  if (abilitySelect) {
    new bootstrap.Select(abilitySelect, {
      liveSearch: true,
      liveSearchPlaceholder: 'Search abilities...',
      size: 10
    });
  }
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.pokemon-filter {
  width: 100%;
}

.search-section {
  background: white;
  padding: 1.5rem;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
}

.select-loading {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
}

/* Bootstrap Select customization */
.bootstrap-select .dropdown-toggle {
  background-color: white;
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
}

.bootstrap-select .dropdown-menu {
  max-height: 300px;
  overflow-y: auto;
}

.bootstrap-select .dropdown-menu .dropdown-item {
  padding: 0.5rem 1rem;
}

.bootstrap-select .dropdown-menu .dropdown-item:hover {
  background-color: var(--primary-100);
}

.bootstrap-select .dropdown-menu .dropdown-item.active {
  background-color: var(--primary-500);
}

.pokemon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
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
}

.pokemon-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.pokemon-sprite {
  width: 120px;
  height: 120px;
  object-fit: contain;
  margin-bottom: 1rem;
}

.pokemon-card h3 {
  margin: 0 0 0.5rem;
  color: var(--neutral-900);
  text-transform: capitalize;
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

.favorite-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  color: var(--neutral-400);
  transition: color var(--transition-fast);
}

.favorite-button:hover {
  color: var(--error);
}

.favorite-button.is-favorite {
  color: var(--error);
}

.heart-icon {
  font-size: 1.25rem;
}

.loading-state,
.error-state,
.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
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

.custom-select {
  position: relative;
  width: 100%;
}

.select-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.375rem 0.75rem;
  background-color: white;
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
  cursor: pointer;
  min-height: 38px;
}

.select-header.is-open {
  border-color: var(--primary-500);
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

.select-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
  margin-top: 0.25rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.search-box {
  padding: 0.5rem;
  border-bottom: 1px solid #ced4da;
}

.options-list {
  max-height: 300px;
  overflow-y: auto;
}

.option-item {
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.option-item:hover {
  background-color: var(--primary-100);
}

.option-item.selected {
  background-color: var(--primary-500);
  color: white;
}

.no-results {
  padding: 0.5rem 1rem;
  color: var(--neutral-600);
  text-align: center;
}

/* Custom scrollbar for options list */
.options-list::-webkit-scrollbar {
  width: 6px;
}

.options-list::-webkit-scrollbar-track {
  background: var(--neutral-100);
}

.options-list::-webkit-scrollbar-thumb {
  background: var(--neutral-300);
  border-radius: 3px;
}

.options-list::-webkit-scrollbar-thumb:hover {
  background: var(--neutral-400);
}
</style> 