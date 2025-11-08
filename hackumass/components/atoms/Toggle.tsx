import React from 'react';
import { TouchableOpacity, View } from 'react-native';

interface ToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  className?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  value,
  onValueChange,
  className = '',
}) => {
  return (
    <TouchableOpacity
      onPress={() => onValueChange(!value)}
      className={`w-14 h-8 rounded-full justify-center ${
        value ? 'bg-teal-500' : 'bg-gray-300'
      } ${className}`}
    >
      <View
        className={`w-6 h-6 rounded-full bg-white shadow-md ${
          value ? 'ml-7' : 'ml-1'
        }`}
      />
    </TouchableOpacity>
  );
};

