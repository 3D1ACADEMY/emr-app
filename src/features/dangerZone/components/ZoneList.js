import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
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

export default function ZoneList({ zones, onSelect }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return zones;
    return zones.filter(
      (z) =>
        z.name.toLowerCase().includes(q) ||
        z.region.toLowerCase().includes(q) ||
        z.parentVessel.toLowerCase().includes(q) ||
        z.aliases.some((a) => a.toLowerCase().includes(q))
    );
  }, [zones, query]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.row}
      onPress={() => onSelect(item)}
      activeOpacity={0.8}
      accessibilityLabel={`${item.name}, ${item.region}, ${riskLabel(item.riskTier)} risk`}
      accessibilityRole="button"
    >
      <View style={styles.rowLeft}>
        <View style={[styles.dot, { backgroundColor: riskColor(item.riskTier) }]} />
        <View style={styles.rowText}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.region}>{item.region}</Text>
        </View>
      </View>
      <View style={[styles.badge, { borderColor: riskColor(item.riskTier) }]}>
        <Text style={[styles.badgeText, { color: riskColor(item.riskTier) }]}>
          {riskLabel(item.riskTier)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <Icon name="magnify" size={20} color={COLORS.textMuted} />
        <TextInput
          style={styles.input}
          placeholder="Search zone, artery, or region..."
          placeholderTextColor={COLORS.textMuted}
          value={query}
          onChangeText={setQuery}
          accessibilityLabel="Search danger zones"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Icon name="close-circle" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>No zones match your search.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.base,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    paddingHorizontal: SPACING.base,
    marginBottom: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: SIZES.md,
    padding: SPACING.base,
  },
  list: {
    paddingBottom: SPACING.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SPACING.sm,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.base,
  },
  rowText: {
    flex: 1,
  },
  name: {
    color: COLORS.text,
    fontSize: SIZES.md,
    fontWeight: '700',
  },
  region: {
    color: COLORS.textMuted,
    fontSize: SIZES.sm,
    marginTop: 2,
  },
  badge: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: SIZES.xs,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  empty: {
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.lg,
    fontSize: SIZES.md,
  },
});
