import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Modal, TouchableOpacity } from 'react-native';
import { FormField } from '../molecules/FormField';
import { DatePicker } from '../atoms/DatePicker';
import { RadioButton } from '../atoms/RadioButton';
import { Button } from '../atoms/Button';
import { ProgressBar } from '../molecules/ProgressBar';
import { Ionicons } from '@expo/vector-icons';

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
}

export const UserInfoForm: React.FC<UserInfoFormProps> = ({ 
  onNext, 
  currentStep = 1, 
  totalSteps = 4 
}) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<UserInfoFormData>({
    dateOfBirth: null,
    heightFeet: 5,
    heightInches: 10,
    weight: '',
    gender: '',
  });
  const [showHeightPicker, setShowHeightPicker] = useState(false);

  const handleNext = () => {
    if (step < totalSteps) {
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
      className="flex-1"
    >
      <ProgressBar currentStep={step} totalSteps={totalSteps} />
      <ScrollView className="flex-1 bg-pink-50" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-8 pb-8">
          {renderStepContent()}

          <View className="flex-row gap-3 mt-6">
            {step > 1 && (
              <TouchableOpacity
                onPress={handleBack}
                className="flex-1 bg-gray-200 py-4 px-6 rounded-xl items-center justify-center"
              >
                <Text className="text-gray-700 font-semibold text-lg">Back</Text>
              </TouchableOpacity>
            )}
            <Button
              title={step === totalSteps ? 'Next' : 'Continue'}
              onPress={handleNext}
              disabled={!canProceed()}
              className={step > 1 ? 'flex-1' : 'w-full'}
            />
          </View>
        </View>
      </ScrollView>


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
            <Button
              title="Done"
              onPress={() => setShowHeightPicker(false)}
              className="mt-4"
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};
