// This file defines all the types needed for our chat feature
// These types help TypeScript understand the structure of our chat data

import { IMessage } from "react-native-gifted-chat";

// Message interface extends GiftedChat's IMessage
// This ensures our messages work perfectly with GiftedChat component
export interface Message extends IMessage {
  // _id: unique identifier for each message (inherited from IMessage)
  // text: the actual message content (inherited from IMessage)
  // createdAt: when the message was sent (inherited from IMessage)
  // user: who sent the message (inherited from IMessage)

  // Custom field to store the chat room this message belongs to
  chatRoomId: string;
}

// ChatRoom represents a conversation between two users
export interface ChatRoom {
  // Unique identifier for the chat room
  id: string;

  // Array of user IDs who are part of this chat
  // For one-on-one chat, this will have exactly 2 user IDs
  participants: string[];

  // The most recent message in this chat (for preview in chat list)
  lastMessage?: string;

  // Timestamp of the last message (to sort chats by recency)
  lastMessageTime?: Date;

  // When this chat room was created
  createdAt: Date;

  // Object to store user info for participants (like names, profile pics)
  // Key is userId, value is user info
  participantDetails?: {
    [userId: string]: {
      displayName?: string;
      photoURL?: string;
      email?: string;
    };
  };
}

// UserChat is a simplified version of ChatRoom for displaying in chat list
export interface UserChat {
  // The chat room ID
  chatRoomId: string;

  // The other user's ID (not the current user)
  otherUserId: string;

  // The other user's display name
  otherUserName: string;

  // The other user's profile picture URL (optional)
  otherUserPhoto?: string;

  // Preview of the last message
  lastMessage?: string;

  // When the last message was sent
  lastMessageTime?: Date;
}
