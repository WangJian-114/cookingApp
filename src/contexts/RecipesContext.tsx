// src/contexts/RecipesContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { Alert } from 'react-native';
import api from '../services/api';

const placeholderImage = require('../assets/milanesacpure.png');

const RecipesContext = createContext(null);

export const RecipesProvider = ({ children }) => {
  const [allRecipes, setAllRecipes] = useState([]);
  const [popularRecipes, setPopularRecipes] = useState([]);
  const [favorites, setFavorites] = useState(new Set());

  // 1) Populares
  const fetchPopular = useCallback(async () => {
    try {
      const res = await api.get('/receta/populares');
      const raw = res.data || [];
      setPopularRecipes(
        raw.map(r => ({
          id: r._id,
          image: r.imagen ? { uri: r.imagen } : placeholderImage,
        }))
      );
    } catch (err) {
      console.warn('❌ Error al cargar populares:', err);
    }
  }, []);

  // 2) Todas las recetas
  const fetchAll = useCallback(async () => {
    try {
      const res = await api.get('/receta/Allrecetas');
      const raw = res.data || [];
      setAllRecipes(
        raw.map(r => {
          const vals = r.valoraciones ?? [];
          const avg = vals.length ? vals.reduce((s, v) => s + v.rating, 0) / vals.length : 0;
          return {
            id: r._id,
            title: r.titulo,
            description: r.descripcion,
            image: r.imagen ? { uri: r.imagen } : placeholderImage,
            rating: avg,
          };
        })
      );
    } catch (err) {
      console.warn('❌ Error al cargar recetas:', err);
    }
  }, []);

  // 3) Favoritos
  const fetchFavorites = useCallback(async () => {
    try {
      const res = await api.get('/favs/misFavoritos');
      const favIds = new Set((res.data || []).map(r => r._id));
      setFavorites(favIds);
    } catch (err) {
      console.warn('❌ Error al cargar favoritos:', err);
    }
  }, []);

  // 4) Toggle favorito
  const toggleFavorite = useCallback(async (recipeId) => {
    try {
      if (favorites.has(recipeId)) {
        await api.delete(`/favs/borrar/${recipeId}`);
        favorites.delete(recipeId);
      } else {
        await api.post('/favs/agregar', { recetaId: recipeId });
        favorites.add(recipeId);
      }
      // Nuevo set para trigger de rerender
      setFavorites(new Set(favorites));
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || err.message);
    }
  }, [favorites]);

  // Refrescar todos juntos
  const refreshAll = useCallback(async () => {
    await Promise.all([fetchPopular(), fetchAll(), fetchFavorites()]);
  }, [fetchPopular, fetchAll, fetchFavorites]);

  return (
    <RecipesContext.Provider
      value={{
        allRecipes,
        popularRecipes,
        favorites,
        fetchPopular,
        fetchAll,
        fetchFavorites,
        toggleFavorite,
        refreshAll,
        setAllRecipes, // Para agregar/update/delete
      }}
    >
      {children}
    </RecipesContext.Provider>
  );
};

export const useRecipes = () => useContext(RecipesContext);
