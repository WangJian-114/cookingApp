import React, { useState, useCallback, useEffect } from 'react'
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  Dimensions,
  Pressable,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Searchbar } from 'react-native-paper'
import {
  useNavigation,
  useFocusEffect,
} from '@react-navigation/native'
import LinearGradient from 'react-native-linear-gradient'
import { IonIcon } from '../../components/shared/IonIcon'
import { Header } from '../../components/shared/header/Header'
import { RecipeFilter } from '../../components/shared/RecipeFilter'

import { useRecipes } from '../../../contexts/RecipesContext'
import { useNetwork } from '../../hooks/useNetwork'

const { width } = Dimensions.get('window')
const POP_CARD_WIDTH = (width - 32 - 12 * 2) / 3
const ALL_CARD_WIDTH = (width - 32 - 8) / 2

export const HomeScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [showFilter, setShowFilter] = useState(false)
  const [displayedRecipes, setDisplayedRecipes] = useState([])
  const [isFiltered, setIsFiltered] = useState(false) 

  const {
    allRecipes,
    popularRecipes,
    favorites,
    toggleFavorite,
    refreshAll,
    getAllRatings,
    allRatings,
  } = useRecipes();

  useFocusEffect(
    useCallback(() => {
      refreshAll();
    }, [refreshAll])
  )

  useEffect(() => {
    getAllRatings();
  }, [allRecipes, getAllRatings]);

  useEffect(() => {
    if (!isFiltered) {
      setDisplayedRecipes(allRecipes);
    }
  }, [allRecipes, isFiltered]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await refreshAll();
    setRefreshing(false)
  }, [refreshAll])

  const navigateToDetails = (recipeId) =>
    navigation.navigate('DetailsScreen', { recipeId })

  // Manejar resultados del filtro
  const handleFilteredResults = (filteredRecipes) => {
    setDisplayedRecipes(filteredRecipes);
    setIsFiltered(true);
  };

  // Limpiar filtros
  const handleClearFilters = () => {
    setDisplayedRecipes(allRecipes);
    setIsFiltered(false);
    setSearchQuery('');
  };

  const isConnected = useNetwork();

  if (isConnected === null) return <ActivityIndicator />;

  if (!isConnected) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No se puede usar la aplicación sin conexión.</Text>
      </View>
    );
  }

  // Filtrar por el searchbar (la búsqueda simple)
  const recipesToShow = searchQuery.trim()
    ? displayedRecipes.filter(r =>
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : displayedRecipes;

  const renderPopular = ({ item }) => (
    <Pressable
      style={styles.popularCard}
      onPress={() => navigateToDetails(item.id)}>
      <Image
        source={item.image}
        style={styles.popularImage}
        resizeMode="cover"
      />
    </Pressable>
  )

  const renderRecipe = ({ item }) => {
    const isFav = favorites.has(item.id)
    const ratingObj = allRatings.find(r => r.receta_id === item.id)
    const avgRating = ratingObj?.averageRating ?? 0

    return (
      <Pressable
        style={styles.recipeCard}
        onPress={() => navigateToDetails(item.id)}>
        <Image source={item.image} style={styles.recipeImage} />
        <View style={styles.ratingBadge}>
          <IonIcon name="star" size={12} color="#FFD700" />
          <Text style={styles.ratingText}>{avgRating.toFixed(1)}</Text>
        </View>
        <View style={styles.recipeInfo}>
          <Text style={styles.recipeTitle}>{item.title}</Text>
          <Text style={styles.recipeDesc} numberOfLines={3}>
            {item.description}
          </Text>
        </View>
        <Pressable
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(item.id)}>
          <IonIcon
            name={isFav ? 'heart' : 'heart-outline'}
            size={20}
            color="#fff"
          />
        </Pressable>
      </Pressable>
    )
  }

  return (
    <LinearGradient
      colors={['rgba(233,163,0,0.9)', 'rgba(251,192,45,0.8)', 'rgba(255,255,255,0.6)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradientContainer}>
      <SafeAreaView style={styles.container}>
        <Header />

        {/* Search */}
        <View style={styles.searchContainer}>
          <LinearGradient
            colors={['#FFFFFF', '#FFD740']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.searchGradient}>
            <Searchbar
              placeholder="Buscar receta"
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchbar}
              inputStyle={styles.searchbarInput}
              icon={({ size, color }) => (
                <IonIcon name="search-outline" size={size} color={color} />
              )}
              clearIcon={({ size, color }) => (
                <IonIcon name="close-circle-outline" size={size} color={color} />
              )}
            />
          </LinearGradient>
          <Pressable
            style={[
              styles.filterButton,
              isFiltered && styles.filterButtonActive
            ]}
            onPress={() => setShowFilter(true)}>
            <IonIcon name="options-outline" size={24} color="#333" />
            {isFiltered && <View style={styles.filterIndicator} />}
          </Pressable>
        </View>

        {/* Indicador de filtros activos */}
        {isFiltered && (
          <View style={styles.activeFiltersContainer}>
            <Text style={styles.activeFiltersText}>
              {recipesToShow.length} receta{recipesToShow.length !== 1 ? 's' : ''} encontrada{recipesToShow.length !== 1 ? 's' : ''}
            </Text>
            <Pressable onPress={handleClearFilters}>
              <Text style={styles.clearFiltersText}>Limpiar filtros</Text>
            </Pressable>
          </View>
        )}

        {/* Populares */}
        <Text style={styles.sectionTitle}>RECETAS MÁS POPULARES</Text>
        <FlatList
          data={popularRecipes}
          horizontal
          keyExtractor={i => i.id}
          renderItem={renderPopular}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.popularList}
        />

        {/* Todas */}
        <Text style={styles.sectionTitle}>TODAS LAS RECETAS</Text>
        <FlatList
          data={recipesToShow}
          keyExtractor={i => i.id}
          renderItem={renderRecipe}
          numColumns={2}
          columnWrapperStyle={styles.allColumnWrapper}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.allList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />

        {/* Componente de filtro */}
        <RecipeFilter
          visible={showFilter}
          onClose={() => setShowFilter(false)}
          recipes={allRecipes}
          onFilteredResults={handleFilteredResults}
          allRatings={allRatings}
          showUserSearch={true}
        />
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  gradientContainer: { flex: 1 },
  container: { flex: 1 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  searchGradient: { flex: 1, borderRadius: 20, opacity: 0.7 },
  searchbar: { backgroundColor: 'transparent', elevation: 0 },
  searchbarInput: { fontSize: 16 },
  filterButton: {
    marginLeft: 8,
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E9A300',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterButtonActive: {
    backgroundColor: '#D2691E',
  },
  filterIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4444',
  },
  activeFiltersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.8)',
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  activeFiltersText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  clearFiltersText: {
    fontSize: 14,
    color: '#E9A300',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    color: '#333',
  },
  popularList: { paddingLeft: 16, paddingBottom: 12 },
  popularCard: {
    width: POP_CARD_WIDTH,
    height: POP_CARD_WIDTH * 0.6,
    marginRight: 12,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 40,
  },
  popularImage: {
    width: POP_CARD_WIDTH,
    height: '100%',
  },
  allList: { paddingHorizontal: 16, paddingBottom: 16 },
  allColumnWrapper: { justifyContent: 'space-between', marginBottom: 12 },
  recipeCard: {
    width: ALL_CARD_WIDTH,
    backgroundColor: '#FFF9E6',
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  recipeImage: { width: '100%', height: ALL_CARD_WIDTH * 0.6 },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 8,
    paddingHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: { marginLeft: 2, color: '#fff', fontSize: 10 },
  recipeInfo: { padding: 8 },
  recipeTitle: { fontFamily: 'sans-serif-medium', fontSize: 14, marginBottom: 4 },
  recipeDesc: { fontSize: 12, color: '#333', lineHeight: 16 },
  favoriteButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(255,187,47,0.4)',
    borderRadius: 12,
    padding: 4,
  },
})