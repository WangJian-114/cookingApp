import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/presentation/navigation/RootNavigator';

import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AuthProvider } from './src/contexts/AuthContext';
import { RecipesProvider } from './src/contexts/RecipesContext';
import { FavoritesProvider } from './src/contexts/FavoritesContext';
import { ProfileProvider } from './src/contexts/ProfileContext';
import { NotificationsProvider } from './src/contexts/NotificationsContext';
import { SearchProvider } from './src/contexts/SearchContext';
import { MyRecipesProvider } from './src/contexts/MyRecipesContext';


export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider>
        <SafeAreaProvider>
          <AuthProvider>
            <ProfileProvider>
              <RecipesProvider>
                <MyRecipesProvider>
                  <FavoritesProvider>
                    <SearchProvider>
                      <NotificationsProvider>
                        <NavigationContainer>
                          <RootNavigator />
                        </NavigationContainer>
                      </NotificationsProvider>
                    </SearchProvider>
                  </FavoritesProvider>
                </MyRecipesProvider>
              </RecipesProvider>
            </ProfileProvider>
          </AuthProvider>
        </SafeAreaProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
