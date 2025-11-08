import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Modal, TouchableOpacity, TextInput } from 'react-native';
import { FormField } from '../molecules/FormField';
import { DatePicker } from '../atoms/DatePicker';
import { ProgressBar } from '../molecules/ProgressBar';
import { Button } from '../atoms/Button';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface UserInfoFormData {
  dateOfBirth: Date | null;
  heightFeet: number;
  heightInches: number;
  weight: string;
  gender: string;
  otherGender?: string;
}

interface UserInfoFormProps {
  onNext: (data: UserInfoFormData) => void;
  currentStep?: number;
  totalSteps?: number;
  onSkip?: () => void;
}

const genderOptions = [
  { id: 'male', label: 'Male', color: '#3b82f6', bgColor: '#eff6ff' },
  { id: 'female', label: 'Female', color: '#ec4899', bgColor: '#fdf2f8' },
  { id: 'non-binary', label: 'Non-binary', color: '#8b5cf6', bgColor: '#f5f3ff' },
  { id: 'prefer-not-to-say', label: 'Prefer not to say', color: '#6b7280', bgColor: '#f3f4f6' },
  { id: 'other', label: 'Other', color: '#14b8a6', bgColor: '#f0fdfa' },
];

export const UserInfoForm: React.FC<UserInfoFormProps> = ({ 
  onNext, 
  currentStep = 1, 
  totalSteps = 5,
  onSkip
}) => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<UserInfoFormData>({
    dateOfBirth: null,
    heightFeet: 5,
    heightInches: 10,
    weight: '',
    gender: '',
    otherGender: '',
  });
  const [showHeightPicker, setShowHeightPicker] = useState(false);
  const internalSteps = 4;

  const handleNext = () => {
    if (step < internalSteps) {
      setStep(step + 1);
    } else {
      // All steps complete, proceed
      if (formData.dateOfBirth && formData.weight && formData.gender) {
        onNext(formData);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.back();
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.dateOfBirth !== null;
      case 2:
        return formData.heightFeet > 0 && formData.heightInches >= 0;
      case 3:
        return formData.weight.trim() !== '';
      case 4:
        return formData.gender !== '' && (formData.gender !== 'other' || formData.otherGender?.trim() !== '');
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <View>
            <Text className="text-2xl font-bold text-gray-900 mb-2">
              What's your date of birth?
            </Text>
            <Text className="text-base text-gray-600 mb-6">
              We use this to calculate your nutritional needs
            </Text>
            <DatePicker
              value={formData.dateOfBirth}
              onChange={(date) => setFormData({ ...formData, dateOfBirth: date })}
              placeholder="Select your date of birth"
            />
          </View>
        );

      case 2:
        return (
          <View>
            <Text className="text-2xl font-bold text-gray-900 mb-2">
              What's your height?
            </Text>
            <Text className="text-base text-gray-600 mb-6">
              This helps us personalize your experience
            </Text>
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => setShowHeightPicker(true)}
                className="flex-1 bg-gray-50 border border-gray-300 rounded-xl px-4 py-4 mr-2"
              >
                <Text className="text-base text-gray-900">
                  {formData.heightFeet}' {formData.heightInches}"
                </Text>
              </TouchableOpacity>
              <View className="flex-row">
                <View className="px-3 py-4 bg-gray-100 rounded-xl mr-1">
                  <Text className="text-sm font-medium text-gray-700">ft</Text>
                </View>
                <View className="px-3 py-4 bg-gray-100 rounded-xl">
                  <Text className="text-sm font-medium text-gray-700">in</Text>
                </View>
              </View>
            </View>
          </View>
        );

      case 3:
        return (
          <View>
            <Text className="text-2xl font-bold text-gray-900 mb-2">
              What's your weight?
            </Text>
            <Text className="text-base text-gray-600 mb-6">
              Enter your current weight
            </Text>
            <View className="flex-row items-center">
              <View className="flex-1 mr-2">
                <TextInput
                  value={formData.weight}
                  onChangeText={(text) => setFormData({ ...formData, weight: text })}
                  placeholder="e.g., 150"
                  keyboardType="numeric"
                  className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-4 text-gray-900"
                />
              </View>
              <View className="px-4 py-4 bg-gray-100 rounded-xl">
                <Text className="text-sm font-medium text-gray-700">lb</Text>
              </View>
            </View>
          </View>
        );

      case 4:
        return (
          <View>
            <Text className="text-2xl font-bold text-gray-900 mb-2">
              What's your gender?
            </Text>
            <Text className="text-base text-gray-600 mb-6">
              This helps us calculate your calorie needs
            </Text>
            <View className="mb-6">
              {genderOptions.map((option) => {
                const isSelected = formData.gender === option.id;
                // Use consistent styling for all options (matching "Other" style)
                return (
                  <TouchableOpacity
                    key={option.id}
                    onPress={() => setFormData({ ...formData, gender: option.id })}
                    className="mb-3 p-4 rounded-2xl border-2"
                    style={{
                      borderColor: isSelected ? option.color : '#e5e7eb',
                      backgroundColor: isSelected ? option.bgColor : 'white',
                      borderWidth: isSelected ? 3 : 2,
                    }}
                  >
                    <Text className="text-base font-semibold text-gray-900">
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              
              {/* Other Gender Text Input */}
              {formData.gender === 'other' && (
                <View className="mt-3">
                  <TextInput
                    value={formData.otherGender}
                    onChangeText={(text) => setFormData({ ...formData, otherGender: text })}
                    placeholder="Please specify"
                    className="bg-gray-50 border-2 border-gray-300 rounded-xl px-4 py-4 text-gray-900"
                  />
                </View>
              )}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-8 pb-32">
          {renderStepContent()}
        </View>
      </ScrollView>

      {/* Navigation buttons at bottom - Only Back and Continue */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4">
        <View className="flex-row justify-between items-center">
          <TouchableOpacity
            onPress={handleBack}
            className="px-6 py-3 bg-gray-100 rounded-xl"
          >
            <Text className="text-gray-700 font-semibold text-base">Back</Text>
          </TouchableOpacity>
          
          <Button
            title={step === internalSteps ? 'Continue' : 'Continue'}
            onPress={handleNext}
            disabled={!canProceed()}
            className="flex-1 ml-4"
          />
        </View>
      </View>

      {/* Height Picker Modal - iOS Style Scroll Wheel */}
      <Modal
        visible={showHeightPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowHeightPicker(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-900">Select Height</Text>
              <TouchableOpacity onPress={() => setShowHeightPicker(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <View className="flex-row justify-center items-center py-8">
              {/* Feet Picker */}
              <View className="flex-1 items-center">
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  className="h-32"
                  contentContainerStyle={{ alignItems: 'center' }}
                >
                  {Array.from({ length: 8 }, (_, i) => i + 3).map((feet) => (
                    <TouchableOpacity
                      key={feet}
                      onPress={() => setFormData({ ...formData, heightFeet: feet })}
                      className={`py-2 px-4 rounded-lg mb-1 ${
                        formData.heightFeet === feet ? 'bg-teal-100' : ''
                      }`}
                    >
                      <Text
                        className={`text-2xl font-semibold ${
                          formData.heightFeet === feet ? 'text-teal-700' : 'text-gray-400'
                        }`}
                      >
                        {feet}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Inches Picker */}
              <View className="flex-1 items-center">
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  className="h-32"
                  contentContainerStyle={{ alignItems: 'center' }}
                >
                  {Array.from({ length: 12 }, (_, i) => i).map((inches) => (
                    <TouchableOpacity
                      key={inches}
                      onPress={() => setFormData({ ...formData, heightInches: inches })}
                      className={`py-2 px-4 rounded-lg mb-1 ${
                        formData.heightInches === inches ? 'bg-teal-100' : ''
                      }`}
                    >
                      <Text
                        className={`text-2xl font-semibold ${
                          formData.heightInches === inches ? 'text-teal-700' : 'text-gray-400'
                        }`}
                      >
                        {inches}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => setShowHeightPicker(false)}
              className="bg-teal-500 py-4 rounded-xl mt-4"
            >
              <Text className="text-white font-semibold text-center text-lg">Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};
