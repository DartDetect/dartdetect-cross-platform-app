import React from "react";
import { View, Text, StyleSheet, ActivityIndicator, Button, Alert, TextInput } from "react-native";
import { fetchPlaySessions, deletePlaySession } from "../services/firestoreDatabase";
import { FlatList } from "react-native-gesture-handler";
import { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { RefreshControl } from "react-native-gesture-handler";
import ExportToCSV from "../services/ExportToCVS";


export default function PlayHistoryPage() {
  const [sessions, setSessions] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [filteredSessions, setFilteredSessions] = React.useState([]);
  const [filterText, setFilterText] = React.useState("");

  const [refreshing, setRefreshing] = React.useState(false);


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

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSessions();
    setRefreshing(false);
  };

  useEffect(() => {
    loadSessions(); // Load sessions 
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
      <View style={styles.buttonWrapper}>
        <Button title="Delete" onPress={() => handleDelete(item.id)} />
      </View>
    </View>

  );

  const handleDelete = async (sessionId) => {
    try {
      await deletePlaySession(sessionId);  // Delete the session from Firestore

      const updatedSessions = sessions.filter((session) => session.id !== sessionId);
      setSessions(updatedSessions);

      const updatedFiltered = updatedSessions.filter((session) =>
        session.name.toLowerCase().includes(filterText.toLowerCase())
      );
      setFilteredSessions(updatedFiltered); // Update filtered sessions after deletion

      Alert.alert("Success", "Session deleted!");
    } catch (error) {
      Alert.alert("Error", "Could not delete session.");
      console.error(error);
    }
  };



  return (
    <SafeAreaView style={{ flex: 1 }}>

      <Text style={styles.title}>📜Play Mode History📜</Text>

      <TextInput
        style={styles.filterInput}
        placeholder="Filter by player name"
        value={filterText}
        onChangeText={handleFilter}
      />

      <ExportToCSV sessions={filteredSessions} buttonStyle={styles.exportButton} buttonTextStyle={styles.exportButtonText} />

      {loading ? (
        <ActivityIndicator size="large" />
      ) : sessions.length === 0 ? (
        <Text style={styles.noSessionsText}>No Play Sessions found</Text>
      ) : (
        <FlatList
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          data={filteredSessions}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          } />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f9f9f9",
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
    backgroundColor: "#f1f1f1",
  },
  filterInput: {
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  noSessionsText: {
    textAlign: "center",
    fontSize: 16,
    color: "#555",
    marginTop: 20,
  },
  buttonWrapper: {
    width: 'auto',
    alignItems: 'center',
    marginTop: 10,
  },

});
