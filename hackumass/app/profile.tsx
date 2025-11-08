import { SafeAreaView, View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { BottomNavigation } from '../components/templates/BottomNavigation';
import { Button } from '../components/atoms/Button';
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
    dietaryPreferences: ['Vegetarian', 'Gluten-Free', 'Low Carb'],
    allergies: ['Dairy', 'Nuts', 'Shellfish'],
    favoriteDiningHalls: ['Berkshire', 'Worcester'],
    caloriesGoal: 2000,
  };

  const preferenceColors = ['#3b82f6', '#14b8a6', '#8b5cf6', '#f97316', '#eab308'];
  const allergyColors = ['#ef4444', '#f97316', '#ec4899'];

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
          <View className="w-32 h-32 rounded-full bg-teal-500 items-center justify-center mb-4"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Ionicons name="person" size={64} color="white" />
          </View>
          <Text className="text-3xl font-bold text-gray-900 mb-2">{userData.name}</Text>
        </View>

        {/* Dietary Preferences Section */}
        <View className="mb-4 p-4 bg-blue-50 rounded-2xl"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
          }}
        >
          <Text className="text-lg font-bold text-gray-900 mb-3">Dietary Preferences</Text>
          <View className="flex-row flex-wrap">
            {userData.dietaryPreferences.map((pref, index) => (
              <View
                key={pref}
                className="px-4 py-2 rounded-full mr-2 mb-2"
                style={{ backgroundColor: preferenceColors[index % preferenceColors.length] + '20' }}
              >
                <Text
                  className="text-sm font-semibold"
                  style={{ color: preferenceColors[index % preferenceColors.length] }}
                >
                  {pref}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Allergies Section */}
        <View className="mb-4 p-4 bg-red-50 rounded-2xl"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
          }}
        >
          <Text className="text-lg font-bold text-gray-900 mb-3">Allergies</Text>
          <View className="flex-row flex-wrap">
            {userData.allergies.map((allergy, index) => (
              <View
                key={allergy}
                className="px-4 py-2 rounded-full mr-2 mb-2"
                style={{ backgroundColor: allergyColors[index % allergyColors.length] + '20' }}
              >
                <Text
                  className="text-sm font-semibold"
                  style={{ color: allergyColors[index % allergyColors.length] }}
                >
                  {allergy}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Favorite Dining Halls Section */}
        <View className="mb-4 p-4 bg-orange-50 rounded-2xl"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
          }}
        >
          <Text className="text-lg font-bold text-gray-900 mb-3">Favorite Dining Halls</Text>
          <View>
            {userData.favoriteDiningHalls.map((hall) => (
              <View key={hall} className="flex-row items-center mb-2">
                <Ionicons name="restaurant" size={20} color="#f97316" style={{ marginRight: 8 }} />
                <Text className="text-base text-gray-900">{hall}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Calories Goal Section */}
        <View className="mb-6 p-4 bg-teal-50 rounded-2xl"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
          }}
        >
          <Text className="text-lg font-bold text-gray-900 mb-2">Calories Goal</Text>
          <Text className="text-2xl font-bold text-teal-600">
            {userData.caloriesGoal.toLocaleString()} kcal
          </Text>
          <Text className="text-sm text-gray-600 mt-1">per day</Text>
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
