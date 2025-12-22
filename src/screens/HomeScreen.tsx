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
import { CompositeNavigationProp } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { RootStackParamList } from "../types/navigation";
import { SafeAreaView } from "react-native-safe-area-context";

import { subscribeToPosts } from "../services/postService";
import { Post } from "../types/post";
import PostCard from "../components/PostCard";
import {
  HomeIcon,
  UserIcon,
  SettingsIcon,
  GalleryIcon,
  ChatIcon,
} from "../components/Icons";
import { isSmallDevice } from "../utils/responsive";

export default function HomeScreen() {
  const navigation =
    useNavigation<CompositeNavigationProp<
      BottomTabNavigationProp<RootStackParamList>,
      NativeStackNavigationProp<RootStackParamList>
    >>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToPosts((newPosts) => {
      setPosts(newPosts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["bottom"]}>
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
          contentContainerStyle={isSmallDevice ? { padding: 12 } : { padding: 16 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20">
              <View className="mb-4">
                <GalleryIcon size={isSmallDevice ? 48 : 64} color="#9CA3AF" />
              </View>
              <Text className={isSmallDevice ? "text-gray-900 font-bold text-base mb-2" : "text-gray-900 font-bold text-lg mb-2"}>
                No posts yet
              </Text>
              <Text className="text-gray-500 text-center mb-6">
                Be the first to share something!
              </Text>
              <TouchableOpacity
                className={isSmallDevice ? "bg-black rounded-full px-5 py-2.5" : "bg-black rounded-full px-6 py-3"}
                onPress={() => navigation.navigate("CreatePost")}
                activeOpacity={0.8}
              >
                <Text className={isSmallDevice ? "text-white font-bold text-sm" : "text-white font-bold"}>Create Post</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
