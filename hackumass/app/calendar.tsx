import { SafeAreaView, View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { BottomNavigation } from '../components/templates/BottomNavigation';
import { Card } from '../components/molecules/Card';
import { useState } from 'react';

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);

  // Sample calendar data
  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  const workoutData: Record<number, { type: string; duration: number; distance?: number; calories: number }> = {
    5: { type: 'Running', duration: 30, distance: 5, calories: 300 },
    12: { type: 'Yoga', duration: 45, calories: 150 },
    18: { type: 'Cycling', duration: 60, distance: 15, calories: 450 },
  };

  const handleDatePress = (day: number) => {
    setSelectedDate(day);
    if (workoutData[day]) {
      setShowWorkoutModal(true);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-pink-50">
      <ScrollView className="flex-1 px-6 pt-6 pb-24" showsVerticalScrollIndicator={false}>
        <Text className="text-4xl font-bold text-gray-900 mb-2">Calendar</Text>
        <Text className="text-lg text-gray-600 mb-6">Tap a date to view workout details</Text>

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
              const hasWorkout = workoutData[day];
              const isSelected = selectedDate === day;
              return (
                <TouchableOpacity
                  key={day}
                  onPress={() => handleDatePress(day)}
                  className={`w-[14%] aspect-square items-center justify-center mb-2 ${
                    isSelected
                      ? 'bg-teal-500 rounded-full'
                      : hasWorkout
                      ? 'bg-teal-100 rounded-full'
                      : ''
                  }`}
                >
                  <Text
                    className={`text-base font-medium ${
                      isSelected
                        ? 'text-white'
                        : hasWorkout
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

        {/* Workout Summary Card */}
        {selectedDate && workoutData[selectedDate] && (
          <Card>
            <Text className="text-xl font-bold text-gray-900 mb-3">
              Workout on Day {selectedDate}
            </Text>
            <View>
              <Text className="text-gray-700 mb-2">
                <Text className="font-semibold">Type:</Text> {workoutData[selectedDate].type}
              </Text>
              <Text className="text-gray-700 mb-2">
                <Text className="font-semibold">Duration:</Text> {workoutData[selectedDate].duration} minutes
              </Text>
              {workoutData[selectedDate].distance && (
                <Text className="text-gray-700 mb-2">
                  <Text className="font-semibold">Distance:</Text> {workoutData[selectedDate].distance} km
                </Text>
              )}
              <Text className="text-gray-700">
                <Text className="font-semibold">Calories burned:</Text> {workoutData[selectedDate].calories}
              </Text>
            </View>
          </Card>
        )}
      </ScrollView>

      <Modal
        visible={showWorkoutModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowWorkoutModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6">
            {selectedDate && workoutData[selectedDate] && (
              <>
                <Text className="text-2xl font-bold text-gray-900 mb-4">
                  Workout Details
                </Text>
                <Card>
                  <Text className="text-lg font-semibold text-gray-900 mb-2">
                    {workoutData[selectedDate].type}
                  </Text>
                  <Text className="text-gray-700 mb-1">
                    Duration: {workoutData[selectedDate].duration} minutes
                  </Text>
                  {workoutData[selectedDate].distance && (
                    <Text className="text-gray-700 mb-1">
                      Distance: {workoutData[selectedDate].distance} km
                    </Text>
                  )}
                  <Text className="text-gray-700">
                    Calories: {workoutData[selectedDate].calories} cal
                  </Text>
                </Card>
                <TouchableOpacity
                  onPress={() => setShowWorkoutModal(false)}
                  className="mt-4 bg-teal-500 py-4 rounded-xl"
                >
                  <Text className="text-white font-semibold text-center text-lg">Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      <BottomNavigation />
    </SafeAreaView>
  );
}

