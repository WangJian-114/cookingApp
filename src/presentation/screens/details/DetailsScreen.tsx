// src/presentation/screens/details/DetailsScreen.tsx

import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert, Pressable, ImageSourcePropType } from 'react-native'; // Se añade ImageSourcePropType
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import LinearGradient from 'react-native-linear-gradient';

import { ServingsSelector } from '../../components/shared/details/ServingsSelector';
import { RatingModal } from '../../components/shared/details/RatingModal';
import { CommentsSheet } from '../../components/shared/details/CommentsSheet';

const popularImage: ImageSourcePropType = require('../../../assets/milanesacpure.png');
const mockRecipe = {
  id: '1',
  title: 'Locro Cremoso Tradicional',
  image: popularImage,
  description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
  baseServings: 4,
  likes: 300,
  ingredients: [
    { name: 'Maíz blanco partido', quantity: 500, unit: 'g' },
    { name: 'Porotos (alubias)', quantity: 250, unit: 'g' },
    { name: 'Zapallo criollo o plomo', quantity: 1, unit: 'kg (aprox)' },
    { name: 'Carne de cerdo', quantity: 500, unit: 'g' },
    { name: 'Chorizo colorado', quantity: 2, unit: 'un.' },
    { name: 'Panceta salada o ahumada', quantity: 200, unit: 'g' },
    { name: 'Falda o roast beef de vaca', quantity: 500, unit: 'g' },
    { name: 'Cuerito de cerdo', quantity: 100, unit: 'g (opcional)' },
  ],
  comments: [
      { id: 'c1', user: 'juan2023', text: '¡Excelente receta! Me salió igualita.' },
      { id: 'c2', user: 'cocinera_pro', text: 'Un consejo: remojar el maíz la noche anterior hace toda la diferencia.' },
  ],
  rating: {
      average: 4.5,
      count: 230,
      distribution: { '5': 173, '4': 22, '3': 13, '2': 6, '1': 16 },
    }
};

const TEXT_COLOR = '#44403C';
const CONTENT_BG_COLOR = '#FEFBF6';
const PRIMARY_YELLOW = '#E9A300';

export const DetailsScreen = () => {
  const navigation = useNavigation();
  const [recipe] = useState(mockRecipe);
  const [servings, setServings] = useState(1);
  const [isLiked, setIsLiked] = useState(false);

  const [isServingsVisible, setServingsVisible] = useState(false);
  const [isRatingVisible, setRatingVisible] = useState(false);
  const commentsSheetRef = useRef<BottomSheetModal>(null);

  const handleOpenComments = () => commentsSheetRef.current?.present();

  const getAdjustedIngredient = (ingredient) => {
    const factor = servings / recipe.baseServings;
    const newQuantity = ingredient.quantity * factor;
    return `${Math.round(newQuantity * 100) / 100} ${ingredient.unit}`;
  };

  return (
    <LinearGradient colors={[PRIMARY_YELLOW, PRIMARY_YELLOW]} style={{ flex: 1 }}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Icon name="arrow-back-outline" size={28} color={TEXT_COLOR} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle</Text>
        <TouchableOpacity onPress={() => setIsLiked(!isLiked)} style={styles.headerButton}>
          <Icon name={isLiked ? "heart" : "heart-outline"} size={28} color={isLiked ? 'red' : TEXT_COLOR} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <Image source={recipe.image} style={styles.image} />

        <LinearGradient
          colors={[PRIMARY_YELLOW, CONTENT_BG_COLOR, CONTENT_BG_COLOR]}
          locations={[0, 0.35, 1]}
          style={styles.contentWrapper}
        >
          <View style={styles.infoBarContainer}>
            <TouchableOpacity style={styles.infoBarItem} onPress={() => setRatingVisible(true)}>
              <Icon name="star" color="#FFC700" size={18} />
              <Text style={styles.infoBarText}>{recipe.rating.average.toFixed(1)} ({recipe.rating.count})</Text>
            </TouchableOpacity>
            <View style={styles.infoBarItem}>
              <Icon name="heart" color="red" size={18} />
              <Text style={styles.infoBarText}>{recipe.likes}</Text>
            </View>
            <TouchableOpacity style={styles.infoBarItem} onPress={handleOpenComments}>
              <Icon name="chatbubble-ellipses-outline" color="#888" size={18} />
              <Text style={styles.infoBarText}>{recipe.comments.length}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>{recipe.title}</Text>

          <View style={styles.separator} />

          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.description}>{recipe.description}</Text>

          <Text style={styles.sectionTitle}>Ingredientes</Text>
          {recipe.ingredients.map((ingredient, index) => (
            <Text key={index} style={styles.ingredientText}>• {ingredient.name} - {getAdjustedIngredient(ingredient)}</Text>
          ))}

          <View style={styles.separator} />

          <Text style={styles.sectionTitle}>Ración</Text>
          <Pressable style={styles.servingSelector} onPress={() => setServingsVisible(true)}>
            <Text style={styles.servingText}>Cantidad: {servings}</Text>
            <Icon name="chevron-forward-outline" size={20} color="#888" />
          </Pressable>

          <TouchableOpacity style={styles.commentsButton} onPress={handleOpenComments}>
            <Text style={styles.commentsButtonText}>Comentarios ({recipe.comments.length})</Text>
          </TouchableOpacity>
        </LinearGradient>
      </ScrollView>

      {/* --- Modales y Hojas --- */}
      <ServingsSelector
        isVisible={isServingsVisible}
        onClose={() => setServingsVisible(false)}
        onSelect={setServings}
      />
      <RatingModal
          isVisible={isRatingVisible}
          onClose={() => setRatingVisible(false)}
          ratingData={recipe.rating}
          onSubmit={(userRating) => Alert.alert('¡Gracias!', `Has calificado con ${userRating} estrellas.`)}
      />
      <CommentsSheet
        ref={commentsSheetRef}
        comments={recipe.comments}
        onSubmit={(comment) => console.log(comment)}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 10,
    paddingHorizontal: 15,
  },
  headerTitle: { fontSize: 20, fontWeight: '600', color: TEXT_COLOR },
  headerButton: { padding: 5 },
  scrollContainer: { flex: 1 },
  image: {
    width: '90%',
    height: 250,
    borderRadius: 15,
    alignSelf: 'center',
    position: 'relative',
    zIndex: 2,
  },
  contentWrapper: {
    padding: 20,
    marginTop: -80,
    paddingTop: 100,
  },
  infoBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 15,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    marginHorizontal: 10,
    marginBottom: 20,
  },
  infoBarItem: { flexDirection: 'row', alignItems: 'center' },
  infoBarText: { marginLeft: 8, fontWeight: '500', color: TEXT_COLOR },
  title: { fontSize: 28, fontWeight: 'bold', color: TEXT_COLOR, marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: TEXT_COLOR, marginTop: 20, marginBottom: 10 },
  separator: {
    height: 3,
    backgroundColor: '#E9A300',
    width: '95%',
    alignSelf: 'center',
    marginVertical: 15,
    opacity: 1,
  },
  description: { fontSize: 15, lineHeight: 22, color: '#57534E' },
  ingredientText: { fontSize: 15, color: '#57534E', marginBottom: 5 },
  servingSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    borderRadius: 20,
    padding: 15,
    marginTop: 10,
    borderWidth: 2,
    borderColor: "#444444"
  },
  servingText: { fontSize: 16, color: TEXT_COLOR },
  commentsButton: {
    backgroundColor: PRIMARY_YELLOW,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
    shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
  },
  commentsButtonText: { color: TEXT_COLOR, fontWeight: 'bold', fontSize: 16 }
});