import { SafeAreaView, View } from 'react-native';
import { DiningHallSelector } from '../components/organisms/DiningHallSelector';
import { ProgressBar } from '../components/molecules/ProgressBar';
import { useRouter } from 'expo-router';

export default function DiningHallPage() {
  const router = useRouter();

  const handleNext = (diningHall: string) => {
    // Setup complete, navigate to dashboard
    router.push('/dashboard');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ProgressBar currentStep={5} totalSteps={5} />
      <DiningHallSelector onNext={handleNext} />
    </SafeAreaView>
  );
}
