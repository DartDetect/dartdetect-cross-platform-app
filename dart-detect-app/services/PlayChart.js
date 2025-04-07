import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function PlayChart({ chartData }) {
    if (!chartData || chartData.length === 0) {
        return (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No play session data yet.</Text>
          </View>
        );
      }
      
  return (
    <View style={styles.container}>
      <Text style={styles.chartTitle}>Play Session Chart</Text>
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    padding: 10,
    alignItems: "center",
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
});
