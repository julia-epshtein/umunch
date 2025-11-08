import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { GoalCard } from '../molecules/GoalCard';
import { Button } from '../atoms/Button';

const goals = [
  { id: 'weightGain', title: 'Weight Gain', icon: 'weightGain', color: 'teal' },
  { id: 'weightLoss', title: 'Weight Loss', icon: 'weightLoss', color: 'pink' },
  { id: 'maintainWeight', title: 'Maintain Weight', icon: 'maintainWeight', color: 'green' },
  { id: 'yoga', title: 'Yoga', icon: 'yoga', color: 'teal' },
  { id: 'calorie', title: 'Calorie Management', icon: 'calorie', color: 'pink' },
  { id: 'homeWorkout', title: 'Home Workout', icon: 'homeWorkout', color: 'green' },
];

export const GoalsSetup: React.FC<{ onNext: (selectedGoals: string[]) => void }> = ({ onNext }) => {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const toggleGoal = (goalId: string) => {
    if (selectedGoals.includes(goalId)) {
      setSelectedGoals(selectedGoals.filter(id => id !== goalId));
    } else {
      setSelectedGoals([...selectedGoals, goalId]);
    }
  };

  const handleNext = () => {
    if (selectedGoals.length > 0) {
      onNext(selectedGoals);
    }
  };

  return (
    <ScrollView className="flex-1 bg-pink-50" showsVerticalScrollIndicator={false}>
      <View className="px-6 pt-12 pb-8">
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

        <Button
          title="Next"
          onPress={handleNext}
          disabled={selectedGoals.length === 0}
        />
      </View>
    </ScrollView>
  );
};

