import apiService from '../services/api-request';
import { useProfileStore } from '../stores/profile';

export const getPokemonList = (params = {}) => {
  return apiService.get('/pokemon/', { params });
};

export const getPokemonDetail = (name) => {
  return apiService.get(`/pokemon/${name}/`);
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
