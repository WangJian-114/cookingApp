import 'react-native-gesture-handler';

import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { BottomTabNavigator } from './presentation/navigation/BottomTabNavigator';
import { SideMenuNavigator } from './presentation/navigation/SideMenuNavigator';

const CookingApp = () => {
  return (
    <NavigationContainer>
      <SideMenuNavigator />
      {/* <BottomTabNavigator /> */}
    </NavigationContainer>
  );
};

export default CookingApp;
