import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { IonIcon } from '../../components/shared/IonIcon';
import { Header } from '../../components/shared/header/Header';
import api from '../../../services/api';

const { width } = Dimensions.get('window');
const INPUT_HEIGHT = 48;
const H_PAD = 16;

export const ChangePasswordScreen = () => {
  const navigation = useNavigation();
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass]         = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]         = useState(false);

  // flags para borde rojo
  const [errCurrent, setErrCurrent] = useState(false);
  const [errNew, setErrNew]         = useState(false);
  const [errConfirm, setErrConfirm] = useState(false);

  const handleCancel = () => navigation.goBack();

  const handleAccept = async () => {
    // validar campos vacíos
    const isCurrEmpty    = currentPass.trim() === '';
    const isNewEmpty     = newPass.trim() === '';
    const isConfirmEmpty = confirmPass.trim() === '';

    setErrCurrent(isCurrEmpty);
    setErrNew(isNewEmpty);
    setErrConfirm(isConfirmEmpty);

    if (isCurrEmpty || isNewEmpty || isConfirmEmpty) {
      return Alert.alert('Error', 'Completa todos los campos.');
    }

    // validar coincidencia
    if (newPass !== confirmPass) {
      setErrNew(true);
      setErrConfirm(true);
      return Alert.alert('Error', 'La nueva contraseña y su confirmación no coinciden.');
    }

    setLoading(true);
    try {
      await api.post('/auth/password/change', {
        currentPassword: currentPass,
        newPassword: newPass,
      });
      Alert.alert('Éxito', 'Contraseña actualizada correctamente.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err: any) {
      Alert.alert(
        'Error',
        err.response?.data?.message || 'No se pudo cambiar la contraseña.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['rgba(233,163,0,0.9)', 'rgba(251,192,45,0.8)', 'rgba(255,255,255,0.6)']}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <SafeAreaView style={styles.container}>
        <Header />
        <KeyboardAvoidingView
          style={styles.inner}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Text style={styles.title}>Cambiar contraseña</Text>

          {/* Contraseña actual */}
          <View style={[
              styles.inputRow,
              errCurrent && styles.inputError
            ]}>
            <TextInput
              style={styles.input}
              placeholder="Contraseña actual"
              secureTextEntry={!showCurrent}
              value={currentPass}
              onChangeText={text => {
                setCurrentPass(text);
                if (errCurrent) setErrCurrent(false);
              }}
            />
            <TouchableOpacity onPress={() => setShowCurrent(v => !v)}>
              <IonIcon
                name={showCurrent ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          {/* Nueva contraseña */}
          <View style={[
              styles.inputRow,
              errNew && styles.inputError
            ]}>
            <TextInput
              style={styles.input}
              placeholder="Nueva contraseña"
              secureTextEntry={!showNew}
              value={newPass}
              onChangeText={text => {
                setNewPass(text);
                if (errNew) setErrNew(false);
                if (errConfirm) setErrConfirm(false);
              }}
            />
            <TouchableOpacity onPress={() => setShowNew(v => !v)}>
              <IonIcon
                name={showNew ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          {/* Confirmar contraseña */}
          <View style={[
              styles.inputRow,
              errConfirm && styles.inputError
            ]}>
            <TextInput
              style={styles.input}
              placeholder="Confirmar contraseña"
              secureTextEntry={!showConfirm}
              value={confirmPass}
              onChangeText={text => {
                setConfirmPass(text);
                if (errConfirm) setErrConfirm(false);
                if (errNew) setErrNew(false);
              }}
            />
            <TouchableOpacity onPress={() => setShowConfirm(v => !v)}>
              <IonIcon
                name={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          {/* Botones */}
          <View style={styles.footer}>
            <Pressable
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
              disabled={loading}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.acceptButton]}
              onPress={handleAccept}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#333" />
                : <Text style={styles.acceptText}>Aceptar</Text>
              }
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  inner: {
    flex: 1,
    paddingHorizontal: H_PAD,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    height: INPUT_HEIGHT,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  inputError: {
    borderColor: '#E53935',
    borderWidth: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  button: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    elevation: 2,
  },
  cancelButton: {
    backgroundColor: '#FFF9E6',
  },
  acceptButton: {
    backgroundColor: '#FFD740',
  },
  cancelText: {
    fontSize: 16,
    color: '#E53935',
  },
  acceptText: {
    fontSize: 16,
    color: '#333',
  },
});