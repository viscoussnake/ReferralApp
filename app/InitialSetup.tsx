import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

export default function InitialSetup() {
  const [email, setEmail] = useState('');
  const [license, setLicense] = useState('');
  const [doctorName, setDoctorName] = useState('');

  const handleSubmit = async () => {
    if (!email || !license || !doctorName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (license.length < 8) {
      Alert.alert('Error', 'Invalid license key');
      return;
    }

    try {
      await AsyncStorage.setItem('@userEmail', email);
      await AsyncStorage.setItem('@license', license);
      await AsyncStorage.setItem('@doctorName', doctorName);
      await AsyncStorage.setItem('@setupComplete', 'true');
      router.replace('/camera');
    } catch (e) {
      console.error('Error during setup:', e);
      Alert.alert('Error', 'Failed to save data. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Initial Setup</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        placeholderTextColor="#665"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Enter license key"
        placeholderTextColor="#665"
        value={license}
        onChangeText={setLicense}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Enter doctor's name"
        placeholderTextColor="#665"
        value={doctorName}
        onChangeText={setDoctorName}
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2e78b7',
  },
  input: {
    height: 40,
    borderColor: '#2e78b7',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: 'white',
  },
  button: {
    backgroundColor: '#2e78b7',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});