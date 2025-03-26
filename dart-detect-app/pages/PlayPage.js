// pages/PlayPage.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";

const STARTING_SCORE = 501;


export default function PlayPage() {

  const [players, setPlayers] = React.useState([
    { name: "P1", score: STARTING_SCORE,history:[] },
    { name: "P2", score: STARTING_SCORE,history:[] },
  ]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Play Mode - 501</Text>
      <View style={styles.scoreRow}>
        {players.map((player, index) => (
          <View key={index} style={styles.scoreBox}>
            <Text style={styles.scoreText}>
              {player.name}: {player.score}
            </Text>
          </View>
        ))}
      </View>
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
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 10,
  },
  scoreRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  scoreBox: {
    flex: 1,
    alignItems: "center",
  },
  scoreText: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
