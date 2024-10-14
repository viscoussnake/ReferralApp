import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Alert } from 'react-native';
import { Text } from '../components/Themed';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const [report, setReport] = useState('');

  useEffect(() => {
    generateReport();
  }, []);

  const generateReport = async () => {
    try {
      const successfulExtractions = await AsyncStorage.getItem('successfulExtractions');
      const successfulEmails = await AsyncStorage.getItem('successfulEmails');
      const mockReport = `Monthly Report\n
        Total Referrals: ${successfulEmails || 0}\n
        Successful Extractions: ${successfulExtractions || 0}\n
        Failed Extractions: ${(successfulExtractions && successfulEmails) ? (successfulExtractions - successfulEmails) : 0}`;
      setReport(mockReport);
    } catch (error) {
      console.error('Failed to generate report:', error);
      Alert.alert('Error', 'Failed to generate report');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={generateReport}>
        <Text style={styles.buttonText}>Generate Monthly Report</Text>
      </TouchableOpacity>
      {report ? (
        <View style={styles.reportContainer}>
          <Text style={styles.reportText}>{report}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  button: {
    backgroundColor: '#2e78b7',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  reportContainer: {
    marginTop: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
  },
  reportText: {
    fontSize: 14,
  },
});
