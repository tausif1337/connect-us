// This service handles all Firebase operations for the chat feature
// It manages creating chat rooms, sending messages, and retrieving chat data

// IMPORTANT FIREBASE SETUP INSTRUCTIONS:
// =======================================
// To use this chat feature, you need to set up Firestore indexes:
//
// 1. Go to Firebase Console > Firestore Database > Indexes
// 2. Create a composite index for 'messages' collection:
//    - Collection: messages
//    - Fields: chatRoomId (Ascending), createdAt (Descending)
//
// 3. Create a composite index for 'chatRooms' collection:
//    - Collection: chatRooms
//    - Fields: participants (Array), lastMessageTime (Descending)
//
// Alternatively, when you first run the app, Firebase will provide
// error messages with direct links to create the required indexes.
//
// 4. Also ensure you have a 'users' collection to store user data.
//    When users sign up, save their data to this collection.
// =======================================

import {
  collection, // Function to reference a Firestore collection
  addDoc, // Function to add a new document to a collection
  query, // Function to create a query
  where, // Function to filter query results
  orderBy, // Function to sort query results
  onSnapshot, // Function to listen to real-time updates
  getDocs, // Function to get documents once
  updateDoc, // Function to update a document
  doc, // Function to reference a specific document
  serverTimestamp, // Function to get server timestamp
  Timestamp, // Type for Firestore timestamps
} from "firebase/firestore";
import { db } from "./firebase";
import { ChatRoom, Message, UserChat } from "../types/chat";
import { User } from "firebase/auth";

// Helper function to get a user's display name
const getUserDisplayName = (userData: {
  displayName?: string;
  email?: string;
}): string => {
  return userData.displayName || userData.email || "Unknown User";
};

// This function creates or gets an existing chat room between two users
// userId1: ID of the first user
// userId2: ID of the second user
// Returns: The chat room ID
export const getOrCreateChatRoom = async (
  userId1: string,
  userId2: string,
  user1Data: { displayName?: string; photoURL?: string; email?: string },
  user2Data: { displayName?: string; photoURL?: string; email?: string }
): Promise<string> => {
  // Reference to the chatRooms collection in Firestore
  const chatRoomsRef = collection(db, "chatRooms");

  // Create a query to find existing chat rooms that include both users
  // We check if the participants array contains both user IDs
  const q = query(
    chatRoomsRef,
    where("participants", "array-contains", userId1)
  );

  // Execute the query and get the results
  const querySnapshot = await getDocs(q);

  // Check if any existing chat room contains both users
  const existingRoom = querySnapshot.docs.find((doc) => {
    const data = doc.data();
    // Check if participants array includes both users
    return data.participants.includes(userId2);
  });

  // If a chat room already exists, return its ID
  if (existingRoom) {
    return existingRoom.id;
  }

  // If no chat room exists, create a new one
  const newChatRoom = {
    participants: [userId1, userId2], // Array of user IDs in this chat
    createdAt: serverTimestamp(), // Server timestamp for when chat was created
    lastMessage: "", // Initially no messages
    lastMessageTime: null, // Initially no message time
    // Store user details for easy access, filtering out undefined values
    participantDetails: {
      [userId1]: {
        displayName: getUserDisplayName(user1Data),
        email: user1Data.email || "",
        photoURL: user1Data.photoURL || "",
      },
      [userId2]: {
        displayName: getUserDisplayName(user2Data),
        email: user2Data.email || "",
        photoURL: user2Data.photoURL || "",
      },
    },
  };

  // Add the new chat room to Firestore
  const docRef = await addDoc(chatRoomsRef, newChatRoom);

  // Return the new chat room's ID
  return docRef.id;
};

// This function sends a message in a chat room
// chatRoomId: The ID of the chat room
// message: The message object to send
// Returns: void
export const sendMessage = async (
  chatRoomId: string,
  message: Omit<Message, "_id"> // Message without _id (Firestore will generate it)
): Promise<void> => {
  // Reference to the messages collection in Firestore
  const messagesRef = collection(db, "messages");

  // Create the message object to store in Firestore
  const messageData = {
    text: message.text, // The message text
    createdAt: serverTimestamp(), // Server timestamp
    user: message.user, // User who sent the message
    chatRoomId: chatRoomId, // Which chat room this belongs to
  };

  // Add the message to Firestore
  await addDoc(messagesRef, messageData);

  // Update the chat room with the latest message info
  const chatRoomRef = doc(db, "chatRooms", chatRoomId);
  await updateDoc(chatRoomRef, {
    lastMessage: message.text, // Store the last message text
    lastMessageTime: serverTimestamp(), // Store when it was sent
  });
};

