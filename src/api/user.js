import apiService from '../services/api-request';

export const getUserProfile = () => {
  return apiService.get('/profile/');
};

export const updateFavoritePokemon = (pokemonName) => {
  return apiService.post('/user/favorite-pokemon/', { pokemon_name: pokemonName });
}; 