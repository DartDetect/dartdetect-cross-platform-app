// pages/TrainingPage.js
import React ,{ useState }from "react";
import { View, Text, StyleSheet,Button,Alert,Image,ScrollView } from "react-native";
import * as ImagePicker from "expo-image-picker";

import Slider from "@react-native-community/slider";
import { InitialiseSession } from "../services/TrainingSessionMode";
import { addRoundScore } from "../services/TrainingSessionMode"

export default function TrainingPage() {
  const [image, setImage] = useState(null); // holds selected image URI
  const [uploading, setUploading] = useState(false); // Tracks upload status
  const [totalScore, setTotalScore] = useState(0); // Holds cumulative score
  const [processedDarts, setProcessedDarts] = useState([]); // Holds list of processed darts
  //const [processedImages, setProcessedImages] = useState([]); // Holds list of processed image details

  // Training session states
  const [sessionStarted, setSessionStarted] = useState(false);
  const [totalRounds, setTotalRounds] = useState(1);
  const [session, setSession] = useState(InitialiseSession());

  const startSession = () => {
    setSessionStarted(true);
    setSession(InitialiseSession());
    setProcessedDarts([]);
  };

  // nextRound function
  const nextRound = () => {
  setSession((prevSession) => addRoundScore(prevSession, 0));
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
      const newTotalScore = result.scores.reduce((sum, dart) => sum + dart.score, 0);

      // Update the total score and processed images list
      setTotalScore((prevScore) => prevScore + newTotalScore);

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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Training Section</Text>

      {!sessionStarted && (
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
         <Button title="Start Session" onPress={() => { setSessionStarted(true); setSession(InitialiseSession()); }} />
        </View>
      )}
      
      <View style={styles.sessionContainer}>
      <Text style={styles.roundInfo}>Round: {session.currentRound} of {totalRounds}</Text>
      <Button title="Pick an Image📂" onPress={pickImage} />
      {uploading && <Text>Uploading...</Text>}
      {image && (<Image source={{ uri: image }} style={styles.image} />)}     
      <Text style={styles.totalScore}>Total Score: {totalScore}</Text>
      {session.currentRound < totalRounds && (<Button title="Next Round" onPress={nextRound} />
)}
      </View>

      <View style={styles.resultContainer}>
        <Text style={styles.resultTitle}>Processed Images:</Text>
        {processedDarts.map((dart, index) => (
          <Text key={index} style={styles.resultText}>
            🎯 Dart Score: {dart.score} (Image: {dart.filename})
          </Text>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
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
});
