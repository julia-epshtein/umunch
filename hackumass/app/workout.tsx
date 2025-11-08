import { SafeAreaView, View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { BottomNavigation } from '../components/templates/BottomNavigation';
import { Card } from '../components/molecules/Card';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

interface Workout {
  id: string;
  type: string;
  duration: number;
  distance?: number;
  calories: number;
  date: Date;
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
  const [workouts, setWorkouts] = useState<Workout[]>([
    { id: '1', type: 'Indoor Run', duration: 35, distance: 7.12, calories: 452, date: new Date() },
    { id: '2', type: 'Outdoor Cycle', duration: 24, distance: 4.22, calories: 248, date: new Date() },
  ]);

  const handleAddWorkout = (workoutType: string) => {
    // In production, this would open a form to add workout details
    const newWorkout: Workout = {
      id: Date.now().toString(),
      type: workoutType,
      duration: 30,
      calories: 200,
      date: new Date(),
    };
    setWorkouts([...workouts, newWorkout]);
    setShowAddModal(false);
  };

  const handleEdit = (workoutId: string) => {
    // In production, open edit form
    console.log('Edit workout:', workoutId);
  };

  const handleDelete = (workoutId: string) => {
    setWorkouts(workouts.filter(w => w.id !== workoutId));
  };

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

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-6 pt-6 pb-24" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mb-6">
          <Text className="text-4xl font-bold text-gray-900 mb-2">Today</Text>
        </View>

        {/* Workout Cards */}
        {workouts.length > 0 ? (
          <View className="mb-6">
            {workouts.map((workout) => (
              <Card
                key={workout.id}
                className="mb-3 p-4 rounded-2xl"
                style={{ backgroundColor: getWorkoutBgColor(workout.type) }}
              >
                <View className="flex-row items-center">
                  {/* Left Icon */}
                  <View
                    className="w-14 h-14 rounded-full items-center justify-center mr-4"
                    style={{ backgroundColor: getWorkoutColor(workout.type) + '20' }}
                  >
                    <Ionicons
                      name={getWorkoutIcon(workout.type) as any}
                      size={28}
                      color={getWorkoutColor(workout.type)}
                    />
                  </View>

                  {/* Center Content */}
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-gray-900 mb-1">
                      {workout.type}
                    </Text>
                    <Text className="text-sm text-gray-600">
                      {workout.duration} min
                      {workout.distance && ` • ${workout.distance} km`}
                    </Text>
                  </View>

                  {/* Right Calories and Actions */}
                  <View className="items-end mr-2">
                    <View className="flex-row items-center mb-2">
                      <Ionicons name="flame" size={16} color="#f97316" />
                      <Text className="text-base font-bold text-gray-900 ml-1">
                        {workout.calories} kcal
                      </Text>
                    </View>
                    <View className="flex-row">
                      <TouchableOpacity
                        onPress={() => handleEdit(workout.id)}
                        className="mr-3"
                      >
                        <Ionicons name="create-outline" size={20} color="#6b7280" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDelete(workout.id)}
                      >
                        <Ionicons name="trash-outline" size={20} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        ) : (
          <View className="mb-6 p-8 items-center bg-gray-50 rounded-2xl">
            <Ionicons name="fitness-outline" size={48} color="#9ca3af" />
            <Text className="text-gray-500 text-center mt-4">No workouts logged today</Text>
          </View>
        )}

        {/* Add Workout Button */}
        <TouchableOpacity
          onPress={() => setShowAddModal(true)}
          className="py-4 rounded-xl items-center bg-teal-500"
        >
          <Text className="font-semibold text-lg text-white">+ Add Workout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Add Workout Slide-Out Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View className="flex-1 justify-end bg-black/30">
          <View 
            className="bg-pink-50 rounded-t-3xl"
            style={{ 
              height: '70%',
            }}
          >
            {/* Handle bar */}
            <View className="items-center pt-3 pb-2">
              <View className="w-12 h-1 bg-pink-300 rounded-full" />
            </View>

            {/* Header */}
            <View className="px-6 pt-4 pb-6 flex-row items-center justify-between">
              <Text className="text-2xl font-bold text-gray-900">Add Workout</Text>
              <TouchableOpacity
                onPress={() => setShowAddModal(false)}
                className="w-10 h-10 items-center justify-center bg-pink-200 rounded-full"
              >
                <Ionicons name="close" size={20} color="#9f1239" />
              </TouchableOpacity>
            </View>

            {/* Workout List */}
            <ScrollView className="px-6 pb-6" showsVerticalScrollIndicator={false}>
              {workoutTypes.map((workout) => (
                <TouchableOpacity
                  key={workout.id}
                  onPress={() => handleAddWorkout(workout.name)}
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
          </View>
        </View>
      </Modal>

      <BottomNavigation />
    </SafeAreaView>
  );
}
