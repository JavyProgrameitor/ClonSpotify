import { FAVORITES_KEY } from "./const.js";

// Obtener favoritos del localStorage
export const getFavorites = () => {
  const favoritesJSON = localStorage.getItem(FAVORITES_KEY);
  return favoritesJSON ? JSON.parse(favoritesJSON) : [];
};

// Guardar favoritos en el localStorage
export const saveFavorites = (favorites) => {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
};

// Alternar favorito
export const toggleFavorite = (songId) => {
  let favorites = getFavorites();
  if (favorites.includes(songId)) {
    // Si ya es favorito, eliminarlo
    favorites = favorites.filter((id) => id !== songId);
  } else {
    // Si no es favorito, agregarlo
    favorites.push(songId);
  }
  saveFavorites(favorites);
};

// Determinar si una canción es favorita
export const isFavorite = (songId) => {
  const favorites = getFavorites();
  return favorites.includes(songId);
};
