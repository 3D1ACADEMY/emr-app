import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SIZES, SPACING, SHADOWS } from '../constants/theme';

const ZONES = [
  {
    id: 'glabella',
    label: 'Glabella',
    artery: 'Supratrochlear / Supraorbital Arteries',
    risk: 'High',
    description: 'Vascular compromise here can affect the forehead and nasal dorsum. Early high-dose hyaluronidase is critical.',
    x: 150,
    y: 95,
    rx: 35,
    ry: 22,
  },
  {
    id: 'nose',
    label: 'Nose',
    artery: 'Dorsal Nasal / Lateral Nasal / Angular Arteries',
    risk: 'Critical',
    description: 'Nasal tip and alar sidewalls are high-risk zones. Blindness and skin necrosis risk.',
    path: 'M135,125 Q150,115 165,125 L160,170 Q150,180 140,170 Z',
  },
  {
    id: 'temple',
    label: 'Temples',
    artery: 'Superficial Temporal Artery',
    risk: 'High',
    description: 'Deep and superficial temporal planes can compromise the middle temporal vein and STA branches.',
    left: { cx: 70, cy: 105, rx: 32, ry: 45 },
    right: { cx: 230, cy: 105, rx: 32, ry: 45 },
  },
  {
    id: 'lips',
    label: 'Lips / Perioral',
    artery: 'Superior / Inferior Labial Arteries',
    risk: 'Moderate-High',
    description: 'Labial arteries run within the mucosal/submucosal planes. Monitor blanching and pain closely.',
    x: 150,
    y: 205,
    rx: 55,
    ry: 28,
  },
  {
    id: 'cheek',
    label: 'Mid-Cheek',
    artery: 'Facial / Angular Artery',
    risk: 'Moderate',
    description: 'Follow the trajectory of the facial artery. Treat widespread ischemia with multi-site infiltration.',
    left: { path: 'M80,150 Q110,140 130,170 L120,220 Q90,230 75,200 Z' },
    right: { path: 'M220,150 Q190,140 170,170 L180,220 Q210,230 225,200 Z' },
  },
];

