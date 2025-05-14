<template>
  <div class="container py-4">
    <!-- Filter Navigation -->
    <div class="mb-3 d-flex gap-2 flex-wrap align-items-center">
      <button class="btn btn-outline-primary" @click="current = 'pokemon'">
        Pokémon
      </button>

      <!-- Filters -->
      <input
        type="text"
        v-model="searchInput"
        @input="debouncedSearch"
        placeholder="Search..."
        class="form-control w-auto ms-auto"
        style="min-width: 200px"
      />

      <select class="form-select w-auto" v-model="selectedType">
        <option value="">All Types</option>
        <option v-for="t in types" :key="t.name" :value="t.name">
          {{ t.name }}
        </option>
      </select>

      <select class="form-select w-auto" v-model="selectedAbility">
        <option value="">All Abilities</option>
        <option v-for="a in abilities" :key="a.name" :value="a.name">
          {{ a.name }}
        </option>
      </select>
    </div>

    <!-- Content Slot -->
    <div v-if="current === 'pokemon'">
      <PokemonList
        :search="search"
        :type="selectedType"
        :ability="selectedAbility"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import debounce from 'lodash.debounce';
import PokemonList from './PokemonList.vue';

const current = ref('pokemon');
const searchInput = ref('');
const search = ref('');
const selectedType = ref('');
const selectedAbility = ref('');
const types = ref([]);
const abilities = ref([]);

const debouncedSearch = debounce(() => {
  search.value = searchInput.value;
}, 400);
</script>
