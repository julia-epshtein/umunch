import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

interface DatePickerProps {
  value: Date | null;
  onChange: (date: Date) => void;
  placeholder?: string;
  className?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = 'Select date',
  className = '',
}) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // For now, this is a simple display component
  // In production, you'd integrate with a date picker library
  return (
    <TouchableOpacity
      onPress={() => {
        // In production, open date picker modal here
        // For now, just set today's date as example
        onChange(new Date());
      }}
      className={`bg-gray-50 border border-gray-300 rounded-xl px-4 py-4 ${className}`}
    >
      <Text className={`text-base ${value ? 'text-gray-900' : 'text-gray-400'}`}>
        {value ? formatDate(value) : placeholder}
      </Text>
    </TouchableOpacity>
  );
};

