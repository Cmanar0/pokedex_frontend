<template>
  <div>
    <!-- Loading Spinner -->
    <div v-if="isLoading" class="d-flex justify-content-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Pokémon Grid -->
    <div v-else class="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">
      <div class="col" v-for="pokemon in results" :key="pokemon.name">
        <div class="card h-100">
          <img
            v-if="pokemon.sprite"
            :src="pokemon.sprite"
            class="card-img-top"
            :alt="pokemon.name"
          />
          <div class="card-body">
            <h5 class="card-title text-capitalize">{{ pokemon.name }}</h5>
            <p class="card-text">
              <a :href="pokemon.url" target="_blank">{{ pokemon.url }}</a>
            </p>
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
import { ref, watch, onMounted } from 'vue';
import { getPokemonList } from '../api/pokemon';

const props = defineProps({
  search: String,
  type: String,
  ability: String,
});

const results = ref([]);
const page = ref(1);
const next = ref(null);
const previous = ref(null);
const isLoading = ref(false);

const fetchData = async () => {
  isLoading.value = true;
  const params = { page: page.value };
  if (props.search) params.search = props.search;
  if (props.type) params.type = props.type;
  if (props.ability) params.ability = props.ability;

  try {
    const data = await getPokemonList(params);
    results.value = data.results;
    next.value = data.next;
    previous.value = data.previous;
  } catch (err) {
    console.error('Failed to fetch Pokémon list:', err);
  } finally {
    isLoading.value = false;
  }
};

const changePage = (newPage) => {
  page.value = newPage;
};

watch(
  [page, () => props.search, () => props.type, () => props.ability],
  fetchData
);
onMounted(fetchData);
</script>
