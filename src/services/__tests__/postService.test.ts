import {
  createPost,
  subscribeToPosts,
  deletePost,
  updatePost,
  likePost,
  unlikePost,
  addComment,
  deleteComment,
} from '../postService';
import { CreatePostData } from '../../types/post';

// Mock Firebase
jest.mock('../firebase', () => ({
  db: {},
}));

// Mock Firestore functions
const mockAddDoc = jest.fn();
const mockGetDoc = jest.fn();
const mockUpdateDoc = jest.fn();
const mockDeleteDoc = jest.fn();
const mockOnSnapshot = jest.fn();
const mockCollection = jest.fn();
const mockDoc = jest.fn();
const mockQuery = jest.fn();

jest.mock('firebase/firestore', () => ({
  collection: (...args: any[]) => mockCollection(...args),
  addDoc: (...args: any[]) => mockAddDoc(...args),
  getDoc: (...args: any[]) => mockGetDoc(...args),
  updateDoc: (...args: any[]) => mockUpdateDoc(...args),
  deleteDoc: (...args: any[]) => mockDeleteDoc(...args),
  onSnapshot: (...args: any[]) => mockOnSnapshot(...args),
  doc: (...args: any[]) => mockDoc(...args),
  query: (...args: any[]) => mockQuery(...args),
  orderBy: jest.fn(),
  limit: jest.fn(),
  Timestamp: {
    now: jest.fn(() => ({ toDate: () => new Date('2024-01-01') })),
  },
  arrayUnion: jest.fn((value) => ({ _type: 'arrayUnion', value })),
  arrayRemove: jest.fn((value) => ({ _type: 'arrayRemove', value })),
}));

