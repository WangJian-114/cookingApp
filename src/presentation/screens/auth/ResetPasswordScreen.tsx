import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import api from '../../../services/api';
import { authStyles } from './styles/authStyles';
import { IonIcon } from '../../components/shared/IonIcon';
import { RootStackParams } from '../../navigation/AuthNavigator';

type ResetPwdRouteProp = RouteProp<RootStackParams, 'ResetPasswordScreen'>;
type ResetPwdNavProp = NativeStackNavigationProp<RootStackParams, 'ResetPasswordScreen'>;

export const ResetPasswordScreen = () => {
  const route = useRoute<ResetPwdRouteProp>();
  const navigation = useNavigation<ResetPwdNavProp>();
  const { email, token } = route.params;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPwdVisible, setNewPwdVisible] = useState(false);
  const [confirmPwdVisible, setConfirmPwdVisible] = useState(false);

  const handleReset = async () => {
    if (!newPassword || !confirmPassword) {
      return Alert.alert('Error', 'Por favor completa ambos campos.');
    }
    if (newPassword !== confirmPassword) {
      return Alert.alert('Error', 'Las contraseñas no coinciden.');
    }

    try {
      await api.post('/auth/password/reset', {
        email,
        token,
        newPassword,
        confirmPassword,
      });
      Alert.alert(
        '¡Listo!',
        'Tu contraseña fue restablecida.',
        [{ text: 'Ir al Login', onPress: () => navigation.replace('LoginScreen') }]
      );
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Error al restablecer contraseña';
      Alert.alert('Error', msg);
    }
  };

  return (
    <SafeAreaView style={authStyles.container}>
      <Image
        source={require('../../../assets/cooking.png')}
        style={authStyles.logo}
      />
      <Text style={authStyles.title}>Reset Password</Text>

      {/* New Password */}
      <View style={authStyles.passwordContainer}>
        <TextInput
          style={authStyles.input}
          placeholder="New password"
          secureTextEntry={!newPwdVisible}
          value={newPassword}
          onChangeText={setNewPassword}
          placeholderTextColor="#999"
        />
        <TouchableOpacity
          onPress={() => setNewPwdVisible(v => !v)}
          style={authStyles.icon}
        >
          <IonIcon
            name={newPwdVisible ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color="#999"
          />
        </TouchableOpacity>
      </View>

      {/* Confirm Password */}
      <View style={authStyles.passwordContainer}>
        <TextInput
          style={authStyles.input}
          placeholder="Confirm password"
          secureTextEntry={!confirmPwdVisible}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholderTextColor="#999"
        />
        <TouchableOpacity
          onPress={() => setConfirmPwdVisible(v => !v)}
          style={authStyles.icon}
        >
          <IonIcon
            name={confirmPwdVisible ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color="#999"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={authStyles.button} onPress={handleReset}>
        <Text style={authStyles.buttonText}>Reset Password</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};