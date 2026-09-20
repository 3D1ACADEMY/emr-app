import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SIZES, SPACING } from '../../../constants/theme';

export default function AtlasErrorFallback({ onRetry }) {
  return (
    <View style={styles.container}>
      <Icon name="map-marker-off" size={48} color={COLORS.gold} />
      <Text style={styles.title}>Map could not load</Text>
      <Text style={styles.message}>
        The interactive anatomy map failed to render. Use the list below to access every danger zone.
      </Text>
      {onRetry && (
        <TouchableOpacity style={styles.button} onPress={onRetry} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Retry Map</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  title: {
    color: COLORS.text,
    fontSize: SIZES.lg,
    fontWeight: '800',
    marginTop: SPACING.base,
    marginBottom: SPACING.sm,
  },
  message: {
    color: COLORS.textMuted,
    fontSize: SIZES.md,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  button: {
    backgroundColor: COLORS.gold,
    borderRadius: 10,
    paddingVertical: SPACING.base,
    paddingHorizontal: SPACING.xl,
  },
  buttonText: {
    color: COLORS.textInverse,
    fontSize: SIZES.md,
    fontWeight: '800',
  },
});
