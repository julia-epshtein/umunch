import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { FormField } from '../molecules/FormField';
import { DatePicker } from '../atoms/DatePicker';
import { RadioButton } from '../atoms/RadioButton';
import { Button } from '../atoms/Button';

interface UserInfoFormData {
  dateOfBirth: Date | null;
  height: string;
  weight: string;
  gender: string;
}

export const UserInfoForm: React.FC<{ onNext: (data: UserInfoFormData) => void }> = ({ onNext }) => {
  const [formData, setFormData] = useState<UserInfoFormData>({
    dateOfBirth: null,
    height: '',
    weight: '',
    gender: '',
  });

  const handleNext = () => {
    if (formData.dateOfBirth && formData.height && formData.weight && formData.gender) {
      onNext(formData);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView className="flex-1 bg-pink-50" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-12 pb-8">
          <Text className="text-4xl font-bold text-gray-900 mb-2">
            Tell us about yourself
          </Text>
          <Text className="text-lg text-gray-600 mb-8">
            We'll use this to personalize your experience
          </Text>

          <View className="mb-4">
            <Text className="text-gray-700 font-medium text-base mb-2">Date of Birth *</Text>
            <DatePicker
              value={formData.dateOfBirth}
              onChange={(date) => setFormData({ ...formData, dateOfBirth: date })}
              placeholder="Select your date of birth"
            />
          </View>

          <FormField
            label="Height"
            value={formData.height}
            onChangeText={(text) => setFormData({ ...formData, height: text })}
            placeholder="e.g., 5'10&quot; or 178 cm"
            required
            keyboardType="default"
          />

          <FormField
            label="Weight"
            value={formData.weight}
            onChangeText={(text) => setFormData({ ...formData, weight: text })}
            placeholder="e.g., 150 lbs or 68 kg"
            required
            keyboardType="numeric"
          />

          <View className="mb-6">
            <Text className="text-gray-700 font-medium text-base mb-2">Gender *</Text>
            <RadioButton
              label="Male"
              selected={formData.gender === 'male'}
              onPress={() => setFormData({ ...formData, gender: 'male' })}
            />
            <RadioButton
              label="Female"
              selected={formData.gender === 'female'}
              onPress={() => setFormData({ ...formData, gender: 'female' })}
            />
            <RadioButton
              label="Other"
              selected={formData.gender === 'other'}
              onPress={() => setFormData({ ...formData, gender: 'other' })}
            />
          </View>

          <Button
            title="Next"
            onPress={handleNext}
            disabled={!formData.dateOfBirth || !formData.height || !formData.weight || !formData.gender}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

