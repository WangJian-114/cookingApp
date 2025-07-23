// src/navigation/RootNavigator.tsx
import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthNavigator } from './AuthNavigator';
import { AppNavigator } from './AppNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loading from '../components/shared/Loading';
import { useAuth } from '../../contexts/AuthContext';

export type RootStackParams = {
  Auth: undefined
  MainApp: undefined
}

const Stack = createNativeStackNavigator<RootStackParams>();

export default function RootNavigator() {
  const { userToken, loading } = useAuth();
  if (loading) {
    return <Loading />;
  }

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
    >
      {userToken ? (
        <Stack.Screen name="MainApp" component={AppNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}
