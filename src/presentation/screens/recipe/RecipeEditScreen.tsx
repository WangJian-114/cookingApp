// src/screens/recipes/RecipeEditScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Header } from '../../components/shared/header/Header';
import LinearGradient from 'react-native-linear-gradient';

type Recipe = {
  id: string;
  title: string;
  description: string;
  ingredients?: string[];
  category: string;
};

// Mock data - aquí normalmente harías fetch de la receta por ID
const getRecipeById = (id: string): Recipe | null => {
  const recipes = [
    {
      id: '1',
      title: 'Locro',
      description: 'Plato tradicional argentino perfecto para días fríos. Se prepara con maíz, zapallo, porotos y carne.',
      ingredients: ['1 kg de maíz pisado', '500g de zapallo', '200g de porotos', '300g de carne de cerdo'],
      category: 'Almuerzo'
    },
    {
      id: '2',
      title: 'Empanadas',
      description: 'Deliciosas empanadas caseras con relleno de carne cortada a cuchillo.',
      ingredients: ['500g de carne picada', '2 cebollas', '1 huevo duro', 'Aceitunas', 'Masa para empanadas'],
      category: 'Cena'
    },
    // Agrega más recetas mock según se necesite
  ];

  return recipes.find(recipe => recipe.id === id) || null;
};

export const RecipeEditScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { recipeId } = route.params as { recipeId: string };

  const [receta, setReceta] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [ingredientes, setIngredientes] = useState(['', '']);
  const [selectedTag, setSelectedTag] = useState('Desayuno');
  const [loading, setLoading] = useState(true);

  const tags = ['Desayuno', 'Almuerzo', 'Cena', 'Postres', 'Snacks', 'Bebidas', 'Ensaladas', 'Sopas'];

  useEffect(() => {
    // Cargar datos de la receta
    const loadRecipe = () => {
      const recipe = getRecipeById(recipeId);
      if (recipe) {
        setReceta(recipe.title);
        setDescripcion(recipe.description);
        setSelectedTag(recipe.category);

        // Si tiene ingredientes, los carga, sino mantiene los por defecto
        if (recipe.ingredients && recipe.ingredients.length > 0) {
          setIngredientes(recipe.ingredients);
        }
      } else {
        Alert.alert('Error', 'No se pudo cargar la receta');
        navigation.goBack();
      }
      setLoading(false);
    };

    loadRecipe();
  }, [recipeId, navigation]);

  const handleAddIngredient = () => {
    setIngredientes([...ingredientes, '']);
  };

  const handleIngredientChange = (text: string, index: number) => {
    const newIngredientes = [...ingredientes];
    newIngredientes[index] = text;
    setIngredientes(newIngredientes);
  };

  const handleRemoveIngredient = (index: number) => {
    if (ingredientes.length > 1) {
      const newIngredientes = ingredientes.filter((_, i) => i !== index);
      setIngredientes(newIngredientes);
    }
  };

  const handleAddImage = () => {
    Alert.alert('Agregar imagen', 'Funcionalidad para agregar imagen');
  };

  const handleCancel = () => {
    Alert.alert('Cancelar', '¿Seguro que quieres cancelar? Se perderán los cambios no guardados.', [
      { text: 'No', style: 'cancel' },
      { text: 'Sí, cancelar', onPress: () => navigation.goBack() }
    ]);
  };

  const handleSave = () => {
    if (!receta.trim()) {
      Alert.alert('Error', 'El nombre de la receta es obligatorio');
      return;
    }

    // Aquí se implementa la lógica para guardar la receta editada
    Alert.alert('Éxito', 'Receta actualizada correctamente', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  if (loading) {
    return (
      <LinearGradient
        colors={['rgba(233,163,0,0.9)', 'rgba(251,192,45,0.8)', 'rgba(255,255,255,0.6)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      >
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Cargando receta...</Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['rgba(233,163,0,0.9)', 'rgba(251,192,45,0.8)', 'rgba(255,255,255,0.6)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <Header />

        {/* Header con botones cancelar y guardar, y tags deslizables */}
        <View style={styles.topSection}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
              <Text style={styles.saveText}>Guardar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tagsScrollView}
            contentContainerStyle={styles.tagsContainer}
          >
            {tags.map((tag, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.tag, selectedTag === tag && styles.activeTag]}
                onPress={() => setSelectedTag(tag)}
              >
                <Text style={[styles.tagText, selectedTag === tag && styles.activeTagText]}>
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Campo Receta */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Receta"
              placeholderTextColor="#999"
              value={receta}
              onChangeText={setReceta}
            />
          </View>

          {/* Campo Descripción */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, styles.descriptionInput]}
              placeholder="Descripción y pasos a seguir..."
              placeholderTextColor="#999"
              value={descripcion}
              onChangeText={setDescripcion}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </View>

          {/* Ingredientes */}
          <View style={styles.ingredientsSection}>
            {ingredientes.map((ingrediente, index) => (
              <View key={index} style={styles.ingredientRow}>
                <View style={styles.ingredientIcon}>
                  <Text style={styles.ingredientNumber}>{index + 1}</Text>
                </View>
                <TextInput
                  style={styles.ingredientInput}
                  placeholder={`Ingrediente ${index + 1}`}
                  placeholderTextColor="#999"
                  value={ingrediente}
                  onChangeText={(text) => handleIngredientChange(text, index)}
                />
                {ingredientes.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveIngredient(index)}
                  >
                    <Text style={styles.removeButtonText}>×</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}

            {/* Botón para agregar ingrediente */}
            <TouchableOpacity
              style={styles.addIngredientButton}
              onPress={handleAddIngredient}
            >
              <Text style={styles.addIngredientText}>+ Agregar ingrediente</Text>
            </TouchableOpacity>
          </View>

          {/* Sección de imagen */}
          <TouchableOpacity style={styles.imageContainer} onPress={handleAddImage}>
            <View style={styles.addImageButton}>
              <Text style={styles.addImageText}>+</Text>
            </View>
            <Text style={styles.imageHelpText}>Toca para cambiar imagen</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  topSection: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  cancelText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f77c1e',
    borderRadius: 8,
  },
  saveText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  tagsScrollView: {
    flexGrow: 0,
  },
  tagsContainer: {
    paddingRight: 20,
    gap: 10,
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginRight: 10,
  },
  activeTag: {
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  tagText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  activeTagText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  descriptionInput: {
    minHeight: 120,
    paddingTop: 12,
  },
  ingredientsSection: {
    marginBottom: 20,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  ingredientIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFA500',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ingredientNumber: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  ingredientInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  addIngredientButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addIngredientText: {
    color: '#FFA500',
    fontSize: 14,
    fontWeight: '500',
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 16,
  },
  imageContainer: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 8,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  addImageButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#DDD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  addImageText: {
    fontSize: 24,
    color: '#666',
    fontWeight: '300',
  },
  imageHelpText: {
    color: '#999',
    fontSize: 14,
  },
});