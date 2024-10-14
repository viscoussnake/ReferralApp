import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function SettingsScreen() {
  const [report, setReport] = useState('');

  const generateReport = () => {
    // Mock report generation
    const mockReport = `Monthly Report\n
    Total Referrals: 25\n
    Successful Extractions: 22\n
    Failed Extractions: 3`;
    setReport(mockReport);
  };

  return (
    <View style={styles.container}>
      <Button title="Generate Monthly Report" onPress={generateReport} />
      {report ? <Text style={styles.report}>{report}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  report: {
    marginTop: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: 'gray',
  },
});