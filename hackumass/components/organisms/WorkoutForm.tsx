import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Dropdown } from '../molecules/Dropdown';
import { FormField } from '../molecules/FormField';
import { Button } from '../atoms/Button';

const workoutTypes = [
  'Running',
  'Cycling',
  'Yoga',
  'Weight Training',
  'Swimming',
  'Walking',
];

export const WorkoutForm: React.FC<{ onSubmit: (workout: { type: string; duration: string }) => void }> = ({ onSubmit }) => {
  const [workoutType, setWorkoutType] = useState<string | null>(null);
  const [duration, setDuration] = useState('');

  const handleSubmit = () => {
    if (workoutType && duration) {
      onSubmit({ type: workoutType, duration });
    }
  };

  return (
    <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
      <View className="px-6 pt-12 pb-8">
        <Text className="text-4xl font-bold text-gray-900 mb-2">
          Add Workout
        </Text>
        <Text className="text-lg text-gray-600 mb-8">
          Track your exercise activity
        </Text>

        <Dropdown
          label="What kind of workout are you doing?"
          options={workoutTypes}
          value={workoutType}
          onSelect={setWorkoutType}
          placeholder="Select workout type"
        />

        <FormField
          label="Duration (minutes)"
          value={duration}
          onChangeText={setDuration}
          placeholder="e.g., 30"
          required
          keyboardType="numeric"
        />

        <Button
          title="Add Workout"
          onPress={handleSubmit}
          disabled={!workoutType || !duration}
          className="mt-4"
        />
      </View>
    </ScrollView>
  );
};
