import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Button, Alert, ScrollView } from "react-native";
import { signOut } from "firebase/auth";
import {db, auth } from "../services/firebaseConfig";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { doc, getDoc,collection,query,where,getDocs } from "firebase/firestore";




export default function Dashboard() {
  const[userData, setUserData] = useState({name: "", nationality: ""}); // Store user's name and nationality
  const [loading, setLoading] = useState(true); //Loading state

  const [trainingStats, setTrainingStats] = useState({ // Store training stats
    totalRounds: 0,
    averageOfAverages: "N/A",
  }); 

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
        const q = query(
          collection(db, "trainingSessions"),
          where("uid", "==", auth.currentUser.uid)
        );
        const snapshot = await getDocs(q);
  
        if (snapshot.empty) {
          setTrainingStats({
            totalRounds: 0,
            averageOfAverages: "N/A",
          });
          return;
        }
  
        let totalRounds = 0;
        let totalAverageSum = 0;
        let sessionCount = 0;
  
        snapshot.forEach((doc) => {
          const data = doc.data();
          totalRounds += Number(data.rounds || 0);
          totalAverageSum += Number(data.averageScore || 0);
          sessionCount++;
        });
  
        setTrainingStats({
          totalRounds,
          averageOfAverages: (totalAverageSum / sessionCount).toFixed(2),
        });
      } catch (error) {
        console.error("Error fetching training stats:", error);
        Alert.alert("Error", "Failed to load training stats.");
      }
    }
  
    fetchTrainingStats();
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
    <ScrollView contentContainerStyle={styles.container}>
    
      <Text style={styles.welcome}>Welcome, {userData.name}!</Text>
      <Text style={styles.userInfo}>Nationality: {userData.nationality}</Text> 
      <View style={styles.statsContainer}>
       <Text style={styles.statsTitle}>Training Stats</Text>
        <Text style={styles.statsText}>
          Total Rounds Played: {trainingStats.totalRounds}
        </Text>
        <Text style={styles.statsText}>
          Average Score Across Sessions: {trainingStats.averageOfAverages}
        </Text>
      </View>
      <Button title="Logout" onPress={handleLogout} />
    </ScrollView>
  );
}

// Component Stylesheet
const styles = StyleSheet.create({
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
  
});
