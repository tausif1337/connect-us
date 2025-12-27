import Toast from 'react-native-toast-message';
import { showSuccessToast, showErrorToast, showInfoToast } from '../toastHelper';

// Mock the Toast module
jest.mock('react-native-toast-message');

describe('Toast Helper Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('showSuccessToast', () => {
    it('should call Toast.show with success type and default position', () => {
      const message = 'Success message';
      showSuccessToast(message);

      expect(Toast.show).toHaveBeenCalledWith({
        type: 'success',
        text1: message,
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
      });
    });

    it('should call Toast.show with custom position', () => {
      const message = 'Success at bottom';
      showSuccessToast(message, 'bottom');

      expect(Toast.show).toHaveBeenCalledWith({
        type: 'success',
        text1: message,
        position: 'bottom',
        visibilityTime: 3000,
        autoHide: true,
      });
    });

    it('should handle empty message', () => {
      showSuccessToast('');

      expect(Toast.show).toHaveBeenCalledWith({
        type: 'success',
        text1: '',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
      });
    });

    it('should handle long messages', () => {
      const longMessage = 'A'.repeat(200);
      showSuccessToast(longMessage);

      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'success',
          text1: longMessage,
        })
      );
    });
  });

  describe('showErrorToast', () => {
    it('should call Toast.show with error type and default position', () => {
      const message = 'Error message';
      showErrorToast(message);

      expect(Toast.show).toHaveBeenCalledWith({
        type: 'error',
        text1: message,
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
      });
    });

    it('should call Toast.show with custom position', () => {
      const message = 'Error at bottom';
      showErrorToast(message, 'bottom');

      expect(Toast.show).toHaveBeenCalledWith({
        type: 'error',
        text1: message,
        position: 'bottom',
        visibilityTime: 3000,
        autoHide: true,
      });
    });

    it('should handle network error messages', () => {
      const errorMsg = 'Network request failed';
      showErrorToast(errorMsg);

      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          text1: errorMsg,
        })
      );
    });
  });

  describe('showInfoToast', () => {
    it('should call Toast.show with info type and default position', () => {
      const message = 'Info message';
      showInfoToast(message);

      expect(Toast.show).toHaveBeenCalledWith({
        type: 'info',
        text1: message,
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
      });
    });

    it('should call Toast.show with custom position', () => {
      const message = 'Info at bottom';
      showInfoToast(message, 'bottom');

      expect(Toast.show).toHaveBeenCalledWith({
        type: 'info',
        text1: message,
        position: 'bottom',
        visibilityTime: 3000,
        autoHide: true,
      });
    });

    it('should handle special characters in message', () => {
      const message = 'Info: <test> & "quotes" with \\slashes\\';
      showInfoToast(message);

      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'info',
          text1: message,
        })
      );
    });
  });

  describe('Toast configuration', () => {
    it('should always use 3000ms visibility time', () => {
      showSuccessToast('Test');
      showErrorToast('Test');
      showInfoToast('Test');

      expect(Toast.show).toHaveBeenCalledTimes(3);
      
      const calls = (Toast.show as jest.Mock).mock.calls;
      calls.forEach((call) => {
        expect(call[0].visibilityTime).toBe(3000);
      });
    });

    it('should always have autoHide enabled', () => {
      showSuccessToast('Test');
      showErrorToast('Test');
      showInfoToast('Test');

      const calls = (Toast.show as jest.Mock).mock.calls;
      calls.forEach((call) => {
        expect(call[0].autoHide).toBe(true);
      });
    });
  });

  describe('Multiple toast calls', () => {
    it('should handle multiple sequential toasts', () => {
      showSuccessToast('First');
      showErrorToast('Second');
      showInfoToast('Third');

      expect(Toast.show).toHaveBeenCalledTimes(3);
    });

    it('should handle rapid successive calls', () => {
      for (let i = 0; i < 10; i++) {
        showSuccessToast(`Message ${i}`);
      }

      expect(Toast.show).toHaveBeenCalledTimes(10);
    });
  });
});
