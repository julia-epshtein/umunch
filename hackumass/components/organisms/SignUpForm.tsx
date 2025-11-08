import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { FormField } from '../molecules/FormField';
import { Button } from '../atoms/Button';
import { LinkText } from '../molecules/LinkText';

interface SignUpFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export const SignUpForm: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<SignUpFormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate full name
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    // Validate confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Sign up successful:', formData);
      setLoading(false);
      // Navigate to user info page
      router.push('/user-info');
    }, 1500);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView 
        className="flex-1 bg-white"
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 pt-12 pb-8">
          {/* Header */}
          <View className="mb-8">
            <Text className="text-4xl font-bold text-gray-900 mb-2">
              Create Account
            </Text>
            <Text className="text-lg text-gray-600">
              Sign up to get started
            </Text>
          </View>

          {/* Form Fields */}
          <View className="mb-6">
            <FormField
              label="Full Name"
              value={formData.fullName}
              onChangeText={(text) => setFormData({ ...formData, fullName: text })}
              placeholder="John Doe"
              required
              error={errors.fullName}
              autoCapitalize="words"
            />

            <FormField
              label="Email"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder="john.doe@example.com"
              required
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <FormField
              label="Password"
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              placeholder="Enter your password"
              required
              error={errors.password}
              secureTextEntry
              autoCapitalize="none"
            />

            <FormField
              label="Confirm Password"
              value={formData.confirmPassword}
              onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
              placeholder="Confirm your password"
              required
              error={errors.confirmPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          {/* Submit Button */}
          <Button
            title="Sign Up"
            onPress={handleSignUp}
            loading={loading}
            className="mb-6"
          />

          {/* Link to Login */}
          <LinkText
            preText="Already have an account?"
            linkText="Log In"
            href="/login"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
