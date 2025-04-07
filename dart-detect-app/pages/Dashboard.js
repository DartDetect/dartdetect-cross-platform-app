import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Button, Alert, ScrollView, SafeAreaView } from "react-native";
import { signOut } from "firebase/auth";
import {db, auth } from "../services/firebaseConfig";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { doc, getDoc,collection,query,where,getDocs,orderBy, limit } from "firebase/firestore";
import TrainingChart from "../services/TrainingChart";
import PlayChart from "../services/PlayChart"; 


export default function Dashboard() {
  const[userData, setUserData] = useState({name: "", nationality: ""}); // Store user's name and nationality
  const [loading, setLoading] = useState(true); //Loading state

  const [trainingStats, setTrainingStats] = useState({ totalRounds: 0, averageOfAverages: "N/A",}); 
  const [chartData, setChartData] = useState([]);

  const [playStats, setPlayStats] = useState([]); // Store play session stats
  const [playChartData, setPlayChartData] = useState([]);


  // Function to handle user logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      Alert.alert("Logged Out", "You have been logged out.");
      //navigation.navigate("LoginPage"); // Redirect to LoginPage
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  // useEffect to fetch user data from Firestore
  useEffect(() => {
    async function fetchUser() {
      try {
        const userDocRef = doc(db, "users", auth.currentUser.uid); // Get referenceto user document in Firestore
        const userDoc = await getDoc(userDocRef); // Fetch user document
        // Check if doducment exists and set user data
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        Alert.alert("Error", "Failed to load user data.");
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  useEffect(() => {
    async function fetchTrainingStats() {
      try {
        // Firestore query to get training sessions for the current user
        const q = query(
          collection(db, "trainingSessions"),
          where("uid", "==", auth.currentUser.uid)
        );

        // Execute the query
        const snapshot = await getDocs(q);
  
        if (snapshot.empty) {
          setTrainingStats({
            totalRounds: 0,
            averageOfAverages: "N/A",
          });
          return;
        }
  
        // Calculate total rounds and average of averages
        let totalRounds = 0;
        let totalAverageSum = 0;
        let sessionCount = 0;
        let sessionAverages = [];
  
        // Iterate through each document in the snapshot
        snapshot.forEach((doc) => {
          const data = doc.data();
          totalRounds += Number(data.rounds || 0); // Add rounds to total
          totalAverageSum += Number(data.averageScore || 0); // Add average score to total
          sessionAverages.push(Number(data.averageScore || 0)); // Store average score for chart data
          sessionCount++; // Count the number of sessions
        });
  
        // Update the training stats state
        setTrainingStats({
          totalRounds,
          averageOfAverages: (totalAverageSum / sessionCount).toFixed(2),
        });

        setChartData(sessionAverages); // Set chart data for the training chart

      } catch (error) {
        console.error("Error fetching training stats:", error);
        Alert.alert("Error", "Failed to load training stats.");
      }
    }
  
    fetchTrainingStats();
  }, []);

  
  useEffect(() => {
    async function fetchPlayStats() {
      try {
        const q = query(
          collection(db, "playSessions"),
          where("uid", "==", auth.currentUser.uid),
          orderBy("timestamp", "desc")
        );
        
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          console.log("No play session found.");
          return;
        }
        
        const playerStats = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          const existingPlayer = playerStats.find(player => player.name === data.name);
          
          if (existingPlayer) {
            existingPlayer.totalGames += 1;
            existingPlayer.rounds += data.rounds;
            existingPlayer.totalScore += data.totalScore;
            existingPlayer.scores.push(data.averageScore);
          } else {
            playerStats.push({
              name: data.name,
              totalGames: 1,
              rounds: data.rounds,
              totalScore: data.totalScore,
              averageScore: data.averageScore,
              scores: [data.averageScore], // Store all scores per round
            });
          }
        });
  
        // Calculate the correct average of averages
        playerStats.forEach(player => {
          // Calculate average of all scores for the player
          const totalScore = player.scores.reduce((sum, score) => sum + score, 0);
          player.averageOfAverages = (totalScore / player.scores.length).toFixed(2); // Update average calculation
        });
  
        setPlayStats(playerStats); // Set latest play session data
      } catch (err) {
        console.error("Error fetching play stats:", err);
        Alert.alert("Error", "Failed to load play stats.");
      }
    }
    fetchPlayStats();
  }, []);
  

  // If data is loading show loadinf screen
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading Dashboard...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
    <ScrollView contentContainerStyle={styles.container}>
    
      <Text style={styles.welcome}>Welcome, {userData.name}!</Text>
      <Text style={styles.userInfo}>Nationality: {userData.nationality}</Text> 
      
      <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollWrapper}>

      <View style={styles.card}>
       <Text style={styles.statsTitle}>Training Stats</Text>
        <Text style={styles.statsText}>
          Total Rounds Played: {trainingStats.totalRounds}
        </Text>
        <Text style={styles.statsText}>
          Average Score Across Sessions: {trainingStats.averageOfAverages}
        </Text>
        <View style={styles.chartContainer}>
        <TrainingChart chartData={chartData} />
        </View>
      </View>

      {/* Play Mode Stats Card */}
      <View style={styles.card}>
        <Text style={styles.statsTitle}>Latest Game Stats</Text>
        {playStats.length > 0 ? (
          playStats.map((player, index) => (
            <View key={index}>
            <Text style={styles.statsTitle}>{player.name}'s Stats</Text>
            <Text style={styles.statsText}>
              Total Games Played: {player.totalGames}
            </Text>
            <Text style={styles.statsText}>
              Rounds Played: {player.rounds}
            </Text>
            <Text style={styles.statsText}>
              Average Score: {player.averageOfAverages}
            </Text>
      </View>
       ))
      ) : (
        <Text>No Play Stats Available</Text>
      )}
       </View>
    </ScrollView>

      <Button title="Logout" onPress={handleLogout} />
    </ScrollView>
    </SafeAreaView>
  );
}

// Component Stylesheet
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f9f9f9", 
  },
  
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  welcome: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  userInfo: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: "center",
  },
  placeholder: {
    marginTop: 40,
    padding: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "#f9f9f9",
    marginBottom: 100
  },
  statsContainer: {
    marginTop: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#f1f1f1",
    width: "100%",
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  statsText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 5,
  },
  chartContainer: {
    marginTop: 20,
    padding: 10,
    borderRadius: 8,
    width: "100%",
    overflow: "hidden",
  },
  
  scrollWrapper: {
    paddingVertical: 10,
  },
  
  card: {
    width: 320,
    marginHorizontal: 10,
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#f1f1f1",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    alignItems: "center",
    minHeight: 400,
  },
  
});
