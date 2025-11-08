import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

interface DiningHallButtonProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  className?: string;
}

export const DiningHallButton: React.FC<DiningHallButtonProps> = ({
  label,
  selected,
  onPress,
  className = '',
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`py-4 px-6 rounded-xl border-2 mb-3 ${
        selected
          ? 'bg-teal-500 border-teal-600'
          : 'bg-white border-gray-300'
      } ${className}`}
      activeOpacity={0.7}
    >
      <Text
        className={`text-center font-semibold text-base ${
          selected ? 'text-white' : 'text-gray-700'
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

