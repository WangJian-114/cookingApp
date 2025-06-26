// src/navigation/RootNavigator.tsx
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { AuthNavigator } from './AuthNavigator'
import { AppNavigator } from './AppNavigator'

export type RootStackParams = {
  Auth: undefined
  MainApp: undefined
}

const Stack = createNativeStackNavigator<RootStackParams>()

export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Auth"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Auth" component={AuthNavigator} />
      <Stack.Screen name="MainApp" component={AppNavigator} />
    </Stack.Navigator>
  )
}
