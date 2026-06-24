import Toast from 'react-native-toast-message';

export function showToast(type: 'success' | 'error' | 'info', message: string): void {
  Toast.show({
    type,
    text1: message,
    visibilityTime: type === 'error' ? 4000 : 2500,
    position: 'top',
  });
}
