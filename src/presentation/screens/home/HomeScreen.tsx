// src/screens/home/HomeScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  FlatList,
  Text,
  Dimensions,
  Pressable,
  ImageSourcePropType,
} from 'react-native';
import { Searchbar, IconButton, Card, Title } from 'react-native-paper';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { IonIcon } from '../../components/shared/IonIcon';
import { globalColors } from '../../theme/theme';

// 1) Usa require para la imagen local
const popularImage: ImageSourcePropType = require('../../../assets/milanesacpure.png');

type Recipe = {
  id: string;
  title: string;
  image: ImageSourcePropType;
  isFavorite: boolean;
};

// 2) popularRecipesMock con ruta a imagen local mediante require
const popularRecipesMock: Recipe[] = [
  { id: '1', title: 'Tarta de Manzana', image: popularImage, isFavorite: false },
  { id: '2', title: 'Ensalada César', image: popularImage, isFavorite: true },
  { id: '3', title: 'Pan de Ajo', image: popularImage, isFavorite: false },
  { id: '4', title: 'Pizza Margarita', image: popularImage, isFavorite: true },
];

const allRecipesMock: Recipe[] = [
  { id: '10', title: 'Guiso de Lentejas', image: popularImage, isFavorite: false },
  { id: '11', title: 'Sopa de Calabaza', image: popularImage, isFavorite: true },
  { id: '12', title: 'Pastel de Papa', image: popularImage, isFavorite: false },
  { id: '13', title: 'Albóndigas en Salsa', image: popularImage, isFavorite: true },
];

export const HomeScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Configurar ícono de hamburguesa y header transparente
  useEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: 'transparent',
        elevation: 0,
        shadowOpacity: 0,
      },
      headerTitle: '',
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

  // renderPopularItem usa source={item.image}, no uri
  const renderPopularItem = ({ item }: { item: Recipe }) => (
    <Card style={styles.popularCardOnlyImage}>
      <Card.Cover source={item.image} style={styles.popularImageOnly} />
    </Card>
  );

  // Render vertical de todas las recetas (sin cambios en imagen)
  const renderAllItem = ({ item }: { item: Recipe }) => (
    <Card style={styles.allCard}>
      <View style={styles.allCardContent}>
        <Card.Cover source={item.image} style={styles.allImage} />
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
            // Lógica para alternar favorito
          }}
        />
      </View>
    </Card>
  );

  return (
    <LinearGradient
      colors={[
                'rgba(233, 163, 0, 0.9)',
                'rgba(251, 192, 45, 0.8)',
                'rgba(255, 255, 255, 0.6)',
              ]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
       style={[styles.gradientContainer]}
    >
      <SafeAreaView style={styles.container}>
        {/* 1. BARRA DE BÚSQUEDA + BOTÓN DE FILTROS */}
        <View style={styles.searchContainer}>
          <LinearGradient
            colors={['#E86900', '#FFD740']}           // gradiente horizontal naranja→amarillo
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.searchGradient}
          >
            <Searchbar
              placeholder="Buscar receta"
              onChangeText={(text) => setSearchQuery(text)}
              value={searchQuery}
              style={styles.searchbar}
              inputStyle={styles.searchbarInput}
              iconColor="#333"
              placeholderTextColor="#555"
            />
          </LinearGradient>
          <Pressable
            style={styles.filterButton}
            onPress={() => {
              // Abrir modal o pantalla de filtros
            }}
          >
            <IonIcon name="filter-outline" size={24} color="#333" />
          </Pressable>
        </View>

        {/* 2. SECCIÓN “RECETAS MÁS POPULARES” (solo imágenes) */}
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
    </LinearGradient>
  );
};

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.3;

const styles = StyleSheet.create({
  // Contenedor del degradado ocupa toda la pantalla
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 0, // Márgenes laterales en cada sección
  },

  /* ---- Contenedor de búsqueda y filtro ---- */
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  searchGradient: {
    flex: 1,
    borderRadius: 20,
    opacity: 0.5,
  },
  searchbar: {
    backgroundColor: 'transparent',
    borderRadius: 20,
    elevation: 0,
  },
  searchbarInput: {
    fontSize: 16,
    color: '#212121',
  },
  filterButton: {
    marginLeft: 8,
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#E9A300',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },

  /* ---- Título de sección ---- */
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 12,
    color: '#333',
    paddingHorizontal: 16,
  },

  /* ---- FlatList horizontal de populares (solo imagen) ---- */
  popularList: {
    paddingLeft: 16,
    paddingVertical: 8,
  },
  popularCardOnlyImage: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 0.6,
    marginRight: 12,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    elevation: 0,
  },
  popularImageOnly: {
    width: '100%',
    height: '100%',
  },

  /* ---- FlatList vertical de todas las recetas ---- */
  allList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  allCard: {
    marginBottom: 12,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#FFF9E6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
