import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput } from "react-native";

export default function SignupPage() {

  // State Variables for email and password inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none"/>
      <TextInput style ={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
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
  },

  //  Styling for email and password input fields
  input: {
    width: "80%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  }

});
