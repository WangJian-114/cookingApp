// src/screens/auth/VerifyCodeScreen.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParams } from '../../navigation/AuthNavigator';
import api from '../../../services/api';
import { authStyles } from './styles/authStyles';
import type { TextInput as RNTextInput } from 'react-native';

type VerifyNavProp = NativeStackNavigationProp<RootStackParams, 'VerifyCodeScreen'>;
type VerifyRouteProp = RouteProp<RootStackParams, 'VerifyCodeScreen'>;

export const VerifyCodeScreen = () => {
  const navigation = useNavigation<VerifyNavProp>();
  const route = useRoute<VerifyRouteProp>();
  const { email } = route.params;

  const [code, setCode] = useState<string[]>(['', '', '', '']);
  const [loading, setLoading] = useState(false);

  // refs para los 4 inputs
  const inputsRef = useRef<Array<RNTextInput | null>>([]);

  const handleChange = (value: string, index: number) => {
    const digit = value.replace(/[^0-9]/g, '');
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);

    if (digit && index < inputsRef.current.length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ) => {
    if (e.nativeEvent.key === 'Backspace' && code[index] === '' && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    const token = code.join('');
    if (token.length < 4) {
      Alert.alert('Código incompleto', 'Por favor ingresa los 4 dígitos del código.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/password/verify', { email, token });
      // Si el código es válido, navegamos a la pantalla de reset
      navigation.navigate('ResetPasswordScreen', { email, token });
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error al verificar el código';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={authStyles.container}>
      <Image
        source={require('../../../assets/cooking.png')}
        style={authStyles.logo}
      />
      <Text style={authStyles.title}>Ingrese el código</Text>
      <Text style={authStyles.description}>
        Una vez que ingreses el código enviado a tu email, podrás restablecer tu contraseña.
      </Text>

      <View style={authStyles.codeContainer}>
        {code.map((digit, index) => (
          <TextInput
            key={index}
            ref={ref => (inputsRef.current[index] = ref)}
            style={authStyles.codeInput}
            maxLength={1}
            keyboardType="number-pad"
            returnKeyType="next"
            textContentType="oneTimeCode"
            value={digit}
            onChangeText={value => handleChange(value, index)}
            onKeyPress={e => handleKeyPress(e, index)}
          />
        ))}
      </View>

      <TouchableOpacity
        style={[authStyles.button, loading && { opacity: 0.7 }]}
        onPress={handleSubmit}
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
