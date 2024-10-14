import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { CameraView, CameraProps, useCameraPermissions } from 'expo-camera';
import { router, Link } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import emailjs from 'emailjs-com';

export default function CameraScreen() {
  const cameraRef = useRef<CameraView | null>(null);
  const [facing, setFacing] = useState<CameraProps["facing"]>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text>We need your permission to show the camera</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        console.log('Picture taken:', photo);
        setPhotos(prevPhotos => [...prevPhotos, photo.uri]);
        await AsyncStorage.setItem('photos', JSON.stringify([...photos, photo.uri]));
      } catch (error) {
        console.error('Failed to take picture:', error);
      }
    }
  };

  const goToManualEntry = () => {
    router.push('/manual-entry');
  };

  const goToInitialSetup = () => {
    router.push('/InitialSetup');
  };

  const handleGoToSettings = async () => {
    try {
      const doctorName = await AsyncStorage.getItem('@doctorName');
      const extractionsCount = await AsyncStorage.getItem('successfulExtractions');
      const emailsCount = await AsyncStorage.getItem('successfulEmails');
      const referrals = await AsyncStorage.getItem('referrals');
      const manualEntries = await AsyncStorage.getItem('manualEntries');
      const patientList = referrals ? JSON.parse(referrals) : [];
      const manualPatientList = manualEntries ? JSON.parse(manualEntries) : [];
      const allPatients = [...patientList, ...manualPatientList];
      const patientNames = allPatients.map(referral => referral.patientName).join(', ');

      Alert.alert('Statistics', `Successful Extractions: ${extractionsCount || 0}
Successful Emails: ${emailsCount || 0}`, [
        {
          text: 'Erase Statistics',
          onPress: handleEraseStatistics,
          style: 'destructive'
        },
        {
          text: 'Email Report',
          onPress: () => handleEmailReport(doctorName, emailsCount, patientNames),
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
      await AsyncStorage.removeItem('manualEntries');
      await AsyncStorage.removeItem('photos');
      setPhotos([]);
      Alert.alert('Success', 'Statistics erased successfully');
    } catch (error) {
      console.error('Failed to erase statistics:', error);
      Alert.alert('Error', 'Failed to erase statistics');
    }
  };

  const handleEmailReport = async (doctorName, referralsCount, patientNames) => {
    try {
      const userEmail = await AsyncStorage.getItem('@userEmail');
      const toEmails = `${userEmail}, insanaya@gmail.com`; // Replace 'insanaya@gmail.com' with your own email

      emailjs.send(
        'service_uf5tnys',
        'template_6mxvo5b',
        {
          doctor_name: doctorName || 'Unknown Doctor',
          referrals: referralsCount || '0',
          patient_names: patientNames || 'No patients referred',
          message: 'This is your requested referral report.',
          to_email: toEmails,
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

  const handleExtractAllPhotos = async () => {
    try {
      const storedPhotos = await AsyncStorage.getItem('photos');
      const photoUris = storedPhotos ? JSON.parse(storedPhotos) : [];
      if (photoUris.length === 0) {
        Alert.alert('No Photos', 'No photos to extract. Please take some pictures first.');
        return;
      }
      await AsyncStorage.removeItem('photos'); // Clear photos after extraction
      setPhotos([]);
      router.push({ pathname: '/extract-summary', params: { photoUris: JSON.stringify(photoUris) } });
    } catch (error) {
      console.error('Failed to extract all photos:', error);
      Alert.alert('Error', 'Failed to extract all photos');
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        ref={cameraRef}
      >
        <View style={styles.topButtonContainerRow}>
          <Link href="/change-email" asChild>
            <TouchableOpacity style={styles.topButtonRow}>
              <Text style={styles.topButtonText}>Change Email</Text>
            </TouchableOpacity>
          </Link>
          <TouchableOpacity style={styles.topButtonRow} onPress={goToInitialSetup}>
            <Text style={styles.topButtonText}>New License</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.topButtonRow} onPress={handleGoToSettings}>
            <Text style={styles.topButtonText}>Referral Report</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonContainerGrid}>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.buttonGrid} onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}>
              <Text style={styles.buttonText}>Flip Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonGrid} onPress={takePicture}>
              <Text style={styles.buttonText}>Take Picture</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.buttonGrid} onPress={goToManualEntry}>
              <Text style={styles.buttonText}>Manual Entry</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonGrid} onPress={handleExtractAllPhotos}>
              <Text style={styles.buttonText}>Extract All Photos</Text>
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  camera: {
    flex: 1,
  },
  topButtonContainerRow: {
    position: 'absolute',
    top: 60, // Adjusted to prevent interaction with the iPhone header bar
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topButtonRow: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5, // Added margin to give some spacing between buttons
    alignItems: 'center',
  },
  topButtonText: {
    color: 'white',
    fontSize: 14,
  },
  buttonContainerGrid: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    marginVertical: 10,
  },
  buttonGrid: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 15,
    borderRadius: 5,
    width: '40%',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: 'black',
    fontWeight: 'bold',
  },
});