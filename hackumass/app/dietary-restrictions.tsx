import { SafeAreaView, View } from 'react-native';
import { DietaryRestrictionsForm } from '../components/organisms/DietaryRestrictionsForm';
import { ProgressBar } from '../components/molecules/ProgressBar';
import { useRouter } from 'expo-router';

export default function DietaryRestrictionsPage() {
  const router = useRouter();

  const handleNext = (data: { dietaryRestrictions: string[]; allergies: string[]; otherAllergy?: string }) => {
    // Store data (in production, use context or state management)
    console.log('Dietary data:', data);
    router.push('/goals');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ProgressBar currentStep={2} totalSteps={5} />
      <DietaryRestrictionsForm onNext={handleNext} />
    </SafeAreaView>
  );
}
