import { SafeAreaView } from 'react-native';
import { GoalsSetup } from '../components/organisms/GoalsSetup';
import { useRouter } from 'expo-router';

export default function GoalsPage() {
  const router = useRouter();

  const handleNext = (selectedGoals: string[]) => {
    router.push('/activity-level');
  };

  return (
    <SafeAreaView className="flex-1">
      <GoalsSetup onNext={handleNext} />
    </SafeAreaView>
  );
}

