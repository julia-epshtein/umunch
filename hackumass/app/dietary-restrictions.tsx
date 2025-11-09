import { SafeAreaView } from 'react-native';
import { DietaryRestrictionsForm } from '../components/organisms/DietaryRestrictionsForm';
import { ProgressBar } from '../components/molecules/ProgressBar';
import { useRouter } from 'expo-router';
import { UmunchApi } from '../lib/api'; // 👈 NEW import for backend API

export default function DietaryRestrictionsPage() {
  const router = useRouter();

  // ✅ Updated handler: now sends data to FastAPI backend before navigating
  const handleNext = async (data: {
    dietaryRestrictions: string[];
    allergies: string[];
    otherAllergy?: string;
  }) => {
    try {
      // TODO: Replace this with the real user email / ID after login
      const externalUserKey = "test_user_1";

      await UmunchApi.saveDiet({
        external_user_key: externalUserKey,
        dietary_restrictions: data.dietaryRestrictions,
        allergies: data.allergies,
      });

      router.push('/goals');
    } catch (error) {
      console.error("❌ Failed to save diet info:", error);
      // Later you can add UI feedback here (toast, alert, etc.)
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ProgressBar currentStep={2} totalSteps={5} />
      <DietaryRestrictionsForm onNext={handleNext} />
    </SafeAreaView>
  );
}
