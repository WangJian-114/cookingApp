// src/navigation/BottomTabNavigator.tsx
import React, { useLayoutEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/home/HomeScreen';
import { FavoriteScreen } from '../screens/favorite/FavoriteScreen';
import { RecipeScreen } from '../screens/recipe/RecipeScreen';
import { NotificationScreen } from '../screens/notification/NotificationScreen';
import { useNavigation } from '@react-navigation/native';
import { Pressable } from 'react-native';
import { IonIcon } from '../components/shared/IonIcon';
import { globalColors } from '../theme/theme';

const Tab = createBottomTabNavigator();

export const BottomTabNavigator = () => {
  const navigation = useNavigation();

  // Inyectamos el icono de hamburguesa en el header de cada tab
  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Pressable
          onPress={() => navigation.toggleDrawer()}
          style={{ marginLeft: 16 }}
        >
          <IonIcon name="menu-outline" size={28} color={globalColors.primary} />
        </Pressable>
      ),
      headerStyle: { elevation: 0, shadowOpacity: 0, backgroundColor: 'transparent' },
    });
  }, [navigation]);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#ffbb2f',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: { borderTopWidth: 0, elevation: 0 },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
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
          tabBarIcon: ({ color, size }) => (
            <IonIcon name="heart-outline" color={color} size={size ?? 30} />
          ),
        }}
      />
      <Tab.Screen
        name="Recipe"
        component={RecipeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <IonIcon name="book-outline" color={color} size={size ?? 30} />
          ),
        }}
      />
      <Tab.Screen
        name="Notification"
        component={NotificationScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <IonIcon name="notifications-outline" color={color} size={size ?? 30} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
