import React from "react";
import { View, Text, StyleSheet, ActivityIndicator, Button, Alert } from "react-native";
import { fetchPlaySessions } from "../services/firestoreDatabase";
import { FlatList } from "react-native-gesture-handler";
import { useEffect } from "react";


export default function PlayHistoryPage() {
const [sessions, setSessions] = React.useState([]);
const [loading, setLoading] = React.useState(true);

useEffect(() => {
  const loadSessions = async () => {
    try {
      const data = await fetchPlaySessions();
      // Sort by newest first
      const sorted = data.sort((a, b) => b.timestamp?.toDate() - a.timestamp?.toDate());
      setSessions(sorted);
    } catch (err) {
      Alert.alert("Error", "Could not load play sessions.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  loadSessions();
}, []);

const renderItem = ({ item }) => (
  <View style={styles.sessionItem}>
    <Text style={styles.sessionText}>{item.name}</Text>
    <Text>Total Score: {item.totalScore}</Text>
    <Text>Avg: {item.averageScore} | Rounds: {item.rounds}</Text>
    <Text style={styles.timestamp}>
      {item.timestamp?.toDate().toLocaleString()}
    </Text>
    <Button title="Delete" onPress={() => handleDelete(item.id)} />
  </View>
);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Play Mode History</Text>
      {loading ? (
        <ActivityIndicator size="large"/>
      ) : sessions.length === 0 ? (
        <Text>No Play Sessions found</Text>
      ) : (
        <FlatList
        data={sessions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  sessionText: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: "#666",
    marginTop: 6,
  },
  sessionItem: {
    padding: 12,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
});
