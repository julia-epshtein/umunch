import { SafeAreaView } from 'react-native';
import { UserInfoForm } from '../components/organisms/UserInfoForm';
import { useRouter } from 'expo-router';

export default function UserInfoPage() {
  const router = useRouter();

  const handleNext = (data: any) => {
    // Store data (in production, use context or state management)
    router.push('/dietary-restrictions');
  };

  return (
    <SafeAreaView className="flex-1">
      <UserInfoForm onNext={handleNext} currentStep={1} totalSteps={6} />
    </SafeAreaView>
  );
}
