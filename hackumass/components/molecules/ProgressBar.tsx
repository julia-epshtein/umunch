import React from 'react';
import { View, Text } from 'react-native';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  totalSteps,
  className = '',
}) => {
  const percentage = (currentStep / totalSteps) * 100;

  return (
    <View className={`px-6 pt-4 pb-2 ${className}`}>
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-sm text-gray-600">
          Step {currentStep} of {totalSteps}
        </Text>
        <Text className="text-sm font-semibold text-gray-900">
          {Math.round(percentage)}%
        </Text>
      </View>
      <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <View
          className="h-full bg-teal-500 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </View>
    </View>
  );
};

