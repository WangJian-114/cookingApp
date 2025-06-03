// src/screens/TestScreen.tsx
import React, { useState } from 'react';
import { SafeAreaView, View, StyleSheet, FlatList, Text, Dimensions } from 'react-native';
import { TextInput, IconButton, Card, Title } from 'react-native-paper';

type Recipe = {
  id: string;
  title: string;
  imageUri: string;
  isFavorite: boolean;
};

// Datos de prueba para la lista horizontal
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

export default function TestScreen() {
  const [searchQuery, setSearchQuery] = useState<string>('');

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
          // Aquí iría la lógica para alternar favorito
        }}
      />
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. Barra de búsqueda + filtro */}
      <View style={styles.searchWrapper}>
        <TextInput
          mode="outlined"
          placeholder="Buscar receta..."
          value={searchQuery}
          onChangeText={text => setSearchQuery(text)}
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

      {/* 2. Sección “Recetas más populares” */}
      <Text style={styles.sectionTitle}>RECETAS MÁS POPULARES</Text>
      <FlatList
        data={popularRecipesMock}
        horizontal
        keyExtractor={item => item.id}
        renderItem={renderPopularItem}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.popularList}
      />

      {/* Placeholder para siguientes secciones */}
      <View style={styles.placeholderNext}>
        <Text>Aquí irá la lista vertical de “Más recetas”</Text>
      </View>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.4; // ej. 40% del ancho de pantalla

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  /* ------ Barra de búsqueda ------ */
  searchWrapper: {
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: '#FFF',
  },

  /* ------ Título sección ------ */
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 4,
    color: '#333',
  },

  /* ------ FlatList horizontal de populares ------ */
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
    height: CARD_WIDTH * 0.6, // proporción 60% alto vs width
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

  /* ------ Placeholder siguiente sección ------ */
  placeholderNext: {
    flex: 1,
    marginTop: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
