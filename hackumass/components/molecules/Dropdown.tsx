import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Label } from '../atoms/Label';

interface DropdownProps {
  label?: string;
  options: string[];
  value: string | null;
  onSelect: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  label,
  options,
  value,
  onSelect,
  placeholder = 'Select an option',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View className={`mb-4 ${className}`}>
      {label && <Label text={label} />}
      <TouchableOpacity
        onPress={() => setIsOpen(true)}
        className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-4"
      >
        <Text className={`text-base ${value ? 'text-gray-900' : 'text-gray-400'}`}>
          {value || placeholder}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl max-h-[80%]">
            <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
              <Text className="text-xl font-bold text-gray-900">{label || 'Select'}</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Text className="text-teal-500 font-semibold text-lg">Done</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              {options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    onSelect(option);
                    setIsOpen(false);
                  }}
                  className={`px-4 py-4 border-b border-gray-100 ${
                    value === option ? 'bg-teal-50' : ''
                  }`}
                >
                  <Text className={`text-base ${value === option ? 'text-teal-600 font-semibold' : 'text-gray-700'}`}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

