// src/screens/auth/LoginScreen.tsx

import React, { useState } from 'react';
import {
  Image,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';                   // ←--- MOD: importar NetInfo
import { IonIcon } from '../../components/shared/IonIcon';
import { loginStyles } from './styles/loginScreenStyles';
import api from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';


import type { RootStackParams } from '../../navigation/AuthNavigator';
import { useNetwork } from '../../hooks/useNetwork';

type AuthNavProp = NativeStackNavigationProp<RootStackParams, 'LoginScreen'>;

export const LoginScreen = () => {
  const navigation = useNavigation<AuthNavProp>();
  const [email, setEmail]                 = useState('');
  const [password, setPassword]           = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading]             = useState(false);
  const { login } = useAuth();

  const togglePasswordVisibility = () => {
    setPasswordVisible(v => !v);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      return Alert.alert('Error', 'Por favor ingresa email y contraseña');
    }

    // ←--- MOD: verificar conexión a internet antes de llamar al servidor
    const netState = await NetInfo.fetch();
    if (!netState.isConnected) {
      return Alert.alert(
        'Error de conexión',
        'No se pudo conectar con el servidor, corrobore su señal de internet o vuelva a intentarlo más tarde'
      );
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      // Guardamos los tokens
      // await AsyncStorage.setItem('ACCESS_TOKEN', data.accessToken);
      // await AsyncStorage.setItem('REFRESH_TOKEN', data.refreshToken);
      console.log("CHANGE!");
      // // // Navegamos al stack principal
      // navigation.dispatch(
      //   CommonActions.reset({
      //     index: 0,
      //     routes: [{ name: 'MainApp' }]
      //   })
      // );
      await login(data?.accessToken, data.refreshToken); 
    } catch (err: any) {
      console.error('Login error:', err);

      // Si no hubo respuesta del servidor (network error), se habría manejado arriba
      // Aquí manejamos credenciales incorrectas u otros errores del servidor
      return Alert.alert(
        'Login fallido',
        err.response?.data?.message || err.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = () => {
    navigation.navigate('ForgotPasswordScreen');
  };

  const isConnected = useNetwork();

  if (isConnected === null) return <ActivityIndicator />;

  if (!isConnected) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No se puede usar la aplicación sin conexión.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={loginStyles.container}>
      {/* Logo */}
      <View style={loginStyles.logoContainer}>
        <Image
          source={require('../../../assets/cooking.png')}
          style={loginStyles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Formulario */}
      <View style={loginStyles.inputContainer}>
        {/* Email */}
        <TextInput
          style={loginStyles.input}
          placeholder="Email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Contraseña */}
        <View style={loginStyles.passwordContainer}>
          <TextInput
            style={[loginStyles.input, { paddingRight: 40 }]}
            placeholder="Contraseña"
            placeholderTextColor="#999"
            secureTextEntry={!passwordVisible}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={loginStyles.icon}
          >
            <IonIcon
              name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="#999"
            />
          </TouchableOpacity>
        </View>

        {/* Botón de Login */}
        <TouchableOpacity
          style={loginStyles.loginButton}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={loginStyles.loginButtonText}>
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </Text>
        </TouchableOpacity>

        {/* Olvidé contraseña */}
        <TouchableOpacity onPress={handleForgot}>
          <Text style={loginStyles.forgotPassword}>
            Olvidé mi contraseña
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;
