import { SafeAreaView, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { BottomNavigation } from '../components/templates/BottomNavigation';
import { Card } from '../components/molecules/Card';
import { MealTracker } from '../components/organisms/MealTracker';
import { DonutChart, TripleDonutChart } from '../components/molecules';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

export default function DashboardPage() {
  const router = useRouter();

  // Sample data - in production, this would come from state/API
  const summary = 'Focused';
  const calories = { consumed: 1200, goal: 2000 };
  const macros = {
    carbs: { consumed: 225, goal: 250, label: 'Carbs', color: '#f97316', backgroundColor: '#fff7ed' },
    protein: { consumed: 150, goal: 150, label: 'Protein', color: '#3b82f6', backgroundColor: '#eff6ff' },
    fat: { consumed: 67, goal: 67, label: 'Fat', color: '#eab308', backgroundColor: '#fefce8' },
  };
  const [workout, setWorkout] = useState<{ name: string; duration: number; calories: number } | null>(null);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-6 pt-6 pb-24" showsVerticalScrollIndicator={false}>
        {/* One-word summary */}
        <View className="mb-6">
          <Text className="text-5xl font-bold text-gray-900 mb-2">{summary}</Text>
          <Text className="text-lg text-gray-600">Today's Status</Text>
        </View>

        {/* Calories Donut Chart Section */}
        <Card className="mb-4 bg-teal-50">
          <Text className="text-xl font-bold text-gray-900 mb-4">Calories</Text>
          <View className="items-center">
            <DonutChart
              value={calories.consumed}
              max={calories.goal}
              size={140}
              strokeWidth={14}
              color="#14b8a6"
              backgroundColor="#e0f2f1"
              showPercentage={true}
            />
            <View className="mt-4 items-center">
              <Text className="text-2xl font-bold text-gray-900">
                {calories.consumed} / {calories.goal}
              </Text>
              <Text className="text-sm text-gray-600">calories consumed</Text>
            </View>
          </View>
        </Card>

        {/* Macros Section */}
        <Card className="mb-4 bg-pink-50">
          <Text className="text-xl font-bold text-gray-900 mb-4">Macros</Text>
          <TripleDonutChart
            carbs={macros.carbs}
            protein={macros.protein}
            fat={macros.fat}
          />
        </Card>

        {/* Daily Status - Moved below Macros */}
        <Card className="mb-4 bg-green-50">
          <Text className="text-xl font-bold text-gray-900 mb-3">Daily Status</Text>
          <View className="flex-row justify-between">
            <View className="flex-1 mr-2">
              <View className="bg-teal-100 p-3 rounded-xl">
                <Text className="text-teal-700 font-semibold">Meals: 3/3</Text>
              </View>
            </View>
            <View className="flex-1 ml-2">
              <View className="bg-green-100 p-3 rounded-xl">
                <Text className="text-green-700 font-semibold">Workout: {workout ? 'Done' : 'Pending'}</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Workout Section */}
        <Card className="mb-4 bg-blue-50">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-xl font-bold text-gray-900">Workout</Text>
            <TouchableOpacity onPress={() => router.push('/workout')}>
              <Text className="text-teal-500 font-semibold">Add/Edit</Text>
            </TouchableOpacity>
          </View>
          {workout ? (
            <View className="p-4 bg-green-50 rounded-xl border border-green-200">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-900 mb-1">{workout.name}</Text>
                  <Text className="text-sm text-gray-600">Duration: {workout.duration} min</Text>
                  <Text className="text-sm text-gray-600">Calories burned: {workout.calories} cal</Text>
                </View>
                <Ionicons name="checkmark-circle" size={24} color="#15803d" />
              </View>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => router.push('/workout')}
              className="p-6 border-2 border-dashed border-gray-300 rounded-xl items-center justify-center bg-white"
            >
              <Ionicons name="add-circle-outline" size={32} color="#9ca3af" />
              <Text className="text-gray-500 font-semibold mt-2">+ Add Workout</Text>
            </TouchableOpacity>
          )}
        </Card>

        {/* Meal Tracker & AI Suggestions - Redesigned */}
        <View className="mb-4">
          <Text className="text-xl font-bold text-gray-900 mb-3">Meal Tracker</Text>
          <MealTracker />
        </View>
      </ScrollView>
      <BottomNavigation />
    </SafeAreaView>
  );
}
