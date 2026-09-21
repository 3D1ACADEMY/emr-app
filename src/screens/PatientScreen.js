import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SIZES, SPACING, SHADOWS } from '../constants/theme';
import { storage } from '../utils/storage';
import { generateId } from '../utils/helpers';

export default function PatientScreen() {
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({
    initials: '',
    age: '',
    weight: '',
    allergies: '',
    medications: '',
    medicalHistory: '',
    notes: '',
  });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    const data = await storage.getPatients();
    setPatients(data.reverse());
  };

  const handleSave = async () => {
    if (!form.initials.trim()) {
      Alert.alert('Required', 'Please enter patient initials or ID');
      return;
    }
    try {
      const patient = {
        id: generateId('PT'),
        ...form,
        weight: parseFloat(form.weight) || 0,
        age: parseInt(form.age) || 0,
      };
      await storage.savePatient(patient);
      await loadPatients();
      setForm({ initials: '', age: '', weight: '', allergies: '', medications: '', medicalHistory: '', notes: '' });
      setShowForm(false);
      Alert.alert('Saved', 'Patient context saved.');
    } catch (e) {
      console.error('Failed to save patient:', e);
      Alert.alert('Save Failed', e?.message || 'Could not save patient context. Storage may be locked.');
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Patient Context',
      'This will permanently remove this patient record. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await storage.deletePatient(id);
            await loadPatients();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Patient Context</Text>
        <Text style={styles.description}>
          Store quick patient data used during emergency dosing and documentation.
        </Text>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowForm(!showForm)}
          activeOpacity={0.8}
        >
          <Icon name={showForm ? 'close' : 'plus-circle'} size={22} color={COLORS.textInverse} />
          <Text style={styles.addButtonText}>{showForm ? 'Cancel' : 'Add Patient'}</Text>
        </TouchableOpacity>

        {showForm && (
          <View style={styles.formCard}>
            <Input label="Initials / ID" value={form.initials} onChange={(v) => setForm({ ...form, initials: v })} />
            <View style={styles.row}>
              <View style={styles.half}>
                <Input label="Age" value={form.age} onChange={(v) => setForm({ ...form, age: v })} keyboard="numeric" />
              </View>
              <View style={styles.half}>
                <Input label="Weight (kg)" value={form.weight} onChange={(v) => setForm({ ...form, weight: v })} keyboard="numeric" />
              </View>
            </View>
            <Input label="Allergies" value={form.allergies} onChange={(v) => setForm({ ...form, allergies: v })} />
            <Input label="Current Medications" value={form.medications} onChange={(v) => setForm({ ...form, medications: v })} />
            <Input label="Medical History" value={form.medicalHistory} onChange={(v) => setForm({ ...form, medicalHistory: v })} multiline />
            <Input label="Notes" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} multiline />

            <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
              <Text style={styles.saveButtonText}>Save Patient</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.sectionTitle}>Saved Patients</Text>
        {patients.length === 0 ? (
          <Text style={styles.emptyText}>No patients saved yet.</Text>
        ) : (
          patients.map((patient) => (
            <View key={patient.id} style={styles.patientCard}>
              <View style={styles.patientHeader}>
                <Text style={styles.patientName}>{patient.initials}</Text>
                <TouchableOpacity onPress={() => handleDelete(patient.id)}>
                  <Icon name="trash-can" size={20} color={COLORS.danger} />
                </TouchableOpacity>
              </View>
              <Text style={styles.patientMeta}>
                {patient.age ? `${patient.age} yrs` : ''} {patient.weight ? `• ${patient.weight} kg` : ''}
              </Text>
              {!!patient.allergies && (
                <Text style={styles.patientInfo}>Allergies: {patient.allergies}</Text>
              )}
              {!!patient.medications && (
                <Text style={styles.patientInfo}>Meds: {patient.medications}</Text>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Input({ label, value, onChange, keyboard = 'default', multiline = false }) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        value={value}
        onChangeText={onChange}
        keyboardType={keyboard}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        placeholderTextColor={COLORS.textMuted}
        color={COLORS.text}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollView: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scroll: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  title: { color: COLORS.text, fontSize: SIZES.xxl, fontWeight: '800', marginBottom: 4 },
  description: { color: COLORS.textMuted, fontSize: SIZES.md, marginBottom: SPACING.lg },
  addButton: {
    backgroundColor: COLORS.gold,
    borderRadius: 12,
    padding: SPACING.base,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    ...SHADOWS.small,
  },
  addButtonText: { color: COLORS.textInverse, fontSize: SIZES.md, fontWeight: '700', marginLeft: SPACING.sm },
  formCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputGroup: { marginBottom: SPACING.base },
  inputLabel: { color: COLORS.textMuted, fontSize: SIZES.sm, marginBottom: SPACING.sm, fontWeight: '600' },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    padding: SPACING.base,
    color: COLORS.text,
    fontSize: SIZES.md,
  },
  inputMultiline: { height: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  half: { width: '48%' },
  saveButton: {
    backgroundColor: COLORS.teal,
    borderRadius: 10,
    padding: SPACING.base,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  saveButtonText: { color: COLORS.textInverse, fontSize: SIZES.md, fontWeight: '700' },
  sectionTitle: { color: COLORS.gold, fontSize: SIZES.lg, fontWeight: '700', marginBottom: SPACING.base },
  emptyText: { color: COLORS.textMuted, fontSize: SIZES.md, textAlign: 'center', marginTop: SPACING.lg },
  patientCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  patientHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  patientName: { color: COLORS.text, fontSize: SIZES.lg, fontWeight: '700' },
  patientMeta: { color: COLORS.textMuted, fontSize: SIZES.sm, marginBottom: SPACING.sm },
  patientInfo: { color: COLORS.textMuted, fontSize: SIZES.sm, marginTop: 2 },
});
