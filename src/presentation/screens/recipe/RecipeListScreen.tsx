// src/screens/recipes/RecipesListScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  Dimensions,
  Pressable,
  Image,
  RefreshControl,
  Modal,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Searchbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import LinearGradient from 'react-native-linear-gradient';
import { IonIcon } from '../../components/shared/IonIcon';
import { Header } from '../../components/shared/header/Header';
import { RecipesStackParamList } from '../../navigation/RecipesStackNavigator';
import { useMyRecipes } from '../../../contexts/MyRecipesContext';
import { RecipeFilter } from '../../components/shared/RecipeFilter';

type RecipesListScreenNavigationProp = StackNavigationProp<
  RecipesStackParamList,
  'RecipesList'
>;


export const RecipesListScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [showFilter, setShowFilter] = useState(false);
  const [displayedRecipes, setDisplayedRecipes] = useState<any[]>([]);
  const [isFiltered, setIsFiltered] = useState(false);

  const {
    recipes,
    loading,
    error,
    deleteRecipe,
    refreshRecipes,
    clearError
  } = useMyRecipes();

  useEffect(() => {
    if (!isFiltered) {
      setDisplayedRecipes(recipes);
    }
  }, [recipes, isFiltered]);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refreshRecipes();
    });

    return unsubscribe;
  }, [navigation, refreshRecipes]);

  useEffect(() => {
    if (error && recipes.length === 0) {
      Alert.alert('Error', error, [
        {
          text: 'OK',
          onPress: () => {
            clearError();
          }
        }
      ]);
    }
  }, [error, recipes.length, clearError]);

  const onRefresh = useCallback(async () => {
    await refreshRecipes();
  }, [refreshRecipes]);

  const navigateToDetails = (recipeId: string) => {
    navigation.navigate('DetailsScreen', { recipeId });
  };

  const handleFilteredResults = (filteredRecipes: any[]) => {
    setDisplayedRecipes(filteredRecipes);
    setIsFiltered(true);
  };

  const clearFilters = () => {
    setDisplayedRecipes(recipes);
    setIsFiltered(false);
  };

  const searchFilteredRecipes = displayedRecipes
    .filter(r => r && r.titulo && typeof r.titulo === 'string')
    .filter(r => r.titulo.toLowerCase().includes(searchQuery.toLowerCase()));

  const viewRecipeDetails = (recipeId: string) => {
    navigation.navigate('DetailsScreen', { recipeId });
  };

  const editRecipe = (recipeId: string) => {
    setMenuVisible(null);
    navigation.navigate('RecipeEdit', { recipeId: recipeId });
  };

  const handleDeleteRecipe = async (recipeId: string) => {
    setMenuVisible(null);
    setRecipeToDelete(recipeId);
    setDeleteConfirmVisible(true);
  };

  const confirmDelete = async () => {
    if (!recipeToDelete) return;

    const success = await deleteRecipe(recipeToDelete);

    if (success) {
      Alert.alert('Éxito', 'Receta eliminada correctamente');
      if (isFiltered) {
        setDisplayedRecipes(prev => prev.filter(r => r._id !== recipeToDelete));
      }
    }

    setDeleteConfirmVisible(false);
    setRecipeToDelete(null);
  };

  const cancelDelete = () => {
    setDeleteConfirmVisible(false);
    setRecipeToDelete(null);
  };

  const toggleMenu = (recipeId: string, event: any) => {
    if (menuVisible === recipeId) {
      setMenuVisible(null);
      return;
    }

    // Obtener la posición del botón
    event.target.measure((fx: number, fy: number, width: number, height: number, px: number, py: number) => {
      const screenWidth = Dimensions.get('window').width;
      const screenHeight = Dimensions.get('window').height;
      const menuWidth = 140;
      const menuHeight = 100;

      let x = px + width + 8;
      let y = py - 5;

      if (x + menuWidth > screenWidth) {
        x = px - menuWidth - 8;
      }
      if (x < 10) {
        x = px - (menuWidth / 2) + (width / 2);
      }

      if (y + menuHeight > screenHeight) {
        y = py - menuHeight + height + 5;
      }
      if (y < 0) {
        y = py + height + 5;
      }
      setMenuPosition({ x, y });
      setMenuVisible(recipeId);
    });
  };

  const closeMenu = () => {
    setMenuVisible(null);
  };

  const openFilter = () => {
    setShowFilter(true);
  };

  const closeFilter = () => {
    setShowFilter(false);
  };

  const renderItem = ({ item }: { item: any }) => {
    if (!item || !item._id || !item.titulo) {
      console.warn('Item inválido encontrado:', item);
      return null;
    }

    return (
      <Pressable style={styles.recipeCard} onPress={() => viewRecipeDetails(item._id)}>
        <Image
          source={
            item.imagen
              ? { uri: item.imagen }
              : require('../../../assets/milanesacpure.png')
          }
          style={styles.recipeImage}
        />

        <View style={styles.recipeContent}>
          <View style={styles.recipeInfo}>
            <Text style={styles.recipeTitle}>{item.titulo}</Text>
            <Text style={styles.recipeDesc} numberOfLines={4}>
              {item.descripcion || 'Sin descripción'}
            </Text>
            {/* Mostrar el autor si existe */}
            {item.autor && (
              <Text style={styles.recipeAuthor}>Por: {item.autor}</Text>
            )}
          </View>

          <View style={styles.menuContainer}>
            <Pressable
              style={styles.menuButton}
              onPress={(event) => toggleMenu(item._id, event)}
            >
              <IonIcon name="ellipsis-vertical" size={20} color="#E9A300" />
            </Pressable>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <LinearGradient
      colors={['rgba(233,163,0,0.9)', 'rgba(251,192,45,0.8)', 'rgba(255,255,255,0.6)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.container}>
        <Header />

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <LinearGradient
            colors={['#FFFFFF', '#FFD740']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.searchGradient}
          >
            <Searchbar
              placeholder="Buscar receta"
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchbar}
              inputStyle={styles.searchbarInput}
              icon={({ size, color }) => (
                <IonIcon name="search-outline" size={size} color={color} />
              )}
            />
          </LinearGradient>
          <Pressable style={styles.filterButton} onPress={openFilter}>
            <IonIcon name="options-outline" size={24} color="#333" />
          </Pressable>
        </View>

        {/* Indicador de filtros activos */}
        {isFiltered && (
          <View style={styles.filterIndicator}>
            <Text style={styles.filterIndicatorText}>
              Mostrando {displayedRecipes.length} receta{displayedRecipes.length !== 1 ? 's' : ''} filtrada{displayedRecipes.length !== 1 ? 's' : ''}
            </Text>
            <TouchableOpacity onPress={clearFilters} style={styles.clearFilterButton}>
              <Text style={styles.clearFilterText}>Limpiar filtros</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Recipes List */}
        <FlatList
          data={searchFilteredRecipes}
          keyExtractor={(item, index) => item._id || `recipe-${index}`}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {loading ? 'Cargando recetas...' : 'No se encontraron recetas que coincidan con tu búsqueda.'}
            </Text>
          }
        />

        {/* Componente de filtro */}
        <RecipeFilter
          visible={showFilter}
          onClose={closeFilter}
          recipes={recipes}
          onFilteredResults={handleFilteredResults}
          allRatings={[]}
          showUserSearch={false}
        />

        {/* Menú desplegable global - fuera del FlatList */}
        {menuVisible && (
          <Modal
            transparent={true}
            visible={true}
            animationType="none"
            onRequestClose={closeMenu}
          >
            <TouchableOpacity
              style={styles.overlay}
              activeOpacity={1}
              onPress={closeMenu}
            >
              <View
                style={[
                  styles.menuDropdown,
                  {
                    position: 'absolute',
                    top: menuPosition.y,
                    left: menuPosition.x,
                  }
                ]}
              >
                <Pressable
                  style={styles.menuItem}
                  onPress={() => editRecipe(menuVisible)}
                >
                  <IonIcon name="create-outline" size={16} color="#333" />
                  <Text style={styles.menuItemText}>Editar receta</Text>
                </Pressable>

                <View style={styles.menuSeparator} />

                <Pressable
                  style={styles.menuItem}
                  onPress={() => handleDeleteRecipe(menuVisible)}
                >
                  <IonIcon name="trash-outline" size={16} color="#E74C3C" />
                  <Text style={[styles.menuItemText, { color: '#E74C3C' }]}>
                    Eliminar receta
                  </Text>
                </Pressable>
              </View>
            </TouchableOpacity>
          </Modal>
        )}

        {/* Modal de confirmación de eliminación */}
        <Modal
          transparent={true}
          visible={deleteConfirmVisible}
          animationType="fade"
          onRequestClose={cancelDelete}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.confirmModal}>
              <LinearGradient
                colors={['#FFF9E6', '#FFE0B2']}
                style={styles.modalGradient}
              >
                <View style={styles.modalHeader}>
                  <IonIcon name="warning" size={32} color="#E9A300" />
                  <Text style={styles.modalTitle}>Eliminar receta</Text>
                </View>

                <Text style={styles.modalMessage}>
                  ¿Estás seguro de que quieres eliminar esta receta?
                  Esta acción no se puede deshacer.
                </Text>

                <View style={styles.modalButtons}>
                  <Pressable
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={cancelDelete}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </Pressable>

                  <Pressable
                    style={[styles.modalButton, styles.deleteButton]}
                    onPress={confirmDelete}
                  >
                    <Text style={styles.deleteButtonText}>Eliminar</Text>
                  </Pressable>
                </View>
              </LinearGradient>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: { flex: 1 },
  container: { flex: 1 },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  searchGradient: {
    flex: 1,
    borderRadius: 20,
    opacity: 0.7,
  },
  searchbar: {
    backgroundColor: 'transparent',
    elevation: 0,
  },
  searchbarInput: { fontSize: 16 },
  filterButton: {
    marginLeft: 8,
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E9A300',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Estilos para el indicador de filtros
  filterIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
  },
  filterIndicatorText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  clearFilterButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearFilterText: {
    fontSize: 14,
    color: '#E9A300',
    fontWeight: 'bold',
  },

  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },

  recipeCard: {
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recipeImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  recipeContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  recipeInfo: {
    flex: 1,
    paddingRight: 8,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  recipeDesc: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 4,
  },
  recipeAuthor: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },

  // Estilos del menú
  menuContainer: {
    position: 'relative',
  },
  menuButton: {
    padding: 8,
    marginTop: -4,
    backgroundColor: '#FFF',
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  menuDropdown: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    minWidth: 140,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 15,
    zIndex: 9999,
    maxWidth: 160,
    overflow: 'hidden',
  },

  menuDropdownWithArrow: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    minWidth: 140,
    maxWidth: 160,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 15,
    zIndex: 9999,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuItemText: {
    marginLeft: 10,
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  menuSeparator: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginHorizontal: 16,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Estilos del modal de confirmación
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  confirmModal: {
    width: '90%',
    maxWidth: 340,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  modalGradient: {
    padding: 24,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  deleteButton: {
    backgroundColor: '#E74C3C',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },

  emptyText: {
    textAlign: 'center',
    marginTop: 32,
    color: '#666',
    fontSize: 16,
  },
});
