import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FavoriteScreen } from '../screens/favorite/FavoriteScreen';
import { HomeScreen } from '../screens/home/HomeScreen';
import { RecipeScreen } from '../screens/recipe/RecipeScreen';
import { NotificationScreen } from '../screens/notification/NotificationScreen';

const Tab = createBottomTabNavigator();

export const BottomTabNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Favorite" component={FavoriteScreen} />
      <Tab.Screen name="Recipe" component={RecipeScreen} />
      <Tab.Screen name="Notification" component={NotificationScreen} />
    </Tab.Navigator>
  );
}