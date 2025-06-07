import { Image, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { loginStyles } from './styles/loginScreenStyles';
import { useState } from 'react';

export const LoginScreen = () => {

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
     <SafeAreaView style={loginStyles.container}>
      <View style={loginStyles.logoContainer}>
        <Image
          source={require('../../../assets/cooking.png')}
          style={loginStyles.logo}
        />
        <Text style={loginStyles.title}>Cooking</Text>
      </View>

      <View style={loginStyles.inputContainer}>
        <TextInput
          style={loginStyles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          placeholderTextColor="#999"
        />
        <View style={loginStyles.passwordContainer}>
          <TextInput
            style={loginStyles.input}
            placeholder="Contraseña"
            secureTextEntry={!passwordVisible}
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="#999"
          />
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={loginStyles.icon}
          >
            <Text>ICONO</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={loginStyles.loginButton}>
          <Text style={loginStyles.loginButtonText}>Log in</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={loginStyles.forgotPassword}>Olvidé mi contraseña</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
