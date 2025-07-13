import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const PRIMARY_COLOR = '#FDBA74';
const STAR_COLOR = '#FFC700';

// Barra de distribución de cada calificación (5★→1★)
const RatingBar = ({ stars, count, total }) => {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  return (
    <View style={styles.barContainer}>
      <Text style={styles.barLabel}>{stars} ★</Text>
      <View style={styles.barBackground}>
        <View style={[styles.barForeground, { width: `${percentage}%` }]} />
      </View>
      <Text style={styles.barCount}>({count})</Text>
    </View>
  );
};

// Muestra promedio general en estrellas
const StarDisplay = ({ rating, size = 16 }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    let name = 'star-outline';
    if (i <= rating) name = 'star';
    else if (i - 0.5 <= rating) name = 'star-half-sharp';
    stars.push(<Icon key={i} name={name} color={STAR_COLOR} size={size} />);
  }
  return <View style={{ flexDirection: 'row' }}>{stars}</View>;
};

export const RatingModal = ({
  isVisible,
  onClose,
  ratingData: { count, average, distribution, userRating: initialUserRating },
  onSubmit
}) => {
  // State interno inicializado con la calificación del usuario (si existe)
  const [selectedStars, setSelectedStars] = useState<number>(initialUserRating ?? 0);

  // Sincroniza si initialUserRating cambia tras montarse
  useEffect(() => {
    setSelectedStars(initialUserRating ?? 0);
  }, [initialUserRating]);

  const handleSubmit = () => {
    if (selectedStars === 0) {
      Alert.alert('Sin calificación', 'Por favor, selecciona de 1 a 5 estrellas.');
      return;
    }
    onSubmit(selectedStars);
    onClose();
  };

  const totalRatings = count ?? 0;

  return (
    <Modal
      transparent={true}
      visible={isVisible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalContainer}>
          <Text style={styles.title}>Calificación Global</Text>

          {/* Promedio General */}
          <View style={styles.averageContainer}>
            <Text style={styles.averageRating}>{average?.toFixed(1)}</Text>
            <StarDisplay rating={average} size={22} />
            <Text style={styles.totalCount}>({totalRatings})</Text>
          </View>

          {/* Distribución de Calificaciones */}
          <View style={styles.distributionContainer}>
            {[5, 4, 3, 2, 1].map(star => {
              const bucket = distribution?.find(d => d.star === star);
              const c = bucket?.count ?? 0;
              return (
                <RatingBar key={star} stars={star} count={c} total={count} />
              );
            })}
          </View>

          <Text style={styles.subtitle}>Tu calificación</Text>

          {/* Input de Estrellas del Usuario */}
          <View style={styles.userRatingContainer}>
            {[1, 2, 3, 4, 5].map(star => (
              <TouchableOpacity key={star} onPress={() => setSelectedStars(star)}>
                <Icon
                  name={star <= selectedStars ? 'star' : 'star-outline'}
                  size={36}
                  color={STAR_COLOR}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Botón de Calificar */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Calificar</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#F5EFE6',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  averageContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  averageRating: { fontSize: 24, fontWeight: 'bold', color: '#333', marginRight: 8 },
  totalCount: { fontSize: 16, color: '#666', marginLeft: 8 },
  distributionContainer: { width: '100%', backgroundColor: '#FFF', borderRadius: 12, padding: 15, marginBottom: 20 },
  barContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  barLabel: { width: '15%', fontSize: 14, color: '#666' },
  barBackground: { flex: 1, height: 8, backgroundColor: '#E0E0E0', borderRadius: 4, marginRight: 8 },
  barForeground: { height: '100%', backgroundColor: STAR_COLOR, borderRadius: 4 },
  barCount: { fontSize: 12, color: '#666' },
  subtitle: { fontSize: 18, color: '#333', marginBottom: 10 },
  userRatingContainer: { width: '80%', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25, paddingHorizontal: 10 },
  submitButton: { backgroundColor: STAR_COLOR, borderRadius: 25, paddingVertical: 12, paddingHorizontal: 50, elevation: 2 },
  submitButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});
