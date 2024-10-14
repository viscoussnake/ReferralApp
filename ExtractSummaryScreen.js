import React from 'react';
import { View, Text, Button, Image, StyleSheet } from 'react-native';

export default function ExtractSummaryScreen({ route, navigation }) {
  const { photo } = route.params;

  return (
    <View style={styles.container}>
      <Image source={{ uri: photo.uri }} style={styles.capturedImage} />
      <Text>Extracted Information:</Text>
      <Text>TODO: Implement text extraction here</Text>
      <Button title="Send" onPress={() => navigation.navigate('Camera')} />
      <Button title="Retake" onPress={() => navigation.navigate('Camera')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  capturedImage: {
    width: 300,
    height: 300,
    marginBottom: 20,
  },
});