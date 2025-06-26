// src/screens/auth/ForgotPasswordScreen.tsx
import React, { useState } from 'react';
import {
  SafeAreaView,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { authStyles } from './styles/authStyles';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParams } from '../../navigation/AuthNavigator';
import api from '../../../services/api';  // <cliente axios

type AuthNavProp = NativeStackNavigationProp<RootStackParams, 'ForgotPasswordScreen'>;

export const ForgotPasswordScreen = () => {
  const navigation = useNavigation<AuthNavProp>();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu email');
      return;
    }

    setLoading(true);
    try {
      // Llama al endpoint de recuperación
      await api.post('/auth/password/recovery', { email });
      Alert.alert('Listo', 'Revisa tu correo para el código de recuperación');
      // Navega al VerifyCodeScreen, pasando el email
      navigation.navigate('VerifyCodeScreen', { email });
    } catch (err: any) {
      console.error('Recovery error', err);
      Alert.alert(
        'Error',
        err.response?.data?.message || 'No pudimos enviar el código. Intenta nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={authStyles.container}>
      <Image
        source={require('../../../assets/cooking.png')}
        style={authStyles.logo}
        resizeMode="contain"
      />
      <Text style={authStyles.title}>¿Olvidaste tu contraseña?</Text>
      <Text style={authStyles.description}>
        ¡No te preocupes! Te enviaremos un email que te ayudará a resetear tu contraseña.
      </Text>

      <TextInput
        style={authStyles.input}
        placeholder="Email"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TouchableOpacity
        style={authStyles.button}
        onPress={handleContinue}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={authStyles.buttonText}>Continuar</Text>
        }
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;
