import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SIZES, SPACING, SHADOWS } from '../constants/theme';
import { isContentUnlocked, validateUnlockCode, getStoredUnlockCode } from '../utils/secureStorage';

export default function PremiumContentGate({
  children,
  fallback,
  title = 'Premium Content',
  description = 'Unlock advanced clinical protocols with your course code.',
}) {
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [storedCode, setStoredCode] = useState(null);

  const checkUnlock = useCallback(async () => {
    const status = await isContentUnlocked();
    const saved = await getStoredUnlockCode();
    setUnlocked(status);
    setStoredCode(saved);
    setLoading(false);
  }, []);

  useEffect(() => {
    checkUnlock();
  }, [checkUnlock]);

  const handleSubmit = async () => {
    setError('');
    if (!code.trim()) {
      setError('Enter an unlock code.');
      return;
    }
    const valid = await validateUnlockCode(code);
    if (valid) {
      setUnlocked(true);
      setStoredCode(code.trim().toUpperCase());
      setShowModal(false);
      setCode('');
    } else {
      setError('Invalid code. Check your course materials.');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>Checking access...</Text>
      </View>
    );
  }

  if (unlocked) {
    return (
      <View style={styles.container}>
        {children}
        {storedCode && (
          <View style={styles.badgeRow}>
            <Icon name="lock-open" size={14} color={COLORS.gold} />
            <Text style={styles.unlockedText}>Unlocked: {storedCode}</Text>
          </View>
        )}
      </View>
    );
  }

  if (fallback) {
    return (
      <View style={styles.container}>
        {fallback}
        <TouchableOpacity
          style={styles.unlockButton}
          onPress={() => setShowModal(true)}
          activeOpacity={0.8}
        >
          <Icon name="lock-open" size={20} color={COLORS.textInverse} />
          <Text style={styles.unlockButtonText}>Unlock Advanced Content</Text>
        </TouchableOpacity>

        <Modal
          animationType="slide"
          transparent
          visible={showModal}
          onRequestClose={() => setShowModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>{title}</Text>
              <Text style={styles.modalDescription}>{description}</Text>

              <TextInput
                style={styles.codeInput}
                value={code}
                onChangeText={(text) => setCode(text.toUpperCase())}
                placeholder="Enter code"
                placeholderTextColor={COLORS.textMuted}
                autoCapitalize="characters"
                autoCorrect={false}
              />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>Unlock</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => { setShowModal(false); setError(''); setCode(''); }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // Default locked screen if no fallback provided
  return (
    <View style={styles.centered}>
      <Icon name="lock" size={48} color={COLORS.gold} />
      <Text style={styles.lockedTitle}>{title}</Text>
      <Text style={styles.lockedText}>{description}</Text>

      <TouchableOpacity
        style={styles.unlockButton}
        onPress={() => setShowModal(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.unlockButtonText}>Enter Unlock Code</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{title}</Text>
            <Text style={styles.modalDescription}>{description}</Text>

            <TextInput
              style={styles.codeInput}
              value={code}
              onChangeText={(text) => setCode(text.toUpperCase())}
              placeholder="Enter code"
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>Unlock</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => { setShowModal(false); setError(''); setCode(''); }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    color: COLORS.textMuted,
    fontSize: SIZES.md,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.sm,
    backgroundColor: `${COLORS.gold}15`,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  unlockedText: {
    color: COLORS.gold,
    fontSize: SIZES.sm,
    fontWeight: '700',
    marginLeft: SPACING.sm,
  },
  lockedTitle: {
    color: COLORS.text,
    fontSize: SIZES.xl,
    fontWeight: '800',
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  lockedText: {
    color: COLORS.textMuted,
    fontSize: SIZES.md,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  unlockButton: {
    backgroundColor: COLORS.gold,
    borderRadius: 12,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium,
  },
  unlockButtonText: {
    color: COLORS.textInverse,
    fontSize: SIZES.md,
    fontWeight: '800',
    marginLeft: SPACING.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.large,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: SIZES.xl,
    fontWeight: '800',
    marginBottom: SPACING.sm,
  },
  modalDescription: {
    color: COLORS.textMuted,
    fontSize: SIZES.md,
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  codeInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    padding: SPACING.base,
    color: COLORS.text,
    fontSize: SIZES.lg,
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: SPACING.base,
  },
  errorText: {
    color: COLORS.danger,
    textAlign: 'center',
    marginBottom: SPACING.base,
    fontSize: SIZES.md,
  },
  submitButton: {
    backgroundColor: COLORS.gold,
    borderRadius: 10,
    padding: SPACING.base,
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  submitButtonText: {
    color: COLORS.textInverse,
    fontSize: SIZES.md,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  cancelButton: {
    padding: SPACING.base,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: COLORS.textMuted,
    fontSize: SIZES.md,
    fontWeight: '600',
  },
});
