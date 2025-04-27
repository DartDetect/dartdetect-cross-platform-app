// pages/TrainingPage.js
import React, { useState } from "react";
import { View, Text, StyleSheet, Button, Alert, Image, ScrollView, TextInput } from "react-native";
import * as ImagePicker from "expo-image-picker";

import Slider from "@react-native-community/slider";
import { InitialiseSession } from "../services/TrainingSessionMode";
import { addRoundScore, calculateStats } from "../services/TrainingSessionMode"
import { getAuth } from "firebase/auth";
import { saveTrainingSession } from "../services/firestoreDatabase";
import WebCamCapture from "../services/WebCamCapture";
import { Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { handleTrainingReset } from "../services/Buttons/TrainingReset";



export default function TrainingPage() {
  const [image, setImage] = useState(null); // holds selected image URI
  const [uploading, setUploading] = useState(false); // Tracks upload status

  const [processedDarts, setProcessedDarts] = useState([]); // Holds list of processed darts
  //const [processedImages, setProcessedImages] = useState([]); // Holds list of processed image details

  // Training session states
  const [sessionStarted, setSessionStarted] = useState(false);
  const [totalRounds, setTotalRounds] = useState(1);
  const [session, setSession] = useState(InitialiseSession());
  const [editingScore, setEditingScore] = useState(null); // State to control editing score mode
  const [manualScore, setManualScore] = useState(""); // State to hold manual score input

  const stats = calculateStats(session.roundScores);
  const cumulativeScore = Number(stats.totalScore) + session.currentRoundScore;

  const [showWebcam, setShowWebcam] = useState(false); // State to control webcam visibility



  const startSession = () => {
    setSessionStarted(true);
    setSession(InitialiseSession());
    setProcessedDarts([]);
    setImage(null);
  };

  // nextRound function
  const nextRound = () => {
    setSession((prevSession) => addRoundScore(prevSession, prevSession.currentRoundScore));
    setImage(null);

    if (session.currentRound >= totalRounds) {
      Alert.alert("Session Complete", "You've completed all rounds!");
    }

  };


  // Function to request and verify permissions
  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      // Show alert id permission is denied
      Alert.alert("Permission Required", "Permission to access media library is needed to upload images.");
      return false; // Permission not granted
    }
    return true; // Permission granted
  };

  // Function to pick an image
  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, // Alows user to edit the photo
      quality: 1, // Set image quality 
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri); // Save the selected image URI 
      console.log("Selected Image URI:", result.assets[0].uri);

      // Upload and process the image
      await uploadImage(result.assets[0].uri);
    }
  };

  // Function to take a photo
  const takePhoto = async () => {
    if (Platform.OS === "web") {
      setShowWebcam(true); // Show webcam for photo capture
      return;
    }

    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission Required", "Camera access is required.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      await uploadImage(result.assets[0].uri);
    }
  };

  // Function to upload the image to S3 via the Flask backend
  const uploadImage = async (uri) => {
    try {
      setUploading(true);

      // Generate a unique filename
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

      // Upload to S3 using the pre-signed URL
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

      // Notify backend to process the image
      await processImageOnBackend(filename);

    } catch (error) {
      console.error("Upload Error:", error);
      Alert.alert("Error", error.message);
    } finally {
      setUploading(false);
    }
  };

  // Function to process the image in the backend
  const processImageOnBackend = async (filename) => {
    try {
      const response = await fetch("http://localhost:5001/process_image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filename }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to process image.");
      }

      console.log("Processing Result:", result);

      // Sum all dart scores detected
      const roundScore = result.scores.reduce((sum, dart) => sum + dart.score, 0);

      setSession((prevSession) => ({
        ...prevSession,
        currentRoundScore: roundScore,
      }));

      // Update the total score and processed images list
      //setTotalScore((prevScore) => prevScore + roundScore);

      // Add processed darts to list
      setProcessedDarts((prevDarts) => [
        ...prevDarts,
        ...result.scores.map((dart) => ({
          filename: result.filename,
          dart: dart.dart,
          score: dart.score,
        })),
      ]);
    } catch (error) {
      console.error("Processing Error:", error);
      Alert.alert("Error", error.message);
    }
  };

  // Save the training session to Firestore under the user's UID
  const saveSession = async () => {
    // Compile final scores (make sure to include the current round score if not already added)
    const finalScores = session.roundScores.concat(session.currentRoundScore);
    const finalStats = calculateStats(finalScores);
    const sessionData = {
      rounds: totalRounds,
      scores: finalScores,
      totalScore: finalScores.reduce((sum, score) => sum + score, 0),
      averageScore: finalStats.averageScore,
      highestScore: finalStats.highestScore,
      lowestScore: finalStats.lowestScore,
    };

    try {
      // Retrieve current user's UID from Firebase Auth
      const auth = getAuth();
      const uid = auth.currentUser.uid;
      await saveTrainingSession(uid, sessionData);
      Alert.alert("Success", "Training session saved successfully!");
      // Reset session state after saving
      setSessionStarted(false);
      setSession(InitialiseSession());
      setProcessedDarts([]);
      setImage(null);
    } catch (error) {
      console.error("Save Session Error:", error);
      Alert.alert("Error", "Failed to save session");
    }
  };

  // Function to handle score editing
  const handleScoreEdit = (scoreIndex, newScore) => {
    const updatedDarts = [...processedDarts];
    updatedDarts[scoreIndex].score = newScore;
    setProcessedDarts(updatedDarts);
    setEditingScore(null);
    setManualScore("");

    const updatedRoundScore = updatedDarts.reduce((sum, dart) => sum + dart.score, 0);
    setSession((prev) => ({
      ...prev,
      currentRoundScore: updatedRoundScore,
    }));

  };

  const handleEditButtonClick = (index) => {
    setEditingScore(index);
    setManualScore(processedDarts[index].score.toString());
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} style={{ backgroundColor: "#f9f9f9" }}>
        <Text style={styles.title}>🏹Training Mode🏹</Text>

        {!sessionStarted ? (
          <View style={styles.sessionSetup}>
            <Text>Select Number of Rounds: {totalRounds}</Text>

            <Slider
              style={{ width: 200, height: 40 }}
              minimumValue={1}
              maximumValue={30}
              step={1}
              value={totalRounds}
              onValueChange={(value) => setTotalRounds(value)}
            />
            <Button title="Start Session" onPress={startSession} />
          </View>
        ) : (

          <View style={styles.sessionContainer}>
            <Text style={styles.roundInfo}>
              Round {session.currentRound} of {totalRounds}
            </Text>
            <Button title="Pick an Image 📂" onPress={pickImage} />
            {uploading && <Text>Uploading...</Text>}
            {image && <Image source={{ uri: image }} style={styles.image} />}
            <Text style={styles.totalScore}>Cumulative Score: {cumulativeScore}</Text>
            <Text style={styles.statText}>Average Score: {stats.averageScore}</Text>
            <Text style={styles.statText}>Highest Score: {stats.highestScore}</Text>
            <Text style={styles.statText}>Lowest Score: {stats.lowestScore}</Text>

            {/* Render session control buttons */}
            {session.currentRound < totalRounds ? (
              <Button
                title="Next Round"
                onPress={nextRound}
                disabled={session.currentRoundScore === 0}
              />
            ) : (
              session.currentRoundScore > 0 && (
                <Button
                  title="Save Session"
                  onPress={saveSession}
                  disabled={session.currentRoundScore === 0}
                />
              )
            )}
          </View>
        )}

        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Processed Scores:</Text>
          {processedDarts.map((dart, index) => {
            const isEditing = editingScore === index; // Check if this score is being edited
            return (
              <View key={index} style={styles.historyItem}>
                {isEditing ? (
                  <>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      value={manualScore !== undefined && manualScore !== null ? manualScore.toString() : ""}
                      onChangeText={setManualScore}
                    />
                    <Button title="Save" onPress={() => handleScoreEdit(index, parseInt(manualScore)) || 0}
                    />
                  </>
                ) : (
                  <>
                    <Text key={index} style={styles.resultText}>
                      🎯 Dart Score: {dart.score}
                    </Text>
                    <Button title="Edit" onPress={() => handleEditButtonClick(index)} />

                  </>)}
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.buttonRow}>
          <Button title="UNDO" onPress={() => { }} />
          <Button title="📷" onPress={takePhoto} disabled={uploading} />
          <Button title="RESET" onPress={() => handleTrainingReset(setSession, setSessionStarted, setProcessedDarts, setImage)} />
        </View>
      </View>


      {/* Webcam Capture Component */}
      {showWebcam && (
        <WebCamCapture
          onCapture={async (base64) => {
            const blob = await (await fetch(base64)).blob();
            const filename = `webcam_${Date.now()}.jpg`;

            const presignedResponse = await fetch(
              `http://localhost:5001/get_presigned_url?filename=${filename}&content_type=image/jpeg`
            );
            const { url } = await presignedResponse.json();

            await fetch(url, {
              method: "PUT",
              body: blob,
              headers: { "Content-Type": "image/jpeg" },
            });
            await processImageOnBackend(filename);
          }}
          onClose={() => setShowWebcam(false)} // Close webcam when done
        />
      )}
    </SafeAreaView>

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
  sessionSetup: {
    alignItems: "center",
    marginVertical: 20,
  },
  sessionContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  roundInfo: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  image: {
    width: 200,
    height: 200,
    marginTop: 10,
  },
  totalScore: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
  },
  resultContainer: {
    marginTop: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
    width: "100%",
  },
  resultTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 5,
  },
  resultText: {
    fontSize: 14,
    marginBottom: 5,
  },
  statText: {
    fontSize: 16,
    marginTop: 5,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    padding: 10,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    gap: 12,
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
    gap: 6,
  },
  input: {
    width: 60,
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 4,
    textAlign: "center",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },

});
