import React from 'react';
import { View } from 'react-native';
import { Input } from '../atoms/Input';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search...',
  className = '',
}) => {
  return (
    <View className={`mb-4 relative ${className}`}>
      <Input
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        className="pl-10"
      />
      <View className="absolute left-3 top-4">
        <Ionicons name="search" size={20} color="#6b7280" />
      </View>
    </View>
  );
};

