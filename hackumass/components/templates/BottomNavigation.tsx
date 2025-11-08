import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { Icon } from '../atoms/Icon';

const navItems = [
  { name: 'Home', icon: 'home', route: 'dashboard' },
  { name: 'Calendar', icon: 'calendar', route: 'calendar' },
  { name: 'Meals', icon: 'meals', route: 'meal' },
  { name: 'Workouts', icon: 'workouts', route: 'workout' },
  { name: 'Profile', icon: 'profile', route: 'profile' },
];

export const BottomNavigation: React.FC = () => {
  const router = useRouter();
  const segments = useSegments();
  const currentRoute = segments[segments.length - 1] || 'dashboard';

  return (
    <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex-row justify-around items-center py-3 px-2">
      {navItems.map((item) => {
        const isActive = currentRoute === item.route;
        return (
          <TouchableOpacity
            key={item.name}
            onPress={() => router.push(`/${item.route}` as any)}
            className="items-center flex-1"
            activeOpacity={0.7}
          >
            <Icon
              name={item.icon}
              size={24}
              color={isActive ? '#14b8a6' : '#6b7280'}
            />
            <Text
              className={`text-xs mt-1 ${
                isActive ? 'text-teal-500 font-semibold' : 'text-gray-500'
              }`}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

