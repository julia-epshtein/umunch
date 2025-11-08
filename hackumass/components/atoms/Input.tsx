import React from 'react';
import { TextInput, TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  className?: string;
}

export const Input: React.FC<InputProps> = ({ className = '', ...props }) => {
  return (
    <TextInput
      className={`bg-gray-50 border border-gray-300 rounded-xl px-4 py-4 text-gray-900 text-base focus:border-blue-600 ${className}`}
      placeholderTextColor="#9CA3AF"
      {...props}
    />
  );
};
