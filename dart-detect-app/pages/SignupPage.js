import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput,Image, Button, useWindowDimensions, Alert } from "react-native";
import { createUserWithEmailAndPassword } from "@firebase/auth";



import { auth } from "../services/firebaseConfig";

export default function SignupPage({ navigation }) {

  // State Variables for email and password inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { width } = useWindowDimensions(); // Get device width for responsive design

  // Function to handle the user signup
  const handleSignup = async () => {
    try {
     
      //Firebase method to create new user with email and password
      await createUserWithEmailAndPassword(auth, email, password);

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
    marginBottom:20,
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
    width: 100, // Adjust width as needed
    height: 100, // Adjust height as needed
    marginBottom: 20,
  },


});
