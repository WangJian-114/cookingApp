// src/presentation/screens/notification/NotificationScreen.tsx

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  Dimensions,
  RefreshControl,
  Modal,
  Pressable,
  ActivityIndicator,
  Alert,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { IonIcon } from '../../components/shared/IonIcon';
import { Header } from '../../components/shared/header/Header';

import api from '../../../services/api';

interface Notification {
  _id: string;
  title: string;
  text: string;
  createdAt: string;
  read: boolean;
  userId?: string;
}

const { width } = Dimensions.get('window');

const TEXT_COLOR = '#44403C';
const PRIMARY_YELLOW = '#E9A300';


const UNREAD_BG_COLOR = '#FFD740'; 
const READ_BG_COLOR = '#E0E0E0';   

export const NotificationScreen = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    setRefreshing(true);
    try {
      const response = await api.get<Notification[]>('/notifications');
      console.log('Notificaciones recibidas:', response.data);
      setNotifications(response.data);
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      let errorMessage = 'Hubo un problema al obtener las notificaciones.';

      if (err.response) {
        errorMessage = err.response.data?.message || `Error del servidor: ${err.response.status}`;
        if (err.response.status === 401 || err.response.status === 403) {
          errorMessage = 'Acceso denegado. Por favor, inicie sesión nuevamente.';
        } else if (err.response.status === 404) {
          errorMessage = 'La URL de notificaciones no se encontró en el servidor. Verifique la ruta del backend.';
        }
      } else if (err.request) {
        errorMessage = 'No se pudo conectar con el servidor. Verifique su conexión a internet o el estado del servidor.';
      } else {
        errorMessage = err.message || 'Ocurrió un error inesperado.';
      }

      setError(errorMessage);
      setNotifications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const onRefresh = useCallback(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const openModal = async (item: Notification) => {
    setSelectedNotification(item);
    setModalVisible(true);

    if (!item.read) {
      try {
        await api.put(`/notifications/${item._id}/read`);
        setNotifications(prevNotifications =>
          prevNotifications.map(n => (n._id === item._id ? { ...n, read: true } : n))
        );
      } catch (err: any) {
        console.error('Error marking notification as read:', err);
      }
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedNotification(null);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    } catch (e) {
      console.warn('Invalid date string:', dateString, e);
      return dateString;
    }
  };

  if (loading) {
    return (
      <LinearGradient
        colors={['rgba(233,163,0,0.9)', 'rgba(251,192,45,0.8)', 'rgba(255,255,255,0.6)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.container}>
          <Header />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={PRIMARY_YELLOW} />
            <Text style={styles.loadingText}>Cargando notificaciones...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient
        colors={['rgba(233,163,0,0.9)', 'rgba(251,192,45,0.8)', 'rgba(255,255,255,0.6)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.container}>
          <Header />
          <View style={styles.errorStateContainer}>
            <IonIcon name="warning-outline" size={80} color="red" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchNotifications}>
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
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
        <FlatList
          data={notifications}
          keyExtractor={item => item._id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={PRIMARY_YELLOW} />
          }
          contentContainerStyle={styles.list}
          renderItem={({ item }) => ( 
            <Pressable
              style={[
                styles.row,
                { backgroundColor: item.read ? READ_BG_COLOR : UNREAD_BG_COLOR }, // <--- ¡CAMBIO AQUÍ!
              ]}
              onPress={() => openModal(item)}
            >
              <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
              <Text style={styles.message}>{item.title}</Text>
              {/* Eliminamos el punto rojo */}
              {/* {!item.read && (
                <IonIcon name="ellipse" size={10} color="red" style={styles.unreadDot} />
              )} */}
            </Pressable>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <IonIcon name="notifications-outline" size={80} color="#ccc" />
              <Text style={styles.emptyText}>
                Todavía no has recibido ninguna notificación.
              </Text>
            </View>
          }
        />

        {/* Modal de detalles */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={closeModal}
        >
          <Pressable style={styles.modalOverlay} onPress={closeModal}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{selectedNotification?.title}</Text>
              <Text style={styles.modalDetails}>{selectedNotification?.text}</Text>
              <Text style={styles.modalDate}>{selectedNotification?.createdAt ? formatDate(selectedNotification.createdAt) : ''}</Text>
            </View>
          </Pressable>
        </Modal>
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
  list: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    // Eliminamos readNotification y unreadNotification de los estilos específicos del row
    // Ya que el color de fondo se establecerá directamente en el Pressable
  },
  // Estos estilos ya no son necesarios porque el color se asigna directamente
  // unreadNotification: { },
  // readNotification: { opacity: 0.7, },
  unreadDot: { // Este estilo ya no se usa, pero se mantiene por si acaso
    marginLeft: 10,
  },
  date: {
    width: 60,
    fontWeight: 'bold',
    color: '#333',
  },
  message: {
    flex: 1,
    marginLeft: 12,
    color: '#333',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    marginTop: 16,
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFD740',
    borderRadius: 16,
    padding: 20,
    maxWidth: width - 40,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  modalDetails: {
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
    lineHeight: 20,
  },
  modalDate: {
    textAlign: 'right',
    color: '#333',
    fontSize: 12,
  },
  // Estilos para el indicador de carga
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: TEXT_COLOR,
  },
  // Estilos para el estado de error
  errorStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: PRIMARY_YELLOW,
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  retryButtonText: {
    color: TEXT_COLOR,
    fontSize: 16,
    fontWeight: '500',
  },
});
