import Toast from 'react-native-toast-message';

// Success toast
export function showSuccessToast(message: string, position: 'top' | 'bottom' = 'top') {
  Toast.show({
    type: 'success',
    text1: message,
    position,
    visibilityTime: 3000,
    autoHide: true,
  });
}

// Error toast
export function showErrorToast(message: string, position: 'top' | 'bottom' = 'top') {
  Toast.show({
    type: 'error',
    text1: message,
    position,
    visibilityTime: 3000,
    autoHide: true,
  });
}

// Info toast
export function showInfoToast(message: string, position: 'top' | 'bottom' = 'top') {
  Toast.show({
    type: 'info',
    text1: message,
    position,
    visibilityTime: 3000,
    autoHide: true,
  });
}