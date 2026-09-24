import React from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons'; // Adjust to match your project icon setup

// Define strict prop inputs for our detached layout engine
interface MediaCaptureEngineProps {
  mode: 'photo' | 'audio';
  customAccents: { cyan: string; gold: string };
  onImageCaptured: (image: { base64: string; uri: string } | null) => void;
  onAudioAction?: () => void;
}

export function MediaCaptureEngine({ mode, customAccents, onImageCaptured, onAudioAction }: MediaCaptureEngineProps) {

  // 📸 Action A: Fire up the native camera hardware interface
  const handleLaunchCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert("Permission Required", "Please allow camera access in settings to scan context frames.");
      return;
    }

    const cameraResult = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1,1],
      quality: 0.7,
      base64: true, // 🔑 Vital: Tells engine to return text strings for Gemini
    });

    if (!cameraResult.canceled && cameraResult.assets[0]?.base64) {
      onImageCaptured({
        base64: cameraResult.assets[0].base64,
        uri: cameraResult.assets[0].uri,
      });
    }
  };

  // 🖼️ Action B: Query the user's gallery layout space
  const handleLaunchLibrary = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert("Permission Required", "Please allow photo library access to upload context files.");
      return;
    }

    const libraryResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });

    if (!libraryResult.canceled && libraryResult.assets[0]?.base64) {
      onImageCaptured({
        base64: libraryResult.assets[0].base64,
        uri: libraryResult.assets[0].uri,
      });
    }
  };

  return (
    <View style={{ width: '100%' }}>
      {mode === 'photo' ? (
        <View style={{ width: '100%' }}>

          {/* Main Visual Instructions Card Layout */}
          <View style={[styles.mediaCapture, { marginBottom: 14 }]}>
            <View style={styles.mediaIcon}>
              <Feather name="camera" size={26} color={customAccents.cyan} />
            </View>
            <Text style={styles.mediaTitle}>Scan or Upload Context</Text>
            <Text style={styles.mediaCopy}>
              Capture a live scene using your device camera or upload a note frame from your photo library.
            </Text>
          </View>

          {/* Side-by-Side Neon Styled Button Split Matrix */}
          <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>

            {/* Action 1: Open Camera Interface */}
            <Pressable
              onPress={handleLaunchCamera}
              style={({ pressed }) => [
                styles.actionBtn,
                { borderColor: customAccents.cyan, opacity: pressed ? 0.7 : 1 }
              ]}
            >
              <Feather name="aperture" size={16} color={customAccents.cyan} />
              <Text style={[styles.actionBtnText, { color: customAccents.cyan }]}>OPEN CAMERA</Text>
            </Pressable>

            {/* Action 2: Trigger Library Image Stream */}
            <Pressable
              onPress={handleLaunchLibrary}
              style={({ pressed }) => [
                styles.actionBtn,
                { borderColor: '#ffffff', opacity: pressed ? 0.7 : 1 }
              ]}
            >
              <Feather name="upload" size={16} color="#ffffff" />
              <Text style={[styles.actionBtnText, { color: '#ffffff' }]}>UPLOAD PHOTO</Text>
            </Pressable>

          </View>
        </View>
      ) : (
        // 🎙️ Keep audio press configurations safely decoupled
        <Pressable onPress={onAudioAction} style={styles.mediaCapture}>
          <View style={styles.mediaIcon}>
            <Feather name="mic" size={26} color={customAccents.gold} />
          </View>
          <Text style={styles.mediaTitle}>Speak the context</Text>
          <Text style={styles.mediaCopy}>Hold to record a thought before it disappears.</Text>
          <Text style={[styles.mediaAction, { color: customAccents.gold }]}>START RECORDING</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mediaCapture: {
    backgroundColor: '#16171D',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#242630',
    width: '100%',
  },
  mediaIcon: {
    marginBottom: 10,
  },
  mediaTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  mediaCopy: {
    color: '#a1a1aa',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 10,
  },
  mediaAction: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 6,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.2,
    backgroundColor: '#16171D',
    gap: 8,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  }
});
