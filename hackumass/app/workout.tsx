import { SafeAreaView, View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Alert, Animated } from 'react-native';
import { BottomNavigation } from '../components/templates/BottomNavigation';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useRef, useEffect } from 'react';
import { useElevenLabsVoice } from '../utils/useElevenLabsVoice';
import { audioService } from '../utils/audioService';

interface Workout {
  id: string;
  type: string;
  duration: number;
  distance?: number;
  calories: number;
  date: Date;
  completed?: boolean;
}

const workoutTypes = [
  { id: 'running', name: 'Running', icon: 'walk', color: '#3b82f6', bgColor: '#eff6ff' },
  { id: 'cycling', name: 'Cycling', icon: 'bicycle', color: '#14b8a6', bgColor: '#f0fdfa' },
  { id: 'yoga', name: 'Yoga', icon: 'leaf', color: '#8b5cf6', bgColor: '#f5f3ff' },
  { id: 'weight-training', name: 'Weight Training', icon: 'fitness', color: '#f97316', bgColor: '#fff7ed' },
  { id: 'swimming', name: 'Swimming', icon: 'water', color: '#06b6d4', bgColor: '#cffafe' },
  { id: 'walking', name: 'Walking', icon: 'walk', color: '#10b981', bgColor: '#d1fae5' },
];

