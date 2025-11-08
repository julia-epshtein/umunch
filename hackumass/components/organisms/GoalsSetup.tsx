import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Button } from '../atoms/Button';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const goals = [
  { id: 'loseWeight', title: 'Lose weight', icon: 'trending-down', color: '#ef4444' },
  { id: 'maintainWeight', title: 'Maintain weight', icon: 'scale', color: '#14b8a6' },
  { id: 'gainWeight', title: 'Gain weight', icon: 'trending-up', color: '#f97316' },
  { id: 'gainMuscle', title: 'Gain muscle', icon: 'fitness', color: '#3b82f6' },
  { id: 'modifyDiet', title: 'Modify my diet', icon: 'restaurant', color: '#8b5cf6' },
  { id: 'planMeals', title: 'Plan meals', icon: 'calendar', color: '#eab308' },
  { id: 'manageStress', title: 'Manage stress', icon: 'leaf', color: '#10b981' },
  { id: 'stayActive', title: 'Stay active', icon: 'walk', color: '#ec4899' },
];

export const GoalsSetup: React.FC<{ 
  onNext: (selectedGoals: string[]) => void;
  onBack?: () => void;
  onSkip?: () => void;
}> = ({ onNext, onBack, onSkip }) => {
  const router = useRouter();
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const toggleGoal = (goalId: string) => {
    if (selectedGoals.includes(goalId)) {
      setSelectedGoals(selectedGoals.filter(id => id !== goalId));
    } else {
      setSelectedGoals([...selectedGoals, goalId]);
    }
  };

  const handleNext = () => {
    onNext(selectedGoals);
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const canProceed = () => selectedGoals.length > 0;

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-12 pb-32">
          <Text className="text-4xl font-bold text-gray-900 mb-2">
            What are your goals?
          </Text>
          <Text className="text-lg text-gray-600 mb-8">
            Select all that apply
          </Text>

          <View className="mb-6">
            {goals.map((goal) => (
              <TouchableOpacity
                key={goal.id}
                onPress={() => toggleGoal(goal.id)}
                className="mb-3 p-4 border-2 rounded-xl flex-row items-center"
                style={{
                  borderColor: selectedGoals.includes(goal.id) ? goal.color : '#e5e7eb',
                  backgroundColor: selectedGoals.includes(goal.id) ? goal.color + '10' : 'white',
                }}
              >
                <View className="w-6 h-6 rounded border-2 items-center justify-center mr-3"
                  style={{
                    borderColor: selectedGoals.includes(goal.id) ? goal.color : '#d1d5db',
                    backgroundColor: selectedGoals.includes(goal.id) ? goal.color : 'white',
                  }}
                >
                  {selectedGoals.includes(goal.id) && (
                    <Ionicons name="checkmark" size={16} color="white" />
                  )}
                </View>
                <Ionicons 
                  name={goal.icon as any} 
                  size={24} 
                  color={selectedGoals.includes(goal.id) ? goal.color : '#9ca3af'} 
                  style={{ marginRight: 12 }}
                />
                <Text className="text-base font-semibold text-gray-900 flex-1">
                  {goal.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Navigation buttons at bottom - Only Back and Continue */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4">
        <View className="flex-row justify-between items-center">
          <TouchableOpacity
            onPress={handleBack}
            className="px-6 py-3 bg-gray-100 rounded-xl"
          >
            <Text className="text-gray-700 font-semibold text-base">Back</Text>
          </TouchableOpacity>
          
          <Button
            title="Continue"
            onPress={handleNext}
            disabled={!canProceed()}
            className="flex-1 ml-4"
          />
        </View>
      </View>
    </View>
  );
};
