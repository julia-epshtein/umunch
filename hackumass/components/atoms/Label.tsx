import React from 'react';
import { Text } from 'react-native';

interface LabelProps {
  text: string;
  required?: boolean;
  className?: string;
}

export const Label: React.FC<LabelProps> = ({ 
  text, 
  required = false, 
  className = '' 
}) => {
  return (
    <Text className={`text-gray-700 font-medium text-base mb-2 ${className}`}>
      {text}
      {required && <Text className="text-red-500"> *</Text>}
    </Text>
  );
};
