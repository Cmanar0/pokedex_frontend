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
          <select
            v-model="selectedType"
            class="form-select"
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
        </div>
        <div class="col-md-4">
          <select
            v-model="selectedAbility"
            class="form-select"
          >
            <option value="">All Abilities</option>
            <option
              v-for="ability in abilities"
              :key="ability.name"
              :value="ability.name"
            >
              {{ ability.name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <PokemonList2
      v-model:current-page="currentPage"
      v-model:pokemons="pokemon"
      :search-query="searchQuery"
      :selected-type="selectedType"
      :selected-ability="selectedAbility"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { getTypes, getAbilities, getPokemonList } from '../api/pokemon';
import PokemonList2 from './PokemonList2.vue';

const searchQuery = ref('');
const selectedType = ref('');
const selectedAbility = ref('');
const types = ref([]);
const abilities = ref([]);
const isLoading = ref(false);
const error = ref(null);
const currentPage = ref(1);
const pokemon = ref([]);

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
  try {
    const [typesResponse, abilitiesResponse] = await Promise.all([
      getTypes(),
      getAbilities()
    ]);
    types.value = typesResponse;
    abilities.value = abilitiesResponse;
  } catch (err) {
    console.error('Error loading filter options:', err);
  }
};

const handleScrollEnd = () => {
  console.log('Reached end of Pokemon list');
  currentPage.value++;
  loadMorePokemon();
};

onMounted(async () => {
  await fetchTypesAndAbilities();
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
</style> 