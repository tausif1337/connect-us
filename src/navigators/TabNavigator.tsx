import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  HomeIcon,
  UserIcon,
  SettingsIcon,
  ChatIcon,
  TrendingIcon,
} from "../components/Icons";
import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from "../screens/ProfileScreen";
import ChatListScreen from "../screens/ChatListScreen";
import SettingsScreen from "../screens/SettingsScreen";
import TrendingScreen from "../screens/TrendingScreen";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#000",
        tabBarInactiveTintColor: "#6B7280",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
          paddingBottom: 60,
          paddingTop: 10,
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: "600",
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <HomeIcon size={size} color={color} />
          ),
          headerShown: true,
          headerTitle: "Feed",
          headerTitleAlign: "center",
        }}
      />
      <Tab.Screen
        name="ChatList"
        component={ChatListScreen}
        options={{
          title: "Chats",
          tabBarIcon: ({ color, size }) => (
            <ChatIcon size={size} color={color} />
          ),
          headerShown: true,
          headerTitleAlign: "center",
        }}
      /> 
      <Tab.Screen
        name="Trending"
        component={TrendingScreen}
        options={{
          title: "Trending",
          tabBarIcon: ({ color, size }) => (
            <TrendingIcon size={size} color={color} />
          ),
          headerShown: true,
          headerTitleAlign: "center",
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <UserIcon size={size} color={color} />
          ),
          headerShown: true,
          headerTitleAlign: "center",
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <SettingsIcon size={size} color={color} />
          ),
          headerShown: true,
          headerTitleAlign: "center",
        }}
      />
    </Tab.Navigator>
  );
}
