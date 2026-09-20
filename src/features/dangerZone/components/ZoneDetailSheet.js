import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SIZES, SPACING } from '../../../constants/theme';
import { riskLabel } from '../data/zones';

function riskColor(tier) {
  switch (tier) {
    case 'critical':
      return COLORS.danger;
    case 'high':
      return '#E87C2B';
    case 'moderate':
      return COLORS.gold;
    default:
      return COLORS.textMuted;
  }
}

function BulletList({ items, icon, label }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Icon name={icon} size={18} color={COLORS.gold} />
        <Text style={styles.sectionTitle}>{label}</Text>
      </View>
      {items.map((item, idx) => (
        <View key={idx} style={styles.bulletRow}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

export default function ZoneDetailSheet({ zone, onClose, onOpenProtocol, onOpenCalculator }) {
  if (!zone) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.sheet}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>{zone.name}</Text>
            <Text style={styles.region}>{zone.region}</Text>
          </View>
          <View
            style={[
              styles.badge,
              { borderColor: riskColor(zone.riskTier) },
            ]}
          >
            <Text style={[styles.badgeText, { color: riskColor(zone.riskTier) }]}>
              {riskLabel(zone.riskTier)} Risk
            </Text>
          </View>
        </View>

        <ScrollView style={styles.body}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="heart-pulse" size={18} color={COLORS.gold} />
              <Text style={styles.sectionTitle}>Parent Vessel</Text>
            </View>
            <Text style={styles.bodyText}>{zone.parentVessel}</Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="swap-horizontal" size={18} color={COLORS.gold} />
              <Text style={styles.sectionTitle}>Anastomoses</Text>
            </View>
            <Text style={styles.bodyText}>{zone.anastomoses.join(', ')}</Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="alert-circle" size={18} color={COLORS.gold} />
              <Text style={styles.sectionTitle}>Why It Matters</Text>
            </View>
            <Text style={styles.bodyText}>{zone.whyItMatters}</Text>
          </View>

          <BulletList
            items={zone.warningSigns}
            icon="eye"
            label="Warning Signs"
          />

          <BulletList
            items={zone.immediateActions}
            icon="run-fast"
            label="Immediate Actions"
          />

          <View style={styles.section}>
            <Text style={styles.citation}>{zone.citation}</Text>
            <Text style={styles.review}>
              Reviewed by {zone.reviewedBy} on {zone.reviewedOn}
            </Text>
          </View>
        </ScrollView>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.emergencyButton}
            onPress={onOpenProtocol}
            activeOpacity={0.8}
            accessibilityLabel="Open vascular occlusion protocol"
            accessibilityRole="button"
          >
            <Icon name="heart-pulse" size={22} color="#fff" />
            <Text style={styles.emergencyButtonText}>Open Vascular Occlusion Protocol</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onOpenCalculator}
            activeOpacity={0.8}
          >
            <Icon name="calculator" size={20} color={COLORS.gold} />
            <Text style={styles.secondaryButtonText}>Hyaluronidase Calculator</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SPACING.xl,
    paddingBottom: SPACING.xxl,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLeft: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  title: {
    color: COLORS.text,
    fontSize: SIZES.xxl,
    fontWeight: '800',
  },
  region: {
    color: COLORS.textMuted,
    fontSize: SIZES.sm,
    marginTop: 2,
  },
  badge: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: SIZES.xs,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  body: {
    maxHeight: 360,
    marginBottom: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    color: COLORS.gold,
    fontSize: SIZES.md,
    fontWeight: '700',
    marginLeft: SPACING.sm,
  },
  bodyText: {
    color: COLORS.text,
    fontSize: SIZES.md,
    lineHeight: 22,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  bullet: {
    color: COLORS.textMuted,
    fontSize: SIZES.md,
    marginRight: SPACING.sm,
    lineHeight: 22,
  },
  bulletText: {
    color: COLORS.text,
    fontSize: SIZES.md,
    flex: 1,
    lineHeight: 22,
  },
  citation: {
    color: COLORS.textMuted,
    fontSize: SIZES.sm,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  review: {
    color: COLORS.textMuted,
    fontSize: SIZES.sm,
  },
  actions: {
    marginTop: SPACING.sm,
  },
  emergencyButton: {
    backgroundColor: COLORS.danger,
    borderRadius: 12,
    padding: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.base,
  },
  emergencyButtonText: {
    color: '#fff',
    fontSize: SIZES.md,
    fontWeight: '800',
    marginLeft: SPACING.base,
  },
  secondaryButton: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.base,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
  },
  secondaryButtonText: {
    color: COLORS.gold,
    fontSize: SIZES.md,
    fontWeight: '700',
    marginLeft: SPACING.sm,
  },
  closeButton: {
    padding: SPACING.base,
    alignItems: 'center',
  },
  closeButtonText: {
    color: COLORS.textMuted,
    fontSize: SIZES.md,
    fontWeight: '600',
  },
});
