// src/presentation/screens/details/DetailsScreen.tsx

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  Pressable,
  ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import LinearGradient from 'react-native-linear-gradient';

import { ServingsSelector } from '../../components/shared/details/ServingsSelector';
import { RatingModal } from '../../components/shared/details/RatingModal';
import { CommentsSheet } from '../../components/shared/details/CommentsSheet';
import api from '../../../services/api';

// Define la interfaz para los parámetros de ruta
type RootStackParamList = {
  DetailsScreen: { recipeId: string };
  // Agrega otras rutas si es necesario
};

// Define la interfaz para la estructura de la receta que esperamos del backend
interface RecipeDetails {
  _id: string; // El ID de la receta
  titulo: string;
  descripcion: string;
  instrucciones: string;
  tiempo_preparacion?: number;
  dificultad?: 'Fácil' | 'Media' | 'Difícil';
  fecha_creacion: string;
  imagen?: string; // URL de la imagen
  autor_id: string; // O una interfaz más detallada si se popula
  porciones?: number;
  ingredientes: Array<{
    nombre: string;
    cantidad: number;
    unidad: string;
  }>;
  valoraciones?: Array<{
    _id: string; // ID de la valoración
    rating: number; // El valor de la calificación
    // Otros campos de valoración si los necesitas
  }>;
  likes?: number; // Asumo que el backend puede devolver esto, si no, se calculará en el frontend
  comments?: Array<{ // Asumo que el backend puede devolver esto, si no, se manejará de otra forma
    id: string;
    user: string;
    text: string;
  }>;
}

const TEXT_COLOR = '#44403C';
const CONTENT_BG_COLOR = '#FEFBF6';
const PRIMARY_YELLOW = '#E9A300';
const placeholderImage = require('../../../assets/milanesacpure.png'); // Imagen de fallback

