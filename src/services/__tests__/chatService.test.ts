import {
  getOrCreateChatRoom,
  sendMessage,
  subscribeToMessages,
  subscribeToUserChats,
  getAllUsers,
} from '../chatService';
import { Message } from '../../types/chat';

// Mock Firebase
jest.mock('../firebase', () => ({
  db: {},
}));

// Mock Firestore functions
const mockAddDoc = jest.fn();
const mockGetDoc = jest.fn();
const mockGetDocs = jest.fn();
const mockUpdateDoc = jest.fn();
const mockOnSnapshot = jest.fn();
const mockCollection = jest.fn();
const mockDoc = jest.fn();
const mockQuery = jest.fn();

jest.mock('firebase/firestore', () => ({
  collection: (...args: any[]) => mockCollection(...args),
  addDoc: (...args: any[]) => mockAddDoc(...args),
  getDoc: (...args: any[]) => mockGetDoc(...args),
  getDocs: (...args: any[]) => mockGetDocs(...args),
  updateDoc: (...args: any[]) => mockUpdateDoc(...args),
  onSnapshot: (...args: any[]) => mockOnSnapshot(...args),
  doc: (...args: any[]) => mockDoc(...args),
  query: (...args: any[]) => mockQuery(...args),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  serverTimestamp: jest.fn(() => ({ _type: 'serverTimestamp' })),
  Timestamp: {
    now: jest.fn(() => ({ toDate: () => new Date('2024-01-01') })),
  },
}));

