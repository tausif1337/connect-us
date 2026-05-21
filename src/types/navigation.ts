// Navigation type definitions for all screens in the app
// This tells TypeScript what parameters each screen expects
import { Post } from './post';

export type RootStackParamList = {
  Login: undefined; // Login screen doesn't need any params
  Signup: undefined; // Signup screen doesn't need any params
  Main: undefined; // Main tab navigator screen
  Home: undefined; // Home screen doesn't need any params
  Profile: undefined; // Profile screen doesn't need any params
  Settings: undefined; // Settings screen doesn't need any params
  EditProfile: undefined; // Edit profile screen doesn't need any params
  UserProfile: {
    // Public user profile screen
    userId: string; // The ID of the user whose profile to view
  };
  CreatePost: undefined; // CreatePost screen doesn't need any params
  PostActionsSheet: {
    post: Post;
  };
  ChatList: undefined; // ChatList screen doesn't need any params
  Trending: undefined; // ChatList screen doesn't need any params
  Chat: {
    // Chat screen needs these parameters:
    chatRoomId: string; // The ID of the chat room
    otherUserId: string; // The ID of the other user
    otherUserName: string; // The name of the other user
    otherUserPhoto?: string; // The profile picture URL (optional)
  };
};
