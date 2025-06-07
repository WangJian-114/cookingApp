import { createStackNavigator } from '@react-navigation/stack';
import { ProfileScreen } from '../screens/profile/ProfileScreen';

export type RootStackParams = {
  Profile: undefined;
  Details: { recipeId: number };
}

const Stack = createStackNavigator<RootStackParams>();

export const ProfileStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{
      headerShown: true,
    }}>
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
};
