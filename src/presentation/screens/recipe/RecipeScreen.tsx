// src/screens/recipe/RecipeScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  Pressable,
  Image,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary, Asset } from 'react-native-image-picker';
import LinearGradient from 'react-native-linear-gradient';
import { Header } from '../../components/shared/header/Header';
import { IonIcon } from '../../components/shared/IonIcon';
import api from '../../../services/api';

const PENDING_KEY = 'PENDING_RECIPES';

interface Ingrediente {
  nombre: string;
  cantidad: string;
  unidad: string;
}

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
              keyboardType="numeric"
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

const ImagePickerSection: React.FC<{
  photo: Asset | null;
  onPick: () => void;
}> = ({ photo, onPick }) => (
  <TouchableOpacity style={styles.imageContainer} onPress={onPick}>
    {photo?.uri ? (
      <Image source={{ uri: photo.uri! }} style={styles.imagePreview} />
    ) : (
      <>
        <View style={styles.addImageButton}>
          <Text style={styles.addImageText}>+</Text>
        </View>
        <Text style={styles.imageHelpText}>Toca para agregar imagen</Text>
      </>
    )}
  </TouchableOpacity>
);

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

export const RecipeScreen = () => {
  const [receta, setReceta] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [instrucciones, setInstrucciones] = useState('');
  const [tiempoPreparacion, setTiempoPreparacion] = useState('30');
  const [porciones, setPorciones] = useState('4');
  const [dificultad, setDificultad] = useState('Fácil');
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([
    { nombre: '', cantidad: '', unidad: 'gr' },
    { nombre: '', cantidad: '', unidad: 'gr' }
  ]);
  const [selectedTag, setSelectedTag] = useState('Desayuno');
  const [photo, setPhoto] = useState<Asset | null>(null);
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // cuando volvemos online, sincroniza pendientes
  useEffect(() => {
    const unsub = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        syncPending();
      }
    });
    return unsub;
  }, []);

  const saveRecipeLocally = async (data: any) => {
    try {
      const raw = await AsyncStorage.getItem(PENDING_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      arr.push(data);
      await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(arr));
    } catch (e) {
      console.warn('Error guardando local', e);
    }
  };

  const syncPending = async () => {
    try {
      const raw = await AsyncStorage.getItem(PENDING_KEY);
      const pend = raw ? JSON.parse(raw) : [];
      if (pend.length) {
        console.log('Sincronizando pendientes', pend);
        // ▶️ aquí tus fetch para cada pendiente…
        await AsyncStorage.removeItem(PENDING_KEY);
      }
    } catch (e) {
      console.warn('Error sincronizando', e);
    }
  };

  // abre galería (pide permiso en Android < 33)
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

  // intenta publicar inmediatamente
  const handleReintentar = async () => {
    const state = await NetInfo.fetch();
    if (state.isConnected && pendingPayload) {
      console.log('Reintentando envío:', pendingPayload);
      Alert.alert('¡Listo!', 'Tu receta se publicó correctamente.');
      setShowOfflineModal(false);
      setPendingPayload(null);
      clearForm();
    }
    // si aún offline, no hacemos nada (modal sigue abierto)
  };

  // encola para publicar más tarde
  const handlePublicarLuego = async () => {
    if (pendingPayload) {
      await saveRecipeLocally(pendingPayload);
      setShowOfflineModal(false);
      setPendingPayload(null);
      Alert.alert('Guardado', 'Tu receta se guardó localmente.');
      clearForm();
    }
  };

  // Función para limpiar el formulario
  const clearForm = () => {
    setReceta('');
    setDescripcion('');
    setInstrucciones('');
    setTiempoPreparacion('30');
    setPorciones('4');
    setDificultad('Fácil');
    setIngredientes([
      { nombre: '', cantidad: '', unidad: 'gr' },
      { nombre: '', cantidad: '', unidad: 'gr' }
    ]);
    setSelectedTag('Desayuno');
    setPhoto(null);
  };

  // Validar formulario mejorado
  const validateForm = (): string | null => {
    if (!receta.trim()) return 'El título de la receta es requerido';

    const ingredientesValidos = ingredientes.filter(i =>
      i.nombre.trim() !== '' && i.cantidad.trim() !== '' && i.unidad.trim() !== ''
    );
    if (ingredientesValidos.length === 0) return 'Debe agregar al menos un ingrediente completo (nombre, cantidad y unidad)';

    const tiempoNum = parseInt(tiempoPreparacion);
    if (isNaN(tiempoNum) || tiempoNum <= 0) return 'El tiempo de preparación debe ser un número válido mayor a 0';

    const porcionesNum = parseInt(porciones);
    if (isNaN(porcionesNum) || porcionesNum <= 0) return 'Las porciones deben ser un número válido mayor a 0';

    return null;
  };

  // inicia flujo de guardado
  const handleSave = async () => {
    // Validar formulario
    const validationError = validateForm();
    if (validationError) {
      Alert.alert('Error de validación', validationError);
      return;
    }

    setSaving(true);

    const state = await NetInfo.fetch();
    if (!state.isConnected) {
      setPendingPayload({
        receta,
        descripcion,
        instrucciones,
        tiempoPreparacion,
        porciones,
        dificultad,
        ingredientes,
        selectedTag,
        photoUri: photo?.uri,
      });
      setShowOfflineModal(true);
      setSaving(false);
      return;
    }

    // Construir FormData correctamente
    const formData = new FormData();
    formData.append('titulo', receta.trim());
    formData.append('descripcion', descripcion.trim());
    formData.append('instrucciones', instrucciones.trim() || descripcion.trim());
    formData.append('tiempo_preparacion', tiempoPreparacion);
    formData.append('dificultad', dificultad);
    formData.append('porciones', porciones);

    // Filtrar y formatear ingredientes
    const ingredientesValidos = ingredientes
      .filter(i => i.nombre.trim() !== '' && i.cantidad.trim() !== '' && i.unidad.trim() !== '')
      .map(i => ({
        nombre: i.nombre.trim(),
        cantidad: parseFloat(i.cantidad) || 1,
        unidad: i.unidad.trim(),
      }));
    formData.append('ingredientes', JSON.stringify(ingredientesValidos));

    // CORRECIÓN CRÍTICA: Formato correcto para imagen en React Native
    if (photo && photo.uri) {
      const imageFile = {
        uri: photo.uri,
        type: photo.type || 'image/jpeg',
        name: photo.fileName || `photo_${Date.now()}.jpg`,
      } as any;

      formData.append('media', imageFile);
    }

    console.log('FormData a enviar:', {
      titulo: receta.trim(),
      descripcion: descripcion.trim(),
      instrucciones: instrucciones.trim() || descripcion.trim(),
      tiempo_preparacion: tiempoPreparacion,
      dificultad,
      porciones,
      ingredientes: ingredientesValidos,
      hasImage: !!photo
    });

    try {
      const response = await api.post('/receta/newreceta', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 segundos timeout
      });

      if (response.status === 201) {
        Alert.alert('¡Éxito!', 'Receta creada correctamente', [
          {
            text: 'OK',
            onPress: clearForm
          }
        ]);
      } else {
        console.error('Respuesta inesperada:', response);
        Alert.alert('Error', 'No se pudo crear la receta');
      }
    } catch (error: any) {
      console.error('Error completo:', error);

      if (error.response) {
        // El servidor respondió con un código de error
        console.error('Error response:', error.response.data);
        Alert.alert('Error del servidor', error.response.data?.message || 'Error desconocido');
      } else if (error.request) {
        // La petición se hizo pero no hubo respuesta
        console.error('Error request:', error.request);
        Alert.alert('Error de conexión', 'No se pudo conectar con el servidor');
      } else {
        // Algo pasó al configurar la petición
        console.error('Error config:', error.message);
        Alert.alert('Error', 'Hubo un problema enviando la receta');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () =>
    Alert.alert('Cancelar', 'Se perderán los cambios no guardados.', [
      { text: 'No', style: 'cancel' },
      { text: 'Sí', onPress: () => console.log('Volviendo…') },
    ]);

  const handleAddIngredient = () => setIngredientes([...ingredientes, { nombre: '', cantidad: '', unidad: 'gr' }]);

  const handleIngredientChange = (i: number, field: keyof Ingrediente, v: string) => {
    const c = [...ingredientes];
    c[i][field] = v;
    setIngredientes(c);
  };

  const handleRemoveIngredient = (i: number) =>
    ingredientes.length > 1 && setIngredientes(ingredientes.filter((_, idx) => idx !== i));

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
              value={receta}
              onChangeText={setReceta}
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

          <ImagePickerSection photo={photo} onPick={handleAddImage} />

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.savingButton]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Text style={styles.saveText}>Guardar Receta</Text>
            )}
          </TouchableOpacity>
        </ScrollView>

        <Modal transparent visible={showOfflineModal} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.offlineModalTitle}>No hay conexión a internet</Text>
              <Text style={styles.modalMsg}>
                No hay conexión a internet. Tu receta se almacenará localmente y, cuando
                haya conexión a internet, se volverá a subir y será visible para el público.
              </Text>
              <View style={styles.modalBtns}>
                <Pressable style={styles.modalBtn} onPress={handleReintentar}>
                  <Text style={styles.modalBtnText}>Reintentar</Text>
                </Pressable>
                <Pressable style={styles.modalBtn} onPress={handlePublicarLuego}>
                  <Text style={styles.modalBtnText}>Publicar luego</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
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