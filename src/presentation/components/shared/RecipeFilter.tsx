// components/RecipeFilter.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal, ScrollView, StyleSheet } from 'react-native';

interface RecipeFilterProps {
  visible: boolean;
  onClose: () => void;
  recipes: any[];
  onFilteredResults: (filteredRecipes: any[]) => void;
  allRatings?: any[];
  showUserSearch?: boolean;
}

export const RecipeFilter: React.FC<RecipeFilterProps> = ({
  visible,
  onClose,
  recipes,
  onFilteredResults,
  allRatings = [],
  showUserSearch = false
}) => {
  const [searchText, setSearchText] = useState('');
  const [userSearchText, setUserSearchText] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string[]>([]);
  const [includeIngredients, setIncludeIngredients] = useState<string[]>([]);
  const [excludeIngredients, setExcludeIngredients] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating' | 'alphabetical'>('newest');
  const [showMoreInclude, setShowMoreInclude] = useState(false);
  const [showMoreExclude, setShowMoreExclude] = useState(false);

  // Extraemos ingredientes automáticamente (mejorable)
  const [availableIngredients, setAvailableIngredients] = useState<string[]>([]);


  useEffect(() => {
    if (recipes.length > 0) {
      const ingredients = new Set<string>();
      recipes.forEach(recipe => {
        if (recipe.ingredientes) {
          recipe.ingredientes.forEach(ing => {
            ingredients.add(ing.nombre);
          });
        }
      });
      setAvailableIngredients(Array.from(ingredients));
    }
  }, [recipes]);

  const difficulties = ['Fácil', 'Media', 'Difícil'];
  const sortOptions = [
    { value: 'newest', label: 'Nuevos' },
    { value: 'oldest', label: 'Antiguos' },
    { value: 'rating', label: 'Puntuación' },
    { value: 'alphabetical', label: 'Alfabéticamente' }
  ];

  // Función para aplicar todos los filtros
  const applyFilters = () => {
    let filtered = [...recipes];

    // Filtro por búsqueda de usuario
    if (showUserSearch && userSearchText.trim()) {
      filtered = filtered.filter(recipe =>
        recipe.autor?.toLowerCase().includes(userSearchText.toLowerCase())
      );
    }

    // Filtro por dificultad
    if (selectedDifficulty.length > 0) {
      filtered = filtered.filter(recipe =>
        selectedDifficulty.includes(recipe.dificultad)
      );
    }

    // Filtro por ingredientes incluidos
    if (includeIngredients.length > 0) {
      filtered = filtered.filter(recipe => {
        const recipeIngredients = recipe.ingredientes?.map(ing => ing.nombre) || [];
        return includeIngredients.every(ingredient =>
          recipeIngredients.includes(ingredient)
        );
      });
    }

    // Filtro por ingredientes excluidos
    if (excludeIngredients.length > 0) {
      filtered = filtered.filter(recipe => {
        const recipeIngredients = recipe.ingredientes?.map(ing => ing.nombre) || [];
        return !excludeIngredients.some(ingredient =>
          recipeIngredients.includes(ingredient)
        );
      });
    }

    // Ordenamr
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.fecha_creacion) - new Date(b.fecha_creacion));
        break;
      case 'rating':
        filtered.sort((a, b) => {
          const ratingA = allRatings.find(r => r.receta_id === a.id)?.averageRating || 0;
          const ratingB = allRatings.find(r => r.receta_id === b.id)?.averageRating || 0;
          return ratingB - ratingA;
        });
        break;
      case 'alphabetical':
        filtered.sort((a, b) => {
          const titleA = a.title || a.titulo || '';
          const titleB = b.title || b.titulo || '';
          return titleA.localeCompare(titleB);
        });
        break;
    }

    return filtered;
  };

  const toggleDifficulty = (difficulty: string) => {
    setSelectedDifficulty(prev =>
      prev.includes(difficulty)
        ? prev.filter(d => d !== difficulty)
        : [...prev, difficulty]
    );
  };

  const toggleIngredient = (ingredient: string, type: 'include' | 'exclude') => {
    if (type === 'include') {
      setIncludeIngredients(prev =>
        prev.includes(ingredient)
          ? prev.filter(i => i !== ingredient)
          : [...prev, ingredient]
      );
      setExcludeIngredients(prev => prev.filter(i => i !== ingredient));
    } else {
      setExcludeIngredients(prev =>
        prev.includes(ingredient)
          ? prev.filter(i => i !== ingredient)
          : [...prev, ingredient]
      );
      setIncludeIngredients(prev => prev.filter(i => i !== ingredient));
    }
  };

  const handleApplyFilters = () => {
    const filteredRecipes = applyFilters();
    onFilteredResults(filteredRecipes);
    onClose();
  };

  const handleClearFilters = () => {
    setSearchText('');
    setUserSearchText('');
    setSelectedDifficulty([]);
    setIncludeIngredients([]);
    setExcludeIngredients([]);
    setSortBy('newest');
    setShowMoreInclude(false);
    setShowMoreExclude(false);

    // Se devuelve todas las recetas sin filtros
    onFilteredResults(recipes);
  };

  // Verificamos si hay filtros activos
  const hasActiveFilters = () => {
    return searchText.trim() !== '' ||
      userSearchText.trim() !== '' ||
      selectedDifficulty.length > 0 ||
      includeIngredients.length > 0 ||
      excludeIngredients.length > 0 ||
      sortBy !== 'newest';
  };

  const renderIngredientButtons = (
    ingredientList: string[],
    selectedList: string[],
    type: 'include' | 'exclude',
    showMore: boolean,
    setShowMore: (show: boolean) => void
  ) => {
    const displayIngredients = showMore ? ingredientList : ingredientList.slice(0, 6);

    return (
      <View>
        <View style={styles.ingredientContainer}>
          {displayIngredients.map((ingredient) => (
            <TouchableOpacity
              key={ingredient}
              style={[
                styles.ingredientButton,
                selectedList.includes(ingredient) && styles.selectedIngredient
              ]}
              onPress={() => toggleIngredient(ingredient, type)}
            >
              <Text style={[
                styles.ingredientText,
                selectedList.includes(ingredient) && styles.selectedIngredientText
              ]}>
                {ingredient}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {ingredientList.length > 6 && (
          <TouchableOpacity
            style={styles.showMoreButton}
            onPress={() => setShowMore(!showMore)}
          >
            <Text style={styles.showMoreText}>
              {showMore ? '← Ver menos' : 'Ver más →'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>🔍 Filtros</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent}>

            {/* Búsqueda por usuario */}
            {showUserSearch && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Buscar por usuario</Text>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Buscar por usuario..."
                  value={userSearchText}
                  onChangeText={setUserSearchText}
                />
              </View>
            )}

            {/* Dificultad */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Dificultad</Text>
              <View style={styles.difficultyContainer}>
                {difficulties.map((difficulty) => (
                  <TouchableOpacity
                    key={difficulty}
                    style={[
                      styles.difficultyButton,
                      selectedDifficulty.includes(difficulty) && styles.selectedDifficulty
                    ]}
                    onPress={() => toggleDifficulty(difficulty)}
                  >
                    <Text style={[
                      styles.difficultyText,
                      selectedDifficulty.includes(difficulty) && styles.selectedDifficultyText
                    ]}>
                      {difficulty}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Incluir ingredientes */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Incluir ingredientes</Text>
              {renderIngredientButtons(
                availableIngredients,
                includeIngredients,
                'include',
                showMoreInclude,
                setShowMoreInclude
              )}
            </View>

            {/* Excluir ingredientes */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Excluir ingredientes</Text>
              {renderIngredientButtons(
                availableIngredients,
                excludeIngredients,
                'exclude',
                showMoreExclude,
                setShowMoreExclude
              )}
            </View>

            {/* Ordenar por */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ordenar por</Text>
              <View style={styles.sortContainer}>
                {sortOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.sortButton,
                      sortBy === option.value && styles.selectedSort
                    ]}
                    onPress={() => setSortBy(option.value as any)}
                  >
                    <Text style={[
                      styles.sortText,
                      sortBy === option.value && styles.selectedSortText
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Mostrar contador de resultados */}
            {hasActiveFilters() && (
              <View style={styles.previewContainer}>
                <Text style={styles.previewText}>
                  {applyFilters().length} receta{applyFilters().length !== 1 ? 's' : ''} encontrada{applyFilters().length !== 1 ? 's' : ''}
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Botones */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearFilters}
            >
              <Text style={styles.clearButtonText}>Limpiar filtros</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleApplyFilters}
            >
              <Text style={styles.applyButtonText}>Aplicar filtros</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#F5E6D3',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0D0C0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  closeButton: {
    fontSize: 24,
    color: '#8B4513',
    fontWeight: 'bold',
  },
  scrollContent: {
    maxHeight: '70%',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0D0C0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#D0C0B0',
  },
  difficultyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  difficultyButton: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D0C0B0',
  },
  selectedDifficulty: {
    backgroundColor: '#D2B48C',
    borderColor: '#8B4513',
  },
  difficultyText: {
    color: '#8B4513',
    fontSize: 14,
  },
  selectedDifficultyText: {
    color: 'white',
    fontWeight: 'bold',
  },
  ingredientContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ingredientButton: {
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#D0C0B0',
  },
  selectedIngredient: {
    backgroundColor: '#D2B48C',
    borderColor: '#8B4513',
  },
  ingredientText: {
    color: '#8B4513',
    fontSize: 12,
  },
  selectedIngredientText: {
    color: 'white',
    fontWeight: 'bold',
  },
  showMoreButton: {
    alignItems: 'center',
    marginTop: 12,
  },
  showMoreText: {
    color: '#8B4513',
    fontSize: 14,
    fontWeight: 'bold',
  },
  sortContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sortButton: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D0C0B0',
  },
  selectedSort: {
    backgroundColor: '#D2B48C',
    borderColor: '#8B4513',
  },
  sortText: {
    color: '#8B4513',
    fontSize: 14,
  },
  selectedSortText: {
    color: 'white',
    fontWeight: 'bold',
  },
  previewContainer: {
    margin: 20,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 8,
    alignItems: 'center',
  },
  previewText: {
    fontSize: 14,
    color: '#8B4513',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  clearButton: {
    flex: 1,
    backgroundColor: '#D2B48C',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#FFD700',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#8B4513',
    fontSize: 16,
    fontWeight: 'bold',
  },
});