import React, { useRef, useCallback } from "react";
import Webcam from "react-webcam";
import { View, Button, StyleSheet } from "react-native";

// WebCamCapture component for capturing images from the webcam
export default function WebCamCapture({ onCapture, onClose }) {
  const webcamRef = useRef(null);

  // Function to capture the image
  const capture = useCallback(async () => {
    const imageSrc = webcamRef.current.getScreenshot(); // Take scrennshot from webcam
    if (imageSrc) {
      await onCapture(imageSrc);
      onClose(); // Close webcam view after capture
    }
  }, [webcamRef]);

  return (
    <View style={styles.container}>
      <View style={styles.webcamWrapper}>
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={{ facingMode: "environment" }}
          style={styles.webcam}
        />
      </View>
      <View style={styles.buttonRow}>
        <Button title="Capture" onPress={capture} color="#007AFF" />
        <Button title="Cancel" onPress={onClose} color="#FF3B30" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginTop: 20,
    padding: 16,
    
  },
});
