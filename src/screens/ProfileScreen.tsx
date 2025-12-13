import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { AuthContext } from "../contexts/AuthContext";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import { updateProfile } from "firebase/auth";
import { uploadToCloudinary } from "../uploadImageToCloudinary";

type ProfileScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Profile"
>;

export default function ProfileScreen() {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { user } = useContext(AuthContext);

  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    async function loadProfile() {
      try {
        const snap = await getDoc(doc(db, "users", user!.uid));
        if (snap.exists()) {
          const data = snap.data();
          setPhotoURL(data.photoURL || user?.photoURL || null);
          if (data.bio) setBio(data.bio);
        } else {
          setPhotoURL(user?.photoURL || null);
        }
      } catch (e) {
        console.warn("Profile load failed:", e);
        setPhotoURL(user?.photoURL || null);
      }
    }

    loadProfile();
  }, [user]);

  async function pickImage() {
    if (loading) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Photo access is required.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
    });

    if (result.canceled) return;

    const uri = result.assets[0].uri;
    await uploadImage(uri);
  }

  async function uploadImage(uri: string) {
    if (!user) return;

    setLoading(true);

    try {
      const imageUrl = await uploadToCloudinary(uri);
      setPhotoURL(imageUrl);

      await updateProfile(auth.currentUser!, {
        photoURL: imageUrl,
      });

      Alert.alert("Success", "Profile photo updated.");
    } catch (e) {
      Alert.alert("Upload failed", "Could not upload image.");
    } finally {
      setLoading(false);
    }
  }

  async function saveBio() {
    if (!user) return;

    setLoading(true);
    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          bio: bio.trim(),
          updatedAt: new Date(),
        },
        { merge: true }
      );
      Alert.alert("Saved", "Bio updated successfully.");
    } catch (e) {
      Alert.alert("Error", "Could not save bio.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
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
              <Text className="text-3xl font-bold text-gray-900">
                Your Profile
              </Text>
            </View>

            <View className="items-center mb-8">
              {photoURL ? (
                <Image
                  source={{ uri: photoURL }}
                  className="w-32 h-32 rounded-full"
                />
              ) : (
                <View className="w-32 h-32 rounded-full bg-gray-50 border border-gray-200 items-center justify-center">
                  <Text className="text-gray-500 text-sm">No Photo</Text>
                </View>
              )}

              <TouchableOpacity
                disabled={loading}
                onPress={pickImage}
                className="mt-4 border border-gray-200 bg-gray-50 rounded-xl px-6 py-3"
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#111827" />
                ) : (
                  <Text className="text-gray-900 font-bold text-base">
                    Change Photo
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            <View className="mb-6">
              <View className="mb-4">
                <Text className="text-gray-700 font-semibold mb-2">Bio</Text>
                <TextInput
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Tell others about yourself"
                  placeholderTextColor="#9ca3af"
                  multiline
                  numberOfLines={4}
                  className="border border-gray-200 rounded-xl px-4 py-3.5 bg-gray-50 text-gray-900 text-base"
                  style={{ textAlignVertical: "top", minHeight: 100 }}
                />
              </View>

              <TouchableOpacity
                onPress={saveBio}
                disabled={loading}
                className="bg-black rounded-xl py-4 mb-4"
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white text-center font-bold text-base">
                    Save Bio
                  </Text>
                )}
              </TouchableOpacity>

              <View className="border border-gray-200 rounded-xl px-4 py-3.5 bg-gray-50">
                <Text className="text-sm text-gray-500">Account Email</Text>
                <Text className="font-semibold text-gray-900">
                  {user?.email}
                </Text>
              </View>
            </View>
          </View>
      </ScrollView>
    </SafeAreaView>
  );
}