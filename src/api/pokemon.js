import apiService from '../services/api-request';
import { useProfileStore } from '../stores/profile';

export const getPokemonList = (params = {}) => {
  return apiService.get('/pokemon/', { params });
};

export const getPokemonDetail = (name) => {
  return apiService.get(`/pokemon/${name}/`);
};

export const getPokemonEvolutionChain = (name) => {
  return apiService.get(`/pokemon/${name}/evolution/`);
};

export const getFavoritePokemonList = (params = {}) => {
  const profileStore = useProfileStore();
  const favoritePokemon = profileStore.favoritePokemon;

  // Send the favorite Pokémon list as a JSON string
  return apiService.get('/pokemon/favorites/', {
    params: {
      ...params,
      favorite_pokemon: JSON.stringify(favoritePokemon),
    },
  });
};

export const getTypes = () => {
  return apiService.get('/types/');
};

export const getAbilities = () => {
  return apiService.get('/abilities/');
};