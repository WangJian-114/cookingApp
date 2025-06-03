// src/screens/home/HomeScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  FlatList,
  Text,
  Dimensions,
} from 'react-native';
import { TextInput, IconButton, Card, Title } from 'react-native-paper';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { Pressable } from 'react-native';
import { IonIcon } from '../../components/shared/IonIcon';
import { globalColors } from '../../theme/theme';

type Recipe = {
  id: string;
  title: string;
  imageUri: string;
  isFavorite: boolean;
};

const popularRecipesMock: Recipe[] = [
  {
    id: '1',
    title: 'Tarta de Manzana',
    imageUri: 'https://via.placeholder.com/150',
    isFavorite: false,
  },
  {
    id: '2',
    title: 'Ensalada César',
    imageUri: 'https://via.placeholder.com/150',
    isFavorite: true,
  },
  {
    id: '3',
    title: 'Pan de Ajo',
    imageUri: 'https://via.placeholder.com/150',
    isFavorite: false,
  },
  {
    id: '4',
    title: 'Pizza Margarita',
    imageUri: 'https://via.placeholder.com/150',
    isFavorite: true,
  },
];

// Datos de prueba para la lista vertical
const allRecipesMock: Recipe[] = [
  {
    id: '10',
    title: 'Guiso de Lentejas',
    imageUri: 'https://via.placeholder.com/300x180',
    isFavorite: false,
  },
  {
    id: '11',
    title: 'Sopa de Calabaza',
    imageUri: 'https://via.placeholder.com/300x180',
    isFavorite: true,
  },
  {
    id: '12',
    title: 'Pastel de Papa',
    imageUri: 'https://via.placeholder.com/300x180',
    isFavorite: false,
  },
  {
    id: '13',
    title: 'Albóndigas en Salsa',
    imageUri: 'https://via.placeholder.com/300x180',
    isFavorite: true,
  },
  // … más datos de ejemplo
];

export const HomeScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Ícono de hamburguesa en el header
  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Pressable
          onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
          style={{ marginLeft: 5, marginRight: 10 }}
        >
          <IonIcon name="menu-outline" color={globalColors.primary} />
        </Pressable>
      ),
    });
  }, [navigation]);

  // Render horizontal (populares)
  const renderPopularItem = ({ item }: { item: Recipe }) => (
    <Card style={styles.popularCard}>
      <Card.Cover source={{ uri: item.imageUri }} style={styles.popularImage} />
      <Card.Content style={styles.popularContent}>
        <Title style={styles.popularTitle} numberOfLines={1}>
          {item.title}
        </Title>
      </Card.Content>
      <IconButton
        icon={item.isFavorite ? 'heart' : 'heart-outline'}
        size={20}
        style={styles.favoriteIcon}
        onPress={() => {
          // lógica para alternar favorito
        }}
      />
    </Card>
  );

  // Render vertical (todas las recetas)
  const renderAllItem = ({ item }: { item: Recipe }) => (
    <Card style={styles.allCard}>
      <View style={styles.allCardContent}>
        <Card.Cover source={{ uri: item.imageUri }} style={styles.allImage} />
        <View style={styles.allTextWrapper}>
          <Title style={styles.allTitle} numberOfLines={1}>
            {item.title}
          </Title>
        </View>
        <IconButton
          icon={item.isFavorite ? 'heart' : 'heart-outline'}
          size={20}
          style={styles.allFavoriteIcon}
          onPress={() => {
            // lógica para alternar favorito si hace falta
          }}
        />
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. BARRA DE BÚSQUEDA + ÍCONO DE FILTRO */}
      <View style={styles.searchWrapper}>
        <TextInput
          mode="outlined"
          placeholder="Buscar receta..."
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
          style={styles.searchInput}
          right={
            <TextInput.Icon
              name="filter-variant"
              onPress={() => {
                // Abrir modal o pantalla de filtros
              }}
            />
          }
        />
      </View>

      {/* 2. SECCIÓN “RECETAS MÁS POPULARES” */}
      <Text style={styles.sectionTitle}>RECETAS MÁS POPULARES</Text>
      <FlatList
        data={popularRecipesMock}
        horizontal
        keyExtractor={(item) => item.id}
        renderItem={renderPopularItem}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.popularList}
      />

      {/* 3. SECCIÓN “TODAS LAS RECETAS” */}
      <Text style={styles.sectionTitle}>TODAS LAS RECETAS</Text>
      <FlatList
        data={allRecipesMock}
        keyExtractor={(item) => item.id}
        renderItem={renderAllItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.allList}
      />
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.4; // 40% del ancho de pantalla

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  /* ---- Barra de búsqueda ---- */
  searchWrapper: {
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: '#FFF',
  },

  /* ---- Título de sección ---- */
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 12,
    color: '#333',
  },

  /* ---- FlatList horizontal de populares ---- */
  popularList: {
    paddingVertical: 8,
  },
  popularCard: {
    width: CARD_WIDTH,
    marginRight: 12,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#FFF',
    // sombra iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // elevación Android
    elevation: 3,
  },
  popularImage: {
    height: CARD_WIDTH * 0.6,
  },
  popularContent: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  popularTitle: {
    fontSize: 14,
  },
  favoriteIcon: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },

  /* ---- FlatList vertical de todas las recetas ---- */
  allList: {
    paddingBottom: 16,
  },
  allCard: {
    marginBottom: 12,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#FFF',
    // sombra iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // elevación Android
    elevation: 2,
  },
  allCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  allImage: {
    width: 80,
    height: 80,
  },
  allTextWrapper: {
    flex: 1,
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  allTitle: {
    fontSize: 15,
  },
  allFavoriteIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
});
