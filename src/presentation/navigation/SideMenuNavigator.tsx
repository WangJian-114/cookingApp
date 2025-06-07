import { useWindowDimensions } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { IonIcon } from '../components/shared/IonIcon';
import { BottomTabNavigator } from './BottomTabNavigator';
import { globalColors } from '../theme/theme';
import { ProfileStackNavigator } from './ProfileStackNavigator';


const Drawer = createDrawerNavigator();

export const SideMenuNavigator = () => {
  const dimensions = useWindowDimensions();

  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerType: dimensions.width >= 758 ? 'permanent' : 'slide',
        drawerActiveBackgroundColor: globalColors.primary,
        drawerActiveTintColor: 'white',
        drawerInactiveTintColor: globalColors.primary,
        drawerItemStyle: {
          borderRadius: 100,
          paddingHorizontal: 20,
        },
      }}
    >
      <Drawer.Screen
        options={{ drawerIcon: ({color}) => (<IonIcon name="home-outline" color={color} />) }}
        name="Home"
        component={BottomTabNavigator} />
      <Drawer.Screen
        options={{ drawerIcon: ({color}) => (<IonIcon name="person-circle-outline" color={color} />) }}
        name="Profile"
        component={ProfileStackNavigator} />
    </Drawer.Navigator>
  );
};
