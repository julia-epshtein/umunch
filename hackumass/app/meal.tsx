import { SafeAreaView, View, Text, ScrollView } from 'react-native';
import { BottomNavigation } from '../components/templates/BottomNavigation';
import { DiningHallButton } from '../components/molecules/DiningHallButton';
import { SearchBar } from '../components/molecules/SearchBar';
import { Card } from '../components/molecules/Card';
import { useState } from 'react';

export default function MealPage() {
  const [selectedHall, setSelectedHall] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const diningHalls = ['Dining Hall A', 'Dining Hall B', 'Dining Hall C', 'Other'];

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

  return (
    <SafeAreaView className="flex-1 bg-pink-50">
      <ScrollView className="flex-1 px-6 pt-6 pb-24" showsVerticalScrollIndicator={false}>
        <Text className="text-4xl font-bold text-gray-900 mb-2">Meals</Text>
        <Text className="text-lg text-gray-600 mb-6">Find and track your meals</Text>

        {/* Step 1: Where are you eating? */}
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

        {/* Step 2: Search Bar */}
        <View className="mb-6">
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search for meals..."
          />
        </View>

        {/* Step 3: AI Suggestions */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-gray-900 mb-3">AI Suggestions</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {aiSuggestions.map((suggestion, index) => (
              <Card key={index} className="mr-3 w-64">
                <Text className="font-bold text-gray-900 mb-2 text-lg">{suggestion.name}</Text>
                <Text className="text-sm text-gray-600 mb-2">
                  {suggestion.ingredients.join(', ')}
                </Text>
                <Text className="text-teal-600 font-semibold">{suggestion.calories} cal</Text>
              </Card>
            ))}
          </ScrollView>
        </View>

        {/* Step 4: Meal List */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-gray-900 mb-3">Available Meals</Text>
          {mealList.map((meal, index) => (
            <Card key={index} className="mb-3">
              <Text className="font-bold text-gray-900 mb-2 text-lg">{meal.name}</Text>
              <Text className="text-sm text-gray-600 mb-2">
                {meal.ingredients.join(', ')}
              </Text>
              <Text className="text-teal-600 font-semibold">{meal.calories} calories</Text>
            </Card>
          ))}
        </View>
      </ScrollView>
      <BottomNavigation />
    </SafeAreaView>
  );
}

