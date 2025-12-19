import React, { useState, useContext } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { Post } from "../types/post";
import { AuthContext } from "../contexts/AuthContext";
import { RootStackParamList } from "../types/navigation";
import { ThreeDotsIcon } from "./Icons";
import { deletePost, updatePost } from "../services/postService";

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useContext(AuthContext);
  const [menuVisible, setMenuVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editCaption, setEditCaption] = useState(post.caption);
  const [isUpdating, setIsUpdating] = useState(false);
  const isOwnPost = user?.uid === post.userId;

  const handleDelete = () => {
    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      { text: "Cancel", onPress: () => setMenuVisible(false), style: "cancel" },
      {
        text: "Delete",
        onPress: async () => {
          try {
            setMenuVisible(false);
            await deletePost(post.id);
            Alert.alert("Success", "Post deleted successfully");
          } catch (error) {
            Alert.alert("Error", "Failed to delete post");
          }
        },
        style: "destructive",
      },
    ]);
  };

  const handleEdit = () => {
    setMenuVisible(false);
    setEditCaption(post.caption);
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editCaption.trim()) {
      Alert.alert("Error", "Caption cannot be empty");
      return;
    }
    try {
      setIsUpdating(true);
      await updatePost(post.id, { caption: editCaption });
      setEditModalVisible(false);
      Alert.alert("Success", "Post updated successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to update post");
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      <View className="bg-white mb-4 rounded-lg overflow-hidden border border-gray-200">
        {/* User Header with Menu */}
        <View className="flex-row items-center justify-between px-4 py-3">
          <TouchableOpacity
            className="flex-1 flex-row items-center"
            onPress={() =>
              navigation.navigate("UserProfile", { userId: post.userId })
            }
          >
            <View className="w-10 h-10 rounded-full bg-gray-300 mr-3 items-center justify-center">
              {post.userAvatar ? (
                <Image
                  source={{ uri: post.userAvatar }}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <Text className="text-white font-bold text-lg">
                  {post.userName.charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
            <View>
              <Text className="font-bold text-gray-900">{post.userName}</Text>
              <Text className="text-xs text-gray-500">
                {formatDate(post.createdAt)}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Three Dots Menu */}
          {isOwnPost && (
            <TouchableOpacity
              onPress={() => setMenuVisible(true)}
              activeOpacity={0.7}
              className="p-2"
            >
              <ThreeDotsIcon size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>

        {/* Post Image */}
        <Image
          source={{ uri: post.imageUrl }}
          className="w-full aspect-square"
          resizeMode="cover"
        />

        {/* Post Content */}
        <View className="px-4 py-3">
          {post.caption && (
            <Text className="text-gray-800 mb-2">
              <Text className="font-bold">{post.userName} </Text>
              {post.caption}
            </Text>
          )}
          <View className="flex-row items-center pt-2">
            <Text className="text-gray-500 text-xs mr-4">
              {post.likes.length} {post.likes.length === 1 ? "like" : "likes"}
            </Text>
            <Text className="text-gray-500 text-xs">
              {post.comments} {post.comments === 1 ? "comment" : "comments"}
            </Text>
          </View>
        </View>
      </View>

      {/* Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
          className="flex-1 bg-black/50 justify-end"
        >
          <TouchableOpacity
            activeOpacity={1}
            className="bg-white rounded-t-3xl px-4 py-4 gap-2"
          >
            <TouchableOpacity
              onPress={handleEdit}
              className="py-4 border-b border-gray-200"
            >
              <Text className="text-gray-900 font-semibold text-center">
                Edit
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDelete}
              className="py-4 border-b border-gray-200"
            >
              <Text className="text-red-500 font-semibold text-center">
                Delete
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setMenuVisible(false)}
              className="py-4"
            >
              <Text className="text-gray-500 font-semibold text-center">
                Cancel
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View className="flex-1 bg-white pt-12 px-4">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-2xl font-bold">Edit Post</Text>
            <TouchableOpacity
              onPress={() => setEditModalVisible(false)}
              disabled={isUpdating}
            >
              <Text className="text-gray-500 text-lg">✕</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            value={editCaption}
            onChangeText={setEditCaption}
            placeholder="What's on your mind?"
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={6}
            className="border border-gray-300 rounded-lg p-4 text-base mb-6 text-gray-900"
            editable={!isUpdating}
          />

          <TouchableOpacity
            onPress={handleSaveEdit}
            disabled={isUpdating}
            className={`${
              isUpdating ? "bg-gray-400" : "bg-black"
            } rounded-lg py-3 mb-3`}
          >
            {isUpdating ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-center text-base">
                Save Changes
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setEditModalVisible(false)}
            disabled={isUpdating}
            className="rounded-lg py-3 border border-gray-300"
          >
            <Text className="text-gray-900 font-semibold text-center text-base">
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}
