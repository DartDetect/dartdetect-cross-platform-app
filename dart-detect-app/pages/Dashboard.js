import React from "react";
import { View, Text, StyleSheet, Button, Alert, useWindowDimensions } from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebaseConfig";

export default function Dashboard({ navigation }) {
  
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

      <Button title="Logout" onPress={handleLogout} />

      <View style={styles.placeholder}>
        <Text>Game stats and features coming soon!</Text>
      </View>
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
  },
});
