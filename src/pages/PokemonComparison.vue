<template>
  <div class="comparison-container">
    <!-- Left Pokemon Section -->
    <div class="comparison-section">
      <div v-if="leftPokemon" class="pokemon-detail">
        <button class="close-button" @click="clearLeftPokemon">
          <span class="close-icon">×</span>
        </button>
        <div class="pokemon-header">
          <h2>{{ formatName(leftPokemon.name) }}</h2>
          <div class="types">
            <span
              v-for="type in leftPokemon.types"
              :key="type"
              class="type-badge"
              :class="type.toLowerCase()"
            >
              {{ type }}
            </span>
          </div>
        </div>
        <div class="pokemon-content">
          <div class="pokemon-image">
            <img :src="leftPokemon.sprite" :alt="leftPokemon.name" class="sprite" />
          </div>
          <div class="pokemon-info">
            <div class="info-section">
              <h3>Abilities</h3>
              <ul>
                <li v-for="ability in leftPokemon.abilities" :key="ability">
                  {{ formatName(ability) }}
                </li>
              </ul>
            </div>
            <div class="info-section">
              <h3>Stats</h3>
              <div class="stats">
                <div class="stat">
                  <span class="stat-label">Height</span>
                  <span class="stat-value">{{ leftPokemon.height / 10 }}m</span>
                </div>
                <div class="stat">
                  <span class="stat-label">Weight</span>
                  <span class="stat-value">{{ leftPokemon.weight / 10 }}kg</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <ListMenu 
          @select-pokemon="selectLeftPokemon" 
          :is-comparison-mode="true"
          :selected-position="'left'"
        />
      </div>
    </div>

    <!-- Middle Section -->
    <div class="comparison-section middle-section">
      <div class="comparison-instructions">
        <h2>Compare Pokémon</h2>
        <p>Select two Pokémon to compare their stats and abilities</p>
      </div>
    </div>

    <!-- Right Pokemon Section -->
    <div class="comparison-section">
      <div v-if="rightPokemon" class="pokemon-detail">
        <button class="close-button" @click="clearRightPokemon">
          <span class="close-icon">×</span>
        </button>
        <div class="pokemon-header">
          <h2>{{ formatName(rightPokemon.name) }}</h2>
          <div class="types">
            <span
              v-for="type in rightPokemon.types"
              :key="type"
              class="type-badge"
              :class="type.toLowerCase()"
            >
              {{ type }}
            </span>
          </div>
        </div>
        <div class="pokemon-content">
          <div class="pokemon-image">
            <img :src="rightPokemon.sprite" :alt="rightPokemon.name" class="sprite" />
          </div>
          <div class="pokemon-info">
            <div class="info-section">
              <h3>Abilities</h3>
              <ul>
                <li v-for="ability in rightPokemon.abilities" :key="ability">
                  {{ formatName(ability) }}
                </li>
              </ul>
            </div>
            <div class="info-section">
              <h3>Stats</h3>
              <div class="stats">
                <div class="stat">
                  <span class="stat-label">Height</span>
                  <span class="stat-value">{{ rightPokemon.height / 10 }}m</span>
                </div>
                <div class="stat">
                  <span class="stat-label">Weight</span>
                  <span class="stat-value">{{ rightPokemon.weight / 10 }}kg</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <ListMenu 
          @select-pokemon="selectRightPokemon" 
          :is-comparison-mode="true"
          :selected-position="'right'"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getPokemonDetail } from '../api/pokemon';
import ListMenu from '../components/ListMenu.vue';

const route = useRoute();
const router = useRouter();
const leftPokemon = ref(null);
const rightPokemon = ref(null);

