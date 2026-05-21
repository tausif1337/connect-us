import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import { AuthContext } from "../contexts/AuthContext";
import { SendIcon } from "./Icons";
import { addComment } from "../services/postService";
import { showErrorToast } from "../utils/toastHelper";
import { schedulePushNotification } from "../services/notificationService";
 
export default function PostActionsSheet({ route, navigation }: any) {
  // Get post from navigation params
  const { post } = route.params; 
  const { user } = useContext(AuthContext);
  
  const [commentText, setCommentText] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);

  // Date formatter helper
  const formatDate = (date: any) => {
    if (!date) return "";
    const d = date.toDate ? date.toDate() : new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    return d.toLocaleDateString();
  };

  const handleAddComment = async () => {
    if (!user || !commentText.trim() || isCommenting) return;

    setIsCommenting(true);
    try {
      await addComment(post.id, {
        userId: user.uid,
        userName: user.displayName || "User",
        userAvatar: user.photoURL || undefined,
        text: commentText.trim(),
      });
      setCommentText("");
      
      if (post.userId !== user.uid) {
        schedulePushNotification(
          "New Comment",
          `${user.displayName} commented on your post`
        ).catch(console.error);
      }
    } catch (error) {
      showErrorToast("Failed to add comment");
    } finally {
      setIsCommenting(false);
    }
  };

  return (
    <View className="flex-1 justify-end">
      {/* Backdrop */}
      <Pressable 
        className="absolute inset-0 bg-black/50" 
        onPress={() => navigation.goBack()} 
      />

      {/* Sheet Content */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        className="bg-white rounded-t-3xl h-[50%] w-full"
      >
        <View className="flex-1">
          {/* Handle Bar */}
          <View className="items-center pt-3">
             <View className="w-10 h-1.5 bg-gray-200 rounded-full" />
          </View>

          {/* Header */}
          <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-100">
            <Text className="text-lg font-bold">Comments</Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text className="text-gray-400 font-bold">Close</Text>
            </TouchableOpacity>
          </View>

          {/* Comments List */}
          <FlatList
            data={post.comments}
            keyExtractor={(item, index) => item.id || index.toString()}
            contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
            ListEmptyComponent={
              <View className="py-20 items-center">
                <Text className="text-gray-400">No comments yet. Start the conversation!</Text>
              </View>
            }
            renderItem={({ item }) => (
              <View className="flex-row mb-5">
                <View className="w-8 h-8 rounded-full bg-gray-200 mr-3 overflow-hidden">
                  {item.userAvatar ? (
                    <Image source={{ uri: item.userAvatar }} className="w-full h-full" />
                  ) : (
                    <View className="flex-1 items-center justify-center">
                      <Text className="text-[10px] font-bold">{item.userName?.charAt(0)}</Text>
                    </View>
                  )}
                </View>
                <View className="flex-1">
                  <View className="bg-gray-100 rounded-2xl px-4 py-2">
                    <Text className="font-bold text-gray-900 text-xs">{item.userName}</Text>
                    <Text className="text-gray-800 text-sm mt-0.5">{item.text}</Text>
                  </View>
                  <Text className="text-[10px] text-gray-400 mt-1 ml-2">
                    {formatDate(item.createdAt)}
                  </Text>
                </View>
              </View>
            )}
          />

          {/* Input Area */}
          <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 pb-8 flex-row items-center gap-3">
            <View className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden items-center justify-center">
              {user?.photoURL ? (
                <Image source={{ uri: user.photoURL }} className="w-full h-full" />
              ) : (
                <Text className="text-sm font-bold text-gray-500">
                  {user?.displayName?.charAt(0) || "U"}
                </Text>
              )}
            </View>
            <TextInput
              value={commentText}
              onChangeText={setCommentText}
              placeholder="Write a comment..."
              className="flex-1 bg-gray-50 rounded-2xl px-4 py-2.5 text-gray-900"
              multiline
            />
            <TouchableOpacity 
              onPress={handleAddComment}
              disabled={!commentText.trim() || isCommenting}
              className={`w-10 h-10 items-center justify-center rounded-full ${commentText.trim() ? 'bg-blue-500' : 'bg-gray-100'}`}
            >
              {isCommenting ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <SendIcon size={20} color={commentText.trim() ? "#FFF" : "#9CA3AF"} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}