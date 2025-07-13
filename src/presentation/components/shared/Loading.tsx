// src/components/Loading.js
import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

const Loading = ({ message = 'Cargando...' }) => (
  <View style={styles.container}>
    <ActivityIndicator size="large" />
    <Text style={styles.text}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white', // O poné tu color de fondo preferido
  },
  text: {
    marginTop: 16,
    fontSize: 18,
    color: '#666',
  },
});

export default Loading;
