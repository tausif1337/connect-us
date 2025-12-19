// This screen displays a list of all chat conversations for the current user
// It shows recent chats sorted by the most recent message

import React, { useContext, useEffect, useState } from "react";
import {
  View, // Container component
  Text, // Text display component
  FlatList, // Scrollable list component
  TouchableOpacity, // Touchable button component
  Image, // Image display component
  ActivityIndicator, // Loading spinner component
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../contexts/AuthContext";
import {
  subscribeToUserChats,
  getAllUsers,
  getOrCreateChatRoom,
} from "../services/chatService";
import { UserChat } from "../types/chat";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";

// Define the props type for this screen
type Props = NativeStackScreenProps<RootStackParamList, "ChatList">;

// Helper function to get a user's display name
const getUserDisplayName = (userData: {
  displayName?: string;
  email?: string;
}): string => {
  return userData.displayName || userData.email || "Unknown User";
};

const ChatListScreen = ({ navigation }: Props) => {
  // Get the current user from AuthContext
  const { user } = useContext(AuthContext);

  // State to store the list of chats
  const [chats, setChats] = useState<UserChat[]>([]);

  // State to track loading status
  const [loading, setLoading] = useState(true);

  // State to store all available users for starting new chats
  const [allUsers, setAllUsers] = useState<
    Array<{
      uid: string;
      displayName?: string;
      email?: string;
      photoURL?: string;
    }>
  >([]);

  // State to control showing the user list modal
  const [showUserList, setShowUserList] = useState(false);

  // Effect to subscribe to user's chats when component mounts
  useEffect(() => {
    // If no user is logged in, don't do anything
    if (!user) return;

    // Subscribe to the user's chat rooms
    // This will update in real-time whenever chats change
    const unsubscribe = subscribeToUserChats(user.uid, (updatedChats) => {
      setChats(updatedChats); // Update the chats state
      setLoading(false); // Stop showing loading spinner
    });

    // Cleanup function: unsubscribe when component unmounts
    return () => unsubscribe();
  }, [user]);

  // Effect to load all users for starting new chats
  useEffect(() => {
    if (!user) return;

    // Load all users from Firebase
    getAllUsers(user.uid).then((users) => {
      setAllUsers(users);
    });
  }, [user]);

  // Function to handle when a chat is tapped
  const handleChatPress = (chat: UserChat) => {
    // Navigate to the Chat screen with chat details
    navigation.navigate("Chat", {
      chatRoomId: chat.chatRoomId,
      otherUserId: chat.otherUserId,
      otherUserName: chat.otherUserName,
      otherUserPhoto: chat.otherUserPhoto,
    });
  };

  // Function to start a new chat with a user
  const handleStartChat = async (selectedUser: {
    uid: string;
    displayName?: string;
    email?: string;
    photoURL?: string;
  }) => {
    if (!user) return;

    // Close the user list
    setShowUserList(false);

    // Create or get the chat room
    const chatRoomId = await getOrCreateChatRoom(
      user.uid,
      selectedUser.uid,
      {
        displayName: user.displayName || user.email || "Current User",
        email: user.email || "",
        photoURL: user.photoURL || "",
      },
      {
        displayName: getUserDisplayName(selectedUser),
        email: selectedUser.email || "",
        photoURL: selectedUser.photoURL || "",
      }
    );

    // Navigate to the chat screen
    navigation.navigate("Chat", {
      chatRoomId,
      otherUserId: selectedUser.uid,
      otherUserName: getUserDisplayName(selectedUser),
      otherUserPhoto: selectedUser.photoURL,
    });
  };

  // Function to render each chat item in the list
  const renderChatItem = ({ item }: { item: UserChat }) => (
    <TouchableOpacity
      onPress={() => handleChatPress(item)} // Navigate to chat when pressed
      className="flex-row items-center p-4 border-b border-gray-200 bg-white"
    >
      {/* User profile picture or placeholder */}
      <View className="w-12 h-12 rounded-full bg-blue-500 items-center justify-center mr-3">
        {item.otherUserPhoto ? (
          <Image
            source={{ uri: item.otherUserPhoto }}
            className="w-12 h-12 rounded-full"
          />
        ) : (
          <Text className="text-white text-lg font-bold">
            {item.otherUserName.charAt(0).toUpperCase()}
          </Text>
        )}
      </View>

      {/* Chat details */}
      <View className="flex-1">
        {/* Other user's name */}
        <Text className="text-lg font-semibold text-gray-800">
          {item.otherUserName}
        </Text>

        {/* Last message preview */}
        <Text className="text-sm text-gray-500 mt-1" numberOfLines={1}>
          {item.lastMessage || "No messages yet"}
        </Text>
      </View>

      {/* Timestamp of last message */}
      {item.lastMessageTime && (
        <Text className="text-xs text-gray-400">
          {formatTime(item.lastMessageTime)}
        </Text>
      )}
    </TouchableOpacity>
  );

  // Function to render each user in the user list
  const renderUserItem = ({ item }: { item: (typeof allUsers)[0] }) => (
    <TouchableOpacity
      onPress={() => handleStartChat(item)}
      className="flex-row items-center p-4 border-b border-gray-200 bg-white"
    >
      {/* User profile picture or placeholder */}
      <View className="w-12 h-12 rounded-full bg-green-500 items-center justify-center mr-3">
        {item.photoURL ? (
          <Image
            source={{ uri: item.photoURL }}
            className="w-12 h-12 rounded-full"
          />
        ) : (
          <Text className="text-white text-lg font-bold">
            {getUserDisplayName(item).charAt(0).toUpperCase()}
          </Text>
        )}
      </View>

      {/* User details */}
      <View className="flex-1">
        <Text className="text-lg font-semibold text-gray-800">
          {getUserDisplayName(item)}
        </Text>
        {item.email && item.displayName && (
          <Text className="text-sm text-gray-500">{item.email}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  // Function to format time for display
  const formatTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  // Show loading spinner while chats are being loaded
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={["top", "bottom"]}>
        <View className="flex-1 justify-center items-center bg-gray-50">
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top", "bottom"]}>
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="bg-blue-500 pt-12 pb-4 px-4">
          <View className="flex-row justify-between items-center">
            <Text className="text-2xl font-bold text-white">Chats</Text>
            <TouchableOpacity
              onPress={() => setShowUserList(!showUserList)}
              className="bg-white rounded-full px-4 py-2"
            >
              <Text className="text-blue-500 font-semibold">
                {showUserList ? "Hide Users" : "New Chat"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Show user list or chat list based on state */}
        {showUserList ? (
          // User list for starting new chats
          <FlatList
            data={allUsers}
            renderItem={renderUserItem}
            keyExtractor={(item) => item.uid}
            ListEmptyComponent={
              <View className="flex-1 justify-center items-center p-8">
                <Text className="text-gray-500 text-center">
                  No users available
                </Text>
              </View>
            }
          />
        ) : (
          // Chat list
          <FlatList
            data={chats}
            renderItem={renderChatItem}
            keyExtractor={(item) => item.chatRoomId}
            ListEmptyComponent={
              // Show this when there are no chats
              <View className="flex-1 justify-center items-center p-8">
                <Text className="text-gray-500 text-center text-lg">
                  No chats yet
                </Text>
                <Text className="text-gray-400 text-center mt-2">
                  Tap "New Chat" to start a conversation
                </Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default ChatListScreen;
