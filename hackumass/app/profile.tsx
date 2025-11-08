import { SafeAreaView, View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { BottomNavigation } from '../components/templates/BottomNavigation';
import { Button } from '../atoms/Button';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

export default function ProfilePage() {
  const router = useRouter();
  const [showSettings, setShowSettings] = useState(false);

  // Sample user data - in production, this would come from state/API
  const userData = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    dietaryPreferences: ['Vegetarian', 'Gluten-Free'],
    allergies: ['Dairy', 'Nuts'],
    favoriteDiningHalls: ['Berkshire', 'Worcester'],
    caloriesGoal: 2000,
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-6 pt-6 pb-24" showsVerticalScrollIndicator={false}>
        {/* Header with Settings Icon */}
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-4xl font-bold text-gray-900">Profile</Text>
          <TouchableOpacity
            onPress={() => setShowSettings(true)}
            className="w-10 h-10 items-center justify-center"
          >
            <Ionicons name="settings-outline" size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Profile Header - Large Circle Image */}
        <View className="items-center mb-8">
          <View className="w-32 h-32 rounded-full bg-teal-500 items-center justify-center mb-4 shadow-lg">
            <Ionicons name="person" size={64} color="white" />
          </View>
          <Text className="text-3xl font-bold text-gray-900 mb-2">{userData.name}</Text>
        </View>

        {/* User Details - Directly on white background */}
        <View className="mb-6">
          <View className="mb-4">
            <Text className="text-sm text-gray-500 mb-1">Dietary Preferences</Text>
            <Text className="text-base text-gray-900">
              {userData.dietaryPreferences.join(', ')}
            </Text>
          </View>

          <View className="mb-4">
            <Text className="text-sm text-gray-500 mb-1">Allergies</Text>
            <Text className="text-base text-gray-900">
              {userData.allergies.join(', ')}
            </Text>
          </View>

          <View className="mb-4">
            <Text className="text-sm text-gray-500 mb-1">Favorite Dining Halls</Text>
            <Text className="text-base text-gray-900">
              {userData.favoriteDiningHalls.join(', ')}
            </Text>
          </View>

          <View className="mb-4">
            <Text className="text-sm text-gray-500 mb-1">Calories Goal</Text>
            <Text className="text-base text-gray-900">
              {userData.caloriesGoal.toLocaleString()} kcal per day
            </Text>
          </View>
        </View>

        <Button
          title="Sign Out"
          onPress={() => router.push('/login')}
          variant="outline"
        />
      </ScrollView>

      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSettings(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6" style={{ maxHeight: '60%' }}>
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-bold text-gray-900">Settings</Text>
              <TouchableOpacity onPress={() => setShowSettings(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <TouchableOpacity className="py-4 border-b border-gray-200 flex-row items-center justify-between">
                <Text className="text-base font-medium text-gray-900">Edit Profile</Text>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>

              <TouchableOpacity className="py-4 border-b border-gray-200 flex-row items-center justify-between">
                <Text className="text-base font-medium text-gray-900">Help & Support</Text>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>

              <TouchableOpacity 
                className="py-4 flex-row items-center justify-between"
                onPress={() => {
                  setShowSettings(false);
                  router.push('/login');
                }}
              >
                <Text className="text-base font-medium text-red-600">Sign Out</Text>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <BottomNavigation />
    </SafeAreaView>
  );
}
