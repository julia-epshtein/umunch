import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Card } from '../molecules/Card';
import { Button } from '../atoms/Button';
import { SearchBar } from '../molecules/SearchBar';

interface Meal {
  id: string;
  name: string;
  ingredients: string[];
  calories: number;
}

export const MealTracker: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [meals, setMeals] = useState<Meal[]>([]);

  const aiSuggestions = [
    { name: 'Grilled Chicken Salad', calories: 320 },
    { name: 'Quinoa Bowl', calories: 450 },
    { name: 'Greek Yogurt Parfait', calories: 280 },
  ];

  const handleAddMeal = (mealName: string, calories: number) => {
    const newMeal: Meal = {
      id: Date.now().toString(),
      name: mealName,
      ingredients: [],
      calories,
    };
    setMeals([...meals, newMeal]);
  };

  return (
    <View className="flex-1">
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search for meals..."
      />

      <View className="mb-4">
        <Text className="text-lg font-bold text-gray-900 mb-3">AI Suggestions</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {aiSuggestions.map((suggestion, index) => (
            <Card
              key={index}
              onPress={() => handleAddMeal(suggestion.name, suggestion.calories)}
              className="mr-3 w-48"
            >
              <Text className="font-semibold text-gray-900 mb-1">{suggestion.name}</Text>
              <Text className="text-sm text-gray-600">{suggestion.calories} cal</Text>
            </Card>
          ))}
        </ScrollView>
      </View>

      <View>
        <Text className="text-lg font-bold text-gray-900 mb-3">Today's Meals</Text>
        {meals.length === 0 ? (
          <Card>
            <Text className="text-gray-500 text-center">No meals added yet</Text>
          </Card>
        ) : (
          meals.map((meal) => (
            <Card key={meal.id} className="mb-3">
              <View className="flex-row justify-between items-center">
                <View className="flex-1">
                  <Text className="font-semibold text-gray-900 mb-1">{meal.name}</Text>
                  <Text className="text-sm text-gray-600">{meal.calories} calories</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setMeals(meals.filter(m => m.id !== meal.id))}
                >
                  <Text className="text-red-500 font-semibold">Remove</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))
        )}
      </View>
    </View>
  );
};

