// src/screens/favorite/FavoriteScreen.tsx
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

const sampleImage: ImageSourcePropType = require('../../../assets/milanesacpure.png');

type Recipe = {
  id: string;
  title: string;
  description: string;
  image: ImageSourcePropType;
  rating: number;
  isFavorite: boolean;
};

const allRecipesMock: Recipe[] = [
  { id: '1', title: 'Guiso de Lentejas',  description: 'Un reconfortante guiso de lentejas…', image: sampleImage, rating: 4.5, isFavorite: false },
  { id: '2', title: 'Sopa de Calabaza',    description: 'Sopa cremosa de calabaza…',             image: sampleImage, rating: 4.2, isFavorite: true  },
  { id: '3', title: 'Pastel de Papa',      description: 'Capas de papa y queso al horno…',      image: sampleImage, rating: 4.8, isFavorite: false },
  { id: '4', title: 'Albóndigas en Salsa', description: 'Albóndigas en salsa de tomate…',        image: sampleImage, rating: 4.7, isFavorite: true  },
];

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;

export const FavoriteScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  // refrescar (simulado)
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // aquí iría tu fetch real...
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  // solo favoritos
  const favoriteRecipes = allRecipesMock.filter(r => r.isFavorite);

  // luego filtro por búsqueda
  const filtered = favoriteRecipes.filter(r =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }: { item: Recipe }) => (
    <View style={styles.recipeCard}>
      <Image source={item.image} style={styles.recipeImage} />



      <View style={styles.recipeInfo}>
        <Text style={styles.recipeTitle}>{item.title}</Text>
        <Text style={styles.recipeDesc} numberOfLines={3}>
          {item.description}
        </Text>
      </View>

      <Pressable style={styles.favoriteButton}>
        <IonIcon name="heart" size={20} color="#fff" />
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
        {/* ── Search + Filter ── */}
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

        <Text style={styles.sectionTitle}>RECETAS FAVORITAS</Text>

        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {favoriteRecipes.length === 0
                ? 'Aún no tienes recetas favoritas.'
                : 'No encontramos coincidencias.'}
            </Text>
          }
        />
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

  // Tarjeta de receta
  recipeCard: {
    width: CARD_WIDTH,
    backgroundColor: '#FFF9E6',
    borderRadius: 7,
    overflow: 'hidden',
    position: 'relative',
  },
  recipeImage: { width: '100%', height: CARD_WIDTH * 0.3 },
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
  //ratingText: { marginLeft: 2, color: '#fff', fontSize: 10 },
  recipeInfo: { padding: 8 },
  recipeTitle: { fontSize: 14, marginBottom: 4 },
  recipeDesc: { fontSize: 12, color: '#333', lineHeight: 16 },
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
});
