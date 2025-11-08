import { SafeAreaView, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { BottomNavigation } from '../components/templates/BottomNavigation';
import { Card } from '../components/molecules/Card';
import { Button } from '../components/atoms/Button';
import { MealTracker } from '../components/organisms/MealTracker';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function DashboardPage() {
  const router = useRouter();

  // Sample data - in production, this would come from state/API
  const summary = 'Focused';
  const calories = { consumed: 1200, goal: 2000 };
  const macros = { carbs: 45, protein: 30, fat: 25 };
  const workoutCompleted = true;

  return (
    <SafeAreaView className="flex-1 bg-pink-50">
      <ScrollView className="flex-1 px-6 pt-6 pb-24" showsVerticalScrollIndicator={false}>
        {/* One-word summary */}
        <View className="mb-6">
          <Text className="text-5xl font-bold text-gray-900 mb-2">{summary}</Text>
          <Text className="text-lg text-gray-600">Today's Status</Text>
        </View>

        {/* Calories Donut Chart Section */}
        <Card className="mb-4">
          <Text className="text-xl font-bold text-gray-900 mb-4">Calories</Text>
          <View className="items-center">
            <View className="w-32 h-32 rounded-full border-8 border-teal-200 items-center justify-center mb-2">
              <Text className="text-3xl font-bold text-teal-600">{calories.consumed}</Text>
              <Text className="text-sm text-gray-500">/ {calories.goal}</Text>
            </View>
            <Text className="text-sm text-gray-600">calories consumed</Text>
          </View>
        </Card>

        {/* Macros Section */}
        <Card className="mb-4">
          <Text className="text-xl font-bold text-gray-900 mb-4">Macros</Text>
          <View className="flex-row justify-around">
            <View className="items-center">
              <View className="w-20 h-20 rounded-full border-4 border-pink-200 items-center justify-center mb-2">
                <Text className="text-lg font-bold text-pink-600">{macros.carbs}%</Text>
              </View>
              <Text className="text-sm text-gray-600">Carbs</Text>
            </View>
            <View className="items-center">
              <View className="w-20 h-20 rounded-full border-4 border-green-200 items-center justify-center mb-2">
                <Text className="text-lg font-bold text-green-600">{macros.protein}%</Text>
              </View>
              <Text className="text-sm text-gray-600">Protein</Text>
            </View>
            <View className="items-center">
              <View className="w-20 h-20 rounded-full border-4 border-teal-200 items-center justify-center mb-2">
                <Text className="text-lg font-bold text-teal-600">{macros.fat}%</Text>
              </View>
              <Text className="text-sm text-gray-600">Fat</Text>
            </View>
          </View>
        </Card>

        {/* Workout Summary */}
        <Card className="mb-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-xl font-bold text-gray-900">Workout</Text>
            <TouchableOpacity onPress={() => router.push('/workout')}>
              <Text className="text-teal-500 font-semibold">Add/Edit</Text>
            </TouchableOpacity>
          </View>
          <View className={`p-3 rounded-xl ${workoutCompleted ? 'bg-green-100' : 'bg-gray-100'} flex-row items-center`}>
            {workoutCompleted && <Ionicons name="checkmark-circle" size={20} color="#15803d" style={{ marginRight: 8 }} />}
            <Text className={`font-semibold ${workoutCompleted ? 'text-green-700' : 'text-gray-700'}`}>
              {workoutCompleted ? 'Workout Completed' : 'Workout Not Completed'}
            </Text>
          </View>
        </Card>

        {/* Daily Status */}
        <Card className="mb-4">
          <Text className="text-xl font-bold text-gray-900 mb-3">Daily Status</Text>
          <View className="flex-row justify-between">
            <View className="flex-1 mr-2">
              <View className="bg-teal-100 p-3 rounded-xl">
                <Text className="text-teal-700 font-semibold">Meals: 3/3</Text>
              </View>
            </View>
            <View className="flex-1 ml-2">
              <View className="bg-green-100 p-3 rounded-xl">
                <Text className="text-green-700 font-semibold">Workout: Done</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Meal Tracker */}
        <View className="mb-4">
          <Text className="text-xl font-bold text-gray-900 mb-3">Meal Tracker</Text>
          <MealTracker />
        </View>

        {/* Mini Calendar Preview */}
        <Card>
          <Text className="text-xl font-bold text-gray-900 mb-3">This Week</Text>
          <View className="flex-row justify-around">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, index) => (
              <View key={day} className="items-center">
                <Text className="text-sm text-gray-600 mb-1">{day}</Text>
                <View className={`w-10 h-10 rounded-full items-center justify-center ${
                  index === 2 ? 'bg-teal-500' : 'bg-gray-200'
                }`}>
                  <Text className={`font-semibold ${index === 2 ? 'text-white' : 'text-gray-600'}`}>
                    {index + 1}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Card>
      </ScrollView>
      <BottomNavigation />
    </SafeAreaView>
  );
}

