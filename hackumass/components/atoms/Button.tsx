import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  className = '',
}) => {
  const baseStyles = 'py-4 px-6 rounded-xl items-center justify-center';
  
  const variantStyles = {
    primary: 'bg-teal-500 active:bg-teal-600',
    secondary: 'bg-pink-400 active:bg-pink-500',
    outline: 'bg-transparent border-2 border-teal-500',
  };

  const textStyles = {
    primary: 'text-white font-semibold text-lg',
    secondary: 'text-white font-semibold text-lg',
    outline: 'text-teal-600 font-semibold text-lg',
  };

  const disabledStyles = disabled || loading ? 'opacity-50' : '';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`${baseStyles} ${variantStyles[variant]} ${disabledStyles} ${className}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? '#2563eb' : '#ffffff'} />
      ) : (
        <Text className={textStyles[variant]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};
