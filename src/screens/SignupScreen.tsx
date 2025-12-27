import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../services/firebase";
import { doc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { showErrorToast, showSuccessToast } from "../utils/toastHelper";
import { isSmallDevice } from "../utils/responsive";
import { GoogleIcon } from "../components/Icons";
import { 
  useAuthRequest, 
  googleConfig, 
  handleGoogleSignIn 
} from "../services/googleAuthService";

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
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigation = useNavigation<SignupScreenNavigationProp>();

  // Initialize Google Sign-In
  const [request, response, promptAsync] = useAuthRequest(googleConfig);

  // Handle Google Sign-In response
  useEffect(() => {
    if (response) {
      handleGoogleAuthResponse();
    }
  }, [response]);

  async function handleGoogleAuthResponse() {
    if (!response) return;

    setIsGoogleLoading(true);
    const result = await handleGoogleSignIn(response);
    setIsGoogleLoading(false);

    if (result.success) {
      showSuccessToast("Successfully signed up with Google!");
    } else if (result.error) {
      showErrorToast(result.error);
    }
  }

  async function onGoogleSignIn() {
    try {
      setIsGoogleLoading(true);
      await promptAsync();
    } catch (error) {
      setIsGoogleLoading(false);
      showErrorToast("Failed to initiate Google Sign-In");
    }
  }

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

    // Check if display name is already taken
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("displayName", "==", displayName.trim()));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setDisplayNameError("This username is already taken. Please choose another one.");
        return;
      }
    } catch (err) {
      console.error("Error checking username uniqueness:", err);
      // Continue with signup even if we can't verify uniqueness
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
      
      // Show success toast
      showSuccessToast("Account created successfully!");

      // Prepare display name
      const finalDisplayName = displayName.trim() || email.split("@")[0] || email || "User";

      // Save user data to Firestore 'users' collection for chat functionality
      // This allows other users to see your name when starting a chat
      await setDoc(doc(db, "users", cred.user.uid), {
        displayName: finalDisplayName,
        email: email,
        photoURL: cred.user.photoURL || "",
        createdAt: new Date(),
      });

      // Update the user's display name in Firebase Auth
      await updateProfile(cred.user, {
        displayName: finalDisplayName
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
        showErrorToast(errorMessage);
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
          <View className={isSmallDevice ? "flex-1 justify-center px-4 py-8" : "flex-1 justify-center px-6 py-10"}>
            <View className="items-center mb-8">
              <Text className={isSmallDevice ? "text-2xl font-bold text-gray-900 mb-2" : "text-3xl font-bold text-gray-900 mb-2"}>
                Create Account
              </Text>
              <Text className={isSmallDevice ? "text-gray-500 text-center text-xs" : "text-gray-500 text-center text-sm"}>
                Connect us and start sharing your moments!
              </Text>
            </View>

            <View className="mb-6">
              <View>
                <TextInput
                  className={`border rounded-xl px-4 py-3.5 mb-1 bg-gray-50 text-gray-900 text-base ${displayNameError ? "border-red-500" : "border-gray-200"
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
                  <Text className={isSmallDevice ? "text-red-500 text-xs mb-3 px-1" : "text-red-500 text-sm mb-3 px-1"}>
                    {displayNameError}
                  </Text>
                ) : null}
              </View>

              <View>
                <TextInput
                  className={`border rounded-xl px-4 py-3.5 mb-1 bg-gray-50 text-gray-900 text-base ${emailError ? "border-red-500" : "border-gray-200"
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
                  <Text className={isSmallDevice ? "text-red-500 text-xs mb-3 px-1" : "text-red-500 text-sm mb-3 px-1"}>
                    {emailError}
                  </Text>
                ) : null}
              </View>

              <View>
                <TextInput
                  className={`border rounded-xl px-4 py-3.5 mb-1 bg-gray-50 text-gray-900 text-base ${passwordError ? "border-red-500" : "border-gray-200"
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
                  <Text className={isSmallDevice ? "text-red-500 text-xs mb-3 px-1" : "text-red-500 text-sm mb-3 px-1"}>
                    {passwordError}
                  </Text>
                ) : null}
              </View>

              <TouchableOpacity
                className={isSmallDevice ? "bg-black rounded-xl py-3.5 mb-6" : "bg-black rounded-xl py-4 mb-6"}
                onPress={handleSignup}
                activeOpacity={0.8}
              >
                <Text className={isSmallDevice ? "text-white text-center font-bold text-sm" : "text-white text-center font-bold text-base"}>
                  Sign Up Here
                </Text>
              </TouchableOpacity>

              {/* Divider */}
              <View className="flex-row items-center mb-6">
                <View className="flex-1 h-px bg-gray-300" />
                <Text className={isSmallDevice ? "mx-4 text-gray-500 text-xs" : "mx-4 text-gray-500 text-sm"}>OR</Text>
                <View className="flex-1 h-px bg-gray-300" />
              </View>

              {/* Google Sign-In Button */}
              <TouchableOpacity
                className={isSmallDevice ? "border border-gray-300 rounded-xl py-3.5 mb-6 flex-row items-center justify-center" : "border border-gray-300 rounded-xl py-4 mb-6 flex-row items-center justify-center"}
                onPress={onGoogleSignIn}
                activeOpacity={0.8}
                disabled={!request || isGoogleLoading}
              >
                {isGoogleLoading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <>
                    <GoogleIcon size={isSmallDevice ? 20 : 24} color="#4285F4" />
                    <Text className={isSmallDevice ? "text-gray-900 text-center font-semibold text-sm ml-3" : "text-gray-900 text-center font-semibold text-base ml-3"}>
                      Continue with Google
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center justify-center flex-wrap">
              <Text className={isSmallDevice ? "text-gray-600 text-sm" : "text-gray-600 text-base"}>
                Already have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text className={isSmallDevice ? "text-black font-bold text-sm" : "text-black font-bold text-base"}>Log In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
