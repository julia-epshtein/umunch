import { SafeAreaView, View } from 'react-native';
import { DietaryRestrictionsForm } from '../components/organisms/DietaryRestrictionsForm';
import { ProgressBar } from '../components/molecules/ProgressBar';
import { useRouter } from 'expo-router';

export default function DietaryRestrictionsPage() {
  const router = useRouter();

  const handleNext = (data: any) => {
    router.push('/goals');
  };

  return (
    <SafeAreaView className="flex-1">
      <ProgressBar currentStep={2} totalSteps={6} />
      <DietaryRestrictionsForm onNext={handleNext} />
    </SafeAreaView>
  );
}
