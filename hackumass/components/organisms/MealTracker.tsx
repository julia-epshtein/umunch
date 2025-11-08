import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Card } from '../molecules/Card';
import { Button } from '../atoms/Button';
import { SearchBar } from '../molecules/SearchBar';
import { useRouter } from 'expo-router';

interface Meal {
  id: string;
  name: string;
  ingredients: string[];
  calories: number;
  mealType?: string;
}

export const MealTracker: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [meals, setMeals] = useState<Meal[]>([]);

  const handleAddMeal = () => {
    router.push('/meal');
  };

  return (
    <View className="flex-1">
      {/* Today's Meals Section */}
      <View className="mb-4">
        {meals.length === 0 ? (
          <Card className="p-6">
            <Text className="text-gray-500 text-center mb-4">No meals logged today</Text>
            <Button
              title="+ Add Meal"
              onPress={handleAddMeal}
              className="mt-2"
            />
          </Card>
        ) : (
          <View>
            {meals.map((meal) => (
              <Card key={meal.id} className="mb-3">
                <View className="flex-row justify-between items-center">
                  <View className="flex-1">
                    {meal.mealType && (
                      <Text className="text-xs text-gray-500 uppercase mb-1">{meal.mealType}</Text>
                    )}
                    <Text className="font-semibold text-gray-900 mb-1">{meal.name}</Text>
                    {meal.ingredients.length > 0 && (
                      <Text className="text-sm text-gray-600 mb-1">
                        {meal.ingredients.join(', ')}
                      </Text>
                    )}
                    <Text className="text-sm text-teal-600 font-semibold">{meal.calories} calories</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setMeals(meals.filter(m => m.id !== meal.id))}
                    className="ml-4"
                  >
                    <Text className="text-red-500 font-semibold">Remove</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
            <Button
              title="+ Add Another Meal"
              onPress={handleAddMeal}
              className="mt-2"
            />
          </View>
        )}
      </View>
    </View>
  );
};
