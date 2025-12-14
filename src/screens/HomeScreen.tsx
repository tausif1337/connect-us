import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { SafeAreaView } from "react-native-safe-area-context";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import { subscribeToPosts } from "../services/postService";
import { Post } from "../types/post";
import PostCard from "../components/PostCard";

export default function HomeScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  async function handleLogout() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  useEffect(() => {
    const unsubscribe = subscribeToPosts((newPosts) => {
      setPosts(newPosts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top", "bottom"]}>
      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-200 flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-gray-900">Feed</Text>
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            className="bg-black rounded-full px-4 py-2"
            onPress={() => navigation.navigate("CreatePost")}
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-sm">+ New Post</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.8}
            className="p-2"
          >
            <Text className="text-gray-600 font-semibold">Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Posts Feed */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#000" />
          <Text className="text-gray-500 mt-3">Loading posts...</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <PostCard post={item} />}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20">
              <Text className="text-6xl mb-4">📸</Text>
              <Text className="text-gray-900 font-bold text-lg mb-2">
                No posts yet
              </Text>
              <Text className="text-gray-500 text-center mb-6">
                Be the first to share something!
              </Text>
              <TouchableOpacity
                className="bg-black rounded-full px-6 py-3"
                onPress={() => navigation.navigate("CreatePost")}
                activeOpacity={0.8}
              >
                <Text className="text-white font-bold">Create Post</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* Bottom Navigation Bar */}
      <View className="bg-white border-t border-gray-200 px-4 py-3">
        <View className="flex-row items-center justify-around">
          <TouchableOpacity className="items-center" activeOpacity={0.8}>
            <Text className="text-2xl mb-1">🏠</Text>
            <Text className="text-xs font-semibold text-gray-900">Home</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="items-center"
            onPress={() => navigation.navigate("Profile")}
            activeOpacity={0.8}
          >
            <Text className="text-2xl mb-1">👤</Text>
            <Text className="text-xs text-gray-500">Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="items-center"
            onPress={() => navigation.navigate("Settings")}
            activeOpacity={0.8}
          >
            <Text className="text-2xl mb-1">⚙️</Text>
            <Text className="text-xs text-gray-500">Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
