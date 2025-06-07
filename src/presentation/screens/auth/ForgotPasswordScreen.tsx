import React, { useState } from 'react';
import {
 Text, TextInput, TouchableOpacity, Image, SafeAreaView,
} from 'react-native';

import { authStyles } from './styles/authStyles';

export const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');

  return (
    <SafeAreaView style={authStyles.container}>
      <Image source={require('../../../assets/cooking.png')} style={authStyles.logo} />
      <Text style={authStyles.title}>¿Olvidaste tu contraseña?</Text>
      <Text style={authStyles.description}>
        ¡No te preocupes! Te enviaremos un email que te ayudará a resetear tu contraseña
      </Text>
      <TextInput
        style={authStyles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        placeholderTextColor="#999"
      />
      <TouchableOpacity style={authStyles.button}>
        <Text style={authStyles.buttonText}>Continuar</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};
