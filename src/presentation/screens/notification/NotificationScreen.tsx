// src/screens/notification/NotificationScreen.tsx
import React, { useState, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  FlatList,
  Text,
  Dimensions,
  RefreshControl,
  Modal,
  Pressable,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { IonIcon } from '../../components/shared/IonIcon';

type Notification = {
  id: string;
  date: string;
  message: string;
  details: string;
};

const notificationsMock: Notification[] = [
  { id: '1', date: '27/9', message: 'Receta Aprobada', details: '¡Tu receta ha sido aprobada! Ya puedes verla en tu perfil y compartirla con la comunidad.' },
  { id: '2', date: '20/9', message: 'Receta en Verificación', details: 'Tu receta está siendo revisada por nuestro equipo. Te avisaremos en breve.' },
  { id: '3', date: '18/8', message: 'Receta Rechazada', details: 'Lo sentimos, tu receta no cumple nuestros estándares. Revisa los lineamientos y vuelve a intentarlo.' },
  { id: '4', date: '10/7', message: '57 Likes en "Locro"', details: '¡57 personas le dieron like a tu receta de Locro! Gracias por compartir.' },
  { id: '5', date: '1/7',  message: 'Bienvenido', details: '¡Bienvenido a Cooking App! Empieza a explorar y compartir tus recetas favoritas.' },
];

const { width } = Dimensions.get('window');

export const NotificationScreen = () => {
  const [notifications, setNotifications] = useState(notificationsMock);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selected, setSelected] = useState<Notification | null>(null);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const openModal = (item: Notification) => {
    setSelected(item);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelected(null);
  };

  return (
    <LinearGradient
      colors={['rgba(233,163,0,0.9)', 'rgba(251,192,45,0.8)', 'rgba(255,255,255,0.6)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        {/* Listado */}
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => (
            <Pressable
              style={[
                styles.row,
                { backgroundColor: index % 2 === 0 ? '#FFD740' : '#E0E0E0' },
              ]}
              onPress={() => openModal(item)}
            >
              <Text style={styles.date}>{item.date}</Text>
              <Text style={styles.message}>{item.message}</Text>
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
              <Text style={styles.modalTitle}>{selected?.message}</Text>
              <Text style={styles.modalDetails}>{selected?.details}</Text>
              <Text style={styles.modalDate}>{selected?.date}</Text>
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
  },
  emptyText: {
    marginTop: 16,
    color: '#666',
    fontSize: 16,
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
});
