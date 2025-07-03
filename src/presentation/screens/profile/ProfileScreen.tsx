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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  DrawerActions,
  CommonActions,
  useNavigation,
} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { IonIcon } from '../../components/shared/IonIcon';
import { Header } from '../../components/shared/header/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../../services/api';

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
    fetchUserProfile();
  }, [navigation]);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/auth/profile');
      setUserData(data);
    } catch (err) {
      console.warn('Error fetching profile', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignoramos errores
    }
    await AsyncStorage.multiRemove(['ACCESS_TOKEN', 'REFRESH_TOKEN']);
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Auth' as never }],
      })
    );
  };

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

  return (
    <LinearGradient
      colors={['rgba(233,163,0,0.9)', 'rgba(251,192,45,0.8)', 'rgba(255,255,255,0.6)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <Header />
        <View style={styles.mainContainer}>
          <View style={styles.avatarSection}>
            {userData?.profile_picture ? (
              <Image
                source={{ uri: userData.profile_picture }}
                style={styles.profileImage}
              />
            ) : (
              <IonIcon name="person-circle-outline" size={80} color="#333" />
            )}
            <Text style={styles.username}>{userData?.name || 'Cargando...'}</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Nombre de Usuario</Text>
            <View style={styles.valueWrapper}>
              <Text style={styles.value}>{userData?.name}</Text>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.valueWrapper}>
              <Text style={styles.value}>{userData?.email}</Text>
            </View>
          </View>

          <View style={styles.buttonsContainer}>
            <Pressable
              style={styles.button}
              onPress={() => {
                // Navega al Stack padre donde está ChangePasswordScreen
                navigation.getParent()?.navigate('ChangePasswordScreen' as never);
              }}
            >
              <Text style={styles.buttonText}>Reset Password</Text>
            </Pressable>

            <Pressable style={styles.button} onPress={handleLogout}>
              <Text style={styles.buttonText}>Cerrar Sesión</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#333' },
  mainContainer: { paddingHorizontal: 16 },
  avatarSection: { alignItems: 'center', marginTop: 24 },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#E9A300',
  },
  username: { marginTop: 8, fontSize: 20, fontWeight: '600', color: '#333' },
  field: { marginTop: 20 },
  label: { fontSize: 14, color: '#333' },
  valueWrapper: {
    backgroundColor: 'rgba(255,215,64,0.7)',
    borderRadius: 8,
    padding: 12,
    marginTop: 4,
  },
  value: { fontSize: 16, color: '#212121' },
  buttonsContainer: { marginTop: 32, alignItems: 'center' },
  button: {
    backgroundColor: '#FFD740',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginVertical: 8,
    elevation: 2,
  },
  buttonText: { color: '#333', fontSize: 16, fontWeight: '500' },
});
