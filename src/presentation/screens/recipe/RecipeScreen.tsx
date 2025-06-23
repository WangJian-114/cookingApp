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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary, Asset } from 'react-native-image-picker';
import LinearGradient from 'react-native-linear-gradient';
import { Header } from '../../components/shared/header/Header';
import { IonIcon } from '../../components/shared/IonIcon';

const PENDING_KEY = 'PENDING_RECIPES';

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

const IngredientList: React.FC<{
  items: string[];
  onChange: (i: number, v: string) => void;
  onAdd: () => void;
  onRemove: (i: number) => void;
}> = ({ items, onChange, onAdd, onRemove }) => (
  <View style={styles.ingredientsSection}>
    {items.map((ing, i) => (
      <View key={i} style={styles.ingredientRow}>
        <View style={styles.ingredientIcon}>
          <Text style={styles.ingredientNumber}>{i + 1}</Text>
        </View>
        <TextInput
          style={styles.ingredientInput}
          placeholder={`Ingrediente ${i + 1}`}
          placeholderTextColor="#999"
          value={ing}
          onChangeText={t => onChange(i, t)}
        />
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
  </View>
);

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

export const RecipeScreen = () => {
  const [receta, setReceta] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [ingredientes, setIngredientes] = useState<string[]>(['', '']);
  const [selectedTag, setSelectedTag] = useState('Desayuno');
  const [photo, setPhoto] = useState<Asset | null>(null);
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<any>(null);

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
      // ▶️ aquí limpiar formulario si quieres
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
      // ▶️ aquí limpiar formulario si quieres
    }
  };

  // inicia flujo de guardado
  const handleSave = async () => {
    const payload = { receta, descripcion, ingredientes, selectedTag, photoUri: photo?.uri };
    const state = await NetInfo.fetch();
    if (state.isConnected) {
      console.log('Enviando al servidor:', payload);
      Alert.alert('¡Listo!', 'Tu receta se publicó correctamente.');
      // ▶️ aquí limpiar formulario si quieres
    } else {
      setPendingPayload(payload);
      setShowOfflineModal(true);
    }
  };

  const handleCancel = () =>
    Alert.alert('Cancelar', 'Se perderán los cambios no guardados.', [
      { text: 'No', style: 'cancel' },
      { text: 'Sí', onPress: () => console.log('Volviendo…') },
    ]);

  const handleAddIngredient = () => setIngredientes([...ingredientes, '']);
  const handleIngredientChange = (i: number, v: string) => {
    const c = [...ingredientes];
    c[i] = v;
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
              placeholder="Receta"
              placeholderTextColor="#999"
              value={receta}
              onChangeText={setReceta}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, styles.descriptionInput]}
              placeholder="Descripción y pasos..."
              placeholderTextColor="#999"
              value={descripcion}
              onChangeText={setDescripcion}
              multiline
            />
          </View>

          <IngredientList
            items={ingredientes}
            onAdd={handleAddIngredient}
            onChange={handleIngredientChange}
            onRemove={handleRemoveIngredient}
          />

          <ImagePickerSection photo={photo} onPick={handleAddImage} />

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveText}>Guardar</Text>
          </TouchableOpacity>
        </ScrollView>

        <Modal transparent visible={showOfflineModal} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>No hay conexión a internet</Text>
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
  inputContainer: { marginBottom: 5, margin:8 },


  input: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  descriptionInput: { minHeight: 100, marginBottom: 10  },

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
  ingredientInput: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
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
//    backgroundColor: '#FFD740',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 24,
    marginLeft : 50,
    marginRight : 50,
  },
  saveText: { color: '#000', fontSize: 16, fontWeight: '600' },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '80%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#FFD740',
  },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12, textAlign: 'center' },
  modalMsg: {
    fontSize: 14,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalBtns: { flexDirection: 'row', justifyContent: 'space-between' },
  modalBtn: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: '#FFD740',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalBtnText: { color: '#000', fontWeight: '600' },
});
