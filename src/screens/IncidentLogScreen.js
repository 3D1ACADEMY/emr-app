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
import { INCIDENT_FIELDS } from '../constants/emergencyData';
import { storage } from '../utils/storage';
import { formatDate, generateId } from '../utils/helpers';

export default function IncidentLogScreen({ route }) {
  const prefillId = route.params?.incidentId;
  const [incidents, setIncidents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({});

  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = async () => {
    const data = await storage.getIncidents();
    setIncidents(data.reverse());
    if (prefillId) {
      const found = data.find((i) => i.id === prefillId);
      if (found) {
        setSelected(found);
        setForm(found);
      }
    }
  };

  const handleSave = async () => {
    const incident = {
      ...(selected || { id: generateId('I') }),
      ...form,
      updatedAt: Date.now(),
      status: 'completed',
    };
    await storage.saveIncident(incident);
    await loadIncidents();
    setSelected(null);
    setForm({});
    Alert.alert('Saved', 'Incident log saved locally.');
  };

  const handleNew = () => {
    setSelected(null);
    setForm({ type: 'manual', title: 'Manual Incident', startedAt: Date.now() });
  };

  const handleSelect = (incident) => {
    setSelected(incident);
    setForm(incident);
  };

  const updateField = (fieldId, value) => {
    setForm((prev) => ({ ...prev, [fieldId]: value }));
  };

  const exportText = () => {
    if (!selected) return;
    const lines = INCIDENT_FIELDS.map((f) => `${f.label}: ${form[f.id] || ''}`);
    const report = [
      `INCIDENT REPORT: ${selected.title || 'Untitled'}`,
      `ID: ${selected.id}`,
      `Started: ${formatDate(selected.startedAt)}`,
      `Updated: ${formatDate(Date.now())}`,
      '',
      ...lines,
    ].join('\n');
    Alert.alert('Incident Report', report, [{ text: 'Close' }]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Incident Log</Text>
          <TouchableOpacity style={styles.newButton} onPress={handleNew}>
            <Icon name="plus" size={18} color={COLORS.textInverse} />
          </TouchableOpacity>
        </View>

        {(selected || Object.keys(form).length > 0) ? (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>{selected ? `Edit: ${selected.id}` : 'New Incident'}</Text>
            {INCIDENT_FIELDS.map((field) => (
              <View key={field.id} style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{field.label}</Text>
                <TextInput
                  style={[styles.input, field.type === 'multiline' && styles.inputMultiline]}
                  value={form[field.id] || ''}
                  onChangeText={(v) => updateField(field.id, v)}
                  multiline={field.type === 'multiline'}
                  numberOfLines={field.type === 'multiline' ? 4 : 1}
                  placeholderTextColor={COLORS.textMuted}
                  color={COLORS.text}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                />
              </View>
            ))}

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => { setSelected(null); setForm({}); }}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>

            {selected && (
              <TouchableOpacity style={styles.exportButton} onPress={exportText}>
                <Icon name="file-document" size={18} color={COLORS.gold} />
                <Text style={styles.exportButtonText}>Preview Report</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <TouchableOpacity style={styles.startCard} onPress={handleNew}>
            <Icon name="file-document-edit-outline" size={40} color={COLORS.gold} />
            <Text style={styles.startTitle}>Document an Incident</Text>
            <Text style={styles.startText}>Tap to create a new incident report.</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.sectionTitle}>Recent Incidents</Text>
        {incidents.length === 0 ? (
          <Text style={styles.emptyText}>No incidents logged yet.</Text>
        ) : (
          incidents.map((incident) => (
            <TouchableOpacity
              key={incident.id}
              style={styles.incidentCard}
              onPress={() => handleSelect(incident)}
              activeOpacity={0.8}
            >
              <View style={styles.incidentHeader}>
                <Text style={styles.incidentId}>{incident.id}</Text>
                <View style={[styles.statusBadge, { backgroundColor: incident.status === 'completed' ? COLORS.success : COLORS.warning }]}>
                  <Text style={styles.statusText}>{incident.status}</Text>
                </View>
              </View>
              <Text style={styles.incidentTitle}>{incident.title || 'Untitled'}</Text>
              <Text style={styles.incidentDate}>{formatDate(incident.updatedAt || incident.createdAt)}</Text>
            </TouchableOpacity>
          ))
        )}
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
    marginBottom: SPACING.lg,
  },
  title: { color: COLORS.text, fontSize: SIZES.xxl, fontWeight: '800' },
  newButton: {
    backgroundColor: COLORS.gold,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  formCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  formTitle: { color: COLORS.gold, fontSize: SIZES.lg, fontWeight: '700', marginBottom: SPACING.md },
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
  inputMultiline: { height: 90, textAlignVertical: 'top' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.base },
  cancelButton: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: SPACING.base,
    width: '48%',
    alignItems: 'center',
  },
  cancelButtonText: { color: COLORS.text, fontWeight: '700' },
  saveButton: {
    backgroundColor: COLORS.gold,
    borderRadius: 10,
    padding: SPACING.base,
    width: '48%',
    alignItems: 'center',
  },
  saveButtonText: { color: COLORS.textInverse, fontWeight: '700' },
  exportButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.lg,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: 10,
  },
  exportButtonText: { color: COLORS.gold, fontWeight: '700', marginLeft: SPACING.sm },
  startCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  startTitle: { color: COLORS.text, fontSize: SIZES.lg, fontWeight: '700', marginTop: SPACING.base },
  startText: { color: COLORS.textMuted, fontSize: SIZES.sm, marginTop: 4 },
  sectionTitle: { color: COLORS.gold, fontSize: SIZES.lg, fontWeight: '700', marginBottom: SPACING.base },
  emptyText: { color: COLORS.textMuted, fontSize: SIZES.md, textAlign: 'center', marginTop: SPACING.lg },
  incidentCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  incidentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  incidentId: { color: COLORS.textMuted, fontSize: SIZES.sm, fontFamily: 'monospace' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  statusText: { color: '#fff', fontSize: SIZES.xs, fontWeight: '700', textTransform: 'uppercase' },
  incidentTitle: { color: COLORS.text, fontSize: SIZES.md, fontWeight: '700' },
  incidentDate: { color: COLORS.textMuted, fontSize: SIZES.sm, marginTop: 2 },
});
