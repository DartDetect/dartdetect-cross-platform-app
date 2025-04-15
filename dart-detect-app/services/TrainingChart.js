import React from "react";
import { View, Text, StyleSheet,ScrollView } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";



export default function TrainingChart({ chartData }) {
  const { width } = Dimensions.get("window");
    // Show fallback if no data
    if (!chartData || chartData.length === 0) {
      return (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No training session data yet.</Text>
        </View>
      );
    }
  
    return (
      <View style={styles.container}>
        <Text style={styles.chartTitle}>Average Score per Session</Text>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
        <LineChart
          data={{
            labels: chartData.map((_, index) => `#${index + 1}`),
            datasets: [
              {
                data: chartData,
              },
            ],
          }}
          width={width * 0.9} // full width minus padding
          height={180}
          yAxisSuffix=""
          chartConfig={{
            backgroundColor: "#ffffff",
            backgroundGradientFrom: "#f1f1f1",
            backgroundGradientTo: "#f1f1f1",
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 8,
            },
            propsForDots: {
              r: "4",
              strokeWidth: "2",
              stroke: "#007AFF",
            },
          }}
          style={{
            marginVertical: 12,
            borderRadius: 8,
            alignSelf: "center",
            paddingHorizontal: 10,
            width: 371,
          }}
        />
        </ScrollView>
      </View>
    );
  }
  
  
  const styles = StyleSheet.create({
    container: {
      
      alignItems: "center",
      width: "100%",
      justifyContent: "center",
      marginBottom: 20,
    },
    chartTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 10,
      textAlign: "center",
    },
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