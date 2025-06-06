// src/screens/TestGradientScreen.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

export default function TestGradientScreen() {
  return (
    <LinearGradient
      colors={['#E9A300', '#FBC02D', '#FFF59D']} // ~Dorado intenso → Amarillo intenso → Amarillo claro
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradientContainer}
    >
      <View style={styles.centerBox}>
        <Text style={styles.text}>✅ Degradado tipo Figma</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerBox: {
    backgroundColor: 'rgba(255,255,255,0.4)',
    padding: 16,
    borderRadius: 12,
  },
  text: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
