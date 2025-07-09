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
import LinearGradient from 'react-native-linear-gradient';

import { ServingsSelector } from '../../components/shared/details/ServingsSelector';
import { RatingModal }    from '../../components/shared/details/RatingModal';
import { CommentsSheet }  from '../../components/shared/details/CommentsSheet';
import api from '../../../services/api';

// Parámetros de navegación
type RootStackParamList = {
  DetailsScreen: { recipeId: string };
};

// Estructura de la receta que trae el backend
interface RecipeDetails {
  _id: string;
  titulo: string;
  descripcion: string;
  instrucciones: string;
  tiempo_preparacion?: number;
  dificultad?: 'Fácil' | 'Media' | 'Difícil';
  fecha_creacion: string;
  imagen?: string;
  autor_id: string;
  porciones?: number;
  ingredientes: Array<{
    nombre: string;
    cantidad: number;
    unidad: string;
  }>;
  valoraciones?: Array<{ rating: number }>;
  likes?: number;
  // Notar: aquí no incluimos comments; los manejamos en un estado separado
}

export const DetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'DetailsScreen'>>();
  const { recipeId } = route.params;

  const [recipe, setRecipe] = useState<RecipeDetails | null>(null);
  const [comments, setComments] = useState<Array<{ id: string; user: string; text: string }>>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const [servings, setServings]           = useState(1);
  const [isLiked, setIsLiked]             = useState(false);
  const [isServingsVisible, setServingsVisible] = useState(false);
  const [isRatingVisible, setRatingVisible]     = useState(false);

  const commentsSheetRef = useRef<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1) Obtener detalle de la receta
        const recRes = await api.get(`/receta/getRecetaById/${recipeId}`);
        const data = recRes.data;

        // 2) Calcular rating localmente si lo necesitas
        let avg = 0, cnt = 0;
        if (Array.isArray(data.valoraciones) && data.valoraciones.length > 0) {
          cnt = data.valoraciones.length;
          avg = data.valoraciones.reduce((sum: number, v: any) => sum + v.rating, 0) / cnt;
        }

        // 3) Traer comentarios del backend
        const comRes = await api.get(`/comentarios/${recipeId}/comments`);
        const mapped = comRes.data.comments.map((c: any) => ({
          id:   c.id,
          user: c.usuario,
          text: c.texto,
          avatar: c.profile_picture
        }));

        // 4) Actualizar estados
        setRecipe({
          ...data,
          valoraciones: [{ rating: avg }],
          likes: data.likes
        });
        setComments(mapped);
        setServings(data.porciones || 1);
      } catch (e: any) {
        console.error('Error fetching details or comments:', e);
        const msg = e.response?.data?.msg || e.message || 'Error al cargar la receta.';
        setError(msg);
        Alert.alert('Error', msg);
      } finally {
        setLoading(false);
      }
    };

    if (recipeId) {
      fetchData();
    } else {
      setError('ID de receta no proporcionado.');
      setLoading(false);
    }
  }, [recipeId]);

  const handleOpenComments = () => {
    commentsSheetRef.current?.present();
  };

  if (loading) {
    return (
      <LinearGradient colors={[PRIMARY_YELLOW, PRIMARY_YELLOW]} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={TEXT_COLOR} />
        <Text style={styles.loadingText}>Cargando receta...</Text>
      </LinearGradient>
    );
  }

  if (error || !recipe) {
    return (
      <LinearGradient colors={[PRIMARY_YELLOW, PRIMARY_YELLOW]} style={styles.loadingContainer}>
        <Text style={styles.errorText}>Error: {error || 'Receta no encontrada.'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.retryButtonText}>Volver</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[PRIMARY_YELLOW, PRIMARY_YELLOW]} style={{ flex: 1 }}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Icon name="arrow-back-outline" size={28} color={TEXT_COLOR} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle</Text>
        <TouchableOpacity onPress={() => setIsLiked(!isLiked)} style={styles.headerButton}>
          <Icon name={isLiked ? 'heart' : 'heart-outline'} size={28} color={isLiked ? 'red' : TEXT_COLOR} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <Image
          source={recipe.imagen ? { uri: recipe.imagen } : placeholderImage}
          style={styles.image}
        />

        <LinearGradient
          colors={[PRIMARY_YELLOW, CONTENT_BG_COLOR, CONTENT_BG_COLOR]}
          locations={[0, 0.35, 1]}
          style={styles.contentWrapper}
        >
          {/* Info Bar */}
          <View style={styles.infoBarContainer}>
            <TouchableOpacity style={styles.infoBarItem} onPress={() => setRatingVisible(true)}>
              <Icon name="star" color="#FFC700" size={18} />
              <Text style={styles.infoBarText}>
                {recipe.valoraciones?.[0].rating.toFixed(1)} ({recipe.valoraciones?.length || 0})
              </Text>
            </TouchableOpacity>

            <View style={styles.infoBarItem}>
              <Icon name="heart" color="red" size={18} />
              <Text style={styles.infoBarText}>{recipe.likes || 0}</Text>
            </View>

            <TouchableOpacity style={styles.infoBarItem} onPress={handleOpenComments}>
              <Icon name="chatbubble-ellipses-outline" color="#888" size={18} />
              <Text style={styles.infoBarText}>{comments.length}</Text>
            </TouchableOpacity>
          </View>

          {/* Título */}
          <Text style={styles.title}>{recipe.titulo}</Text>
          <View style={styles.separator} />

          {/* Descripción */}
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.description}>{recipe.descripcion}</Text>

          {/* Instrucciones */}
          <Text style={styles.sectionTitle}>Instrucciones</Text>
          <Text style={styles.description}>
            {recipe.instrucciones || 'No hay instrucciones disponibles.'}
          </Text>

          {/* Ingredientes */}
          <Text style={styles.sectionTitle}>Ingredientes</Text>
          {recipe.ingredientes.map((ing, i) => (
            <Text key={i} style={styles.ingredientText}>
              • {ing.nombre} - {Math.round((ing.cantidad * (servings / (recipe.porciones || 1))) * 100) / 100} {ing.unidad}
            </Text>
          ))}

          <View style={styles.separator} />

          {/* Servings */}
          <Text style={styles.sectionTitle}>Ración</Text>
          <Pressable style={styles.servingSelector} onPress={() => setServingsVisible(true)}>
            <Text style={styles.servingText}>Cantidad: {servings}</Text>
            <Icon name="chevron-forward-outline" size={20} color="#888" />
          </Pressable>

          <TouchableOpacity style={styles.commentsButton} onPress={handleOpenComments}>
            <Text style={styles.commentsButtonText}>Comentarios ({comments.length})</Text>
          </TouchableOpacity>
        </LinearGradient>
      </ScrollView>

      {/* Modales y Sheets */}
      <ServingsSelector
        isVisible={isServingsVisible}
        onClose={() => setServingsVisible(false)}
        onSelect={setServings}
        baseServings={recipe.porciones || 1}
      />

      <RatingModal
        isVisible={isRatingVisible}
        onClose={() => setRatingVisible(false)}
        ratingData={{
          average: recipe.valoraciones?.[0].rating || 0,
          count: recipe.valoraciones?.length || 0,
          distribution: {}
        }}
        onSubmit={(userRating) => Alert.alert('¡Gracias!', `Has calificado con ${userRating} estrellas.`)}
      />

      <CommentsSheet
        ref={commentsSheetRef}
        comments={comments}
        onSubmit={async (texto) => {
          try {
            await api.post(`/comentarios/${recipeId}/comment`, { texto });
            // refrescar comentarios
            const res = await api.get(`/comentarios/${recipeId}/comments`);
            setComments(res.data.comments.map((c: any) => ({
              id:   c.id,
              user: c.usuario,
              text: c.texto
            })));
            commentsSheetRef.current?.dismiss();
          } catch (e: any) {
            Alert.alert('Error', e.response?.data?.msg || e.message);
          }
        }}
      />
    </LinearGradient>
  );
};