export default function WorkoutPage() {
  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [selectedWorkoutType, setSelectedWorkoutType] = useState<string | null>(null);
  const [durationInput, setDurationInput] = useState('');
  const [workouts, setWorkouts] = useState<Workout[]>([
    { id: '1', type: 'Running', duration: 35, distance: 7.12, calories: 352, date: new Date(), completed: false },
    { id: '2', type: 'Outdoor Cycle', duration: 25, distance: 4.22, calories: 248, date: new Date(), completed: false },
  ]);
  const [undoWorkoutId, setUndoWorkoutId] = useState<string | null>(null);
  const undoTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Voice agent state
  const [transcriptInput, setTranscriptInput] = useState('');
  const [transcripts, setTranscripts] = useState<Array<{ speaker: 'user' | 'agent'; text: string }>>([]);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Voice agent hook
  const {
    isConnected,
    isListening,
    isRecording,
    error: voiceError,
    connect,
    disconnect,
    startConversation,
    stopConversation,
    sendTranscript,
  } = useElevenLabsVoice({
    onWorkoutData: (data) => {
      // Handle workout data from voice agent
      // Map activity to workout type name
      const workoutTypeName = data.activity || 'Workout';
      
      const newWorkout: Workout = {
        id: Date.now().toString(),
        type: workoutTypeName,
        duration: data.duration,
        calories: Math.round(data.duration * 6.5), // Rough estimate
        date: new Date(),
        completed: false,
      };
      
      setWorkouts(prev => [...prev, newWorkout]);
      
      // Show success message
      Alert.alert(
        'Workout Added!',
        `${workoutTypeName} for ${data.duration} minutes has been added.`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Optionally close voice modal
              setShowVoiceModal(false);
              stopConversation();
            },
          },
        ]
      );
    },
    onTranscript: (transcript, speaker) => {
      setTranscripts(prev => [...prev, { speaker, text: transcript }]);
      // Note: Audio is now handled separately via onAudio callback
    },
    onAudio: async (audioData, format) => {
      // Play audio from ElevenLabs
      try {
        console.log('🎵 Playing audio from ElevenLabs...');
        await audioService.playAudioFromBase64(audioData, format);
        console.log('✅ Audio played successfully');
      } catch (error: any) {
        console.error('❌ Error playing audio:', error);
        // Fallback to text-to-speech if audio playback fails
        const lastTranscript = transcripts[transcripts.length - 1];
        if (lastTranscript && lastTranscript.speaker === 'agent') {
          console.log('📢 Falling back to text-to-speech');
          audioService.speak(lastTranscript.text);
        }
      }
    },
    onError: (error) => {
      Alert.alert('Voice Agent Error', error);
    },
    onConnectionChange: (connected) => {
      if (!connected && showVoiceModal) {
        // Optionally close modal on disconnect
      }
    },
  });

  // Separate workouts into active and completed
  const activeWorkouts = workouts.filter(w => !w.completed);
  const completedWorkouts = workouts.filter(w => w.completed);

  const handleAddWorkout = (workoutType: string) => {
    setSelectedWorkoutType(workoutType);
  };

  const handleConfirmWorkout = () => {
    if (!selectedWorkoutType || !durationInput) {
      Alert.alert('Error', 'Please enter a duration');
      return;
    }
    
    const duration = parseInt(durationInput);
    if (isNaN(duration) || duration <= 0) {
      Alert.alert('Error', 'Please enter a valid duration');
      return;
    }

    const newWorkout: Workout = {
      id: Date.now().toString(),
      type: selectedWorkoutType,
      duration: duration,
      calories: Math.round(duration * 6.5), // Rough estimate
      date: new Date(),
      completed: false,
    };
    setWorkouts([...workouts, newWorkout]);
    setShowAddModal(false);
    setSelectedWorkoutType(null);
    setDurationInput('');
  };

  const handleEdit = (workoutId: string) => {
    // In production, open edit form
    console.log('Edit workout:', workoutId);
  };

  const handleLongPress = (workoutId: string) => {
    Alert.alert(
      'Delete Workout',
      'Are you sure you want to delete this workout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => setWorkouts(workouts.filter(w => w.id !== workoutId))
        },
      ]
    );
  };

  const handleMarkComplete = (workoutId: string) => {
    // Clear any existing undo timer
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
    }
    
    // Mark as completed
    setWorkouts(workouts.map(w => 
      w.id === workoutId ? { ...w, completed: true } : w
    ));
    
    // Set up undo
    setUndoWorkoutId(workoutId);
    
    // Clear undo after 8 seconds
    undoTimerRef.current = setTimeout(() => {
      setUndoWorkoutId(null);
    }, 8000);
  };

  const handleUndo = () => {
    if (undoWorkoutId) {
      setWorkouts(workouts.map(w => 
        w.id === undoWorkoutId ? { ...w, completed: false } : w
      ));
      setUndoWorkoutId(null);
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current);
      }
    }
  };

  const handleUndoMarkComplete = (workoutId: string) => {
    setWorkouts(workouts.map(w => 
      w.id === workoutId ? { ...w, completed: false } : w
    ));
  };

  // Handle microphone button click
  const handleMicButtonPress = async () => {
    try {
      // Request permissions
      const hasPermission = await audioService.requestPermissions();
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Microphone permission is required to use the voice agent.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Open voice modal
      setShowVoiceModal(true);
      
      // Connect and start conversation
      await connect();
      await startConversation();
      
    } catch (error: any) {
      Alert.alert('Error', `Failed to start voice agent: ${error.message}`);
    }
  };

  // Handle manual transcript submission
  const handleSendTranscript = () => {
    console.log('📤 handleSendTranscript called with:', transcriptInput);
    if (transcriptInput.trim()) {
      console.log('📤 Sending transcript:', transcriptInput.trim());
      sendTranscript(transcriptInput.trim());
      setTranscriptInput('');
    } else {
      console.warn('⚠️ Cannot send empty transcript');
    }
  };

  // Animate mic icon when listening
  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening, pulseAnim]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current);
      }
      // Don't call disconnect() here - it updates state which causes re-renders
      // Instead, just close the WebSocket directly if needed
      // The hook's own cleanup will handle the WebSocket cleanup
      audioService.cleanup();
    };
  }, []); // Empty array - only run on unmount

  const getWorkoutMatch = (type: string) => {
    const typeLower = type.toLowerCase();
    // Check for key words to match workout types
    if (typeLower.includes('run')) return workoutTypes.find(w => w.name.toLowerCase().includes('run'));
    if (typeLower.includes('cycle') || typeLower.includes('bike')) return workoutTypes.find(w => w.name.toLowerCase().includes('cycl'));
    if (typeLower.includes('yoga')) return workoutTypes.find(w => w.name.toLowerCase().includes('yoga'));
    if (typeLower.includes('weight') || typeLower.includes('train')) return workoutTypes.find(w => w.name.toLowerCase().includes('weight'));
    if (typeLower.includes('swim')) return workoutTypes.find(w => w.name.toLowerCase().includes('swim'));
    if (typeLower.includes('walk')) return workoutTypes.find(w => w.name.toLowerCase().includes('walk'));
    // Fallback to direct match
    return workoutTypes.find(w => 
      typeLower.includes(w.name.toLowerCase()) || w.name.toLowerCase().includes(typeLower)
    );
  };

  const getWorkoutIcon = (type: string) => {
    const workout = getWorkoutMatch(type);
    return workout?.icon || 'fitness';
  };

  const getWorkoutColor = (type: string) => {
    const workout = getWorkoutMatch(type);
    return workout?.color || '#6b7280';
  };

  const getWorkoutBgColor = (type: string) => {
    const workout = getWorkoutMatch(type);
    return workout?.bgColor || '#f3f4f6';
  };

  const renderWorkoutCard = (workout: Workout, isCompleted: boolean = false) => (
    <TouchableOpacity
      key={workout.id}
      onLongPress={() => handleLongPress(workout.id)}
      activeOpacity={0.7}
      style={{ marginBottom: 24 }} // More spacing between cards
    >
      <View
        className="p-6 rounded-2xl"
        style={{ 
          backgroundColor: getWorkoutBgColor(workout.type),
          opacity: isCompleted ? 0.7 : 1,
          minHeight: 160,
          borderWidth: 2,
          borderColor: getWorkoutColor(workout.type) + '30', // Semi-transparent border matching the workout color
          shadowColor: getWorkoutColor(workout.type),
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <View className="flex-col">
          {/* Top Section: Icon, Name, Details, Calories */}
          <View className="flex-row items-start mb-5">
            {/* Left Icon */}
            <View
              className="w-18 h-18 rounded-full items-center justify-center mr-4"
              style={{ backgroundColor: getWorkoutColor(workout.type) + '25' }}
            >
              <Ionicons
                name={getWorkoutIcon(workout.type) as any}
                size={36}
                color={getWorkoutColor(workout.type)}
              />
            </View>

            {/* Center Content */}
            <View className="flex-1">
              <View className="flex-row items-center mb-2">
                <Text className={`text-xl font-bold text-gray-900 mr-2 ${
                  isCompleted ? 'line-through' : ''
                }`}>
                  {workout.type}
                </Text>
                {isCompleted && (
                  <Ionicons name="checkmark-circle" size={22} color="#10b981" />
                )}
              </View>
              <Text className="text-base text-gray-600 mb-3">
                {workout.duration} min
              </Text>
              <View className="flex-row items-center">
                <Ionicons name="flame" size={18} color="#f97316" />
                <Text className="text-lg font-bold text-gray-900 ml-2">
                  {workout.calories} kcal
                </Text>
              </View>
            </View>
          </View>

          {/* Bottom Section: Mark Complete / Undo Mark Complete Button */}
          {!isCompleted ? (
            <TouchableOpacity
              onPress={() => handleMarkComplete(workout.id)}
              className="w-full py-4 rounded-xl items-center justify-center"
              style={{
                backgroundColor: getWorkoutColor(workout.type) + '85', // 85 = ~52% opacity
                shadowColor: getWorkoutColor(workout.type),
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Text className="text-white font-semibold text-base">Mark Complete</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => handleUndoMarkComplete(workout.id)}
              className="w-full py-4 bg-gray-200 rounded-xl items-center justify-center"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
              }}
            >
              <Text className="text-gray-700 font-semibold text-base">Undo Mark Complete</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-6 pt-6 pb-24" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mb-8">
          <Text className="text-4xl font-bold text-gray-900">Today</Text>
        </View>

        {/* Undo Toast */}
        {undoWorkoutId && (
          <View className="mb-5 p-4 bg-gray-800 rounded-xl flex-row items-center justify-between"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 4,
            }}
          >
            <Text className="text-white font-medium text-base">Workout marked as complete</Text>
            <TouchableOpacity onPress={handleUndo}>
              <Text className="text-teal-400 font-semibold text-base">Undo</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Today's Workouts Section */}
        {activeWorkouts.length > 0 ? (
          <View className="mb-8">
            <Text className="text-2xl font-bold text-gray-900 mb-4">Today's Workouts</Text>
            {activeWorkouts.map(workout => renderWorkoutCard(workout, false))}
          </View>
        ) : (
          <View className="mb-8 p-10 items-center bg-gray-50 rounded-2xl"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 1,
            }}
          >
            <Ionicons name="fitness-outline" size={56} color="#9ca3af" />
            <Text className="text-gray-500 text-center mt-4 text-base">No workouts logged today</Text>
          </View>
        )}

        {/* Completed Workouts Section - Only show if there are completed workouts */}
        {completedWorkouts.length > 0 && (
          <View className="mb-8">
            <Text className="text-2xl font-bold text-gray-900 mb-4">Completed Workouts</Text>
            {completedWorkouts.map(workout => renderWorkoutCard(workout, true))}
          </View>
        )}

        {/* Add Workout Button */}
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => setShowAddModal(true)}
            className="flex-1 py-5 rounded-xl items-center bg-teal-500 mr-3"
            style={{
              shadowColor: '#14b8a6',
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.3,
              shadowRadius: 6,
              elevation: 5,
            }}
          >
            <Text className="font-semibold text-lg text-white">+ Add Workout</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleMicButtonPress}
            className="w-14 h-14 rounded-xl items-center justify-center"
            style={{
              backgroundColor: isListening ? '#10b981' : '#14b8a6',
              shadowColor: isListening ? '#10b981' : '#14b8a6',
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.3,
              shadowRadius: 6,
              elevation: 5,
            }}
          >
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Ionicons 
                name={isListening ? "mic" : "mic-outline"} 
                size={24} 
                color="white" 
              />
            </Animated.View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Add Workout Slide-Out Modal - White Background */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowAddModal(false);
          setSelectedWorkoutType(null);
          setDurationInput('');
        }}
      >
        <View className="flex-1 justify-end bg-black/30">
          <View 
            className="bg-white rounded-t-3xl"
            style={{ 
              height: '70%',
            }}
          >
            {/* Handle bar */}
            <View className="items-center pt-3 pb-2">
              <View className="w-12 h-1 bg-gray-300 rounded-full" />
            </View>

            {/* Header */}
            <View className="px-6 pt-4 pb-6 flex-row items-center justify-between">
              <Text className="text-2xl font-bold text-gray-900">
                {selectedWorkoutType ? 'Enter Duration' : 'Add Workout'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowAddModal(false);
                  setSelectedWorkoutType(null);
                  setDurationInput('');
                }}
                className="w-10 h-10 items-center justify-center bg-gray-100 rounded-full"
              >
                <Ionicons name="close" size={20} color="#374151" />
              </TouchableOpacity>
            </View>

            {/* Duration Input or Workout List */}
            {selectedWorkoutType ? (
              <View className="px-6 pb-6">
                <Text className="text-lg font-semibold text-gray-900 mb-2">
                  {selectedWorkoutType}
                </Text>
                <Text className="text-base text-gray-600 mb-4">
                  How long did you work out? (in minutes)
                </Text>
                <View className="flex-row items-center mb-6">
                  <TextInput
                    value={durationInput}
                    onChangeText={setDurationInput}
                    placeholder="e.g., 30"
                    keyboardType="numeric"
                    className="flex-1 bg-gray-50 border-2 border-gray-300 rounded-xl px-4 py-4 text-gray-900 text-lg"
                  />
                  <TouchableOpacity
                    className="ml-3 w-14 h-14 bg-teal-500 rounded-xl items-center justify-center"
                    style={{
                      shadowColor: '#14b8a6',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                      elevation: 3,
                    }}
                  >
                    <Ionicons name="mic" size={24} color="white" />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  onPress={handleConfirmWorkout}
                  disabled={!durationInput}
                  className={`py-4 rounded-xl items-center ${
                    durationInput ? 'bg-teal-500' : 'bg-gray-300'
                  }`}
                >
                  <Text className={`font-semibold text-lg ${
                    durationInput ? 'text-white' : 'text-gray-500'
                  }`}>
                    Confirm
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                  setSelectedWorkoutType(null);
                  setDurationInput('');
                }}
                  className="py-4 rounded-xl items-center mt-3"
                >
                  <Text className="font-semibold text-lg text-gray-600">Back</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView className="px-6 pb-6" showsVerticalScrollIndicator={false}>
                {workoutTypes.map((workout) => (
                  <TouchableOpacity
                    key={workout.id}
                    onPress={() => handleAddWorkout(workout.name)}
                    className="mb-3 p-4 rounded-2xl flex-row items-center"
                    style={{ 
                      backgroundColor: workout.bgColor,
                      shadowColor: '#000', 
                      shadowOffset: { width: 0, height: 1 }, 
                      shadowOpacity: 0.1, 
                      shadowRadius: 2, 
                      elevation: 2 
                    }}
                  >
                    {/* Left Icon */}
                    <View
                      className="w-14 h-14 rounded-full items-center justify-center mr-4"
                      style={{ backgroundColor: workout.bgColor }}
                    >
                      <Ionicons
                        name={workout.icon as any}
                        size={24}
                        color={workout.color}
                      />
                    </View>
                    
                    {/* Right Content */}
                    <View className="flex-1">
                      <Text className="text-lg font-bold text-gray-900">
                        {workout.name}
                      </Text>
                    </View>
                    
                    {/* Chevron */}
                    <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Voice Agent Modal */}
      <Modal
        visible={showVoiceModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          stopConversation();
          setShowVoiceModal(false);
          setTranscripts([]);
          setTranscriptInput('');
        }}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View 
            className="bg-white rounded-t-3xl"
            style={{ 
              height: '80%',
            }}
          >
            {/* Handle bar */}
            <View className="items-center pt-3 pb-2">
              <View className="w-12 h-1 bg-gray-300 rounded-full" />
            </View>

            {/* Header */}
            <View className="px-6 pt-4 pb-6 flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-2xl font-bold text-gray-900">Voice Agent</Text>
                <View className="flex-row items-center mt-1">
                  <View className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                  <Text className="text-sm text-gray-600">
                    {isConnected ? 'Connected' : 'Disconnected'}
                    {isListening && ' • Listening'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => {
                  stopConversation();
                  setShowVoiceModal(false);
                  setTranscripts([]);
                  setTranscriptInput('');
                }}
                className="w-10 h-10 items-center justify-center bg-gray-100 rounded-full"
              >
                <Ionicons name="close" size={20} color="#374151" />
              </TouchableOpacity>
            </View>

            {/* Error Display */}
            {voiceError && (
              <View className="mx-6 mb-4 p-3 bg-red-50 rounded-xl">
                <Text className="text-sm text-red-600">{voiceError}</Text>
              </View>
            )}

            {/* Transcripts */}
            <ScrollView className="px-6 flex-1" showsVerticalScrollIndicator={false}>
              {transcripts.length === 0 ? (
                <View className="py-8 items-center">
                  <Ionicons name="chatbubbles-outline" size={48} color="#9ca3af" />
                  <Text className="text-gray-500 text-center mt-4">
                    Start speaking to log your workout!
                  </Text>
                  <Text className="text-gray-400 text-center mt-2 text-sm">
                    Describe your workout activity and duration
                  </Text>
                </View>
              ) : (
                transcripts.map((transcript, index) => (
                  <View
                    key={index}
                    className={`mb-3 p-3 rounded-xl ${
                      transcript.speaker === 'user' ? 'bg-teal-50 ml-8' : 'bg-blue-50 mr-8'
                    }`}
                  >
                    <Text className="text-xs text-gray-500 mb-1 uppercase">
                      {transcript.speaker}
                    </Text>
                    <Text className="text-base text-gray-900">{transcript.text}</Text>
                  </View>
                ))
              )}
            </ScrollView>

            {/* Manual Transcript Input (for testing) */}
            <View className="px-6 pb-6 border-t border-gray-200 pt-4">
              <Text className="text-sm text-gray-600 mb-2">Or type your workout:</Text>
              <View className="flex-row items-center">
                <TextInput
                  value={transcriptInput}
                  onChangeText={setTranscriptInput}
                  placeholder="Describe your workout (e.g., activity and duration)"
                  className="flex-1 bg-gray-50 border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-900"
                  onSubmitEditing={handleSendTranscript}
                />
                <TouchableOpacity
                  onPress={handleSendTranscript}
                  disabled={!transcriptInput.trim() || !isConnected}
                  className={`ml-3 w-12 h-12 rounded-xl items-center justify-center ${
                    transcriptInput.trim() && isConnected ? 'bg-teal-500' : 'bg-gray-300'
                  }`}
                >
                  <Ionicons 
                    name="send" 
                    size={20} 
                    color={transcriptInput.trim() && isConnected ? "white" : "#9ca3af"} 
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <BottomNavigation />
    </SafeAreaView>
  );
}
