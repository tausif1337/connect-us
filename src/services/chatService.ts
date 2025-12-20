// This service handles all Firebase operations for the chat feature
// It manages creating chat rooms, sending messages, and retrieving chat data

import {
  collection, // Function to reference a Firestore collection
  addDoc, // Function to add a new document to a collection
  query, // Function to create a query
  where, // Function to filter query results
  orderBy, // Function to sort query results
  onSnapshot, // Function to listen to real-time updates
  getDocs, // Function to get documents once
  getDoc,
  updateDoc, // Function to update a document
  doc, // Function to reference a specific document
  serverTimestamp, // Function to get server timestamp
  Timestamp, // Type for Firestore timestamps
} from "firebase/firestore";
import { limit } from "firebase/firestore";
import { db } from "./firebase";
import { ChatRoom, Message, UserChat } from "../types/chat";
import { User } from "firebase/auth";

// Helper function to sort chats by lastMessageTime (most recent first)
// This ensures that the most recently active chats appear at the top of the list
const sortChatsByTime = (chats: UserChat[]): UserChat[] => {
  return chats.sort((a, b) => {
    // If both chats have no last message time, they're equal
    if (!a.lastMessageTime && !b.lastMessageTime) return 0;
    // If only chat 'a' has no last message time, put it after chat 'b'
    if (!a.lastMessageTime) return 1;
    // If only chat 'b' has no last message time, put it after chat 'a'
    if (!b.lastMessageTime) return -1;
    
    // Convert timestamps to milliseconds for comparison
    // This determines which chat was more recently active
    const bTime =
      b.lastMessageTime instanceof Date ? b.lastMessageTime.getTime() : 0;
    const aTime =
      a.lastMessageTime instanceof Date ? a.lastMessageTime.getTime() : 0;
    
    // Return positive number if b is newer, negative if a is newer
    return bTime - aTime;
  });
};

// Helper function to get a user's display name
// This function tries multiple sources to find a suitable name to display
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

