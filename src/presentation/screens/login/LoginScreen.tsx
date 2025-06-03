import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
// import axios from 'axios'; // descomentá si usás axios

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    // 🟡 LOGIN HARDCODEADO
    if (email === '1@gmail.com' && password === '123') {
      navigation.navigate('Home');
    } else {
      Alert.alert('Error', 'Correo o contraseña incorrectos');
    }

    // ✅ EJEMPLO DE ENVÍO AL BACKEND CON AXIOS
    /*
    try {
      const response = await axios.post('https://tu-api.com/login', {
        email,
        password,
      });

      if (response.data.success) {
        navigation.navigate('Home');
      } else {
        Alert.alert('Error', 'Credenciales inválidas');
      }
    } catch (error) {
      Alert.alert('Error de conexión', 'No se pudo contactar al servidor');
    }
    */
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        {/* LOGO */}
        <Image
          source={require('../../../assets/CookingLogo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Email */}
        <TextInput
          style={styles.input}
          placeholder="Correo electronico"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        {/* Password con ícono FontAwesome */}
        <View style={styles.passwordWrapper}>
          <TextInput
            style={styles.passwordInput}
            placeholder="********"
            placeholderTextColor="#888"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.icon}
          >
            <FontAwesome
              name={showPassword ? 'eye-slash' : 'eye'}
              size={22}
              color="#000"
            />
          </TouchableOpacity>
        </View>

        {/* Login button */}
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginText}>Iniciar Sesión</Text>
        </TouchableOpacity>

        {/* Forgot password */}
        <TouchableOpacity>
          <Text style={styles.forgotText}>Olvidé mi contraseña</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f0e2',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 30,
  },
  input: {
    width: '100%',
    backgroundColor: '#fff6e9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ffcd47',
  },
  passwordWrapper: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#fff6e9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffcd47',
    alignItems: 'center',
    marginBottom: 20,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  icon: {
    paddingHorizontal: 12,
  },
  loginButton: {
    backgroundColor: '#ffcd47',
    paddingVertical: 12,
    paddingHorizontal: 60,
    borderRadius: 8,
    marginBottom: 15,
  },
  loginText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  forgotText: {
    color: '#000',
    textDecorationLine: 'underline',
    fontSize: 14,
  },
});