// This function listens to messages in a chat room in real-time
// chatRoomId: The ID of the chat room
// callback: Function to call when messages update
// Returns: Unsubscribe function to stop listening
export const subscribeToMessages = (
  chatRoomId: string,
  callback: (messages: Message[]) => void
): (() => void) => {
  // Reference to the messages collection
  const messagesRef = collection(db, "messages");

  // Create a query to get messages for this chat room
  // Note: Removed orderBy to avoid composite index requirement
  // Sorting is handled in JavaScript below
  const q = query(
    messagesRef,
    where("chatRoomId", "==", chatRoomId)
    // orderBy removed to prevent composite index requirement
  );

  // Listen to real-time updates
  const unsubscribe = onSnapshot(q, (snapshot) => {
    // Convert Firestore documents to Message objects
    let messages: Message[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        _id: doc.id, // Use Firestore document ID
        text: data.text, // Message text
        // Convert Firestore timestamp to JavaScript Date
        createdAt: data.createdAt?.toDate() || new Date(),
        user: data.user, // User who sent the message
        chatRoomId: data.chatRoomId, // Chat room ID
      };
    });

    // Sort messages by createdAt in descending order (newest first)
    // This replaces the Firestore orderBy to avoid composite index requirement
    messages = messages.sort((a, b) => {
      const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
      const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
      return bTime - aTime;
    });

    // Call the callback with the updated and sorted messages
    callback(messages);
  });

  // Return the unsubscribe function so caller can stop listening when needed
  return unsubscribe;
};

// This function gets all chat rooms for a specific user
// userId: The ID of the current user
// callback: Function to call when chat rooms update
// Returns: Unsubscribe function to stop listening
export const subscribeToUserChats = (
  userId: string,
  callback: (chats: UserChat[]) => void
): (() => void) => {
  // Reference to the chatRooms collection
  const chatRoomsRef = collection(db, "chatRooms");

  // Create a query to get chat rooms where this user is a participant
  // Note: Removed orderBy to avoid composite index requirement
  // Sorting is handled in JavaScript below
  const q = query(
    chatRoomsRef,
    where("participants", "array-contains", userId)
    // orderBy removed to prevent composite index requirement
  );

  // Listen to real-time updates
  const unsubscribe = onSnapshot(q, (snapshot) => {
    // Convert Firestore documents to UserChat objects
    let chats: UserChat[] = snapshot.docs.map((doc) => {
      const data = doc.data();

      // Find the other user's ID (not the current user)
      const otherUserId =
        data.participants.find((id: string) => id !== userId) || "";

      // Get the other user's details from participantDetails
      const otherUserDetails = data.participantDetails?.[otherUserId] || {};

      return {
        chatRoomId: doc.id, // Chat room ID
        otherUserId: otherUserId, // Other user's ID
        otherUserName: getUserDisplayName(otherUserDetails), // Other user's name
        otherUserPhoto: otherUserDetails.photoURL, // Other user's photo
        lastMessage: data.lastMessage || "", // Last message preview
        // Convert Firestore timestamp to JavaScript Date
        lastMessageTime: data.lastMessageTime?.toDate(),
      };
    });

    // Sort chats by lastMessageTime in descending order (most recent first)
    // This replaces the Firestore orderBy to avoid composite index requirement
    chats = chats.sort((a, b) => {
      // Handle cases where lastMessageTime might be undefined
      if (!a.lastMessageTime && !b.lastMessageTime) return 0;
      if (!a.lastMessageTime) return 1; // Put chats with no timestamp at the end
      if (!b.lastMessageTime) return -1; // Put chats with no timestamp at the end

      // Sort by timestamp descending (most recent first)
      // Both values are guaranteed to be Date objects at this point due to checks above
      const bTime = b.lastMessageTime instanceof Date ? b.lastMessageTime.getTime() : 0;
      const aTime = a.lastMessageTime instanceof Date ? a.lastMessageTime.getTime() : 0;
      return bTime - aTime;
    });

    // Call the callback with the updated and sorted chats
    callback(chats);
  });

  // Return the unsubscribe function
  return unsubscribe;
};

// This function gets all users except the current user (for starting new chats)
// currentUserId: The ID of the current user
// Returns: Array of users
export const getAllUsers = async (
  currentUserId: string
): Promise<
  Array<{
    uid: string;
    displayName?: string;
    email?: string;
    photoURL?: string;
  }>
> => {
  // Reference to the users collection
  const usersRef = collection(db, "users");

  // Get all users
  const querySnapshot = await getDocs(usersRef);

  // Convert to array and filter out current user
  const users = querySnapshot.docs
    .map((doc) => ({
      uid: doc.id,
      ...(doc.data() as {
        displayName?: string;
        email?: string;
        photoURL?: string;
      }),
    }))
    .filter((user) => user.uid !== currentUserId); // Exclude current user

  return users;
};
