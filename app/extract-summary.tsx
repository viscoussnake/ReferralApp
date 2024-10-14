import React, { useEffect, useState } from 'react';
import { StyleSheet, Image, TouchableOpacity, View, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Text } from 'react-native';
import * as FileSystem from 'expo-file-system';
import emailjs from 'emailjs-com';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GOOGLE_CLOUD_VISION_API_URL = "https://vision.googleapis.com/v1/images:annotate?key=";
const API_KEY = 'AIzaSyDcSupETnctPG5n6JRCRV6n1huvpZZBiGo';

export default function ExtractSummaryScreen() {
  const { photoUris } = useLocalSearchParams();
  const [extractedTexts, setExtractedTexts] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userEmail, setUserEmail] = useState<string>('');
  const [doctorName, setDoctorName] = useState<string>('');

  useEffect(() => {
    if (photoUris) {
      const uris = JSON.parse(photoUris as string);
      extractTextsFromImages(uris);
    }
    AsyncStorage.getItem('@userEmail').then(email => {
      if (email) setUserEmail(email);
    });
    AsyncStorage.getItem('@doctorName').then(name => {
      if (name) setDoctorName(name);
    });
  }, [photoUris]);

  const convertToBase64 = async (uri: string) => {
    try {
      return await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
    } catch (error) {
      console.error('Error converting image to base64:', error);
      throw error;
    }
  };

  const extractTextsFromImages = async (uris: string[]) => {
    setLoading(true);
    try {
      const extractedTextsArray = [];
      for (const uri of uris) {
        const base64Image = await convertToBase64(uri);
        const requestBody = {
          requests: [
            {
              image: {
                content: base64Image,
              },
              features: [
                {
                  type: 'TEXT_DETECTION',
                },
              ],
            },
          ],
        };

        const response = await fetch(`${GOOGLE_CLOUD_VISION_API_URL}${API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Response not OK:', errorText);
          throw new Error(`Error response from Google Vision API: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        console.log('Full response from Google Vision API:', JSON.stringify(result, null, 2));

        if (result.responses && result.responses[0] && result.responses[0].fullTextAnnotation) {
          const text = result.responses[0].fullTextAnnotation.text || 'No text found';
          extractedTextsArray.push(text);
        } else {
          extractedTextsArray.push('No text found');
        }
      }
      setExtractedTexts(extractedTextsArray);
      await incrementSuccessfulExtractions(uris.length);
    } catch (error) {
      console.error('Failed to extract text with Google Vision API:', error);
      setExtractedTexts(['Failed to extract text']);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    console.log('Sending referral...');
    const combinedExtractedText = extractedTexts.join('\n\n');
    emailjs.send(
      'service_uf5tnys',
      'template_wd0lta7',
      {
        to_email: 'insanaya@gmail.com',
        subject: 'Extracted Text from Images',
        message: combinedExtractedText,
        user_email: userEmail,
        doctor_name: doctorName,
      },
      'DXjwvu8TcPFZH_AZb'
    ).then(async (result) => {
      console.log('Email sent successfully:', result.text);
      await incrementSuccessfulEmails();
      Alert.alert('Success', 'Email sent successfully');
    }).catch((error) => {
      console.error('Failed to send email:', error);
      Alert.alert('Error', 'Failed to send email');
    });
  };

  const incrementSuccessfulExtractions = async (count: number) => {
    try {
      const currentCount = await AsyncStorage.getItem('successfulExtractions');
      const newCount = currentCount ? parseInt(currentCount) + count : count;
      await AsyncStorage.setItem('successfulExtractions', newCount.toString());
    } catch (error) {
      console.error('Failed to update successful extractions count:', error);
    }
  };

  const incrementSuccessfulEmails = async () => {
    try {
      const count = await AsyncStorage.getItem('successfulEmails');
      const newCount = count ? parseInt(count) + 1 : 1;
      await AsyncStorage.setItem('successfulEmails', newCount.toString());
    } catch (error) {
      console.error('Failed to update successful emails count:', error);
    }
  };

  const handleRetake = () => {
    router.back();
  };

  const handleGoToSettings = async () => {
    try {
      const extractionsCount = await AsyncStorage.getItem('successfulExtractions');
      const emailsCount = await AsyncStorage.getItem('successfulEmails');
      Alert.alert('Statistics', `Successful Extractions: ${extractionsCount || 0}
Successful Emails: ${emailsCount || 0}`, [
        {
          text: 'Erase Statistics',
          onPress: handleEraseStatistics,
          style: 'destructive'
        },
        {
          text: 'Email Report',
          onPress: handleEmailReport,
        },
        {
          text: 'OK',
          style: 'cancel'
        }
      ]);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
      Alert.alert('Error', 'Failed to fetch statistics');
    }
  };

  const handleEraseStatistics = async () => {
    try {
      await AsyncStorage.removeItem('successfulExtractions');
      await AsyncStorage.removeItem('successfulEmails');
      await AsyncStorage.removeItem('referrals');
      await AsyncStorage.removeItem('photos');
      Alert.alert('Success', 'Statistics erased successfully');
    } catch (error) {
      console.error('Failed to erase statistics:', error);
      Alert.alert('Error', 'Failed to erase statistics');
    }
  };

  const handleEmailReport = async () => {
    try {
      const referrals = await AsyncStorage.getItem('referrals');
      const patientList = referrals ? JSON.parse(referrals) : [];
      const patientNames = patientList.map(referral => referral.patientName).join(', ');
      const extractionsCount = await AsyncStorage.getItem('successfulExtractions');
      const emailsCount = await AsyncStorage.getItem('successfulEmails');

      emailjs.send(
        'service_uf5tnys',
        'template_6mxvo5b',
        {
          to_email: 'insanaya@gmail.com',
          subject: 'Referral Report',
          doctor_name: doctorName || 'Unknown Doctor',
          referrals: emailsCount || '0',
          patient_names: patientNames || 'No patients referred',
          message: 'This is your requested referral report.',
        },
        'DXjwvu8TcPFZH_AZb'
      ).then((result) => {
        console.log('Referral report sent successfully:', result.text);
        Alert.alert('Success', 'Referral report sent successfully');
      }).catch((error) => {
        console.error('Failed to send referral report:', error);
        Alert.alert('Error', 'Failed to send referral report');
      });
    } catch (error) {
      console.error('Failed to email report:', error);
      Alert.alert('Error', 'Failed to email report');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        extractedTexts.map((text, index) => (
          <View key={index} style={styles.textContainer}>
            <Text style={styles.text}>Extracted Information from Image {index + 1}:</Text>
            <Text>{text}</Text>
          </View>
        ))
      )}
      <TouchableOpacity style={styles.button} onPress={handleSend}>
        <Text style={styles.buttonText}>Send</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleRetake}>
        <Text style={styles.buttonText}>Retake</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleGoToSettings}>
        <Text style={styles.buttonText}>Referral Report</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleEraseStatistics}>
        <Text style={styles.buttonText}>Erase Statistics</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  textContainer: {
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#2e78b7',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});