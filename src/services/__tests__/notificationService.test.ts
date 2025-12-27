import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import {
  registerForPushNotificationsAsync,
  schedulePushNotification,
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
} from '../notificationService';

// Mock expo-notifications
jest.mock('expo-notifications');
jest.mock('expo-device');

describe('NotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerForPushNotificationsAsync', () => {
    it('should register for push notifications on physical device', async () => {
      (Device.isDevice as any) = true;
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'granted',
      });
      (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValueOnce({
        data: 'ExponentPushToken[xxxxxx]',
      });
      (Notifications.setNotificationChannelAsync as jest.Mock).mockResolvedValueOnce(null);

      const token = await registerForPushNotificationsAsync();

      expect(token).toBe('ExponentPushToken[xxxxxx]');
      expect(Notifications.getPermissionsAsync).toHaveBeenCalled();
      expect(Notifications.getExpoPushTokenAsync).toHaveBeenCalled();
    });

    it('should request permissions if not granted', async () => {
      (Device.isDevice as any) = true;
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'undetermined',
      });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'granted',
      });
      (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValueOnce({
        data: 'ExponentPushToken[xxxxxx]',
      });

      const token = await registerForPushNotificationsAsync();

      expect(token).toBe('ExponentPushToken[xxxxxx]');
      expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
    });

    it('should alert when permissions are denied', async () => {
      global.alert = jest.fn();
      (Device.isDevice as any) = true;
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'denied',
      });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'denied',
      });

      const token = await registerForPushNotificationsAsync();

      expect(token).toBeUndefined();
      expect(global.alert).toHaveBeenCalledWith(
        'Failed to get push token for push notification!'
      );
    });

    it('should alert on non-physical device', async () => {
      global.alert = jest.fn();
      (Device.isDevice as any) = false;

      const token = await registerForPushNotificationsAsync();

      expect(token).toBeUndefined();
      expect(global.alert).toHaveBeenCalledWith(
        'Must use physical device for Push Notifications'
      );
    });

    it('should setup Android notification channel on Android', async () => {
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', {
        value: 'android',
      });

      (Device.isDevice as any) = true;
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'granted',
      });
      (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValueOnce({
        data: 'ExponentPushToken[xxxxxx]',
      });
      (Notifications.setNotificationChannelAsync as jest.Mock).mockResolvedValueOnce(null);

      // Mock Platform.OS
      jest.mock('react-native/Libraries/Utilities/Platform', () => ({
        OS: 'android',
      }));

      await registerForPushNotificationsAsync();

      Object.defineProperty(process, 'platform', {
        value: originalPlatform,
      });
    });

    it('should handle token retrieval errors', async () => {
      (Device.isDevice as any) = true;
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'granted',
      });
      (Notifications.getExpoPushTokenAsync as jest.Mock).mockRejectedValueOnce(
        new Error('Token error')
      );

      await expect(registerForPushNotificationsAsync()).rejects.toThrow('Token error');
    });
  });

  describe('schedulePushNotification', () => {
    it('should schedule notification with correct parameters', async () => {
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValueOnce(
        'notification-id'
      );

      await schedulePushNotification('Test Title', 'Test Body');

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: 'Test Title',
          body: 'Test Body',
          sound: 'default',
        },
        trigger: null,
      });
    });

    it('should schedule notification immediately', async () => {
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValueOnce(
        'notification-id'
      );

      await schedulePushNotification('Title', 'Body');

      const call = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0][0];
      expect(call.trigger).toBeNull();
    });

    it('should handle scheduling errors', async () => {
      (Notifications.scheduleNotificationAsync as jest.Mock).mockRejectedValueOnce(
        new Error('Scheduling error')
      );

      await expect(
        schedulePushNotification('Title', 'Body')
      ).rejects.toThrow('Scheduling error');
    });

    it('should handle empty title and body', async () => {
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValueOnce(
        'notification-id'
      );

      await schedulePushNotification('', '');

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: '',
          body: '',
          sound: 'default',
        },
        trigger: null,
      });
    });

    it('should handle long text in notifications', async () => {
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValueOnce(
        'notification-id'
      );

      const longTitle = 'A'.repeat(100);
      const longBody = 'B'.repeat(500);

      await schedulePushNotification(longTitle, longBody);

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: longTitle,
          body: longBody,
          sound: 'default',
        },
        trigger: null,
      });
    });

    it('should handle special characters', async () => {
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValueOnce(
        'notification-id'
      );

      await schedulePushNotification(
        'Title with 🎉 emoji',
        'Body with <html> & "quotes"'
      );

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
    });
  });

  describe('addNotificationReceivedListener', () => {
    it('should add notification received listener', () => {
      const mockCallback = jest.fn();
      const mockSubscription = { remove: jest.fn() };

      (Notifications.addNotificationReceivedListener as jest.Mock).mockReturnValueOnce(
        mockSubscription
      );

      const subscription = addNotificationReceivedListener(mockCallback);

      expect(Notifications.addNotificationReceivedListener).toHaveBeenCalledWith(
        mockCallback
      );
      expect(subscription).toBe(mockSubscription);
    });

    it('should return subscription with remove method', () => {
      const mockCallback = jest.fn();
      const mockSubscription = { remove: jest.fn() };

      (Notifications.addNotificationReceivedListener as jest.Mock).mockReturnValueOnce(
        mockSubscription
      );

      const subscription = addNotificationReceivedListener(mockCallback);

      expect(subscription.remove).toBeDefined();
      expect(typeof subscription.remove).toBe('function');
    });
  });

  describe('addNotificationResponseReceivedListener', () => {
    it('should add notification response received listener', () => {
      const mockCallback = jest.fn();
      const mockSubscription = { remove: jest.fn() };

      (Notifications.addNotificationResponseReceivedListener as jest.Mock).mockReturnValueOnce(
        mockSubscription
      );

      const subscription = addNotificationResponseReceivedListener(mockCallback);

      expect(Notifications.addNotificationResponseReceivedListener).toHaveBeenCalledWith(
        mockCallback
      );
      expect(subscription).toBe(mockSubscription);
    });

    it('should return subscription with remove method', () => {
      const mockCallback = jest.fn();
      const mockSubscription = { remove: jest.fn() };

      (Notifications.addNotificationResponseReceivedListener as jest.Mock).mockReturnValueOnce(
        mockSubscription
      );

      const subscription = addNotificationResponseReceivedListener(mockCallback);

      expect(subscription.remove).toBeDefined();
      expect(typeof subscription.remove).toBe('function');
    });
  });

  describe('Notification handler configuration', () => {
    it('should have notification handler set', () => {
      expect(Notifications.setNotificationHandler).toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    it('should handle multiple notification schedules', async () => {
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue(
        'notification-id'
      );

      const notifications = [
        schedulePushNotification('Title 1', 'Body 1'),
        schedulePushNotification('Title 2', 'Body 2'),
        schedulePushNotification('Title 3', 'Body 3'),
      ];

      await Promise.all(notifications);

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(3);
    });

    it('should handle multiple listeners', () => {
      const mockSubscription = { remove: jest.fn() };
      (Notifications.addNotificationReceivedListener as jest.Mock).mockReturnValue(
        mockSubscription
      );

      const listener1 = addNotificationReceivedListener(jest.fn());
      const listener2 = addNotificationReceivedListener(jest.fn());
      const listener3 = addNotificationReceivedListener(jest.fn());

      expect(Notifications.addNotificationReceivedListener).toHaveBeenCalledTimes(3);
    });
  });
});
