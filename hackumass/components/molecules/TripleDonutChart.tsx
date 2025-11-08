import React from 'react';
import { View, Text } from 'react-native';
import { DonutChart } from './DonutChart';

interface MacroData {
  consumed: number;
  goal: number;
  label: string;
  color: string;
  backgroundColor: string;
}

interface TripleDonutChartProps {
  carbs: MacroData;
  protein: MacroData;
  fat: MacroData;
}

export const TripleDonutChart: React.FC<TripleDonutChartProps> = ({
  carbs,
  protein,
  fat,
}) => {
  const getPercentage = (consumed: number, goal: number) => {
    return goal > 0 ? Math.min((consumed / goal) * 100, 100) : 0;
  };

  const getGrams = (consumed: number, goal: number) => {
    return { consumed, goal };
  };

  return (
    <View className="items-center">
      {/* Three donut charts in a row */}
      <View className="flex-row justify-around w-full mb-4">
        <DonutChart
          value={carbs.consumed}
          max={carbs.goal}
          size={100}
          strokeWidth={10}
          color={carbs.color}
          backgroundColor={carbs.backgroundColor}
          showPercentage={true}
        />
        <DonutChart
          value={protein.consumed}
          max={protein.goal}
          size={100}
          strokeWidth={10}
          color={protein.color}
          backgroundColor={protein.backgroundColor}
          showPercentage={true}
        />
        <DonutChart
          value={fat.consumed}
          max={fat.goal}
          size={100}
          strokeWidth={10}
          color={fat.color}
          backgroundColor={fat.backgroundColor}
          showPercentage={true}
        />
      </View>

      {/* Legend and details */}
      <View className="w-full">
        {/* Carbs */}
        <View className="flex-row items-center justify-between mb-3 p-3 bg-orange-50 rounded-xl">
          <View className="flex-row items-center flex-1">
            <View className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: carbs.color }} />
            <Text className="text-base font-semibold text-gray-900">{carbs.label}</Text>
          </View>
          <View className="items-end">
            <Text className="text-sm font-bold text-gray-900">
              {carbs.consumed}g / {carbs.goal}g
            </Text>
            <Text className="text-xs text-gray-600">
              {Math.round(getPercentage(carbs.consumed, carbs.goal))}%
            </Text>
          </View>
        </View>

        {/* Protein */}
        <View className="flex-row items-center justify-between mb-3 p-3 bg-blue-50 rounded-xl">
          <View className="flex-row items-center flex-1">
            <View className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: protein.color }} />
            <Text className="text-base font-semibold text-gray-900">{protein.label}</Text>
          </View>
          <View className="items-end">
            <Text className="text-sm font-bold text-gray-900">
              {protein.consumed}g / {protein.goal}g
            </Text>
            <Text className="text-xs text-gray-600">
              {Math.round(getPercentage(protein.consumed, protein.goal))}%
            </Text>
          </View>
        </View>

        {/* Fat */}
        <View className="flex-row items-center justify-between mb-3 p-3 bg-yellow-50 rounded-xl">
          <View className="flex-row items-center flex-1">
            <View className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: fat.color }} />
            <Text className="text-base font-semibold text-gray-900">{fat.label}</Text>
          </View>
          <View className="items-end">
            <Text className="text-sm font-bold text-gray-900">
              {fat.consumed}g / {fat.goal}g
            </Text>
            <Text className="text-xs text-gray-600">
              {Math.round(getPercentage(fat.consumed, fat.goal))}%
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

