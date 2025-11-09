/**
 * React Native hook for ElevenLabs Voice Agent integration via WebSocket
 * Connects to backend WebSocket and handles audio recording/transcription
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Alert, Platform } from 'react-native';
import Constants from 'expo-constants';
import { setWorkoutData } from './workoutStore';
import { BASE_URL } from '../lib/api'; // Use the same BASE_URL as the API client

// Get backend URL - use the same logic as the API client for consistency
const getBackendUrl = (): string => {
  // Use BASE_URL from lib/api.ts which handles iOS/Android/Web correctly
  // This ensures WebSocket uses the same URL as REST API calls
  return BASE_URL;
};

export interface WorkoutData {
  activity: string;
  duration: number;
  difficulty?: string;
}

export interface UseElevenLabsVoiceOptions {
  onWorkoutData?: (data: WorkoutData) => void;
  onTranscript?: (transcript: string, speaker: 'user' | 'agent') => void;
  onAudio?: (audioData: string, format: string) => void; // base64 encoded audio
  onError?: (error: string) => void;
  onConnectionChange?: (connected: boolean) => void;
}

export interface VoiceState {
  isConnected: boolean;
  isListening: boolean;
  isRecording: boolean;
  conversationId: string | null;
  error: string | null;
}

export const useElevenLabsVoice = (options: UseElevenLabsVoiceOptions = {}) => {
  const [state, setState] = useState<VoiceState>({
    isConnected: false,
    isListening: false,
    isRecording: false,
    conversationId: null,
    error: null,
  });
  
  const [workoutData, setWorkoutDataState] = useState<WorkoutData | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const optionsRef = useRef(options);
  const isMountedRef = useRef(true);
  
  // Memoize backendUrl so it doesn't change on every render
  const backendUrl = useMemo(() => getBackendUrl(), []);

  // Update ref synchronously during render (this is safe and doesn't cause re-renders)
  optionsRef.current = options;

  // Update state helper - only update if component is still mounted
  const updateState = useCallback((updates: Partial<VoiceState>) => {
    if (isMountedRef.current) {
      setState(prev => ({ ...prev, ...updates }));
    }
  }, []);

  // Connect to WebSocket
  const connect = useCallback(async () => {
    try {
      updateState({ error: null });
      
      const wsUrl = backendUrl.replace('http://', 'ws://').replace('https://', 'wss://') + '/elevenlabs/ws/conversation';
      console.log('🔌 Connecting to WebSocket:', wsUrl);
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('✅ WebSocket connected successfully');
        console.log('🔍 WebSocket readyState:', ws.readyState, '(OPEN = 1)');
        // Only update state and call callbacks if component is still mounted
        if (isMountedRef.current) {
          updateState({ isConnected: true, error: null });
          optionsRef.current.onConnectionChange?.(true);
        }
      };

      ws.onmessage = async (event) => {
        // Only process messages if component is still mounted
        if (!isMountedRef.current) return;
        
        try {
          // Check if it's binary (audio) or text (JSON)
          if (event.data instanceof ArrayBuffer || event.data instanceof Blob) {
            console.log('Received audio data from backend');
          } else {
            // Handle JSON messages
            const message = JSON.parse(event.data as string);
            
            if (message.type === 'connected') {
              updateState({ conversationId: message.conversation_id });
            } else if (message.type === 'workout_data' && message.data) {
              const workout = message.data;
              if (isMountedRef.current) {
                setWorkoutDataState(workout);
                setWorkoutData(JSON.stringify(workout));
                optionsRef.current.onWorkoutData?.(workout);
              }
            } else if (message.type === 'transcript') {
              const speaker = message.speaker as 'user' | 'agent';
              console.log(`📥 Received transcript - ${speaker}: ${message.text}`);
              optionsRef.current.onTranscript?.(message.text, speaker);
            } else if (message.type === 'audio') {
              console.log('🎵 Received audio message from backend');
              // Handle audio from backend (ElevenLabs TTS)
              const audioData = message.data;
              const audioFormat = message.format || 'mp3';
              console.log(`🎵 Audio data length: ${audioData?.length || 0} chars, format: ${audioFormat}`);
              if (audioData && isMountedRef.current) {
                console.log('🎵 Calling onAudio callback...');
                // Call audio callback if provided
                optionsRef.current.onAudio?.(audioData, audioFormat);
              } else {
                console.warn('⚠️ Audio data missing or component unmounted');
              }
            } else if (message.type === 'transcript_received') {
              console.log('✅ Backend confirmed transcript receipt');
            } else if (message.type === 'error') {
              const errorMsg = message.message || 'Unknown error';
              updateState({ error: errorMsg });
              optionsRef.current.onError?.(errorMsg);
            } else if (message.type === 'started') {
              console.log('🎬 Started message received, setting isListening to true');
              updateState({ isListening: true });
              
              // AUTO-SEND: Send initial greeting transcript to trigger first response
              console.log('📤 Auto-sending initial greeting transcript...');
              if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                const greetingTranscript = 'Hello! I would like to log a workout.';
                console.log('📤 Sending initial transcript:', greetingTranscript);
                try {
                  wsRef.current.send(JSON.stringify({
                    type: 'transcript',
                    text: greetingTranscript
                  }));
                  console.log('✅ Initial greeting transcript sent successfully');
                  // Also update UI to show the user's initial message
                  optionsRef.current.onTranscript?.(greetingTranscript, 'user');
                } catch (error: any) {
                  console.error('❌ Error sending initial greeting transcript:', error);
                }
              } else {
                console.warn('⚠️ Cannot send initial greeting - WebSocket not open');
              }
            } else if (message.type === 'ended') {
              updateState({ isListening: false, isRecording: false });
            }
          }
        } catch (err: any) {
          console.error('Error parsing WebSocket message:', err);
          if (isMountedRef.current) {
            optionsRef.current.onError?.(`Error parsing message: ${err.message}`);
          }
        }
      };

      ws.onerror = (error: any) => {
        console.error('❌ WebSocket error:', error);
        // Only update state and call callbacks if component is still mounted
        if (isMountedRef.current) {
          const errorDetails = error?.message || error?.toString() || 'Unknown error';
          const errorMsg = `WebSocket connection error: ${errorDetails}. Make sure the backend server is running on ${backendUrl}`;
          console.error('Error details:', errorMsg);
          updateState({ error: errorMsg, isConnected: false });
          optionsRef.current.onError?.(errorMsg);
          optionsRef.current.onConnectionChange?.(false);
        }
      };

      ws.onclose = (event) => {
        console.log('🔌 WebSocket closed:', event.code, event.reason || 'No reason provided');
        // Only update state and call callbacks if component is still mounted
        if (isMountedRef.current) {
          updateState({ 
            isConnected: false, 
            isListening: false, 
            isRecording: false,
            conversationId: null 
          });
          optionsRef.current.onConnectionChange?.(false);
        }
        wsRef.current = null;
      };

      wsRef.current = ws;
    } catch (err: any) {
      console.error('❌ Failed to create WebSocket:', err);
      const errorMsg = `Failed to connect to ${backendUrl}: ${err.message}. Make sure the backend server is running.`;
      console.error('Connection error details:', errorMsg);
      if (isMountedRef.current) {
        updateState({ error: errorMsg });
        optionsRef.current.onError?.(errorMsg);
      }
    }
  }, [backendUrl, updateState]); // Remove 'options' from dependencies

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      // Remove event handlers to prevent them from firing
      wsRef.current.onopen = null;
      wsRef.current.onmessage = null;
      wsRef.current.onerror = null;
      wsRef.current.onclose = null;
      
      if (wsRef.current.readyState === WebSocket.OPEN) {
        try {
          wsRef.current.send(JSON.stringify({ type: 'end' }));
        } catch (e) {
          // Ignore errors
        }
      }
      try {
        wsRef.current.close();
      } catch (e) {
        // Ignore errors
      }
      wsRef.current = null;
    }
    // Only update state if component is still mounted
    if (isMountedRef.current) {
      updateState({ 
        isConnected: false, 
        isListening: false, 
        isRecording: false,
        conversationId: null 
      });
      optionsRef.current.onConnectionChange?.(false);
    }
  }, [updateState]);

  // Start conversation
  const startConversation = useCallback(async () => {
    console.log('🎤 Starting conversation...');
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.log('⚠️ WebSocket not open, connecting...');
      await connect();
      // Wait for connection
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('🔍 WebSocket state:', wsRef.current?.readyState);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log('📤 Sending start message...');
      wsRef.current.send(JSON.stringify({ type: 'start' }));
      updateState({ isListening: true });
      console.log('✅ Start message sent, conversation active');
    } else {
      const errorMsg = 'WebSocket not connected';
      console.error('❌ Cannot start conversation - WebSocket not connected. State:', wsRef.current?.readyState);
      updateState({ error: errorMsg });
      optionsRef.current.onError?.(errorMsg); // Use ref
    }
  }, [connect, updateState]); // Remove 'options' from dependencies

  // Stop conversation
  const stopConversation = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'stop' }));
    }
    updateState({ isListening: false, isRecording: false });
  }, [updateState]);

  // Send transcript to backend
  const sendTranscript = useCallback((transcript: string) => {
    console.log('📤 sendTranscript called with:', transcript);
    console.log('🔍 WebSocket ref exists:', !!wsRef.current);
    console.log('🔍 WebSocket readyState:', wsRef.current?.readyState, '(OPEN = 1)');
    
    if (!wsRef.current) {
      const errorMsg = 'WebSocket reference is null';
      console.error('❌', errorMsg);
      updateState({ error: errorMsg });
      optionsRef.current.onError?.(errorMsg);
      return;
    }
    
    if (wsRef.current.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({
        type: 'transcript',
        text: transcript
      });
      console.log('📤 Sending message to backend:', message);
      try {
        wsRef.current.send(message);
        console.log('✅ Message sent successfully');
        optionsRef.current.onTranscript?.(transcript, 'user'); // Use ref
      } catch (error: any) {
        console.error('❌ Error sending message:', error);
        updateState({ error: `Failed to send: ${error.message}` });
        optionsRef.current.onError?.(`Failed to send: ${error.message}`);
      }
    } else {
      const errorMsg = `WebSocket not connected. State: ${wsRef.current.readyState} (OPEN = 1)`;
      console.error('❌ Cannot send transcript -', errorMsg);
      updateState({ error: errorMsg });
      optionsRef.current.onError?.(errorMsg); // Use ref
    }
  }, [updateState]); // Remove 'options' from dependencies

  // Send workout data directly
  const sendWorkoutData = useCallback((data: WorkoutData) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'workout_data',
        data: data
      }));
      setWorkoutDataState(data);
      setWorkoutData(JSON.stringify(data));
      optionsRef.current.onWorkoutData?.(data); // Use ref
    }
  }, []); // Remove 'options' from dependencies

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      // Mark as unmounted to prevent state updates
      isMountedRef.current = false;
      
      // Close WebSocket connection
      if (wsRef.current) {
        // Remove event handlers to prevent them from firing after unmount
        wsRef.current.onopen = null;
        wsRef.current.onmessage = null;
        wsRef.current.onerror = null;
        wsRef.current.onclose = null;
        
        if (wsRef.current.readyState === WebSocket.OPEN) {
          try {
            wsRef.current.send(JSON.stringify({ type: 'end' }));
          } catch (e) {
            // Ignore errors when sending during cleanup
          }
        }
        try {
          wsRef.current.close();
        } catch (e) {
          // Ignore errors when closing during cleanup
        }
        wsRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, []); // Empty dependency array - only run on unmount

  return {
    ...state,
    workoutData,
    connect,
    disconnect,
    startConversation,
    stopConversation,
    sendTranscript,
    sendWorkoutData,
    backendUrl,
  };
};

