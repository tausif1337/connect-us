import React, { useContext, useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, ActivityIndicator, FlatList, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { CompositeNavigationProp } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { RootStackParamList } from "../types/navigation";
import { AuthContext } from "../contexts/AuthContext";
import { auth, db } from "../services/firebase";
import { doc, getDoc, collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { HomeIcon, UserIcon, SettingsIcon, ChatIcon, GalleryIcon } from "../components/Icons";
import { Post } from "../types/post";
import PostCard from "../components/PostCard";
import { getUserStats } from "../services/userService";
import { isSmallDevice } from "../utils/responsive";

type ProfileScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<RootStackParamList, "Profile">,
  NativeStackNavigationProp<RootStackParamList>
>;

export default function ProfileScreen() {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { user } = useContext(AuthContext);

  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [bio, setBio] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

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

        // Load user stats
        const stats = await getUserStats(user!.uid);
        setFollowersCount(stats.followersCount);
        setFollowingCount(stats.followingCount);
      } catch (e) {
        console.warn("Profile load failed:", e);
        setPhotoURL(user?.photoURL || null);
      }
    }

    loadProfile();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // Subscribe to user's posts only
    const postsRef = collection(db, "posts");
    const q = query(postsRef, where("userId", "==", user.uid));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const userPosts = snapshot.docs.map((doc) => {
          const data = doc.data();
          // Convert comments array
          const comments = (data.comments || []).map((comment: any) => ({
            ...comment,
            createdAt: comment.createdAt?.toDate ? comment.createdAt.toDate() : new Date(comment.createdAt),
          }));
          return {
            id: doc.id,
            userId: data.userId,
            userName: data.userName,
            userAvatar: data.userAvatar,
            imageUrl: data.imageUrl,
            caption: data.caption,
            createdAt: data.createdAt.toDate(),
            likes: data.likes || [],
            comments: comments,
          } as Post;
        });
        // Sort by createdAt descending
        userPosts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        setPosts(userPosts);
        setPostsLoading(false);
      },
      (error) => {
        console.error("Error loading user posts:", error);
        setPostsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  

  async function saveBio() {
    if (!user) return;

    // Saving is handled on EditProfile screen
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top", "bottom"]}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostCard post={item} />}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* Profile Header */}
            <View className={isSmallDevice ? "bg-white px-4 pb-3 pt-2" : "bg-white px-6 pb-4 pt-3"}>
              {/* Profile Photo and Name */}
              <View className="items-center mb-4">
                {photoURL ? (
                  <View className="relative">
                    <Image
                      source={{ uri: photoURL }}
                      className={isSmallDevice ? "w-20 h-20 rounded-full border-4 border-white shadow-lg" : "w-24 h-24 rounded-full border-4 border-white shadow-lg"}
                    />
                    <View className={isSmallDevice ? "absolute bottom-0 right-0 w-6 h-6 bg-black rounded-full items-center justify-center border-2 border-white" : "absolute bottom-0 right-0 w-7 h-7 bg-black rounded-full items-center justify-center border-2 border-white"}>
                      <Text className={isSmallDevice ? "text-white text-xs font-bold" : "text-white text-xs font-bold"}>✓</Text>
                    </View>
                  </View>
                ) : (
                  <View className={isSmallDevice ? "w-20 h-20 rounded-full bg-gray-100 border-4 border-white shadow-lg items-center justify-center" : "w-24 h-24 rounded-full bg-gray-100 border-4 border-white shadow-lg items-center justify-center"}>
                    <Text className={isSmallDevice ? "text-gray-400 text-2xl font-bold" : "text-gray-400 text-3xl font-bold"}>
                      {user?.displayName?.charAt(0).toUpperCase() || "U"}
                    </Text>
                  </View>
                )}

                {user?.displayName && (
                  <Text className={isSmallDevice ? "text-gray-900 font-bold text-lg mt-2" : "text-gray-900 font-bold text-xl mt-3"}>
                    {user.displayName}
                  </Text>
                )}
                {user?.email && (
                  <Text className={isSmallDevice ? "text-gray-500 text-xs mt-0.5" : "text-gray-500 text-sm mt-0.5"}>
                    {user.email}
                  </Text>
                )}
              </View>

              {/* Stats Row */}
              <View className={isSmallDevice ? "flex-row justify-around mb-3 py-2 bg-gray-50 rounded-lg" : "flex-row justify-around mb-4 py-3 bg-gray-50 rounded-xl"}>
                <View className="items-center">
                  <Text className={isSmallDevice ? "text-gray-900 font-bold text-base" : "text-gray-900 font-bold text-lg"}>
                    {posts.length}
                  </Text>
                  <Text className={isSmallDevice ? "text-gray-500 text-xs mt-0.5" : "text-gray-500 text-xs mt-0.5"}>Posts</Text>
                </View>
                <View className="w-px bg-gray-200" />
                <View className="items-center">
                  <Text className={isSmallDevice ? "text-gray-900 font-bold text-base" : "text-gray-900 font-bold text-lg"}>{followersCount}</Text>
                  <Text className={isSmallDevice ? "text-gray-500 text-xs mt-0.5" : "text-gray-500 text-xs mt-0.5"}>Followers</Text>
                </View>
                <View className="w-px bg-gray-200" />
                <View className="items-center">
                  <Text className={isSmallDevice ? "text-gray-900 font-bold text-base" : "text-gray-900 font-bold text-lg"}>{followingCount}</Text>
                  <Text className={isSmallDevice ? "text-gray-500 text-xs mt-0.5" : "text-gray-500 text-xs mt-0.5"}>Following</Text>
                </View>
              </View>

              {/* Bio Section */}
              {bio ? (
                <View className="mb-3">
                  <Text className={isSmallDevice ? "text-gray-700 text-sm leading-4" : "text-gray-700 text-base leading-5"}>
                    {bio}
                  </Text>
                </View>
              ) : null}

              {/* Edit Profile Button */}
              <TouchableOpacity
                onPress={() => navigation.navigate("EditProfile")}
                className={isSmallDevice ? "bg-black rounded-lg py-2.5" : "bg-black rounded-xl py-3"}
                activeOpacity={0.8}
              >
                <Text className={isSmallDevice ? "text-white font-bold text-sm text-center" : "text-white font-medium text-base text-center"}>
                  Edit Profile
                </Text>
              </TouchableOpacity>
            </View>

            {/* Posts Section Header */}
            <View className={isSmallDevice ? "px-3 pt-3 pb-2 bg-gray-50" : "px-4 pt-4 pb-3 bg-gray-50"}>
              <View className="flex-row items-center justify-between">
                <Text className={isSmallDevice ? "text-base font-bold text-gray-900" : "text-lg font-bold text-gray-900"}>
                  My Posts
                </Text>
                <View className={isSmallDevice ? "bg-gray-200 rounded-full px-2 py-0.5" : "bg-gray-200 rounded-full px-2.5 py-0.5"}>
                  <Text className={isSmallDevice ? "text-gray-700 font-semibold text-xs" : "text-gray-700 font-semibold text-xs"}>
                    {posts.length}
                  </Text>
                </View>
              </View>
            </View>

            {/* Posts Grid Spacer */}
            <View className={isSmallDevice ? "px-3 bg-gray-50" : "px-4 bg-gray-50"} />
          </View>
        }
        ListEmptyComponent={
          !postsLoading ? (
            <View className="flex-1 items-center justify-center py-16 px-4 bg-gray-50">
              <View className="bg-white rounded-2xl p-8 items-center shadow-sm">
                <View className="mb-4">
                  <GalleryIcon size={64} color="#9CA3AF" />
                </View>
                <Text className="text-gray-900 font-bold text-lg mb-2">
                  No posts yet
                </Text>
                <Text className="text-gray-500 text-center mb-6">
                  Share your first moment with the world!
                </Text>
                <TouchableOpacity
                  className="bg-black rounded-xl px-8 py-3"
                  onPress={() => navigation.navigate("CreatePost")}
                  activeOpacity={0.8}
                >
                  <Text className="text-white font-bold">Create Post</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null
        }
        ListFooterComponent={
          postsLoading ? (
            <View className="py-8 items-center bg-gray-50">
              <ActivityIndicator size="large" color="#000" />
              <Text className="text-gray-500 mt-3">Loading posts...</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
