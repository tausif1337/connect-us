// This screen handles the one-on-one chat interface using GiftedChat
// It shows message history and allows sending new messages in real-time

import React, {
  useState, // Hook for managing local state
  useCallback, // Hook for memoizing functions
  useEffect, // Hook for side effects (like subscriptions)
  useContext, // Hook for accessing React context
  useLayoutEffect, // Hook for performing layout effects
} from "react";
import {
  View, // Container component for grouping other components
  Text, // Component for displaying text
  TouchableOpacity, // Touchable button component
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // Ensures content stays within device safe areas
import { GiftedChat, IMessage } from "react-native-gifted-chat"; // Third-party chat UI library
import { AuthContext } from "../contexts/AuthContext"; // Context for accessing user authentication state
import { subscribeToMessages, sendMessage } from "../services/chatService"; // Functions for chat operations
import { Message } from "../types/chat"; // Type definition for message data
import { NativeStackScreenProps } from "@react-navigation/native-stack"; // Type for navigation props
import { RootStackParamList } from "../types/navigation"; // Type for navigation parameter list
type Props = NativeStackScreenProps<RootStackParamList, "Chat">;

// Main component for the chat screen
const ChatScreen = ({ navigation, route }: Props) => {
  // Get route parameters passed from ChatListScreen
  // These tell us which chat room to display and the name of the other user
  const { chatRoomId, otherUserName } = route.params;

  // Get the current user from AuthContext
  // This gives us access to the logged-in user's information
  const { user } = useContext(AuthContext);

  // State to store all messages in this chat
  // This holds the messages that will be displayed in the chat
  const [messages, setMessages] = useState<IMessage[]>([]);

  // Effect to subscribe to messages when component mounts
  // This sets up a real-time listener for new messages in this chat room
  useEffect(() => {
    // Subscribe to real-time message updates for this chat room
    // The callback function receives updated message data
    const unsubscribe = subscribeToMessages(chatRoomId, (fetchedMessages) => {
      // Update the messages state with new messages
      // Convert our Message type to GiftedChat's IMessage type
      setMessages(fetchedMessages.map(message => ({
        _id: message._id,
        text: message.text,
        createdAt: message.createdAt,
        user: {
          _id: message.user._id,
          name: message.user.name,
          avatar: message.user.avatar
        }
      })));
    });

    // Cleanup function: unsubscribe when component unmounts
    // This is important to prevent memory leaks and stop listening
    // when the user navigates away from this screen
    return () => unsubscribe();
  }, [chatRoomId]); // Re-run effect when chatRoomId changes

  // Function to handle sending a new message
  // This is called when user taps the send button in GiftedChat
  const onSend = useCallback(
    async (newMessages: IMessage[] = []) => {
      // If no user is logged in, don't send
      // This prevents errors when user is not authenticated
      if (!user) return;

      // Get the first message from the array (GiftedChat sends an array)
      // Even though it's just one message, GiftedChat wraps it in an array
      const message = newMessages[0];

      // Create the message object to send to Firebase
      // Format the message data to match our backend expectations
      const messageToSend: Omit<Message, "_id"> = {
        text: message.text, // The message text
        createdAt: new Date(), // Current timestamp
        user: {
          _id: user.uid, // Current user's ID
          name: user.displayName || user.email || "You", // User's name
          ...(user.photoURL && { avatar: user.photoURL }), // User's profile picture (only if it exists)
        },
        chatRoomId: chatRoomId, // Which chat room this belongs to
      };

      // Send the message to Firebase
      // This saves the message to our database
      try {
        await sendMessage(chatRoomId, messageToSend);
      } catch (error) {
        // Log any errors that occur during message sending
        console.error("Error sending message:", error);
      }
    },
    [chatRoomId, user] // Re-create function when these dependencies change
  );

  // If no user is logged in, don't render the chat
  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
        <View className="flex-1 justify-center items-center">
          <Text>Please log in to chat</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Set up navigation header options
  // This customizes the header bar at the top of the screen
  useLayoutEffect(() => {
    navigation.setOptions({
      title: otherUserName, // Show the other user's name in the header
      headerLeft: () => (
        // Back button to return to the chat list
        <TouchableOpacity onPress={() => navigation.goBack()} className="px-4">
          <Text className="text-black font-bold">Back</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, otherUserName]); // Re-run when navigation or otherUserName changes

  // Main screen content
  return (
    <SafeAreaView
      className="flex-1 bg-white pt-4 pb-8"
      edges={["top", "bottom"]}
    >
      <View className="flex-1 bg-white px-2">
        {/* Native header used */}

        {/* GiftedChat Component */}
        {/* This handles all the chat UI including message bubbles, input field, and send button */}
        {/* @ts-ignore - GiftedChat type definitions have some conflicts */}
        <GiftedChat
          messages={messages} // Array of messages to display
          onSend={onSend} // Function to call when sending a message
          user={{
            _id: user.uid, // Current user's ID (GiftedChat uses this to show messages on right/left)
            name: user.displayName || user.email || "You", // Current user's name
            ...(user.photoURL && { avatar: user.photoURL }), // Current user's profile picture (only if it exists)
          }}
          // Customize message bubble colors
          renderBubble={(props) => {
            return (
              <View>
                {props.currentMessage && (
                  <View
                    className={`p-3 rounded-2xl mx-2 my-1 max-w-xs ${
                      props.currentMessage.user._id === user.uid
                        ? "bg-black self-end" // Current user's messages on right, primary black
                        : "bg-gray-300 self-start" // Other user's messages on left, gray
                    }`}
                  >
                    <Text
                      className={`${
                        props.currentMessage.user._id === user.uid
                          ? "text-white" // White text for current user
                          : "text-gray-800" // Dark text for other user
                      }`}
                    >
                      {props.currentMessage.text}
                    </Text>
                  </View>
                )}
              </View>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
};

export default ChatScreen;
