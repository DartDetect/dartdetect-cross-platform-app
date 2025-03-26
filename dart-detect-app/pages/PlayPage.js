// pages/PlayPage.js
import React, { useState } from "react";
import { View, Text, StyleSheet, Button, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";

const STARTING_SCORE = 501;


export default function PlayPage() {

  const [players, setPlayers] = React.useState([
    { name: "P1", score: STARTING_SCORE,history:[] },
    { name: "P2", score: STARTING_SCORE,history:[] },
  ]);

  // Store the selected image
  const [image, setImage] = useState(null);

  // Function to request and verify permissions
  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Permission to access media library is needed to upload images.");
      return false;
    }
    return true;
  };

   // Function to pick an image
   const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, // Allows user to edit the photo
      quality: 1, // Set image quality
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Play Mode - 501</Text>
      {image && <Image source={{ uri: image }} style={styles.image} />}
      <Button title="Pick Image 📂" onPress={pickImage} />
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
  image: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
});
