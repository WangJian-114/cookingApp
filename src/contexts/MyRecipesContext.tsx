import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import api from '../services/api';

interface Ingrediente {
  nombre: string;
  cantidad: string;
  unidad: string;
}

export interface Recipe {
  _id: string;
  titulo: string;
  descripcion: string;
  instrucciones: string;
  tiempo_preparacion: number;
  dificultad: 'Fácil' | 'Media' | 'Difícil';
  porciones: number;
  ingredientes: Ingrediente[];
  imagen?: string;
  autor_id: string;
  fecha_creacion: string;
}

interface RecipeFormData {
  titulo: string;
  descripcion: string;
  instrucciones: string;
  tiempo_preparacion: number;
  dificultad: 'Fácil' | 'Media' | 'Difícil';
  porciones: number;
  ingredientes: Ingrediente[];
  photo?: { uri: string; type?: string; fileName?: string };
}

interface MyRecipesContextState {
  recipes: Recipe[];
  loading: boolean;
  error: string | null;

  fetchRecipes: () => Promise<void>;
  getRecipeById: (id: string) => Promise<Recipe | null>;
  createRecipe: (recipeData: RecipeFormData) => Promise<boolean>;
  updateRecipe: (id: string, recipeData: RecipeFormData) => Promise<boolean>;
  deleteRecipe: (id: string) => Promise<boolean>;
  refreshRecipes: () => Promise<void>;
  clearError: () => void;
}

const MyRecipesContext = createContext<MyRecipesContextState | undefined>(undefined);

interface MyRecipesProviderProps {
  children: ReactNode;
}

export const MyRecipesProvider: React.FC<MyRecipesProviderProps> = ({ children }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Busca mis recetas
  const fetchRecipes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/receta/misRecetas');
      setRecipes(response.data.recetas || response.data || []);
    } catch (err: any) {
      console.error('Error fetching recipes:', err);
      setError('Error al cargar las recetas');
    } finally {
      setLoading(false);
    }
  };

  // Obtiene receta por ID
  const getRecipeById = async (id: string): Promise<Recipe | null> => {
    try {
      const res = await api.get(`/receta/getRecetaById/${id}`);
      return res.data.receta || res.data;
    } catch (e: any) {
      console.error('Error fetching recipe:', e);
      setError('Error al cargar la receta');
      return null;
    }
  };

  // Creacion de nueva receta - no necesario usar?
  const createRecipe = async (recipeData: RecipeFormData): Promise<boolean> => {
    try {
      const formData = new FormData();
      formData.append('titulo', recipeData.titulo.trim());
      formData.append('descripcion', recipeData.descripcion.trim());
      formData.append('instrucciones', recipeData.instrucciones.trim());
      formData.append('tiempo_preparacion', String(recipeData.tiempo_preparacion));
      formData.append('dificultad', recipeData.dificultad);
      formData.append('porciones', String(recipeData.porciones));
      formData.append('ingredientes', JSON.stringify(recipeData.ingredientes));

      if (recipeData.photo?.uri) {
        formData.append('media', {
          uri: recipeData.photo.uri,
          type: recipeData.photo.type || 'image/jpeg',
          name: recipeData.photo.fileName || `photo_${Date.now()}.jpg`,
        } as any);
      }

      const resp = await api.post('/receta/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000,
      });

      if (resp.status === 200 || resp.status === 201) {
        // Actualizar la lista local agregando la nueva receta
        const newRecipe = resp.data.receta || resp.data;
        setRecipes(prevRecipes => [newRecipe, ...prevRecipes]);
        return true;
      }
      return false;
    } catch (e: any) {
      console.error('Error creating recipe:', e);
      setError(e.response?.data?.message || 'Error al crear la receta');
      return false;
    }
  };

  // Actualizacion de receta
  const updateRecipe = async (id: string, recipeData: RecipeFormData): Promise<boolean> => {
    try {
      const formData = new FormData();
      formData.append('titulo', recipeData.titulo.trim());
      formData.append('descripcion', recipeData.descripcion.trim());
      formData.append('instrucciones', recipeData.instrucciones.trim());
      formData.append('tiempo_preparacion', String(recipeData.tiempo_preparacion));
      formData.append('dificultad', recipeData.dificultad);
      formData.append('porciones', String(recipeData.porciones));
      formData.append('ingredientes', JSON.stringify(recipeData.ingredientes));

      if (recipeData.photo?.uri) {
        formData.append('media', {
          uri: recipeData.photo.uri,
          type: recipeData.photo.type || 'image/jpeg',
          name: recipeData.photo.fileName || `photo_${Date.now()}.jpg`,
        } as any);
      }

      const resp = await api.put(`/receta/update/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000,
      });

      if (resp.status === 200) {
        // Actualizar la receta en la lista local
        const updatedRecipe = resp.data.receta || resp.data;
        setRecipes(prevRecipes =>
          prevRecipes.map(recipe =>
            recipe._id === id ? updatedRecipe : recipe
          )
        );
        return true;
      }
      return false;
    } catch (e: any) {
      console.error('Error updating recipe:', e);
      setError(e.response?.data?.message || 'Error al actualizar la receta');
      return false;
    }
  };

  // Eliminar receta
  const deleteRecipe = async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/receta/delete/${id}`);
      // Actualizar la lista después de eliminar
      setRecipes(prevRecipes => prevRecipes.filter(recipe => recipe._id !== id));
      return true;
    } catch (error: any) {
      console.error('Error deleting recipe:', error);
      setError('Error al eliminar la receta');
      return false;
    }
  };

  // Refresca las recetas (pull-to-refresh)
  const refreshRecipes = async () => {
    await fetchRecipes();
  };

  // Limpiamos el error
  const clearError = () => {
    setError(null);
  };

  // Cargamos recetas
  useEffect(() => {
    fetchRecipes();
  }, []);

  const value: MyRecipesContextState = {
    recipes,
    loading,
    error,
    fetchRecipes,
    getRecipeById,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    refreshRecipes,
    clearError,
  };

  return (
    <MyRecipesContext.Provider value={value}>
      {children}
    </MyRecipesContext.Provider>
  );
};

export const useMyRecipes = (): MyRecipesContextState => {
  const context = useContext(MyRecipesContext);
  if (!context) {
    throw new Error('useMyRecipes must be used within a MyRecipesProvider');
  }
  return context;
};