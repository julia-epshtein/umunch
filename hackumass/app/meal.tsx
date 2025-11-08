import { SafeAreaView, View, Text, ScrollView, TouchableOpacity, Modal, Animated, Image, TextInput } from 'react-native';
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

  const diningHalls = ['Berkshire', 'Worcester', 'Franklin', 'Hampshire', 'Grab N Go', 'Insomnia Cookies', 'Other'];

  const aiSuggestions = [
    { name: 'Grilled Chicken Salad', ingredients: ['Chicken', 'Lettuce', 'Tomatoes', 'Cucumber'], calories: 320, image: null },
    { name: 'Quinoa Bowl', ingredients: ['Quinoa', 'Black Beans', 'Avocado', 'Corn'], calories: 450, image: null },
    { name: 'Greek Yogurt Parfait', ingredients: ['Yogurt', 'Berries', 'Granola', 'Honey'], calories: 280, image: null },
    { name: 'Veggie Wrap', ingredients: ['Tortilla', 'Hummus', 'Vegetables'], calories: 380, image: null },
    { name: 'Caesar Salad', ingredients: ['Romaine', 'Caesar Dressing', 'Croutons'], calories: 250, image: null },
    { name: 'Pasta Primavera', ingredients: ['Pasta', 'Mixed Vegetables', 'Olive Oil'], calories: 420, image: null },
  ];

  const mealList = [
    { name: 'Caesar Salad', ingredients: ['Romaine', 'Caesar Dressing', 'Croutons', 'Parmesan'], calories: 250, image: null },
    { name: 'Pasta Primavera', ingredients: ['Pasta', 'Mixed Vegetables', 'Olive Oil'], calories: 420, image: null },
    { name: 'Grilled Salmon', ingredients: ['Salmon', 'Lemon', 'Herbs'], calories: 350, image: null },
    { name: 'Chicken Teriyaki', ingredients: ['Chicken', 'Rice', 'Vegetables', 'Teriyaki Sauce'], calories: 480, image: null },
    { name: 'Vegetable Stir Fry', ingredients: ['Mixed Vegetables', 'Soy Sauce', 'Ginger'], calories: 320, image: null },
    { name: 'Beef Burger', ingredients: ['Beef Patty', 'Bun', 'Lettuce', 'Tomato'], calories: 550, image: null },
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
          <Text className="text-4xl font-bold text-gray-900">
            {step === 2 && selectedHall ? selectedHall : 'Add Meal'}
          </Text>
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
            {/* Search Bar with Find meal from text and Microphone */}
            <View className="mb-6 flex-row items-center">
              <View className="flex-1">
                <View className="flex-row items-center bg-white rounded-xl px-4 h-14 border border-gray-200"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 3,
                    elevation: 2,
                  }}
                >
                  <Ionicons name="search" size={20} color="#6b7280" style={{ marginRight: 12 }} />
                  <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder={`Find meal from ${selectedHall}...`}
                    placeholderTextColor="#9ca3af"
                    className="flex-1 text-gray-900 text-base"
                  />
                </View>
              </View>
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

            {/* AI Suggestions Section - Horizontal Carousel */}
            <View className="mb-6">
              <Text className="text-xl font-bold text-gray-900 mb-3">AI Suggestions</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                snapToInterval={180}
                decelerationRate="fast"
                contentContainerStyle={{ paddingRight: 24 }}
              >
                {aiSuggestions.map((suggestion, index) => {
                  const bgColors = ['#fff7ed', '#eff6ff', '#f5f3ff', '#fefce8', '#f0fdfa', '#fdf2f8'];
                  const bgColor = bgColors[index % bgColors.length];
                  
                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleMealSelect(suggestion)}
                      className="mr-3"
                    >
                      <View
                        className="rounded-2xl overflow-hidden"
                        style={{ 
                          width: 160,
                          height: 200, // Uniform height for all cards
                          backgroundColor: bgColor,
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.1,
                          shadowRadius: 4,
                          elevation: 3,
                        }}
                      >
                        {/* Top Icons */}
                        <View className="absolute top-2 left-2 right-2 z-10 flex-row justify-between items-start">
                          <View className="w-6 h-6 bg-teal-500 rounded-full items-center justify-center">
                            <Ionicons name="sparkles" size={14} color="white" />
                          </View>
                          <View className="bg-white/90 px-2 py-1 rounded-lg">
                            <Text className="text-xs font-semibold text-gray-900">
                              {suggestion.calories} kcal
                            </Text>
                          </View>
                        </View>

                        {/* Image Placeholder - Centered */}
                        <View className="w-full h-32 bg-gray-200 items-center justify-center">
                          {suggestion.image ? (
                            <Image source={{ uri: suggestion.image }} className="w-full h-full" />
                          ) : (
                            <Ionicons name="restaurant" size={48} color="#9ca3af" />
                          )}
                        </View>

                        {/* Content - Dish Name Below */}
                        <View className="p-3 items-center flex-1 justify-center">
                          <Text className="text-base font-semibold text-gray-900 text-center" numberOfLines={2}>
                            {suggestion.name}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Available Meals - 2 Column Grid */}
            <View className="mb-6">
              <Text className="text-xl font-bold text-gray-900 mb-3">Available Meals</Text>
              <View className="flex-row flex-wrap justify-between">
                {mealList.map((meal, index) => {
                  const bgColors = ['#fff7ed', '#eff6ff', '#f5f3ff', '#fefce8', '#f0fdfa', '#fdf2f8'];
                  const bgColor = bgColors[index % bgColors.length];
                  
                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleMealSelect(meal)}
                      className="w-[48%] mb-3"
                    >
                      <View
                        className="rounded-2xl overflow-hidden"
                        style={{ 
                          backgroundColor: bgColor,
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 1 },
                          shadowOpacity: 0.05,
                          shadowRadius: 2,
                          elevation: 1,
                        }}
                      >
                        {/* Top Right Calories */}
                        <View className="absolute top-2 right-2 z-10">
                          <View className="bg-white/90 px-2 py-1 rounded-lg">
                            <Text className="text-xs font-semibold text-gray-900">
                              {meal.calories} kcal
                            </Text>
                          </View>
                        </View>

                        {/* Image Placeholder */}
                        <View className="w-full h-32 bg-gray-200 items-center justify-center">
                          {meal.image ? (
                            <Image source={{ uri: meal.image }} className="w-full h-full" />
                          ) : (
                            <Ionicons name="restaurant" size={40} color="#9ca3af" />
                          )}
                        </View>

                        {/* Content */}
                        <View className="p-3">
                          <Text className="text-base font-bold text-gray-900 mb-1" numberOfLines={1}>
                            {meal.name}
                          </Text>
                          <Text className="text-xs text-gray-600" numberOfLines={2}>
                            {meal.ingredients.join(', ')}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
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
