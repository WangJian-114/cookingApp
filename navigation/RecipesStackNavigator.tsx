// src/navigation/RecipesStackNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { RecipesListScreen } from '../screens/recipe/RecipeListScreen';
import { RecipeEditScreen } from '../screens/recipe/RecipeEditScreen';

export type RecipesStackParamList = {
  RecipesList: undefined;
  RecipeEdit: { recipeId: string };
};

const Stack = createStackNavigator<RecipesStackParamList>();

export const RecipesStackNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="RecipesList"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="RecipesList"
        component={RecipesListScreen}
      />
      <Stack.Screen
        name="RecipeEdit"
        component={RecipeEditScreen}
      />
    </Stack.Navigator>
  );
};