
import React, { useState } from "react";
import { View, Text, StyleSheet,Image, TextInput, Alert, Button} from "react-native";
import { auth } from "../services/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";


export default function LoginPage({navigation}) {

  const [email, setEmail] = useState(""); // State for email input
  const [password, setPassword] = useState(""); // State for password input
  
   // Function to handle user login
   const handleLogin = async () => {
    try {
      // Attempt Firebase login
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert("Success", "You are now logged in!");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };


  return (
    <View style={styles.container}>
        <Image source={require("../assets/logo1.png")} style={styles.logo}/>
      <Text style={styles.title}>DartDetect</Text>
      <Text style={styles.title}>Login Here!</Text>

      <TextInput
        style={styles.input}
        placeholder='Email'
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
        <Button title="Log In" onPress={handleLogin} />

      <Text style={styles.link} onPress={() => navigation.navigate("SignupPage")}>
        Don't have an account? Sign up here.
      </Text>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
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
    textDecorationLine: "underline",
  },
  logo: {
    width: 100, // Adjust width as needed
    height: 100, // Adjust height as needed
    marginBottom: 20,
  },

});
