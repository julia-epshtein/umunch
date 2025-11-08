import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Link, Href } from 'expo-router';

interface LinkTextProps {
  preText: string;
  linkText: string;
  href: Href;
  className?: string;
}

export const LinkText: React.FC<LinkTextProps> = ({
  preText,
  linkText,
  href,
  className = '',
}) => {
  return (
    <View className={`flex-row justify-center items-center ${className}`}>
      <Text className="text-gray-600 text-base">{preText} </Text>
      <Link href={href} asChild>
        <TouchableOpacity>
          <Text className="text-teal-600 font-semibold text-base">
            {linkText}
          </Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
};
