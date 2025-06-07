import 'react-native-gesture-handler';

import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { SideMenuNavigator } from './presentation/navigation/SideMenuNavigator';
import { MainStackNavigator } from './presentation/navigation/MainStackNavigator';

const CookingApp = () => {
  return (
    <NavigationContainer>
      {/* <SideMenuNavigator /> */}
      <MainStackNavigator />
    </NavigationContainer>
  );
};

export default CookingApp;
