import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
  limit,
} from "firebase/firestore";
import { db } from "./firebase";
import { Post, CreatePostData } from "../types/post";
import { uploadPostImageToCloudinary } from "./cloudinaryService";

export { uploadPostImageToCloudinary };

export async function createPost(postData: CreatePostData): Promise<string> {
  try {
    const postsRef = collection(db, "posts");
    const docRef = await addDoc(postsRef, {
      ...postData,
      createdAt: Timestamp.now(),
      likes: [],
      comments: 0,
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating post:", error);
    throw new Error("Failed to create post");
  }
}

export function subscribeToPosts(
  callback: (posts: Post[]) => void
): () => void {
  const postsRef = collection(db, "posts");
  const q = query(postsRef, orderBy("createdAt", "desc"), limit(50));

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const posts = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          userName: data.userName,
          userAvatar: data.userAvatar,
          imageUrl: data.imageUrl,
          caption: data.caption,
          createdAt: data.createdAt.toDate(),
          likes: data.likes || [],
          comments: data.comments || 0,
        } as Post;
      });
      callback(posts);
    },
    (error) => {
      console.error("Error listening to posts:", error);
    }
  );

  return unsubscribe;
}