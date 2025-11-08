import { View, Text, SafeAreaView, TouchableOpacity } from "react-native";
import { Link, Href } from "expo-router";

export default function Index() {
  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 justify-center items-center bg-white px-6">
        <Text className="text-3xl font-bold text-blue-600">
          Welcome to HackUMass! 🚀
        </Text>
        <Text className="text-lg text-gray-600 mt-4 mb-8 text-center">
          NativeWind is working!
        </Text>
        
        <Link href={"/signup" as Href} asChild>
          <TouchableOpacity className="bg-blue-600 py-4 px-8 rounded-xl active:bg-blue-700">
            <Text className="text-white font-semibold text-lg">
              Go to Sign Up
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
}
