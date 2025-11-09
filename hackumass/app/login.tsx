import { SafeAreaView, View, Text, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { FormField } from '../components/molecules/FormField';
import { Button } from '../components/atoms/Button';
import { LinkText } from '../components/molecules/LinkText';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { setCurrentUser } from '../lib/userStorage';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    
    // Simulate login and save user info
    setTimeout(() => {
      // Save the logged-in user's email and name
      // In production, this would come from your auth API
      const userName = email === 'roman.pisani@example.com' 
        ? 'Roman Pisani' 
        : email === 'tgray@gmail.com'
        ? 'Tiffany Gray'
        : 'User'; // Default name
      
      setCurrentUser(email, userName);
      
      setLoading(false);
      router.push('/dashboard');
    }, 1500);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-6 pt-12 pb-8">
            {/* Brand Title - Largest and Most Prominent */}
            <View className="items-center mb-16 mt-8">
              <Ionicons name="restaurant" size={60} color="#14b8a6" />
              <Text className="text-6xl font-bold text-gray-900 mb-2 mt-4">UMunch</Text>
            </View>

            <Text className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back
            </Text>
            <Text className="text-lg text-gray-600 mb-8">
              Sign in to continue your fitness journey
            </Text>

            <FormField
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="john.doe@example.com"
              required
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <FormField
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              required
              secureTextEntry
              autoCapitalize="none"
            />

            <View className="mb-6">
              <TouchableOpacity onPress={() => {/* Handle forgot password */}}>
                <Text className="text-teal-600 font-semibold text-base">
                  Forgot password?
                </Text>
              </TouchableOpacity>
            </View>

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              className="mb-6"
            />

            <LinkText
              preText="Don't have an account?"
              linkText="Sign Up"
              href="/signup"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
