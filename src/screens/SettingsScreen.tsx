import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { AuthContext } from "../contexts/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";

export default function SettingsScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useContext(AuthContext);

  // Settings state
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [emailUpdates, setEmailUpdates] = useState(false);

  async function handleLogout() {
    Alert.alert("Confirm Logout", "Are you sure you want to log out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut(auth);
          } catch (error) {
            console.error("Logout error:", error);
            Alert.alert("Error", "Could not log out. Please try again.");
          }
        },
      },
    ]);
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-6 py-10">
          <TouchableOpacity
            onPress={() => navigation.navigate("Home")}
            className="mb-6"
          >
            <Text className="text-gray-900 font-bold text-base">
              ← Back to Home
            </Text>
          </TouchableOpacity>

          <View className="items-center mb-8">
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              Settings
            </Text>
            <Text className="text-gray-500 text-center text-sm">
              Manage your preferences
            </Text>
          </View>

          {/* Account Section */}
          <View className="mb-8">
            <Text className="text-gray-700 font-semibold mb-3 text-lg">
              Account
            </Text>

            <View className="border border-gray-200 rounded-xl px-4 py-3.5 bg-gray-50 mb-3">
              <Text className="text-sm text-gray-500">Email</Text>
              <Text className="font-semibold text-gray-900">{user?.email}</Text>
            </View>

            <TouchableOpacity
              className="border border-gray-200 bg-gray-50 rounded-xl py-4 mb-3"
              onPress={() => navigation.navigate("Profile")}
              activeOpacity={0.8}
            >
              <Text className="text-gray-900 text-center font-bold text-base">
                Edit Profile
              </Text>
            </TouchableOpacity>
          </View>

          {/* Preferences Section */}
          <View className="mb-8">
            <Text className="text-gray-700 font-semibold mb-3 text-lg">
              Preferences
            </Text>

            <View className="flex-row justify-between items-center border border-gray-200 rounded-xl px-4 py-3.5 bg-gray-50 mb-3">
              <View>
                <Text className="font-semibold text-gray-900">
                  Push Notifications
                </Text>
                <Text className="text-sm text-gray-500">
                  Receive app notifications
                </Text>
              </View>
              <Switch value={notifications} onValueChange={setNotifications} />
            </View>

            <View className="flex-row justify-between items-center border border-gray-200 rounded-xl px-4 py-3.5 bg-gray-50 mb-3">
              <View>
                <Text className="font-semibold text-gray-900">Dark Mode</Text>
                <Text className="text-sm text-gray-500">Enable dark theme</Text>
              </View>
              <Switch value={darkMode} onValueChange={setDarkMode} />
            </View>

            <View className="flex-row justify-between items-center border border-gray-200 rounded-xl px-4 py-3.5 bg-gray-50 mb-3">
              <View>
                <Text className="font-semibold text-gray-900">
                  Email Updates
                </Text>
                <Text className="text-sm text-gray-500">
                  Receive email notifications
                </Text>
              </View>
              <Switch value={emailUpdates} onValueChange={setEmailUpdates} />
            </View>
          </View>

          {/* About Section */}
          <View className="mb-8">
            <Text className="text-gray-700 font-semibold mb-3 text-lg">
              About
            </Text>

            <TouchableOpacity
              className="border border-gray-200 bg-gray-50 rounded-xl py-4 mb-3"
              onPress={() =>
                Alert.alert("Privacy Policy", "Privacy policy content here")
              }
              activeOpacity={0.8}
            >
              <Text className="text-gray-900 text-center font-bold text-base">
                Privacy Policy
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="border border-gray-200 bg-gray-50 rounded-xl py-4 mb-3"
              onPress={() =>
                Alert.alert("Terms of Service", "Terms of service content here")
              }
              activeOpacity={0.8}
            >
              <Text className="text-gray-900 text-center font-bold text-base">
                Terms of Service
              </Text>
            </TouchableOpacity>

            <View className="border border-gray-200 rounded-xl px-4 py-3.5 bg-gray-50">
              <Text className="text-sm text-gray-500 text-center">
                Version 1.0.0
              </Text>
            </View>
          </View>

          {/* Logout Button */}
          <View className="mb-6">
            <TouchableOpacity
              className="bg-black rounded-xl py-4"
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <Text className="text-white text-center font-bold text-base">
                Log Out
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
