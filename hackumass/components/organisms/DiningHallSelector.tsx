import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { DiningHallButton } from '../molecules/DiningHallButton';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';

const diningHalls = [
  'Dining Hall A',
  'Dining Hall B',
  'Dining Hall C',
  'Other',
];

export const DiningHallSelector: React.FC<{ onNext: (diningHall: string) => void }> = ({ onNext }) => {
  const [selectedHall, setSelectedHall] = useState<string | null>(null);
  const [otherHall, setOtherHall] = useState('');

  const handleNext = () => {
    const finalSelection = selectedHall === 'Other' ? otherHall : selectedHall;
    if (finalSelection) {
      onNext(finalSelection);
    }
  };

  return (
    <ScrollView className="flex-1 bg-pink-50" showsVerticalScrollIndicator={false}>
      <View className="px-6 pt-12 pb-8">
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
              placeholder="Enter dining hall name"
            />
          </View>
        )}

        <Button
          title="Complete Setup"
          onPress={handleNext}
          disabled={!selectedHall || (selectedHall === 'Other' && !otherHall)}
          className="mt-6"
        />
      </View>
    </ScrollView>
  );
};

