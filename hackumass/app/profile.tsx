import { SafeAreaView, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { BottomNavigation } from '../components/templates/BottomNavigation';
import { Card } from '../components/molecules/Card';
import { Button } from '../components/atoms/Button';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ProfilePage() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-pink-50">
      <ScrollView className="flex-1 px-6 pt-6 pb-24" showsVerticalScrollIndicator={false}>
        <Text className="text-4xl font-bold text-gray-900 mb-2">Profile</Text>
        <Text className="text-lg text-gray-600 mb-6">Manage your account and settings</Text>

        <Card className="mb-4">
          <View className="items-center mb-4">
            <View className="w-24 h-24 rounded-full bg-teal-500 items-center justify-center mb-3">
              <Ionicons name="person" size={48} color="white" />
            </View>
            <Text className="text-2xl font-bold text-gray-900">John Doe</Text>
            <Text className="text-gray-600">john.doe@example.com</Text>
          </View>
        </Card>

        <Card className="mb-4">
          <Text className="text-xl font-bold text-gray-900 mb-4">Settings</Text>
          <TouchableOpacity className="py-3 border-b border-gray-200">
            <Text className="text-gray-700 font-medium">Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity className="py-3 border-b border-gray-200">
            <Text className="text-gray-700 font-medium">Dietary Preferences</Text>
          </TouchableOpacity>
          <TouchableOpacity className="py-3 border-b border-gray-200">
            <Text className="text-gray-700 font-medium">Fitness Goals</Text>
          </TouchableOpacity>
          <TouchableOpacity className="py-3">
            <Text className="text-gray-700 font-medium">Notifications</Text>
          </TouchableOpacity>
        </Card>

        <Button
          title="Sign Out"
          onPress={() => router.push('/login')}
          variant="outline"
        />
      </ScrollView>
      <BottomNavigation />
    </SafeAreaView>
  );
}

