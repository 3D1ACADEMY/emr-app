import { Linking, Platform, Alert } from 'react-native';

const EMERGENCY_NUMBER = Platform.select({
  ios: 'telprompt:911',
  android: 'tel:911',
});

export async function callEmergencyServices() {
  try {
    const supported = await Linking.canOpenURL(EMERGENCY_NUMBER);
    if (!supported) {
      Alert.alert('Emergency Call', 'Could not open the phone app.');
      return;
    }
    await Linking.openURL(EMERGENCY_NUMBER);
  } catch (e) {
    Alert.alert('Emergency Call Failed', e?.message || 'Could not initiate call.');
  }
}

export function confirmEmergencyCall() {
  Alert.alert(
    'Emergency Services',
    'Call 911 (or your local emergency number)?',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call Now', style: 'destructive', onPress: callEmergencyServices },
    ]
  );
}
