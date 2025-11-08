import { SafeAreaView } from "react-native";
import { SignUpForm } from "../components/organisms/SignUpForm";

export default function SignUpPage() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <SignUpForm />
    </SafeAreaView>
  );
}
