import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SIZES, SPACING, SHADOWS } from '../constants/theme';
import { PROTOCOLS, HYALURONIDASE_ZONES, SEVERITY_OPTIONS } from '../constants/emergencyData';
import ChecklistItem from '../components/ChecklistItem';
import { calculateHyaluronidase, generateId } from '../utils/helpers';
import { storage } from '../utils/storage';

export default function VascularOcclusionScreen({ navigation }) {
  const [zone, setZone] = useState(HYALURONIDASE_ZONES[0].value);
  const [severity, setSeverity] = useState(SEVERITY_OPTIONS[0].value);
  const [checkedItems, setCheckedItems] = useState({});
  const [incidentId, setIncidentId] = useState(null);

  useEffect(() => {
    const initIncident = async () => {
      const id = generateId('VO');
      setIncidentId(id);
      await storage.saveIncident({
        id,
        type: 'vascular-occlusion',
        title: 'Vascular Occlusion',
        startedAt: Date.now(),
        status: 'active',
      });
      const saved = await storage.getChecklistState(id);
      setCheckedItems(saved || {});
    };
    initIncident();
  }, []);

  const protocol = PROTOCOLS.vascularOcclusion;
  const doseResult = calculateHyaluronidase(zone, severity);

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
        {/* Header Badge */}
        <View style={styles.headerRow}>
          <View style={[styles.badge, { backgroundColor: protocol.color }]}>
            <Text style={styles.badgeText}>{protocol.badge}</Text>
          </View>
          <Text style={styles.headerId}>{incidentId || 'Initializing...'}</Text>
        </View>

        {/* Protocol Title */}
        <Text style={styles.title}>{protocol.title}</Text>
        <Text style={styles.description}>{protocol.description}</Text>

        {/* Timer Shortcut */}
        <TouchableOpacity
          style={styles.timerButton}
          onPress={() => navigation.navigate('Timer', { defaultMinutes: 15, label: 'Re-Dose Hyaluronidase' })}
          activeOpacity={0.8}
        >
          <Icon name="timer" size={22} color={COLORS.gold} />
          <Text style={styles.timerText}>Start 15-Min Re-Dose Timer</Text>
        </TouchableOpacity>

        {/* Checklist */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Immediate Action Checklist</Text>
          {protocol.steps.map((step) => (
            <ChecklistItem
              key={step.id}
              item={step}
              checked={!!checkedItems[step.id]}
              onToggle={() => toggleCheck(step.id)}
            />
          ))}
        </View>

        {/* Dose Calculator */}
        <View style={styles.calculatorCard}>
          <Text style={styles.sectionTitle}>Hyaluronidase Dosing Calculator</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Affected Anatomical Zone</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={zone}
                onValueChange={(itemValue) => setZone(itemValue)}
                dropdownIconColor={COLORS.gold}
                style={styles.picker}
                itemStyle={{ color: COLORS.text, fontSize: SIZES.md }}
              >
                {HYALURONIDASE_ZONES.map((z) => (
                  <Picker.Item key={z.value} label={z.label} value={z.value} color={COLORS.text} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Ischemic Severity / Spread</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={severity}
                onValueChange={(itemValue) => setSeverity(itemValue)}
                dropdownIconColor={COLORS.gold}
                style={styles.picker}
                itemStyle={{ color: COLORS.text, fontSize: SIZES.md }}
              >
                {SEVERITY_OPTIONS.map((s) => (
                  <Picker.Item key={s.value} label={s.label} value={s.value} color={COLORS.text} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.resultBox}>
            <Text style={styles.resultLabel}>Recommended Initial Dosage</Text>
            <Text style={styles.resultDose}>{doseResult.totalDose} IU</Text>
            <Text style={styles.resultVolume}>
              {doseResult.volumeMl.toFixed(2)} mL at {doseResult.concentrationIuPerMl} IU/mL
            </Text>
            {!!doseResult.storage && (
              <Text style={styles.resultStorage}>{doseResult.storage}</Text>
            )}
            <Text style={styles.resultInstructions}>{doseResult.instructions}</Text>
          </View>
        </View>

        {/* Re-dosing Rule */}
        <View style={[styles.ruleCard, { borderColor: COLORS.goldDark }]}>
          <Text style={styles.sectionTitle}>Re-Dosing & Monitoring Rule</Text>
          <Text style={styles.ruleText}>
            Hyaluronidase has a short tissue half-life. Assess reperfusion every{' '}
            <Text style={styles.bold}>15 to 30 minutes</Text>. If blanching or pain persists, repeat
            full high-dose infiltration immediately. Do not delay re-dosing.
          </Text>
        </View>

        {/* Document Button */}
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
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.base,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: SIZES.xs,
    fontWeight: '800',
  },
  headerId: {
    color: COLORS.textMuted,
    fontSize: SIZES.sm,
    fontFamily: 'monospace',
  },
  title: {
    color: COLORS.text,
    fontSize: SIZES.xxl,
    fontWeight: '800',
    marginBottom: 4,
  },
  description: {
    color: COLORS.textMuted,
    fontSize: SIZES.md,
    marginBottom: SPACING.lg,
  },
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
  timerText: {
    color: COLORS.gold,
    fontSize: SIZES.md,
    fontWeight: '700',
    marginLeft: SPACING.base,
  },
  section: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    color: COLORS.gold,
    fontSize: SIZES.lg,
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
  calculatorCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    color: COLORS.textMuted,
    fontSize: SIZES.sm,
    marginBottom: SPACING.sm,
    fontWeight: '600',
  },
  pickerContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    overflow: 'hidden',
  },
  picker: {
    color: COLORS.text,
  },
  resultBox: {
    backgroundColor: COLORS.backgroundAlt,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.gold,
    borderRadius: 0,
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
    padding: SPACING.lg,
    marginTop: SPACING.base,
  },
  resultLabel: {
    color: COLORS.goldLight,
    fontSize: SIZES.md,
    fontWeight: '700',
    marginBottom: 4,
  },
  resultDose: {
    color: COLORS.text,
    fontSize: SIZES.xxl,
    fontWeight: '800',
    marginBottom: SPACING.sm,
  },
  resultInstructions: {
    color: COLORS.textMuted,
    fontSize: SIZES.sm,
    lineHeight: 20,
    marginTop: SPACING.sm,
  },
  resultVolume: {
    color: COLORS.teal,
    fontSize: SIZES.md,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  resultStorage: {
    color: COLORS.goldLight,
    fontSize: SIZES.sm,
    fontStyle: 'italic',
    marginBottom: SPACING.sm,
  },
  ruleCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.goldDark,
  },
  ruleText: {
    color: COLORS.textMuted,
    fontSize: SIZES.md,
    lineHeight: 22,
  },
  bold: {
    color: COLORS.text,
    fontWeight: '700',
  },
  documentButton: {
    backgroundColor: COLORS.gold,
    borderRadius: 12,
    padding: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  documentButtonText: {
    color: COLORS.textInverse,
    fontSize: SIZES.lg,
    fontWeight: '800',
    marginLeft: SPACING.base,
  },
});
