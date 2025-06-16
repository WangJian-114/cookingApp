// src/navigation/SideMenuNavigator.tsx
import React from 'react';
import { useWindowDimensions } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { BottomTabNavigator } from './BottomTabNavigator';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { IonIcon } from '../components/shared/IonIcon';
import { globalColors } from '../theme/theme';
import { ProfileStackNavigator } from './ProfileStackNavigator';

const Drawer = createDrawerNavigator();

export const SideMenuNavigator = () => {
  const { width } = useWindowDimensions();

  return (
    <Drawer.Navigator
      screenOptions={{
        // Despliega permanente en pantallas anchas
        headerShown: false,
        drawerType: width >= 758 ? 'permanent' : 'slide',
        drawerActiveBackgroundColor: globalColors.primary,
        drawerActiveTintColor: 'white',
        drawerInactiveTintColor: globalColors.primary,
        drawerItemStyle: { borderRadius: 100, paddingHorizontal: 20 },
      }}
    >
      {/* Este screen envuelve TODO tu Bottom Tabs */}
      <Drawer.Screen
        name="MainTabs"
        component={BottomTabNavigator}
        options={{
          title: 'Home',
          drawerIcon: ({ color, size }) => (
            <IonIcon name="home-outline" color={color} size={size ?? 28} />
          ),
        }}
      />

      {/* Este screen va SIN bottom tabs */}
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          drawerIcon: ({ color, size }) => (
            <IonIcon name="person-circle-outline" color={color} size={size ?? 28} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};
