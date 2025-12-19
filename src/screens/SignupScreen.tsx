import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../services/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";

type SignupScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Signup"
>;

export default function SignupScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [displayNameError, setDisplayNameError] = useState("");
  const navigation = useNavigation<SignupScreenNavigationProp>();

  function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function getErrorMessage(errorCode: string): string {
    const errorMessages: Record<string, string> = {
      "auth/email-already-in-use": "This email is already registered",
      "auth/invalid-email": "Invalid email address",
      "auth/weak-password": "Password is too weak. Use at least 6 characters",
      "auth/network-request-failed":
        "Network error. Please check your connection",
      "auth/too-many-requests": "Too many attempts. Please try again later",
    };
    return errorMessages[errorCode] || "Signup failed. Please try again";
  }

  async function handleSignup() {
    setEmailError("");
    setPasswordError("");
    setDisplayNameError("");

    if (!displayName.trim()) {
      setDisplayNameError("Display name is required");
      return;
    }

    if (displayName.trim().length < 2) {
      setDisplayNameError("Display name must be at least 2 characters");
      return;
    }

    if (!email.trim()) {
      setEmailError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email");
      return;
    }

    if (!password) {
      setPasswordError("Password is required");
      return;
    }

    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    try {
      // Create the user account with email and password
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      // Update the user's display name in Firebase Auth
      await updateProfile(cred.user, { displayName });

      // Save user data to Firestore 'users' collection for chat functionality
      // This allows other users to see your name when starting a chat
      await setDoc(doc(db, "users", cred.user.uid), {
        displayName: displayName,
        email: email,
        photoURL: cred.user.photoURL || null,
        createdAt: new Date(),
      });

      // Navigation happens automatically via auth state change in App.tsx
    } catch (err: any) {
      const errorCode = err?.code || "";
      const errorMessage = getErrorMessage(errorCode);

      if (
        errorCode === "auth/email-already-in-use" ||
        errorCode === "auth/invalid-email"
      ) {
        setEmailError(errorMessage);
      } else if (errorCode === "auth/weak-password") {
        setPasswordError(errorMessage);
      } else {
        Alert.alert("Signup Error", errorMessage);
      }
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 justify-center px-6 py-10">
            <View className="items-center mb-8">
              <Text className="text-3xl font-bold text-gray-900 mb-2">
                Create Account
              </Text>
              <Text className="text-gray-500 text-center text-sm">
                Connect us and start sharing your moments!
              </Text>
            </View>

            <View className="mb-6">
              <View>
                <TextInput
                  className={`border rounded-xl px-4 py-3.5 mb-1 bg-gray-50 text-gray-900 text-base ${
                    displayNameError ? "border-red-500" : "border-gray-200"
                  }`}
                  placeholder="Display Name"
                  placeholderTextColor="#9ca3af"
                  value={displayName}
                  onChangeText={(text) => {
                    setDisplayName(text);
                    setDisplayNameError("");
                  }}
                />
                {displayNameError ? (
                  <Text className="text-red-500 text-sm mb-3 px-1">
                    {displayNameError}
                  </Text>
                ) : null}
              </View>

              <View>
                <TextInput
                  className={`border rounded-xl px-4 py-3.5 mb-1 bg-gray-50 text-gray-900 text-base ${
                    emailError ? "border-red-500" : "border-gray-200"
                  }`}
                  placeholder="Email"
                  placeholderTextColor="#9ca3af"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setEmailError("");
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {emailError ? (
                  <Text className="text-red-500 text-sm mb-3 px-1">
                    {emailError}
                  </Text>
                ) : null}
              </View>

              <View>
                <TextInput
                  className={`border rounded-xl px-4 py-3.5 mb-1 bg-gray-50 text-gray-900 text-base ${
                    passwordError ? "border-red-500" : "border-gray-200"
                  }`}
                  placeholder="Password"
                  placeholderTextColor="#9ca3af"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setPasswordError("");
                  }}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {passwordError ? (
                  <Text className="text-red-500 text-sm mb-3 px-1">
                    {passwordError}
                  </Text>
                ) : null}
              </View>

              <TouchableOpacity
                className="bg-black rounded-xl py-4 mb-6"
                onPress={handleSignup}
                activeOpacity={0.8}
              >
                <Text className="text-white text-center font-bold text-base">
                  Sign Up Here
                </Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center justify-center flex-wrap">
              <Text className="text-gray-600 text-base">
                Already have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text className="text-black font-bold text-base">Log In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