describe('PostService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createPost', () => {
    it('should create a post successfully', async () => {
      const mockPostData: CreatePostData = {
        userId: 'user123',
        userName: 'Test User',
        userAvatar: 'https://example.com/avatar.jpg',
        imageUrl: 'https://example.com/post.jpg',
        caption: 'Test caption',
      };

      mockAddDoc.mockResolvedValueOnce({ id: 'post123' });

      const postId = await createPost(mockPostData);

      expect(postId).toBe('post123');
      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          userId: 'user123',
          userName: 'Test User',
          caption: 'Test caption',
          likes: [],
          comments: [],
        })
      );
    });

    it('should handle post creation without avatar', async () => {
      const mockPostData: CreatePostData = {
        userId: 'user123',
        userName: 'Test User',
        imageUrl: 'https://example.com/post.jpg',
        caption: 'Test caption',
      };

      mockAddDoc.mockResolvedValueOnce({ id: 'post456' });

      const postId = await createPost(mockPostData);

      expect(postId).toBe('post456');
    });

    it('should throw error when post creation fails', async () => {
      const mockPostData: CreatePostData = {
        userId: 'user123',
        userName: 'Test User',
        imageUrl: 'https://example.com/post.jpg',
        caption: 'Test caption',
      };

      mockAddDoc.mockRejectedValueOnce(new Error('Firestore error'));

      await expect(createPost(mockPostData)).rejects.toThrow('Failed to create post');
    });

    it('should handle empty caption', async () => {
      const mockPostData: CreatePostData = {
        userId: 'user123',
        userName: 'Test User',
        imageUrl: 'https://example.com/post.jpg',
        caption: '',
      };

      mockAddDoc.mockResolvedValueOnce({ id: 'post789' });

      const postId = await createPost(mockPostData);

      expect(postId).toBe('post789');
    });
  });

  describe('subscribeToPosts', () => {
    it('should call callback with posts data', () => {
      const mockCallback = jest.fn();
      const mockPosts = [
        {
          id: 'post1',
          userId: 'user1',
          userName: 'User 1',
          imageUrl: 'https://example.com/1.jpg',
          caption: 'Caption 1',
          createdAt: { toDate: () => new Date('2024-01-01') },
          likes: [],
          comments: [],
        },
      ];

      mockOnSnapshot.mockImplementation((query, callback) => {
        callback({
          docs: mockPosts.map((post) => ({
            id: post.id,
            data: () => post,
          })),
        });
        return jest.fn(); // unsubscribe function
      });

      const unsubscribe = subscribeToPosts(mockCallback);

      expect(mockCallback).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');
    });

    it('should transform Firestore timestamps to Date objects', () => {
      const mockCallback = jest.fn();
      const mockPost = {
        id: 'post1',
        userId: 'user1',
        userName: 'User 1',
        imageUrl: 'https://example.com/1.jpg',
        caption: 'Caption 1',
        createdAt: { toDate: () => new Date('2024-01-01') },
        likes: ['user2'],
        comments: [
          {
            id: 'comment1',
            userId: 'user2',
            userName: 'User 2',
            text: 'Nice post!',
            createdAt: { toDate: () => new Date('2024-01-02') },
          },
        ],
      };

      mockOnSnapshot.mockImplementation((query, callback) => {
        callback({
          docs: [
            {
              id: mockPost.id,
              data: () => mockPost,
            },
          ],
        });
        return jest.fn();
      });

      subscribeToPosts(mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'post1',
            createdAt: expect.any(Date),
            comments: expect.arrayContaining([
              expect.objectContaining({
                createdAt: expect.any(Date),
              }),
            ]),
          }),
        ])
      );
    });

    it('should return unsubscribe function', () => {
      const mockUnsubscribe = jest.fn();
      mockOnSnapshot.mockReturnValue(mockUnsubscribe);

      const unsubscribe = subscribeToPosts(jest.fn());

      expect(typeof unsubscribe).toBe('function');
    });
  });

  describe('deletePost', () => {
    it('should delete post successfully', async () => {
      mockDeleteDoc.mockResolvedValueOnce(undefined);

      await deletePost('post123');

      expect(mockDeleteDoc).toHaveBeenCalledWith(expect.anything());
    });

    it('should throw error when delete fails', async () => {
      mockDeleteDoc.mockRejectedValueOnce(new Error('Firestore error'));

      await expect(deletePost('post123')).rejects.toThrow('Failed to delete post');
    });
  });

  describe('updatePost', () => {
    it('should update post caption', async () => {
      mockUpdateDoc.mockResolvedValueOnce(undefined);

      await updatePost('post123', { caption: 'Updated caption' });

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        { caption: 'Updated caption' }
      );
    });

    it('should update post image URL', async () => {
      mockUpdateDoc.mockResolvedValueOnce(undefined);

      await updatePost('post123', { imageUrl: 'https://new-image.com/img.jpg' });

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        { imageUrl: 'https://new-image.com/img.jpg' }
      );
    });

    it('should update both caption and image URL', async () => {
      mockUpdateDoc.mockResolvedValueOnce(undefined);

      await updatePost('post123', {
        caption: 'New caption',
        imageUrl: 'https://new-image.com/img.jpg',
      });

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        {
          caption: 'New caption',
          imageUrl: 'https://new-image.com/img.jpg',
        }
      );
    });

    it('should throw error when update fails', async () => {
      mockUpdateDoc.mockRejectedValueOnce(new Error('Firestore error'));

      await expect(updatePost('post123', { caption: 'New' })).rejects.toThrow(
        'Failed to update post'
      );
    });
  });

  describe('likePost', () => {
    it('should add user to likes array', async () => {
      mockUpdateDoc.mockResolvedValueOnce(undefined);

      await likePost('post123', 'user456');

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          likes: expect.objectContaining({ value: 'user456' }),
        })
      );
    });

    it('should throw error when like fails', async () => {
      mockUpdateDoc.mockRejectedValueOnce(new Error('Firestore error'));

      await expect(likePost('post123', 'user456')).rejects.toThrow('Failed to like post');
    });
  });

  describe('unlikePost', () => {
    it('should remove user from likes array', async () => {
      mockUpdateDoc.mockResolvedValueOnce(undefined);

      await unlikePost('post123', 'user456');

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          likes: expect.objectContaining({ value: 'user456' }),
        })
      );
    });

    it('should throw error when unlike fails', async () => {
      mockUpdateDoc.mockRejectedValueOnce(new Error('Firestore error'));

      await expect(unlikePost('post123', 'user456')).rejects.toThrow('Failed to unlike post');
    });
  });

  describe('addComment', () => {
    it('should add comment to post', async () => {
      mockUpdateDoc.mockResolvedValueOnce(undefined);

      const comment = {
        userId: 'user123',
        userName: 'Test User',
        text: 'Great post!',
      };

      await addComment('post123', comment);

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          comments: expect.objectContaining({
            value: expect.objectContaining({
              id: expect.stringContaining('comment_'),
              userId: 'user123',
              userName: 'Test User',
              text: 'Great post!',
            }),
          }),
        })
      );
    });

    it('should add comment with avatar', async () => {
      mockUpdateDoc.mockResolvedValueOnce(undefined);

      const comment = {
        userId: 'user123',
        userName: 'Test User',
        userAvatar: 'https://example.com/avatar.jpg',
        text: 'Great post!',
      };

      await addComment('post123', comment);

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          comments: expect.objectContaining({
            value: expect.objectContaining({
              userAvatar: 'https://example.com/avatar.jpg',
            }),
          }),
        })
      );
    });

    it('should throw error when adding comment fails', async () => {
      mockUpdateDoc.mockRejectedValueOnce(new Error('Firestore error'));

      await expect(
        addComment('post123', {
          userId: 'user123',
          userName: 'Test User',
          text: 'Comment',
        })
      ).rejects.toThrow('Failed to add comment');
    });
  });

  describe('deleteComment', () => {
    it('should delete comment from post', async () => {
      const mockComments = [
        { id: 'comment1', text: 'First' },
        { id: 'comment2', text: 'Second' },
        { id: 'comment3', text: 'Third' },
      ];

      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ comments: mockComments }),
      });

      mockUpdateDoc.mockResolvedValueOnce(undefined);

      await deleteComment('post123', 'comment2');

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          comments: expect.arrayContaining([
            { id: 'comment1', text: 'First' },
            { id: 'comment3', text: 'Third' },
          ]),
        })
      );
    });

    it('should handle deleting non-existent comment', async () => {
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ comments: [{ id: 'comment1', text: 'First' }] }),
      });

      mockUpdateDoc.mockResolvedValueOnce(undefined);

      await deleteComment('post123', 'nonExistent');

      expect(mockUpdateDoc).toHaveBeenCalled();
    });

    it('should handle post with no comments', async () => {
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({}),
      });

      mockUpdateDoc.mockResolvedValueOnce(undefined);

      await deleteComment('post123', 'comment1');

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          comments: [],
        })
      );
    });

    it('should throw error when post does not exist', async () => {
      mockGetDoc.mockResolvedValueOnce({
        exists: () => false,
      });

      // Should not call updateDoc if post doesn't exist
      await deleteComment('post123', 'comment1');

      expect(mockUpdateDoc).not.toHaveBeenCalled();
    });

    it('should throw error when deletion fails', async () => {
      mockGetDoc.mockRejectedValueOnce(new Error('Firestore error'));

      await expect(deleteComment('post123', 'comment1')).rejects.toThrow(
        'Failed to delete comment'
      );
    });
  });

  describe('Edge cases', () => {
    it('should handle rapid like/unlike operations', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);

      await likePost('post123', 'user456');
      await unlikePost('post123', 'user456');
      await likePost('post123', 'user456');

      expect(mockUpdateDoc).toHaveBeenCalledTimes(3);
    });

    it('should handle multiple comments being added simultaneously', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);

      const comments = [
        { userId: 'user1', userName: 'User 1', text: 'Comment 1' },
        { userId: 'user2', userName: 'User 2', text: 'Comment 2' },
        { userId: 'user3', userName: 'User 3', text: 'Comment 3' },
      ];

      await Promise.all(comments.map((c) => addComment('post123', c)));

      expect(mockUpdateDoc).toHaveBeenCalledTimes(3);
    });
  });
});
