import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
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

  // Voice state
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceSupported, setVoiceSupported] = useState(false);

  // Camera state
  const [cameraVisible, setCameraVisible] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const cameraRef = useRef(null);

  useEffect(() => {
    loadIncidents();
    checkVoiceSupport();
  }, []);

  const checkVoiceSupport = async () => {
    try {
      const supported = await ExpoSpeechRecognitionModule.isRecognitionAvailable();
      setVoiceSupported(supported);
    } catch {
      setVoiceSupported(false);
    }
  };

  useSpeechRecognitionEvent('result', (event) => {
    const text = event.results?.[0]?.transcript || '';
    setTranscript(text);
  });

  useSpeechRecognitionEvent('end', () => {
    setIsListening(false);
  });

  useSpeechRecognitionEvent('error', (event) => {
    setIsListening(false);
    Alert.alert('Dictation Error', event.message || 'Could not transcribe speech.');
  });

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
    Alert.alert('Saved', 'Incident log saved securely.');
  };

  const handleNew = () => {
    setSelected(null);
    setForm({
      type: 'manual',
      title: 'Manual Incident',
      startedAt: Date.now(),
      voiceNotes: [],
      photos: [],
    });
  };

  const handleSelect = (incident) => {
    setSelected(incident);
    setForm(incident);
  };

  const updateField = (fieldId, value) => {
    setForm((prev) => ({ ...prev, [fieldId]: value }));
  };

  // -------------------- Voice Dictation --------------------

  const toggleDictation = async () => {
    if (isListening) {
      try {
        await ExpoSpeechRecognitionModule.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
      return;
    }

    try {
      const { status } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Microphone access is needed for dictation.');
        return;
      }

      setTranscript('');
      setIsListening(true);
      await ExpoSpeechRecognitionModule.start({
        lang: 'en-US',
        interimResults: true,
        maxAlternatives: 1,
        continuous: true,
        requiresOnDeviceRecognition: false,
      });
    } catch (e) {
      setIsListening(false);
      Alert.alert('Dictation Error', e.message || 'Failed to start speech recognition.');
    }
  };

  const appendTranscript = () => {
    if (!transcript.trim()) return;
    const note = `[${new Date().toLocaleString()}] ${transcript.trim()}`;
    const current = form.voiceNotes || [];
    setForm((prev) => ({
      ...prev,
      voiceNotes: [...current, note],
    }));
    setTranscript('');
  };

  // -------------------- Camera / Photos --------------------

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setCameraPermission(status === 'granted');
    return status === 'granted';
  };

  const openCamera = async () => {
    const { status } = await Camera.getCameraPermissionsAsync();
    if (status !== 'granted') {
      const granted = await requestCameraPermission();
      if (!granted) {
        Alert.alert('Permission Required', 'Camera access is needed to document incidents.');
        return;
      }
    }
    setCameraPermission(true);
    setCameraVisible(true);
  };

  const takePhoto = async () => {
    if (!cameraRef.current) return;
    setPhotoLoading(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.6,
        skipProcessing: false,
      });

      // Compress and resize
      const manipulated = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 1024 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );

      // Move to persistent storage
      const fileName = `emr_${Date.now()}.jpg`;
      const persistentUri = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.moveAsync({
        from: manipulated.uri,
        to: persistentUri,
      });

      const current = form.photos || [];
      setForm((prev) => ({
        ...prev,
        photos: [
          ...current,
          {
            uri: persistentUri,
            capturedAt: Date.now(),
          },
        ],
      }));
      setCameraVisible(false);
    } catch (e) {
      Alert.alert('Photo Error', e.message || 'Failed to capture photo.');
    } finally {
      setPhotoLoading(false);
    }
  };

  const removePhoto = (index) => {
    const current = form.photos || [];
    const updated = [...current];
    updated.splice(index, 1);
    setForm((prev) => ({ ...prev, photos: updated }));
  };

  const removeVoiceNote = (index) => {
    const current = form.voiceNotes || [];
    const updated = [...current];
    updated.splice(index, 1);
    setForm((prev) => ({ ...prev, voiceNotes: updated }));
  };

  const exportText = () => {
    if (!selected) return;
    const lines = INCIDENT_FIELDS.map((f) => `${f.label}: ${form[f.id] || ''}`);
    const voiceLines = (form.voiceNotes || []).map((n) => `VOICE NOTE: ${n}`);
    const photoLines = (form.photos || []).map((p, i) => `PHOTO ${i + 1}: ${p.uri}`);
    const report = [
      `INCIDENT REPORT: ${selected.title || 'Untitled'}`,
      `ID: ${selected.id}`,
      `Started: ${formatDate(selected.startedAt)}`,
      `Updated: ${formatDate(Date.now())}`,
      '',
      ...lines,
      '',
      ...voiceLines,
      '',
      ...photoLines,
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

            {/* Voice Dictation */}
            <View style={styles.mediaSection}>
              <Text style={styles.mediaTitle}>Voice Notes</Text>
              {voiceSupported ? (
                <>
                  <TouchableOpacity
                    style={[styles.mediaButton, isListening && styles.mediaButtonActive]}
                    onPress={toggleDictation}
                    activeOpacity={0.8}
                  >
                    <Icon name={isListening ? 'microphone' : 'microphone-outline'} size={20} color={isListening ? COLORS.danger : COLORS.gold} />
                    <Text style={[styles.mediaButtonText, isListening && { color: COLORS.danger }]}>
                      {isListening ? 'Listening... Tap to stop' : 'Dictate Note'}
                    </Text>
                  </TouchableOpacity>

                  {isListening && transcript.length > 0 && (
                    <View style={styles.transcriptBox}>
                      <Text style={styles.transcriptText}>{transcript}</Text>
                    </View>
                  )}

                  {transcript.length > 0 && !isListening && (
                    <TouchableOpacity style={styles.appendButton} onPress={appendTranscript}>
                      <Text style={styles.appendButtonText}>Append Transcript</Text>
                    </TouchableOpacity>
                  )}
                </>
              ) : (
                <Text style={styles.unsupportedText}>Speech recognition not available on this device.</Text>
              )}

              {(form.voiceNotes || []).map((note, index) => (
                <View key={index} style={styles.noteItem}>
                  <Icon name="microphone" size={16} color={COLORS.gold} />
                  <Text style={styles.noteText} numberOfLines={2}>{note}</Text>
                  <TouchableOpacity onPress={() => removeVoiceNote(index)}>
                    <Icon name="close-circle" size={20} color={COLORS.danger} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Photos */}
            <View style={styles.mediaSection}>
              <Text style={styles.mediaTitle}>Photos</Text>
              <TouchableOpacity style={styles.mediaButton} onPress={openCamera} activeOpacity={0.8}>
                <Icon name="camera" size={20} color={COLORS.gold} />
                <Text style={styles.mediaButtonText}>Attach Photo</Text>
              </TouchableOpacity>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScroll}>
                {(form.photos || []).map((photo, index) => (
                  <View key={index} style={styles.photoWrapper}>
                    <Image source={{ uri: photo.uri }} style={styles.photoThumb} />
                    <TouchableOpacity style={styles.photoRemove} onPress={() => removePhoto(index)}>
                      <Icon name="close-circle" size={22} color={COLORS.danger} />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>

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
              <View style={styles.incidentMeta}>
                {(incident.voiceNotes?.length > 0) && (
                  <View style={styles.metaItem}>
                    <Icon name="microphone" size={12} color={COLORS.textMuted} />
                    <Text style={styles.metaText}>{incident.voiceNotes.length}</Text>
                  </View>
                )}
                {(incident.photos?.length > 0) && (
                  <View style={styles.metaItem}>
                    <Icon name="camera" size={12} color={COLORS.textMuted} />
                    <Text style={styles.metaText}>{incident.photos.length}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Camera Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={cameraVisible}
        onRequestClose={() => setCameraVisible(false)}
      >
        <View style={styles.cameraContainer}>
          {cameraPermission ? (
            <Camera style={styles.camera} ref={cameraRef} ratio="4:3">
              <View style={styles.cameraControls}>
                <TouchableOpacity
                  style={styles.cameraClose}
                  onPress={() => setCameraVisible(false)}
                >
                  <Icon name="close" size={28} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.captureButton}
                  onPress={takePhoto}
                  disabled={photoLoading}
                >
                  {photoLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <View style={styles.captureInner} />
                  )}
                </TouchableOpacity>
              </View>
            </Camera>
          ) : (
            <View style={styles.cameraPermission}>
              <Text style={styles.cameraPermissionText}>Camera permission required.</Text>
              <TouchableOpacity style={styles.mediaButton} onPress={() => setCameraVisible(false)}>
                <Text style={styles.mediaButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
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
  mediaSection: {
    marginTop: SPACING.lg,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  mediaTitle: { color: COLORS.gold, fontSize: SIZES.md, fontWeight: '700', marginBottom: SPACING.base },
  mediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    marginBottom: SPACING.base,
  },
  mediaButtonActive: {
    backgroundColor: `${COLORS.danger}20`,
    borderColor: COLORS.danger,
  },
  mediaButtonText: { color: COLORS.text, fontSize: SIZES.md, fontWeight: '700', marginLeft: SPACING.base },
  transcriptBox: {
    backgroundColor: COLORS.backgroundAlt,
    borderRadius: 8,
    padding: SPACING.base,
    marginBottom: SPACING.base,
  },
  transcriptText: { color: COLORS.text, fontSize: SIZES.md },
  appendButton: {
    backgroundColor: COLORS.teal,
    borderRadius: 8,
    padding: SPACING.base,
    alignItems: 'center',
    marginBottom: SPACING.base,
  },
  appendButtonText: { color: COLORS.textInverse, fontWeight: '700' },
  unsupportedText: { color: COLORS.textMuted, fontSize: SIZES.sm, marginBottom: SPACING.base },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: SPACING.base,
    marginBottom: SPACING.sm,
  },
  noteText: { flex: 1, color: COLORS.text, fontSize: SIZES.sm, marginLeft: SPACING.sm, marginRight: SPACING.sm },
  photoScroll: { flexDirection: 'row', marginTop: SPACING.base },
  photoWrapper: {
    position: 'relative',
    marginRight: SPACING.base,
  },
  photoThumb: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
  },
  photoRemove: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.card,
    borderRadius: 12,
  },
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
  incidentMeta: { flexDirection: 'row', marginTop: SPACING.sm },
  metaItem: { flexDirection: 'row', alignItems: 'center', marginRight: SPACING.base },
  metaText: { color: COLORS.textMuted, fontSize: SIZES.sm, marginLeft: 2 },
  cameraContainer: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1, justifyContent: 'flex-end' },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  cameraClose: {
    position: 'absolute',
    left: SPACING.lg,
    bottom: SPACING.xl,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#000',
  },
  cameraPermission: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  cameraPermissionText: { color: COLORS.text, fontSize: SIZES.md, marginBottom: SPACING.lg },
});
