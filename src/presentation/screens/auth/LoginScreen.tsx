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
} from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IonIcon } from '../../components/shared/IonIcon';
import { loginStyles } from './styles/loginScreenStyles';
import api from '../../../services/api';  // <cliente axios

import type { RootStackParams } from '../../navigation/AuthNavigator';

type AuthNavProp = NativeStackNavigationProp<RootStackParams, 'LoginScreen'>;

export const LoginScreen = () => {
  const navigation = useNavigation<AuthNavProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(v => !v);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      return Alert.alert('Error', 'Por favor ingresa email y contraseña');
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      // Guardamos los tokens
      await AsyncStorage.setItem('ACCESS_TOKEN', data.accessToken);
      await AsyncStorage.setItem('REFRESH_TOKEN', data.refreshToken);

      // Navegamos al stack principal (ajusta el nombre según tu RootNavigator)
      navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'MainApp' }]
              })
            )
    } catch (err: any) {
      console.error('Login error:', err);
      Alert.alert(
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
