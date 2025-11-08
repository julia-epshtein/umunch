import React from 'react';
import { View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  className?: string;
}

type IconComponentType = typeof Ionicons | typeof MaterialCommunityIcons;

interface IconMapEntry {
  component: IconComponentType;
  name: string;
}

// Map of icon names to actual icon components and names
const iconMap: Record<string, IconMapEntry> = {
  home: { component: Ionicons, name: 'home' },
  calendar: { component: Ionicons, name: 'calendar' },
  meals: { component: Ionicons, name: 'restaurant' },
  workouts: { component: MaterialCommunityIcons, name: 'dumbbell' },
  profile: { component: Ionicons, name: 'person' },
  running: { component: Ionicons, name: 'walk' },
  cycling: { component: Ionicons, name: 'bicycle' },
  yoga: { component: MaterialCommunityIcons, name: 'yoga' },
  weights: { component: MaterialCommunityIcons, name: 'weight-lifter' },
  weightGain: { component: Ionicons, name: 'trending-up' },
  weightLoss: { component: Ionicons, name: 'trending-down' },
  maintainWeight: { component: MaterialCommunityIcons, name: 'scale-balance' },
  calorie: { component: Ionicons, name: 'flame' },
  homeWorkout: { component: Ionicons, name: 'home' },
};

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color = '#000',
  className = '',
}) => {
  const iconConfig = iconMap[name];
  
  if (!iconConfig) {
    // Fallback to a default icon if name not found
    return <Ionicons name="ellipse" size={size} color={color} />;
  }

  const IconComponent = iconConfig.component;
  
  return (
    <View className={className}>
      <IconComponent name={iconConfig.name as any} size={size} color={color} />
    </View>
  );
};

