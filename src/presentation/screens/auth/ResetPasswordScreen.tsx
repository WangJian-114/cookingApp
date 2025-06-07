import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image, SafeAreaView,
} from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { authStyles } from './styles/authStyles';

export const ResetPasswordScreen = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <SafeAreaView style={authStyles.container}>
      <Image source={require('../../../assets/cooking.png')} style={authStyles.logo} />
      <Text style={authStyles.title}>Reset Password</Text>

      <TextInput
        style={authStyles.input}
        placeholder="New password"
        secureTextEntry={!passwordVisible}
        value={newPassword}
        onChangeText={setNewPassword}
        placeholderTextColor="#999"
      />
      <View style={authStyles.passwordContainer}>
        <TextInput
          style={authStyles.input}
          placeholder="Confirm password"
          secureTextEntry={!passwordVisible}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholderTextColor="#999"
        />
        <TouchableOpacity
          onPress={() => setPasswordVisible(!passwordVisible)}
          style={authStyles.icon}
        >
          {/* <Icon
            name={passwordVisible ? 'eye-off' : 'eye'}
            size={20}
            color="#777"
          /> */}
          <Text>Icono</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={authStyles.button}>
        <Text style={authStyles.buttonText}>Reset Password</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};