const formatName = (name) => {
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const updateUrl = () => {
  const query = {};
  if (leftPokemon.value) query.left = leftPokemon.value.name;
  if (rightPokemon.value) query.right = rightPokemon.value.name;
  router.replace({ query });
};

const selectLeftPokemon = async (pokemonName) => {
  try {
    leftPokemon.value = await getPokemonDetail(pokemonName);
    updateUrl();
  } catch (error) {
    console.error('Failed to fetch Pokemon details:', error);
  }
};

const selectRightPokemon = async (pokemonName) => {
  try {
    rightPokemon.value = await getPokemonDetail(pokemonName);
    updateUrl();
  } catch (error) {
    console.error('Failed to fetch Pokemon details:', error);
  }
};

const clearLeftPokemon = () => {
  leftPokemon.value = null;
  updateUrl();
};

const clearRightPokemon = () => {
  rightPokemon.value = null;
  updateUrl();
};

onMounted(async () => {
  // Load Pokemon from URL parameters
  const { left, right } = route.query;
  if (left) await selectLeftPokemon(left);
  if (right) await selectRightPokemon(right);
});

// Watch for URL changes
watch(() => route.query, async (newQuery) => {
  if (newQuery.left && (!leftPokemon.value || leftPokemon.value.name !== newQuery.left)) {
    await selectLeftPokemon(newQuery.left);
  }
  if (newQuery.right && (!rightPokemon.value || rightPokemon.value.name !== newQuery.right)) {
    await selectRightPokemon(newQuery.right);
  }
});
</script>

<style scoped>
.comparison-container {
  display: grid;
  grid-template-columns: 1fr 300px 1fr;
  gap: 2rem;
  padding: 2rem;
  min-height: 100vh;
  background-color: var(--neutral-50);
}

.comparison-section {
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  padding: 1.5rem;
  position: relative;
}

.middle-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  background: var(--neutral-100);
}

.comparison-instructions h2 {
  color: var(--neutral-900);
  margin-bottom: 1rem;
}

.comparison-instructions p {
  color: var(--neutral-600);
}

.pokemon-detail {
  position: relative;
}

.close-button {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--neutral-900);
  cursor: pointer;
  padding: 0.5rem;
  line-height: 1;
  z-index: 1;
  transition: color var(--transition-fast);
}

.close-button:hover {
  color: var(--error);
}

.pokemon-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.pokemon-header h2 {
  font-size: 1.5rem;
  color: var(--neutral-900);
  margin-bottom: 0.5rem;
  text-transform: capitalize;
}

.types {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.type-badge {
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius-xl);
  color: white;
  font-weight: 500;
  font-size: 0.875rem;
  text-transform: capitalize;
}

.pokemon-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.pokemon-image {
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--neutral-50);
  border-radius: var(--border-radius-lg);
  padding: 1.5rem;
}

.sprite {
  max-width: 200px;
  height: auto;
}

.pokemon-info {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.info-section {
  background: var(--neutral-50);
  padding: 1.5rem;
  border-radius: var(--border-radius-lg);
}

.info-section h3 {
  color: var(--neutral-900);
  margin-bottom: 1rem;
  font-size: 1.25rem;
}

.info-section ul {
  list-style: none;
  padding: 0;
}

.info-section li {
  padding: 0.5rem 0;
  color: var(--neutral-700);
  text-transform: capitalize;
}

.stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.stat {
  background: white;
  padding: 1rem;
  border-radius: var(--border-radius-md);
  text-align: center;
}

.stat-label {
  display: block;
  color: var(--neutral-600);
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.stat-value {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--neutral-900);
}

.empty-state {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Pokemon Type Colors */
.type-badge.normal { background-color: var(--type-normal); }
.type-badge.fire { background-color: var(--type-fire); }
.type-badge.water { background-color: var(--type-water); }
.type-badge.electric { background-color: var(--type-electric); }
.type-badge.grass { background-color: var(--type-grass); }
.type-badge.ice { background-color: var(--type-ice); }
.type-badge.fighting { background-color: var(--type-fighting); }
.type-badge.poison { background-color: var(--type-poison); }
.type-badge.ground { background-color: var(--type-ground); }
.type-badge.flying { background-color: var(--type-flying); }
.type-badge.psychic { background-color: var(--type-psychic); }
.type-badge.bug { background-color: var(--type-bug); }
.type-badge.rock { background-color: var(--type-rock); }
.type-badge.ghost { background-color: var(--type-ghost); }
.type-badge.dragon { background-color: var(--type-dragon); }
.type-badge.dark { background-color: var(--type-dark); }
.type-badge.steel { background-color: var(--type-steel); }
.type-badge.fairy { background-color: var(--type-fairy); }
</style> 