import 'react-native-gesture-handler';

import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { BottomTabNavigator } from './presentation/navigation/BottomTabNavigator';

const CookingApp = () => {
  return (
    <NavigationContainer>
      <BottomTabNavigator />
    </NavigationContainer>
  );
};

export default CookingApp;
