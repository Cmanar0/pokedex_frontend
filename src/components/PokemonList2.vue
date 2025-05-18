 <template>
  <div 
    class="pokemon-list-container"
    @scroll="handleScroll"
    ref="listContainer"
  >
    <div class="pokemon-grid">
      <div v-if="isLoading" class="loading-state">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">Loading Pokémon...</p>
      </div>
      <div v-else-if="!pokemons || pokemons.length === 0" class="empty-state">
        <div class="alert alert-info" role="alert">
          No Pokémon found matching your criteria.
        </div>
      </div>
      <template v-else>
        <div
          v-for="pokemon in pokemons"
          :key="pokemon.name"
          class="pokemon-card"
        >
          <img :src="pokemon.sprite" :alt="pokemon.name" class="pokemon-sprite" />
          <h3>{{ pokemon.name }}</h3>
          <div class="pokemon-types">
            <span
              v-for="type in pokemon.types"
              :key="type"
              :class="['type-badge', type.toLowerCase()]"
            >
              {{ type }}
            </span>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
  pokemons: Array,
  isLoading: Boolean,
});

const emit = defineEmits(['scroll-end']);

const listContainer = ref(null);

const handleScroll = (event) => {
  const container = event.target;
  const scrollPosition = container.scrollTop + container.clientHeight;
  const scrollHeight = container.scrollHeight;
  
  // If we're near the bottom (within 100px)
  if (scrollHeight - scrollPosition < 100) {
    console.log('Near bottom of list');
    emit('scroll-end');
  }
};

onMounted(() => {
  // Initial check for scroll position
  if (listContainer.value) {
    const container = listContainer.value;
    if (container.scrollHeight <= container.clientHeight) {
      console.log('Initial load - content fits viewport');
      emit('scroll-end');
    }
  }
});
</script>

<style scoped>
.pokemon-list-container {
  height: 600px; /* Fixed height */
  overflow-y: auto;
  padding: 1rem;
  background: var(--neutral-50);
  border-radius: var(--border-radius-lg);
}

.pokemon-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* Three cards per row */
  gap: 1.5rem;
  padding: 0.5rem;
}

.pokemon-card {
  background: white;
  border-radius: var(--border-radius-lg);
  padding: 1.5rem;
  text-align: center;
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition-fast);
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

.loading-state,
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