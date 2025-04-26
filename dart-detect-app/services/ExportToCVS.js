import React from 'react';
import { Button, Platform, View, Text, StyleSheet } from 'react-native';
import { CSVLink } from 'react-csv';

const ExportToCSV = ({ sessions }) => {
  // Check if the platform is web
  if (Platform.OS !== 'web') {
    return null;
  }

  // Headers for the CSV
  const headers = [
    { label: 'Player Name', key: 'name' },
    { label: 'Total Score', key: 'totalScore' },
    { label: 'Average Score', key: 'averageScore' },
    { label: 'Rounds', key: 'rounds' },
    { label: 'Timestamp', key: 'timestamp' },
  ];

  // Map sessions 
  const data = sessions.map(session => ({
    name: session.name,
    totalScore: session.totalScore,
    averageScore: session.averageScore,
    rounds: session.rounds,
    timestamp: session.timestamp?.toDate().toLocaleString(),
  }));

  return (
    <View style={styles.exportButtonContainer}>
      <CSVLink data={data} headers={headers} filename="play_sessions.csv">
        <View style={styles.exportButton}>
          <Text style={styles.exportButtonText}>Export to CSV</Text>
        </View>
      </CSVLink>
    </View>
  );
};

const styles = StyleSheet.create({
  exportButtonContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  exportButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    width: 'auto',
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ExportToCSV;
