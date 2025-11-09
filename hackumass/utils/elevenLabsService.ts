/**
 * Service for integrating with ElevenLabs React Native SDK
 * Handles voice conversations and WebSocket communication with backend
 */

import { setWorkoutData } from './workoutStore';
import { BASE_URL } from '../lib/api'; // Use the same BASE_URL as the API client

// Get backend URL - use the same logic as the API client for consistency
const getBackendUrl = (): string => {
  // Use BASE_URL from lib/api.ts which handles iOS/Android/Web correctly
  // This ensures ElevenLabs service uses the same URL as REST API calls
  return BASE_URL;
};

export interface ElevenLabsConfig {
  agent_id: string;
  ws_url: string;
  backend_url: string;
}

export interface WorkoutData {
  activity: string;
  duration: number;
  difficulty?: string;
}

export interface VoiceCallbacks {
  onWorkoutData?: (data: WorkoutData) => void;
  onTranscript?: (transcript: string, speaker?: 'user' | 'agent') => void;
  onError?: (error: string) => void;
  onAgentResponse?: (response: string) => void;
  onConnectionChange?: (connected: boolean) => void;
  onAudio?: (audioData: string, format: string) => void; // base64 encoded audio
}

class ElevenLabsService {
  private conversation: any = null;
  private wsConnection: WebSocket | null = null;
  private config: ElevenLabsConfig | null = null;
  private callbacks: VoiceCallbacks = {};
  private conversationId: string | null = null;
  private isConnected = false;

