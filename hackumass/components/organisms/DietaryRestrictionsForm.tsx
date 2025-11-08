import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Dropdown } from '../molecules/Dropdown';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const dietaryRestrictions = [
  'None',
  'Vegetarian',
  'Vegan',
  'Halal',
  'Kosher',
  'Pescatarian',
  'Gluten-Free',
];

const allergies = [
  'None',
  'Peanuts',
  'Tree Nuts',
  'Dairy',
  'Eggs',
  'Soy',
  'Wheat/Gluten',
  'Fish',
  'Shellfish',
];

export const DietaryRestrictionsForm: React.FC<{ 
  onNext: (data: { dietaryRestriction: string; allergies: string }) => void;
  onBack?: () => void;
  onSkip?: () => void;
}> = ({ onNext, onBack, onSkip }) => {
  const router = useRouter();
  const [dietaryRestriction, setDietaryRestriction] = useState<string | null>(null);
  const [allergy, setAllergy] = useState<string | null>(null);

  const handleNext = () => {
    onNext({
      dietaryRestriction: dietaryRestriction || 'None',
      allergies: allergy || 'None',
    });
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
      router.push('/goals');
    }
  };

  const canProceed = () => true; // Can always proceed, fields are optional

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-12 pb-24">
          <Text className="text-4xl font-bold text-gray-900 mb-2">
            Dietary Preferences
          </Text>
          <Text className="text-lg text-gray-600 mb-8">
            Help us customize your meal recommendations
          </Text>

          <Dropdown
            label="Dietary Restrictions"
            options={dietaryRestrictions}
            value={dietaryRestriction}
            onSelect={setDietaryRestriction}
            placeholder="Select dietary restriction"
          />

          <Dropdown
            label="Allergies"
            options={allergies}
            value={allergy}
            onSelect={setAllergy}
            placeholder="Select allergies"
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
