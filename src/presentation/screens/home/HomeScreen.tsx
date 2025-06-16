// src/screens/home/HomeScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  Dimensions,
  Pressable,
  Image,
  ImageSourcePropType,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Searchbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { IonIcon } from '../../components/shared/IonIcon';
import { Header } from '../../components/shared/header/Header';

// 1) imagen popular
const popularImage: ImageSourcePropType = require('../../../assets/milanesacpure.png');

// mocks
type PopularRecipe = { id: string; image: ImageSourcePropType };
const popularRecipesMock: PopularRecipe[] = [
  { id: 'p1', image: popularImage },
  { id: 'p2', image: popularImage },
  { id: 'p3', image: popularImage },
];

type Recipe = {
  id: string;
  title: string;
  description: string;
  image: ImageSourcePropType;
  rating: number;
  isFavorite: boolean;
};
const allRecipesMock: Recipe[] = [
  {
    id: '1',
    title: 'Guiso de Lentejas',
    description: 'Un reconfortante guiso de lentejas con verduras frescas y especias.',
    image: popularImage,
    rating: 4.5,
    isFavorite: false,
  },
  {
    id: '2',
    title: 'Sopa de Calabaza',
    description: 'Sopa cremosa de calabaza, ideal para días fríos.',
    image: popularImage,
    rating: 4.2,
    isFavorite: true,
  },
  {
    id: '3',
    title: 'Pastel de Papa',
    description: 'Capas de papa, carne y queso, gratinado al horno.',
    image: popularImage,
    rating: 4.8,
    isFavorite: false,
  },
  {
    id: '4',
    title: 'Albóndigas en Salsa',
    description: 'Albóndigas en salsa de tomate casera, servidas con arroz.',
    image: popularImage,
    rating: 4.7,
    isFavorite: true,
  },
];

export const HomeScreen = () => {

  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Inyectamos el icono de hamburguesa en el header de cada tab
  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  // Pull-to-refresh simulado
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // aquí iría tu fetch real...
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  // Render para sección “Populares”
  const renderPopularItem = ({ item }: { item: PopularRecipe }) => (
    <View style={styles.popularCard}>
      <Image source={item.image} style={styles.popularImage} />
    </View>
  );

  // Lista filtrada por búsqueda
  const filteredRecipes = allRecipesMock.filter(r =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Render para sección “Todas las recetas”
  const renderAllItem = ({ item }: { item: Recipe }) => (
    <View style={styles.recipeCard}>
      <Image source={item.image} style={styles.recipeImage} />
      <View style={styles.ratingBadge}>
        <IonIcon name="star" size={12} color="#FFD700" />
        <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
      </View>
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeTitle}>{item.title}</Text>
        <Text style={styles.recipeDesc} numberOfLines={3}>
          {item.description}
        </Text>
      </View>
      <Pressable style={styles.favoriteButton}>
        <IonIcon
          name={item.isFavorite ? 'heart' : 'heart-outline'}
          size={20}
          color="#fff"
        />
      </Pressable>
    </View>
  );

  return (
    <LinearGradient
      colors={['rgba(233,163,0,0.9)', 'rgba(251,192,45,0.8)', 'rgba(255,255,255,0.6)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.container}>
        <Header />
        {/* Barra de búsqueda + filtros */}
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
          <Pressable style={styles.filterButton}>
            <IonIcon name="options-outline" size={24} color="#333" />
          </Pressable>
        </View>

        {/* Sección “Recetas más populares” */}
        <Text style={styles.sectionTitle}>RECETAS MÁS POPULARES</Text>
        <FlatList
          data={popularRecipesMock}
          horizontal
          keyExtractor={item => item.id}
          renderItem={renderPopularItem}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.popularList}
        />

        {/* Sección “Todas las recetas” con RefreshControl y searchQuery */}
        <Text style={styles.sectionTitle}>TODAS LAS RECETAS</Text>
        <FlatList
          data={filteredRecipes}
          keyExtractor={item => item.id}
          renderItem={renderAllItem}
          numColumns={2}
          columnWrapperStyle={styles.allColumnWrapper}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.allList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

const { width } = Dimensions.get('window');
const POP_CARD_WIDTH = (width - 32 - 12 * 2) / 3;
const ALL_CARD_WIDTH = (width - 32 - 8) / 2;

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
  },
  popularImage: { width: '100%', height: '100%' },

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
  recipeTitle: {
    fontFamily: 'sans-serif-medium',
    fontSize: 14,
    marginBottom: 4,
  },
  recipeDesc: { fontSize: 12, color: '#333', lineHeight: 16 },

  favoriteButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(255,187,47,0.4)',
    borderRadius: 12,
    padding: 4,
  },
});
