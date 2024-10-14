import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Text, View } from 'react-native';
import emailjs from 'emailjs-com';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ManualEntryScreen() {
  const [formData, setFormData] = useState({
    doctorName: '',
    staffReferring: '',
    doctorPhone: '',
    doctorEmail: '',
    patientFirstName: '',
    patientLastName: '',
    patientPhone: '',
    reasonForConsult: '',
  });
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    AsyncStorage.getItem('@userEmail').then(email => {
      if (email) setUserEmail(email);
    });
  }, []);

  const handleSubmit = async () => {
    try {
      const templateParams = {
        to_email: 'insanaya@gmail.com', // Updated recipient email
        from_name: formData.doctorName,
        doctor_name: formData.doctorName,
        staff_referring: formData.staffReferring,
        doctor_phone: formData.doctorPhone,
        doctor_email: formData.doctorEmail,
        patient_first_name: formData.patientFirstName,
        patient_last_name: formData.patientLastName,
        patient_phone: formData.patientPhone,
        reason_for_consult: formData.reasonForConsult,
        user_email: userEmail, // Include user's email
      };

      const result = await emailjs.send(
        'service_uf5tnys',
        'template_kz1huqh',
        templateParams,
        'DXjwvu8TcPFZH_AZb'
      );
      console.log('Email sent successfully:', result.text);
      Alert.alert('Success', 'E-Consult submitted successfully');
      // Clear form after successful submission
      setFormData({
        doctorName: '',
        staffReferring: '',
        doctorPhone: '',
        doctorEmail: '',
        patientFirstName: '',
        patientLastName: '',
        patientPhone: '',
        reasonForConsult: '',
      });
    } catch (error) {
      console.error('Failed to submit e-consult:', error);
      Alert.alert('Error', 'Failed to submit e-consult');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>New Patient E-Consult from Doctor</Text>
      {Object.entries(formData).map(([key, value]) => (
        <TextInput
          key={key}
          style={key === 'reasonForConsult' ? [styles.input, styles.multilineInput] : styles.input}
          placeholder={`${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')} *`}
          placeholderTextColor="#666" // This will make the placeholder text dark grey
          value={value}
          onChangeText={(text) => setFormData({...formData, [key]: text})}
          multiline={key === 'reasonForConsult'}
          numberOfLines={key === 'reasonForConsult' ? 4 : 1}
          keyboardType={
            key.includes('Phone') ? 'phone-pad' : 
            key.includes('Email') ? 'email-address' : 
            'default'
          }
        />
      ))}
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
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
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  button: {
    backgroundColor: '#2e78b7',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});