import React, { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View } from 'react-native';
import SplashScreen from './SplashScreen';
import { Text } from 'react-native';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  useEffect(() => {
    // Reset app data before demo
    const resetAppData = async () => {
      try {
        await AsyncStorage.removeItem('@userEmail');
        await AsyncStorage.removeItem('@doctorName');
        await AsyncStorage.removeItem('@setupComplete');
        console.log('App data reset successfully.');
      } catch (error) {
        console.error('Failed to reset app data:', error);
      }
    };

    resetAppData();

    // Splash screen fade out after 3 seconds
    const splashTimeout = setTimeout(() => {
      setIsSplashVisible(false);
    }, 3000);

    // Get setup completion status
    AsyncStorage.getItem('@setupComplete')
      .then(value => {
        setIsSetupComplete(value === 'true');
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Failed to get setup status:', error);
        setIsLoading(false);
      });

    return () => clearTimeout(splashTimeout);
  }, []);

  if (isSplashVisible) {
    return <SplashScreen onSplashEnd={() => setIsSplashVisible(false)} />;
  }

  if (isLoading) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Loading...</Text></View>;
  }

  return isSetupComplete ? <Redirect href="/camera" /> : <Redirect href="/InitialSetup" />;
}