// Colores y placeholder
const TEXT_COLOR = '#44403C';
const CONTENT_BG_COLOR = '#FEFBF6';
const PRIMARY_YELLOW = '#E9A300';
const placeholderImage = require('../../../assets/milanesacpure.png');

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 10,
    paddingHorizontal: 15
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
    zIndex: 2
  },
  contentWrapper: {
    padding: 20,
    marginTop: -80,
    paddingTop: 100
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
    marginBottom: 20
  },
  infoBarItem: { flexDirection: 'row', alignItems: 'center' },
  infoBarText: { marginLeft: 8, fontWeight: '500', color: TEXT_COLOR },
  title: { fontSize: 28, fontWeight: 'bold', color: TEXT_COLOR, marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: TEXT_COLOR, marginTop: 20, marginBottom: 10 },
  separator: {
    height: 3,
    backgroundColor: PRIMARY_YELLOW,
    width: '95%',
    alignSelf: 'center',
    marginVertical: 15
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
    borderColor: '#444444'
  },
  servingText: { fontSize: 16, color: TEXT_COLOR },
  commentsButton: {
    backgroundColor: PRIMARY_YELLOW,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
    elevation: 3
  },
  commentsButtonText: { color: TEXT_COLOR, fontWeight: 'bold', fontSize: 16 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: TEXT_COLOR
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginBottom: 20
  },
  retryButton: {
    backgroundColor: '#FFD740',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginTop: 20
  },
  retryButtonText: {
    color: TEXT_COLOR,
    fontSize: 16,
    fontWeight: '500'
  }
});
