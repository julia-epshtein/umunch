import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
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
      <View className="flex-row items-center bg-white rounded-xl px-4 h-14 border border-gray-200"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 2,
        }}
      >
        <Ionicons name="search" size={20} color="#6b7280" style={{ marginRight: 12 }} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          className="flex-1 text-gray-900 text-base"
        />
      </View>
    </View>
  );
};
