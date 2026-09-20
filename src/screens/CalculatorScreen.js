import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES, SPACING, SHADOWS } from '../constants/theme';

const TabButton = ({ label, active, onPress }) => (
  <TouchableOpacity
    style={[styles.tab, active && styles.tabActive]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
  </TouchableOpacity>
);

const InputField = ({ label, value, onChange, placeholder, suffix, keyboard = 'numeric' }) => (
  <View style={styles.inputGroup}>
    <Text style={styles.inputLabel}>{label}</Text>
    <View style={styles.inputRow}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        keyboardType={keyboard}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
      />
      {suffix && <Text style={styles.suffix}>{suffix}</Text>}
    </View>
  </View>
);

export default function CalculatorScreen() {
  const [activeTab, setActiveTab] = useState('toxin');

  // Botulinum Toxin state
  const [units, setUnits] = useState('100');
  const [diluentMl, setDiluentMl] = useState('2.5');
  const [desiredUnits, setDesiredUnits] = useState('20');

  // Local Anesthetic state
  const [weightKg, setWeightKg] = useState('70');
  const [concentrationPercent, setConcentrationPercent] = useState('2');
  const [agent, setAgent] = useState('lidocaine');

  const toxinUnitsPerMl = units && diluentMl ? (parseFloat(units) / parseFloat(diluentMl)).toFixed(2) : '0';
  const toxinVolumeForDesired = units && diluentMl && desiredUnits
    ? ((parseFloat(desiredUnits) * parseFloat(diluentMl)) / parseFloat(units)).toFixed(3)
    : '0';

  const MAX_DOSE_MG_KG = {
    lidocaine: 4.5,
    lidocaine_epi: 7.0,
    bupivacaine: 2.0,
    ropivacaine: 3.0,
  };

  const maxDoseMg = weightKg ? parseFloat(weightKg) * MAX_DOSE_MG_KG[agent] : 0;
  const concentrationMgMl = concentrationPercent ? parseFloat(concentrationPercent) * 10 : 0;
  const maxVolumeMl = concentrationMgMl > 0 ? (maxDoseMg / concentrationMgMl).toFixed(2) : '0';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Clinical Calculators</Text>

        <View style={styles.tabRow}>
          <TabButton
            label="Botulinum Toxin"
            active={activeTab === 'toxin'}
            onPress={() => setActiveTab('toxin')}
          />
          <TabButton
            label="Local Anesthetic"
            active={activeTab === 'anesthetic'}
            onPress={() => setActiveTab('anesthetic')}
          />
        </View>

        {activeTab === 'toxin' ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Botulinum Toxin Dilution</Text>

            <InputField
              label="Total Units in Vial"
              value={units}
              onChange={setUnits}
              placeholder="100"
              suffix="U"
            />
            <InputField
              label="Diluent Volume"
              value={diluentMl}
              onChange={setDiluentMl}
              placeholder="2.5"
              suffix="mL"
            />
            <InputField
              label="Desired Units per Injection"
              value={desiredUnits}
              onChange={setDesiredUnits}
              placeholder="20"
              suffix="U"
            />

            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>Concentration</Text>
              <Text style={styles.resultValue}>{toxinUnitsPerMl} U/mL</Text>
            </View>

            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>Volume for {desiredUnits || 0} U</Text>
              <Text style={styles.resultValue}>{toxinVolumeForDesired} mL</Text>
            </View>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Local Anesthetic Max Safe Dose</Text>

            <InputField
              label="Patient Weight"
              value={weightKg}
              onChange={setWeightKg}
              placeholder="70"
              suffix="kg"
            />
            <InputField
              label="Concentration"
              value={concentrationPercent}
              onChange={setConcentrationPercent}
              placeholder="2"
              suffix="%"
            />

            <Text style={styles.inputLabel}>Agent</Text>
            <View style={styles.agentRow}>
              {[
                { key: 'lidocaine', label: 'Lidocaine' },
                { key: 'lidocaine_epi', label: 'Lido + Epi' },
                { key: 'bupivacaine', label: 'Bupivacaine' },
                { key: 'ropivacaine', label: 'Ropivacaine' },
              ].map((a) => (
                <TouchableOpacity
                  key={a.key}
                  style={[styles.agentButton, agent === a.key && styles.agentButtonActive]}
                  onPress={() => setAgent(a.key)}
                >
                  <Text style={[styles.agentText, agent === a.key && styles.agentTextActive]}>
                    {a.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>Max Dose</Text>
              <Text style={styles.resultValue}>{maxDoseMg.toFixed(1)} mg</Text>
              <Text style={styles.resultSub}>({MAX_DOSE_MG_KG[agent]} mg/kg)</Text>
            </View>

            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>Max Injectable Volume</Text>
              <Text style={styles.resultValue}>{maxVolumeMl} mL</Text>
              <Text style={styles.resultSub}>({concentrationMgMl} mg/mL concentration)</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
    backgroundColor: COLORS.background,
  },
  title: {
    color: COLORS.text,
    fontSize: SIZES.xxl,
    fontWeight: '800',
    marginBottom: SPACING.lg,
  },
  tabRow: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.base,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: COLORS.gold,
  },
  tabText: {
    color: COLORS.textMuted,
    fontSize: SIZES.md,
    fontWeight: '700',
  },
  tabTextActive: {
    color: COLORS.textInverse,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    color: COLORS.gold,
    fontSize: SIZES.lg,
    fontWeight: '700',
    marginBottom: SPACING.lg,
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    paddingHorizontal: SPACING.base,
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.base,
    color: COLORS.text,
    backgroundColor: COLORS.surface,
    fontSize: SIZES.md,
  },
  suffix: {
    color: COLORS.gold,
    fontWeight: '700',
    marginLeft: SPACING.sm,
  },
  agentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.lg,
  },
  agentButton: {
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  agentButtonActive: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  agentText: {
    color: COLORS.text,
    fontSize: SIZES.sm,
    fontWeight: '600',
  },
  agentTextActive: {
    color: COLORS.textInverse,
  },
  resultBox: {
    backgroundColor: COLORS.backgroundAlt,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.gold,
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
    padding: SPACING.lg,
    marginTop: SPACING.base,
  },
  resultLabel: {
    color: COLORS.gold,
    fontSize: SIZES.md,
    fontWeight: '700',
    marginBottom: 4,
  },
  resultValue: {
    color: COLORS.text,
    fontSize: SIZES.xxl,
    fontWeight: '800',
  },
  resultSub: {
    color: COLORS.textMuted,
    fontSize: SIZES.sm,
    marginTop: 4,
  },
});
