import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import * as ImagePicker from "expo-image-picker";
import { AuthContext } from "../contexts/AuthContext";
import {
  uploadPostImageToCloudinary,
  createPost,
} from "../services/postService";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";

export default function CreatePostScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useContext(AuthContext);
  const [image, setImage] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "We need camera roll permissions to upload images."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
    }
  };

  const handleCreatePost = async () => {
    if (!image) {
      Alert.alert("Error", "Please select an image");
      return;
    }

    if (!user) {
      Alert.alert("Error", "You must be logged in to create a post");
      return;
    }

    setLoading(true);

    try {
      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();
      const displayName =
        userData?.displayName || user.email?.split("@")[0] || "User";

      // Upload image to Cloudinary
      const imageUrl = await uploadPostImageToCloudinary(image);

      // Create post in Firestore
      await createPost({
        userId: user.uid,
        userName: displayName,
        userAvatar: userData?.photoURL,
        imageUrl,
        caption: caption.trim(),
      });

      Alert.alert("Success", "Post created successfully!", [
        {
          text: "OK",
          onPress: () => navigation.navigate("Home"),
        },
      ]);

      // Reset form
      setImage(null);
      setCaption("");
    } catch (error) {
      console.error("Error creating post:", error);
      Alert.alert("Error", "Failed to create post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text className="text-base font-semibold text-gray-900">Cancel</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900">Create Post</Text>
        <TouchableOpacity
          onPress={handleCreatePost}
          disabled={loading || !image}
        >
          <Text
            className={`text-base font-semibold ${
              loading || !image ? "text-gray-400" : "text-blue-600"
            }`}
          >
            {loading ? "Posting..." : "Post"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4">
          {/* Image Picker */}
          <TouchableOpacity
            onPress={pickImage}
            disabled={loading}
            activeOpacity={0.8}
            className="w-full aspect-square bg-gray-100 rounded-lg items-center justify-center mb-4 overflow-hidden"
          >
            {image ? (
              <Image
                source={{ uri: image }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="items-center">
                <Text className="text-6xl text-gray-400 mb-2">📷</Text>
                <Text className="text-gray-500 font-medium">
                  Tap to select photo
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Change Photo Button */}
          {image && (
            <TouchableOpacity
              onPress={pickImage}
              disabled={loading}
              className="mb-4"
              activeOpacity={0.8}
            >
              <Text className="text-blue-600 font-semibold text-center">
                Change Photo
              </Text>
            </TouchableOpacity>
          )}

          {/* Caption Input */}
          <View className="mb-4">
            <Text className="text-gray-700 font-semibold mb-2">
              Write a caption
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 text-base text-gray-900 min-h-[100px]"
              placeholder="What's on your mind?"
              placeholderTextColor="#9CA3AF"
              value={caption}
              onChangeText={setCaption}
              multiline
              textAlignVertical="top"
              editable={!loading}
            />
          </View>
        </View>
      </ScrollView>

      {/* Loading Overlay */}
      {loading && (
        <View className="absolute inset-0 bg-black/50 items-center justify-center">
          <View className="bg-white p-6 rounded-2xl items-center">
            <ActivityIndicator size="large" color="#000" />
            <Text className="text-gray-900 font-semibold mt-3">
              Creating post...
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
