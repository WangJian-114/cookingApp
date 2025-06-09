/* eslint-disable react/no-unstable-nested-components */
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FavoriteScreen } from '../screens/favorite/FavoriteScreen';
import { HomeScreen } from '../screens/home/HomeScreen';
import { RecipeScreen } from '../screens/recipe/RecipeScreen';
import { NotificationScreen } from '../screens/notification/NotificationScreen';
import { IonIcon } from '../components/shared/IonIcon';
import { globalColors } from '../theme/theme';

const Tab = createBottomTabNavigator();

export const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: globalColors.primary,
        // headerShown: false,
        tabBarLabelStyle: {
          marginBottom: 5,
        },
        headerStyle: {
          elevation: 0,
          borderColor: 'transparent',
          shadowColor: 'transparent',
        },
        tabBarStyle: {
          borderTopWidth: 0,
          elevation: 0,
        },
         tabBarShowLabel: false,
         tabBarActiveTintColor: '#ffbb2f',
         tabBarInactiveTintColor: '#888',
         tabBarStyle: {
                   borderTopWidth: 0,
                   elevation: 0,
                 },
      }}
    >
      <Tab.Screen
        name="Home"
        options={{ tabBarIcon: ({ color }) => (<IonIcon name="home-outline" color={color} size={25} />) }}
        component={HomeScreen}
      />
      <Tab.Screen
        name="Favorite"
        options={{ tabBarIcon: ({ color }) => (<IonIcon name="heart-outline" color={color} size={25} />) }}
        component={FavoriteScreen}
      />
      <Tab.Screen
        name="Recipe"
        options={{ tabBarIcon: ({ color }) => (<IonIcon name="book-outline" color={color} size={25} />) }}
        component={RecipeScreen}
      />
      <Tab.Screen
        name="Notification"
        options={{ tabBarIcon: ({ color }) => (<IonIcon name="notifications-outline" color={color} size={25} />) }}
        component={NotificationScreen}
      />
    </Tab.Navigator>
  );
};
