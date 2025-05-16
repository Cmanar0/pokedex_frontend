<template>
  <div class="container py-4">
    <!-- Filter Navigation -->
    <div class="mb-3 d-flex gap-2 flex-wrap align-items-center">
      <!-- <button class="btn btn-outline-primary" @click="current = 'pokemon'">
        Pokémon
      </button> -->

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

      <div class="ability-select-container position-relative">
        <input
          type="text"
          class="form-control"
          v-model="abilitySearch"
          @focus="showAbilityDropdown = true"
          @blur="setTimeout(() => showAbilityDropdown = false, 200)"
          placeholder="Search ability..."
          style="min-width: 200px"
        />
        <div v-if="showAbilityDropdown" class="ability-dropdown">
          <div
            class="ability-option"
            @mousedown="selectAbility({ name: '' })"
          >
            All Abilities
          </div>
          <div
            v-for="ability in filteredAbilities"
            :key="ability.name"
            class="ability-option"
            @mousedown="selectAbility(ability)"
          >
            {{ formatAbilityName(ability.name) }}
          </div>
        </div>
      </div>
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
import { ref, onMounted, computed, watch } from 'vue';
import debounce from 'lodash.debounce';
import PokemonList from './PokemonList.vue';

const current = ref('pokemon');
const searchInput = ref('');
const search = ref('');
const selectedType = ref('');
const selectedAbility = ref('');
const abilitySearch = ref('');
const showAbilityDropdown = ref(false);

const types = ref([
  { name: 'Normal' },
  { name: 'Fire' },
  { name: 'Water' },
  { name: 'Electric' },
  { name: 'Grass' },
  { name: 'Ice' },
  { name: 'Fighting' },
  { name: 'Poison' },
  { name: 'Ground' },
  { name: 'Flying' },
  { name: 'Psychic' },
  { name: 'Bug' },
  { name: 'Rock' },
  { name: 'Ghost' },
  { name: 'Dragon' },
  { name: 'Dark' },
  { name: 'Steel' },
  { name: 'Fairy' }
]);

