import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image, SafeAreaView,
} from 'react-native';

import { authStyles } from './styles/authStyles';

export const VerifyCodeScreen = () => {
  const [code, setCode] = useState(['', '', '', '']);

  return (
    <SafeAreaView style={authStyles.container}>
      <Image source={require('../../../assets/cooking.png')} style={authStyles.logo} />
      <Text style={authStyles.title}>Ingrese los códigos</Text>
      <Text style={authStyles.description}>
        Una vez que ingrese la clave que se envió a su email, se le permitirá modificar la contraseña
      </Text>
      <View style={authStyles.codeContainer}>
        {code.map((digit, index) => (
          <TextInput
            key={index}
            style={authStyles.codeInput}
            maxLength={1}
            keyboardType="numeric"
            value={digit}
            onChangeText={(value) => {
              const newCode = [...code];
              newCode[index] = value;
              setCode(newCode);
            }}
          />
        ))}
      </View>
      <TouchableOpacity style={authStyles.button}>
        <Text style={authStyles.buttonText}>Continuar</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};
