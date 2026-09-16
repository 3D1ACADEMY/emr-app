import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SIZES, SPACING, SHADOWS } from '../constants/theme';
import ChecklistItem from '../components/ChecklistItem';
import { generateId } from '../utils/helpers';
import { storage } from '../utils/storage';

export default function ProtocolDetailScreen({ route, navigation }) {
  const { protocol } = route.params;
  const [checkedItems, setCheckedItems] = useState({});
  const [incidentId, setIncidentId] = useState(null);

  useEffect(() => {
    const initIncident = async () => {
      const id = generateId(protocol.id.toUpperCase().slice(0, 3));
      setIncidentId(id);
      await storage.saveIncident({
        id,
        type: protocol.id,
        title: protocol.title,
        startedAt: Date.now(),
        status: 'active',
      });
      const saved = await storage.getChecklistState(id);
      setCheckedItems(saved || {});
    };
    initIncident();
  }, [protocol.id]);

  const toggleCheck = async (stepId) => {
    const updated = { ...checkedItems, [stepId]: !checkedItems[stepId] };
    setCheckedItems(updated);
    if (incidentId) {
      await storage.saveChecklistState(incidentId, updated);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.headerRow}>
          <View style={[styles.badge, { backgroundColor: protocol.color }]}>
            <Text style={styles.badgeText}>{protocol.badge}</Text>
          </View>
          <Text style={styles.headerId}>{incidentId || 'Initializing...'}</Text>
        </View>

        <Text style={styles.title}>{protocol.title}</Text>
        <Text style={styles.description}>{protocol.description}</Text>

        <TouchableOpacity
          style={styles.timerButton}
          onPress={() => navigation.navigate('Timer', { defaultMinutes: 5, label: protocol.title })}
          activeOpacity={0.8}
        >
          <Icon name="timer" size={22} color={COLORS.gold} />
          <Text style={styles.timerText}>Start Treatment Timer</Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Action Checklist</Text>
          {protocol.steps.map((step) => (
            <ChecklistItem
              key={step.id}
              item={step}
              checked={!!checkedItems[step.id]}
              onToggle={() => toggleCheck(step.id)}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.documentButton}
          onPress={() => navigation.navigate('IncidentLog', { incidentId })}
          activeOpacity={0.8}
        >
          <Icon name="file-document-edit" size={22} color={COLORS.textInverse} />
          <Text style={styles.documentButtonText}>Document Incident</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.base,
  },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#fff', fontSize: SIZES.xs, fontWeight: '800' },
  headerId: { color: COLORS.textMuted, fontSize: SIZES.sm, fontFamily: 'monospace' },
  title: { color: COLORS.text, fontSize: SIZES.xxl, fontWeight: '800', marginBottom: 4 },
  description: { color: COLORS.textMuted, fontSize: SIZES.md, marginBottom: SPACING.lg },
  timerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.gold}15`,
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: 10,
    padding: SPACING.base,
    marginBottom: SPACING.lg,
  },
  timerText: { color: COLORS.gold, fontSize: SIZES.md, fontWeight: '700', marginLeft: SPACING.base },
  section: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: { color: COLORS.gold, fontSize: SIZES.lg, fontWeight: '700', marginBottom: SPACING.md },
  documentButton: {
    backgroundColor: COLORS.gold,
    borderRadius: 12,
    padding: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  documentButtonText: { color: COLORS.textInverse, fontSize: SIZES.lg, fontWeight: '800', marginLeft: SPACING.base },
});
