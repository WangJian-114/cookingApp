// src/presentation/components/shared/details/ServingsSelector.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Pressable, TextInput, Alert } from 'react-native';

const PRIMARY_COLOR = '#FDBA74';
const TEXT_COLOR = '#44403C';

export const ServingsSelector = ({ isVisible, onClose, onSelect }) => {
  const servingOptions = [1, 2, 3, 4, 5, 6];

  const [customAmount, setCustomAmount] = useState('');

  const handlePredefinedSelect = (servings) => {
    onSelect(servings);
    setCustomAmount('');
    onClose();
  };

  const handleCustomApply = () => {
    const amount = parseInt(customAmount, 10);

    if (!isNaN(amount) && amount > 0) {
      onSelect(amount);
      setCustomAmount('');
      onClose();
    } else {
      Alert.alert('Cantidad inválida', 'Por favor, ingresa un número válido y mayor a cero.');
    }
  };

  return (
    <Modal
      transparent={true}
      visible={isVisible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalContainer}>
          <Text style={styles.title}>Elegí la cantidad de raciones</Text>

          {/* Botones predefinidos */}
          <View style={styles.buttonGrid}>
            {servingOptions.map(option => (
              <TouchableOpacity key={option} style={styles.optionButton} onPress={() => handlePredefinedSelect(option)}>
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.separator} />

          <Text style={styles.subtitle}>O ingresa una cantidad</Text>
          <View style={styles.customInputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Ej: 10"
              placeholderTextColor="#999"
              keyboardType="number-pad"
              value={customAmount}
              onChangeText={setCustomAmount}
            />
            <TouchableOpacity style={styles.applyButton} onPress={handleCustomApply}>
              <Text style={styles.applyButtonText}>Aplicar</Text>
            </TouchableOpacity>
          </View>

        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    modalContainer: {
        backgroundColor: '#FEFBF6',
        borderRadius: 15,
        padding: 25,
        width: '85%',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        zIndex: 9999,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        color: TEXT_COLOR,
    },
    buttonGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    optionButton: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: PRIMARY_COLOR,
        borderRadius: 8,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 6,
    },
    optionText: {
        color: PRIMARY_COLOR,
        fontWeight: 'bold',
        fontSize: 16,
    },
    separator: {
        height: 1,
        width: '90%',
        backgroundColor: '#E0E0E0',
        marginVertical: 20,
    },
    subtitle: {
        fontSize: 16,
        color: TEXT_COLOR,
        marginBottom: 15,
    },
    customInputContainer: {
        flexDirection: 'row',
        width: '100%',
    },
    textInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#CCC',
        borderRadius: 8,
        paddingHorizontal: 15,
        marginRight: 10,
        fontSize: 16,
        textAlign: 'center',
    },
    applyButton: {
        backgroundColor: PRIMARY_COLOR,
        paddingHorizontal: 20,
        justifyContent: 'center',
        borderRadius: 8,
    },
    applyButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    }
});