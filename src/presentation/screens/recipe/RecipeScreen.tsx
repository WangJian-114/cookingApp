import React, { useState } from 'react';
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
import { Header } from '../../components/shared/header/Header';
import LinearGradient from 'react-native-linear-gradient';

export const RecipeScreen = () => {
  const [receta, setReceta] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [ingredientes, setIngredientes] = useState(['', '']);
  const [selectedTag, setSelectedTag] = useState('Desayuno');

  const tags = ['Desayuno', 'Almuerzo', 'Cena', 'Postres', 'Snacks', 'Bebidas', 'Ensaladas', 'Sopas'];

  const handleAddIngredient = () => {
    setIngredientes([...ingredientes, '']);
  };

  const handleIngredientChange = (text, index) => {
    const newIngredientes = [...ingredientes];
    newIngredientes[index] = text;
    setIngredientes(newIngredientes);
  };

  const handleRemoveIngredient = (index) => {
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
      { text: 'Sí, cancelar', onPress: () => console.log('Navegar al inicio') }
    ]);
  };

  return (
    <LinearGradient
      colors={['rgba(233,163,0,0.9)', 'rgba(251,192,45,0.8)', 'rgba(255,255,255,0.6)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <Header />

        {/* Header con botón cancelar y tags deslizables */}
        <View style={styles.topSection}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancelar</Text>
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
            <Text style={styles.imageHelpText}>Toca para agregar imagen</Text>
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
    justifyContent: 'flex-end',
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
