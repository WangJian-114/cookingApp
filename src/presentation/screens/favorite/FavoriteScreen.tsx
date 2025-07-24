import React, { useState, useCallback, useEffect } from 'react'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  Dimensions,
  Pressable,
  Image,
  RefreshControl,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Searchbar } from 'react-native-paper'
import LinearGradient from 'react-native-linear-gradient'
import { RecipeFilter } from '../../components/shared/RecipeFilter';
import api from '../../../services/api'
import { IonIcon } from '../../components/shared/IonIcon'
import { Header } from '../../components/shared/header/Header'

interface Ingrediente {
  nombre: string;
  cantidad: string;
  unidad: string;
}

interface DisplayedRecipe {
  id: string;
  title: string;
  description: string;
  dificultad: 'Fácil' | 'Media' | 'Difícil';
  autor: string;
  fecha_creacion: string;
  ingredientes: Ingrediente[];
  image: { uri: string } | typeof placeholderImage;
  rating: number;
}

const placeholderImage = require('../../../assets/milanesacpure.png')
const CARD_WIDTH = Dimensions.get('window').width - 32

export const FavoriteScreen = () => {
  const navigation = useNavigation()
  const [searchQuery, setSearchQuery] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [showFilter, setShowFilter] = useState(false);
  const [displayedRecipes, setDisplayedRecipes] = useState<DisplayedRecipe[]>([])
  const [filteredRecipes, setFilteredRecipes] = useState<DisplayedRecipe[]>([])
  const [isFiltered, setIsFiltered] = useState(false);

  // 1) Traer favoritos
  const fetchFavorites = async () => {
    try {
      const res = await api.get('/favs/misFavoritos')
      const raw = Array.isArray(res.data) ? res.data : []
      // 1) Filtrás todos los null/undefined
      const cleaned = raw.filter((r): r is NonNullable<typeof r> => r != null)

      // 2) Ahora sí mapeás sin miedo
      const mapped = cleaned.map(r => {
        const vals = Array.isArray(r.valoraciones) ? r.valoraciones : []
        const avg = vals.length
          ? vals.reduce((sum, v) => sum + (v.rating ?? 0), 0) / vals.length
          : 0

        return {
          id: r._id,
          title: r.titulo,
          description: r.descripcion,
          dificultad: r.dificultad,
          autor: r.autor_id.name,
          fecha_creacion: r.fecha_creacion,
          ingredientes: r.ingredientes,
          image: r.imagen ? { uri: r.imagen } : placeholderImage,
          rating: avg,
        }
      })

      setDisplayedRecipes(mapped);
      if (!isFiltered) {
        setFilteredRecipes(mapped);
      }
    } catch (err) {
      console.warn('❌ Error al cargar favoritos:', err)
      Alert.alert('Error', 'No pudimos cargar tus favoritos')
    }
  }

  // 2) Cargar cada vez que la pantalla recibe foco
  useFocusEffect(
    useCallback(() => {
      fetchFavorites()
    }, [])
  )

  // 3) Pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchFavorites()
    setRefreshing(false)
  }, [])

  // 4) Eliminar de favoritos al apretar el corazón
  const handleRemoveFavorite = async (id: string) => {
    try {
      await api.delete(`/favs/borrar/${id}`)
      // recarga la lista
      fetchFavorites()
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || err.message)
    }
  }

  const handleFilteredResults = (filtered: DisplayedRecipe[]) => {
    setFilteredRecipes(filtered);
    setIsFiltered(true);
  }

  const clearFilters = () => {
    setFilteredRecipes(displayedRecipes);
    setIsFiltered(false);
  }

  useEffect(() => {
    navigation.setOptions({ headerShown: false })
  }, [navigation])


  const searchFiltered = filteredRecipes.filter(r =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const renderItem = ({ item }: { item: DisplayedRecipe }) => (
    <Pressable
      style={styles.recipeCard}
      onPress={() =>
        navigation.navigate('DetailsScreen' as never, { recipeId: item.id } as never)
      }
    >
      <Image source={item.image} style={styles.recipeImage} />
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeTitle}>{item.title}</Text>
        <Text style={styles.recipeDesc} numberOfLines={3}>
          {item.description}
        </Text>
        <View style={styles.recipeMetadata}>
          <Text style={styles.recipeAuthor}>Por: {item.autor}</Text>
          <Text style={styles.recipeDifficulty}>Dificultad: {item.dificultad}</Text>
          {item.rating > 0 && (
            <View style={styles.ratingContainer}>
              <IonIcon name="star" size={12} color="#FFD700" />
              <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
            </View>
          )}
        </View>
      </View>
      <Pressable
        style={styles.favoriteButton}
        onPress={() => handleRemoveFavorite(item.id)}
      >
        <IonIcon name="heart" size={20} color="#fff" />
      </Pressable>
    </Pressable>
  )

  return (
    <LinearGradient
      colors={['rgba(233,163,0,0.9)', 'rgba(251,192,45,0.8)', 'rgba(255,255,255,0.6)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.container}>
        <Header />

        {/* Search */}
        <View style={styles.searchContainer}>
          <LinearGradient
            colors={['#FFFFFF', '#FFD740']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.searchGradient}
          >
            <Searchbar
              placeholder="Buscar en favoritos"
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchbar}
              inputStyle={styles.searchbarInput}
              icon={({ size, color }) => (
                <IonIcon name="search-outline" size={size} color={color} />
              )}
            />
          </LinearGradient>
          <Pressable
            style={[styles.filterButton, isFiltered && styles.filterButtonActive]}
            onPress={() => setShowFilter(true)}
          >
            <IonIcon name="options-outline" size={24} color={isFiltered ? "#fff" : "#333"} />
          </Pressable>
        </View>

        {/* Indicador de filtros activos */}
        {isFiltered && (
          <View style={styles.filterIndicator}>
            <Text style={styles.filterIndicatorText}>
              {filteredRecipes.length} de {displayedRecipes.length} recetas favoritas
            </Text>
            <Pressable onPress={clearFilters}>
              <Text style={styles.clearFiltersText}>Limpiar filtros</Text>
            </Pressable>
          </View>
        )}

        <Text style={styles.sectionTitle}>RECETAS FAVORITAS</Text>

        <FlatList
          data={searchFiltered}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {displayedRecipes.length === 0
                ? 'Aún no tienes recetas favoritas.'
                : searchQuery.trim() !== ''
                  ? 'No encontramos coincidencias en la búsqueda.'
                  : 'No hay recetas que coincidan con los filtros aplicados.'}
            </Text>
          }
        />

        {/* Modal de filtros */}
        <RecipeFilter
          visible={showFilter}
          onClose={() => setShowFilter(false)}
          recipes={displayedRecipes}
          onFilteredResults={handleFilteredResults}
          showUserSearch={true}
        />
      </SafeAreaView>
    </LinearGradient>
  )
}

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
  filterButtonActive: {
    backgroundColor: '#FF6B35',
  },

  filterIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  filterIndicatorText: {
    fontSize: 12,
    color: '#333',
    fontWeight: 'bold',
  },
  clearFiltersText: {
    fontSize: 12,
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

  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },

  recipeCard: {
    width: CARD_WIDTH,
    backgroundColor: '#FFF9E6',
    borderRadius: 7,
    overflow: 'hidden',
    position: 'relative',
  },
  recipeImage: { width: '100%', height: CARD_WIDTH * 0.3 },
  recipeInfo: { padding: 8 },
  recipeTitle: { fontSize: 14, marginBottom: 4, fontWeight: 'bold' },
  recipeDesc: { fontSize: 12, color: '#333', lineHeight: 16, marginBottom: 8 },
  recipeMetadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recipeAuthor: { fontSize: 10, color: '#666', marginBottom: 2 },
  recipeDifficulty: { fontSize: 10, color: '#666', marginBottom: 2 },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  ratingText: {
    fontSize: 10,
    color: '#666',
    marginLeft: 2,
  },
  favoriteButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(255,187,47,0.4)',
    borderRadius: 12,
    padding: 4,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 32,
    color: '#666',
  },
})