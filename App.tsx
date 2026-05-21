import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { TouchableOpacity, Text } from "react-native";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./src/services/firebase";
import { AuthContext } from "./src/contexts/AuthContext";
import { RootStackParamList } from "./src/types/navigation";
import Toast from 'react-native-toast-message';
import "./global.css";

import LoginScreen from "./src/screens/LoginScreen";
import SignupScreen from "./src/screens/SignupScreen";
import EditProfileScreen from "./src/screens/EditProfileScreen";
import UserProfileScreen from "./src/screens/UserProfileScreen";
import CreatePostScreen from "./src/screens/CreatePostScreen";
import ChatScreen from "./src/screens/ChatScreen";
import TabNavigator from "./src/navigators/TabNavigator";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, Pressable } from 'react-native';
import PostActionsSheet from "./src/components/PostActionsSheet";
import { Post } from "./src/types/post";
import { subscribeToPosts } from "./src/services/postService";
import TrendingScreen from "./src/screens/TrendingScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
    
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usr) => {
      setUser(usr);
      setLoading(false);
    });
    
    return () => {
      unsubscribe();
    };
  }, []);

  if (loading) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AuthContext.Provider value={{ user }}>
        <NavigationContainer>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <Stack.Navigator
              screenOptions={{ headerShown: true, headerTitleAlign: "center" }}
            >
              {user ? (
                <>
                  <Stack.Screen 
                    name="Main" 
                    component={TabNavigator}
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen name="EditProfile" component={EditProfileScreen} />
                  <Stack.Screen
                    name="UserProfile"
                    component={UserProfileScreen}
                  />
                  <Stack.Screen 
                    name="CreatePost" 
                    component={CreatePostScreen}
                    options={({ navigation }) => ({
                      title: "Create Post",
                      headerTitleAlign: "center",
                      headerLeft: () => (
                        <TouchableOpacity
                          onPress={() => navigation.goBack()}
                          className="px-4"
                        >
                          <Text className="text-black font-bold">Cancel</Text>
                        </TouchableOpacity>
                      ),
                    })}
                  />
                  <Stack.Screen name="Chat" component={ChatScreen} />
                   <Stack.Screen
                    name="Trending"
                    component={TrendingScreen}
                  />

                  <Stack.Screen
                    name="PostActionsSheet"
                    component={PostActionsSheet}
                    options={{
                      presentation: "transparentModal", // Essential for bottom sheet look
                      headerShown: false,               // Usually hidden for sheets
                      animation: "slide_from_bottom",   // Classic sheet animation
                      contentStyle: { backgroundColor: 'transparent' } // Allows backdrop
                    }}
                  />
                </>
              ) : (
                <>
                  <Stack.Screen name="Login" component={LoginScreen} />
                  <Stack.Screen name="Signup" component={SignupScreen} />
                </>
              )}
            </Stack.Navigator>
          </GestureHandlerRootView>
        </NavigationContainer>
        <Toast />
      </AuthContext.Provider>
    </SafeAreaProvider>
  );
}


