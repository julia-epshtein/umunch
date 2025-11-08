import { SafeAreaView, View, Text, ScrollView, TouchableOpacity, Modal, Animated } from 'react-native';
import { BottomNavigation } from '../components/templates/BottomNavigation';
import { DiningHallButton } from '../components/molecules/DiningHallButton';
import { SearchBar } from '../components/molecules/SearchBar';
import { Card } from '../components/molecules/Card';
import { useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function MealPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedHall, setSelectedHall] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMeal, setSelectedMeal] = useState<any>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const diningHalls = ['Berkshire', 'Worcester', 'Franklin', 'Hampshire', 'Grab N Go', 'Other'];

  const aiSuggestions = [
    { name: 'Grilled Chicken Salad', ingredients: ['Chicken', 'Lettuce', 'Tomatoes', 'Cucumber'], calories: 320 },
    { name: 'Quinoa Bowl', ingredients: ['Quinoa', 'Black Beans', 'Avocado', 'Corn'], calories: 450 },
    { name: 'Greek Yogurt Parfait', ingredients: ['Yogurt', 'Berries', 'Granola', 'Honey'], calories: 280 },
    { name: 'Veggie Wrap', ingredients: ['Tortilla', 'Hummus', 'Vegetables'], calories: 380 },
  ];

  const mealList = [
    { name: 'Caesar Salad', ingredients: ['Romaine', 'Caesar Dressing', 'Croutons', 'Parmesan'], calories: 250 },
    { name: 'Pasta Primavera', ingredients: ['Pasta', 'Mixed Vegetables', 'Olive Oil'], calories: 420 },
    { name: 'Grilled Salmon', ingredients: ['Salmon', 'Lemon', 'Herbs'], calories: 350 },
  ];

  const handleStep1Next = () => {
    if (selectedHall) {
      setStep(2);
    }
  };

  const handleMealSelect = (meal: any) => {
    setSelectedMeal(meal);
    setStep(3);
  };

  const handleConfirmMeal = () => {
    setShowConfirmation(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    
    // In production, save meal to state/API
    setTimeout(() => {
      setShowConfirmation(false);
      setStep(1);
      setSelectedHall(null);
      setSelectedMeal(null);
      setSearchQuery('');
      router.push('/dashboard');
    }, 1500);
  };

  const handleBack = () => {
    if (step === 3) {
      setStep(2);
      setSelectedMeal(null);
    } else if (step === 2) {
      setStep(1);
      setSelectedHall(null);
      setSearchQuery('');
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-6 pt-6 pb-24" showsVerticalScrollIndicator={false}>
        {/* Header with back button */}
        <View className="flex-row items-center mb-6">
          <TouchableOpacity onPress={handleBack} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-4xl font-bold text-gray-900">Log Meal</Text>
        </View>

        {/* Progress indicator */}
        <View className="mb-6">
          <Text className="text-sm text-gray-500 mb-2">
            Step {step} of 3
          </Text>
          <View className="h-2 bg-gray-200 rounded-full">
            <View 
              className="h-full bg-teal-500 rounded-full"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </View>
        </View>

        {/* Step 1: Select Dining Hall */}
        {step === 1 && (
          <View>
            <Text className="text-2xl font-bold text-gray-900 mb-2">
              Where are you eating today?
            </Text>
            <Text className="text-base text-gray-600 mb-6">
              Select your dining hall location
            </Text>
            {diningHalls.map((hall) => (
              <DiningHallButton
                key={hall}
                label={hall}
                selected={selectedHall === hall}
                onPress={() => setSelectedHall(hall)}
              />
            ))}
            <TouchableOpacity
              onPress={handleStep1Next}
              disabled={!selectedHall}
              className={`mt-6 py-4 rounded-xl items-center ${
                selectedHall ? 'bg-teal-500' : 'bg-gray-300'
              }`}
            >
              <Text className={`font-semibold text-lg ${
                selectedHall ? 'text-white' : 'text-gray-500'
              }`}>
                Continue
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 2: Choose or Search Meal */}
        {step === 2 && (
          <View>
            <Text className="text-2xl font-bold text-gray-900 mb-2">
              Choose or search for a meal
            </Text>
            <Text className="text-base text-gray-600 mb-6">
              Find your meal from {selectedHall}
            </Text>

            {/* Search Bar */}
            <View className="mb-6">
              <SearchBar
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search for meals..."
              />
            </View>

            {/* AI Suggestions Section */}
            <View className="mb-6">
              <Text className="text-xl font-bold text-gray-900 mb-3">AI Suggestions</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {aiSuggestions.map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleMealSelect(suggestion)}
                  >
                    <Card className="mr-3 w-64 bg-orange-50">
                      <View className="flex-row items-center mb-2">
                        <Ionicons name="sparkles" size={20} color="#14b8a6" />
                        <Text className="font-bold text-gray-900 ml-2 text-lg">{suggestion.name}</Text>
                      </View>
                      <Text className="text-sm text-gray-600 mb-2">
                        {suggestion.ingredients.join(', ')}
                      </Text>
                      <Text className="text-teal-600 font-semibold">{suggestion.calories} cal</Text>
                    </Card>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Available Meals */}
            <View className="mb-6">
              <Text className="text-xl font-bold text-gray-900 mb-3">Available Meals</Text>
              {mealList.map((meal, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleMealSelect(meal)}
                >
                  <Card className="mb-3 bg-pink-50">
                    <Text className="font-bold text-gray-900 mb-2 text-lg">{meal.name}</Text>
                    <Text className="text-sm text-gray-600 mb-2">
                      {meal.ingredients.join(', ')}
                    </Text>
                    <Text className="text-teal-600 font-semibold">{meal.calories} calories</Text>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Step 3: Confirm Meal Details */}
        {step === 3 && selectedMeal && (
          <View>
            <Text className="text-2xl font-bold text-gray-900 mb-2">
              Confirm Meal Details
            </Text>
            <Text className="text-base text-gray-600 mb-6">
              Review your meal selection
            </Text>

            <Card className="mb-6 bg-teal-50">
              <View className="mb-4">
                <Text className="text-sm text-gray-500 mb-1">Dining Hall</Text>
                <Text className="text-lg font-semibold text-gray-900">{selectedHall}</Text>
              </View>
              <View className="mb-4">
                <Text className="text-sm text-gray-500 mb-1">Meal Name</Text>
                <Text className="text-lg font-semibold text-gray-900">{selectedMeal.name}</Text>
              </View>
              {selectedMeal.ingredients && (
                <View className="mb-4">
                  <Text className="text-sm text-gray-500 mb-1">Ingredients</Text>
                  <Text className="text-base text-gray-700">
                    {selectedMeal.ingredients.join(', ')}
                  </Text>
                </View>
              )}
              <View>
                <Text className="text-sm text-gray-500 mb-1">Calories</Text>
                <Text className="text-2xl font-bold text-teal-600">{selectedMeal.calories} cal</Text>
              </View>
            </Card>

            <TouchableOpacity
              onPress={handleConfirmMeal}
              className="mt-6 py-4 rounded-xl items-center bg-teal-500"
            >
              <Text className="font-semibold text-lg text-white">
                Confirm & Add Meal
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Meal Confirmation Modal */}
      <Modal
        visible={showConfirmation}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmation(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ scale: fadeAnim }],
            }}
            className="bg-white rounded-3xl p-8 mx-6 w-11/12 items-center"
          >
            <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="checkmark" size={32} color="#15803d" />
            </View>
            <Text className="text-2xl font-bold text-gray-900 mb-2">Meal Added!</Text>
            {selectedMeal && (
              <>
                <Text className="text-lg text-gray-700 mb-1">{selectedMeal.name}</Text>
                <Text className="text-sm text-gray-600 mb-4">{selectedMeal.calories} calories</Text>
              </>
            )}
            <Text className="text-sm text-gray-500 text-center mb-6">
              Redirecting to dashboard...
            </Text>
          </Animated.View>
        </View>
      </Modal>

      <BottomNavigation />
    </SafeAreaView>
  );
}
