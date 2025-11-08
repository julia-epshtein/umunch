import { SafeAreaView, View, Text, ScrollView, TouchableOpacity, Modal, Animated } from 'react-native';
import { BottomNavigation } from '../components/templates/BottomNavigation';
import { Card } from '../components/molecules/Card';
import { Button } from '../components/atoms/Button';
import { FormField } from '../components/molecules/FormField';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useRef } from 'react';

export default function ProfilePage() {
  const router = useRouter();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  const [profileData, setProfileData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    dietaryPreferences: 'Vegetarian',
    fitnessGoals: 'Weight Loss',
  });

  const [editData, setEditData] = useState(profileData);

  const handleEditProfile = () => {
    setEditData(profileData);
    setShowEditModal(true);
  };

  const handleSave = () => {
    setProfileData(editData);
    setShowEditModal(false);
    setShowSuccess(true);
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowSuccess(false);
      });
    }, 2000);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-6 pt-6 pb-24" showsVerticalScrollIndicator={false}>
        <Text className="text-4xl font-bold text-gray-900 mb-2">Profile</Text>
        <Text className="text-lg text-gray-600 mb-6">Manage your account and settings</Text>

        <Card className="mb-4 shadow-md border border-gray-200">
          <View className="items-center mb-4">
            <View className="w-24 h-24 rounded-full bg-teal-500 items-center justify-center mb-3 shadow-lg">
              <Ionicons name="person" size={48} color="white" />
            </View>
            <Text className="text-2xl font-bold text-gray-900">{profileData.name}</Text>
            <Text className="text-gray-600">{profileData.email}</Text>
          </View>
        </Card>

        <Card className="mb-4 shadow-md border border-gray-200">
          <Text className="text-xl font-bold text-gray-900 mb-4">Settings</Text>
          <TouchableOpacity 
            className="py-3 border-b border-gray-200 flex-row items-center justify-between"
            onPress={handleEditProfile}
          >
            <Text className="text-gray-700 font-medium">Edit Profile</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
          <TouchableOpacity className="py-3 border-b border-gray-200 flex-row items-center justify-between">
            <Text className="text-gray-700 font-medium">Dietary Preferences</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
          <TouchableOpacity className="py-3 border-b border-gray-200 flex-row items-center justify-between">
            <Text className="text-gray-700 font-medium">Fitness Goals</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
          <TouchableOpacity className="py-3 flex-row items-center justify-between">
            <Text className="text-gray-700 font-medium">Notifications</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </Card>

        <Button
          title="Sign Out"
          onPress={() => router.push('/login')}
          variant="outline"
        />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl shadow-2xl" style={{ maxHeight: '90%' }}>
            {/* Handle bar */}
            <View className="items-center pt-3 pb-2">
              <View className="w-12 h-1 bg-gray-300 rounded-full" />
            </View>

            {/* Header */}
            <View className="px-6 pt-4 pb-6 border-b border-gray-100">
              <View className="flex-row items-center justify-between">
                <Text className="text-2xl font-bold text-gray-900">Edit Profile</Text>
                <TouchableOpacity
                  onPress={() => setShowEditModal(false)}
                  className="w-8 h-8 items-center justify-center"
                >
                  <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView className="px-6 py-6" showsVerticalScrollIndicator={false}>
              <FormField
                label="Full Name"
                value={editData.name}
                onChangeText={(text) => setEditData({ ...editData, name: text })}
                placeholder="Enter your name"
              />

              <FormField
                label="Email"
                value={editData.email}
                onChangeText={(text) => setEditData({ ...editData, email: text })}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <FormField
                label="Dietary Preferences"
                value={editData.dietaryPreferences}
                onChangeText={(text) => setEditData({ ...editData, dietaryPreferences: text })}
                placeholder="Enter dietary preferences"
              />

              <FormField
                label="Fitness Goals"
                value={editData.fitnessGoals}
                onChangeText={(text) => setEditData({ ...editData, fitnessGoals: text })}
                placeholder="Enter fitness goals"
              />

              <Button
                title="Save Changes"
                onPress={handleSave}
                className="mt-6 mb-6"
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Success Toast */}
      {showSuccess && (
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-50, 0]
            })}],
          }}
          className="absolute top-16 left-6 right-6 bg-green-500 rounded-xl p-4 flex-row items-center shadow-lg z-50"
        >
          <View className="w-8 h-8 bg-white rounded-full items-center justify-center mr-3">
            <Ionicons name="checkmark" size={20} color="#15803d" />
          </View>
          <Text className="text-white font-semibold flex-1">Profile updated successfully!</Text>
        </Animated.View>
      )}

      <BottomNavigation />
    </SafeAreaView>
  );
}
