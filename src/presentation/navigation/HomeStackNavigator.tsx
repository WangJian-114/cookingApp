import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen } from '../screens/home/HomeScreen';
import { FilterScreen } from '../screens/filter/FilterScreen';

export type RootStackParams = {
  homeScreen: undefined;
  filter: undefined;
}

const Stack = createStackNavigator<RootStackParams>();

export const HomeStackNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="homeScreen"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="homeScreen" component={HomeScreen} />
      <Stack.Screen name="filter" component={FilterScreen} />
    </Stack.Navigator>
  );
};
