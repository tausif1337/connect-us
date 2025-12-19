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
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../services/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Login"
>;

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigation = useNavigation<LoginScreenNavigationProp>();

  function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function getErrorMessage(errorCode: string): string {
    const errorMessages: Record<string, string> = {
      "auth/invalid-credential": "Invalid email or password",
      "auth/user-not-found": "No account found with this email",
      "auth/wrong-password": "Incorrect password",
      "auth/invalid-email": "Invalid email address",
      "auth/too-many-requests": "Too many attempts. Please try again later",
      "auth/network-request-failed":
        "Network error. Please check your connection",
    };
    return errorMessages[errorCode] || "Login failed. Please try again";
  }

  async function handleLogin() {
    setEmailError("");
    setPasswordError("");

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

    try {
      // Sign in the user
      const cred = await signInWithEmailAndPassword(auth, email, password);

      // Check if user data exists in Firestore, if not, create it
      // This is helpful for users who signed up before the chat feature was added
      const userDocRef = doc(db, "users", cred.user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // User data doesn't exist, create it
        await setDoc(userDocRef, {
          displayName:
            cred.user.displayName || cred.user.email?.split("@")[0] || "User",
          email: cred.user.email,
          photoURL: cred.user.photoURL || null,
          createdAt: new Date(),
        });
      }
    } catch (err: any) {
      const errorCode = err?.code || "";
      const errorMessage = getErrorMessage(errorCode);

      if (
        errorCode === "auth/invalid-credential" ||
        errorCode === "auth/user-not-found" ||
        errorCode === "auth/wrong-password"
      ) {
        setPasswordError(errorMessage);
      } else if (errorCode === "auth/invalid-email") {
        setEmailError(errorMessage);
      } else {
        Alert.alert("Login Error", errorMessage);
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
                Welcome Back
              </Text>
              <Text className="text-gray-500 text-center text-sm">
                Sign in to continue
              </Text>
            </View>

            <View className="mb-6">
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
                onPress={handleLogin}
                activeOpacity={0.8}
              >
                <Text className="text-white text-center font-bold text-base">
                  Log In
                </Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center justify-center flex-wrap">
              <Text className="text-gray-600 text-base">
                Don't have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
                <Text className="text-black font-bold text-base">Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
