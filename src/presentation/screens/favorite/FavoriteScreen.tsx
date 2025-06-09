// src/screens/favorite/FavoriteScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  FlatList,
  Text,
  Dimensions,
  Pressable,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { Searchbar } from 'react-native-paper';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { IonIcon } from '../../components/shared/IonIcon';
import { globalColors } from '../../theme/theme';

// Muestra la misma imagen de milanesa que en HomeScreen
const sampleImage: ImageSourcePropType = require('../../../assets/milanesacpure.png');

type Recipe = {
  id: string;
  title: string;
  description: string;
  image: ImageSourcePropType;
  rating: number;
  isFavorite: boolean;
};

// Mock de todas las recetas; luego las filtramos para quedarnos solo con las favoritas
const allRecipesMock: Recipe[] = [
  { id: '1', title: 'Guiso de Lentejas',   description: 'Un reconfortante guiso…', image: sampleImage, rating: 4.5, isFavorite: false },
  { id: '2', title: 'Sopa de Calabaza',     description: 'Sopa cremosa de calabaza…', image: sampleImage, rating: 4.2, isFavorite: true  },
  { id: '3', title: 'Pastel de Papa',       description: 'Capas de papa, carne y queso…', image: sampleImage, rating: 4.8, isFavorite: false },
  { id: '4', title: 'Albóndigas en Salsa',  description: 'Albóndigas en salsa de tomate…', image: sampleImage, rating: 4.7, isFavorite: true  },
];

const { width } = Dimensions.get('window');
// Ancho total - 16px padding * 2
const CARD_WIDTH = width - 32;

export const FavoriteScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');

  // Configuro el header igual que en HomeScreen
  useEffect(() => {
    navigation.setOptions({
      headerStyle:      { backgroundColor: 'transparent', elevation: 0, shadowOpacity: 0 },
      headerTitle:      '',
      headerTintColor:  globalColors.primary,
      headerLeft: () => (
        <Pressable
          onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
          style={{ marginLeft: 5, marginRight: 10 }}
        >
          <IonIcon name="menu-outline" color="#E9A300" />
        </Pressable>
      ),
    });
  }, [navigation]);

  // Filtra solo los favoritos
  const favoriteRecipes = allRecipesMock.filter(r => r.isFavorite);

  // Render de cada tarjeta
  const renderItem = ({ item }: { item: Recipe }) => (
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
        <IonIcon name="heart" size={20} color="#fcf75e" />
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
        {/* ─── Search + Filter (idéntico a Home) ─── */}
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

        {/* ─── FlatList de 1 por fila ─── */}
        <FlatList
          key="favorites-list"
          data={favoriteRecipes}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },

  /* Barra de búsqueda + botón de filtros */
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
  searchbarInput: {
    fontSize: 16,
  },
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

  /* Tarjeta de receta */
  recipeCard: {
    width: CARD_WIDTH,
    backgroundColor: '#FFF9E6',
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  recipeImage: {
    width: '100%',
    height: CARD_WIDTH * 0.4,
  },
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
  ratingText: {
    marginLeft: 2,
    color: '#fff',
    fontSize: 10,
  },
  recipeInfo: {
    padding: 8,
  },
  recipeTitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  recipeDesc: {
    fontSize: 12,
    color: '#333',
    lineHeight: 16,
  },
  favoriteButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 12,
    padding: 4,
  },
});
