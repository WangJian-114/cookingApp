// components/CustomHeader.tsx
import React from 'react';
import { View, Image, Pressable } from 'react-native';
import { IonIcon } from '../IonIcon';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { globalColors } from '../../../theme/theme';

export const Header = () => {
  const navigation = useNavigation();

  return (
    <View style={{
      backgroundColor: globalColors.brown,
      paddingHorizontal: 16,
      paddingVertical: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      {/* Logo */}
      <Image
        source={require('../../../../assets/cooking.png')} // Reemplaza con tu logo
        style={{ width: 40, height: 40, resizeMode: 'contain' }}
      />

      {/* Menu hamburguesa */}
      <Pressable
        onPress={() => navigation.dispatch( DrawerActions.toggleDrawer )}
        style={{ marginLeft: 5, marginRight: 10}}>
        <IonIcon name="menu-outline" color={globalColors
          .dark} />
      </Pressable>
    </View>
  );
};
