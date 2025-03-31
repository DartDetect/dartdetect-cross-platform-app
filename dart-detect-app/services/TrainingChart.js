import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function TrainingChart({ chartData }) {
    // Show fallback if no data
    if (!chartData || chartData.length === 0) {
      return (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No training session data yet.</Text>
        </View>
      );
    }
  
    return null; 
  }
  
  const styles = StyleSheet.create({
    noDataContainer: {
      padding: 20,
      alignItems: "center",
    },
    noDataText: {
      fontSize: 16,
      fontStyle: "italic",
      color: "#777",
    },
  });