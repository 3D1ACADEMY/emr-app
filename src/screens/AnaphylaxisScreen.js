import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SIZES, SPACING, SHADOWS } from '../constants/theme';
import { PROTOCOLS, EPINEPHRINE_WEIGHTS } from '../constants/emergencyData';
import ChecklistItem from '../components/ChecklistItem';
import { calculateEpinephrine, generateId } from '../utils/helpers';
import { storage } from '../utils/storage';
import { confirmEmergencyCall } from '../utils/emergencyCall';

export default function AnaphylaxisScreen({ navigation }) {
  const [weight, setWeight] = useState(70);
  const [checkedItems, setCheckedItems] = useState({});
  const [incidentId, setIncidentId] = useState(null);

  useEffect(() => {
    const initIncident = async () => {
      const id = generateId('AN');
      setIncidentId(id);
      await storage.saveIncident({
        id,
        type: 'anaphylaxis',
        title: 'Anaphylaxis',
        startedAt: Date.now(),
        status: 'active',
      });
      const saved = await storage.getChecklistState(id);
      setCheckedItems(saved || {});
    };
    initIncident();
  }, []);

  const protocol = PROTOCOLS.anaphylaxis;
  const epiResult = calculateEpinephrine(weight);

  const toggleCheck = async (stepId) => {
    const updated = { ...checkedItems, [stepId]: !checkedItems[stepId] };
    setCheckedItems(updated);
    if (incidentId) {
      await storage.saveChecklistState(incidentId, updated);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scroll}>
        <View style={styles.headerRow}>
          <View style={[styles.badge, { backgroundColor: protocol.color }]}>
            <Text style={styles.badgeText}>{protocol.badge}</Text>
          </View>
          <Text style={styles.headerId}>{incidentId || 'Initializing...'}</Text>
        </View>

        <Text style={styles.title}>{protocol.title}</Text>
        <Text style={styles.description}>{protocol.description}</Text>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.timerButton}
            onPress={() => navigation.navigate('Timer', { defaultMinutes: 5, label: 'Epinephrine Re-Dose' })}
            activeOpacity={0.8}
          >
            <Icon name="timer" size={22} color={COLORS.gold} />
            <Text style={styles.timerText}>5-Min Timer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.callButton}
            onPress={confirmEmergencyCall}
            activeOpacity={0.8}
          >
            <Icon name="phone" size={22} color="#fff" />
            <Text style={styles.callButtonText}>911</Text>
          </TouchableOpacity>
        </View>

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

        <View style={styles.calculatorCard}>
          <Text style={styles.calculatorTitle}>Epinephrine Dosing Calculator</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Patient Weight (kg)</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={weight}
                onValueChange={(itemValue) => setWeight(itemValue)}
                dropdownIconColor={COLORS.gold}
                style={styles.picker}
                itemStyle={{ color: '#0F2440', fontSize: SIZES.md }}
              >
                {EPINEPHRINE_WEIGHTS.map((w) => (
                  <Picker.Item key={w} label={`${w} kg`} value={w} color="#0F2440" />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.resultBox}>
            <Text style={styles.resultLabel}>Epinephrine Dose</Text>
            <Text style={styles.resultDose}>{epiResult.dose.toFixed(2)} mg</Text>
            <Text style={styles.resultInstructions}>
              {epiResult.concentration} • {epiResult.route}
              {'\n'}
              {epiResult.repeat}
              {'\n'}
              {epiResult.note}
            </Text>
          </View>
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
  scrollView: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

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
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
    gap: SPACING.base,
  },
  timerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${COLORS.gold}15`,
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: 10,
    padding: SPACING.base,
  },
  timerText: { color: COLORS.gold, fontSize: SIZES.md, fontWeight: '700', marginLeft: SPACING.base },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.danger,
    borderRadius: 10,
    paddingVertical: SPACING.base,
    paddingHorizontal: SPACING.lg,
  },
  callButtonText: {
    color: '#fff',
    fontSize: SIZES.md,
    fontWeight: '800',
    marginLeft: SPACING.sm,
  },
  section: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: { color: COLORS.gold, fontSize: SIZES.lg, fontWeight: '700', marginBottom: SPACING.md },
  calculatorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  calculatorTitle: {
    color: '#0F2440',
    fontSize: SIZES.lg,
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
  inputGroup: { marginBottom: SPACING.lg },
  inputLabel: { color: '#0F2440', fontSize: SIZES.sm, marginBottom: SPACING.sm, fontWeight: '600' },
  pickerContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    overflow: 'hidden',
  },
  picker: { color: '#0F2440' },
  resultBox: {
    backgroundColor: '#F8FAFC',
    borderLeftWidth: 4,
    borderLeftColor: '#D4AF37',
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
    padding: SPACING.lg,
    marginTop: SPACING.base,
  },
  resultLabel: { color: '#0F2440', fontSize: SIZES.md, fontWeight: '700', marginBottom: 4 },
  resultDose: { color: '#0F2440', fontSize: SIZES.xxl, fontWeight: '800', marginBottom: SPACING.sm },
  resultInstructions: { color: '#334155', fontSize: SIZES.sm, lineHeight: 20 },
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
