// src/screens/profile/ProfileScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  ActivityIndicator,
  Image,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { IonIcon } from '../../components/shared/IonIcon';
import { Header } from '../../components/shared/header/Header';

import api from '../../../services/api'; // Asegúrate de que esta ruta sea correcta

const { width } = Dimensions.get('window');

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  profile_picture?: string;
  fecha_registro: string;
  recetas_favoritas: string[];
  recetas_intentar: string[];
}

export const ProfileScreen = () => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    navigation.setOptions({
      headerStyle: { backgroundColor: 'transparent', elevation: 0, shadowOpacity: 0 },
      headerTitle: '',
      headerLeft: () => (
        <Pressable
          onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
          style={{ marginLeft: 16 }}
        >
          <IonIcon name="menu-outline" size={28} color="#E9A300" />
        </Pressable>
      ),
    });

    const fetchUserProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get('/auth/profile');

        // --- LOG CRUCIAL: Ver qué datos se reciben ---
        console.log('Datos recibidos del perfil:', response.data);
        // --- FIN LOG CRUCIAL ---

        // Asegúrate de que la estructura de datos coincida con lo que el backend envía
        // Tu backend envía directamente el objeto de usuario, no un { user: ... }
        setUserData(response.data); // <--- CAMBIO AQUÍ: antes era response.data.user
      } catch (err: any) {
        console.error('Error fetching user profile:', err);
        const errorMessage = err.response?.data?.message || err.message || 'Ocurrió un error desconocido al cargar tu perfil.';
        setError(errorMessage);
        Alert.alert('Error de Perfil', errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigation]);

  if (loading) {
    return (
      <LinearGradient
        colors={['rgba(233,163,0,0.9)', 'rgba(251,192,45,0.8)', 'rgba(255,255,255,0.6)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      >
        <SafeAreaView style={[styles.container, styles.centered]}>
          <ActivityIndicator size="large" color="#E9A300" />
          <Text style={styles.loadingText}>Cargando perfil...</Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (error && !userData) {
    return (
      <LinearGradient
        colors={['rgba(233,163,0,0.9)', 'rgba(251,192,45,0.8)', 'rgba(255,255,255,0.6)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      >
        <SafeAreaView style={[styles.container, styles.centered]}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <Pressable style={styles.button} onPress={() => { /* Considera añadir un botón de reintentar */ }}>
            <Text style={styles.buttonText}>Volver a intentar</Text>
          </Pressable>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['rgba(233,163,0,0.9)', 'rgba(251,192,45,0.8)', 'rgba(255,255,255,0.6)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <Header />
        {/* Avatar y nombre de usuario */}
        <View style={styles.mainContainer}>
          <View style={styles.avatarSection}>
            {userData?.profile_picture ? (
              <Image source={{ uri: userData.profile_picture }} style={styles.profileImage} />
            ) : (
              <IonIcon name="person-circle-outline" size={80} color="#333" />
            )}
            <Text style={styles.username}>{userData?.name || 'Cargando...'}</Text>
          </View>

          {/* Campos de perfil */}
          <View style={styles.field}>
            <Text style={styles.label}>Nombre de Usuario</Text>
            <View style={styles.valueWrapper}>
              <Text style={styles.value}>{userData?.name || 'N/A'}</Text>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.valueWrapper}>
              <Text style={styles.value}>{userData?.email || 'N/A'}</Text>
            </View>
          </View>

          {/* Botones */}
          <View style={styles.buttonsContainer}>
            <Pressable style={styles.button}>
              <Text style={styles.buttonText}>Reset Password</Text>
            </Pressable>
            <Pressable style={styles.button}>
              <Text style={styles.buttonText}>Cerrar Cuenta</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
  mainContainer: {
    paddingHorizontal: 16,
  },
  avatarSection: {
    alignItems: 'center',
    marginTop: 24,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    resizeMode: 'cover',
    borderWidth: 2,
    borderColor: '#E9A300',
  },
  username: {
    marginTop: 8,
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  field: {
    marginTop: 20,
  },
  label: {
    fontSize: 14,
    color: '#333',
  },
  valueWrapper: {
    backgroundColor: 'rgba(255,215,64,0.7)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 4,
  },
  value: {
    fontSize: 16,
    color: '#212121',
  },
  buttonsContainer: {
    marginTop: 32,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#FFD740',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginVertical: 8,
    elevation: 2,
  },
  buttonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
});
