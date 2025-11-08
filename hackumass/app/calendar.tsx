import { SafeAreaView, View, Text, ScrollView, TouchableOpacity, Modal, TextInput } from 'react-native';
import { BottomNavigation } from '../components/templates/BottomNavigation';
import { Card } from '../components/molecules/Card';
import { Button } from '../atoms/Button';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface DayData {
  workouts?: Array<{ type: string; duration: number; distance?: number; calories: number }>;
  meals?: Array<{ name: string; mealType: string; calories: number }>;
  notes?: string;
}

export default function CalendarPage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [dayData, setDayData] = useState<Record<number, DayData>>({
    5: { 
      workouts: [{ type: 'Indoor Run', duration: 35, distance: 7.12, calories: 452 }],
      meals: [
        { name: 'Grilled Chicken Salad', mealType: 'Breakfast', calories: 320 },
        { name: 'Quinoa Bowl', mealType: 'Lunch', calories: 450 },
      ],
    },
    12: { 
      workouts: [{ type: 'Yoga', duration: 45, calories: 150 }],
    },
    18: { 
      workouts: [{ type: 'Outdoor Cycle', duration: 24, distance: 4.22, calories: 248 }],
      meals: [
        { name: 'Caesar Salad', mealType: 'Dinner', calories: 350 },
      ],
    },
  });
  const [editingNotes, setEditingNotes] = useState('');

  // Sample calendar data
  const days = Array.from({ length: 30 }, (_, i) => i + 1);

  const handleDatePress = (day: number) => {
    setSelectedDate(day);
    setEditingNotes(dayData[day]?.notes || '');
    setShowEditModal(true);
  };

  const handleSave = () => {
    if (selectedDate) {
      setDayData({
        ...dayData,
        [selectedDate]: {
          ...dayData[selectedDate],
          notes: editingNotes,
        },
      });
    }
    setShowEditModal(false);
  };

  const currentDayData = selectedDate ? dayData[selectedDate] : null;
  const selectedDateObj = selectedDate ? new Date(2024, 6, selectedDate) : new Date();
  const dateString = selectedDateObj.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  const getWorkoutIcon = (type: string) => {
    if (type.toLowerCase().includes('run')) return 'walk';
    if (type.toLowerCase().includes('cycle')) return 'bicycle';
    if (type.toLowerCase().includes('yoga')) return 'leaf';
    return 'fitness';
  };

  const mealIcons: Record<string, string> = {
    'Breakfast': 'cafe',
    'Lunch': 'restaurant',
    'Dinner': 'wine',
    'Snacks': 'ice-cream',
  };

  const mealColors: Record<string, { color: string; bgColor: string }> = {
    'Breakfast': { color: '#f97316', bgColor: '#fff7ed' },
    'Lunch': { color: '#3b82f6', bgColor: '#eff6ff' },
    'Dinner': { color: '#8b5cf6', bgColor: '#f5f3ff' },
    'Snacks': { color: '#eab308', bgColor: '#fefce8' },
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-6 pt-6 pb-24" showsVerticalScrollIndicator={false}>
        <Text className="text-4xl font-bold text-gray-900 mb-2">Calendar</Text>
        <Text className="text-lg text-gray-600 mb-6">Tap a date to view or edit details</Text>

        {/* Calendar Grid */}
        <View className="mb-6">
          <View className="flex-row justify-around mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <Text key={day} className="text-sm font-semibold text-gray-600 w-10 text-center">
                {day}
              </Text>
            ))}
          </View>
          <View className="flex-row flex-wrap">
            {days.map((day) => {
              const hasData = dayData[day];
              const isSelected = selectedDate === day;
              return (
                <TouchableOpacity
                  key={day}
                  onPress={() => handleDatePress(day)}
                  className={`w-[14%] aspect-square items-center justify-center mb-2 ${
                    isSelected
                      ? 'bg-teal-500 rounded-full'
                      : hasData
                      ? 'bg-teal-100 rounded-full'
                      : 'bg-white rounded-full border border-gray-200'
                  }`}
                >
                  <Text
                    className={`text-base font-medium ${
                      isSelected
                        ? 'text-white'
                        : hasData
                        ? 'text-teal-700'
                        : 'text-gray-700'
                    }`}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Slide-Up Panel with Soft Pink Background */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View className="flex-1 justify-end bg-black/30">
          <View 
            className="bg-pink-50 rounded-t-3xl"
            style={{ 
              maxHeight: '85%',
              // Add subtle contour lines effect with gradient overlay
            }}
          >
            {/* Handle bar */}
            <View className="items-center pt-3 pb-2">
              <View className="w-12 h-1 bg-pink-300 rounded-full" />
            </View>

            {/* Header with Date */}
            <View className="px-6 pt-4 pb-6">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-3xl font-bold text-gray-900">
                  {dateString}
                </Text>
                <TouchableOpacity
                  onPress={() => setShowEditModal(false)}
                  className="w-10 h-10 items-center justify-center bg-pink-200 rounded-full"
                >
                  <Ionicons name="close" size={20} color="#9f1239" />
                </TouchableOpacity>
              </View>
              {currentDayData?.workouts && (
                <Text className="text-lg text-gray-600">
                  {currentDayData.workouts.length} Workout{currentDayData.workouts.length !== 1 ? 's' : ''}
                </Text>
              )}
            </View>

            <ScrollView className="px-6 pb-6" showsVerticalScrollIndicator={false}>
              {/* Workouts Section */}
              {currentDayData?.workouts && currentDayData.workouts.length > 0 && (
                <View className="mb-6">
                  {currentDayData.workouts.map((workout, index) => (
                    <View
                      key={index}
                      className="mb-3 p-4 bg-white rounded-2xl flex-row items-center"
                      style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }}
                    >
                      {/* Left Icon */}
                      <View className="w-14 h-14 rounded-full bg-pink-100 items-center justify-center mr-4">
                        <Ionicons 
                          name={getWorkoutIcon(workout.type) as any} 
                          size={24} 
                          color="#ec4899" 
                        />
                      </View>
                      
                      {/* Middle Content */}
                      <View className="flex-1">
                        <Text className="text-lg font-bold text-gray-900 mb-1">
                          {workout.type}
                        </Text>
                        <Text className="text-sm text-gray-600">
                          {workout.duration} min
                          {workout.distance && ` • ${workout.distance} km`}
                        </Text>
                      </View>
                      
                      {/* Right Calories */}
                      <View className="items-end">
                        <View className="flex-row items-center">
                          <Ionicons name="flame" size={16} color="#f97316" />
                          <Text className="text-base font-bold text-gray-900 ml-1">
                            {workout.calories} kcal
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Meals Section - Horizontal Carousel */}
              {currentDayData?.meals && currentDayData.meals.length > 0 && (
                <View className="mb-6">
                  <Text className="text-lg font-bold text-gray-900 mb-3">Meals</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {currentDayData.meals.map((meal, index) => {
                      const mealConfig = mealColors[meal.mealType] || { color: '#6b7280', bgColor: '#f3f4f6' };
                      return (
                        <View
                          key={index}
                          className="mr-3 p-4 rounded-2xl"
                          style={{ 
                            backgroundColor: mealConfig.bgColor,
                            width: 140,
                            shadowColor: '#000', 
                            shadowOffset: { width: 0, height: 1 }, 
                            shadowOpacity: 0.1, 
                            shadowRadius: 2, 
                            elevation: 2 
                          }}
                        >
                          <View className="items-center mb-2">
                            <View 
                              className="w-12 h-12 rounded-full items-center justify-center mb-2"
                              style={{ backgroundColor: mealConfig.color + '20' }}
                            >
                              <Ionicons 
                                name={mealIcons[meal.mealType] as any || 'restaurant'} 
                                size={24} 
                                color={mealConfig.color} 
                              />
                            </View>
                            <Text className="text-xs font-semibold text-gray-600 uppercase mb-1">
                              {meal.mealType}
                            </Text>
                            <Text className="text-sm font-bold text-gray-900 text-center">
                              {meal.name}
                            </Text>
                            <Text className="text-xs text-gray-600 mt-1">
                              {meal.calories} kcal
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                  </ScrollView>
                </View>
              )}

              {/* Notes Section - Editable */}
              <View className="mb-6">
                <Text className="text-lg font-bold text-gray-900 mb-3">Notes</Text>
                <TextInput
                  value={editingNotes}
                  onChangeText={setEditingNotes}
                  placeholder="Add notes for this day..."
                  multiline
                  numberOfLines={4}
                  className="bg-white border border-gray-200 rounded-xl p-4 text-gray-900 min-h-[100px]"
                  textAlignVertical="top"
                />
              </View>

              {/* Action Buttons */}
              <View className="flex-row gap-3 mb-6">
                <Button
                  title="Add Workout"
                  onPress={() => {
                    setShowEditModal(false);
                    router.push('/workout');
                  }}
                  className="flex-1"
                />
                <Button
                  title="Add Meal"
                  onPress={() => {
                    setShowEditModal(false);
                    router.push('/meal');
                  }}
                  className="flex-1 bg-orange-500"
                />
              </View>

              <Button
                title="Save Changes"
                onPress={handleSave}
                className="mb-6"
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      <BottomNavigation />
    </SafeAreaView>
  );
}
