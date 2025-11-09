/**
 * Audio service for recording and playback
 * Handles audio recording and speech recognition for voice agent
 */

import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import * as FileSystem from 'expo-file-system';
// Import legacy API explicitly to avoid deprecation warnings
import { cacheDirectory, documentDirectory, writeAsStringAsync, deleteAsync, EncodingType } from 'expo-file-system/legacy';
import { Platform, PermissionsAndroid, Alert } from 'react-native';

export interface AudioRecorderOptions {
  sampleRate?: number;
  numberOfChannels?: number;
  bitRate?: number;
  audioQuality?: number;
}

export class AudioService {
  private recording: Audio.Recording | null = null;
  private isRecording = false;
  private audioModeSet = false;

  /**
   * Request microphone permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'This app needs microphone access to record audio for voice conversations.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        // iOS permissions are handled via Info.plist
        // Check permission status
        const { status } = await Audio.getPermissionsAsync();
        if (status !== 'granted') {
          const { status: newStatus } = await Audio.requestPermissionsAsync();
          return newStatus === 'granted';
        }
        return true;
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }

  /**
   * Set up audio mode for recording
   */
  private async setupAudioMode(): Promise<void> {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      this.audioModeSet = true;
    } catch (error) {
      console.error('Error setting up audio mode:', error);
    }
  }

  /**
   * Start recording audio
   */
  async startRecording(options: AudioRecorderOptions = {}): Promise<void> {
    try {
      // Request permissions first
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Microphone permission not granted');
      }

      // Set up audio mode
      if (!this.audioModeSet) {
        await this.setupAudioMode();
      }

      // Configure recording options
      const recordingOptions: Audio.RecordingOptions = {
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: options.sampleRate || 44100,
          numberOfChannels: options.numberOfChannels || 2,
          bitRate: options.bitRate || 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: options.audioQuality || Audio.IOSAudioQuality.HIGH,
          sampleRate: options.sampleRate || 44100,
          numberOfChannels: options.numberOfChannels || 2,
          bitRate: options.bitRate || 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: options.bitRate || 128000,
        },
      };

      // Create and prepare recording
      const { recording } = await Audio.Recording.createAsync(recordingOptions);
      this.recording = recording;
      this.isRecording = true;

      console.log('Recording started');
    } catch (error: any) {
      console.error('Failed to start recording:', error);
      throw new Error(`Failed to start recording: ${error.message}`);
    }
  }

  /**
   * Stop recording and get the audio file URI
   */
  async stopRecording(): Promise<string | null> {
    try {
      if (!this.recording || !this.isRecording) {
        return null;
      }

      this.isRecording = false;
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      this.recording = null;

      console.log('Recording stopped, URI:', uri);
      return uri;
    } catch (error: any) {
      console.error('Failed to stop recording:', error);
      this.isRecording = false;
      this.recording = null;
      throw new Error(`Failed to stop recording: ${error.message}`);
    }
  }

  /**
   * Get recording status
   */
  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  /**
   * Play audio from URI or base64 data
   */
  async playAudio(uri: string): Promise<void> {
    try {
      let audioUri = uri;
      
      // If it's a data URI with base64, try to play it directly
      // expo-av should support data URIs on most platforms
      if (uri.startsWith('data:audio')) {
        audioUri = uri;
      }
      
      const { sound } = await Audio.Sound.createAsync({ uri: audioUri });
      await sound.playAsync();
      
      // Wait for playback to finish
      return new Promise((resolve, reject) => {
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            if (status.didJustFinish) {
              sound.unloadAsync();
              resolve();
            } else if ('error' in status && status.error) {
              sound.unloadAsync();
              reject(new Error('Audio playback error'));
            }
          }
        });
      });
    } catch (error: any) {
      console.error('Failed to play audio:', error);
      throw new Error(`Failed to play audio: ${error.message}`);
    }
  }
  
  /**
   * Play audio from base64 string
   */
  async playAudioFromBase64(base64Data: string, format: string = 'mp3'): Promise<void> {
    let fileUri: string | null = null;
    try {
      console.log(`🎵 Playing audio from base64, format: ${format}, data length: ${base64Data.length}`);
      
      // Use legacy API imports directly
      const storageDir = cacheDirectory || documentDirectory;
      
      if (!storageDir) {
        console.error('❌ No storage directory available from legacy API');
        throw new Error('No storage directory - will try data URI');
      }
      
      console.log(`📁 Using storage directory: ${storageDir}`);
      
      // Ensure storageDir ends with a slash
      const normalizedDir = storageDir.endsWith('/') ? storageDir : storageDir + '/';
      fileUri = `${normalizedDir}audio_${Date.now()}.${format}`;
      console.log(`💾 Saving audio to file: ${fileUri}`);
      
      // Use legacy API writeAsStringAsync
      await writeAsStringAsync(fileUri, base64Data, {
        encoding: EncodingType.Base64,
      });
      
      console.log(`✅ Audio file saved, playing...`);
      
      // Set audio mode for playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      
      // Play from file
      await this.playAudio(fileUri);
      
      console.log(`✅ Audio playback completed`);
      
      // Clean up file after a delay
      setTimeout(() => {
        if (fileUri) {
          deleteAsync(fileUri, { idempotent: true }).catch((err: any) => {
            console.warn('Failed to delete audio file:', err);
          });
        }
      }, 10000);
      
    } catch (error: any) {
      console.error('❌ Failed to play base64 audio:', error);
      console.error('Error details:', error.message);
      
      // Fallback: Try using data URI directly
      try {
        console.log('🔄 Attempting fallback: playing audio from data URI...');
        const dataUri = `data:audio/${format};base64,${base64Data}`;
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
        await this.playAudio(dataUri);
        console.log('✅ Audio played successfully using data URI fallback');
        return; // Success with fallback
      } catch (fallbackError: any) {
        console.error('❌ Fallback also failed:', fallbackError.message);
        throw new Error(`Failed to play audio: ${error.message}. Fallback also failed: ${fallbackError.message}`);
      }
    }
  }

  /**
   * Speak text using text-to-speech
   */
  async speak(text: string, options?: { language?: string; pitch?: number; rate?: number }): Promise<void> {
    try {
      await Speech.speak(text, {
        language: options?.language || 'en-US',
        pitch: options?.pitch || 1.0,
        rate: options?.rate || 0.9,
        onDone: () => {
          console.log('Speech finished');
        },
        onStopped: () => {
          console.log('Speech stopped');
        },
        onError: (error) => {
          console.error('Speech error:', error);
        },
      });
    } catch (error: any) {
      console.error('Failed to speak:', error);
      throw new Error(`Failed to speak: ${error.message}`);
    }
  }

  /**
   * Stop speaking
   */
  async stopSpeaking(): Promise<void> {
    try {
      await Speech.stop();
    } catch (error) {
      console.error('Failed to stop speaking:', error);
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    try {
      if (this.recording && this.isRecording) {
        await this.stopRecording();
      }
      await this.stopSpeaking();
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
}

export const audioService = new AudioService();

