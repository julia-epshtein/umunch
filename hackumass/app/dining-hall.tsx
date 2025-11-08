import { SafeAreaView } from 'react-native';
import { DiningHallSelector } from '../components/organisms/DiningHallSelector';
import { useRouter } from 'expo-router';

export default function DiningHallPage() {
  const router = useRouter();

  const handleNext = (diningHall: string) => {
    // Setup complete, navigate to dashboard
    router.push('/dashboard');
  };

  return (
    <SafeAreaView className="flex-1">
      <DiningHallSelector onNext={handleNext} />
    </SafeAreaView>
  );
}

