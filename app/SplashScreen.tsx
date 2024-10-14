import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import splashImage from '../assets/images/splash.png'; // Corrected import path

export default function SplashScreen() {
  const { width, height } = Dimensions.get('window');

  return (
    <View style={styles.container}>
      <Image
        source={splashImage}
        style={[styles.logo, { width: width * 0.8, height: height * 0.4 }]} // Adjust the size to fit screen dimensions
        resizeMode="contain" // Ensure the entire image is visible
      />
      <Text style={styles.text}>Och Spine at NewYork-Presbyterian Queens</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  logo: {
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
