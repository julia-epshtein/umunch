import { SafeAreaView, View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { BottomNavigation } from '../components/templates/BottomNavigation';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useRef, useEffect } from 'react';

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
  const [selectedWorkoutType, setSelectedWorkoutType] = useState<string | null>(null);
  const [durationInput, setDurationInput] = useState('');
  const [workouts, setWorkouts] = useState<Workout[]>([
    { id: '1', type: 'Indoor Run', duration: 35, distance: 7.12, calories: 452, date: new Date(), completed: false },
    { id: '2', type: 'Outdoor Cycle', duration: 24, distance: 4.22, calories: 248, date: new Date(), completed: false },
  ]);
  const [undoWorkoutId, setUndoWorkoutId] = useState<string | null>(null);
  const undoTimerRef = useRef<NodeJS.Timeout | null>(null);

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

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current);
      }
    };
  }, []);

  const getWorkoutIcon = (type: string) => {
    const workout = workoutTypes.find(w => type.toLowerCase().includes(w.name.toLowerCase()));
    return workout?.icon || 'fitness';
  };

  const getWorkoutColor = (type: string) => {
    const workout = workoutTypes.find(w => type.toLowerCase().includes(w.name.toLowerCase()));
    return workout?.color || '#6b7280';
  };

  const getWorkoutBgColor = (type: string) => {
    const workout = workoutTypes.find(w => type.toLowerCase().includes(w.name.toLowerCase()));
    return workout?.bgColor || '#f3f4f6';
  };

  const renderWorkoutCard = (workout: Workout, isCompleted: boolean = false) => (
    <TouchableOpacity
      key={workout.id}
      onLongPress={() => handleLongPress(workout.id)}
      activeOpacity={0.7}
      style={{ marginBottom: 20 }} // Increased vertical spacing
    >
      <View
        className="p-5 rounded-2xl"
        style={{ 
          backgroundColor: getWorkoutBgColor(workout.type),
          opacity: isCompleted ? 0.7 : 1,
          minHeight: 160, // Taller containers
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.12,
          shadowRadius: 6,
          elevation: 4,
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
              className="w-full py-4 bg-teal-500 rounded-xl items-center justify-center"
              style={{
                shadowColor: '#14b8a6',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
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
        <TouchableOpacity
          onPress={() => setShowAddModal(true)}
          className="py-5 rounded-xl items-center bg-teal-500"
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
                <TextInput
                  value={durationInput}
                  onChangeText={setDurationInput}
                  placeholder="e.g., 30"
                  keyboardType="numeric"
                  className="bg-gray-50 border-2 border-gray-300 rounded-xl px-4 py-4 text-gray-900 text-lg mb-6"
                />
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

      <BottomNavigation />
    </SafeAreaView>
  );
}
