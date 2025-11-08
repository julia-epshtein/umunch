import React from 'react';
import { View, TouchableOpacity } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  className?: string;
  variant?: 'default' | 'gradient' | 'outline';
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  className = '',
  variant = 'default',
}) => {
  const baseStyles = 'rounded-2xl p-4 shadow-sm';
  
  const variantStyles = {
    default: 'bg-white',
    gradient: 'bg-pink-100', // Simplified for React Native (gradients need LinearGradient library)
    outline: 'bg-white border-2 border-gray-200',
  };

  const content = (
    <View className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

