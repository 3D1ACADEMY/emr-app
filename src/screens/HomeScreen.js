import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SIZES, SPACING, SHADOWS } from '../constants/theme';
import { storage } from '../utils/storage';
import { isAtlasAvailable } from '../features/dangerZone/data/zones';

export default function HomeScreen({ navigation }) {
  const [incidentCount, setIncidentCount] = useState(0);
  const [lastIncident, setLastIncident] = useState(null);
  const [patients, setPatients] = useState([]);
  const [currentPatient, setCurrentPatient] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      const incidents = await storage.getIncidents();
      setIncidentCount(incidents.length);
      if (incidents.length > 0) {
        setLastIncident(incidents[incidents.length - 1]);
      }
      const pts = await storage.getPatients();
      setPatients(pts);
      if (pts.length > 0) {
        setCurrentPatient(pts[pts.length - 1]);
      }
    };
    loadStats();
    const unsubscribe = navigation.addListener('focus', loadStats);
    return unsubscribe;
  }, [navigation]);

  const activeIncidents = lastIncident && lastIncident.status === 'active' ? 1 : 0;

  const navigateToAtlas = () => {
    if (!isAtlasAvailable()) {
      Alert.alert('Unavailable', 'The Danger Zone Atlas is not available right now.');
      return;
    }
    try {
      navigation.navigate('DangerZoneAtlas');
    } catch (e) {
      console.error('Danger Zone Atlas navigation failed:', e);
      Alert.alert('Navigation Error', 'Could not open Danger Zone Atlas. Use the protocol list instead.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>3D REJUVENATION ACADEMY</Text>
            <Text style={styles.title}>CEMS</Text>
            <Text style={styles.subtitle}>Dr. Amr Ismail, MD</Text>
          </View>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>3D</Text>
          </View>
        </View>

        {/* Critical Alerts */}
        <TouchableOpacity
          style={[styles.alertBanner, activeIncidents > 0 && styles.alertBannerActive]}
          onPress={() => navigation.navigate('IncidentLog')}
          activeOpacity={0.8}
        >
          <Icon name="alert-circle" size={24} color={activeIncidents > 0 ? COLORS.danger : COLORS.gold} />
          <View style={styles.alertTextContainer}>
            <Text style={[styles.alertTitle, activeIncidents > 0 && { color: COLORS.danger }]}>
              Critical Alerts
            </Text>
            <Text style={styles.alertSubtitle}>
              {activeIncidents > 0
                ? `${activeIncidents} active incident${activeIncidents > 1 ? 's' : ''}`
                : `${incidentCount} incidents logged`}
            </Text>
          </View>
          <Icon name="chevron-right" size={24} color={COLORS.textMuted} />
        </TouchableOpacity>

        {/* Current Patient */}
        <TouchableOpacity
          style={styles.patientCard}
          onPress={() => navigation.navigate('Patient')}
          activeOpacity={0.8}
        >
          <View style={styles.patientIcon}>
            <Icon name="account" size={28} color={COLORS.gold} />
          </View>
          <View style={styles.patientInfo}>
            <Text style={styles.patientLabel}>Current Patient</Text>
            <Text style={styles.patientName}>
              {currentPatient ? currentPatient.initials : 'No patient selected'}
            </Text>
            {currentPatient?.age ? (
              <Text style={styles.patientMeta}>
                Age: {currentPatient.age} | Weight: {currentPatient.weight} kg
              </Text>
            ) : (
              <Text style={styles.patientMeta}>Tap to add or select patient context</Text>
            )}
          </View>
          <Icon name="chevron-right" size={24} color={COLORS.textMuted} />
        </TouchableOpacity>

        {/* Main Emergency CTA */}
        <TouchableOpacity
          style={styles.emergencyButton}
          onPress={() => navigation.navigate('Emergency')}
          activeOpacity={0.85}
        >
          <Icon name="heart-pulse" size={42} color="#fff" />
          <View style={styles.emergencyTextContainer}>
            <Text style={styles.emergencyTitle}>ACTIVATE EMERGENCY</Text>
            <Text style={styles.emergencySubtitle}>Immediate protocols & calculators</Text>
          </View>
          <Icon name="arrow-right" size={28} color="#fff" />
        </TouchableOpacity>

        {/* Action Grid */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.toolsGrid}>
          <ToolButton icon="face-recognition" label="Danger Zones" onPress={navigateToAtlas} />
          <ToolButton icon="needle" label="Filler Injection" onPress={navigateToAtlas} />
          <ToolButton icon="syringe" label="Botox Treatment" onPress={() => navigation.navigate('Calculator')} />
          <ToolButton icon="account-injury" label="Patient Records" onPress={() => navigation.navigate('Patient')} />
          <ToolButton icon="heart-pulse" label="Emergency Protocols" onPress={() => navigation.navigate('Emergency')} />
          <ToolButton icon="file-document-edit" label="Procedures Log" onPress={() => navigation.navigate('IncidentLog')} />
          <ToolButton icon="clipboard-text" label="Treatment Plans" onPress={() => navigation.navigate('Emergency')} />
          <ToolButton icon="calculator" label="Dosage Calculator" onPress={() => navigation.navigate('Calculator')} />
          <ToolButton icon="map-marker-radius" label="Facilities" onPress={() => navigation.navigate('FacilityLocator')} />
          <ToolButton icon="pill" label="Medication Mgmt" onPress={() => navigation.navigate('Calculator')} />
          <ToolButton icon="timer" label="Treatment Timer" onPress={() => navigation.navigate('Timer')} />
          <ToolButton icon="file-document" label="View History" onPress={() => navigation.navigate('IncidentLog')} />
        </View>

        {/* Bottom shortcut bar */}
        <View style={styles.bottomBar}>
          <BottomButton icon="account-group" label="Patients" onPress={() => navigation.navigate('Patient')} />
          <BottomButton icon="heart-pulse" label="Protocols" onPress={() => navigation.navigate('Emergency')} />
          <BottomButton icon="bell-alert" label="Alerts" onPress={() => navigation.navigate('IncidentLog')} />
          <BottomButton icon="shield-account" label="Profile" onPress={() => navigation.navigate('Disclaimer')} />
        </View>

        <Text style={styles.footer}>www.3drejuvenationcode.com</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function ToolButton({ icon, label, onPress }) {
  return (
    <TouchableOpacity style={styles.toolButton} onPress={onPress} activeOpacity={0.8}>
      <Icon name={icon} size={24} color={COLORS.gold} />
      <Text style={styles.toolLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function BottomButton({ icon, label, onPress }) {
  return (
    <TouchableOpacity style={styles.bottomButton} onPress={onPress} activeOpacity={0.8}>
      <Icon name={icon} size={22} color={COLORS.textMuted} />
      <Text style={styles.bottomLabel}>{label}</Text>
    </TouchableOpacity>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  brand: {
    color: COLORS.gold,
    fontSize: SIZES.xs,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  title: {
    color: COLORS.text,
    fontSize: SIZES.xxl,
    fontWeight: '800',
    lineHeight: 34,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: SIZES.md,
    marginTop: 2,
  },
  logoCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: COLORS.textInverse,
    fontWeight: '900',
    fontSize: SIZES.lg,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.base,
    marginBottom: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  alertBannerActive: {
    borderColor: COLORS.danger,
    backgroundColor: `${COLORS.danger}10`,
  },
  alertTextContainer: {
    flex: 1,
    marginLeft: SPACING.base,
  },
  alertTitle: {
    color: COLORS.text,
    fontSize: SIZES.md,
    fontWeight: '700',
  },
  alertSubtitle: {
    color: COLORS.textMuted,
    fontSize: SIZES.sm,
    marginTop: 2,
  },
  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.base,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  patientIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${COLORS.gold}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  patientInfo: {
    flex: 1,
    marginLeft: SPACING.base,
  },
  patientLabel: {
    color: COLORS.textMuted,
    fontSize: SIZES.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  patientName: {
    color: COLORS.text,
    fontSize: SIZES.lg,
    fontWeight: '700',
    marginTop: 2,
  },
  patientMeta: {
    color: COLORS.textMuted,
    fontSize: SIZES.sm,
    marginTop: 2,
  },
  emergencyButton: {
    backgroundColor: COLORS.danger,
    borderRadius: 16,
    padding: SPACING.xl,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    ...SHADOWS.large,
  },
  emergencyTextContainer: {
    flex: 1,
    marginLeft: SPACING.base,
  },
  emergencyTitle: {
    color: '#fff',
    fontSize: SIZES.lg,
    fontWeight: '800',
  },
  emergencySubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: SIZES.sm,
    marginTop: 2,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: SIZES.lg,
    fontWeight: '700',
    marginBottom: SPACING.base,
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  toolButton: {
    width: '32%',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.sm,
    alignItems: 'center',
    marginBottom: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 90,
    justifyContent: 'center',
  },
  toolLabel: {
    color: COLORS.text,
    fontSize: SIZES.xs,
    fontWeight: '600',
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingVertical: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  bottomButton: {
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
  },
  bottomLabel: {
    color: COLORS.textMuted,
    fontSize: SIZES.xs,
    marginTop: 4,
  },
  footer: {
    textAlign: 'center',
    color: COLORS.textMuted,
    fontSize: SIZES.sm,
    marginTop: SPACING.base,
  },
});
