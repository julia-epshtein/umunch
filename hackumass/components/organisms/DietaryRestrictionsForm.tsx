import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Dropdown } from '../molecules/Dropdown';
import { Button } from '../atoms/Button';

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

export const DietaryRestrictionsForm: React.FC<{ onNext: (data: { dietaryRestriction: string; allergies: string }) => void }> = ({ onNext }) => {
  const [dietaryRestriction, setDietaryRestriction] = useState<string | null>(null);
  const [allergy, setAllergy] = useState<string | null>(null);

  const handleNext = () => {
    onNext({
      dietaryRestriction: dietaryRestriction || 'None',
      allergies: allergy || 'None',
    });
  };

  return (
    <ScrollView className="flex-1 bg-pink-50" showsVerticalScrollIndicator={false}>
      <View className="px-6 pt-12 pb-8">
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

        <Button
          title="Next"
          onPress={handleNext}
        />
      </View>
    </ScrollView>
  );
};

