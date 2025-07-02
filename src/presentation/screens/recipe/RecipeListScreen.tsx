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
  ImageSourcePropType,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Searchbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import LinearGradient from 'react-native-linear-gradient';
import { IonIcon } from '../../components/shared/IonIcon';
import { Header } from '../../components/shared/header/Header';

import { RecipesStackParamList } from '../../navigation/RecipesStackNavigator';
import api from '../../../services/api'

const sampleImage: ImageSourcePropType = require('../../../assets/milanesacpure.png');

type Ingredient = {
  nombre: string;
  cantidad: number;
  unidad: string;
};

type Author = {
  _id: string;
  name: string;
  email: string;
};

type Recipe = {
  _id: string;
  titulo: string;
  descripcion?: string;
  instrucciones?: string;
  tiempo_preparacion?: number;
  dificultad?: 'Fácil' | 'Media' | 'Difícil';
  fecha_creacion?: string; // Mongo devuelve date ISO
  imagen?: string;
  autor_id: Author;
  porciones?: number;
  ingredientes?: Ingredient[];
  valoraciones?: string[]; // Si solo tenemos los IDs
};


type RecipesListScreenNavigationProp = StackNavigationProp<
  RecipesStackParamList,
  'RecipesList'
>;

const { width } = Dimensions.get('window');

export const RecipesListScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const [recipes, setRecipes] = useState<Recipe[]>([]);

  console.log(recipes)

    useEffect(() => {
      navigation.setOptions({ headerShown: false });
      fetchRecipes();
    }, [navigation, fetchRecipes]);

    const fetchRecipes = useCallback(async () => {
      try {
        const response = await api.get('/receta/misRecetas');
        setRecipes(response.data);
      } catch (error) {
        console.error('Error fetching recipes:', error);
      }
    }, []);

    const onRefresh = useCallback(async () => {
      setRefreshing(true);
      try {
        await fetchRecipes();
      } finally {
        setRefreshing(false);
      }
    }, [fetchRecipes]); //Actualizar cada que se añada un nuevo receta

  const navigateToDetails = (recipeId: string) => {
    navigation.navigate('DetailsScreen', { recipeId });
  };

  const filtered = recipes.filter(r =>
    r.titulo.toLowerCase().includes(searchQuery.toLowerCase()));

  const viewRecipeDetails = (recipeId: string) => {
    navigation.navigate('DetailsScreen', { recipeId });
  };


  const editRecipe = (recipeId: string) => {
    navigation.navigate('RecipeEdit', { recipeId: recipeId });
  };

const renderItem = ({ item }: { item: Recipe }) => (
  <Pressable style={styles.recipeCard} onPress={() => viewRecipeDetails(item._id)}>
    <Image
      source={
        item.imagen
          ? { uri: item.imagen }
          : require('../../../assets/milanesacpure.png') // fallback
      }
      style={styles.recipeImage}
    />

    <View style={styles.recipeContent}>
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeTitle}>{item.titulo}</Text>
        <Text style={styles.recipeDesc} numberOfLines={4}>
          {item.descripcion}
        </Text>
      </View>

      <Pressable
        style={styles.editButton}
        onPress={() => editRecipe(item._id)}
      >
        <IonIcon name="create-outline" size={20} color="#E9A300" />
      </Pressable>
    </View>
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
          <Pressable style={styles.filterButton}>
            <IonIcon name="options-outline" size={24} color="#333" />
          </Pressable>
        </View>

        {/* Recipes List */}
        <FlatList
          data={filtered}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No se encontraron recetas que coincidan con tu búsqueda.
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
  },
  editButton: {
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

  emptyText: {
    textAlign: 'center',
    marginTop: 32,
    color: '#666',
    fontSize: 16,
  },
});