export const DetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'DetailsScreen'>>(); // Hook para acceder a los parámetros de la ruta
  const { recipeId } = route.params; // Obtenemos el recipeId de los parámetros

  const [recipe, setRecipe] = useState<RecipeDetails | null>(null); // Estado para la receta real
  const [loading, setLoading] = useState(true); // Estado de carga
  const [error, setError] = useState<string | null>(null); // Estado de error

  const [servings, setServings] = useState(1);
  const [isLiked, setIsLiked] = useState(false); // Esto necesitará lógica de backend para persistir

  const [isServingsVisible, setServingsVisible] = useState(false);
  const [isRatingVisible, setRatingVisible] = useState(false);
  const commentsSheetRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    const fetchRecipeDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        // --- CAMBIO CLAVE AQUÍ: 'receta' en lugar de 'recetas' ---
        const response = await api.get(`/receta/getRecetaById/${recipeId}`);

        console.log('Datos recibidos de la receta:', response.data);

        let averageRating = 0;
        let ratingCount = 0;
        if (response.data.valoraciones && response.data.valoraciones.length > 0) {
          const totalRating = response.data.valoraciones.reduce((sum: number, val: { rating: number }) => sum + val.rating, 0);
          averageRating = totalRating / response.data.valoraciones.length;
          ratingCount = response.data.valoraciones.length;
        }

        setRecipe({
          ...response.data,
          rating: {
            average: averageRating,
            count: ratingCount,
            distribution: {}
          }
        });
        setServings(response.data.porciones || 1);
      } catch (err: any) {
        console.error('Error fetching recipe details:', err);
        const errorMessage = err.response?.data?.message || err.message || 'Error al cargar los detalles de la receta.';
        setError(errorMessage);
        Alert.alert('Error', errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (recipeId) {
      fetchRecipeDetails();
    } else {
      setError('ID de receta no proporcionado.');
      setLoading(false);
    }
  }, [recipeId]);

  const handleOpenComments = () => commentsSheetRef.current?.present();

  const getAdjustedIngredient = (ingredient: { nombre: string; cantidad: number; unit: string }) => {
    if (!recipe || !recipe.porciones) return `${ingredient.cantidad} ${ingredient.unit}`;
    const factor = servings / recipe.porciones;
    const newQuantity = ingredient.cantidad * factor;
    return `${Math.round(newQuantity * 100) / 100} ${ingredient.unit}`;
  };

  if (loading) {
    return (
      <LinearGradient colors={[PRIMARY_YELLOW, PRIMARY_YELLOW]} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={TEXT_COLOR} />
        <Text style={styles.loadingText}>Cargando receta...</Text>
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient colors={[PRIMARY_YELLOW, PRIMARY_YELLOW]} style={styles.loadingContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.retryButtonText}>Volver</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  if (!recipe) {
    return (
      <LinearGradient colors={[PRIMARY_YELLOW, PRIMARY_YELLOW]} style={styles.loadingContainer}>
        <Text style={styles.errorText}>No se encontró la receta.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.retryButtonText}>Volver</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

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
        <Image source={recipe.imagen ? { uri: recipe.imagen } : placeholderImage} style={styles.image} />

        <LinearGradient
          colors={[PRIMARY_YELLOW, CONTENT_BG_COLOR, CONTENT_BG_COLOR]}
          locations={[0, 0.35, 1]}
          style={styles.contentWrapper}
        >
          <View style={styles.infoBarContainer}>
            <TouchableOpacity style={styles.infoBarItem} onPress={() => setRatingVisible(true)}>
              <Icon name="star" color="#FFC700" size={18} />
              <Text style={styles.infoBarText}>
                {recipe.rating.average.toFixed(1)} ({recipe.rating.count})
              </Text>
            </TouchableOpacity>
            <View style={styles.infoBarItem}>
              <Icon name="heart" color="red" size={18} />
              <Text style={styles.infoBarText}>{recipe.likes}</Text>
            </View>
            <TouchableOpacity style={styles.infoBarItem} onPress={handleOpenComments}>
              <Icon name="chatbubble-ellipses-outline" color="#888" size={18} />
              <Text style={styles.infoBarText}>{recipe.comments?.length || 0}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>{recipe.titulo}</Text>

          <View style={styles.separator} />

          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.description}>{recipe.descripcion}</Text>

          <Text style={styles.sectionTitle}>Instrucciones</Text>
          <Text style={styles.description}>{recipe.instrucciones || 'No hay instrucciones disponibles.'}</Text>

          <Text style={styles.sectionTitle}>Ingredientes</Text>
          {recipe.ingredientes.map((ingredient, index) => (
            <Text key={index} style={styles.ingredientText}>• {ingredient.nombre} - {getAdjustedIngredient(ingredient)}</Text>
          ))}

          <View style={styles.separator} />

          <Text style={styles.sectionTitle}>Ración</Text>
          <Pressable style={styles.servingSelector} onPress={() => setServingsVisible(true)}>
            <Text style={styles.servingText}>Cantidad: {servings}</Text>
            <Icon name="chevron-forward-outline" size={20} color="#888" />
          </Pressable>

          <TouchableOpacity style={styles.commentsButton} onPress={handleOpenComments}>
            <Text style={styles.commentsButtonText}>Comentarios ({recipe.comments?.length || 0})</Text>
          </TouchableOpacity>
        </LinearGradient>
      </ScrollView>

      {/* --- Modales y Hojas --- */}
      <ServingsSelector
        isVisible={isServingsVisible}
        onClose={() => setServingsVisible(false)}
        onSelect={setServings}
        baseServings={recipe.porciones || 1}
      />
      <RatingModal
          isVisible={isRatingVisible}
          onClose={() => setRatingVisible(false)}
          ratingData={recipe.rating}
          onSubmit={(userRating) => Alert.alert('¡Gracias!', `Has calificado con ${userRating} estrellas.`)}
      />
      <CommentsSheet
        ref={commentsSheetRef}
        comments={recipe.comments || []}
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
  commentsButtonText: { color: TEXT_COLOR, fontWeight: 'bold', fontSize: 16 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: TEXT_COLOR,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#FFD740',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginTop: 20,
  },
  retryButtonText: {
    color: TEXT_COLOR,
    fontSize: 16,
    fontWeight: '500',
  },
});
