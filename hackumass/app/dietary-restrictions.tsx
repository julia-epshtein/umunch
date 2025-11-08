import { SafeAreaView } from 'react-native';
import { DietaryRestrictionsForm } from '../components/organisms/DietaryRestrictionsForm';
import { useRouter } from 'expo-router';

export default function DietaryRestrictionsPage() {
  const router = useRouter();

  const handleNext = (data: any) => {
    router.push('/goals');
  };

  return (
    <SafeAreaView className="flex-1">
      <DietaryRestrictionsForm onNext={handleNext} />
    </SafeAreaView>
  );
}

