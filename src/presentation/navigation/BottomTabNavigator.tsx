/* eslint-disable react/no-unstable-nested-components */
// src/navigation/BottomTabNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FavoriteScreen } from '../screens/favorite/FavoriteScreen';
import { NotificationScreen } from '../screens/notification/NotificationScreen';
import { IonIcon } from '../components/shared/IonIcon';
import { HomeStackNavigator } from './HomeStackNavigator';

import { RecipeScreen } from '../screens/recipe/RecipeScreen';


const Tab = createBottomTabNavigator();

export const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#ffbb2f',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: { borderTopWidth: 0, elevation: 0 },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <IonIcon name="home-outline" color={color} size={size ?? 30} />
          ),
        }}
      />
      <Tab.Screen
        name="Favorite"
        component={FavoriteScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <IonIcon name="heart-outline" color={color} size={size ?? 30} />
          ),
        }}
      />

      <Tab.Screen
        name="Recipe"
        component={RecipeScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <IonIcon name="book-outline" color={color} size={size ?? 30} />
          ),
        }}
      />

      <Tab.Screen
        name="Notification"
        component={NotificationScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <IonIcon name="notifications-outline" color={color} size={size ?? 30} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};