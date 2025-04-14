import React from "react";
import { View, Text, StyleSheet, ActivityIndicator, Button, Alert, TextInput } from "react-native";
import { fetchPlaySessions, deletePlaySession } from "../services/firestoreDatabase";
import { FlatList } from "react-native-gesture-handler";
import { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";


export default function PlayHistoryPage() {
const [sessions, setSessions] = React.useState([]);
const [loading, setLoading] = React.useState(true);
const [filteredSessions, setFilteredSessions] = React.useState([]);
const[filterText, setFilterText] = React.useState("");

useEffect(() => {
  const loadSessions = async () => {
    try {
      const data = await fetchPlaySessions();
      // Sort by newest first
      const sorted = data.sort((a, b) => b.timestamp?.toDate() - a.timestamp?.toDate());
      setSessions(sorted);  // Set all sessions
      setFilteredSessions(sorted); // Initialize filtered sessions with all sessions
    } catch (err) {
      Alert.alert("Error", "Could not load play sessions.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  loadSessions();
}, []);

const handleFilter = (text) => {
  setFilterText(text);
  const filtered = sessions.filter((session) => 
    session.name.toLowerCase().includes(text.toLowerCase()) 
  );
  setFilteredSessions(filtered); // Set filtered sessions based on the input
};

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

const handleDelete = async (sessionId) => {
  try {
    await deletePlaySession(sessionId);  // Delete the session from Firestore
    setSessions(sessions.filter((session) => session.id !== sessionId)); 
    Alert.alert("Success", "Session deleted!");
  } catch (error) {
    Alert.alert("Error", "Could not delete session.");
    console.error(error);
  }
};



  return (
    <SafeAreaView style={{ flex: 1 }}>
    <View style={styles.container}>
      <Text style={styles.title}>Play Mode History</Text>

      <TextInput
      style={styles.filterInput}
      placeholder="Filter by player name"
      value={filterText}
      onChangeText={handleFilter}
      />

      {loading ? (
        <ActivityIndicator size="large"/>
      ) : sessions.length === 0 ? (
        <Text>No Play Sessions found</Text>
      ) : (
        <FlatList
        data={filteredSessions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id} />
      )}
    </View>
    </SafeAreaView>
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
  filterInput: {
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },


});
