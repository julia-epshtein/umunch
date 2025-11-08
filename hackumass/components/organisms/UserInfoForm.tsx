import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Modal, TouchableOpacity } from 'react-native';
import { FormField } from '../molecules/FormField';
import { DatePicker } from '../atoms/DatePicker';
import { RadioButton } from '../atoms/RadioButton';
import { ProgressBar } from '../molecules/ProgressBar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface UserInfoFormData {
  dateOfBirth: Date | null;
  heightFeet: number;
  heightInches: number;
  weight: string;
  gender: string;
}

interface UserInfoFormProps {
  onNext: (data: UserInfoFormData) => void;
  currentStep?: number;
  totalSteps?: number;
  onSkip?: () => void;
}

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

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      router.push('/dietary-restrictions');
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
        return formData.gender !== '';
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
            <TouchableOpacity
              onPress={() => setShowHeightPicker(true)}
              className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-4 mb-4"
            >
              <Text className="text-base text-gray-900">
                {formData.heightFeet}' {formData.heightInches}"
              </Text>
            </TouchableOpacity>
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
            <FormField
              label="Weight"
              value={formData.weight}
              onChangeText={(text) => setFormData({ ...formData, weight: text })}
              placeholder="e.g., 150 lbs or 68 kg"
              required
              keyboardType="numeric"
            />
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
        <View className="px-6 pt-8 pb-24">
          {renderStepContent()}
        </View>
      </ScrollView>

      {/* Navigation buttons at bottom */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 flex-row justify-between items-center">
        <TouchableOpacity
          onPress={handleBack}
          className="w-12 h-12 items-center justify-center"
        >
          <Ionicons name="arrow-back" size={24} color={step > 1 ? "#374151" : "#9ca3af"} />
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={handleSkip}
          className="w-12 h-12 items-center justify-center"
        >
          <Text className="text-gray-600 font-medium">Skip</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleNext}
          disabled={!canProceed()}
          className={`w-12 h-12 items-center justify-center rounded-full ${
            canProceed() ? 'bg-teal-500' : 'bg-gray-300'
          }`}
        >
          <Ionicons 
            name="arrow-forward" 
            size={24} 
            color={canProceed() ? "white" : "#9ca3af"} 
          />
        </TouchableOpacity>
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
                <Text className="text-sm text-gray-600 mt-2">ft</Text>
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
                <Text className="text-sm text-gray-600 mt-2">in</Text>
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
