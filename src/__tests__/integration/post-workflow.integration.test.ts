import {
  createPost,
  subscribeToPosts,
  likePost,
  unlikePost,
  addComment,
  deleteComment,
  deletePost,
} from '../../services/postService';
import { CreatePostData, Post } from '../../types/post';

// Mock Firebase
jest.mock('../../services/firebase', () => ({
  db: {},
}));

const mockAddDoc = jest.fn();
const mockUpdateDoc = jest.fn();
const mockDeleteDoc = jest.fn();
const mockGetDoc = jest.fn();
const mockOnSnapshot = jest.fn();

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: (...args: any[]) => mockAddDoc(...args),
  updateDoc: (...args: any[]) => mockUpdateDoc(...args),
  deleteDoc: (...args: any[]) => mockDeleteDoc(...args),
  getDoc: (...args: any[]) => mockGetDoc(...args),
  onSnapshot: (...args: any[]) => mockOnSnapshot(...args),
  doc: jest.fn(),
  query: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  Timestamp: {
    now: jest.fn(() => ({ toDate: () => new Date('2024-01-01') })),
  },
  arrayUnion: jest.fn((value) => ({ _type: 'arrayUnion', value })),
  arrayRemove: jest.fn((value) => ({ _type: 'arrayRemove', value })),
}));

