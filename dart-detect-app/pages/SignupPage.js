import React, { useReducer, useState } from "react";
import { View, Text, StyleSheet, TextInput, Image, Button, useWindowDimensions, Alert } from "react-native";
import { createUserWithEmailAndPassword } from "@firebase/auth";
import { createUserProfile, testFirestoreWrite } from "../services/firestoreDatabase";


import { auth } from "../services/firebaseConfig";

export default function SignupPage({ navigation }) {

  // State Variables for email and password inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [nationality, setNationality] = useState("");

  const { width } = useWindowDimensions(); // Get device width for responsive design

  // Function to handle the user signup
  const handleSignup = async () => {
    try {

      //Firebase method to create new user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await createUserProfile(user.uid, name, nationality)

      await testFirestoreWrite();

      Alert.alert("Success, Account created succesfully!");
      navigation.navigate("LoginPage");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  }
  return (
    // Main Container for page layout
    <View style={styles.container}>
      <Image source={require("../assets/logo1.png")} style={styles.logo} />
      <Text style={styles.title}>Sign Up</Text>
      <Text style={styles.title}>Begin Your Training</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={'gray'}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Name"
        placeholderTextColor={"gray"}
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Nationality"
        placeholderTextColor={"gray"}
        value={nationality}
        onChangeText={setNationality}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={'gray'}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button title="Sign Up" onPress={handleSignup} />

      <Text style={styles.link} onPress={() => navigation.navigate("LoginPage")}>
        Already have an account? Login Here
      </Text>

    </View>
  );
}

//Component Stylesheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },

  //  Styling for email and password input fields
  input: {
    width: "80%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },

  link: {
    color: "blue",
    marginTop: 10,
    textAlign: "center",
    textDecorationLine: "underline",
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },


});
