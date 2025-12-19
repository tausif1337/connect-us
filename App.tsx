import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./src/services/firebase";
import { AuthContext } from "./src/contexts/AuthContext";
import { RootStackParamList } from "./src/types/navigation";
import "./global.css";

import LoginScreen from "./src/screens/LoginScreen";
import SignupScreen from "./src/screens/SignupScreen";
import HomeScreen from "./src/screens/HomeScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import UserProfileScreen from "./src/screens/UserProfileScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import CreatePostScreen from "./src/screens/CreatePostScreen";
import ChatListScreen from "./src/screens/ChatListScreen";
import ChatScreen from "./src/screens/ChatScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usr) => {
      setUser(usr);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AuthContext.Provider value={{ user }}>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {user ? (
              <>
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="Profile" component={ProfileScreen} />
                <Stack.Screen
                  name="UserProfile"
                  component={UserProfileScreen}
                />
                <Stack.Screen name="Settings" component={SettingsScreen} />
                <Stack.Screen name="CreatePost" component={CreatePostScreen} />
                <Stack.Screen name="ChatList" component={ChatListScreen} />
                <Stack.Screen name="Chat" component={ChatScreen} />
              </>
            ) : (
              <>
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Signup" component={SignupScreen} />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </AuthContext.Provider>
    </SafeAreaProvider>
  );
}
