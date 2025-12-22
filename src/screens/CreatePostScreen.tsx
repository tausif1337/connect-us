import React, { useState, useContext, useLayoutEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { CompositeNavigationProp } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { RootStackParamList } from "../types/navigation";
import * as ImagePicker from "expo-image-picker";
import { AuthContext } from "../contexts/AuthContext";
import {
  uploadPostImageToCloudinary,
  createPost,
} from "../services/postService";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { CameraIcon } from "../components/Icons";
import { showErrorToast, showSuccessToast } from "../utils/toastHelper";
import { isSmallDevice } from "../utils/responsive";

export default function CreatePostScreen() {
  const navigation =
    useNavigation<CompositeNavigationProp<
      BottomTabNavigationProp<RootStackParamList>,
      NativeStackNavigationProp<RootStackParamList>
    >>();
  const { user } = useContext(AuthContext);
  const [image, setImage] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      showErrorToast("We need camera roll permissions to upload images.");
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
      showErrorToast("Please select an image");
      return;
    }

    if (!user) {
      showErrorToast("You must be logged in to create a post");
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

      showSuccessToast("Post created successfully!");
      navigation.navigate("Main");

      // Reset form
      setImage(null);
      setCaption("");
    } catch (error) {
      console.error("Error creating post:", error);
      showErrorToast("Failed to create post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Create Post",
      headerRight: () => (
        <TouchableOpacity onPress={handleCreatePost} disabled={loading || !image}>
          <Text
            className={`text-base font-semibold ${loading || !image ? "text-gray-400" : "text-blue-600"}`}
          >
            {loading ? "Posting..." : "Post"}
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, loading, image, caption]);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      {/* Native header used */}

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className={isSmallDevice ? "p-3" : "p-4"}>
          {/* Image Picker */}
          <TouchableOpacity
            onPress={pickImage}
            disabled={loading}
            activeOpacity={0.8}
            className={isSmallDevice ? "w-full aspect-square bg-gray-100 rounded-lg items-center justify-center mb-3 overflow-hidden" : "w-full aspect-square bg-gray-100 rounded-lg items-center justify-center mb-4 overflow-hidden"}
          >
            {image ? (
              <Image
                source={{ uri: image }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="items-center">
                <View className="mb-2">
                  <CameraIcon size={isSmallDevice ? 40 : 48} color="#9CA3AF" />
                </View>
                <Text className={isSmallDevice ? "text-gray-500 font-medium text-sm" : "text-gray-500 font-medium"}>
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
              <Text className={isSmallDevice ? "text-blue-600 font-semibold text-center text-sm" : "text-blue-600 font-semibold text-center"}>
                Change Photo
              </Text>
            </TouchableOpacity>
          )}

          {/* Caption Input */}
          <View className="mb-4">
            <Text className={isSmallDevice ? "text-gray-700 font-semibold mb-2 text-sm" : "text-gray-700 font-semibold mb-2"}>
              Write a caption
            </Text>
            <TextInput
              className={isSmallDevice ? "border border-gray-300 rounded-lg p-2.5 text-sm text-gray-900 min-h-[80px]" : "border border-gray-300 rounded-lg p-3 text-base text-gray-900 min-h-[100px]"}
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
          <View className={isSmallDevice ? "bg-white p-5 rounded-2xl items-center" : "bg-white p-6 rounded-2xl items-center"}>
            <ActivityIndicator size="large" color="#000" />
            <Text className={isSmallDevice ? "text-gray-900 font-semibold mt-2 text-sm" : "text-gray-900 font-semibold mt-3"}>
              Creating post...
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
