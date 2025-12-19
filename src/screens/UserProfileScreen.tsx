// This screen displays a public user profile that other users can view
// It shows user information and provides option to start a chat

import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { AuthContext } from "../contexts/AuthContext";
import { db } from "../services/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { BackArrowIcon, ChatIcon } from "../components/Icons";
import { Post } from "../types/post";
import PostCard from "../components/PostCard";
import { getOrCreateChatRoom } from "../services/chatService";

type UserProfileScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "UserProfile"
>;

type Props = NativeStackScreenProps<RootStackParamList, "UserProfile">;

export default function UserProfileScreen({ route }: Props) {
  const navigation = useNavigation<UserProfileScreenNavigationProp>();
  const { userId } = route.params;
  const { user: currentUser } = useContext(AuthContext);

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);

  // Fetch user data
  useEffect(() => {
    async function loadUser() {
      try {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          setUser({
            uid: userDoc.id,
            ...userDoc.data(),
          });
        } else {
          Alert.alert("Error", "User not found");
          navigation.goBack();
        }
      } catch (error) {
        console.error("Error loading user:", error);
        Alert.alert("Error", "Could not load user profile");
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [userId]);

  // Fetch user's posts
  useEffect(() => {
    const postsRef = collection(db, "posts");
    const q = query(postsRef, where("userId", "==", userId));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const userPosts = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            userId: data.userId,
            userName: data.userName,
            userAvatar: data.userAvatar,
            imageUrl: data.imageUrl,
            caption: data.caption,
            createdAt: data.createdAt.toDate(),
            likes: data.likes || [],
            comments: data.comments || 0,
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
  }, [userId]);

  const handleStartChat = async () => {
    if (!currentUser || !user) return;

    try {
      // Create or get the chat room
      const chatRoomId = await getOrCreateChatRoom(
        currentUser.uid,
        user.uid,
        {
          displayName:
            currentUser.displayName || currentUser.email || "Current User",
          email: currentUser.email || "",
          photoURL: currentUser.photoURL || "",
        },
        {
          displayName: user.displayName || user.email || "Unknown User",
          email: user.email || "",
          photoURL: user.photoURL || "",
        }
      );

      // Navigate to the chat screen
      navigation.navigate("Chat", {
        chatRoomId,
        otherUserId: user.uid,
        otherUserName: user.displayName || user.email || "Unknown User",
        otherUserPhoto: user.photoURL,
      });
    } catch (error) {
      console.error("Error starting chat:", error);
      Alert.alert("Error", "Could not start chat");
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#000" />
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-500">User not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostCard post={item} />}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View className="mb-6">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="mb-6 flex-row items-center"
            >
              <View className="mr-2">
                <BackArrowIcon size={20} color="#111827" />
              </View>
              <Text className="text-gray-900 font-bold text-base">Back</Text>
            </TouchableOpacity>

            <View className="items-center mb-8">
              <Text className="text-3xl font-bold text-gray-900 mb-6">
                {user.displayName || user.email}
              </Text>

              <View className="items-center mb-6">
                {user.photoURL ? (
                  <Image
                    source={{ uri: user.photoURL }}
                    className="w-32 h-32 rounded-full"
                  />
                ) : (
                  <View className="w-32 h-32 rounded-full bg-gray-50 border border-gray-200 items-center justify-center">
                    <Text className="text-gray-500 text-4xl font-bold">
                      {(user.displayName || user.email || "U")
                        .charAt(0)
                        .toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>

              {currentUser?.uid !== userId && (
                <TouchableOpacity
                  onPress={handleStartChat}
                  className="flex-row items-center bg-blue-500 rounded-xl px-6 py-3 mb-6"
                  activeOpacity={0.8}
                >
                  <View className="mr-2">
                    <ChatIcon size={20} color="#fff" />
                  </View>
                  <Text className="text-white font-bold text-base">
                    Chat with {user.displayName || user.email}
                  </Text>
                </TouchableOpacity>
              )}

              {user.bio ? (
                <View className="w-full bg-gray-50 rounded-xl p-4 mb-6">
                  <Text className="text-gray-700 text-base">{user.bio}</Text>
                </View>
              ) : null}
            </View>

            <View className="px-4 mt-4 mb-4">
              <Text className="text-2xl font-bold text-gray-900">
                {user.displayName || user.email}'s Posts
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          !postsLoading ? (
            <View className="flex-1 items-center justify-center py-20 px-4">
              <Text className="text-gray-500 text-center text-base">
                No posts yet.
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          postsLoading ? (
            <View className="py-8 items-center">
              <ActivityIndicator size="large" color="#000" />
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
