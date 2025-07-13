// src/navigation/RootNavigator.tsx
import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthNavigator } from './AuthNavigator';
import { AppNavigator } from './AppNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loading from '../components/shared/Loading';

export type RootStackParams = {
  Auth: undefined
  MainApp: undefined
}

const Stack = createNativeStackNavigator<RootStackParams>();

export default function RootNavigator() {

  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);

  useEffect(() => {
    // AsyncStorage.clear();

    const checkToken = async () => {
      const token = await AsyncStorage.getItem('ACCESS_TOKEN');
      setUserToken(token);
      setIsLoading(false);
    };
    checkToken();
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Stack.Navigator
      initialRouteName={userToken ? "MainApp" : "Auth"}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Auth" component={AuthNavigator} />
      <Stack.Screen name="MainApp" component={AppNavigator} />
    </Stack.Navigator>
  );
}
