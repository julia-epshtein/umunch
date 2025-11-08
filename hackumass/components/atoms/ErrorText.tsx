import React from 'react';
import { Text } from 'react-native';

interface ErrorTextProps {
  message?: string;
  className?: string;
}

export const ErrorText: React.FC<ErrorTextProps> = ({ 
  message, 
  className = '' 
}) => {
  if (!message) return null;
  
  return (
    <Text className={`text-red-500 text-sm mt-1 ${className}`}>
      {message}
    </Text>
  );
};