  /**
   * Get configuration from backend
   */
  async getConfig(): Promise<ElevenLabsConfig | null> {
    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/elevenlabs/config`);
      if (!response.ok) {
        throw new Error(`Failed to fetch config: ${response.status}`);
      }
      this.config = await response.json();
      return this.config;
    } catch (error: any) {
      console.error('Failed to get ElevenLabs config:', error);
      this.callbacks.onError?.(`Failed to get configuration: ${error.message}`);
      return null;
    }
  }

  /**
   * Connect to backend WebSocket for transcript processing
   */
  private async connectWebSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const backendUrl = getBackendUrl();
        const wsUrl = backendUrl.replace('http://', 'ws://').replace('https://', 'wss://') + '/elevenlabs/ws/conversation';
        
        this.wsConnection = new WebSocket(wsUrl);
        
        this.wsConnection.onopen = () => {
          this.isConnected = true;
          this.callbacks.onConnectionChange?.(true);
          resolve();
        };

        this.wsConnection.onmessage = async (event) => {
          try {
            // Check if it's binary (audio) or text (JSON)
            if (event.data instanceof ArrayBuffer || event.data instanceof Blob) {
              console.log('Received audio data from backend');
              // Handle binary audio data if needed
            } else {
              // Handle JSON messages
              const message = JSON.parse(event.data as string);
              
              if (message.type === 'connected') {
                this.conversationId = message.conversation_id;
                this.callbacks.onConnectionChange?.(true);
              } else if (message.type === 'workout_data' && message.data) {
                const workout = message.data;
                setWorkoutData(JSON.stringify(workout));
                this.callbacks.onWorkoutData?.(workout);
              } else if (message.type === 'transcript') {
                const speaker = message.speaker as 'user' | 'agent';
                console.log(`📥 Received transcript - ${speaker}: ${message.text}`);
                this.callbacks.onTranscript?.(message.text, speaker);
                if (speaker === 'agent') {
                  this.callbacks.onAgentResponse?.(message.text);
                }
              } else if (message.type === 'audio') {
                console.log('🎵 Received audio message from backend');
                // Handle audio from backend (ElevenLabs TTS)
                const audioData = message.data;
                const audioFormat = message.format || 'mp3';
                console.log(`🎵 Audio data length: ${audioData?.length || 0} chars, format: ${audioFormat}`);
                if (audioData) {
                  this.callbacks.onAudio?.(audioData, audioFormat);
                }
              } else if (message.type === 'transcript_received') {
                console.log('✅ Backend confirmed transcript receipt');
              } else if (message.type === 'started') {
                console.log('🎬 Conversation started');
                // Conversation is ready for input
              } else if (message.type === 'ended') {
                console.log('🔌 Conversation ended');
                this.isConnected = false;
                this.callbacks.onConnectionChange?.(false);
              } else if (message.type === 'error') {
                const errorMsg = message.message || 'Unknown error';
                console.error('❌ Backend error:', errorMsg);
                this.callbacks.onError?.(errorMsg);
              }
            }
          } catch (err) {
            console.error('Error parsing WebSocket message:', err);
            this.callbacks.onError?.(`Error parsing message: ${err instanceof Error ? err.message : 'Unknown error'}`);
          }
        };

        this.wsConnection.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnected = false;
          this.callbacks.onConnectionChange?.(false);
          reject(error);
        };

        this.wsConnection.onclose = () => {
          this.isConnected = false;
          this.callbacks.onConnectionChange?.(false);
          this.wsConnection = null;
          this.conversationId = null;
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Send transcript to backend
   */
  private sendTranscript(transcript: string): void {
    if (this.wsConnection && this.wsConnection.readyState === WebSocket.OPEN) {
      this.wsConnection.send(JSON.stringify({
        type: 'transcript',
        text: transcript
      }));
      // Notify that user transcript was sent (user is sending this)
      this.callbacks.onTranscript?.(transcript, 'user');
    } else {
      console.warn('WebSocket not connected, cannot send transcript');
    }
  }

  /**
   * Start voice conversation with ElevenLabs agent
   */
  async startConversation(callbacks: VoiceCallbacks = {}): Promise<void> {
    try {
      this.callbacks = callbacks;

      // Get config if not already loaded
      if (!this.config) {
        const configData = await this.getConfig();
        if (!configData) {
          throw new Error('Failed to get agent configuration');
        }
      }

      // Connect to backend WebSocket first
      await this.connectWebSocket();

      // Send start message to begin conversation
      if (this.wsConnection && this.wsConnection.readyState === WebSocket.OPEN) {
        this.wsConnection.send(JSON.stringify({ type: 'start' }));
      }

      // Initialize ElevenLabs SDK
      // Note: The actual SDK API may vary - adjust based on @elevenlabs/react-native documentation
      try {
        // Dynamic import to handle cases where SDK might not be available
        const ElevenLabsModule = require('@elevenlabs/react-native');
        
        // Initialize conversation with agent
        // This is a placeholder - adjust based on actual SDK API
        if (ElevenLabsModule.ElevenLabs) {
          const elevenLabs = new ElevenLabsModule.ElevenLabs({
            apiKey: process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY, // You may need to pass this
          });

          this.conversation = await elevenLabs.startConversation({
            agentId: this.config!.agent_id,
            onUserTranscript: (transcript: string) => {
              this.sendTranscript(transcript);
            },
            onAgentResponse: (response: string) => {
              this.callbacks.onAgentResponse?.(response);
            },
            onError: (error: Error) => {
              this.callbacks.onError?.(error.message);
            },
          });
        } else if (ElevenLabsModule.default) {
          // Alternative SDK structure
          this.conversation = await ElevenLabsModule.default.startConversation({
            agentId: this.config!.agent_id,
            onUserTranscript: (transcript: string) => {
              this.sendTranscript(transcript);
            },
            onAgentResponse: (response: string) => {
              this.callbacks.onAgentResponse?.(response);
            },
            onError: (error: Error) => {
              this.callbacks.onError?.(error.message);
            },
          });
        } else {
          // Fallback: If SDK structure is different, log and continue with WebSocket only
          console.warn('ElevenLabs SDK structure not recognized. Using WebSocket-only mode.');
          // You can still send manual transcripts via sendTranscript method
        }
      } catch (sdkError: any) {
        console.error('ElevenLabs SDK initialization error:', sdkError);
        // Continue with WebSocket connection even if SDK fails
        // This allows manual transcript sending as fallback
        this.callbacks.onError?.(`SDK initialization failed: ${sdkError.message}. WebSocket connection established.`);
      }

      console.log('Voice conversation started');
    } catch (error: any) {
      const errorMsg = `Failed to start conversation: ${error.message}`;
      this.callbacks.onError?.(errorMsg);
      throw error;
    }
  }

  /**
   * Stop voice conversation
   */
  async stopConversation(): Promise<void> {
    try {
      // Stop ElevenLabs conversation
      if (this.conversation && typeof this.conversation.stop === 'function') {
        await this.conversation.stop();
      } else if (this.conversation && typeof this.conversation.end === 'function') {
        await this.conversation.end();
      }
      this.conversation = null;
    } catch (error) {
      console.error('Error stopping ElevenLabs conversation:', error);
    }

    // Close WebSocket connection
    if (this.wsConnection) {
      if (this.wsConnection.readyState === WebSocket.OPEN) {
        this.wsConnection.send(JSON.stringify({ type: 'end' }));
      }
      this.wsConnection.close();
      this.wsConnection = null;
    }

    this.isConnected = false;
    this.callbacks.onConnectionChange?.(false);
    this.conversationId = null;
  }

  /**
   * Manually send a transcript (useful for testing or alternative input methods)
   */
  sendManualTranscript(transcript: string): void {
    this.sendTranscript(transcript);
  }

  /**
   * Check if conversation is active
   */
  isActive(): boolean {
    return this.conversation !== null || this.isConnected;
  }

  /**
   * Get current conversation ID
   */
  getConversationId(): string | null {
    return this.conversationId;
  }

  /**
   * Get current configuration
   */
  getConfigData(): ElevenLabsConfig | null {
    return this.config;
  }
}

export const elevenLabsService = new ElevenLabsService();

