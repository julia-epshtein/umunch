import React from 'react';
import { View, Text } from 'react-native';

interface DonutChartProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
  showValues?: boolean;
  label?: string;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  value,
  max,
  size = 120,
  strokeWidth = 12,
  color = '#14b8a6',
  backgroundColor = '#e0f2f1',
  showPercentage = true,
  showValues = false,
  label,
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  const innerSize = size - strokeWidth * 2;
  const radius = size / 2;

  // Simple visual representation using border
  // This creates a donut-like appearance
  return (
    <View className="items-center">
      <View style={{ width: size, height: size, position: 'relative', justifyContent: 'center', alignItems: 'center' }}>
        {/* Outer background ring */}
        <View
          style={{
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: radius,
            borderWidth: strokeWidth,
            borderColor: backgroundColor,
          }}
        />
        
        {/* Progress indicator - simplified circular progress */}
        <View
          style={{
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: radius,
            borderWidth: strokeWidth,
            borderColor: color,
            borderRightColor: percentage > 25 ? color : backgroundColor,
            borderBottomColor: percentage > 50 ? color : backgroundColor,
            borderLeftColor: percentage > 75 ? color : backgroundColor,
            transform: [{ rotate: `${(percentage / 100) * 360 - 90}deg` }],
          }}
        />

        {/* Center circle with content */}
        <View
          style={{
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
            backgroundColor: 'white',
            position: 'absolute',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10,
          }}
        >
          {showPercentage && (
            <Text className="text-2xl font-bold" style={{ color }}>
              {Math.round(percentage)}%
            </Text>
          )}
          {showValues && (
            <View className="items-center">
              <Text className="text-lg font-bold text-gray-900">{value}</Text>
              <Text className="text-xs text-gray-500">/ {max}</Text>
            </View>
          )}
        </View>
      </View>
      {label && (
        <Text className="text-sm text-gray-600 mt-2">{label}</Text>
      )}
    </View>
  );
};
