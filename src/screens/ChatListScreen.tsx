// This screen displays a list of all chat conversations for the current user
// It shows recent chats sorted by the most recent message

import React, { useContext, useEffect, useState, useLayoutEffect } from "react";
import {
  View, // Container component for grouping other components
  Text, // Component for displaying text
  FlatList, // Scrollable list component for efficient rendering of large lists
  TouchableOpacity, // Touchable button component that responds to presses
  Image, // Component for displaying images
  ActivityIndicator, // Loading spinner component to show while data is loading
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // Ensures content stays within device safe areas
import { AuthContext } from "../contexts/AuthContext"; // Context for accessing user authentication state
import {
  subscribeToUserChats, // Function to listen for real-time updates to user's chat list
  getAllUsers, // Function to get all users for starting new chats
  getOrCreateChatRoom, // Function to create a new chat room or get existing one
} from "../services/chatService";
import { UserChat } from "../types/chat"; // Type definition for chat room data
import { showErrorToast } from "../utils/toastHelper"; // Utility for showing toast messages

// Helper function to get a user's display name
// Tries multiple sources to find a suitable name to display for a user
const getUserDisplayName = (userData: {
  displayName?: string;
  email?: string;
}): string => {
  // First, try to use the user's display name if it exists and isn't empty
  if (userData.displayName && userData.displayName.trim() !== "") {
    return userData.displayName;
  }
  
  // If no display name, fall back to email address
  if (userData.email) {
    return userData.email;
  }
  
  // If neither display name nor email is available, use a default
  return "Unknown User";
};

// Main component for the chat list screen
const ChatListScreen = ({ navigation }: any) => {
  // Get the current user from AuthContext
  // This gives us access to the logged-in user's information
  const { user } = useContext(AuthContext);

  // State to store the list of chats
  // This will hold all the chat rooms the current user is participating in
  const [chats, setChats] = useState<UserChat[]>([]);

  // State to track loading status
  // Shows a loading spinner while we're fetching initial chat data
  const [loading, setLoading] = useState(true);

  // State to store all available users for starting new chats
  // This holds the list of all users in the app (except the current user)
  const [allUsers, setAllUsers] = useState<
    Array<{
      uid: string;
      displayName?: string;
      email?: string;
      photoURL?: string;
    }>
  >([]);

  // State to control showing the user list modal
  // When true, shows the list of users to start a new chat with
  const [showUserList, setShowUserList] = useState(false);

  // Effect to subscribe to user's chats when component mounts
  // This sets up a real-time listener for changes to the user's chat list
  useEffect(() => {
    // If no user is logged in, don't do anything
    // This prevents errors when user is not authenticated
    if (!user) return;

    // Subscribe to the user's chat rooms
    // This will update in real-time whenever chats change
    // The callback function receives updated chat data
    const unsubscribe = subscribeToUserChats(user.uid, (updatedChats) => {
      setChats(updatedChats); // Update the chats state with fresh data
      setLoading(false); // Stop showing loading spinner once data is loaded
    });

    // Cleanup function: unsubscribe when component unmounts
    // This is important to prevent memory leaks and stop listening
    // when the user navigates away from this screen
    return () => unsubscribe();
  }, [user]); // Re-run effect when user changes

  // Effect to load all users for starting new chats
  // This runs once when the component mounts to get the list of all users
  useEffect(() => {
    // If no user is logged in, don't do anything
    if (!user) return;

    // Load all users from Firebase
    // This gets the list of all users except the current user
    getAllUsers(user.uid).then((users) => {
      setAllUsers(users); // Store the user list in state
    });
  }, [user]); // Re-run effect when user changes

  // Set up navigation header options
  // This customizes the header bar at the top of the screen
  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Chats", // Title shown in the header
      headerRight: () => (
        // Button in the header to toggle between chat list and user list
        <TouchableOpacity
          onPress={() => setShowUserList((s) => !s)} // Toggle showUserList state
          className="bg-black rounded-full px-4 py-2" // Styling for the button
          activeOpacity={0.8} // Make button slightly transparent when pressed
        >
          <Text className="text-white font-semibold">
            {/* Show different text depending on whether user list is visible */}
            {showUserList ? "Hide Users" : "New Chat"}
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, showUserList]); // Re-run when navigation or showUserList changes

  // Function to handle when a chat is tapped
  // Navigates to the Chat screen for the selected conversation
  const handleChatPress = (chat: UserChat) => {
    // Navigate to the Chat screen with chat details
    // Passes the chat room ID and other user's info to the chat screen
    navigation.navigate("Chat", {
      chatRoomId: chat.chatRoomId, // ID of the chat room to open
      otherUserId: chat.otherUserId, // ID of the person we're chatting with
      otherUserName: chat.otherUserName, // Name of the person we're chatting with
      otherUserPhoto: chat.otherUserPhoto, // Photo of the person we're chatting with
    });
  };

  // Function to start a new chat with a user
  // Creates a chat room (or gets existing one) and navigates to it
  const handleStartChat = async (selectedUser: {
    uid: string;
    displayName?: string;
    email?: string;
    photoURL?: string;
  }) => {
    // If no user is logged in, don't do anything
    if (!user) return;

    // Close the user list to return to the chat list view
    setShowUserList(false);

    try {
      // Create or get the chat room between current user and selected user
      // This ensures we don't create duplicate chat rooms
      const chatRoomId = await getOrCreateChatRoom(
        user.uid, // Current user's ID
        selectedUser.uid, // Selected user's ID
        {
          // Current user's info
          displayName: user.displayName || "User",
          email: user.email || "",
          photoURL: user.photoURL || "",
        },
        {
          // Selected user's info
          displayName: getUserDisplayName(selectedUser),
          email: selectedUser.email || "",
          photoURL: selectedUser.photoURL || "",
        }
      );

      // Navigate to the chat screen for this new/existing chat room
      navigation.navigate("Chat", {
        chatRoomId, // ID of the chat room we just created/got
        otherUserId: selectedUser.uid, // ID of the person we're chatting with
        otherUserName: getUserDisplayName(selectedUser), // Name of the person we're chatting with
        otherUserPhoto: selectedUser.photoURL, // Photo of the person we're chatting with
      });
    } catch (error) {
      console.error("Error starting chat:", error);
      showErrorToast("Failed to start chat");
    }
  };

  // Function to render each chat item in the list
  // This defines how each chat room appears in the list
  const renderChatItem = ({ item }: { item: UserChat }) => (
    <TouchableOpacity
      onPress={() => handleChatPress(item)} // Navigate to chat when pressed
      className="flex-row items-center p-4 border-b border-gray-200 bg-white"
    >
      {/* User profile picture or placeholder */}
      <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center mr-3">
        {item.otherUserPhoto ? (
          // Display user's profile photo if available
          <Image
            source={{ uri: item.otherUserPhoto }}
            className="w-12 h-12 rounded-full"
          />
        ) : (
          // Display first letter of user's name as placeholder if no photo
          <Text className="text-gray-900 text-lg font-bold">
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
  // This defines how each user appears in the "New Chat" list
  const renderUserItem = ({ item }: { item: (typeof allUsers)[0] }) => (
    <TouchableOpacity
      onPress={() => handleStartChat(item)} // Start chat when user is pressed
      className="flex-row items-center p-4 border-b border-gray-200 bg-white"
    >
      {/* User profile picture or placeholder */}
      <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center mr-3">
        {item.photoURL ? (
          // Display user's profile photo if available
          <Image
            source={{ uri: item.photoURL }}
            className="w-12 h-12 rounded-full"
          />
        ) : (
          // Display first letter of user's name as placeholder if no photo
          <Text className="text-gray-900 text-lg font-bold">
            {getUserDisplayName(item).charAt(0).toUpperCase()}
          </Text>
        )}
      </View>

      {/* User details */}
      <View className="flex-1">
        <Text className="text-lg font-semibold text-gray-800">
          {getUserDisplayName(item)}
        </Text>
        {/* Show email only if both email and display name exist */}
        {item.email && item.displayName && (
          <Text className="text-sm text-gray-500">{item.email}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  // Function to format time for display
  // Converts a date to a human-readable relative time (e.g., "5m ago")
  const formatTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime(); // Difference in milliseconds
    const minutes = Math.floor(diff / 60000); // Convert to minutes
    const hours = Math.floor(diff / 3600000); // Convert to hours
    const days = Math.floor(diff / 86400000); // Convert to days

    // Show different formats based on how long ago the message was
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString(); // Show date if older than a week
  };

  // Show loading spinner while chats are being loaded
  // This prevents showing an empty list while data is loading
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={["top", "bottom"]}>
        <View className="flex-1 justify-center items-center bg-gray-50">
          {/* Loading spinner to indicate data is being fetched */}
          <ActivityIndicator size="large" color="#000" />
        </View>
      </SafeAreaView>
    );
  }

  // Main screen content
  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top", "bottom"]}>
      <View className="flex-1 bg-gray-50">
        {/* Native header used */}
        {/* Show user list or chat list based on state */}
        {showUserList ? (
          // User list for starting new chats
          <FlatList
            data={allUsers} // List of all users
            renderItem={renderUserItem} // How to render each user
            keyExtractor={(item) => item.uid} // Unique key for each user
            ListEmptyComponent={
              // What to show if there are no users
              <View className="flex-1 justify-center items-center p-8">
                <Text className="text-gray-500 text-center">
                  No users available
                </Text>
              </View>
            }
          />
        ) : (
          // Chat list showing existing conversations
          <FlatList
            data={chats} // List of user's chat rooms
            renderItem={renderChatItem} // How to render each chat
            keyExtractor={(item) => item.chatRoomId} // Unique key for each chat
            ListEmptyComponent={
              // What to show if there are no chats
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