describe('ChatService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getOrCreateChatRoom', () => {
    it('should return existing chat room if it exists', async () => {
      const mockDocs = [
        {
          id: 'chatRoom123',
          data: () => ({
            participants: ['user1', 'user2'],
          }),
        },
      ];

      mockGetDocs.mockResolvedValueOnce({ docs: mockDocs });

      const chatRoomId = await getOrCreateChatRoom(
        'user1',
        'user2',
        { displayName: 'User 1', email: 'user1@example.com' },
        { displayName: 'User 2', email: 'user2@example.com' }
      );

      expect(chatRoomId).toBe('chatRoom123');
      expect(mockAddDoc).not.toHaveBeenCalled();
    });

    it('should create new chat room if it does not exist', async () => {
      mockGetDocs.mockResolvedValueOnce({ docs: [] });
      mockAddDoc.mockResolvedValueOnce({ id: 'newChatRoom456' });

      const chatRoomId = await getOrCreateChatRoom(
        'user1',
        'user2',
        { displayName: 'User 1', email: 'user1@example.com' },
        { displayName: 'User 2', email: 'user2@example.com' }
      );

      expect(chatRoomId).toBe('newChatRoom456');
      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          participants: ['user1', 'user2'],
          lastMessage: '',
          lastMessageTime: null,
          participantDetails: expect.objectContaining({
            user1: expect.objectContaining({
              displayName: 'User 1',
              email: 'user1@example.com',
            }),
            user2: expect.objectContaining({
              displayName: 'User 2',
              email: 'user2@example.com',
            }),
          }),
        })
      );
    });

    it('should handle users without display names', async () => {
      mockGetDocs.mockResolvedValueOnce({ docs: [] });
      mockAddDoc.mockResolvedValueOnce({ id: 'newChatRoom789' });

      const chatRoomId = await getOrCreateChatRoom(
        'user1',
        'user2',
        { email: 'user1@example.com' },
        { email: 'user2@example.com' }
      );

      expect(chatRoomId).toBe('newChatRoom789');
      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          participantDetails: expect.objectContaining({
            user1: expect.objectContaining({
              displayName: 'user1@example.com',
            }),
            user2: expect.objectContaining({
              displayName: 'user2@example.com',
            }),
          }),
        })
      );
    });

    it('should handle users with empty display names', async () => {
      mockGetDocs.mockResolvedValueOnce({ docs: [] });
      mockAddDoc.mockResolvedValueOnce({ id: 'newChatRoom' });

      const chatRoomId = await getOrCreateChatRoom(
        'user1',
        'user2',
        { displayName: '   ', email: 'user1@example.com' },
        { displayName: '', email: 'user2@example.com' }
      );

      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          participantDetails: expect.objectContaining({
            user1: expect.objectContaining({
              displayName: 'user1@example.com',
            }),
            user2: expect.objectContaining({
              displayName: 'user2@example.com',
            }),
          }),
        })
      );
    });
  });

  describe('sendMessage', () => {
    it('should send message and update chat room', async () => {
      mockAddDoc.mockResolvedValueOnce(undefined);
      mockUpdateDoc.mockResolvedValueOnce(undefined);

      const message: Omit<Message, '_id'> = {
        text: 'Hello!',
        createdAt: new Date(),
        user: {
          _id: 'user1',
          name: 'User 1',
        },
        chatRoomId: 'chatRoom123',
      };

      await sendMessage('chatRoom123', message);

      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          text: 'Hello!',
          chatRoomId: 'chatRoom123',
        })
      );

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          lastMessage: 'Hello!',
        })
      );
    });

    it('should throw error when message sending fails', async () => {
      mockAddDoc.mockRejectedValueOnce(new Error('Firestore error'));

      const message: Omit<Message, '_id'> = {
        text: 'Hello!',
        createdAt: new Date(),
        user: { _id: 'user1', name: 'User 1' },
        chatRoomId: 'chatRoom123',
      };

      await expect(sendMessage('chatRoom123', message)).rejects.toThrow();
    });

    it('should handle long messages', async () => {
      mockAddDoc.mockResolvedValueOnce(undefined);
      mockUpdateDoc.mockResolvedValueOnce(undefined);

      const longText = 'A'.repeat(1000);
      const message: Omit<Message, '_id'> = {
        text: longText,
        createdAt: new Date(),
        user: { _id: 'user1', name: 'User 1' },
        chatRoomId: 'chatRoom123',
      };

      await sendMessage('chatRoom123', message);

      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          text: longText,
        })
      );
    });
  });

  describe('subscribeToMessages', () => {
    it('should subscribe to messages and call callback', () => {
      const mockCallback = jest.fn();
      const mockMessages = [
        {
          id: 'msg1',
          text: 'Hello',
          createdAt: { toDate: () => new Date('2024-01-01T10:00:00') },
          user: { _id: 'user1', name: 'User 1' },
          chatRoomId: 'chatRoom123',
        },
      ];

      mockOnSnapshot.mockImplementation((query, callback) => {
        callback({
          docs: mockMessages.map((msg) => ({
            id: msg.id,
            data: () => msg,
          })),
        });
        return jest.fn(); // unsubscribe
      });

      const unsubscribe = subscribeToMessages('chatRoom123', mockCallback);

      expect(mockCallback).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');
    });

    it('should sort messages by createdAt in descending order', () => {
      const mockCallback = jest.fn();
      const mockMessages = [
        {
          id: 'msg1',
          text: 'First',
          createdAt: { toDate: () => new Date('2024-01-01T09:00:00') },
          user: { _id: 'user1' },
          chatRoomId: 'chatRoom123',
        },
        {
          id: 'msg2',
          text: 'Second',
          createdAt: { toDate: () => new Date('2024-01-01T10:00:00') },
          user: { _id: 'user2' },
          chatRoomId: 'chatRoom123',
        },
      ];

      mockOnSnapshot.mockImplementation((query, callback) => {
        callback({
          docs: mockMessages.map((msg) => ({
            id: msg.id,
            data: () => msg,
          })),
        });
        return jest.fn();
      });

      subscribeToMessages('chatRoom123', mockCallback);

      const calledMessages = mockCallback.mock.calls[0][0];
      expect(calledMessages[0].text).toBe('Second');
      expect(calledMessages[1].text).toBe('First');
    });
  });

  describe('subscribeToUserChats', () => {
    it('should subscribe to user chats and call callback', () => {
      const mockCallback = jest.fn();
      const mockChats = [
        {
          id: 'chatRoom1',
          participants: ['user1', 'user2'],
          lastMessage: 'Hello',
          lastMessageTime: { toDate: () => new Date('2024-01-01') },
          participantDetails: {
            user2: {
              displayName: 'User 2',
              email: 'user2@example.com',
              photoURL: 'https://example.com/photo.jpg',
            },
          },
        },
      ];

      mockOnSnapshot.mockImplementation((query, callback) => {
        callback({
          docs: mockChats.map((chat) => ({
            id: chat.id,
            data: () => chat,
          })),
        });
        return jest.fn();
      });

      const unsubscribe = subscribeToUserChats('user1', mockCallback);

      expect(mockCallback).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');
    });

    it('should handle chats with Unknown User', async () => {
      const mockCallback = jest.fn();
      const mockChats = [
        {
          id: 'chatRoom1',
          participants: ['user1', 'user2'],
          lastMessage: 'Hello',
          lastMessageTime: { toDate: () => new Date('2024-01-01') },
          participantDetails: {
            user2: {
              displayName: '',
              email: '',
            },
          },
        },
      ];

      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          displayName: 'Resolved User',
          email: 'user2@example.com',
        }),
      });

      mockOnSnapshot.mockImplementation((query, callback) => {
        callback({
          docs: mockChats.map((chat) => ({
            id: chat.id,
            data: () => chat,
          })),
        });
        return jest.fn();
      });

      subscribeToUserChats('user1', mockCallback);

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 100));
    });
  });

  describe('getAllUsers', () => {
    it('should return all users except current user', async () => {
      const mockUsers = [
        { id: 'user1', displayName: 'User 1', email: 'user1@example.com' },
        { id: 'user2', displayName: 'User 2', email: 'user2@example.com' },
        { id: 'user3', displayName: 'User 3', email: 'user3@example.com' },
      ];

      mockGetDocs.mockResolvedValueOnce({
        docs: mockUsers.map((user) => ({
          id: user.id,
          data: () => user,
        })),
      });

      const users = await getAllUsers('user1');

      expect(users.length).toBe(2);
      expect(users.find((u) => u.uid === 'user1')).toBeUndefined();
      expect(users.find((u) => u.uid === 'user2')).toBeDefined();
      expect(users.find((u) => u.uid === 'user3')).toBeDefined();
    });

    it('should handle empty display names', async () => {
      const mockUsers = [
        { id: 'user1', displayName: '  ', email: 'user1@example.com' },
        { id: 'user2', displayName: '', email: 'user2@example.com' },
      ];

      mockGetDocs.mockResolvedValueOnce({
        docs: mockUsers.map((user) => ({
          id: user.id,
          data: () => user,
        })),
      });

      const users = await getAllUsers('user3');

      expect(users[0].displayName).toBeUndefined();
      expect(users[1].displayName).toBeUndefined();
    });

    it('should return empty array when no users exist', async () => {
      mockGetDocs.mockResolvedValueOnce({ docs: [] });

      const users = await getAllUsers('user1');

      expect(users).toEqual([]);
    });
  });

  describe('Edge cases', () => {
    it('should handle rapid message sending', async () => {
      mockAddDoc.mockResolvedValue(undefined);
      mockUpdateDoc.mockResolvedValue(undefined);

      const messages = Array.from({ length: 10 }, (_, i) => ({
        text: `Message ${i}`,
        createdAt: new Date(),
        user: { _id: 'user1', name: 'User 1' },
        chatRoomId: 'chatRoom123',
      }));

      await Promise.all(messages.map((msg) => sendMessage('chatRoom123', msg)));

      expect(mockAddDoc).toHaveBeenCalledTimes(10);
      expect(mockUpdateDoc).toHaveBeenCalledTimes(10);
    });
  });
});