export default function DangerZoneAtlasScreen({ navigation }) {
  const [selectedZone, setSelectedZone] = useState(null);

  const renderZone = (zone) => {
    const baseProps = {
      fill: `${COLORS.danger}30`,
      stroke: COLORS.danger,
      strokeWidth: 1.5,
      onPress: () => setSelectedZone(zone),
    };

    if (zone.path) {
      return <Path key={zone.id} d={zone.path} {...baseProps} />;
    }

    if (zone.left && zone.right) {
      if (zone.id === 'temple') {
        return [
          <Ellipse key={`${zone.id}-l`} cx={zone.left.cx} cy={zone.left.cy} rx={zone.left.rx} ry={zone.left.ry} {...baseProps} />,
          <Ellipse key={`${zone.id}-r`} cx={zone.right.cx} cy={zone.right.cy} rx={zone.right.rx} ry={zone.right.ry} {...baseProps} />,
        ];
      }
      return [
        <Path key={`${zone.id}-l`} d={zone.left.path} {...baseProps} />,
        <Path key={`${zone.id}-r`} d={zone.right.path} {...baseProps} />,
      ];
    }

    return (
      <Ellipse
        key={zone.id}
        cx={zone.x}
        cy={zone.y}
        rx={zone.rx}
        ry={zone.ry}
        {...baseProps}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Danger Zone Atlas</Text>
        <Text style={styles.subtitle}>
          Tap a facial zone to see at-risk arteries and emergency links.
        </Text>

        <View style={styles.faceContainer}>
          <Svg height="320" width="300" viewBox="0 0 300 320">
            {/* Face outline */}
            <Ellipse cx="150" cy="150" rx="110" ry="140" fill={COLORS.card} stroke={COLORS.borderStrong} strokeWidth="2" />
            {/* Hairline */}
            <Path d="M60,110 Q150,20 240,110" fill="none" stroke={COLORS.borderStrong} strokeWidth="2" />
            {/* Eyes */}
            <Ellipse cx="105" cy="130" rx="18" ry="10" fill={COLORS.background} stroke={COLORS.borderStrong} strokeWidth="1.5" />
            <Ellipse cx="195" cy="130" rx="18" ry="10" fill={COLORS.background} stroke={COLORS.borderStrong} strokeWidth="1.5" />
            {/* Tappable zones */}
            {ZONES.map(renderZone)}
            {/* Zone labels */}
            <text x="150" y="95" fill={COLORS.textMuted} fontSize="10" fontWeight="600" textAnchor="middle">Glabella</text>
            <text x="150" y="155" fill={COLORS.textMuted} fontSize="10" fontWeight="600" textAnchor="middle">Nose</text>
            <text x="70" y="105" fill={COLORS.textMuted} fontSize="10" fontWeight="600" textAnchor="middle">Temple</text>
            <text x="230" y="105" fill={COLORS.textMuted} fontSize="10" fontWeight="600" textAnchor="middle">Temple</text>
            <text x="150" y="205" fill={COLORS.textMuted} fontSize="10" fontWeight="600" textAnchor="middle">Lips</text>
            <text x="95" y="195" fill={COLORS.textMuted} fontSize="10" fontWeight="600" textAnchor="middle">Cheek</text>
            <text x="205" y="195" fill={COLORS.textMuted} fontSize="10" fontWeight="600" textAnchor="middle">Cheek</text>
          </Svg>
        </View>

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: `${COLORS.danger}50` }]} />
            <Text style={styles.legendText}>High-risk injection zones</Text>
          </View>
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent
        visible={!!selectedZone}
        onRequestClose={() => setSelectedZone(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.sheet}>
            {selectedZone && (
              <>
                <View style={styles.sheetHeader}>
                  <Text style={styles.sheetTitle}>{selectedZone.label}</Text>
                  <View style={[styles.riskBadge, { backgroundColor: selectedZone.risk === 'Critical' ? COLORS.danger : `${COLORS.danger}40` }]}>
                    <Text style={styles.riskText}>{selectedZone.risk} Risk</Text>
                  </View>
                </View>

                <ScrollView style={styles.sheetBody}>
                  <View style={styles.infoRow}>
                    <Icon name="arrow-right" size={18} color={COLORS.gold} />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>At-Risk Artery</Text>
                      <Text style={styles.infoValue}>{selectedZone.artery}</Text>
                    </View>
                  </View>

                  <View style={styles.infoRow}>
                    <Icon name="information" size={18} color={COLORS.gold} />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Clinical Note</Text>
                      <Text style={styles.infoValue}>{selectedZone.description}</Text>
                    </View>
                  </View>
                </ScrollView>

                <TouchableOpacity
                  style={styles.emergencyButton}
                  onPress={() => {
                    setSelectedZone(null);
                    navigation.navigate('VascularOcclusion');
                  }}
                  activeOpacity={0.8}
                >
                  <Icon name="heart-pulse" size={22} color="#fff" />
                  <Text style={styles.emergencyButtonText}>Open Vascular Occlusion Protocol</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setSelectedZone(null)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
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
  title: {
    color: COLORS.text,
    fontSize: SIZES.xxl,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: SIZES.md,
    marginBottom: SPACING.lg,
  },
  faceContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.backgroundAlt,
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.medium,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SPACING.xl,
    paddingBottom: SPACING.xxl,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    maxHeight: '80%',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sheetTitle: {
    color: COLORS.text,
    fontSize: SIZES.xxl,
    fontWeight: '800',
  },
  riskBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  riskText: {
    color: '#fff',
    fontSize: SIZES.xs,
    fontWeight: '800',
  },
  sheetBody: {
    maxHeight: 220,
    marginBottom: SPACING.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  infoContent: {
    flex: 1,
    marginLeft: SPACING.base,
  },
  infoLabel: {
    color: COLORS.gold,
    fontSize: SIZES.sm,
    fontWeight: '700',
    marginBottom: 2,
  },
  infoValue: {
    color: COLORS.text,
    fontSize: SIZES.md,
    lineHeight: 22,
  },
  emergencyButton: {
    backgroundColor: COLORS.danger,
    borderRadius: 12,
    padding: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.base,
    ...SHADOWS.medium,
  },
  emergencyButtonText: {
    color: '#fff',
    fontSize: SIZES.md,
    fontWeight: '800',
    marginLeft: SPACING.base,
  },
  closeButton: {
    padding: SPACING.base,
    alignItems: 'center',
  },
  closeButtonText: {
    color: COLORS.textMuted,
    fontSize: SIZES.md,
    fontWeight: '600',
  },
});
