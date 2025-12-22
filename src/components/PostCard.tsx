import React, { useState, useContext } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  NativeSyntheticEvent,
  TextLayoutEventData,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { Post } from "../types/post";
import { AuthContext } from "../contexts/AuthContext";
import { RootStackParamList } from "../types/navigation";
import {
  ThreeDotsIcon,
  HeartIcon,
  HeartFilledIcon,
  CommentIcon,
  SendIcon,
} from "./Icons";
import {
  deletePost,
  updatePost,
  likePost,
  unlikePost,
  addComment,
  deleteComment,
} from "../services/postService";
import { showErrorToast, showSuccessToast } from "../utils/toastHelper";
import { schedulePushNotification } from "../services/notificationService";
import { responsiveFontSize, responsiveWidth, isSmallDevice } from "../utils/responsive";

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useContext(AuthContext);
  const [menuVisible, setMenuVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [commentsModalVisible, setCommentsModalVisible] = useState(false);
  const [editCaption, setEditCaption] = useState(post.caption);
  const [commentText, setCommentText] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const isOwnPost = user?.uid === post.userId;
  const [isTextExpanded, setIsTextExpanded] = useState(false);
  const [showReadMore, setShowReadMore] = useState(false);
  const isLiked = user ? post.likes.includes(user.uid) : false;

  const handleDelete = () => {
    // For simplicity, we'll directly delete without confirmation
    // In a real app, you might want to keep the confirmation dialog
    setMenuVisible(false);
    deletePost(post.id)
      .then(() => {
        showSuccessToast("Post deleted successfully");
      })
      .catch((error) => {
        console.error("Error deleting post:", error);
        showErrorToast("Failed to delete post");
      });
  };

  const handleEdit = () => {
    setMenuVisible(false);
    setEditCaption(post.caption);
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editCaption.trim()) {
      showErrorToast("Caption cannot be empty");
      return;
    }
    try {
      setIsUpdating(true);
      await updatePost(post.id, { caption: editCaption });
      setEditModalVisible(false);
      showSuccessToast("Post updated successfully");
    } catch (error) {
      showErrorToast("Failed to update post");
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

  const handleLike = async () => {
    if (!user || isLiking) return;

    setIsLiking(true);
    try {
      if (isLiked) {
        await unlikePost(post.id, user.uid);
      } else {
        await likePost(post.id, user.uid);
        // Send notification if user is not the post owner
        if (post.userId !== user.uid) {
          schedulePushNotification(
            "New Like",
            `${user.displayName || user.email} liked your post`
          ).catch(console.error);
        }
      }
    } catch (error) {
      showErrorToast("Failed to update like");
    } finally {
      setIsLiking(false);
    }
  };

  const handleAddComment = async () => {
    if (!user || !commentText.trim() || isCommenting) return;

    setIsCommenting(true);
    try {
      await addComment(post.id, {
        userId: user.uid,
        userName: user.displayName || user.email?.split("@")[0] || "User",
        userAvatar: user.photoURL || undefined,
        text: commentText.trim(),
      });
      setCommentText("");
      
      // Send notification if user is not the post owner
      if (post.userId !== user.uid) {
        schedulePushNotification(
          "New Comment",
          `${user.displayName || user.email} commented on your post`
        ).catch(console.error);
      }
    } catch (error) {
      showErrorToast("Failed to add comment");
    } finally {
      setIsCommenting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(post.id, commentId);
      showSuccessToast("Comment deleted successfully");
    } catch (error) {
      showErrorToast("Failed to delete comment");
    }
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
            <View className={isSmallDevice ? "w-8 h-8 rounded-full bg-gray-300 mr-2 items-center justify-center" : "w-10 h-10 rounded-full bg-gray-300 mr-3 items-center justify-center"}>
              {post.userAvatar ? (
                <Image
                  source={{ uri: post.userAvatar }}
                  className={isSmallDevice ? "w-8 h-8 rounded-full" : "w-10 h-10 rounded-full"}
                />
              ) : (
                <Text className="text-white font-bold text-lg">
                  {post.userName.charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
            <View>
              <Text className={isSmallDevice ? "font-bold text-gray-900 text-sm" : "font-bold text-gray-900 text-base"}>{post.userName}</Text>
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
              <ThreeDotsIcon size={isSmallDevice ? 16 : 20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>

        {/* Caption above image */}
        {post.caption ? (
          <View className="px-4 py-3">
            <Text
              className={isSmallDevice ? "text-gray-800 text-sm" : "text-gray-800 text-base"}
              onTextLayout={(e: NativeSyntheticEvent<TextLayoutEventData>) => {
                if (e.nativeEvent.lines.length > 3 && !showReadMore) {
                  setShowReadMore(true);
                }
              }}
              numberOfLines={isTextExpanded ? undefined : 3}
            >
              {post.caption}
            </Text>
            {showReadMore ? (
              <TouchableOpacity
                onPress={() => setIsTextExpanded((s) => !s)}
                activeOpacity={0.7}
              >
                <Text className="text-sm text-gray-500 mt-1">
                  {isTextExpanded ? "Read less" : "Read more"}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}

        {/* Post Image */}
        <Image
          source={{ uri: post.imageUrl }}
          className="w-full aspect-square"
          resizeMode="cover"
        />

        {/* Post Actions */}
        <View className="px-4 py-3">
          <View className="flex-row items-center gap-4 mb-2">
            {/* Like Button */}
            <TouchableOpacity
              onPress={handleLike}
              disabled={isLiking}
              className="flex-row items-center"
              activeOpacity={0.7}
            >
              {isLiked ? (
                <HeartFilledIcon size={24} color="#EF4444" />
              ) : (
                <HeartIcon size={24} color="#111827" />
              )}
              <Text
                className={`ml-1 text-sm font-semibold ${
                  isLiked ? "text-red-500" : "text-gray-900"
                }`}
              >
                {post.likes.length}
              </Text>
            </TouchableOpacity>

            {/* Comment Button */}
            <TouchableOpacity
              onPress={() => setCommentsModalVisible(true)}
              className="flex-row items-center"
              activeOpacity={0.7}
            >
              <CommentIcon size={24} color="#111827" />
              <Text className="ml-1 text-sm font-semibold text-gray-900">
                {post.comments.length}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Likes Text */}
          {post.likes.length > 0 && (
            <Text className="text-gray-900 font-semibold text-sm mb-1">
              {post.likes.length} {post.likes.length === 1 ? "like" : "likes"}
            </Text>
          )}

          {/* Preview first comment */}
          {post.comments.length > 0 && (
            <TouchableOpacity
              onPress={() => setCommentsModalVisible(true)}
              activeOpacity={0.7}
            >
              <Text className="text-gray-500 text-sm">
                View all {post.comments.length}{" "}
                {post.comments.length === 1 ? "comment" : "comments"}
              </Text>
            </TouchableOpacity>
          )}
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

      {/* Comments Modal */}
      <Modal
        visible={commentsModalVisible}
        animationType="slide"
        onRequestClose={() => setCommentsModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 bg-white"
        >
          <View className="flex-1 pt-16 pb-8">
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 pb-6 pt-2 border-b border-gray-200">
              <Text className="text-xl font-bold">Comments</Text>
              <TouchableOpacity onPress={() => setCommentsModalVisible(false)}>
                <Text className="text-gray-500 text-lg">✕</Text>
              </TouchableOpacity>
            </View>

            {/* Comments List */}
            <FlatList
              data={post.comments}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingTop: 16,
                paddingBottom: 8,
              }}
              ListEmptyComponent={
                <View className="py-20 items-center">
                  <Text className="text-gray-500">No comments yet</Text>
                  <Text className="text-gray-400 text-sm mt-1">
                    Be the first to comment!
                  </Text>
                </View>
              }
              renderItem={({ item }) => (
                <View className="mb-4">
                  <View className="flex-row">
                    <View className="w-8 h-8 rounded-full bg-gray-300 mr-3 items-center justify-center">
                      {item.userAvatar ? (
                        <Image
                          source={{ uri: item.userAvatar }}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <Text className="text-white font-bold text-xs">
                          {item.userName.charAt(0).toUpperCase()}
                        </Text>
                      )}
                    </View>
                    <View className="flex-1">
                      <View className="bg-gray-100 rounded-2xl px-4 py-2">
                        <TouchableOpacity
                          onPress={() =>
                            navigation.navigate("UserProfile", {
                              userId: item.userId,
                            })
                          }
                        >
                          <Text className="font-semibold text-gray-900 text-sm">
                            {item.userName}
                          </Text>
                        </TouchableOpacity>
                        <Text className="text-gray-800 text-base mt-1">
                          {item.text}
                        </Text>
                      </View>
                      <View className="flex-row items-center mt-1 ml-4">
                        <Text className="text-gray-500 text-xs">
                          {formatDate(item.createdAt)}
                        </Text>
                        {user?.uid === item.userId && (
                          <TouchableOpacity
                            onPress={() => handleDeleteComment(item.id)}
                            className="ml-4"
                          >
                            <Text className="text-red-500 text-xs font-semibold">
                              Delete
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </View>
                </View>
              )}
            />

            {/* Add Comment Input */}
            <View className="border-t border-gray-200 px-4 py-4 flex-row items-center gap-3">
              <View className={isSmallDevice ? "w-8 h-8 rounded-full bg-gray-300 items-center justify-center" : "w-10 h-10 rounded-full bg-gray-300 items-center justify-center"}>
                {user?.photoURL ? (
                  <Image
                    source={{ uri: user.photoURL }}
                    className={isSmallDevice ? "w-8 h-8 rounded-full" : "w-10 h-10 rounded-full"}
                  />
                ) : (
                  <Text className="text-white font-bold text-xs">
                    {user?.displayName?.charAt(0).toUpperCase() || "U"}
                  </Text>
                )}
              </View>
              <TextInput
                value={commentText}
                onChangeText={setCommentText}
                placeholder="Add a comment..."
                placeholderTextColor="#9CA3AF"
                className={isSmallDevice ? "flex-1 bg-gray-100 rounded-full px-3 py-2 text-gray-900 text-sm" : "flex-1 bg-gray-100 rounded-full px-4 py-3 text-gray-900"}
                editable={!isCommenting}
              />
              <TouchableOpacity
                onPress={handleAddComment}
                disabled={!commentText.trim() || isCommenting}
                className={`p-2 ${!commentText.trim() ? "opacity-50" : ""}`}
              >
                {isCommenting ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <SendIcon
                    size={isSmallDevice ? 20 : 24}
                    color={commentText.trim() ? "#000" : "#9CA3AF"}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}
