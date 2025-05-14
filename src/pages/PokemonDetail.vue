<template>
  <div class="p-4 max-w-xl mx-auto">
    <div v-if="loading" class="text-center text-gray-500">
      Loading Pokémon details...
    </div>
    <div v-else-if="error" class="text-center text-red-600">{{ error }}</div>
    <div v-else-if="pokemon">
      <h1 class="text-2xl font-bold mb-2 capitalize">{{ pokemon.name }}</h1>
      <img
        v-if="pokemon.sprites?.front_default"
        :src="pokemon.sprites.front_default"
        :alt="pokemon.name"
        class="w-32 h-32"
      />
      <ul class="mt-4 space-y-1 text-gray-700">
        <li><strong>ID:</strong> {{ pokemon.id }}</li>
        <li><strong>Height:</strong> {{ pokemon.height }}</li>
        <li><strong>Weight:</strong> {{ pokemon.weight }}</li>
        <li><strong>Base Experience:</strong> {{ pokemon.base_experience }}</li>
        <li>
          <strong>Types:</strong>
          <span v-for="(type, i) in pokemon.types" :key="i" class="mr-2">
            {{ type }}
          </span>
        </li>
        <li>
          <strong>Abilities:</strong>
          <span v-for="(ability, i) in pokemon.abilities" :key="i" class="mr-2">
            {{ ability }}
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
// ===================== IMPORTS =====================
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

// ===================== STATE =====================
const route = useRoute();
const pokemon = ref<any>(null);
const loading = ref(true);
const error = ref<string | null>(null);

// ===================== METHODS =====================
const fetchPokemonDetail = async () => {
  try {
    loading.value = true;
    error.value = null;
    const identifier = route.params.identifier;
    const res = await fetch(`http://localhost:8000/api/pokemon/${identifier}/`);
    if (!res.ok) throw new Error('Failed to load Pokémon.');
    const data = await res.json();
    pokemon.value = data;
  } catch (err: any) {
    error.value = err.message || 'Unknown error';
  } finally {
    loading.value = false;
  }
};

// ===================== LIFECYCLE HOOKS =====================
onMounted(fetchPokemonDetail);
</script>