// This function creates a new chat room between two users or returns an existing one
// This prevents duplicate chat rooms between the same two users
// userId1: ID of the first user (usually the current user)
// userId2: ID of the second user (the person they want to chat with)
// user1Data: Profile information for the first user
// user2Data: Profile information for the second user
// Returns: A promise that resolves to the chat room ID
export const getOrCreateChatRoom = async (
  userId1: string,
  userId2: string,
  user1Data: { displayName?: string; photoURL?: string; email?: string },
  user2Data: { displayName?: string; photoURL?: string; email?: string }
): Promise<string> => {
  // Reference to the chatRooms collection in Firestore
  // This is like opening a folder where all chat rooms are stored
  const chatRoomsRef = collection(db, "chatRooms");

  // Create a query to find existing chat rooms that include both users
  // We're looking for rooms where userId1 is a participant
  const q = query(
    chatRoomsRef,
    where("participants", "array-contains", userId1)
  );

  // Execute the query and get the results
  // This retrieves all chat rooms where userId1 is participating
  const querySnapshot = await getDocs(q);

  // Check if any existing chat room contains both users
  // We need to find if there's already a room with both userId1 and userId2
  const existingRoom = querySnapshot.docs.find((doc) => {
    const data = doc.data();
    // Check if participants array includes both users
    return data.participants.includes(userId2);
  });

  // If a chat room already exists between these users, return its ID
  // This prevents creating duplicate chat rooms
  if (existingRoom) {
    return existingRoom.id;
  }

  // If no chat room exists, create a new one
  // Prepare the data structure for the new chat room
  const newChatRoom = {
    participants: [userId1, userId2], // Array of user IDs in this chat
    createdAt: serverTimestamp(), // Server timestamp for when chat was created
    lastMessage: "", // Initially no messages
    lastMessageTime: null, // Initially no message time
    
    // Store user details for easy access, filtering out undefined values
    // This avoids having to look up user info every time we display the chat
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
  // This creates a new document in the chatRooms collection
  const docRef = await addDoc(chatRoomsRef, newChatRoom);

  // Return the new chat room's ID so we can navigate to it
  return docRef.id;
};

// This function sends a message in a chat room
// It adds the message to the messages collection and updates the chat room info
// chatRoomId: The ID of the chat room where the message should be sent
// message: The message object containing text and user info (without _id)
// Returns: A promise that resolves when the message is sent
export const sendMessage = async (
  chatRoomId: string,
  message: Omit<Message, "_id"> // Message without _id (Firestore will generate it)
): Promise<void> => {
  try {
    // Reference to the messages collection in Firestore
    // This is like opening the folder where all messages are stored
    const messagesRef = collection(db, "messages");

    // Create the message object to store in Firestore
    // We add server timestamp and chat room ID to the message
    const messageData = {
      text: message.text, // The actual message text
      createdAt: serverTimestamp(), // Server timestamp for ordering
      user: message.user, // User who sent the message
      chatRoomId: chatRoomId, // Which chat room this belongs to
    };

    // Add the message to Firestore
    // This creates a new document in the messages collection
    await addDoc(messagesRef, messageData);

    // Update the chat room with the latest message info
    // This keeps the chat list up to date with previews
    const chatRoomRef = doc(db, "chatRooms", chatRoomId);
    await updateDoc(chatRoomRef, {
      lastMessage: message.text, // Store the last message text for preview
      lastMessageTime: serverTimestamp(), // Store when it was sent
    });
  } catch (error) {
    // Log any errors that occur during message sending
    console.error("Error sending message:", error);
    throw error; // Re-throw the error so it can be handled by the caller
  }
};

// This function listens to messages in a chat room in real-time
// As soon as a new message is added, this function will be notified
// chatRoomId: The ID of the chat room to listen to
// callback: Function to call when messages update (receives array of messages)
// Returns: An unsubscribe function to stop listening (important for cleanup)
export const subscribeToMessages = (
  chatRoomId: string,
  callback: (messages: Message[]) => void
): (() => void) => {
  // Reference to the messages collection
  // This is like opening the folder where all messages are stored
  const messagesRef = collection(db, "messages");

  // Create a query to get messages for this chat room
  // We're asking Firestore for all messages with this chatRoomId
  // Note: Removed orderBy to avoid composite index requirement
  // Sorting is handled in JavaScript below
  const q = query(
    messagesRef,
    where("chatRoomId", "==", chatRoomId)
    // orderBy removed to prevent composite index requirement
  );

  // Listen to real-time updates
  // This sets up a listener that will be called whenever messages change
  const unsubscribe = onSnapshot(q, (snapshot) => {
    // Convert Firestore documents to Message objects
    // This transforms the raw Firestore data into our Message format
    let messages: Message[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        _id: doc.id, // Use Firestore document ID as message ID
        text: data.text, // Message text
        // Convert Firestore timestamp to JavaScript Date
        // This makes it easier to work with dates in our app
        createdAt: data.createdAt?.toDate() || new Date(),
        user: data.user, // User who sent the message
        chatRoomId: data.chatRoomId, // Chat room ID
      };
    });

    // Sort messages by createdAt in descending order (newest first)
    // This replaces the Firestore orderBy to avoid composite index requirement
    // Newer messages will appear at the bottom of the chat (natural chat flow)
    messages = messages.sort((a, b) => {
      const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
      const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
      return bTime - aTime;
    });

    // Call the callback with the updated and sorted messages
    // This passes the messages to whatever component is listening
    callback(messages);
  });

  // Return the unsubscribe function so caller can stop listening when needed
  // This is important to prevent memory leaks when components unmount
  return unsubscribe;
};

