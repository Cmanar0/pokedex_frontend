<template>
  <div>
    <!-- Loading Spinner -->
    <div v-if="isLoading" class="d-flex justify-content-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Pokémon Grid -->
    <div v-else class="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
      <div class="col" v-for="pokemon in results" :key="pokemon.name">
        <div
          class="card border-0 shadow-sm h-100 rounded-4 d-flex flex-column justify-content-between overflow-hidden text-center"
        >
          <!-- Image -->
          <div
            class="d-flex justify-content-center align-items-center bg-white border-bottom"
            style="height: 260px"
          >
            <img
              v-if="pokemon.sprite"
              :src="pokemon.sprite"
              :alt="pokemon.name"
              class="img-fluid"
              style="
                max-height: 240px;
                object-fit: contain;
                width: auto;
                min-width: 100%;
              "
            />
          </div>

          <!-- Body -->
          <div
            class="card-body d-flex flex-column justify-content-between px-4 py-3"
          >
            <div class="mb-3">
              <h5 class="card-title text-capitalize fw-semibold mb-3">
                {{ pokemon.name }}
              </h5>

              <!-- Types -->
              <div class="mb-2">
                <div class="small fw-bold text-muted">Type:</div>
                <div class="d-flex justify-content-center flex-wrap gap-1">
                  <span
                    v-for="type in pokemon.types"
                    :key="type"
                    class="badge rounded-pill px-3 py-1"
                    :class="typeColor(type)"
                  >
                    {{ type }}
                  </span>
                </div>
              </div>

              <!-- Abilities -->
              <div class="mb-2">
                <div class="small fw-bold text-muted">Abilities:</div>
                <div class="d-flex justify-content-center flex-wrap gap-1">
                  <span
                    v-for="ability in pokemon.abilities"
                    :key="ability"
                    class="badge bg-secondary-subtle text-dark fw-normal"
                  >
                    {{ ability }}
                  </span>
                </div>
              </div>

              <!-- Stats -->
              <div class="small text-muted mt-2">
                <div>
                  <strong>Height:</strong>
                  {{ (pokemon.height / 10).toFixed(1) }} m
                </div>
                <div>
                  <strong>Weight:</strong>
                  {{ (pokemon.weight / 10).toFixed(1) }} kg
                </div>
              </div>
            </div>

            <!-- Buttons -->
            <div class="mt-auto d-flex flex-column gap-2">
              <router-link
                :to="`/pokemon/${pokemon.name}`"
                class="btn btn-sm btn-outline-primary"
              >
                See Details
              </router-link>
              <button
                class="btn btn-sm"
                :class="{
                  'btn-success': !isFavorite(pokemon.name),
                  'btn-danger': isFavorite(pokemon.name)
                }"
                @click="handleFavorite(pokemon.name)"
                :disabled="!isAuthenticated"
              >
                {{ isFavorite(pokemon.name) ? 'Saved' : 'Save' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div class="d-flex justify-content-center my-4 gap-3">
      <button
        class="btn btn-outline-primary"
        :disabled="!previous || isLoading"
        @click="changePage(page - 1)"
      >
        Previous
      </button>
      <button
        class="btn btn-outline-primary"
        :disabled="!next || isLoading"
        @click="changePage(page + 1)"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import { getPokemonList, getFavoritePokemonList } from '../api/pokemon';
import { useRouter } from 'vue-router';
import { useProfileStore } from '../stores/profile';
import { useAuthStore } from '../stores/auth';

const props = defineProps({
  search: String,
  type: String,
  ability: String,
  showFavoritesOnly: {
    type: Boolean,
    default: false
  }
});

const results = ref([]);
const page = ref(1);
const next = ref(null);
const previous = ref(null);
const isLoading = ref(false);

const router = useRouter();
const profileStore = useProfileStore();
const authStore = useAuthStore();

const isAuthenticated = computed(() => authStore.isAuthenticated);
const isFavorite = (pokemonName) => profileStore.isFavorite(pokemonName);

const fetchData = async () => {
  isLoading.value = true;
  
  try {
    let data;
    if (props.showFavoritesOnly) {
      // Pass all filter parameters to the favorites endpoint
      const params = {};
      if (props.search) params.search = props.search;
      if (props.type) params.type = props.type;
      if (props.ability) params.ability = props.ability;

      data = await getFavoritePokemonList(params);
      results.value = data.results;
      next.value = null;
      previous.value = null;
    } else {
      const params = { page: page.value };
      if (props.search) params.search = props.search;
      if (props.type) params.type = props.type;
      if (props.ability) params.ability = props.ability;

      data = await getPokemonList(params);
      results.value = data.results;
      next.value = data.next;
      previous.value = data.previous;
    }
  } catch (err) {
    console.error('Failed to fetch Pokémon list:', err);
  } finally {
    isLoading.value = false;
  }
};

const changePage = (newPage) => {
  page.value = newPage;
};

const handleFavorite = async (pokemonName) => {
  try {
    await profileStore.toggleFavorite(pokemonName);
  } catch (err) {
    console.error('Failed to update favorite:', err);
  }
};

const goToDetail = (name) => {
  router.push(`/pokemon/${name}`);
};

// Type badge coloring
const typeColor = (type) => {
  const map = {
    grass: 'bg-success text-white',
    fire: 'bg-danger text-white',
    water: 'bg-primary text-white',
    electric: 'bg-warning text-dark',
    psychic: 'bg-danger text-white',
    ice: 'bg-info text-dark',
    dark: 'bg-dark text-white',
    fairy: 'bg-light text-dark border',
    normal: 'bg-secondary text-white',
    bug: 'bg-success text-white',
    poison: 'bg-secondary text-white', // fallback to secondary
    ground: 'bg-warning text-dark',
    rock: 'bg-dark text-white',
    ghost: 'bg-dark text-white',
    steel: 'bg-secondary text-white',
    fighting: 'bg-danger text-white',
    dragon: 'bg-primary text-white',
    flying: 'bg-info text-dark',
  };
  return map[type.toLowerCase()] || 'bg-light text-dark border';
};

const refresh = () => {
  fetchData();
};

// Expose the refresh method to parent
defineExpose({
  refresh
});

onMounted(async () => {
  if (isAuthenticated.value) {
    await profileStore.fetchProfile();
  }
  await fetchData();
});

// Update the watch to include showFavoritesOnly
watch(
  [page, () => props.search, () => props.type, () => props.ability, () => props.showFavoritesOnly],
  () => {
    fetchData();
  }
);
</script>

<style scoped>
.card-title {
  font-size: 1.25rem;
}

.pokemon-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.pokemon-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style> 