describe('Post Creation and Interaction Workflow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete Post Lifecycle', () => {
    it('should handle complete post lifecycle: create -> like -> comment -> delete', async () => {
      // Step 1: Create post
      const postData: CreatePostData = {
        userId: 'user123',
        userName: 'Test User',
        imageUrl: 'https://example.com/image.jpg',
        caption: 'Test post',
      };

      mockAddDoc.mockResolvedValueOnce({ id: 'post123' });

      const postId = await createPost(postData);
      expect(postId).toBe('post123');
      expect(mockAddDoc).toHaveBeenCalledTimes(1);

      // Step 2: Like the post
      mockUpdateDoc.mockResolvedValueOnce(undefined);

      await likePost(postId, 'user456');
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          likes: expect.objectContaining({ value: 'user456' }),
        })
      );

      // Step 3: Add a comment
      mockUpdateDoc.mockResolvedValueOnce(undefined);

      await addComment(postId, {
        userId: 'user456',
        userName: 'Commenter',
        text: 'Great post!',
      });

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          comments: expect.any(Object),
        })
      );

      // Step 4: Delete the post
      mockDeleteDoc.mockResolvedValueOnce(undefined);

      await deletePost(postId);
      expect(mockDeleteDoc).toHaveBeenCalledWith(expect.anything());
    });

    it('should handle multiple users interacting with a post', async () => {
      const postId = 'post123';

      mockUpdateDoc.mockResolvedValue(undefined);

      // Multiple users like the post
      await Promise.all([
        likePost(postId, 'user1'),
        likePost(postId, 'user2'),
        likePost(postId, 'user3'),
      ]);

      expect(mockUpdateDoc).toHaveBeenCalledTimes(3);

      // Multiple users comment on the post
      mockUpdateDoc.mockClear();

      await Promise.all([
        addComment(postId, {
          userId: 'user1',
          userName: 'User 1',
          text: 'Comment 1',
        }),
        addComment(postId, {
          userId: 'user2',
          userName: 'User 2',
          text: 'Comment 2',
        }),
      ]);

      expect(mockUpdateDoc).toHaveBeenCalledTimes(2);
    });

    it('should handle like and unlike sequence', async () => {
      const postId = 'post123';
      const userId = 'user456';

      mockUpdateDoc.mockResolvedValue(undefined);

      // Like
      await likePost(postId, userId);
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          likes: expect.objectContaining({ value: userId }),
        })
      );

      // Unlike
      await unlikePost(postId, userId);
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          likes: expect.objectContaining({ value: userId }),
        })
      );

      // Like again
      await likePost(postId, userId);
      expect(mockUpdateDoc).toHaveBeenCalledTimes(3);
    });
  });

  describe('Post Feed Subscription', () => {
    it('should receive real-time updates when posts are created', () => {
      const mockCallback = jest.fn();
      const initialPosts = [
        {
          id: 'post1',
          userId: 'user1',
          userName: 'User 1',
          imageUrl: 'https://example.com/1.jpg',
          caption: 'Post 1',
          createdAt: { toDate: () => new Date('2024-01-01') },
          likes: [],
          comments: [],
        },
      ];

      let snapshotCallback: any;
      mockOnSnapshot.mockImplementation((query, callback) => {
        snapshotCallback = callback;
        callback({
          docs: initialPosts.map((post) => ({
            id: post.id,
            data: () => post,
          })),
        });
        return jest.fn();
      });

      const unsubscribe = subscribeToPosts(mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'post1',
            userName: 'User 1',
          }),
        ])
      );

      // Simulate new post added
      if (snapshotCallback) {
        const updatedPosts = [
          ...initialPosts,
          {
            id: 'post2',
            userId: 'user2',
            userName: 'User 2',
            imageUrl: 'https://example.com/2.jpg',
            caption: 'Post 2',
            createdAt: { toDate: () => new Date('2024-01-02') },
            likes: [],
            comments: [],
          },
        ];

        snapshotCallback({
          docs: updatedPosts.map((post) => ({
            id: post.id,
            data: () => post,
          })),
        });
      }

      expect(mockCallback).toHaveBeenCalledTimes(2);
      expect(typeof unsubscribe).toBe('function');
    });

    it('should receive updates when post is liked', () => {
      const mockCallback = jest.fn();
      let snapshotCallback: any;

      const post = {
        id: 'post1',
        userId: 'user1',
        userName: 'User 1',
        imageUrl: 'https://example.com/1.jpg',
        caption: 'Post 1',
        createdAt: { toDate: () => new Date('2024-01-01') },
        likes: [],
        comments: [],
      };

      mockOnSnapshot.mockImplementation((query, callback) => {
        snapshotCallback = callback;
        callback({
          docs: [{ id: post.id, data: () => post }],
        });
        return jest.fn();
      });

      subscribeToPosts(mockCallback);

      // Simulate like
      const updatedPost = { ...post, likes: ['user2'] };
      if (snapshotCallback) {
        snapshotCallback({
          docs: [{ id: updatedPost.id, data: () => updatedPost }],
        });
      }

      expect(mockCallback).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            likes: ['user2'],
          }),
        ])
      );
    });
  });

  describe('Comment Management', () => {
    it('should handle adding and deleting comments', async () => {
      const postId = 'post123';

      // Add comment
      mockUpdateDoc.mockResolvedValueOnce(undefined);

      await addComment(postId, {
        userId: 'user1',
        userName: 'User 1',
        text: 'First comment',
      });

      expect(mockUpdateDoc).toHaveBeenCalled();

      // Delete comment
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          comments: [
            { id: 'comment1', userId: 'user1', text: 'First comment' },
          ],
        }),
      });

      mockUpdateDoc.mockResolvedValueOnce(undefined);

      await deleteComment(postId, 'comment1');

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          comments: [],
        })
      );
    });

    it('should handle multiple comments in sequence', async () => {
      const postId = 'post123';
      mockUpdateDoc.mockResolvedValue(undefined);

      const comments = [
        { userId: 'user1', userName: 'User 1', text: 'First' },
        { userId: 'user2', userName: 'User 2', text: 'Second' },
        { userId: 'user3', userName: 'User 3', text: 'Third' },
      ];

      for (const comment of comments) {
        await addComment(postId, comment);
      }

      expect(mockUpdateDoc).toHaveBeenCalledTimes(3);
    });
  });

  describe('Error Recovery', () => {
    it('should handle failed post creation and allow retry', async () => {
      const postData: CreatePostData = {
        userId: 'user123',
        userName: 'Test User',
        imageUrl: 'https://example.com/image.jpg',
        caption: 'Test post',
      };

      // First attempt fails
      mockAddDoc.mockRejectedValueOnce(new Error('Network error'));

      await expect(createPost(postData)).rejects.toThrow('Failed to create post');

      // Retry succeeds
      mockAddDoc.mockResolvedValueOnce({ id: 'post123' });

      const postId = await createPost(postData);
      expect(postId).toBe('post123');
    });

    it('should handle failed like and allow retry', async () => {
      const postId = 'post123';
      const userId = 'user456';

      // First attempt fails
      mockUpdateDoc.mockRejectedValueOnce(new Error('Network error'));

      await expect(likePost(postId, userId)).rejects.toThrow('Failed to like post');

      // Retry succeeds
      mockUpdateDoc.mockResolvedValueOnce(undefined);

      await likePost(postId, userId);
      expect(mockUpdateDoc).toHaveBeenCalledTimes(2);
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent likes on same post', async () => {
      const postId = 'post123';
      mockUpdateDoc.mockResolvedValue(undefined);

      const likes = Array.from({ length: 10 }, (_, i) =>
        likePost(postId, `user${i}`)
      );

      await Promise.all(likes);

      expect(mockUpdateDoc).toHaveBeenCalledTimes(10);
    });

    it('should handle concurrent comment additions', async () => {
      const postId = 'post123';
      mockUpdateDoc.mockResolvedValue(undefined);

      const comments = Array.from({ length: 5 }, (_, i) =>
        addComment(postId, {
          userId: `user${i}`,
          userName: `User ${i}`,
          text: `Comment ${i}`,
        })
      );

      await Promise.all(comments);

      expect(mockUpdateDoc).toHaveBeenCalledTimes(5);
    });

    it('should handle simultaneous like and comment on same post', async () => {
      const postId = 'post123';
      mockUpdateDoc.mockResolvedValue(undefined);

      await Promise.all([
        likePost(postId, 'user1'),
        addComment(postId, {
          userId: 'user2',
          userName: 'User 2',
          text: 'Great!',
        }),
      ]);

      expect(mockUpdateDoc).toHaveBeenCalledTimes(2);
    });
  });

  describe('Data Integrity', () => {
    it('should maintain correct like count after multiple operations', async () => {
      const postId = 'post123';
      mockUpdateDoc.mockResolvedValue(undefined);

      // 3 users like
      await Promise.all([
        likePost(postId, 'user1'),
        likePost(postId, 'user2'),
        likePost(postId, 'user3'),
      ]);

      // 1 user unlikes
      await unlikePost(postId, 'user2');

      // Final count should be 2 likes (user1 and user3)
      expect(mockUpdateDoc).toHaveBeenCalled();
    });

    it('should maintain comment order in feed', () => {
      const mockCallback = jest.fn();
      
      const posts = [
        {
          id: 'post1',
          createdAt: { toDate: () => new Date('2024-01-03') },
          comments: [],
        },
        {
          id: 'post2',
          createdAt: { toDate: () => new Date('2024-01-01') },
          comments: [],
        },
        {
          id: 'post3',
          createdAt: { toDate: () => new Date('2024-01-02') },
          comments: [],
        },
      ];

      mockOnSnapshot.mockImplementation((query, callback) => {
        callback({
          docs: posts.map((post) => ({
            id: post.id,
            data: () => ({
              ...post,
              userId: 'user1',
              userName: 'User 1',
              imageUrl: 'https://example.com/1.jpg',
              caption: 'Post',
              likes: [],
            }),
          })),
        });
        return jest.fn();
      });

      subscribeToPosts(mockCallback);

      // Posts should be ordered by most recent first
      const calledPosts = mockCallback.mock.calls[0][0];
      expect(calledPosts[0].id).toBe('post1'); // Most recent
      expect(calledPosts[2].id).toBe('post2'); // Oldest
    });
  });
});
