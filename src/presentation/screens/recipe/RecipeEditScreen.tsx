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
  PermissionsAndroid,
  Platform,
  Image,
  Dimensions,
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Selector de unidad
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
                style={[styles.unitOption, currentUnit === unit && styles.activeUnitOption]}
                onPress={() => {
                  onSelect(unit);
                  onClose();
                }}
              >
                <Text style={[styles.unitOptionText, currentUnit === unit && styles.activeUnitOptionText]}>
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

// Lista de ingredientes
const IngredientList: React.FC<{
  items: Ingrediente[];
  onChange: (i: number, field: keyof Ingrediente, v: string) => void;
  onAdd: () => void;
  onRemove: (i: number) => void;
}> = ({ items, onChange, onAdd, onRemove }) => {
  const [unitModalVisible, setUnitModalVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const openUnitModal = (index: number) => {
    setSelectedIndex(index);
    setUnitModalVisible(true);
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
              keyboardType="numeric"
            />
            <TouchableOpacity
              style={[styles.ingredientInput, styles.ingredientUnidad]}
              onPress={() => openUnitModal(i)}
            >
              <Text style={styles.unidadSelectorText}>{ing.unidad || 'unidad'}</Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>
          </View>
          {items.length > 1 && (
            <TouchableOpacity style={styles.removeButton} onPress={() => onRemove(i)}>
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
        onSelect={unit => onChange(selectedIndex, 'unidad', unit)}
        currentUnit={items[selectedIndex]?.unidad || ''}
      />
    </View>
  );
};

// Selector de dificultad
const DifficultySelector: React.FC<{ selected: string; onSelect: (d: string) => void }> = ({
  selected,
  onSelect,
}) => {
  const options = ['Fácil', 'Media', 'Difícil'];
  return (
    <View style={styles.difficultySection}>
      <Text style={styles.sectionTitle}>Dificultad</Text>
      <View style={styles.difficultyOptions}>
        {options.map(opt => (
          <TouchableOpacity
            key={opt}
            style={[styles.difficultyOption, selected === opt && styles.activeDifficultyOption]}
            onPress={() => onSelect(opt)}
          >
            <Text style={[styles.difficultyText, selected === opt && styles.activeDifficultyText]}>
              {opt}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// Selector de imagen
const ImagePickerSection: React.FC<{ photo: Asset | null; onPick: () => void; currentImageUrl?: string }> = ({
  photo,
  onPick,
  currentImageUrl,
}) => (
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

// Servicio para obtener receta por ID
const getRecipeById = async (id: string): Promise<Recipe | null> => {
  try {
    const res = await api.get(`/receta/getRecetaById/${id}`);
    return res.data.receta || res.data;
  } catch (e) {
    console.error('Error fetching recipe:', e);
    return null;
  }
};

export const RecipeEditScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { recipeId } = route.params as { recipeId: string };

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [instrucciones, setInstrucciones] = useState('');
  const [tiempoPreparacion, setTiempoPreparacion] = useState('30');
  const [porciones, setPorciones] = useState('4');
  const [dificultad, setDificultad] = useState<'Fácil' | 'Media' | 'Difícil'>('Fácil');
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([
    { nombre: '', cantidad: '', unidad: 'gr' },
  ]);
  const [photo, setPhoto] = useState<Asset | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Cargo los datos de la receta al montar
  useEffect(() => {
    (async () => {
      if (!recipeId) return;
      setLoading(true);
      const rec = await getRecipeById(recipeId);
      if (!rec) {
        Alert.alert('Error', 'No se pudo cargar la receta');
        navigation.goBack();
        return;
      }
      setTitulo(rec.titulo);
      setDescripcion(rec.descripcion || '');
      setInstrucciones(rec.instrucciones || '');
      setTiempoPreparacion(String(rec.tiempo_preparacion || 30));
      setPorciones(String(rec.porciones || 4));
      setDificultad(rec.dificultad || 'Fácil');
      setCurrentImageUrl(rec.imagen || '');
      if (rec.ingredientes?.length) {
        setIngredientes(
          rec.ingredientes.map(i => ({
            nombre: i.nombre || '',
            cantidad: String(i.cantidad) || '',
            unidad: i.unidad || 'gr',
          }))
        );
      }
      setLoading(false);
    })();
  }, [recipeId]);

  // Validación sencilla
  const validateForm = (): string | null => {
    if (!titulo.trim()) return 'El título de la receta es requerido';
    const validIngs = ingredientes.filter(i => i.nombre && i.cantidad && i.unidad);
    if (validIngs.length === 0) return 'Agrega al menos un ingrediente completo';
    if (isNaN(+tiempoPreparacion) || +tiempoPreparacion <= 0) return 'Tiempo mayor a 0';
    if (isNaN(+porciones) || +porciones <= 0) return 'Porciones mayor a 0';
    return null;
  };

  const handleSave = async () => {
    const err = validateForm();
    if (err) {
      Alert.alert('Error de validación', err);
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('titulo', titulo.trim());
      formData.append('descripcion', descripcion.trim());
      formData.append('instrucciones', instrucciones.trim());
      formData.append('tiempo_preparacion', tiempoPreparacion);
      formData.append('dificultad', dificultad);
      formData.append('porciones', porciones);
      formData.append(
        'ingredientes',
        JSON.stringify(
          ingredientes
            .filter(i => i.nombre && i.cantidad && i.unidad)
            .map(i => ({
              nombre: i.nombre.trim(),
              cantidad: parseFloat(i.cantidad) || 1,
              unidad: i.unidad.trim(),
            }))
        )
      );
      if (photo?.uri) {
        formData.append('media', {
          uri: photo.uri,
          type: photo.type || 'image/jpeg',
          name: photo.fileName || `photo_${Date.now()}.jpg`,
        } as any);
      }

      const resp = await api.put(`/receta/update/${recipeId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000,
      });

      if (resp.status === 200) {
        Alert.alert('¡Éxito!', 'Receta actualizada correctamente', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Error', 'No se pudo actualizar la receta');
      }
    } catch (e: any) {
      console.error('Error updating recipe:', e);
      Alert.alert('Error', e.response?.data?.message || 'Error actualizando receta');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient
          colors={['rgba(233,163,0,0.9)', 'rgba(251,192,45,1)', 'rgba(255,255,255,0.8)']}
          style={styles.gradient}
        >
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#E9A300" />
            <Text style={styles.loadingText}>Cargando receta...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['rgba(233,163,0,0.9)', 'rgba(251,192,45,1)', 'rgba(255,255,255,0.8)']}
        style={styles.gradient}
      >
        <Header />
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Inputs y selectores */}
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
            onAdd={() => setIngredientes([...ingredientes, { nombre: '', cantidad: '', unidad: 'gr' }])}
            onChange={(i, f, v) => {
              const arr = [...ingredientes];
              arr[i][f] = v;
              setIngredientes(arr);
            }}
            onRemove={i => setIngredientes(ingredientes.filter((_, idx) => idx !== i))}
          />

          <ImagePickerSection
            photo={photo}
            onPick={async () => {
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
            }}
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
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#333' },
  content: { flex: 1, padding: 16 },

  inputContainer: { marginBottom: 12 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  descriptionInput: { minHeight: 100 },

  rowContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  halfInputContainer: { flex: 0.48 },
  inputLabel: { fontSize: 14, color: '#333', marginBottom: 4, fontWeight: '500' },

  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8 },

  difficultySection: { marginBottom: 16 },
  difficultyOptions: { flexDirection: 'row', justifyContent: 'space-between' },
  difficultyOption: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 8,
    paddingVertical: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  activeDifficultyOption: { backgroundColor: 'rgba(255,255,255,0.9)', borderColor: '#FFA500' },
  difficultyText: { color: '#666', fontSize: 14, fontWeight: '500' },
  activeDifficultyText: { color: '#333', fontWeight: '600' },

  ingredientsSection: { marginBottom: 16 },
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
  ingredientInputs: { flex: 1, flexDirection: 'row', marginLeft: 8 },
  ingredientInput: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 4,
  },
  ingredientNombre: { flex: 2 },
  ingredientCantidad: { flex: 0.8 },
  ingredientUnidad: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  unidadSelectorText: { fontSize: 14, color: '#333' },
  dropdownArrow: { fontSize: 10, color: '#666' },
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
  addIngredientText: { color: '#000', fontSize: 14, marginVertical: 8 },

  unitModalBox: {
    width: SCREEN_WIDTH * 0.8,
    maxHeight: SCREEN_WIDTH * 0.8,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#FFD740',
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12, textAlign: 'center' },
  unitList: { maxHeight: 300 },
  unitOption: { paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  activeUnitOption: { backgroundColor: '#FFD740' },
  unitOptionText: { fontSize: 16, color: '#333' },
  activeUnitOptionText: { fontWeight: '600', color: '#000' },
  closeButton: { marginTop: 16, backgroundColor: '#FFD740', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  closeButtonText: { color: '#000', fontWeight: '600' },

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
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    marginVertical: 24,
  },
  savingButton: { backgroundColor: '#DDD' },
  saveText: { color: '#000', fontSize: 16, fontWeight: '600' },
});
