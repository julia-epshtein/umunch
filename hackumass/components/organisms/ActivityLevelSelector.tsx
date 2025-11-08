import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Dropdown } from '../molecules/Dropdown';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const activityLevels = [
  'Sedentary',
  'Lightly Active',
  'Moderate Exercise',
  'Very Active',
];

export const ActivityLevelSelector: React.FC<{ 
  onNext: (activityLevel: string) => void;
  onBack?: () => void;
  onSkip?: () => void;
}> = ({ onNext, onBack, onSkip }) => {
  const router = useRouter();
  const [activityLevel, setActivityLevel] = useState<string | null>(null);

  const handleNext = () => {
    if (activityLevel) {
      onNext(activityLevel);
    }
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
      router.push('/dining-hall');
    }
  };

  const canProceed = () => activityLevel !== null;

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-12 pb-24">
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
        </View>
      </ScrollView>

      {/* Navigation buttons at bottom */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 flex-row justify-between items-center">
        <TouchableOpacity
          onPress={handleBack}
          className="w-12 h-12 items-center justify-center"
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={handleSkip}
          className="w-12 h-12 items-center justify-center"
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
    </View>
  );
};
