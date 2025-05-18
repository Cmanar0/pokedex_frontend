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
      :search-query="searchQuery"
      :selected-type="selectedType"
      :selected-ability="selectedAbility"
      :current-page="currentPage"
      :is-comparison-mode="props.isComparisonMode"
      :is-favorite-mode="true"
      @update:current-page="currentPage = $event"
      @update:pokemons="pokemon = $event"
      @select-pokemon="emit('select-pokemon', $event)"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import { getTypes, getAbilities, getFavoritePokemonList } from '../api/pokemon';
import { useProfileStore } from '../stores/profile';
import PokemonList2 from './PokemonList2.vue';

defineOptions({
  name: 'FavPokFilter'
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
const currentPage = ref(1);
const pokemon = ref([]);
const profileStore = useProfileStore();
const isLoadingTypes = ref(false);
const isLoadingAbilities = ref(false);
const isAbilityDropdownOpen = ref(false);
const abilitySearchQuery = ref('');

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

onMounted(async () => {
  try {
    await Promise.all([
      fetchTypesAndAbilities(),
      profileStore.fetchProfile()
    ]);
    document.addEventListener('click', handleClickOutside);
  } catch (err) {
    console.error('Error loading data:', err);
  }
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
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

.select-loading {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
}

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