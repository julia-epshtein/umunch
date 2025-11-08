import { SafeAreaView, View, Text, ScrollView, TouchableOpacity, Modal, TextInput } from 'react-native';
import { BottomNavigation } from '../components/templates/BottomNavigation';
import { Card } from '../components/molecules/Card';
import { Button } from '../components/atoms/Button';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

interface DayData {
  workouts?: Array<{ type: string; duration: number; distance?: number; calories: number }>;
  meals?: Array<{ name: string; calories: number }>;
  notes?: string;
}

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [dayData, setDayData] = useState<Record<number, DayData>>({
    5: { 
      workouts: [{ type: 'Running', duration: 30, distance: 5, calories: 300 }],
      meals: [{ name: 'Grilled Chicken Salad', calories: 320 }],
    },
    12: { 
      workouts: [{ type: 'Yoga', duration: 45, calories: 150 }],
    },
    18: { 
      workouts: [{ type: 'Cycling', duration: 60, distance: 15, calories: 450 }],
      meals: [{ name: 'Quinoa Bowl', calories: 450 }],
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

      {/* Improved Slide-Up Edit Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl shadow-2xl" style={{ maxHeight: '80%' }}>
            {/* Handle bar */}
            <View className="items-center pt-3 pb-2">
              <View className="w-12 h-1 bg-gray-300 rounded-full" />
            </View>

            {/* Header */}
            <View className="px-6 pt-4 pb-6 border-b border-gray-100">
              <View className="flex-row items-center justify-between">
                <Text className="text-2xl font-bold text-gray-900">
                  {selectedDate ? `Day ${selectedDate}` : 'Edit Day'}
                </Text>
                <TouchableOpacity
                  onPress={() => setShowEditModal(false)}
                  className="w-8 h-8 items-center justify-center"
                >
                  <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView className="px-6 py-6" showsVerticalScrollIndicator={false}>
              {/* Workouts Section */}
              {currentDayData?.workouts && currentDayData.workouts.length > 0 && (
                <View className="mb-6">
                  <Text className="text-lg font-bold text-gray-900 mb-3">Workouts</Text>
                  {currentDayData.workouts.map((workout, index) => (
                    <Card key={index} className="mb-3 bg-teal-50">
                      <View className="flex-row items-center mb-2">
                        <Ionicons name="fitness" size={20} color="#14b8a6" />
                        <Text className="text-lg font-semibold text-gray-900 ml-2">
                          {workout.type}
                        </Text>
                      </View>
                      <Text className="text-gray-700 mb-1">
                        Duration: {workout.duration} minutes
                      </Text>
                      {workout.distance && (
                        <Text className="text-gray-700 mb-1">
                          Distance: {workout.distance} km
                        </Text>
                      )}
                      <Text className="text-gray-700">
                        Calories: {workout.calories} cal
                      </Text>
                    </Card>
                  ))}
                </View>
              )}

              {/* Meals Section */}
              {currentDayData?.meals && currentDayData.meals.length > 0 && (
                <View className="mb-6">
                  <Text className="text-lg font-bold text-gray-900 mb-3">Meals</Text>
                  {currentDayData.meals.map((meal, index) => (
                    <Card key={index} className="mb-3 bg-orange-50">
                      <View className="flex-row items-center mb-2">
                        <Ionicons name="restaurant" size={20} color="#f97316" />
                        <Text className="text-lg font-semibold text-gray-900 ml-2">
                          {meal.name}
                        </Text>
                      </View>
                      <Text className="text-gray-700">
                        Calories: {meal.calories} cal
                      </Text>
                    </Card>
                  ))}
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
                  className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-900 min-h-[100px]"
                  textAlignVertical="top"
                />
              </View>

              {/* Action Buttons */}
              <View className="flex-row gap-3 mb-6">
                <Button
                  title="Add Workout"
                  onPress={() => {
                    // Navigate to workout page
                    setShowEditModal(false);
                  }}
                  className="flex-1"
                />
                <Button
                  title="Add Meal"
                  onPress={() => {
                    // Navigate to meal page
                    setShowEditModal(false);
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
