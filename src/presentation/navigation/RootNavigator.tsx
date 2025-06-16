// src/navigation/RootNavigator.tsx
import React from 'react';
import { AuthNavigator } from './AuthNavigator';
// import { BottomTabNavigator } from './BottomTabNavigator';
import { AppNavigator } from './AppNavigator';

// Simula autenticación
// const isAuthenticated = false; // Reemplaza con tu lógica (contexto, Redux, asyncStorage...)
const isAuthenticated = true; // Reemplaza con tu lógica (contexto, Redux, asyncStorage...)

export default function RootNavigator() {
  return isAuthenticated ? <AppNavigator /> : <AuthNavigator />;
}
