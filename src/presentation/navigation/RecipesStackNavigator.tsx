import { createStackNavigator } from '@react-navigation/stack';
import { DetailsScreen } from '../screens/details/DetailsScreen';

export type RootStackParams = {
  Profile: undefined;
  Details: { recipeId: number };
}

const Stack = createStackNavigator<RootStackParams>();

export const StackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{
      headerShown: false,
    }}>
      <Stack.Screen name="Details" component={DetailsScreen} />
    </Stack.Navigator>
  );
};
