// src/navigation/AppNavigator.tsx
import React from 'react';
import { useWindowDimensions } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

import { BottomTabNavigator } from './BottomTabNavigator';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { ChangePasswordScreen } from '../screens/profile/ChangePasswordScreen';
import { RecipesStackNavigator } from './RecipesStackNavigator';
import { DetailsScreen } from '../screens/details/DetailsScreen';
import { IonIcon } from '../components/shared/IonIcon';
import { globalColors } from '../theme/theme';


export type RootStackParamList = {
  MainApp: undefined;
  DetailsScreen: { recipeId: string };
};

const Stack = createStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator();

const SideMenuNavigator = () => {
  const { width } = useWindowDimensions();

  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerType: width >= 758 ? 'permanent' : 'slide',
        drawerActiveBackgroundColor: globalColors.primary,
        drawerActiveTintColor: 'white',
        drawerInactiveTintColor: globalColors.primary,
        drawerItemStyle: { borderRadius: 100, paddingHorizontal: 20 },
      }}
    >
      <Drawer.Screen
        name="MainTabs"
        component={BottomTabNavigator}
        options={{
          title: 'Home',
          drawerIcon: ({ color, size }) => <IonIcon name="home-outline" color={color} size={size ?? 28} />,
        }}
      />
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          drawerIcon: ({ color, size }) => <IonIcon name="person-circle-outline" color={color} size={size ?? 28} />,
        }}
      />
      <Drawer.Screen
        name="Recipe"
        component={RecipesStackNavigator}
        options={{
          title: 'Mis Recetas',
          drawerIcon: ({ color, size }) => <IonIcon name="restaurant-outline" color={color} size={size ?? 28} />,
        }}
      />
    </Drawer.Navigator>
  );
};


export const AppNavigator = () => {
  return (
    <BottomSheetModalProvider>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="MainApp"
          component={SideMenuNavigator}
        />
        <Stack.Screen
          name="DetailsScreen"
          component={DetailsScreen}
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
       <Stack.Screen
         name="ChangePasswordScreen"
         component={ChangePasswordScreen}
         options={{
           presentation: 'modal',
          headerShown: false,
         }}
     />
      </Stack.Navigator>
    </BottomSheetModalProvider>
  );
};