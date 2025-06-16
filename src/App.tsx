// App.js
import React from 'react';
// import { SideMenuNavigator } from './presentation/navigation/SideMenuNavigator';
// import { MainStackNavigator } from './presentation/navigation/MainStackNavigator';
import { Provider as PaperProvider } from 'react-native-paper';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './presentation/navigation/AppNavigator';

export default function App() {
  return (
    <PaperProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </PaperProvider>
  );
}

// App.js
// import React from 'react';
// import { Provider as PaperProvider } from 'react-native-paper';
// import TestGradientScreen from './presentation/screens/Test/testScreen';
//
// export default function App() {
//   return (
//     <PaperProvider>
//         <SafeAreaProvider>
//       <TestGradientScreen />
//         </SafeAreaProvider>
//      </PaperProvider>
//    );
//  }
