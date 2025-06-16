import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Header } from '../../components/shared/header/Header';
import LinearGradient from 'react-native-linear-gradient';
import { BackButton } from '../../components/shared/BackButton';

export const FilterScreen = () => {
  const navigation = useNavigation();

  return (
    <LinearGradient
      colors={['rgba(233,163,0,0.9)', 'rgba(251,192,45,0.8)', 'rgba(255,255,255,0.6)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradient}
    >
    <SafeAreaView style={{ flex: 1 }}>
      <Header />
      <BackButton onPress={() => navigation.goBack()} />
      <Text>FilterScreen</Text>
    </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
});
