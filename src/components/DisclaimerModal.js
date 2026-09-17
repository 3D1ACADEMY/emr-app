import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { COLORS, SIZES, SPACING, SHADOWS } from '../constants/theme';
import { hasAcceptedDisclaimer, setDisclaimerAccepted } from '../utils/secureStorage';

const DEFAULT_DISCLAIMER = `CLINICAL EMERGENCY MANAGEMENT SYSTEM (CEMS)

This application is an educational and clinical decision-support tool for licensed aesthetic medical professionals. It is not a substitute for professional medical judgment, training, or emergency services.

By using this app, you acknowledge and agree that:

1. The protocols, calculators, and recommendations provided are based on commonly accepted aesthetic medicine emergency practices but may not reflect every clinical scenario.

2. In any life-threatening or uncertain emergency, you must contact emergency medical services (EMS) and follow your local institutional protocols.

3. The developer (3D Rejuvenation Academy / Dr. Amr Ismail, MD) is not liable for patient outcomes, clinical decisions, or actions taken based on information in this app.

4. All patient information entered into this app is stored locally on your device using encryption. You are responsible for maintaining device security and compliance with applicable privacy laws (HIPAA, GDPR, etc.).

5. This app does not sell products or provide medical advice. It is for educational and professional reference only.

Tap "I Agree" only if you are a qualified medical professional and accept full responsibility for clinical decisions.`;

export default function DisclaimerModal({ disclaimerText = DEFAULT_DISCLAIMER }) {
  const [visible, setVisible] = useState(false);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    checkDisclaimer();
  }, []);

  const checkDisclaimer = async () => {
    const accepted = await hasAcceptedDisclaimer();
    if (!accepted) {
      setVisible(true);
    }
  };

  const handleAgree = async () => {
    if (!agreed) return;
    await setDisclaimerAccepted(true);
    setVisible(false);
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={() => {}}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.badge}>Medico-Legal Disclaimer</Text>
          <Text style={styles.title}>Before You Begin</Text>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <View style={styles.card}>
            <Text style={styles.disclaimerText}>{disclaimerText}</Text>
          </View>

          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setAgreed(!agreed)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
              {agreed && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>
              I am a qualified medical professional. I have read, understood, and agree to the terms above.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.agreeButton, !agreed && styles.agreeButtonDisabled]}
            onPress={handleAgree}
            disabled={!agreed}
            activeOpacity={0.8}
          >
            <Text style={styles.agreeButtonText}>I Agree</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  badge: {
    backgroundColor: COLORS.danger,
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: SIZES.xs,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.base,
    overflow: 'hidden',
  },
  title: {
    color: COLORS.text,
    fontSize: SIZES.xxl,
    fontWeight: '800',
    textAlign: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  disclaimerText: {
    color: COLORS.textMuted,
    fontSize: SIZES.md,
    lineHeight: 22,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.gold,
    marginRight: SPACING.base,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.gold,
  },
  checkmark: {
    color: COLORS.textInverse,
    fontWeight: '800',
    fontSize: SIZES.md,
  },
  checkboxLabel: {
    flex: 1,
    color: COLORS.text,
    fontSize: SIZES.md,
    lineHeight: 22,
  },
  agreeButton: {
    backgroundColor: COLORS.gold,
    borderRadius: 12,
    padding: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  agreeButtonDisabled: {
    backgroundColor: COLORS.surface,
  },
  agreeButtonText: {
    color: COLORS.textInverse,
    fontSize: SIZES.lg,
    fontWeight: '800',
  },
});
