// Navigation type definitions for all screens in the app
// This tells TypeScript what parameters each screen expects

export type RootStackParamList = {
  Login: undefined; // Login screen doesn't need any params
  Signup: undefined; // Signup screen doesn't need any params
  Home: undefined; // Home screen doesn't need any params
  Profile: undefined; // Profile screen doesn't need any params
  UserProfile: {
    // Public user profile screen
    userId: string; // The ID of the user whose profile to view
  };
  Settings: undefined; // Settings screen doesn't need any params
  CreatePost: undefined; // CreatePost screen doesn't need any params
  ChatList: undefined; // ChatList screen doesn't need any params
  Chat: {
    // Chat screen needs these parameters:
    chatRoomId: string; // The ID of the chat room
    otherUserId: string; // The ID of the other user
    otherUserName: string; // The name of the other user
    otherUserPhoto?: string; // The profile picture URL (optional)
  };
};
