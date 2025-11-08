import { SafeAreaView, View } from 'react-native';
import { ActivityLevelSelector } from '../components/organisms/ActivityLevelSelector';
import { ProgressBar } from '../components/molecules/ProgressBar';
import { useRouter } from 'expo-router';

export default function ActivityLevelPage() {
  const router = useRouter();

  const handleNext = (activityLevel: string) => {
    router.push('/dining-hall');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ProgressBar currentStep={4} totalSteps={5} />
      <ActivityLevelSelector onNext={handleNext} />
    </SafeAreaView>
  );
}
