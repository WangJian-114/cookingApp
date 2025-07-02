// src/screens/recipes/RecipeEditScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
  Image,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { launchImageLibrary, Asset } from 'react-native-image-picker';
import LinearGradient from 'react-native-linear-gradient';
import { Header } from '../../components/shared/header/Header';
import api from '../../../services/api';

interface Ingrediente {
  nombre: string;
  cantidad: string;
  unidad: string;
}

type Recipe = {
  _id: string;
  titulo: string;
  descripcion: string;
  instrucciones: string;
  tiempo_preparacion: number;
  dificultad: 'Fácil' | 'Media' | 'Difícil';
  porciones: number;
  ingredientes: Ingrediente[];
  imagen?: string;
  autor_id: string;
  fecha_creacion: string;
};

// Componente para selector de etiquetas
const TagSelector: React.FC<{
  tags: string[];
  selected: string;
  onSelect: (t: string) => void;
}> = ({ tags, selected, onSelect }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.tagsContainer}
  >
    {tags.map(tag => (
      <TouchableOpacity
        key={tag}
        style={[styles.tag, selected === tag && styles.activeTag]}
        onPress={() => onSelect(tag)}
      >
        <Text style={[styles.tagText, selected === tag && styles.activeTagText]}>
          {tag}
        </Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
);

// Componente modal para seleccionar unidad
const UnitSelector: React.FC<{
  visible: boolean;
  onClose: () => void;
  onSelect: (unit: string) => void;
  currentUnit: string;
}> = ({ visible, onClose, onSelect, currentUnit }) => {
  const units = ['gr', 'kg', 'ml', 'lt', 'taza', 'cdta', 'cda', 'unidad', 'pizca', 'diente', 'hoja'];

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.unitModalBox}>
          <Text style={styles.modalTitle}>Seleccionar Unidad</Text>
          <ScrollView style={styles.unitList}>
            {units.map(unit => (
              <TouchableOpacity
                key={unit}
                style={[
                  styles.unitOption,
                  currentUnit === unit && styles.activeUnitOption
                ]}
                onPress={() => {
                  onSelect(unit);
                  onClose();
                }}
              >
                <Text style={[
                  styles.unitOptionText,
                  currentUnit === unit && styles.activeUnitOptionText
                ]}>
                  {unit}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// Componente para lista de ingredientes
const IngredientList: React.FC<{
  items: Ingrediente[];
  onChange: (i: number, field: keyof Ingrediente, v: string) => void;
  onAdd: () => void;
  onRemove: (i: number) => void;
}> = ({ items, onChange, onAdd, onRemove }) => {
  const [unitModalVisible, setUnitModalVisible] = useState(false);
  const [selectedIngredientIndex, setSelectedIngredientIndex] = useState(0);

  const handleUnitPress = (index: number) => {
    setSelectedIngredientIndex(index);
    setUnitModalVisible(true);
  };

  const handleUnitSelect = (unit: string) => {
    onChange(selectedIngredientIndex, 'unidad', unit);
  };

  return (
    <View style={styles.ingredientsSection}>
      <Text style={styles.sectionTitle}>Ingredientes *</Text>
      {items.map((ing, i) => (
        <View key={i} style={styles.ingredientRow}>
          <View style={styles.ingredientIcon}>
            <Text style={styles.ingredientNumber}>{i + 1}</Text>
          </View>
          <View style={styles.ingredientInputs}>
            <TextInput
              style={[styles.ingredientInput, styles.ingredientNombre]}
              placeholder="Ingrediente"
              placeholderTextColor="#999"
              value={ing.nombre}
              onChangeText={t => onChange(i, 'nombre', t)}
            />
            <TextInput
              style={[styles.ingredientInput, styles.ingredientCantidad]}
              placeholder="1"
              placeholderTextColor="#999"
              value={ing.cantidad}
              onChangeText={t => onChange(i, 'cantidad', t)}
            />
            <TouchableOpacity
              style={[styles.ingredientInput, styles.ingredientUnidad]}
              onPress={() => handleUnitPress(i)}
            >
              <Text style={styles.unidadSelectorText}>
                {ing.unidad || 'unidad'}
              </Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>
          </View>
          {items.length > 1 && (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => onRemove(i)}
            >
              <Text style={styles.removeButtonText}>×</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
      <TouchableOpacity onPress={onAdd}>
        <Text style={styles.addIngredientText}>+ Agregar ingrediente</Text>
      </TouchableOpacity>

      <UnitSelector
        visible={unitModalVisible}
        onClose={() => setUnitModalVisible(false)}
        onSelect={handleUnitSelect}
        currentUnit={items[selectedIngredientIndex]?.unidad || ''}
      />
    </View>
  );
};

// Componente para selector de imagen
const ImagePickerSection: React.FC<{
  photo: Asset | null;
  onPick: () => void;
  currentImageUrl?: string;
}> = ({ photo, onPick, currentImageUrl }) => (
  <TouchableOpacity style={styles.imageContainer} onPress={onPick}>
    {photo?.uri ? (
      <Image source={{ uri: photo.uri! }} style={styles.imagePreview} />
    ) : currentImageUrl ? (
      <Image source={{ uri: currentImageUrl }} style={styles.imagePreview} />
    ) : (
      <>
        <View style={styles.addImageButton}>
          <Text style={styles.addImageText}>+</Text>
        </View>
        <Text style={styles.imageHelpText}>Toca para cambiar imagen</Text>
      </>
    )}
  </TouchableOpacity>
);

// Componente para selector de dificultad
const DifficultySelector: React.FC<{
  selected: string;
  onSelect: (d: string) => void;
}> = ({ selected, onSelect }) => {
  const difficulties = ['Fácil', 'Media', 'Difícil'];
  return (
    <View style={styles.difficultySection}>
      <Text style={styles.sectionTitle}>Dificultad</Text>
      <View style={styles.difficultyOptions}>
        {difficulties.map(diff => (
          <TouchableOpacity
            key={diff}
            style={[
              styles.difficultyOption,
              selected === diff && styles.activeDifficultyOption
            ]}
            onPress={() => onSelect(diff)}
          >
            <Text style={[
              styles.difficultyText,
              selected === diff && styles.activeDifficultyText
            ]}>
              {diff}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// Servicio para obtener receta por ID
const getRecipeById = async (id: string): Promise<Recipe | null> => {
  try {
    const response = await api.get(`/receta/getRecetaById/${id}`);
    return response.data.receta || response.data;
  } catch (error) {
    console.error('Error fetching recipe:', error);
    return null;
  }
};

// Servicio para actualizar receta
const updateRecipe = async (id: string, recipeData: any, imageFile?: any): Promise<boolean> => {
  try {
    const formData = new FormData();

    // Agregar datos de la receta al FormData
    formData.append('titulo', recipeData.titulo);
    formData.append('descripcion', recipeData.descripcion);
    formData.append('instrucciones', recipeData.instrucciones);
    formData.append('tiempo_preparacion', recipeData.tiempo_preparacion);
    formData.append('dificultad', recipeData.dificultad);
    formData.append('porciones', recipeData.porciones);
    formData.append('ingredientes', JSON.stringify(recipeData.ingredientes));

    // Agregar imagen si existe
    if (imageFile) {
      const imageFileFormatted = {
        uri: imageFile.uri,
        type: imageFile.type || 'image/jpeg',
        name: imageFile.fileName || `photo_${Date.now()}.jpg`,
      } as any;
      formData.append('media', imageFileFormatted);
    }

    const response = await api.put(`/receta/update/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000,
    });

    return response.status === 200;
  } catch (error) {
    console.error('Error updating recipe:', error);
    return false;
  }
};

export const RecipeEditScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { recipeId } = route.params as { recipeId: string };

  // Estados del formulario
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [instrucciones, setInstrucciones] = useState('');
  const [tiempoPreparacion, setTiempoPreparacion] = useState('30');
  const [porciones, setPorciones] = useState('4');
  const [dificultad, setDificultad] = useState('Fácil');
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([
    { nombre: '', cantidad: '', unidad: 'gr' }
  ]);
  const [selectedTag, setSelectedTag] = useState('Desayuno');
  const [photo, setPhoto] = useState<Asset | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Datos originales para detectar cambios
  const [originalData, setOriginalData] = useState<any>(null);

  const tags = [
    'Desayuno',
    'Almuerzo',
    'Cena',
    'Postres',
    'Snacks',
    'Bebidas',
    'Ensaladas',
    'Sopas',
  ];

  useEffect(() => {
    loadRecipe();
  }, [recipeId]);

  const loadRecipe = async () => {
    setLoading(true);
    try {
      const recipe = await getRecipeById(recipeId);
      if (recipe) {
        setTitulo(recipe.titulo);
        setDescripcion(recipe.descripcion || '');
        setInstrucciones(recipe.instrucciones || '');
        setTiempoPreparacion(recipe.tiempo_preparacion?.toString() || '30');
        setPorciones(recipe.porciones?.toString() || '4');
        setDificultad(recipe.dificultad || 'Fácil');
        setCurrentImageUrl(recipe.imagen || '');

        // Convertir ingredientes al formato correcto
        if (recipe.ingredientes && recipe.ingredientes.length > 0) {
          const formattedIngredients = recipe.ingredientes.map(ing => ({
            nombre: ing.nombre || '',
            cantidad: ing.cantidad?.toString() || '',
            unidad: ing.unidad || 'gr'
          }));
          setIngredientes(formattedIngredients);
        }

        // Guardar datos originales
        setOriginalData(recipe);
      } else {
        Alert.alert('Error', 'No se pudo cargar la receta');
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Error', 'Error al cargar la receta');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  // Función para seleccionar imagen
  const handleAddImage = async () => {
    if (Platform.OS === 'android' && Platform.Version < 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: 'Permiso para fotos',
          message: 'Necesitamos seleccionar una imagen de tu galería.',
          buttonPositive: 'Ok',
        }
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert('Permiso denegado', 'No podemos abrir la galería.');
        return;
      }
    }

    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, resp => {
      if (resp.didCancel) return;
      if (resp.errorCode) {
        Alert.alert('Error', resp.errorMessage || 'No se pudo abrir la galería');
        return;
      }
      if (resp.assets?.length) setPhoto(resp.assets[0]);
    });
  };

  const handleAddIngredient = () => {
    setIngredientes([...ingredientes, { nombre: '', cantidad: '', unidad: 'gr' }]);
  };

  const handleIngredientChange = (i: number, field: keyof Ingrediente, v: string) => {
    const c = [...ingredientes];
    c[i][field] = v;
    setIngredientes(c);
  };

  const handleRemoveIngredient = (i: number) => {
    if (ingredientes.length > 1) {
      setIngredientes(ingredientes.filter((_, idx) => idx !== i));
    }
  };

  // Validar formulario
  const validateForm = (): string | null => {
    if (!titulo.trim()) return 'El título de la receta es requerido';

    const ingredientesValidos = ingredientes.filter(i =>
      i.nombre.trim() !== '' && i.cantidad.trim() !== '' && i.unidad.trim() !== ''
    );
    if (ingredientesValidos.length === 0) return 'Debe agregar al menos un ingrediente completo';

    const tiempoNum = parseInt(tiempoPreparacion);
    if (isNaN(tiempoNum) || tiempoNum <= 0) return 'El tiempo de preparación debe ser un número válido mayor a 0';

    const porcionesNum = parseInt(porciones);
    if (isNaN(porcionesNum) || porcionesNum <= 0) return 'Las porciones deben ser un número válido mayor a 0';

    return null;
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancelar',
      '¿Seguro que quieres cancelar? Se perderán los cambios no guardados.',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Sí, cancelar', onPress: () => navigation.goBack() }
      ]
    );
  };

  const handleSave = async () => {
    // Validar formulario
    const validationError = validateForm();
    if (validationError) {
      Alert.alert('Error de validación', validationError);
      return;
    }

    setSaving(true);
    try {
      // Filtrar y formatear ingredientes
      const ingredientesValidos = ingredientes
        .filter(i => i.nombre.trim() !== '' && i.cantidad.trim() !== '' && i.unidad.trim() !== '')
        .map(i => ({
          nombre: i.nombre.trim(),
          cantidad: parseFloat(i.cantidad) || 1,
          unidad: i.unidad.trim(),
        }));

      const recipeData = {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        instrucciones: instrucciones.trim() || descripcion.trim(),
        tiempo_preparacion: tiempoPreparacion,
        dificultad,
        porciones,
        ingredientes: ingredientesValidos,
      };

      const success = await updateRecipe(recipeId, recipeData, photo);

      if (success) {
        Alert.alert('¡Éxito!', 'Receta actualizada correctamente', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Error', 'No se pudo actualizar la receta');
      }
    } catch (error) {
      console.error('Error completo:', error);
      Alert.alert('Error', 'Hubo un problema actualizando la receta');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <LinearGradient
          colors={['rgba(233,163,0,0.9)', 'rgba(251,192,45,1)', 'rgba(255,255,255,0.8)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.gradient}
        >
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#FFA500" />
            <Text style={{ marginTop: 10, fontSize: 16 }}>Cargando receta...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <LinearGradient
        colors={['rgba(233,163,0,0.9)', 'rgba(251,192,45,1)', 'rgba(255,255,255,0.8)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      >
        <Header />

        <View style={styles.topSection}>
          <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
          <TagSelector tags={tags} selected={selectedTag} onSelect={setSelectedTag} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Nombre de la receta*"
              placeholderTextColor="#999"
              value={titulo}
              onChangeText={setTitulo}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, styles.descriptionInput]}
              placeholder="Descripción de la receta..."
              placeholderTextColor="#999"
              value={descripcion}
              onChangeText={setDescripcion}
              multiline
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, styles.descriptionInput]}
              placeholder="Instrucciones paso a paso..."
              placeholderTextColor="#999"
              value={instrucciones}
              onChangeText={setInstrucciones}
              multiline
            />
          </View>

          {/* Campos de tiempo y porciones */}
          <View style={styles.rowContainer}>
            <View style={styles.halfInputContainer}>
              <Text style={styles.inputLabel}>Tiempo (min)</Text>
              <TextInput
                style={styles.input}
                placeholder="30"
                placeholderTextColor="#999"
                value={tiempoPreparacion}
                onChangeText={setTiempoPreparacion}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfInputContainer}>
              <Text style={styles.inputLabel}>Porciones</Text>
              <TextInput
                style={styles.input}
                placeholder="4"
                placeholderTextColor="#999"
                value={porciones}
                onChangeText={setPorciones}
                keyboardType="numeric"
              />
            </View>
          </View>

          <DifficultySelector selected={dificultad} onSelect={setDificultad} />

          <IngredientList
            items={ingredientes}
            onAdd={handleAddIngredient}
            onChange={handleIngredientChange}
            onRemove={handleRemoveIngredient}
          />

          <ImagePickerSection
            photo={photo}
            onPick={handleAddImage}
            currentImageUrl={currentImageUrl}
          />

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.savingButton]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Text style={styles.saveText}>Actualizar Receta</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#E9A300' },
  gradient: { flex: 1 },

  topSection: { paddingHorizontal: 16, paddingTop: 12 },
  cancelButton: { alignSelf: 'flex-end', padding: 8 },
  cancelText: { color: '#555', fontSize: 16 },

  tagsContainer: { paddingVertical: 8, paddingHorizontal: 4 },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginHorizontal: 4,
  },
  activeTag: { backgroundColor: 'rgba(255,255,255,0.8)' },
  tagText: { color: '#666', fontSize: 14 },
  activeTagText: { color: '#333', fontWeight: '600' },

  content: { flex: 1, padding: 16 },
  inputContainer: { marginBottom: 5, margin: 8 },

  // Contenedor para campos en fila
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    margin: 8,
  },
  halfInputContainer: {
    flex: 0.48,
  },
  inputLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
    fontWeight: '500',
  },

  input: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  descriptionInput: { minHeight: 100, marginBottom: 10 },

  // Estilos para sección de título
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },

  // Estilos para selector de dificultad
  difficultySection: {
    marginBottom: 16,
    margin: 8,
  },
  difficultyOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  difficultyOption: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  activeDifficultyOption: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderColor: '#FFA500',
  },
  difficultyText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  activeDifficultyText: {
    color: '#333',
    fontWeight: '600',
  },

  // Estilos mejorados para ingredientes
  ingredientsSection: { marginBottom: 16, margin: 8 },
  ingredientRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  ingredientIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFA500',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ingredientNumber: { color: '#fff', fontSize: 12 },
  ingredientInputs: {
    flex: 1,
    flexDirection: 'row',
    marginLeft: 8,
  },
  ingredientInput: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 4,
  },
  ingredientNombre: {
    flex: 2,
  },
  ingredientCantidad: {
    flex: 0.8,
  },
  ingredientUnidad: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  unidadSelectorText: {
    fontSize: 14,
    color: '#333',
  },
  dropdownArrow: {
    fontSize: 10,
    color: '#666',
  },
  removeButton: {
    marginLeft: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: { color: '#fff', fontSize: 16, lineHeight: 16 },
  addIngredientText: { color: '#000', fontSize: 14, margin: 10 },

  imageContainer: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  imagePreview: { width: '100%', height: '100%', borderRadius: 8 },
  addImageButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#DDD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  addImageText: { fontSize: 24, color: '#666' },
  imageHelpText: { color: '#999', fontSize: 14 },

  saveButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 24,
    marginLeft: 50,
    marginRight: 50,
  },
  savingButton: {
    backgroundColor: '#DDD',
  },
  saveText: { color: '#000', fontSize: 16, fontWeight: '600' },

  // Estilos para modal de unidades
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unitModalBox: {
    width: '80%',
    maxHeight: '70%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#FFD740',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center'
  },
  unitList: {
    maxHeight: 300,
  },
  unitOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  activeUnitOption: {
    backgroundColor: '#FFD740',
  },
  unitOptionText: {
    fontSize: 16,
    color: '#333',
  },
  activeUnitOptionText: {
    fontWeight: '600',
    color: '#000',
  },
  closeButton: {
    marginTop: 16,
    backgroundColor: '#FFD740',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#000',
    fontWeight: '600'
  }
  });