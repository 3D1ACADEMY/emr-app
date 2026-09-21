import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  AppState,
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { COLORS, SIZES, SPACING, SHADOWS } from '../constants/theme';
import { hasSetPin, setPin, validatePin } from '../utils/secureStorage';

const AUTO_LOCK_MS = 60 * 1000; // 60 seconds

export default function SecurityGate({ children }) {
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinSetupMode, setPinSetupMode] = useState(false);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [biometricType, setBiometricType] = useState(null);
  const lastActiveRef = useRef(Date.now());
  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    checkSecurity();

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        const awayTime = Date.now() - lastActiveRef.current;
        if (awayTime > AUTO_LOCK_MS) {
          setIsAuthenticated(false);
          setPin('');
          setError('');
        }
      }
      if (nextAppState === 'active') {
        lastActiveRef.current = Date.now();
      }
      appStateRef.current = nextAppState;
    });

    return () => subscription.remove();
  }, []);

  const checkSecurity = async () => {
    const hardware = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();

    if (hardware && enrolled) {
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        setBiometricType('Face ID');
      } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        setBiometricType('Touch ID');
      } else {
        setBiometricType('Biometric');
      }
      // Attempt biometric immediately
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access EMR',
        fallbackLabel: 'Use PIN',
        disableDeviceFallback: true,
      });
      if (result.success) {
        setIsAuthenticated(true);
      } else {
        // If no PIN set, enter setup. Otherwise enter PIN unlock.
        const pinExists = await hasSetPin();
        if (!pinExists) {
          setPinSetupMode(true);
        }
      }
    } else {
      // No biometric: require PIN setup or unlock
      const pinExists = await hasSetPin();
      if (!pinExists) {
        setPinSetupMode(true);
      }
    }
    setIsReady(true);
  };

  const handleSetupPin = async () => {
    setError('');
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      setError('PIN must be exactly 4 digits.');
      return;
    }
    if (pin !== confirmPin) {
      setError('PINs do not match.');
      return;
    }
    try {
      await setPin(pin);
      setIsAuthenticated(true);
    } catch (e) {
      console.error('PIN setup error:', e);
      setError('Could not save PIN. Check device security settings.');
    }
  };

  const handleUnlockPin = async () => {
    setError('');
    if (pin.length !== 4) {
      setError('Enter 4-digit PIN.');
      return;
    }
    try {
      const valid = await validatePin(pin);
      if (valid) {
        setIsAuthenticated(true);
      } else {
        setError('Incorrect PIN.');
        setPin('');
      }
    } catch (e) {
      console.error('PIN unlock error:', e);
      setError('Could not verify PIN. Try again.');
    }
  };

  const retryBiometric = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to access EMR',
      fallbackLabel: 'Use PIN',
      disableDeviceFallback: true,
    });
    if (result.success) {
      setIsAuthenticated(true);
    }
  };

  if (!isReady) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.gold} />
      </View>
    );
  }

  if (isAuthenticated) {
    return children;
  }

  return (
    <View style={styles.container}>
      <View style={styles.lockIconCircle}>
        <Text style={styles.lockIcon}>🔒</Text>
      </View>
      <Text style={styles.title}>EMR is Locked</Text>
      <Text style={styles.subtitle}>
        {biometricType
          ? `${biometricType} failed. Unlock with your PIN.`
          : 'Secure access required.'}
      </Text>

      {pinSetupMode ? (
        <View style={styles.form}>
          <Text style={styles.label}>Create 4-digit PIN</Text>
          <TextInput
            style={styles.pinInput}
            value={pin}
            onChangeText={(text) => setPin(text.replace(/[^0-9]/g, '').slice(0, 4))}
            keyboardType="number-pad"
            maxLength={4}
            secureTextEntry
            placeholder="----"
            placeholderTextColor={COLORS.textMuted}
          />
          <Text style={styles.label}>Confirm PIN</Text>
          <TextInput
            style={styles.pinInput}
            value={confirmPin}
            onChangeText={(text) => setConfirmPin(text.replace(/[^0-9]/g, '').slice(0, 4))}
            keyboardType="number-pad"
            maxLength={4}
            secureTextEntry
            placeholder="----"
            placeholderTextColor={COLORS.textMuted}
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <TouchableOpacity style={styles.actionButton} onPress={handleSetupPin}>
            <Text style={styles.actionButtonText}>Set PIN</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.form}>
          <Text style={styles.label}>Enter PIN</Text>
          <TextInput
            style={styles.pinInput}
            value={pin}
            onChangeText={(text) => setPin(text.replace(/[^0-9]/g, '').slice(0, 4))}
            keyboardType="number-pad"
            maxLength={4}
            secureTextEntry
            placeholder="----"
            placeholderTextColor={COLORS.textMuted}
            autoFocus
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <TouchableOpacity style={styles.actionButton} onPress={handleUnlockPin}>
            <Text style={styles.actionButtonText}>Unlock</Text>
          </TouchableOpacity>
          {biometricType && (
            <TouchableOpacity style={styles.secondaryButton} onPress={retryBiometric}>
              <Text style={styles.secondaryButtonText}>Retry {biometricType}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  lockIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${COLORS.gold}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  lockIcon: {
    fontSize: 36,
  },
  title: {
    color: COLORS.text,
    fontSize: SIZES.xxl,
    fontWeight: '800',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: SIZES.md,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  form: {
    width: '100%',
    maxWidth: 320,
  },
  label: {
    color: COLORS.textMuted,
    fontSize: SIZES.sm,
    marginBottom: SPACING.sm,
    fontWeight: '600',
  },
  pinInput: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    color: COLORS.text,
    fontSize: SIZES.xxl,
    textAlign: 'center',
    letterSpacing: 12,
    marginBottom: SPACING.lg,
  },
  errorText: {
    color: COLORS.danger,
    textAlign: 'center',
    marginBottom: SPACING.base,
    fontSize: SIZES.md,
  },
  actionButton: {
    backgroundColor: COLORS.gold,
    borderRadius: 12,
    padding: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  actionButtonText: {
    color: COLORS.textInverse,
    fontSize: SIZES.lg,
    fontWeight: '800',
  },
  secondaryButton: {
    marginTop: SPACING.base,
    padding: SPACING.base,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: COLORS.gold,
    fontSize: SIZES.md,
    fontWeight: '700',
  },
});
