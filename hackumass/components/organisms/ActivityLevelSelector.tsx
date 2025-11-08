import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Button } from '../atoms/Button';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const activityLevels = [
  { 
    id: 'notVeryActive', 
    title: 'Not very active', 
    subtitle: 'Spend most of the day sitting (e.g., desk job).',
    icon: 'desktop'
  },
  { 
    id: 'lightlyActive', 
    title: 'Lightly active', 
    subtitle: 'Spend a good part of the day on your feet (e.g., teacher, retail).',
    icon: 'walk'
  },
  { 
    id: 'active', 
    title: 'Active', 
    subtitle: 'Spend a good part of the day doing physical activity.',
    icon: 'bicycle'
  },
  { 
    id: 'veryActive', 
    title: 'Very active', 
    subtitle: 'Spend most of the day doing heavy physical activity.',
    icon: 'fitness'
  },
];

export const ActivityLevelSelector: React.FC<{ 
  onNext: (activityLevel: string) => void;
  onBack?: () => void;
  onSkip?: () => void;
}> = ({ onNext, onBack, onSkip }) => {
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  const handleNext = () => {
    if (selectedLevel) {
      onNext(selectedLevel);
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

  const canProceed = () => selectedLevel !== null;

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-12 pb-32">
          <Text className="text-4xl font-bold text-gray-900 mb-2">
            How active are you?
          </Text>
          <Text className="text-lg text-gray-600 mb-8">
            This helps us calculate your calorie needs
          </Text>

          <View className="mb-6">
            {activityLevels.map((level) => (
              <TouchableOpacity
                key={level.id}
                onPress={() => setSelectedLevel(level.id)}
                className="mb-3 p-4 border-2 rounded-xl"
                style={{
                  borderColor: selectedLevel === level.id ? '#14b8a6' : '#e5e7eb',
                  backgroundColor: selectedLevel === level.id ? '#f0fdfa' : 'white',
                }}
              >
                <View className="flex-row items-start">
                  <View className="w-6 h-6 rounded-full border-2 items-center justify-center mr-3 mt-0.5"
                    style={{
                      borderColor: selectedLevel === level.id ? '#14b8a6' : '#d1d5db',
                      backgroundColor: selectedLevel === level.id ? '#14b8a6' : 'white',
                    }}
                  >
                    {selectedLevel === level.id && (
                      <View className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center mb-1">
                      <Ionicons 
                        name={level.icon as any} 
                        size={20} 
                        color={selectedLevel === level.id ? '#14b8a6' : '#9ca3af'} 
                        style={{ marginRight: 8 }}
                      />
                      <Text className="text-base font-semibold text-gray-900">
                        {level.title}
                      </Text>
                    </View>
                    <Text className="text-sm text-gray-600 ml-7">
                      {level.subtitle}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
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
