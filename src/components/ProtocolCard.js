import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SIZES, SPACING, SHADOWS } from '../constants/theme';

export default function ProtocolCard({ protocol, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: protocol.color }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.row}>
        <View style={[styles.iconCircle, { backgroundColor: `${protocol.color}20` }]}>
          <Icon name={protocol.icon} size={28} color={protocol.color} />
        </View>
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{protocol.title}</Text>
            <View style={[styles.badge, { backgroundColor: protocol.color }]}>
              <Text style={styles.badgeText}>{protocol.badge}</Text>
            </View>
          </View>
          <Text style={styles.description}>{protocol.description}</Text>
        </View>
        <Icon name="chevron-right" size={24} color={COLORS.gold} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.base,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.medium,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.base,
  },
  content: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    color: COLORS.text,
    fontSize: SIZES.lg,
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: SIZES.xs,
    fontWeight: '800',
  },
  description: {
    color: COLORS.textMuted,
    fontSize: SIZES.sm,
    lineHeight: 18,
  },
});
