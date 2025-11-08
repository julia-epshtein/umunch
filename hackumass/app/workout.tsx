import { SafeAreaView } from 'react-native';
import { BottomNavigation } from '../components/templates/BottomNavigation';
import { WorkoutForm } from '../components/organisms/WorkoutForm';
import { useRouter } from 'expo-router';

export default function WorkoutPage() {
  const router = useRouter();

  const handleSubmit = (workout: { type: string; duration: string }) => {
    // In production, save workout data
    console.log('Workout added:', workout);
    // Navigate back or show success message
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <WorkoutForm onSubmit={handleSubmit} />
      <BottomNavigation />
    </SafeAreaView>
  );
}
