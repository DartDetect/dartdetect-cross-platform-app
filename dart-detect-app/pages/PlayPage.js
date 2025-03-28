// pages/PlayPage.js
import React, { useState } from "react";
import { View, Text, StyleSheet, Button, Image, Alert, ScrollView,TextInput } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { getAuth } from "firebase/auth";
import { savePlaySession } from "../services/firestoreDatabase";

const STARTING_SCORE = 501;


export default function PlayPage() {

  const [players, setPlayers] = React.useState([
    { name: "P1", score: STARTING_SCORE,history:[] },
    { name: "P2", score: STARTING_SCORE,history:[] },
  ]);
 
  const [image, setImage] = useState(null);  // Store the selected image
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  
  const currentPlayer = players[currentPlayerIndex];

  const [editingScore, setEditingScore] = useState(null); // New state for inline editing
  const [manualScore, setManualScore] = useState(""); // New state for the input value

   // New helper function for inline editing
   const handleScoreEdit = (playerIndex, scoreIndex, newScore) => {
    setPlayers((prevPlayers) => {
      const updatedPlayers = [...prevPlayers];
      const player = updatedPlayers[playerIndex];
      const newHistory = [...player.history];
      newHistory[scoreIndex] = { ...newHistory[scoreIndex], score: newScore };
      const totalScored = newHistory.reduce((sum, dartObj) => sum + dartObj.score, 0);
      updatedPlayers[playerIndex] = {
        ...player,
        history: newHistory,
        score: Math.max(STARTING_SCORE - totalScored, 0),
      };
      return updatedPlayers;
    });
    setEditingScore(null);
    setManualScore("");
  };

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
      console.log("Selected Image URI:", result.assets[0].uri);
      await uploadImage(result.assets[0].uri);
    }
  };

  // Function to upload the image to S3 via the Flask backend
  const uploadImage = async (uri) => {
    try {
      setUploading(true);
      const filename = `image_${Date.now()}.jpg`;

      // Request pre-signed URL
      const presignedResponse = await fetch(
        `http://localhost:5001/get_presigned_url?filename=${filename}&content_type=image/jpeg`
      );
      const presignedData = await presignedResponse.json();
      if (!presignedResponse.ok) {
        throw new Error(presignedData.error || "Failed to get pre-signed URL");
      }
      const presignedUrl = presignedData.url;

      // Upload the image to S3 using the pre-signed URL
      const file = await fetch(uri);
      const blob = await file.blob();
      const uploadResponse = await fetch(presignedUrl, {
        method: "PUT",
        body: blob,
        headers: { "Content-Type": "image/jpeg" },
      });
      if (!uploadResponse.ok) {
        throw new Error("Failed to upload image to S3");
      }
      Alert.alert("Success", "Image uploaded successfully!");
      
      // Process the image on the backend
      await processImage(filename);
    } catch (error) {
      console.error("Upload Error:", error);
      Alert.alert("Error", error.message);
    } finally {
      setUploading(false);
    }
  };

  // Function to process the image in the backend
  const processImage = async (filename) => {
    try {
      const response = await fetch("http://localhost:5001/process_image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Processing failed.");
      }
      console.log("Processing Result:", result);

      // Add the scores from detected darts
      const roundScore = result.scores.reduce((sum, dart) => sum + dart.score, 0);

      // Update the player's state
      setPlayers((prevPlayers) => {
        const updatedPlayers = [...prevPlayers];
        const current = updatedPlayers[currentPlayerIndex];
        const newScore = Math.max(0, current.score - roundScore);
        updatedPlayers[currentPlayerIndex] = {
          ...current,
          score: newScore,
          history: [
            ...current.history,
            ...result.scores.map((dartObj) => ({
              image: result.filename,
              score: dartObj.score,
            })),
          ],
        };

        if (newScore === 0) {
          Alert.alert("Game Over", `${current.name} wins!`);
          saveGameResult(updatedPlayers);
        } else {
          // Switch to the other player's turn
          setCurrentPlayerIndex((prevIndex) => (prevIndex === 0 ? 1 : 0));
        }
        return updatedPlayers;
      });
    } catch (error) {
      console.error("Processing Error:", error);
      Alert.alert("Error", error.message);
    }
  };

  const saveGameResult = async (finalPlayers) => {
    try {
      const auth = getAuth();
      const uid = auth.currentUser.uid;
      for (const player of finalPlayers) {
        await savePlaySession(uid, {
          name: player.name,
          totalScore: STARTING_SCORE - player.score,
          averageScore: ((STARTING_SCORE - player.score) / player.history.length).toFixed(2),
          rounds: player.history.length,
          scoreHistory: player.history,
        });
      }
    } catch (err) {
      console.error("Save Error:", err);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Play Mode - 501</Text>

      {image && <Image source={{ uri: image }} style={styles.image} />}
      <Button title="Pick Image 📂" onPress={pickImage} disabled={uploading}/>
      {uploading && <Text>Uploading...</Text>}

      <View style={styles.scoreRow}>
        {players.map((player, index) => (
          <View key={index} style={styles.scoreBox}>
            <Text style={styles.scoreText}>
              {player.name}: {player.score}
            </Text>            
          </View>
        ))}
      </View>

        {/* Processed Scores Section */}
    <View style={styles.historyContainer}>
      <Text style={styles.historyTitle}>Processed Scores:</Text>
      <ScrollView style={styles.historyScroll} nestedScrollEnabled={true}>
        {players.map((player, pIndex) =>
          player.history.map((round, rIndex) => {
            const isEditing =
              editingScore &&
              editingScore.playerIndex === pIndex &&
              editingScore.scoreIndex === rIndex;
            return (
              <View key={`${pIndex}-${rIndex}`} style={styles.historyItem}>
                {isEditing ? (
                  <>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      value={manualScore}
                      onChangeText={(text) => setManualScore(text)}
                    />
                    <Button 
                      title="Save"
                      onPress={() =>
                        handleScoreEdit(pIndex, rIndex, parseInt(manualScore) || 0)
                      }
                    />  
                    </>
                ) : (
                  <>
                    <Text style={styles.scoreHistoryText}>
                      🎯 {player.name} - Score: {round.score} (Image: {round.image})
                    </Text>
                    <Button 
                    title="Edit"
                    onPress={() => {
                      setEditingScore({ playerIndex: pIndex, scoreIndex: rIndex });
                      setManualScore(round.score.toString());
                    
                    }}
                    />
                  </>
                )}
              </View>
            );    
      })
      )}
      </ScrollView>
    </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
  historyContainer: {
    width: "100%",
    marginTop: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
  },
  historyTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 10,
  },
  historyScroll: {
    maxHeight: 150,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  scoreHistoryText: {
    fontSize: 14,
    flex: 1,
    marginRight: 5,
  },
  input: {
    width: 60,
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 4,
    marginRight: 5,
    textAlign: "center",
  },
});
