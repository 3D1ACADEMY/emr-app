import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Checkbox, Button, Surface } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES, SPACING } from '../constants/theme';
import { hasAcceptedDisclaimer, setDisclaimerAccepted } from '../utils/secureStorage';

const DEFAULT_DISCLAIMER = `CLINICAL EMERGENCY MANAGEMENT SYSTEM (CEMS)

This application is an educational and clinical decision-support tool for licensed aesthetic medical professionals. It is not a substitute for professional medical judgment, training, or emergency services.

By using this app, you acknowledge and agree that:

1. The protocols, calculators, and recommendations provided are based on commonly accepted aesthetic medicine emergency practices but may not reflect every clinical scenario.

2. In any life-threatening or uncertain emergency, you must contact emergency medical services (EMS) and follow your local institutional protocols.

3. The developer (3D Rejuvenation Academy / Dr. Amr Ismail, MD) is not liable for patient outcomes, clinical decisions, or actions taken based on information in this app.

4. All patient information entered into this app is stored locally on your device using encryption. You are responsible for maintaining device security and compliance with applicable privacy laws (HIPAA, GDPR, etc.).

5. This app does not sell products or provide medical advice. It is for educational and professional reference only.`;

export default function DisclaimerScreen({ navigation, disclaimerText = DEFAULT_DISCLAIMER }) {
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkPreviousAgreement();
  }, []);

  const checkPreviousAgreement = async () => {
    try {
      const hasAgreed = await hasAcceptedDisclaimer();
      if (hasAgreed) {
        console.log('Disclaimer already accepted — bypassing to Home.');
        navigation.replace('Home');
      }
    } catch (error) {
      console.error('Error checking disclaimer agreement:', error);
    }
  };

  const handleAgreePress = async () => {
    if (!agreed) {
      Alert.alert('Action Required', 'Please check the box to agree to the terms.');
      return;
    }

    setLoading(true);
    console.log('I Agree pressed — saving disclaimer acceptance...');

    try {
      await setDisclaimerAccepted(true);
      console.log('Disclaimer acceptance saved to SecureStore.');
      console.log('Navigating to dashboard...');

      // Replace so the user cannot press back to return to the disclaimer.
      navigation.replace('Home');
    } catch (error) {
      console.error('Failed to save disclaimer agreement:', error);
      Alert.alert(
        'Could Not Save Agreement',
        'Please try again. If this keeps happening, check that your device has screen lock / secure storage enabled.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Surface style={styles.card}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Educational Reference & Liability Waiver</Text>

          <Text style={styles.bodyText}>{disclaimerText}</Text>

          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setAgreed(!agreed)}
            activeOpacity={0.7}
          >
            <Checkbox
              status={agreed ? 'checked' : 'unchecked'}
              onPress={() => setAgreed(!agreed)}
              color={COLORS.gold}
            />
            <Text style={styles.checkboxLabel}>
              I am a qualified medical professional. I have read, understood, and agree to the terms above.
            </Text>
          </TouchableOpacity>
        </ScrollView>

        <Button
          mode="contained"
          onPress={handleAgreePress}
          loading={loading}
          disabled={!agreed || loading}
          style={[styles.button, !agreed && styles.disabledButton]}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
        >
          I Agree & Enter App
        </Button>
      </Surface>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.lg,
    elevation: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  scrollContent: {
    paddingBottom: SPACING.lg,
  },
  title: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.gold,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  bodyText: {
    fontSize: SIZES.md,
    color: COLORS.textMuted,
    lineHeight: 22,
    marginBottom: SPACING.base,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.base,
  },
  checkboxLabel: {
    color: COLORS.text,
    fontSize: SIZES.md,
    marginLeft: SPACING.base,
    flex: 1,
    lineHeight: 22,
  },
  button: {
    backgroundColor: COLORS.gold,
    marginTop: SPACING.base,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: COLORS.surface,
  },
  buttonContent: {
    paddingVertical: 5,
  },
  buttonLabel: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.textInverse,
  },
});
