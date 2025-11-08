import { SafeAreaView, View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { BottomNavigation } from '../components/templates/BottomNavigation';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

const workoutTypes = [
  { id: 'bicep', name: 'Bicep', icon: 'fitness', description: 'Arm strength training' },
  { id: 'body-back', name: 'Body-Back', icon: 'body', description: 'Back muscle exercises' },
  { id: 'body-butt', name: 'Body-Butt', icon: 'body', description: 'Glute strengthening' },
  { id: 'legs-core', name: 'Legs and Core', icon: 'fitness', description: 'Lower body and core' },
  { id: 'pectoral', name: 'Pectoral machine', icon: 'fitness', description: 'Chest exercises' },
  { id: 'legs-core-2', name: 'Legs & Core', icon: 'fitness', description: 'Balance and strength' },
  { id: 'weight-bench', name: 'Weight bench', icon: 'fitness', description: 'Full body workout' },
  { id: 'running', name: 'Running', icon: 'walk', description: 'Cardio exercise' },
  { id: 'cycling', name: 'Cycling', icon: 'bicycle', description: 'Low impact cardio' },
  { id: 'yoga', name: 'Yoga', icon: 'leaf', description: 'Flexibility and mindfulness' },
];

export default function WorkoutPage() {
  const router = useRouter();
  const [showWorkoutModal, setShowWorkoutModal] = useState(true);
  const [selectedWorkout, setSelectedWorkout] = useState<string | null>(null);

  const handleWorkoutSelect = (workoutId: string) => {
    setSelectedWorkout(workoutId);
    // In production, navigate to workout detail or start workout
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Modal
        visible={showWorkoutModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowWorkoutModal(false);
          router.back();
        }}
      >
        <View className="flex-1 justify-end bg-black/30">
          <View 
            className="bg-pink-50 rounded-t-3xl"
            style={{ 
              height: '90%', // Increased height for more full-screen feel
            }}
          >
            {/* Handle bar */}
            <View className="items-center pt-3 pb-2">
              <View className="w-12 h-1 bg-pink-300 rounded-full" />
            </View>

            {/* Header */}
            <View className="px-6 pt-4 pb-6 flex-row items-center justify-between">
              <Text className="text-3xl font-bold text-gray-900">Start Workout</Text>
              <View className="flex-row items-center">
                <TouchableOpacity
                  onPress={() => {
                    setShowWorkoutModal(false);
                    router.back();
                  }}
                  className="w-10 h-10 items-center justify-center bg-pink-200 rounded-full mr-2"
                >
                  <Ionicons name="close" size={20} color="#9f1239" />
                </TouchableOpacity>
                <TouchableOpacity className="w-10 h-10 items-center justify-center bg-pink-200 rounded-full">
                  <Ionicons name="ellipsis-vertical" size={20} color="#9f1239" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Play Button - Centered */}
            <View className="items-center mb-6">
              <TouchableOpacity className="w-20 h-20 bg-pink-500 rounded-full items-center justify-center shadow-lg">
                <Ionicons name="play" size={32} color="white" />
              </TouchableOpacity>
            </View>

            {/* Workout List */}
            <ScrollView className="px-6 pb-6" showsVerticalScrollIndicator={false}>
              {workoutTypes.map((workout) => (
                <TouchableOpacity
                  key={workout.id}
                  onPress={() => handleWorkoutSelect(workout.id)}
                  className="mb-3 p-4 bg-white rounded-2xl flex-row items-center"
                  style={{ 
                    shadowColor: '#000', 
                    shadowOffset: { width: 0, height: 1 }, 
                    shadowOpacity: 0.1, 
                    shadowRadius: 2, 
                    elevation: 2 
                  }}
                >
                  {/* Left Icon */}
                  <View className="w-14 h-14 rounded-full bg-pink-100 items-center justify-center mr-4">
                    <Ionicons 
                      name={workout.icon as any} 
                      size={24} 
                      color="#ec4899" 
                    />
                  </View>
                  
                  {/* Right Content */}
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-gray-900 mb-1">
                      {workout.name}
                    </Text>
                    <Text className="text-sm text-gray-600">
                      {workout.description}
                    </Text>
                  </View>
                  
                  {/* Chevron */}
                  <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
      <BottomNavigation />
    </SafeAreaView>
  );
}
