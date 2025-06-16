
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/login/LoginScreen';
import HomeScreen from '../screens/home/HomeScreen';

const Stack = createNativeStackNavigator();

export const AuthNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Home" component={HomeScreen} />
  </Stack.Navigator>
);
