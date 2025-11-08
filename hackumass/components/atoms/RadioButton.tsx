import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';

interface RadioButtonProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  className?: string;
}

export const RadioButton: React.FC<RadioButtonProps> = ({
  label,
  selected,
  onPress,
  className = '',
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-center mb-4 ${className}`}
    >
      <View
        className={`w-6 h-6 rounded-full border-2 items-center justify-center mr-3 ${
          selected ? 'border-teal-500' : 'border-gray-300'
        }`}
      >
        {selected && (
          <View className="w-3 h-3 rounded-full bg-teal-500" />
        )}
      </View>
      <Text className="text-gray-700 font-medium text-base">{label}</Text>
    </TouchableOpacity>
  );
};

