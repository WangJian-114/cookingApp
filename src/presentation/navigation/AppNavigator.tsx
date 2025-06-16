import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/splashScreen/SplashScreen';
import LoginScreen from '../screens/login/LoginScreen';
import { SideMenuNavigator } from './SideMenuNavigator';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Splash" component={SplashScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Home" component={SideMenuNavigator} />
  </Stack.Navigator>
);
