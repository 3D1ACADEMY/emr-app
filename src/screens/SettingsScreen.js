import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';
import * as LocalAuthentication from 'expo-local-authentication';
import { COLORS, SIZES, SPACING } from '../constants/theme';
import { storage } from '../utils/storage';
import { hasSetPin, validatePin, setPin } from '../utils/secureStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const BIOMETRIC_ENABLED_KEY = 'cems_biometric_enabled';

export default function SettingsScreen({ navigation }) {
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [pinStep, setPinStep] = useState('current'); // current | new | confirm
  const [pinInput, setPinInput] = useState('');
  const [pendingPin, setPendingPin] = useState('');

  useEffect(() => {
    checkBiometric();
    loadBiometricPref();
  }, []);

  const checkBiometric = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    setBiometricAvailable(compatible);
  };

  const loadBiometricPref = async () => {
    try {
      const val = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
      setBiometricEnabled(val === 'true');
    } catch (e) {
      console.warn('Failed to load biometric pref:', e.message);
    }
  };

  const toggleBiometric = async (value) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setBiometricEnabled(value);
    await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, value ? 'true' : 'false');
  };

  const clearAllData = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Clear All App Data',
      'This will permanently delete all patients, incidents, audio notes, photos, and settings. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Everything',
          style: 'destructive',
          onPress: async () => {
            try {
              await storage.clearAll();
              await AsyncStorage.clear();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert('Data Cleared', 'All app data has been removed.');
            } catch (e) {
              Alert.alert('Error', 'Could not clear all data: ' + e.message);
            }
          },
        },
      ]
    );
  };

  const openEmail = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL('mailto:3drejuvenationcode@gmail.com?subject=CEMS%20Support');
  };

  const version = Constants.expoConfig?.version || '1.0.0';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Settings</Text>

        <Section label="Security">
          <SettingItem
            icon="lock-reset"
            label="Change PIN"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setPinStep('current');
              setPinInput('');
              setPendingPin('');
              setPinModalVisible(true);
            }}
          />
          {biometricAvailable && (
            <SettingItem
              icon="fingerprint"
              label="Use Biometric Unlock"
              right={
                <Switch
                  value={biometricEnabled}
                  onValueChange={toggleBiometric}
                  trackColor={{ false: '#334155', true: COLORS.gold }}
                  thumbColor={biometricEnabled ? '#fff' : '#f4f3f4'}
                />
              }
              onPress={() => {}}
            />
          )}
        </Section>

        <Section label="Data">
          <SettingItem
            icon="file-document-outline"
            label="View Disclaimer"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate('Disclaimer', { viewOnly: true });
            }}
          />
          <SettingItem
            icon="delete-forever"
            label="Clear All App Data"
            danger
            onPress={clearAllData}
          />
        </Section>

        <Section label="Support">
          <SettingItem
            icon="email-outline"
            label="Contact Support"
            value="3drejuvenationcode@gmail.com"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          />
          <SettingItem
            icon="information-outline"
            label="Version"
            value={version}
            onPress={() => {}}
          />
        </Section>
      </ScrollView>

      {pinModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>
              {pinStep === 'current' && 'Enter Current PIN'}
              {pinStep === 'new' && 'Enter New PIN'}
              {pinStep === 'confirm' && 'Confirm New PIN'}
            </Text>
            <Text style={styles.pinDisplay}>{pinInput.replace(/./g, '•')}</Text>
            <View style={styles.keypad}>
              {[1,2,3,4,5,6,7,8,9].map((n) => (
                <PinButton key={n} value={n} onPress={() => {
   Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
   if (pinInput.length < 4) setPinInput(pinInput + n);
 }} />
              ))}
              <View style={styles.keypadEmpty} />
              <PinButton value={0} onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                if (pinInput.length < 4) setPinInput(pinInput + '0');
              }} />
              <TouchableOpacity
                style={styles.keypadButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setPinInput(pinInput.slice(0, -1));
                }}
              >
                <Icon name="backspace-outline" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setPinModalVisible(false);
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirm}
                onPress={async () => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  if (pinStep === 'current') {
                    const pinExists = await hasSetPin();
                    if (pinExists) {
                      const valid = await validatePin(pinInput);
                      if (!valid) {
                        Alert.alert('Incorrect PIN', 'Please try again.');
                        setPinInput('');
                        return;
                      }
                    }
                    setPinStep('new');
                    setPinInput('');
                  } else if (pinStep === 'new') {
                    if (pinInput.length !== 4 || !/^\d{4}$/.test(pinInput)) {
                      Alert.alert('Invalid PIN', 'PIN must be exactly 4 digits.');
                      return;
                    }
                    setPendingPin(pinInput);
                    setPinStep('confirm');
                    setPinInput('');
                  } else if (pinStep === 'confirm') {
                    if (pinInput !== pendingPin) {
                      Alert.alert('PIN Mismatch', 'New PINs do not match.');
                      setPinStep('new');
                      setPinInput('');
                      return;
                    }
                    try {
                      await setPin(pinInput);
                      setPinModalVisible(false);
                      Alert.alert('PIN Updated', 'Your PIN has been changed.');
                    } catch (e) {
                      Alert.alert('Error', 'Could not update PIN: ' + e.message);
                    }
                  }
                }}
              >
                <Text style={styles.modalConfirmText}>Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

function Section({ label, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

function SettingItem({ icon, label, value, danger, right, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.settingItem, danger && styles.settingItemDanger]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Icon name={icon} size={22} color={danger ? COLORS.danger : COLORS.gold} />
      <View style={styles.settingText}>
        <Text style={[styles.settingLabel, danger && { color: COLORS.danger }]}>{label}</Text>
        {value && <Text style={styles.settingValue}>{value}</Text>}
      </View>
      {right || <Icon name="chevron-right" size={20} color={COLORS.textMuted} />}
    </TouchableOpacity>
  );
}

function PinButton({ value, onPress }) {
  return (
    <TouchableOpacity style={styles.keypadButton} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.keypadButtonText}>{value}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  title: { color: COLORS.text, fontSize: SIZES.xxl, fontWeight: '800', marginBottom: SPACING.lg },
  section: { marginBottom: SPACING.lg },
  sectionLabel: {
    color: COLORS.textMuted,
    fontSize: SIZES.sm,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.sm,
  },
  sectionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingItemDanger: {
    borderBottomWidth: 0,
  },
  settingText: { flex: 1, marginLeft: SPACING.base },
  settingLabel: { color: COLORS.text, fontSize: SIZES.md, fontWeight: '600' },
  settingValue: { color: COLORS.textMuted, fontSize: SIZES.sm, marginTop: 2 },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
    zIndex: 100,
  },
  modal: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalTitle: {
    color: COLORS.gold,
    fontSize: SIZES.lg,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: SPACING.base,
  },
  pinDisplay: {
    color: COLORS.text,
    fontSize: SIZES.xxl,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 8,
    marginBottom: SPACING.lg,
    minHeight: 40,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  keypadButton: {
    width: '30%',
    aspectRatio: 1.4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 10,
    marginBottom: SPACING.sm,
  },
  keypadEmpty: {
    width: '30%',
    aspectRatio: 1.4,
  },
  keypadButtonText: {
    color: COLORS.text,
    fontSize: SIZES.xxl,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.base,
  },
  modalCancel: {
    flex: 1,
    padding: SPACING.base,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  modalCancelText: { color: COLORS.text, fontWeight: '600' },
  modalConfirm: {
    flex: 1,
    padding: SPACING.base,
    borderRadius: 10,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
  },
  modalConfirmText: { color: '#0F2440', fontWeight: '700' },
});
