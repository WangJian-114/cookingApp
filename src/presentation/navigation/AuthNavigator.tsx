import {
  createStackNavigator,
} from '@react-navigation/stack';

import {LoginScreen} from '../screens/auth/LoginScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { VerifyCodeScreen } from '../screens/auth/VerifyCodeScreen';
import { ResetPasswordScreen } from '../screens/auth/ResetPasswordScreen';

export type RootStackParams = {
  LoginScreen: undefined;
  ForgotPasswordScreen: undefined;
  VerifyCodeScreen:  { email: string };
  ResetPasswordScreen: { email: string; token: string };
};


const Stack = createStackNavigator<RootStackParams>();

export const AuthNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="LoginScreen"
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen
        name="LoginScreen"
        component={LoginScreen}
      />
      <Stack.Screen
        name="ForgotPasswordScreen"
        component={ForgotPasswordScreen}
      />
      <Stack.Screen
        name="VerifyCodeScreen"
        component={VerifyCodeScreen}
      />
      <Stack.Screen
        name="ResetPasswordScreen"
        component={ResetPasswordScreen}
      />
    </Stack.Navigator>
  );
};