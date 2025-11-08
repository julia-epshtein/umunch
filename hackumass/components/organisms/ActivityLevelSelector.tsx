import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Dropdown } from '../molecules/Dropdown';
import { Button } from '../atoms/Button';

const activityLevels = [
  'Sedentary',
  'Lightly Active',
  'Moderate Exercise',
  'Very Active',
];

export const ActivityLevelSelector: React.FC<{ onNext: (activityLevel: string) => void }> = ({ onNext }) => {
  const [activityLevel, setActivityLevel] = useState<string | null>(null);

  const handleNext = () => {
    if (activityLevel) {
      onNext(activityLevel);
    }
  };

  return (
    <ScrollView className="flex-1 bg-pink-50" showsVerticalScrollIndicator={false}>
      <View className="px-6 pt-12 pb-8">
        <Text className="text-4xl font-bold text-gray-900 mb-2">
          How active are you?
        </Text>
        <Text className="text-lg text-gray-600 mb-8">
          This helps us calculate your calorie needs
        </Text>

        <Dropdown
          label="Activity Level"
          options={activityLevels}
          value={activityLevel}
          onSelect={setActivityLevel}
          placeholder="Select your activity level"
        />

        <Button
          title="Next"
          onPress={handleNext}
          disabled={!activityLevel}
        />
      </View>
    </ScrollView>
  );
};

