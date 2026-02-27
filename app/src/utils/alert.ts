import { Alert, Platform } from 'react-native';

/**
 * Cross-platform alert — Alert.alert() is a no-op on web.
 * Uses window.alert/confirm on web, Alert.alert on native.
 */
export function showAlert(title: string, message: string, onOk?: () => void) {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
    onOk?.();
  } else {
    Alert.alert(title, message, onOk ? [{ text: 'OK', onPress: onOk }] : undefined);
  }
}

/**
 * Cross-platform confirm dialog.
 * Returns true if user confirmed, false if cancelled.
 */
export function showConfirm(
  title: string,
  message: string,
  onConfirm: () => void,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) {
      onConfirm();
    }
  } else {
    Alert.alert(title, message, [
      { text: cancelText, style: 'cancel' },
      { text: confirmText, onPress: onConfirm, style: 'destructive' },
    ]);
  }
}
