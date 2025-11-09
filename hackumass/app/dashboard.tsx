import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView, View, Text, ScrollView, TouchableOpacity, Modal, ActivityIndicator, RefreshControl } from 'react-native';
import { BottomNavigation } from '../components/templates/BottomNavigation';
import { Card } from '../components/molecules/Card';
import { NestedDonutChart } from '../components/molecules';
import { DatePicker } from '../components/atoms/DatePicker';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { UmunchApi } from '../lib/api'; // 👈 NEW: backend API helper

// Simple in-memory cache with TTL (Time To Live)
let dashboardCache: { data: any; timestamp: number } | null = null;
const CACHE_TTL = 30000; // 30 seconds - adjust as needed

// Export function to invalidate cache (can be called from other pages)
export const invalidateDashboardCache = () => {
  dashboardCache = null;
};

export default function DashboardPage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // 👇 NEW: dashboard data state
  const [snapshot, setSnapshot] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // TODO: replace with real logged-in user ID/email
  const externalUserKey = 'test_user_1';
  
  // DEMO: Hardcoded name for demo purposes
  const demoUserName = 'Roman Pisani';

  // 👇 OPTIMIZED: Memoized fetch function with caching
  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    // Check cache first (unless it's a manual refresh)
    if (!isRefresh && dashboardCache) {
      const age = Date.now() - dashboardCache.timestamp;
      if (age < CACHE_TTL) {
        // Cache is fresh, use it
        setSnapshot(dashboardCache.data);
        setLoading(false);
        return;
      }
    }

    if (!isRefresh) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    setError(null);

    try {
      const res = await UmunchApi.getTodayDashboard(externalUserKey);
      const data = res.snapshot;
      
      // 🎭 DEMO: Override data to 0s for Roman Pisani
      let finalData = data;
      if (demoUserName === 'Roman Pisani') {
        finalData = {
          ...data,
          CONSUMED_KCAL: 0,
          CONSUMED_PROTEIN_G: 0,
          CONSUMED_CARB_G: 0,
          CONSUMED_FAT_G: 0,
          KCAL_TARGET: data?.KCAL_TARGET || 2500,
          PROTEIN_TARGET_G: data?.PROTEIN_TARGET_G || 150,
          CARB_TARGET_G: data?.CARB_TARGET_G || 250,
          FAT_TARGET_G: data?.FAT_TARGET_G || 70,
        };
      }
      
      setSnapshot(finalData);
      // Update cache
      dashboardCache = {
        data: finalData,
        timestamp: Date.now(),
      };
    } catch (e: any) {
      console.error('Failed to load dashboard', e);
      setError(e.message ?? 'Failed to load dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [externalUserKey]);

  // 👇 OPTIMIZED: Only fetch on initial mount
  useEffect(() => {
    fetchDashboardData(false);
  }, [fetchDashboardData]);

  // Pull-to-refresh handler
  const onRefresh = useCallback(() => {
    fetchDashboardData(true);
  }, [fetchDashboardData]);

  // 🔢 Use backend data if we have it; otherwise fall back to 0s
  const calories = snapshot
    ? {
        consumed: snapshot.CONSUMED_KCAL ?? 0,
        goal: snapshot.KCAL_TARGET ?? 0,
      }
    : {
        consumed: 0,
        goal: 0,
      };

  const macros = snapshot
    ? {
        carbs: {
          consumed: snapshot.CONSUMED_CARB_G ?? 0,
          goal: snapshot.CARB_TARGET_G ?? 0,
          label: 'Carbs',
          color: '#f97316',
          backgroundColor: '#fff7ed',
        },
        protein: {
          consumed: snapshot.CONSUMED_PROTEIN_G ?? 0,
          goal: snapshot.PROTEIN_TARGET_G ?? 0,
          label: 'Protein',
          color: '#3b82f6',
          backgroundColor: '#eff6ff',
        },
        fat: {
          consumed: snapshot.CONSUMED_FAT_G ?? 0,
          goal: snapshot.FAT_TARGET_G ?? 0,
          label: 'Fat',
          color: '#eab308',
          backgroundColor: '#fefce8',
        },
      }
    : {
        carbs: { consumed: 0, goal: 0, label: 'Carbs', color: '#f97316', backgroundColor: '#fff7ed' },
        protein: { consumed: 0, goal: 0, label: 'Protein', color: '#3b82f6', backgroundColor: '#eff6ff' },
        fat: { consumed: 0, goal: 0, label: 'Fat', color: '#eab308', backgroundColor: '#fefce8' },
      };

  const caloriesPercentage =
    calories.goal > 0 ? (calories.consumed / calories.goal) * 100 : 0;

  // Get current day of week (0 = Sunday, 1 = Monday, etc.)
  const currentDayIndex = selectedDate.getDay();
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  
  // Get the date for each day of the week
  const getWeekDates = () => {
    const dates = [];
    const today = new Date(selectedDate);
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date.getDate());
    }
    return dates;
  };

  const weekDates = getWeekDates();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const meals = [
    { id: 'breakfast', name: 'Breakfast', icon: 'cafe', color: '#f97316', bgColor: '#fff7ed' },
    { id: 'lunch', name: 'Lunch', icon: 'restaurant', color: '#3b82f6', bgColor: '#eff6ff' },
    { id: 'dinner', name: 'Dinner', icon: 'wine', color: '#8b5cf6', bgColor: '#f5f3ff' },
    { id: 'snacks', name: 'Snacks', icon: 'ice-cream', color: '#eab308', bgColor: '#fefce8' },
  ];

  const healthyHabits = [
    { 
      id: 'water', 
      name: 'Water', 
      icon: 'water', 
      subtitle: '0.0 oz — You must be thirsty.',
      color: '#3b82f6',
      bgColor: '#eff6ff',
      route: '/water'
    },
    { 
      id: 'exercise', 
      name: 'Exercise', 
      icon: 'fitness', 
      subtitle: 'Track exercise to see calorie burn.',
      color: '#14b8a6',
      bgColor: '#f0fdfa',
      route: '/workout'
    },
    { 
      id: 'steps', 
      name: 'Steps', 
      icon: 'walk', 
      subtitle: 'Connect a device.',
      color: '#f97316',
      bgColor: '#fff7ed',
      route: '/steps'
    },
  ];

  const handleMealPress = (mealId: string) => {
    router.push('/meal');
  };

  const handleHabitPress = (route: string) => {
    router.push(route);
  };

  // Show loading spinner only on first load when we have no data
  if (loading && snapshot === null) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#14b8a6" />
        <Text className="mt-2 text-gray-600">Loading your day...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <Text className="text-red-500">Error: {error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView 
        className="flex-1 px-6 pt-6 pb-24" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#14b8a6']} tintColor="#14b8a6" />
        }
      >
        {/* Header with Today and Date Picker */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-3xl font-bold text-gray-900">Today</Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="flex-row items-center px-4 py-2 bg-gray-100 rounded-xl"
            >
              <Ionicons name="calendar-outline" size={20} color="#374151" />
              <Text className="ml-2 text-gray-700 font-medium">
                {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#6b7280" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>

          {/* Weekly Overview */}
          <View className="flex-row justify-around mb-2">
            {weekDays.map((day, index) => (
              <View key={index} className="items-center">
                <Text className="text-xs text-gray-500 mb-1">{day}</Text>
                <View
                  className={`w-10 h-10 rounded-full items-center justify-center ${
                    index === currentDayIndex
                      ? 'bg-teal-500'
                      : 'bg-gray-100'
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      index === currentDayIndex ? 'text-white' : 'text-gray-600'
                    }`}
                  >
                    {weekDates[index]}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Calories - Horizontal Progress Bar */}
        <Card className="mb-4 bg-teal-50">
          <View className="mb-3">
            <Text className="text-xl font-bold text-gray-900 mb-2">Calories</Text>
            <Text className="text-2xl font-bold text-gray-900">
              {calories.consumed.toLocaleString()} / {calories.goal.toLocaleString()} kcal
            </Text>
          </View>
          <View className="h-6 bg-gray-200 rounded-full overflow-hidden">
            <View
              className="h-full bg-teal-500 rounded-full"
              style={{ width: `${Math.min(caloriesPercentage, 100)}%` }}
            />
          </View>
        </Card>

        {/* Macros Section - Nested Donut Chart */}
        <Card className="mb-4 bg-pink-50">
          <Text className="text-xl font-bold text-gray-900 mb-4">Macros</Text>
          <NestedDonutChart
            carbs={macros.carbs}
            protein={macros.protein}
            fat={macros.fat}
            size={200}
          />
        </Card>

        {/* Meals Section */}
        <View className="mb-4">
          <Text className="text-xl font-bold text-gray-900 mb-3">Meals</Text>
          {meals.map((meal) => (
            <TouchableOpacity
              key={meal.id}
              onPress={() => handleMealPress(meal.id)}
              className="mb-3"
            >
              <Card className="rounded-2xl shadow-sm" style={{ backgroundColor: meal.bgColor }}>
                <View className="flex-row items-center justify-between p-4">
                  <View className="flex-row items-center flex-1">
                    <View
                      className="w-12 h-12 rounded-full items-center justify-center mr-4"
                      style={{ backgroundColor: meal.color + '20' }}
                    >
                      <Ionicons name={meal.icon as any} size={24} color={meal.color} />
                    </View>
                    <Text className="text-lg font-semibold text-gray-900">{meal.name}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleMealPress(meal.id)}
                    className="w-10 h-10 rounded-full items-center justify-center"
                    style={{ backgroundColor: meal.color + '20' }}
                  >
                    <Ionicons name="add" size={24} color={meal.color} />
                  </TouchableOpacity>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        {/* Healthy Habits Section */}
        <View className="mb-4">
          <Text className="text-xl font-bold text-gray-900 mb-3">Healthy Habits</Text>
          {healthyHabits.map((habit) => (
            <TouchableOpacity
              key={habit.id}
              onPress={() => handleHabitPress(habit.route)}
              className="mb-3"
            >
              <Card className="rounded-2xl shadow-sm" style={{ backgroundColor: habit.bgColor }}>
                <View className="flex-row items-center justify-between p-4">
                  <View className="flex-row items-center flex-1">
                    <View
                      className="w-12 h-12 rounded-full items-center justify-center mr-4"
                      style={{ backgroundColor: habit.color + '20' }}
                    >
                      <Ionicons name={habit.icon as any} size={24} color={habit.color} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-lg font-semibold text-gray-900 mb-1">
                        {habit.name}
                      </Text>
                      <Text className="text-sm text-gray-600">{habit.subtitle}</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-900">Select Date</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <DatePicker
              value={selectedDate}
              onChange={(date) => {
                setSelectedDate(date);
                setShowDatePicker(false);
              }}
            />
          </View>
        </View>
      </Modal>

      <BottomNavigation />
    </SafeAreaView>
  );
}
