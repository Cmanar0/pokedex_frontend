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

export const getPokemonTypes = async () => {
  try {
    const response = await fetch(`${API_URL}/pokemon/types`);
    if (!response.ok) {
      throw new Error('Failed to fetch Pokemon types');
    }
    const data = await response.json();
    return data.types;
  } catch (error) {
    console.error('Error fetching Pokemon types:', error);
    throw error;
  }
};
