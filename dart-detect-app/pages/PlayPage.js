// pages/PlayPage.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function PlayPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Play Mode - 501</Text>
      <Text>Features for playing will be added here.</Text>
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
    marginBottom: 10,
  },
});
