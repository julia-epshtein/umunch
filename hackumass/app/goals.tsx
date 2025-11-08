import { SafeAreaView, View } from 'react-native';
import { GoalsSetup } from '../components/organisms/GoalsSetup';
import { ProgressBar } from '../components/molecules/ProgressBar';
import { useRouter } from 'expo-router';

export default function GoalsPage() {
  const router = useRouter();

  const handleNext = (selectedGoals: string[]) => {
    router.push('/activity-level');
  };

  return (
    <SafeAreaView className="flex-1">
      <ProgressBar currentStep={3} totalSteps={6} />
      <GoalsSetup onNext={handleNext} />
    </SafeAreaView>
  );
}
