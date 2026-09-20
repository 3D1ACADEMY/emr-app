import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';
import { COLORS, SIZES, SPACING } from '../constants/theme';
import ErrorBoundary from '../components/ErrorBoundary';
import FaceMapSvg from '../features/dangerZone/components/FaceMapSvg';
import ZoneList from '../features/dangerZone/components/ZoneList';
import ZoneDetailSheet from '../features/dangerZone/components/ZoneDetailSheet';
import AtlasErrorFallback from '../features/dangerZone/components/AtlasErrorFallback';
import {
  DANGER_ZONES,
  oldestReviewDate,
  PROTOCOL_ROUTES,
} from '../features/dangerZone/data/zones';

function MapSection({ orientation, selectedId, onSelect }) {
  return (
    <ErrorBoundary fallbackMessage="The anatomy map failed to render. The list below is still available.">
      <FaceMapSvg
        zones={DANGER_ZONES}
        orientation={orientation}
        selectedId={selectedId}
        onSelect={onSelect}
      />
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: `${COLORS.danger}50` }]} />
          <Text style={styles.legendText}>High-risk injection zones</Text>
        </View>
      </View>
    </ErrorBoundary>
  );
}

export default function DangerZoneAtlasScreen({ navigation }) {
  const [orientation, setOrientation] = useState('frontal');
  const [selectedZone, setSelectedZone] = useState(null);
  const [mapKey, setMapKey] = useState(0);

  const handleSelect = useCallback((zone) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setSelectedZone(zone);
  }, []);

  const handleOpenProtocol = useCallback(() => {
    setSelectedZone(null);
    navigation.navigate(PROTOCOL_ROUTES.vascularOcclusion);
  }, [navigation]);

  const handleOpenCalculator = useCallback(() => {
    setSelectedZone(null);
    navigation.navigate('Calculator');
  }, [navigation]);

  const handleRetryMap = useCallback(() => {
    setMapKey((k) => k + 1);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Danger Zone Atlas</Text>
            <Text style={styles.subtitle}>
              The anatomy in front of you while you plan the reversal.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.disclaimerLink}
            onPress={() => navigation.navigate('Disclaimer')}
            activeOpacity={0.8}
          >
            <Icon name="shield-check" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleButton, orientation === 'frontal' && styles.toggleActive]}
            onPress={() => setOrientation('frontal')}
            activeOpacity={0.8}
          >
            <Text style={[styles.toggleText, orientation === 'frontal' && styles.toggleTextActive]}>
              Frontal
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, orientation === 'lateral' && styles.toggleActive]}
            onPress={() => setOrientation('lateral')}
            activeOpacity={0.8}
          >
            <Text style={[styles.toggleText, orientation === 'lateral' && styles.toggleTextActive]}>
              Lateral
            </Text>
          </TouchableOpacity>
        </View>

        <ErrorBoundary
          fallback={<AtlasErrorFallback onRetry={handleRetryMap} />}
        >
          <MapSection
            key={mapKey}
            orientation={orientation}
            selectedId={selectedZone?.id}
            onSelect={handleSelect}
          />
        </ErrorBoundary>

        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Jump to Zone</Text>
          <Text style={styles.listSubtitle}>
            If the map is hard to read, search or tap a zone here.
          </Text>
        </View>

        <View style={styles.listContainer}>
          <ZoneList zones={DANGER_ZONES} onSelect={handleSelect} />
        </View>

        <Text style={styles.footer}>
          Clinical content reviewed to {oldestReviewDate()}. Educational reference only.
        </Text>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent
        visible={!!selectedZone}
        onRequestClose={() => setSelectedZone(null)}
      >
        <ZoneDetailSheet
          zone={selectedZone}
          onClose={() => setSelectedZone(null)}
          onOpenProtocol={handleOpenProtocol}
          onOpenCalculator={handleOpenCalculator}
        />
      </Modal>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  title: {
    color: COLORS.text,
    fontSize: SIZES.xxl,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: SIZES.md,
  },
  disclaimerLink: {
    padding: SPACING.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 10,
    padding: 4,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleActive: {
    backgroundColor: COLORS.gold,
  },
  toggleText: {
    color: COLORS.textMuted,
    fontSize: SIZES.md,
    fontWeight: '700',
  },
  toggleTextActive: {
    color: COLORS.textInverse,
  },
  legend: {
    marginTop: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  legendText: {
    color: COLORS.textMuted,
    fontSize: SIZES.md,
  },
  listHeader: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.base,
  },
  listTitle: {
    color: COLORS.gold,
    fontSize: SIZES.lg,
    fontWeight: '800',
  },
  listSubtitle: {
    color: COLORS.textMuted,
    fontSize: SIZES.sm,
    marginTop: 2,
  },
  listContainer: {
    minHeight: 260,
  },
  footer: {
    color: COLORS.textMuted,
    fontSize: SIZES.sm,
    textAlign: 'center',
    marginTop: SPACING.lg,
  },
});
