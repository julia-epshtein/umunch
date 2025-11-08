import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Icon } from '../atoms/Icon';

interface GoalCardProps {
  title: string;
  icon: string;
  selected: boolean;
  onPress: () => void;
  color?: string;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  title,
  icon,
  selected,
  onPress,
  color = 'teal',
}) => {
  const colorClasses = {
    teal: selected ? 'bg-teal-100 border-teal-500' : 'bg-teal-50 border-gray-200',
    pink: selected ? 'bg-pink-100 border-pink-500' : 'bg-pink-50 border-gray-200',
    green: selected ? 'bg-green-100 border-green-500' : 'bg-green-50 border-gray-200',
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`rounded-2xl p-4 border-2 ${colorClasses[color as keyof typeof colorClasses] || colorClasses.teal} shadow-sm mb-3`}
      activeOpacity={0.7}
    >
      <View className="items-center">
        <Icon name={icon} size={32} />
        <Text className={`mt-2 text-center font-semibold text-base ${
          selected ? 'text-gray-900' : 'text-gray-600'
        }`}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

