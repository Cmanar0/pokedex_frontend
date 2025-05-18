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
      :search-query="searchQuery"
      :selected-type="selectedType"
      :selected-ability="selectedAbility"
      :current-page="currentPage"
      :is-comparison-mode="false"
      :is-favorite-mode="true"
      @update:current-page="currentPage = $event"
      @update:pokemons="pokemon = $event"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getTypes, getAbilities } from '../api/pokemon';
import { useProfileStore } from '../stores/profile';
import PokemonList2 from './PokemonList2.vue';

const searchQuery = ref('');
const selectedType = ref('');
const selectedAbility = ref('');
const types = ref([]);
const abilities = ref([]);
const currentPage = ref(1);
const pokemon = ref([]);
const profileStore = useProfileStore();

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

onMounted(async () => {
  try {
    await Promise.all([
      fetchTypesAndAbilities(),
      profileStore.fetchProfile()
    ]);
  } catch (err) {
    console.error('Error loading data:', err);
  }
});
</script>

<style scoped>
.pokemon-filter {
  padding: 1rem;
}

.search-section {
  background: white;
  padding: 1rem;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
}
</style> 