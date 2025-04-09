import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function PlayHistoryPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Play Mode History</Text>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
});
