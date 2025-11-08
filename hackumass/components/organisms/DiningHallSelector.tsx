import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { DiningHallButton } from '../molecules/DiningHallButton';
import { Input } from '../atoms/Input';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const diningHalls = [
  'Berkshire',
  'Worcester',
  'Franklin',
  'Hampshire',
  'Grab N Go',
  'Other',
];

export const DiningHallSelector: React.FC<{ 
  onNext: (diningHall: string) => void;
  onBack?: () => void;
}> = ({ onNext, onBack }) => {
  const router = useRouter();
  const [selectedHall, setSelectedHall] = useState<string | null>(null);
  const [otherHall, setOtherHall] = useState('');

  const handleNext = () => {
    const finalSelection = selectedHall === 'Other' ? otherHall : selectedHall;
    if (finalSelection) {
      onNext(finalSelection);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const canProceed = () => selectedHall && (selectedHall !== 'Other' || otherHall.trim() !== '');

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-12 pb-24">
          <Text className="text-4xl font-bold text-gray-900 mb-2">
            Which dining hall do you prefer?
          </Text>
          <Text className="text-lg text-gray-600 mb-8">
            We'll prioritize meals from your preferred location
          </Text>

          {diningHalls.map((hall) => (
            <DiningHallButton
              key={hall}
              label={hall}
              selected={selectedHall === hall}
              onPress={() => setSelectedHall(hall)}
            />
          ))}

          {selectedHall === 'Other' && (
            <View className="mt-4">
              <Input
                value={otherHall}
                onChangeText={setOtherHall}
                placeholder="Enter name"
              />
            </View>
          )}
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
        
        <View className="w-12" />

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
