// src/screens/profile/ProfileScreen.tsx
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { IonIcon } from '../../components/shared/IonIcon';

const { width } = Dimensions.get('window');

export const ProfileScreen = () => {
  const navigation = useNavigation();

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
  }, [navigation]);

  return (
    <LinearGradient
      colors={['rgba(233,163,0,0.9)', 'rgba(251,192,45,0.8)', 'rgba(255,255,255,0.6)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        {/* Avatar y nombre de usuario */}
        <View style={styles.avatarSection}>
          <IonIcon name="person-circle-outline" size={80} color="#333" />
          <Text style={styles.username}>User 1</Text>
        </View>

        {/* Campos de perfil */}
        <View style={styles.field}>
          <Text style={styles.label}>Nombre y Apellido</Text>
          <View style={styles.valueWrapper}>
            <Text style={styles.value}>Tiago Maselli</Text>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Nombre de Usuario</Text>
          <View style={styles.valueWrapper}>
            <Text style={styles.value}>User 1</Text>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.valueWrapper}>
            <Text style={styles.value}>xxxxx@gmail.com</Text>
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
    paddingHorizontal: 16,
  },
  avatarSection: {
    alignItems: 'center',
    marginTop: 24,
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
    backgroundColor: 'rgba(255,215,64,0.7)', // amarillo con opacidad
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
