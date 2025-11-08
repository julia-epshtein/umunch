import React, { useState } from 'react';
import { TouchableOpacity, Text, View, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DatePickerProps {
  value: Date | null;
  onChange: (date: Date) => void;
  placeholder?: string;
  className?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = 'Select date',
  className = '',
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedYear, setSelectedYear] = useState(value?.getFullYear() || new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(value?.getMonth() || new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState(value?.getDate() || new Date().getDate());

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleConfirm = () => {
    const date = new Date(selectedYear, selectedMonth, selectedDay);
    onChange(date);
    setShowPicker(false);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Get days in selected month
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <>
      <TouchableOpacity
        onPress={() => setShowPicker(true)}
        className={`bg-gray-50 border border-gray-300 rounded-xl px-4 py-4 ${className}`}
      >
        <Text className={`text-base ${value ? 'text-gray-900' : 'text-gray-400'}`}>
          {value ? formatDate(value) : placeholder}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={showPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPicker(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6 max-h-[80%]">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-900">Select Date</Text>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View className="flex-row justify-around py-4">
              {/* Month Picker */}
              <View className="flex-1 items-center">
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  className="h-32"
                  contentContainerStyle={{ alignItems: 'center' }}
                >
                  {months.map((month, index) => (
                    <TouchableOpacity
                      key={month}
                      onPress={() => setSelectedMonth(index)}
                      className={`py-2 px-4 rounded-lg mb-1 ${
                        selectedMonth === index ? 'bg-teal-100' : ''
                      }`}
                    >
                      <Text
                        className={`text-lg font-semibold ${
                          selectedMonth === index ? 'text-teal-700' : 'text-gray-400'
                        }`}
                      >
                        {month.substring(0, 3)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Day Picker */}
              <View className="flex-1 items-center">
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  className="h-32"
                  contentContainerStyle={{ alignItems: 'center' }}
                >
                  {days.map((day) => (
                    <TouchableOpacity
                      key={day}
                      onPress={() => setSelectedDay(day)}
                      className={`py-2 px-4 rounded-lg mb-1 ${
                        selectedDay === day ? 'bg-teal-100' : ''
                      }`}
                    >
                      <Text
                        className={`text-2xl font-semibold ${
                          selectedDay === day ? 'text-teal-700' : 'text-gray-400'
                        }`}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Year Picker */}
              <View className="flex-1 items-center">
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  className="h-32"
                  contentContainerStyle={{ alignItems: 'center' }}
                >
                  {years.map((year) => (
                    <TouchableOpacity
                      key={year}
                      onPress={() => setSelectedYear(year)}
                      className={`py-2 px-4 rounded-lg mb-1 ${
                        selectedYear === year ? 'bg-teal-100' : ''
                      }`}
                    >
                      <Text
                        className={`text-lg font-semibold ${
                          selectedYear === year ? 'text-teal-700' : 'text-gray-400'
                        }`}
                      >
                        {year}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleConfirm}
              className="bg-teal-500 py-4 rounded-xl mt-4"
            >
              <Text className="text-white font-semibold text-center text-lg">Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};