const abilities = ref([
  { name: 'stench' },
  { name: 'drizzle' },
  { name: 'speed-boost' },
  { name: 'battle-armor' },
  { name: 'sturdy' },
  { name: 'damp' },
  { name: 'limber' },
  { name: 'sand-veil' },
  { name: 'static' },
  { name: 'volt-absorb' },
  { name: 'water-absorb' },
  { name: 'oblivious' },
  { name: 'cloud-nine' },
  { name: 'compound-eyes' },
  { name: 'insomnia' },
  { name: 'color-change' },
  { name: 'immunity' },
  { name: 'flash-fire' },
  { name: 'shield-dust' },
  { name: 'own-tempo' },
  { name: 'suction-cups' },
  { name: 'intimidate' },
  { name: 'shadow-tag' },
  { name: 'rough-skin' },
  { name: 'wonder-guard' },
  { name: 'levitate' },
  { name: 'effect-spore' },
  { name: 'synchronize' },
  { name: 'clear-body' },
  { name: 'natural-cure' },
  { name: 'lightning-rod' },
  { name: 'serene-grace' },
  { name: 'swift-swim' },
  { name: 'chlorophyll' },
  { name: 'illuminate' },
  { name: 'trace' },
  { name: 'huge-power' },
  { name: 'poison-point' },
  { name: 'inner-focus' },
  { name: 'magma-armor' },
  { name: 'water-veil' },
  { name: 'magnet-pull' },
  { name: 'soundproof' },
  { name: 'rain-dish' },
  { name: 'sand-stream' },
  { name: 'pressure' },
  { name: 'thick-fat' },
  { name: 'early-bird' },
  { name: 'flame-body' },
  { name: 'run-away' },
  { name: 'keen-eye' },
  { name: 'hyper-cutter' },
  { name: 'pickup' },
  { name: 'truant' },
  { name: 'hustle' },
  { name: 'cute-charm' },
  { name: 'plus' },
  { name: 'minus' },
  { name: 'forecast' },
  { name: 'sticky-hold' },
  { name: 'shed-skin' },
  { name: 'guts' },
  { name: 'marvel-scale' },
  { name: 'liquid-ooze' },
  { name: 'overgrow' },
  { name: 'blaze' },
  { name: 'torrent' },
  { name: 'swarm' },
  { name: 'rock-head' },
  { name: 'drought' },
  { name: 'arena-trap' },
  { name: 'vital-spirit' },
  { name: 'white-smoke' },
  { name: 'pure-power' },
  { name: 'shell-armor' },
  { name: 'air-lock' },
  { name: 'tangled-feet' },
  { name: 'motor-drive' },
  { name: 'rivalry' },
  { name: 'steadfast' },
  { name: 'snow-cloak' },
  { name: 'gluttony' },
  { name: 'anger-point' },
  { name: 'unburden' },
  { name: 'heatproof' },
  { name: 'simple' },
  { name: 'dry-skin' },
  { name: 'download' },
  { name: 'iron-fist' },
  { name: 'poison-heal' },
  { name: 'adaptability' },
  { name: 'skill-link' },
  { name: 'hydration' },
  { name: 'solar-power' },
  { name: 'quick-feet' },
  { name: 'normalize' },
  { name: 'sniper' },
  { name: 'magic-guard' },
  { name: 'no-guard' },
  { name: 'stall' },
  { name: 'technician' },
  { name: 'leaf-guard' },
  { name: 'klutz' },
  { name: 'mold-breaker' },
  { name: 'super-luck' },
  { name: 'aftermath' },
  { name: 'anticipation' },
  { name: 'forewarn' },
  { name: 'unaware' },
  { name: 'tinted-lens' },
  { name: 'filter' },
  { name: 'slow-start' },
  { name: 'scrappy' },
  { name: 'storm-drain' },
  { name: 'ice-body' },
  { name: 'solid-rock' },
  { name: 'snow-warning' },
  { name: 'honey-gather' },
  { name: 'frisk' },
  { name: 'reckless' },
  { name: 'multitype' },
  { name: 'flower-gift' },
  { name: 'bad-dreams' },
  { name: 'pickpocket' },
  { name: 'sheer-force' },
  { name: 'contrary' },
  { name: 'unnerve' },
  { name: 'defiant' },
  { name: 'defeatist' },
  { name: 'cursed-body' },
  { name: 'healer' },
  { name: 'friend-guard' },
  { name: 'weak-armor' },
  { name: 'heavy-metal' },
  { name: 'light-metal' },
  { name: 'multiscale' },
  { name: 'toxic-boost' },
  { name: 'flare-boost' },
  { name: 'harvest' },
  { name: 'telepathy' },
  { name: 'moody' },
  { name: 'overcoat' },
  { name: 'poison-touch' },
  { name: 'regenerator' },
  { name: 'big-pecks' },
  { name: 'sand-rush' },
  { name: 'wonder-skin' },
  { name: 'analytic' },
  { name: 'illusion' },
  { name: 'imposter' },
  { name: 'infiltrator' },
  { name: 'mummy' },
  { name: 'moxie' },
  { name: 'justified' },
  { name: 'rattled' },
  { name: 'magic-bounce' },
  { name: 'sap-sipper' },
  { name: 'prankster' },
  { name: 'sand-force' },
  { name: 'iron-barbs' },
  { name: 'zen-mode' },
  { name: 'victory-star' },
  { name: 'turboblaze' },
  { name: 'teravolt' },
  { name: 'aroma-veil' },
  { name: 'flower-veil' },
  { name: 'cheek-pouch' },
  { name: 'protean' },
  { name: 'fur-coat' },
  { name: 'magician' },
  { name: 'bulletproof' },
  { name: 'competitive' },
  { name: 'strong-jaw' },
  { name: 'mega-launcher' },
  { name: 'tough-claws' },
  { name: 'pixilate' },
  { name: 'gooey' },
  { name: 'aerilate' },
  { name: 'parental-bond' },
  { name: 'dark-aura' },
  { name: 'fairy-aura' },
  { name: 'aura-break' },
  { name: 'primordial-sea' },
  { name: 'desolate-land' },
  { name: 'delta-stream' },
  { name: 'stamina' },
  { name: 'wimp-out' },
  { name: 'emergency-exit' },
  { name: 'water-compaction' },
  { name: 'merciless' },
  { name: 'shields-down' },
  { name: 'stakeout' },
  { name: 'water-bubble' },
  { name: 'steelworker' },
  { name: 'berserk' },
  { name: 'slush-rush' },
  { name: 'long-reach' },
  { name: 'liquid-voice' },
  { name: 'triage' },
  { name: 'galvanize' },
  { name: 'surge-surfer' },
  { name: 'schooling' },
  { name: 'disguise' },
  { name: 'battle-bond' },
  { name: 'power-construct' },
  { name: 'corrosion' },
  { name: 'comatose' },
  { name: 'queenly-majesty' },
  { name: 'innards-out' },
  { name: 'dancer' },
  { name: 'battery' },
  { name: 'fluffy' },
  { name: 'dazzling' },
  { name: 'soul-heart' },
  { name: 'tangling-hair' },
  { name: 'receiver' },
  { name: 'power-of-alchemy' },
  { name: 'beast-boost' },
  { name: 'rks-system' },
  { name: 'electric-surge' },
  { name: 'psychic-surge' },
  { name: 'misty-surge' },
  { name: 'grassy-surge' },
  { name: 'full-metal-body' },
  { name: 'shadow-shield' },
  { name: 'prism-armor' },
  { name: 'neuroforce' },
  { name: 'intrepid-sword' },
  { name: 'dauntless-shield' },
  { name: 'libero' },
  { name: 'ball-fetch' },
  { name: 'cotton-down' },
  { name: 'propeller-tail' },
  { name: 'mirror-armor' },
  { name: 'gulp-missile' },
  { name: 'stalwart' },
  { name: 'steam-engine' },
  { name: 'punk-rock' },
  { name: 'sand-spit' },
  { name: 'ice-scales' },
  { name: 'ripen' },
  { name: 'ice-face' },
  { name: 'power-spot' },
  { name: 'mimicry' },
  { name: 'screen-cleaner' },
  { name: 'steely-spirit' },
  { name: 'perish-body' },
  { name: 'wandering-spirit' },
  { name: 'gorilla-tactics' },
  { name: 'neutralizing-gas' },
  { name: 'pastel-veil' },
  { name: 'hunger-switch' },
  { name: 'quick-draw' },
  { name: 'unseen-fist' },
  { name: 'curious-medicine' },
  { name: 'transistor' },
  { name: 'dragons-maw' },
  { name: 'chilling-neigh' },
  { name: 'grim-neigh' },
  { name: 'as-one-glastrier' },
  { name: 'as-one-spectrier' },
  { name: 'lingering-aroma' },
  { name: 'seed-sower' },
  { name: 'thermal-exchange' },
  { name: 'anger-shell' },
  { name: 'purifying-salt' },
  { name: 'well-baked-body' },
  { name: 'wind-rider' },
  { name: 'guard-dog' },
  { name: 'rocky-payload' },
  { name: 'wind-power' },
  { name: 'zero-to-hero' },
  { name: 'commander' },
  { name: 'electromorphosis' },
  { name: 'protosynthesis' },
  { name: 'quark-drive' },
  { name: 'good-as-gold' },
  { name: 'vessel-of-ruin' },
  { name: 'sword-of-ruin' },
  { name: 'tablets-of-ruin' },
  { name: 'beads-of-ruin' },
  { name: 'orichalcum-pulse' },
  { name: 'hadron-engine' },
  { name: 'opportunist' },
  { name: 'cud-chew' },
  { name: 'sharpness' },
  { name: 'supreme-overlord' },
  { name: 'costar' },
  { name: 'toxic-debris' },
  { name: 'armor-tail' },
  { name: 'earth-eater' },
  { name: 'mycelium-might' },
  { name: 'minds-eye' },
  { name: 'supersweet-syrup' }
]);

// Watch for changes in abilitySearch
watch(abilitySearch, (newValue) => {
  if (!newValue) {
    selectedAbility.value = '';
  }
});

const filteredAbilities = computed(() => {
  if (!abilitySearch.value) return abilities.value;
  return abilities.value.filter(ability =>
    ability.name.toLowerCase().includes(abilitySearch.value.toLowerCase())
  );
});

const formatAbilityName = (name) => {
  if (!name) return 'All Abilities';
  return name.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

const selectAbility = (ability) => {
  selectedAbility.value = ability.name;
  abilitySearch.value = formatAbilityName(ability.name);
  showAbilityDropdown.value = false;
};

const debouncedSearch = debounce(() => {
  search.value = searchInput.value;
}, 400);
</script>

<style scoped>
.ability-select-container {
  position: relative;
  min-width: 200px;
}

.ability-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  max-height: 300px;
  overflow-y: auto;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.ability-option {
  padding: 8px 12px;
  cursor: pointer;
}

.ability-option:hover {
  background-color: #f5f5f5;
}
</style>
