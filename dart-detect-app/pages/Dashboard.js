import React from "react";
import { View, Text, StyleSheet, Button, Alert, useWindowDimensions } from "react-native";
import { signOut } from "firebase/auth";
import {db, auth } from "../services/firebaseConfig";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { doc, getDoc } from "firebase/firestore";


export default function Dashboard() {
  const[userData, setUserData] = useState({name: "", nationality: ""}); // Store user's name and nationality
  const [loading, setLoading] = useState(true); //Loading state

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

  return (
    <View style={styles.container}>
     
      <Text style={styles.welcome}>Welcome to Dart Detect Dashboard!</Text>
      <Text style={styles.userInfo}>
        You are logged in as: {auth.currentUser?.email}
      </Text> 

      <View style={styles.placeholder}>
        <Text>Game stats and features coming soon!</Text>
      </View>
        <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}

// Component Stylesheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  
});
