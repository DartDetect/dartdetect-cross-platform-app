// pages/TrainingPage.js
import React ,{ useState }from "react";
import { View, Text, StyleSheet,Button,Alert,Image } from "react-native";
import * as ImagePicker from "expo-image-picker";

export default function TrainingPage() {
  const [image, setImage] = useState(null); // holds selected image URI

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
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Training Section</Text>
      <Text>Features for training will be added here.</Text>
      <Button title="Pick an Image" onPress={pickImage} />
      {image ? (
        <Image source={{ uri: image }} style={styles.image} />
      ) : (
        <Text>No image selected</Text>
      )}
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
  image: {
    width: 200,
    height: 200,
    marginTop: 10,
  },
});
