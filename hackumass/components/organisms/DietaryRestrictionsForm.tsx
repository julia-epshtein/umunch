import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Button } from '../atoms/Button';

interface DietaryOption {
  id: string;
  label: string;
  description: string;
}

const dietaryRestrictions: DietaryOption[] = [
  { id: 'vegetarian', label: 'Vegetarian', description: 'No meat, but may include eggs and dairy' },
  { id: 'vegan', label: 'Vegan', description: 'No animal products' },
  { id: 'halal', label: 'Halal', description: 'Foods prepared according to Islamic law' },
  { id: 'kosher', label: 'Kosher', description: 'Foods prepared according to Jewish law' },
  { id: 'pescatarian', label: 'Pescatarian', description: 'Vegetarian diet with fish and seafood' },
  { id: 'gluten-free', label: 'Gluten-Free', description: 'No wheat, barley, or rye' },
  { id: 'keto', label: 'Keto', description: 'Very low carb, high fat diet' },
  { id: 'paleo', label: 'Paleo', description: 'Whole foods, no processed items' },
];

const allergies: DietaryOption[] = [
  { id: 'peanuts', label: 'Peanuts', description: 'Peanut allergy' },
  { id: 'tree-nuts', label: 'Tree Nuts', description: 'Almonds, walnuts, cashews, etc.' },
  { id: 'dairy', label: 'Dairy', description: 'Milk, cheese, yogurt, etc.' },
  { id: 'eggs', label: 'Eggs', description: 'Egg allergy' },
  { id: 'soy', label: 'Soy', description: 'Soy products' },
  { id: 'wheat-gluten', label: 'Wheat/Gluten', description: 'Wheat and gluten-containing foods' },
  { id: 'fish', label: 'Fish', description: 'Fish allergy' },
  { id: 'shellfish', label: 'Shellfish', description: 'Shrimp, crab, lobster, etc.' },
];

