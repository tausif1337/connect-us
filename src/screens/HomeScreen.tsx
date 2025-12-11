import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function HomeScreen() {
  async function handleLogout() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <View className="flex-1 justify-center items-center px-6">
        <Text className="text-2xl font-bold text-gray-900 text-center mb-8">
          Welcome! Brother👋
        </Text>
        
        <TouchableOpacity
          className="bg-red-500 rounded-xl py-4 px-8"
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text className="text-white font-bold text-base">
            Log Out
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}