<template>
  <div class="pokemon-detail-container">
    <div v-if="loading" class="loading">
      Loading...
    </div>
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    <div v-else-if="pokemon" class="pokemon-detail">
      <div class="pokemon-header">
        <h1>{{ formatName(pokemon.name) }}</h1>
        <div class="types">
          <span
            v-for="type in pokemon.types"
            :key="type"
            :class="['type-badge', type.toLowerCase()]"
          >
            {{ type }}
          </span>
        </div>
      </div>

      <div class="pokemon-content">
        <div class="pokemon-image">
          <img
            :src="pokemon.sprite"
            :alt="pokemon.name"
            class="sprite"
          />
        </div>

        <div class="pokemon-info">
          <div class="info-section">
            <h2>Abilities</h2>
            <ul>
              <li v-for="ability in pokemon.abilities" :key="ability">
                {{ formatName(ability) }}
              </li>
            </ul>
          </div>

          <div class="info-section">
            <h2>Stats</h2>
            <div class="stats">
              <div class="stat">
                <span class="stat-label">Height</span>
                <span class="stat-value">{{ pokemon.height / 10 }}m</span>
              </div>
              <div class="stat">
                <span class="stat-label">Weight</span>
                <span class="stat-value">{{ pokemon.weight / 10 }}kg</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="actions">
        <button @click="$router.back()" class="btn-back">
          Back to List
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// ===================== IMPORTS =====================
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { getPokemonDetail } from '../api/pokemon';

// ===================== STATE =====================
const route = useRoute();
const pokemon = ref<any>(null);
const loading = ref(true);
const error = ref<string | null>(null);

// ===================== METHODS =====================
const formatName = (name) => {
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const fetchPokemonDetails = async () => {
  try {
    loading.value = true;
    error.value = null;
    pokemon.value = await getPokemonDetail(route.params.name);
  } catch (err: any) {
    error.value = err.message || 'Failed to fetch Pokémon details';
  } finally {
    loading.value = false;
  }
};

// ===================== LIFECYCLE HOOKS =====================
onMounted(fetchPokemonDetails);
</script>

<style scoped>
.pokemon-detail-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.loading, .error {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
}

.error {
  color: #dc3545;
}

.pokemon-detail {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.pokemon-header {
  text-align: center;
  margin-bottom: 2rem;
}

.pokemon-header h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #333;
}

.types {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.type-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  color: white;
  font-weight: bold;
  text-transform: capitalize;
}

.pokemon-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.pokemon-image {
  display: flex;
  justify-content: center;
  align-items: center;
}

.sprite {
  max-width: 200px;
  height: auto;
}

.pokemon-info {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.info-section h2 {
  color: #333;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.info-section ul {
  list-style: none;
  padding: 0;
}

.info-section li {
  padding: 0.5rem 0;
  color: #666;
  text-transform: capitalize;
}

.stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.stat {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  text-align: center;
}

.stat-label {
  display: block;
  color: #666;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
}

.actions {
  text-align: center;
}

.btn-back {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.btn-back:hover {
  background-color: #5a6268;
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