export const DietaryRestrictionsForm: React.FC<{ 
  onNext: (data: { dietaryRestrictions: string[]; allergies: string[]; otherAllergy?: string }) => void;
  onBack?: () => void;
  onSkip?: () => void;
}> = ({ onNext, onBack, onSkip }) => {
  const router = useRouter();
  const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>([]);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [showOtherAllergy, setShowOtherAllergy] = useState(false);
  const [otherAllergy, setOtherAllergy] = useState('');

  const toggleRestriction = (id: string) => {
    if (selectedRestrictions.includes(id)) {
      setSelectedRestrictions(selectedRestrictions.filter(r => r !== id));
    } else {
      setSelectedRestrictions([...selectedRestrictions, id]);
    }
  };

  const toggleAllergy = (id: string) => {
    if (id === 'other') {
      setShowOtherAllergy(!showOtherAllergy);
      if (showOtherAllergy) {
        setSelectedAllergies(selectedAllergies.filter(a => a !== 'other'));
        setOtherAllergy('');
      } else {
        setSelectedAllergies([...selectedAllergies, 'other']);
      }
    } else {
      if (selectedAllergies.includes(id)) {
        setSelectedAllergies(selectedAllergies.filter(a => a !== id));
      } else {
        setSelectedAllergies([...selectedAllergies, id]);
      }
    }
  };

  const handleNext = () => {
    onNext({
      dietaryRestrictions: selectedRestrictions,
      allergies: selectedAllergies,
      otherAllergy: showOtherAllergy ? otherAllergy : undefined,
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

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-12 pb-32">
          <Text className="text-4xl font-bold text-gray-900 mb-2">
            Dietary Preferences
          </Text>
          <Text className="text-lg text-gray-600 mb-8">
            Help us customize your meal recommendations
          </Text>

          {/* Dietary Restrictions Checklist */}
          <View className="mb-8">
            <Text className="text-xl font-bold text-gray-900 mb-4">
              Dietary Restrictions
            </Text>
            <Text className="text-sm text-gray-600 mb-4">
              Select all that apply
            </Text>
            {dietaryRestrictions.map((option) => (
              <TouchableOpacity
                key={option.id}
                onPress={() => toggleRestriction(option.id)}
                className="mb-3 p-4 border-2 rounded-xl flex-row items-start"
                style={{
                  borderColor: selectedRestrictions.includes(option.id) ? '#14b8a6' : '#e5e7eb',
                  backgroundColor: selectedRestrictions.includes(option.id) ? '#f0fdfa' : 'white',
                }}
              >
                <View className="w-6 h-6 rounded border-2 items-center justify-center mr-3 mt-0.5"
                  style={{
                    borderColor: selectedRestrictions.includes(option.id) ? '#14b8a6' : '#d1d5db',
                    backgroundColor: selectedRestrictions.includes(option.id) ? '#14b8a6' : 'white',
                  }}
                >
                  {selectedRestrictions.includes(option.id) && (
                    <Ionicons name="checkmark" size={16} color="white" />
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900 mb-1">
                    {option.label}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    {option.description}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Allergies Checklist */}
          <View className="mb-8">
            <Text className="text-xl font-bold text-gray-900 mb-4">
              Allergies
            </Text>
            <Text className="text-sm text-gray-600 mb-4">
              Select all that apply
            </Text>
            {allergies.map((option) => (
              <TouchableOpacity
                key={option.id}
                onPress={() => toggleAllergy(option.id)}
                className="mb-3 p-4 border-2 rounded-xl flex-row items-start"
                style={{
                  borderColor: selectedAllergies.includes(option.id) ? '#14b8a6' : '#e5e7eb',
                  backgroundColor: selectedAllergies.includes(option.id) ? '#f0fdfa' : 'white',
                }}
              >
                <View className="w-6 h-6 rounded border-2 items-center justify-center mr-3 mt-0.5"
                  style={{
                    borderColor: selectedAllergies.includes(option.id) ? '#14b8a6' : '#d1d5db',
                    backgroundColor: selectedAllergies.includes(option.id) ? '#14b8a6' : 'white',
                  }}
                >
                  {selectedAllergies.includes(option.id) && (
                    <Ionicons name="checkmark" size={16} color="white" />
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900 mb-1">
                    {option.label}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    {option.description}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
            
            {/* Other Allergy Option */}
            <TouchableOpacity
              onPress={() => toggleAllergy('other')}
              className="mb-3 p-4 border-2 rounded-xl flex-row items-start"
              style={{
                borderColor: showOtherAllergy ? '#14b8a6' : '#e5e7eb',
                backgroundColor: showOtherAllergy ? '#f0fdfa' : 'white',
              }}
            >
              <View className="w-6 h-6 rounded border-2 items-center justify-center mr-3 mt-0.5"
                style={{
                  borderColor: showOtherAllergy ? '#14b8a6' : '#d1d5db',
                  backgroundColor: showOtherAllergy ? '#14b8a6' : 'white',
                }}
              >
                {showOtherAllergy && (
                  <Ionicons name="checkmark" size={16} color="white" />
                )}
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900 mb-1">
                  Other
                </Text>
                <Text className="text-sm text-gray-600">
                  Specify another allergy
                </Text>
              </View>
            </TouchableOpacity>

            {/* Other Allergy Text Input */}
            {showOtherAllergy && (
              <View className="mb-3 ml-9">
                <TextInput
                  value={otherAllergy}
                  onChangeText={setOtherAllergy}
                  placeholder="Enter allergy name"
                  className="border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-900"
                  style={{ borderColor: '#d1d5db' }}
                />
              </View>
            )}
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
            className="w-12 h-12 items-center justify-center rounded-full bg-teal-500"
          >
            <Ionicons name="arrow-forward" size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        {/* Continue Button - Primary CTA */}
        <Button
          title="Continue"
          onPress={handleNext}
          className="w-full"
        />
      </View>
    </View>
  );
};
