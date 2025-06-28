import { createContext, useContext, useState } from 'react';

const RecipesContext = createContext(null);

export const RecipesProvider = ({ children }) => {
  const [recipes, setRecipes] = useState([]);

  const addRecipe = (recipe) => setRecipes([...recipes, recipe]);
  const updateRecipe = (id, updated) => {
    setRecipes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updated } : r))
    );
  };
  const deleteRecipe = (id) => setRecipes((prev) => prev.filter((r) => r.id !== id));

  return (
    <RecipesContext.Provider value={{ recipes, addRecipe, updateRecipe, deleteRecipe }}>
      {children}
    </RecipesContext.Provider>
  );
};

export const useRecipes = () => useContext(RecipesContext);
