import { SafeAreaView, View, Text, ScrollView, TouchableOpacity, Modal, Animated } from 'react-native';
import { BottomNavigation } from '../components/templates/BottomNavigation';
import { DiningHallButton } from '../components/molecules/DiningHallButton';
import { SearchBar } from '../components/molecules/SearchBar';
import { Card } from '../components/molecules/Card';
import { Button } from '../components/atoms/Button';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | null;

export default function MealPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedMealType, setSelectedMealType] = useState<MealType>(null);
  const [selectedHall, setSelectedHall] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMeal, setSelectedMeal] = useState<any>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const diningHalls = ['Dining Hall A', 'Dining Hall B', 'Dining Hall C', 'Other'];
  const mealTypes: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

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

  const handleMealTypeSelect = (type: MealType) => {
    setSelectedMealType(type);
    setStep(2);
  };

  const handleMealSelect = (meal: any) => {
    setSelectedMeal(meal);
    setShowConfirmation(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleConfirmMeal = () => {
    // In production, save meal to state/API
    setTimeout(() => {
      setShowConfirmation(false);
      setStep(1);
      setSelectedMealType(null);
      setSelectedMeal(null);
      setSearchQuery('');
      router.push('/dashboard');
    }, 1500);
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setSelectedMealType(null);
      setSearchQuery('');
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-pink-50">
      <ScrollView className="flex-1 px-6 pt-6 pb-24" showsVerticalScrollIndicator={false}>
        {/* Header with back button */}
        <View className="flex-row items-center mb-6">
          <TouchableOpacity onPress={handleBack} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-4xl font-bold text-gray-900">Log Meal</Text>
        </View>

        {step === 1 && (
          <>
            <Text className="text-lg text-gray-600 mb-6">Step 1: Select meal type</Text>
            <View className="mb-6">
              {mealTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => handleMealTypeSelect(type)}
                  className="mb-3"
                >
                  <Card className={`p-4 ${selectedMealType === type ? 'bg-teal-50 border-2 border-teal-500' : ''}`}>
                    <Text className="text-lg font-semibold text-gray-900">{type}</Text>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {step === 2 && (
          <>
            <View className="mb-4">
              <Text className="text-sm text-gray-500 mb-1">Step 2 of 2</Text>
              <Text className="text-lg text-gray-600 mb-2">
                {selectedMealType ? `Add ${selectedMealType}` : 'Search/Add meal'}
              </Text>
            </View>

            {/* Where are you eating? */}
            <View className="mb-6">
              <Text className="text-xl font-bold text-gray-900 mb-3">Where are you eating today?</Text>
              {diningHalls.map((hall) => (
                <DiningHallButton
                  key={hall}
                  label={hall}
                  selected={selectedHall === hall}
                  onPress={() => setSelectedHall(hall)}
                />
              ))}
            </View>

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
                    <Card className="mr-3 w-64">
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
                  <Card className="mb-3">
                    <Text className="font-bold text-gray-900 mb-2 text-lg">{meal.name}</Text>
                    <Text className="text-sm text-gray-600 mb-2">
                      {meal.ingredients.join(', ')}
                    </Text>
                    <Text className="text-teal-600 font-semibold">{meal.calories} calories</Text>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          </>
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
