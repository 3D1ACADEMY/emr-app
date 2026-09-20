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

  useEffect(() => {
    const loadStats = async () => {
      const incidents = await storage.getIncidents();
      setIncidentCount(incidents.length);
      if (incidents.length > 0) {
        setLastIncident(incidents[incidents.length - 1]);
      }
    };
    loadStats();
    const unsubscribe = navigation.addListener('focus', loadStats);
    return unsubscribe;
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>3D REJUVENATION ACADEMY</Text>
            <Text style={styles.title}>EMR Clinical Emergency</Text>
            <Text style={styles.subtitle}>Dr. Amr Ismail, MD</Text>
          </View>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>3D</Text>
          </View>
        </View>

        {/* Emergency CTA */}
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

        {/* Quick Tools */}
        <Text style={styles.sectionTitle}>Quick Tools</Text>
        <View style={styles.toolsGrid}>
          <ToolButton
            icon="heart-pulse"
            label="Vascular Occlusion"
            onPress={() => navigation.navigate('VascularOcclusion')}
          />
          <ToolButton
            icon="alert-circle"
            label="Anaphylaxis"
            onPress={() => navigation.navigate('Anaphylaxis')}
          />
          <ToolButton
            icon="timer"
            label="Treatment Timer"
            onPress={() => navigation.navigate('Timer')}
          />
          <ToolButton
            icon="account-injury"
            label="Patient"
            onPress={() => navigation.navigate('Patient')}
          />
          <ToolButton
            icon="calculator"
            label="Calculators"
            onPress={() => navigation.navigate('Calculator')}
          />
          <ToolButton
            icon="face-recognition"
            label="Danger Zones"
            onPress={() => {
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
            }}
          />
          <ToolButton
            icon="map-marker-radius"
            label="Facilities"
            onPress={() => navigation.navigate('FacilityLocator')}
          />
        </View>

        {/* Stats / Recent */}
        <Text style={styles.sectionTitle}>Incident Activity</Text>
        <TouchableOpacity
          style={styles.statsCard}
          onPress={() => navigation.navigate('IncidentLog')}
          activeOpacity={0.8}
        >
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{incidentCount}</Text>
            <Text style={styles.statLabel}>Total Incidents</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{lastIncident ? '#' + lastIncident.id.slice(-4) : '—'}</Text>
            <Text style={styles.statLabel}>Last Recorded</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.footer}>www.3drejuvenationcode.com</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function ToolButton({ icon, label, onPress }) {
  return (
    <TouchableOpacity style={styles.toolButton} onPress={onPress} activeOpacity={0.8}>
      <Icon name={icon} size={28} color={COLORS.gold} />
      <Text style={styles.toolLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    padding: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
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
  emergencyButton: {
    backgroundColor: COLORS.danger,
    borderRadius: 16,
    padding: SPACING.xl,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
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
    marginTop: SPACING.base,
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  toolButton: {
    width: '48%',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  toolLabel: {
    color: COLORS.text,
    fontSize: SIZES.sm,
    fontWeight: '600',
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  statsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.xl,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    color: COLORS.gold,
    fontSize: SIZES.xxl,
    fontWeight: '800',
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: SIZES.sm,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
  },
  footer: {
    textAlign: 'center',
    color: COLORS.textMuted,
    fontSize: SIZES.sm,
    marginTop: SPACING.xl,
  },
});
