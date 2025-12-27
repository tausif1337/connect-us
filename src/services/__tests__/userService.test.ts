import {
  getUserStats,
  isFollowing,
  followUser,
  unfollowUser,
} from '../userService';

// Mock Firebase
jest.mock('../firebase', () => ({
  db: {},
}));

// Mock Firestore functions
const mockGetDoc = jest.fn();
const mockUpdateDoc = jest.fn();
const mockDoc = jest.fn();

jest.mock('firebase/firestore', () => ({
  doc: (...args: any[]) => mockDoc(...args),
  getDoc: (...args: any[]) => mockGetDoc(...args),
  updateDoc: (...args: any[]) => mockUpdateDoc(...args),
  arrayUnion: jest.fn((value) => ({ _type: 'arrayUnion', value })),
  arrayRemove: jest.fn((value) => ({ _type: 'arrayRemove', value })),
  increment: jest.fn((value) => ({ _type: 'increment', value })),
}));

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserStats', () => {
    it('should return user stats when user exists', async () => {
      const mockUserData = {
        followers: ['user1', 'user2'],
        following: ['user3'],
        followersCount: 2,
        followingCount: 1,
      };

      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => mockUserData,
      });

      const stats = await getUserStats('testUserId');

      expect(stats).toEqual({
        followers: ['user1', 'user2'],
        following: ['user3'],
        followersCount: 2,
        followingCount: 1,
      });
    });

    it('should return default stats when user does not exist', async () => {
      mockGetDoc.mockResolvedValueOnce({
        exists: () => false,
      });

      const stats = await getUserStats('nonExistentUser');

      expect(stats).toEqual({
        followers: [],
        following: [],
        followersCount: 0,
        followingCount: 0,
      });
    });

    it('should return default stats when user data is incomplete', async () => {
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({}),
      });

      const stats = await getUserStats('testUserId');

      expect(stats).toEqual({
        followers: [],
        following: [],
        followersCount: 0,
        followingCount: 0,
      });
    });

    it('should throw error when getDoc fails', async () => {
      mockGetDoc.mockRejectedValueOnce(new Error('Firestore error'));

      await expect(getUserStats('testUserId')).rejects.toThrow('Failed to get user stats');
    });

    it('should handle partial data correctly', async () => {
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          followers: ['user1'],
          followersCount: 1,
        }),
      });

      const stats = await getUserStats('testUserId');

      expect(stats.followers).toEqual(['user1']);
      expect(stats.following).toEqual([]);
      expect(stats.followersCount).toBe(1);
      expect(stats.followingCount).toBe(0);
    });
  });

  describe('isFollowing', () => {
    it('should return true when user is following target', async () => {
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          following: ['targetUser', 'otherUser'],
        }),
      });

      const result = await isFollowing('currentUser', 'targetUser');

      expect(result).toBe(true);
    });

    it('should return false when user is not following target', async () => {
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          following: ['otherUser'],
        }),
      });

      const result = await isFollowing('currentUser', 'targetUser');

      expect(result).toBe(false);
    });

    it('should return false when user document does not exist', async () => {
      mockGetDoc.mockResolvedValueOnce({
        exists: () => false,
      });

      const result = await isFollowing('currentUser', 'targetUser');

      expect(result).toBe(false);
    });

    it('should return false when following list is empty', async () => {
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          following: [],
        }),
      });

      const result = await isFollowing('currentUser', 'targetUser');

      expect(result).toBe(false);
    });

    it('should return false when following list is undefined', async () => {
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({}),
      });

      const result = await isFollowing('currentUser', 'targetUser');

      expect(result).toBe(false);
    });

    it('should handle errors gracefully', async () => {
      mockGetDoc.mockRejectedValueOnce(new Error('Network error'));

      const result = await isFollowing('currentUser', 'targetUser');

      expect(result).toBe(false);
    });
  });

  describe('followUser', () => {
    beforeEach(() => {
      mockUpdateDoc.mockResolvedValue(undefined);
    });

    it('should update both users when following', async () => {
      await followUser('currentUser', 'targetUser');

      expect(mockUpdateDoc).toHaveBeenCalledTimes(2);
      
      // First call updates current user's following list
      expect(mockUpdateDoc).toHaveBeenNthCalledWith(
        1,
        expect.anything(),
        expect.objectContaining({
          following: expect.objectContaining({ value: 'targetUser' }),
          followingCount: expect.objectContaining({ value: 1 }),
        })
      );

      // Second call updates target user's followers list
      expect(mockUpdateDoc).toHaveBeenNthCalledWith(
        2,
        expect.anything(),
        expect.objectContaining({
          followers: expect.objectContaining({ value: 'currentUser' }),
          followersCount: expect.objectContaining({ value: 1 }),
        })
      );
    });

    it('should throw error when updateDoc fails', async () => {
      mockUpdateDoc.mockRejectedValueOnce(new Error('Firestore error'));

      await expect(followUser('currentUser', 'targetUser')).rejects.toThrow('Failed to follow user');
    });

    it('should handle empty user IDs', async () => {
      await expect(followUser('', 'targetUser')).rejects.toThrow();
    });
  });

  describe('unfollowUser', () => {
    beforeEach(() => {
      mockUpdateDoc.mockResolvedValue(undefined);
    });

    it('should update both users when unfollowing', async () => {
      await unfollowUser('currentUser', 'targetUser');

      expect(mockUpdateDoc).toHaveBeenCalledTimes(2);
      
      // First call removes from current user's following list
      expect(mockUpdateDoc).toHaveBeenNthCalledWith(
        1,
        expect.anything(),
        expect.objectContaining({
          following: expect.objectContaining({ value: 'targetUser' }),
          followingCount: expect.objectContaining({ value: -1 }),
        })
      );

      // Second call removes from target user's followers list
      expect(mockUpdateDoc).toHaveBeenNthCalledWith(
        2,
        expect.anything(),
        expect.objectContaining({
          followers: expect.objectContaining({ value: 'currentUser' }),
          followersCount: expect.objectContaining({ value: -1 }),
        })
      );
    });

    it('should throw error when updateDoc fails', async () => {
      mockUpdateDoc.mockRejectedValueOnce(new Error('Firestore error'));

      await expect(unfollowUser('currentUser', 'targetUser')).rejects.toThrow('Failed to unfollow user');
    });

    it('should handle empty user IDs', async () => {
      await expect(unfollowUser('', 'targetUser')).rejects.toThrow();
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle null/undefined values gracefully', async () => {
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          followers: null,
          following: undefined,
        }),
      });

      const stats = await getUserStats('testUserId');

      expect(stats.followers).toEqual([]);
      expect(stats.following).toEqual([]);
    });

    it('should handle concurrent follow operations', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);

      const promises = [
        followUser('user1', 'user2'),
        followUser('user3', 'user4'),
        followUser('user5', 'user6'),
      ];

      await Promise.all(promises);

      expect(mockUpdateDoc).toHaveBeenCalledTimes(6);
    });

    it('should handle same user following/unfollowing', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);

      await followUser('user1', 'user2');
      await unfollowUser('user1', 'user2');

      expect(mockUpdateDoc).toHaveBeenCalledTimes(4);
    });
  });
});
