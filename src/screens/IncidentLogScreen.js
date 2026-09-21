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
import * as Haptics from 'expo-haptics';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Audio } from 'expo-av';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SIZES, SPACING, SHADOWS } from '../constants/theme';
import { INCIDENT_FIELDS } from '../constants/emergencyData';
import { getIncidents, saveIncident, deleteIncident } from '../utils/secureStorage';
import { formatDate, generateId } from '../utils/helpers';

export default function IncidentLogScreen({ route }) {
  const prefillId = route.params?.incidentId;
  const [incidents, setIncidents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({});
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editIncident, setEditIncident] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // Audio recording state
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  // Camera state
  const [cameraVisible, setCameraVisible] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const cameraRef = useRef(null);

  // Audio playback state
  const [sound, setSound] = useState(null);
  const [playingUri, setPlayingUri] = useState(null);
  const [playbackStatus, setPlaybackStatus] = useState(null);

  useEffect(() => {
    loadIncidents();
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync().catch(() => {});
      }
      if (sound) {
        sound.unloadAsync().catch(() => {});
      }
    };
  }, []);

  const loadIncidents = async () => {
    const data = await getIncidents();
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
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const incident = {
        ...(selected || { id: generateId('I') }),
        ...form,
        updatedAt: Date.now(),
        status: 'completed',
      };
      await saveIncident(incident);
      await loadIncidents();
      setSelected(null);
      setForm({});
      Alert.alert('Saved', 'Incident log saved securely.');
    } catch (e) {
      console.error('Failed to save incident:', e);
      Alert.alert('Save Failed', e?.message || 'Could not save the incident. Storage may be full or locked.');
    }
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

  const openEditModal = (incident) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditIncident(incident);
    setEditTitle(incident.title || '');
    setEditNotes(incident.notes || '');
    setEditModalVisible(true);
  };

  const saveEdit = async () => {
    if (!editIncident) return;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const updated = { ...editIncident, title: editTitle.trim() || editIncident.title, notes: editNotes, updatedAt: Date.now() };
      await saveIncident(updated);
      await loadIncidents();
      if (selected?.id === editIncident.id) {
        setSelected(updated);
        setForm(updated);
      }
      setEditModalVisible(false);
      Alert.alert('Saved', 'Incident updated.');
    } catch (e) {
      Alert.alert('Error', 'Could not update incident: ' + e.message);
    }
  };

  const updateField = (fieldId, value) => {
    setForm((prev) => ({ ...prev, [fieldId]: value }));
  };

  // -------------------- Audio Notes --------------------

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Microphone access is needed for audio notes.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);
      setIsRecording(true);
    } catch (e) {
      Alert.alert('Recording Error', e.message || 'Could not start audio recording.');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    setIsRecording(false);
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      const incidentId = selected?.id || generateId('I');
      const dir = `${FileSystem.documentDirectory}audio/`;
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
      const permanentUri = `${dir}${incidentId}_${Date.now()}.m4a`;
      await FileSystem.moveAsync({ from: uri, to: permanentUri });

      const note = {
        uri: permanentUri,
        capturedAt: Date.now(),
      };
      const current = form.voiceNotes || [];
      setForm((prev) => ({
        ...prev,
        voiceNotes: [...current, note],
      }));
      Alert.alert('Audio Saved', 'Voice note attached to incident.');
    } catch (e) {
      Alert.alert('Recording Error', e.message || 'Could not save audio note.');
    } finally {
      setRecording(null);
    }
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

  const handleDeleteIncident = (id) => {
    Alert.alert(
      'Delete Incident Log',
      'This will permanently remove this incident and its attachments. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await deleteIncident(id);
            await loadIncidents();
            if (selected?.id === id) {
              setSelected(null);
              setForm({});
            }
          },
        },
      ]
    );
  };

  const playVoiceNote = async (uri) => {
    try {
      // Stop any currently playing sound
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
      }
      if (playingUri === uri) {
        setPlayingUri(null);
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        staysActiveInBackground: false,
      });

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true },
        (status) => {
          setPlaybackStatus(status);
          if (status?.didJustFinish) {
            setPlayingUri(null);
          }
        }
      );
      setSound(newSound);
      setPlayingUri(uri);
    } catch (e) {
      Alert.alert('Playback Error', e?.message || 'Could not play audio note.');
      setPlayingUri(null);
    }
  };

  const stopVoiceNote = async () => {
    try {
      if (sound) {
        await sound.stopAsync();
      }
    } catch (e) {
      // ignore
    }
    setPlayingUri(null);
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

  const exportPDF = async () => {
    if (!selected) return;
    try {
      const fieldRows = INCIDENT_FIELDS.map((f) => `
        <tr>
          <td style="padding:8px;border:1px solid #334155;font-weight:bold;color:#f3ede0;background:#0b0e17;width:35%">${f.label}</td>
          <td style="padding:8px;border:1px solid #334155;color:#f3ede0;background:#141a30">${form[f.id] || ''}</td>
        </tr>
      `).join('');

      const voiceRows = (form.voiceNotes || []).map((n, i) => `
        <tr>
          <td style="padding:8px;border:1px solid #334155;color:#f3ede0;background:#141a30">Audio ${i + 1}</td>
          <td style="padding:8px;border:1px solid #334155;color:#f3ede0;background:#141a30">${formatDate(n.capturedAt)}</td>
        </tr>
      `).join('');

      const photoRows = (form.photos || []).map((p, i) => `
        <tr>
          <td style="padding:8px;border:1px solid #334155;color:#f3ede0;background:#141a30">Photo ${i + 1}</td>
          <td style="padding:8px;border:1px solid #334155;color:#f3ede0;background:#141a30">${formatDate(p.capturedAt)}</td>
        </tr>
      `).join('');

      const html = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: Arial, sans-serif; background: #0b0e17; color: #f3ede0; padding: 24px; }
              h1 { color: #D4AF37; font-size: 22px; }
              h2 { color: #D4AF37; font-size: 16px; margin-top: 24px; }
              table { width: 100%; border-collapse: collapse; margin-top: 12px; }
              td { font-size: 13px; }
              .footer { margin-top: 32px; font-size: 11px; color: #94a3b8; text-align: center; }
            </style>
          </head>
          <body>
            <h1>CEMS Incident Report</h1>
            <p><strong>ID:</strong> ${selected.id}</p>
            <p><strong>Title:</strong> ${selected.title || 'Untitled'}</p>
            <p><strong>Started:</strong> ${formatDate(selected.startedAt)}</p>
            <p><strong>Exported:</strong> ${formatDate(Date.now())}</p>

            <h2>Incident Details</h2>
            <table>${fieldRows}</table>

            ${voiceRows ? `<h2>Audio Notes</h2><table>${voiceRows}</table>` : ''}
            ${photoRows ? `<h2>Photos</h2><table>${photoRows}</table>` : ''}

            <div class="footer">
              Generated by CEMS Mobile App | 3D Rejuvenation Academy | Educational reference only.
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      const fileName = `CEMS_Incident_${selected.id.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      const pdfUri = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.moveAsync({ from: uri, to: pdfUri });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(pdfUri, { mimeType: 'application/pdf', dialogTitle: 'Share Incident Report' });
      } else {
        Alert.alert('PDF Saved', `Report saved to app storage:\n${pdfUri}`);
      }
    } catch (e) {
      console.error('PDF export failed:', e);
      Alert.alert('Export Failed', e?.message || 'Could not generate PDF.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scroll}>
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
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                />
              </View>
            ))}

            {/* Audio Notes */}
            <View style={styles.mediaSection}>
              <Text style={styles.mediaTitle}>Audio Notes</Text>
              <TouchableOpacity
                style={[styles.mediaButton, isRecording && styles.mediaButtonActive]}
                onPress={isRecording ? stopRecording : startRecording}
                activeOpacity={0.8}
              >
                <Icon name={isRecording ? 'stop' : 'microphone-outline'} size={20} color={isRecording ? COLORS.danger : COLORS.gold} />
                <Text style={[styles.mediaButtonText, isRecording && { color: COLORS.danger }]}>
                  {isRecording ? 'Recording... Tap to stop' : 'Record Audio Note'}
                </Text>
              </TouchableOpacity>

              {(form.voiceNotes || []).map((note, index) => {
                const isPlaying = playingUri === note.uri;
                return (
                  <View key={index} style={styles.noteItem}>
                    <TouchableOpacity onPress={() => isPlaying ? stopVoiceNote() : playVoiceNote(note.uri)}>
                      <Icon name={isPlaying ? 'stop' : 'play'} size={20} color={isPlaying ? COLORS.danger : COLORS.gold} />
                    </TouchableOpacity>
                    <Text style={styles.noteText} numberOfLines={2}>
                      {formatDate(note.capturedAt)}
                    </Text>
                    <TouchableOpacity onPress={() => removeVoiceNote(index)}>
                      <Icon name="close-circle" size={20} color={COLORS.danger} />
                    </TouchableOpacity>
                  </View>
                );
              })}
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
              <View style={styles.exportRow}>
                <TouchableOpacity style={styles.exportButton} onPress={exportText}>
                  <Icon name="file-document" size={18} color={COLORS.gold} />
                  <Text style={styles.exportButtonText}>Preview Report</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.exportButton, styles.exportPdfButton]} onPress={exportPDF}>
                  <Icon name="file-pdf-box" size={18} color={COLORS.textInverse} />
                  <Text style={[styles.exportButtonText, styles.exportPdfButtonText]}>Export PDF</Text>
                </TouchableOpacity>
              </View>
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
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={[styles.statusBadge, { backgroundColor: incident.status === 'completed' ? COLORS.success : COLORS.warning }]}>
                    <Text style={styles.statusText}>{incident.status}</Text>
                  </View>
                  <TouchableOpacity onPress={() => openEditModal(incident)} style={{ marginLeft: SPACING.sm }}>
                    <Icon name="pencil-outline" size={20} color={COLORS.gold} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteIncident(incident.id)} style={{ marginLeft: SPACING.sm }}>
                    <Icon name="trash-can-outline" size={20} color={COLORS.danger} />
                  </TouchableOpacity>
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

      {/* Edit Incident Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.editModalOverlay}>
          <View style={styles.editModal}>
            <Text style={styles.editModalTitle}>Edit Incident</Text>
            <Text style={styles.editModalLabel}>Title</Text>
            <TextInput
              style={styles.editModalInput}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="Incident title"
              placeholderTextColor={COLORS.textMuted}
            />
            <Text style={styles.editModalLabel}>Notes</Text>
            <TextInput
              style={[styles.editModalInput, { height: 100, textAlignVertical: 'top' }]}
              value={editNotes}
              onChangeText={setEditNotes}
              placeholder="Additional notes"
              placeholderTextColor={COLORS.textMuted}
              multiline
            />
            <View style={styles.editModalActions}>
              <TouchableOpacity
                style={[styles.editModalButton, { backgroundColor: COLORS.surface }]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={{ color: COLORS.text, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.editModalButton, { backgroundColor: COLORS.gold }]}
                onPress={saveEdit}
              >
                <Text style={{ color: '#0F2440', fontWeight: '700' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollView: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SPACING.lg, paddingBottom: SPACING.xxl, backgroundColor: COLORS.background },
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
  exportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
    gap: SPACING.base,
  },
  exportButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: 10,
  },
  exportPdfButton: {
    backgroundColor: COLORS.danger,
    borderColor: COLORS.danger,
  },
  exportButtonText: { color: COLORS.gold, fontWeight: '700', marginLeft: SPACING.sm },
  exportPdfButtonText: { color: COLORS.textInverse },
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
  editModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: SPACING.lg },
  editModal: { backgroundColor: COLORS.card, borderRadius: 16, padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.border },
  editModalTitle: { color: COLORS.gold, fontSize: SIZES.lg, fontWeight: '700', marginBottom: SPACING.base },
  editModalLabel: { color: COLORS.textMuted, fontSize: SIZES.sm, fontWeight: '600', marginBottom: SPACING.sm, marginTop: SPACING.base },
  editModalInput: { backgroundColor: COLORS.background, borderRadius: 10, padding: SPACING.base, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border },
  editModalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: SPACING.lg, gap: SPACING.base },
  editModalButton: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.base, borderRadius: 10 },
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
