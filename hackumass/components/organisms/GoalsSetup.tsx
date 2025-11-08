import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { GoalCard } from '../molecules/GoalCard';
import { Button } from '../atoms/Button';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const goals = [
  { id: 'weightGain', title: 'Weight Gain', icon: 'weightGain', color: 'teal' },
  { id: 'weightLoss', title: 'Weight Loss', icon: 'weightLoss', color: 'pink' },
  { id: 'maintainWeight', title: 'Maintain Weight', icon: 'maintainWeight', color: 'green' },
  { id: 'yoga', title: 'Yoga', icon: 'yoga', color: 'teal' },
  { id: 'calorie', title: 'Calorie Management', icon: 'calorie', color: 'pink' },
  { id: 'homeWorkout', title: 'Home Workout', icon: 'homeWorkout', color: 'green' },
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

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      router.push('/activity-level');
    }
  };

  const canProceed = () => selectedGoals.length > 0;

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-12 pb-32">
          <Text className="text-4xl font-bold text-gray-900 mb-2">
            What are your fitness goals?
          </Text>
          <Text className="text-lg text-gray-600 mb-8">
            Select all that apply
          </Text>

          <View className="flex-row flex-wrap justify-between mb-6">
            {goals.map((goal) => (
              <View key={goal.id} className="w-[48%]">
                <GoalCard
                  title={goal.title}
                  icon={goal.icon}
                  selected={selectedGoals.includes(goal.id)}
                  onPress={() => toggleGoal(goal.id)}
                  color={goal.color as 'teal' | 'pink' | 'green'}
                />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Navigation buttons at bottom */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4">
        <View className="flex-row justify-between items-center mb-3">
          <TouchableOpacity
            onPress={handleBack}
            className="w-12 h-12 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleSkip}
            className="px-4 py-2"
          >
            <Text className="text-gray-600 font-medium">Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNext}
            disabled={!canProceed()}
            className={`w-12 h-12 items-center justify-center rounded-full ${
              canProceed() ? 'bg-teal-500' : 'bg-gray-300'
            }`}
          >
            <Ionicons 
              name="arrow-forward" 
              size={24} 
              color={canProceed() ? "white" : "#9ca3af"} 
            />
          </TouchableOpacity>
        </View>
        
        {/* Continue Button - Primary CTA */}
        <Button
          title="Continue"
          onPress={handleNext}
          disabled={!canProceed()}
          className="w-full"
        />
      </View>
    </View>
  );
};
