import apiService from '../services/api-request';

export const getPokemonList = (params = {}) => {
  return apiService.get('/pokemon/', { params });
};

export const getPokemonDetail = (name) => {
  return apiService.get(`/pokemon/${name}/`);
};