// This function gets all chat rooms for a specific user
// It provides a real-time updated list of all chats for the user
// userId: The ID of the current user
// callback: Function to call when chat rooms update (receives array of chats)
// Returns: An unsubscribe function to stop listening
export const subscribeToUserChats = (
  userId: string,
  callback: (chats: UserChat[]) => void
): (() => void) => {
  // Reference to the chatRooms collection
  // This is like opening the folder where all chat rooms are stored
  const chatRoomsRef = collection(db, "chatRooms");

  // Create a query to get chat rooms where this user is a participant
  // We're asking Firestore for all chat rooms that include this userId
  // Note: Removed orderBy to avoid composite index requirement
  // Sorting is handled in JavaScript below
  const q = query(
    chatRoomsRef,
    where("participants", "array-contains", userId)
    // orderBy removed to prevent composite index requirement
  );

  // Listen to real-time updates
  // This sets up a listener that will be called whenever chat rooms change
  const unsubscribe = onSnapshot(q, (snapshot) => {
    // Convert Firestore documents to UserChat objects
    // This transforms the raw Firestore data into our UserChat format
    let chats: UserChat[] = snapshot.docs.map((doc) => {
      const data = doc.data();

      // Find the other user's ID (not the current user)
      // In a chat between two people, we want to show info about the other person
      const otherUserId =
        data.participants.find((id: string) => id !== userId) || "";

      // Get the other user's details from participantDetails
      // This avoids having to look up user info separately
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

    // Find chats that need enrichment (name == Unknown User)
    // Sometimes we might not have complete user info initially
    const unknowns = chats
      .map((c, idx) => ({ c, idx }))
      .filter(
        ({ c }) => (c.otherUserName || "") === "Unknown User" && c.otherUserId
      );

    // If all user names are known, sort and return immediately
    if (unknowns.length === 0) {
      // No enrichment needed — sort and return
      chats = sortChatsByTime(chats);
      callback(chats);
      return;
    }

    // Fetch missing user docs in parallel and enrich chats
    // For users with "Unknown User" names, we look up their actual info
    Promise.all(
      unknowns.map(async ({ idx, c }) => {
        try {
          // Try to get user info from the users collection
          const userSnap = await getDoc(doc(db, "users", c.otherUserId));
          let resolvedName: string | null = null;

          // If user document exists, try to get their name
          if (userSnap.exists()) {
            const data = userSnap.data() as any;
            // Handle empty or whitespace-only displayName
            const displayName =
              data.displayName && data.displayName.trim() !== ""
                ? data.displayName
                : undefined;
            
            // Try multiple fields to find a suitable name
            resolvedName =
              displayName || data.userName || data.name || data.email || null;
              
            // If we found a name, update the chat entry
            if (resolvedName) {
              chats[idx].otherUserName = resolvedName;
            }
            
            // If we don't have a photo yet but user has one, update it
            if (!chats[idx].otherUserPhoto && data.photoURL) {
              chats[idx].otherUserPhoto = data.photoURL;
            }
          } else {
            // Log when user document is not found (helpful for debugging)
            console.debug(
              "subscribeToUserChats: user doc not found for",
              c.otherUserId
            );
          }

          // If still no resolved name, try to get the author's name from their most recent post
          // This is a fallback mechanism to find user names
          if (!resolvedName) {
            try {
              // Look for the user's most recent post to get their name
              const postsQ = query(
                collection(db, "posts"),
                where("userId", "==", c.otherUserId),
                orderBy("createdAt", "desc"),
                limit(1)
              );
              const postSnap = await getDocs(postsQ);
              
              // If user has posts, use the name from their post
              if (!postSnap.empty) {
                const postData = postSnap.docs[0].data() as any;
                const postAuthor = postData.userName || null;
                if (postAuthor) {
                  chats[idx].otherUserName = postAuthor;
                }
              }
            } catch (e) {
              // ignore post lookup error
              // If we can't find posts, that's okay, we'll keep the Unknown User label
            }
          }
        } catch (e) {
          // Log warnings for any errors during user info lookup
          console.warn(
            "subscribeToUserChats: error fetching user",
            c.otherUserId,
            e
          );
        }
      })
    )
      .then(() => {
        // After enriching user info, sort chats and send to callback
        chats = sortChatsByTime(chats);
        callback(chats);
      })
      .catch(() => {
        // Even if enrichment fails, still sort and send chats
        chats = sortChatsByTime(chats);
        callback(chats);
      });
  });

  // Return the unsubscribe function
  // This is important to prevent memory leaks when components unmount
  return unsubscribe;
};

// This function gets all users except the current user
// This is used for the "New Chat" feature to show who you can chat with
// currentUserId: The ID of the current user (to exclude from results)
// Returns: A promise that resolves to an array of users
export const getAllUsers = async ( currentUserId: string ): Promise<
  Array<{
    uid: string;
    displayName?: string;
    email?: string;
    photoURL?: string;
  }>
> => {
  // Reference to the users collection
  // This is like opening the folder where all user profiles are stored
  const usersRef = collection(db, "users");

  // Get all users from Firestore
  // This retrieves all user documents from the users collection
  const querySnapshot = await getDocs(usersRef);

  // Convert to array and filter out current user
  // Transform raw Firestore data and remove the current user
  const users = querySnapshot.docs
    .map((doc) => {
      const data = doc.data() as {
        displayName?: string;
        email?: string;
        photoURL?: string;
      };

      // Handle empty or whitespace-only displayName
      // Clean up display names that are just spaces
      const displayName =
        data.displayName && data.displayName.trim() !== ""
          ? data.displayName
          : undefined;

      return {
        uid: doc.id, // User ID from document ID
        displayName: displayName, // Cleaned display name
        email: data.email, // User's email
        photoURL: data.photoURL, // User's profile photo
      };
    })
    .filter((user) => user.uid !== currentUserId); // Exclude current user

  return users;
};