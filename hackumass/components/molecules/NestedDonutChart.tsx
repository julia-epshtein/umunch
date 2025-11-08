import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface MacroData {
  consumed: number;
  goal: number;
  label: string;
  color: string;
  backgroundColor: string;
}

interface NestedDonutChartProps {
  carbs: MacroData;
  protein: MacroData;
  fat: MacroData;
  size?: number;
}

export const NestedDonutChart: React.FC<NestedDonutChartProps> = ({
  carbs,
  protein,
  fat,
  size = 200,
}) => {
  const getPercentage = (consumed: number, goal: number) => {
    return goal > 0 ? Math.min((consumed / goal) * 100, 100) : 0;
  };

  const carbsPercentage = getPercentage(carbs.consumed, carbs.goal);
  const proteinPercentage = getPercentage(protein.consumed, protein.goal);
  const fatPercentage = getPercentage(fat.consumed, fat.goal);

  // Ring dimensions
  const outerRadius = size / 2;
  const middleRadius = outerRadius * 0.75;
  const innerRadius = outerRadius * 0.5;
  
  const outerStrokeWidth = 16;
  const middleStrokeWidth = 14;
  const innerStrokeWidth = 12;

  // Calculate progress for each ring (simplified visual representation)
  const renderRing = (percentage: number, radius: number, strokeWidth: number, color: string, bgColor: string) => {
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;
    
    // For a simplified visual, we'll use border-based approach
    return {
      width: radius * 2,
      height: radius * 2,
      borderRadius: radius,
      borderWidth: strokeWidth,
      borderColor: bgColor,
      borderRightColor: percentage > 25 ? color : bgColor,
      borderBottomColor: percentage > 50 ? color : bgColor,
      borderLeftColor: percentage > 75 ? color : bgColor,
      transform: [{ rotate: `${(percentage / 100) * 360 - 90}deg` }],
    };
  };

  return (
    <View className="items-center">
      {/* Nested Donut Chart */}
      <View style={{ width: size, height: size, position: 'relative', justifyContent: 'center', alignItems: 'center' }}>
        {/* Outer Ring - Carbs */}
        <View
          style={[
            styles.ring,
            {
              width: outerRadius * 2,
              height: outerRadius * 2,
              borderRadius: outerRadius,
              borderWidth: outerStrokeWidth,
              borderColor: carbs.backgroundColor,
              borderRightColor: carbsPercentage > 25 ? carbs.color : carbs.backgroundColor,
              borderBottomColor: carbsPercentage > 50 ? carbs.color : carbs.backgroundColor,
              borderLeftColor: carbsPercentage > 75 ? carbs.color : carbs.backgroundColor,
              transform: [{ rotate: `${(carbsPercentage / 100) * 360 - 90}deg` }],
            },
          ]}
        />
        
        {/* Middle Ring - Protein */}
        <View
          style={[
            styles.ring,
            {
              width: middleRadius * 2,
              height: middleRadius * 2,
              borderRadius: middleRadius,
              borderWidth: middleStrokeWidth,
              borderColor: protein.backgroundColor,
              borderRightColor: proteinPercentage > 25 ? protein.color : protein.backgroundColor,
              borderBottomColor: proteinPercentage > 50 ? protein.color : protein.backgroundColor,
              borderLeftColor: proteinPercentage > 75 ? protein.color : protein.backgroundColor,
              transform: [{ rotate: `${(proteinPercentage / 100) * 360 - 90}deg` }],
              position: 'absolute',
            },
          ]}
        />
        
        {/* Inner Ring - Fat */}
        <View
          style={[
            styles.ring,
            {
              width: innerRadius * 2,
              height: innerRadius * 2,
              borderRadius: innerRadius,
              borderWidth: innerStrokeWidth,
              borderColor: fat.backgroundColor,
              borderRightColor: fatPercentage > 25 ? fat.color : fat.backgroundColor,
              borderBottomColor: fatPercentage > 50 ? fat.color : fat.backgroundColor,
              borderLeftColor: fatPercentage > 75 ? fat.color : fat.backgroundColor,
              transform: [{ rotate: `${(fatPercentage / 100) * 360 - 90}deg` }],
              position: 'absolute',
            },
          ]}
        />
      </View>

      {/* Legend and Values */}
      <View className="w-full mt-6">
        {/* Carbs - Outer Ring */}
        <View className="flex-row items-center justify-between mb-4 p-3 bg-orange-50 rounded-xl">
          <View className="flex-row items-center flex-1">
            <View className="w-5 h-5 rounded-full mr-3" style={{ backgroundColor: carbs.color }} />
            <Text className="text-base font-semibold text-gray-900">{carbs.label}</Text>
          </View>
          <View className="items-end">
            <Text className="text-sm font-bold text-gray-900">
              {carbs.consumed}g / {carbs.goal}g
            </Text>
            <Text className="text-xs text-gray-600">
              {Math.round(carbsPercentage)}%
            </Text>
          </View>
        </View>

        {/* Protein - Middle Ring */}
        <View className="flex-row items-center justify-between mb-4 p-3 bg-blue-50 rounded-xl">
          <View className="flex-row items-center flex-1">
            <View className="w-5 h-5 rounded-full mr-3" style={{ backgroundColor: protein.color }} />
            <Text className="text-base font-semibold text-gray-900">{protein.label}</Text>
          </View>
          <View className="items-end">
            <Text className="text-sm font-bold text-gray-900">
              {protein.consumed}g / {protein.goal}g
            </Text>
            <Text className="text-xs text-gray-600">
              {Math.round(proteinPercentage)}%
            </Text>
          </View>
        </View>

        {/* Fat - Inner Ring */}
        <View className="flex-row items-center justify-between mb-4 p-3 bg-yellow-50 rounded-xl">
          <View className="flex-row items-center flex-1">
            <View className="w-5 h-5 rounded-full mr-3" style={{ backgroundColor: fat.color }} />
            <Text className="text-base font-semibold text-gray-900">{fat.label}</Text>
          </View>
          <View className="items-end">
            <Text className="text-sm font-bold text-gray-900">
              {fat.consumed}g / {fat.goal}g
            </Text>
            <Text className="text-xs text-gray-600">
              {Math.round(fatPercentage)}%
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  ring: {
    position: 'absolute',
  },
});

