import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

export default function ChangeEmailScreen() {
  const [doctorName, setDoctorName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    AsyncStorage.getItem('@doctorName').then(name => name && setDoctorName(name));
    AsyncStorage.getItem('@userEmail').then(userEmail => userEmail && setEmail(userEmail));
  }, []);

  const handleSubmit = async () => {
    if (!doctorName.trim() || !email.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    try {
      await AsyncStorage.setItem('@doctorName', doctorName);
      await AsyncStorage.setItem('@userEmail', email);
      Alert.alert('Success', 'Information updated successfully');
      router.back();
    } catch (error) {
      console.error('Failed to update information:', error);
      Alert.alert('Error', 'Failed to update information');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter Doctor's Name"
        placeholderTextColor="#666"
        value={doctorName}
        onChangeText={setDoctorName}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter Your New Email"
        placeholderTextColor="#666"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit New Email</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => router.back()}>
        <Text style={styles.buttonText}>Back to Camera</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: '#2e78b7',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});