import React from 'react';
import { Text } from 'react-native';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  className?: string;
}

// Simple emoji-based icons for now (can be replaced with icon library later)
const iconMap: Record<string, string> = {
  home: '🏠',
  calendar: '📅',
  meals: '🍽️',
  workouts: '🏋️‍♂️',
  profile: '👤',
  running: '🏃',
  cycling: '🚴',
  yoga: '🧘',
  weights: '💪',
  weightGain: '📈',
  weightLoss: '📉',
  maintainWeight: '⚖️',
  calorie: '🔥',
  homeWorkout: '🏡',
};

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color,
  className = '',
}) => {
  const emoji = iconMap[name] || '•';
  
  return (
    <Text
      className={className}
      style={{
        fontSize: size,
        color: color,
      }}
    >
      {emoji}
    </Text>
  );
};

