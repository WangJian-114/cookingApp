// src/presentation/screens/home/HomeScreen.tsx

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
import api from '../../../services/api';

const placeholderImage: ImageSourcePropType = require('../../../assets/milanesacpure.png');

type PopularRecipe = {
  id: string;
  image: ImageSourcePropType;
};

type Recipe = {
  id: string;
  title: string;
  description: string;
  image: ImageSourcePropType;
  rating: number;
  isFavorite: boolean;
};

export const HomeScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [popularRecipes, setPopularRecipes] = useState<PopularRecipe[]>([]);
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);

  // Traer 5 recetas “populares” aleatorias
  const fetchPopular = async () => {
    try {
      const res = await api.get('/receta/populares');
      const raw = res.data as Array<{ _id: string; imagen?: string | null }>;
      setPopularRecipes(
        raw.map(r => ({
          id: r._id,
          image: r.imagen ? { uri: r.imagen } : placeholderImage,
        }))
      );
    } catch (e) {
      console.warn('❌ Error al cargar populares:', e);
    }
  };

  // Traer todas las recetas
  const fetchAll = async () => {
    try {
      const res = await api.get('/receta/Allrecetas');
      const raw = res.data as Array<{
        _id: string;
        titulo: string;
        descripcion: string;
        imagen?: string | null;
        valoraciones?: Array<{ puntuacion: number }>;
      }>;
      setAllRecipes(
        raw.map(r => {
          const vals = r.valoraciones ?? [];
          const avg = vals.length
            ? vals.reduce((sum, v) => sum + v.puntuacion, 0) / vals.length
            : 0;
          return {
            id: r._id,
            title: r.titulo,
            description: r.descripcion,
            image: r.imagen ? { uri: r.imagen } : placeholderImage,
            rating: avg,
            isFavorite: false,
          };
        })
      );
    } catch (e) {
      console.warn('❌ Error al cargar recetas:', e);
    }
  };

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
    fetchPopular();
    fetchAll();
  }, [navigation]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchPopular(), fetchAll()]);
    setRefreshing(false);
  }, []);

  const navigateToDetails = (recipeId: string) => {
    navigation.navigate('DetailsScreen' as never, { recipeId } as never);
  };

  // Alterna el estado "isFavorite" de la receta indicada
  const toggleFavorite = (id: string) => {
    setAllRecipes(prev =>
      prev.map(r =>
        r.id === id ? { ...r, isFavorite: !r.isFavorite } : r
      )
    );
  };

  const filteredRecipes = allRecipes.filter(r =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderPopularItem = ({ item }: { item: PopularRecipe }) => (
    <Pressable style={styles.popularCard} onPress={() => navigateToDetails(item.id)}>
      <Image source={item.image} style={styles.popularImage} />
    </Pressable>
  );

  const renderAllItem = ({ item }: { item: Recipe }) => (
    <Pressable style={styles.recipeCard} onPress={() => navigateToDetails(item.id)}>
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
      <Pressable
        style={styles.favoriteButton}
        onPress={() => toggleFavorite(item.id)}
      >
        <IonIcon
          name={item.isFavorite ? 'heart' : 'heart-outline'}
          size={20}
          color="#fff"
        />
      </Pressable>
    </Pressable>
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

        <Text style={styles.sectionTitle}>RECETAS MÁS POPULARES</Text>
        <FlatList
          data={popularRecipes}
          horizontal
          keyExtractor={item => item.id}
          renderItem={renderPopularItem}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.popularList}
        />

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
});
