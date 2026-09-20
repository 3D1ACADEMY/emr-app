import React, { useState, useRef } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Modal,
  Text,
} from 'react-native';
import {
  PinchGestureHandler,
  PanGestureHandler,
  TapGestureHandler,
  State,
} from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';
import { COLORS, SIZES, SPACING } from '../../../constants/theme';

const { width: SCREEN_W } = Dimensions.get('window');
const IMAGE_W = 839;
const IMAGE_H = 1084;
const DISPLAY_W = SCREEN_W - SPACING.lg * 2 - 32; // padding inside card
const DISPLAY_H = (DISPLAY_W * IMAGE_H) / IMAGE_W;

/**
 * Relative touch zones on the frontal atlas image.
 * Coordinates are percentages of image width/height (0-100).
 * These are initial approximations and should be refined against the actual image.
 */
const FRONTAL_ZONES = {
  supratrochlear:    [{ x: 42, y: 16, w: 16, h:  8 }],
  supraorbital:      [{ x: 20, y: 24, w: 18, h:  6 }, { x: 62, y: 24, w: 18, h:  6 }],
  frontalBranch:     [{ x:  6, y: 26, w: 14, h: 16 }, { x: 80, y: 26, w: 14, h: 16 }],
  dorsalNasal:       [{ x: 44, y: 30, w: 12, h: 16 }],
  infraorbital:      [{ x: 28, y: 36, w: 14, h:  7 }, { x: 58, y: 36, w: 14, h:  7 }],
  angular:           [{ x: 30, y: 45, w: 12, h: 16 }, { x: 58, y: 45, w: 12, h: 16 }],
  transverseFacial:  [{ x: 16, y: 50, w: 12, h: 12 }, { x: 72, y: 50, w: 12, h: 12 }],
  zygomaticofacial:  [{ x: 22, y: 52, w: 14, h: 12 }, { x: 64, y: 52, w: 14, h: 12 }],
  labial:            [{ x: 40, y: 63, w: 20, h:  8 }],
  mental:            [{ x: 42, y: 74, w: 16, h:  8 }],
};

function getRiskColor(tier, isSelected) {
  switch (tier) {
    case 'critical':
      return isSelected ? `${COLORS.danger}90` : `${COLORS.danger}55`;
    case 'high':
      return isSelected ? `#E87C2B99` : `#E87C2B55`;
    case 'moderate':
      return isSelected ? `${COLORS.gold}99` : `${COLORS.gold}55`;
    default:
      return `${COLORS.textMuted}55`;
  }
}

export default function FaceMapImage({ zones, selectedId, onSelect, onShowLipDetail }) {
  const [showLipModal, setShowLipModal] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const lastScale = useRef(1);
  const lastTranslate = useRef({ x: 0, y: 0 });

  const reset = () => {
    lastScale.current = 1;
    lastTranslate.current = { x: 0, y: 0 };
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 8 }),
      Animated.spring(translateX, { toValue: 0, useNativeDriver: true, friction: 8 }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, friction: 8 }),
    ]).start();
  };

  const onPinchEvent = Animated.event([{ nativeEvent: { scale } }], { useNativeDriver: true });
  const onPinchStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      lastScale.current *= event.nativeEvent.scale || 1;
      lastScale.current = Math.max(1, Math.min(lastScale.current, 4));
      scale.setValue(lastScale.current);
    }
  };

  const onPanEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX, translationY: translateY } }],
    { useNativeDriver: true }
  );
  const onPanStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      lastTranslate.current.x += event.nativeEvent.translationX || 0;
      lastTranslate.current.y += event.nativeEvent.translationY || 0;
      translateX.setValue(lastTranslate.current.x);
      translateY.setValue(lastTranslate.current.y);
    }
  };

  const onDoubleTapStateChange = (event) => {
    if (event.nativeEvent.state === State.END) reset();
  };

  const transform = [{ scale }, { translateX }, { translateY }];

  const handlePress = (zone) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onSelect(zone);
  };

  return (
    <View style={styles.container}>
      <TapGestureHandler onHandlerStateChange={onDoubleTapStateChange} numberOfTaps={2}>
        <Animated.View>
          <PinchGestureHandler onGestureEvent={onPinchEvent} onHandlerStateChange={onPinchStateChange}>
            <Animated.View>
              <PanGestureHandler
                onGestureEvent={onPanEvent}
                onHandlerStateChange={onPanStateChange}
                minDist={10}
                avgTouches
              >
                <Animated.View style={[styles.imageWrap, { transform }]}>
                  <Image
                    source={require('../assets/danger-zones-atlas.png')}
                    style={{ width: DISPLAY_W, height: DISPLAY_H }}
                    resizeMode="contain"
                    accessibilityLabel="Danger zone atlas frontal view. Tap a zone for details."
                  />
                  {zones.map((zone) => {
                    const shapes = FRONTAL_ZONES[zone.id];
                    if (!shapes) return null;
                    return shapes.map((s, idx) => {
                      const isSelected = selectedId === zone.id;
                      return (
                        <TouchableOpacity
                          key={`${zone.id}-${idx}`}
                          style={[
                            styles.zone,
                            {
                              left: (s.x / 100) * DISPLAY_W,
                              top: (s.y / 100) * DISPLAY_H,
                              width: (s.w / 100) * DISPLAY_W,
                              height: (s.h / 100) * DISPLAY_H,
                              backgroundColor: getRiskColor(zone.riskTier, isSelected),
                              borderColor: isSelected ? COLORS.gold : 'transparent',
                            },
                          ]}
                          onPress={() => handlePress(zone)}
                          activeOpacity={0.7}
                          accessibilityLabel={`${zone.name} \u2014 ${zone.region}, ${zone.riskTier} risk`}
                          accessibilityRole="button"
                        />
                      );
                    });
                  })}
                </Animated.View>
              </PanGestureHandler>
            </Animated.View>
          </PinchGestureHandler>
        </Animated.View>
      </TapGestureHandler>

      <TouchableOpacity
        style={styles.lipButton}
        onPress={() => setShowLipModal(true)}
        activeOpacity={0.8}
      >
        <Icon name="lipstick" size={18} color={COLORS.textInverse} />
        <Text style={styles.lipButtonText}>Lip Vascular Supply</Text>
      </TouchableOpacity>

      <Modal
        visible={showLipModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLipModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Lip Vascular Supply</Text>
              <TouchableOpacity onPress={() => setShowLipModal(false)}>
                <Icon name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <Image
              source={require('../assets/lip-vascular-supply.png')}
              style={styles.lipImage}
              resizeMode="contain"
            />
            <Text style={styles.source}>
              Source: Cosmetic Dermatology Atlas by Dr. Amr Ismail, MD | Founder of 3D Rejuvenation Academy, May 2026
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: COLORS.backgroundAlt,
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  imageWrap: {
    position: 'relative',
    width: DISPLAY_W,
    height: DISPLAY_H,
  },
  zone: {
    position: 'absolute',
    borderWidth: 1,
    borderRadius: 8,
  },
  lipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gold,
    borderRadius: 10,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  lipButtonText: {
    color: COLORS.textInverse,
    fontSize: SIZES.md,
    fontWeight: '800',
    marginLeft: SPACING.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  modalSheet: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.base,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: SIZES.lg,
    fontWeight: '800',
  },
  lipImage: {
    width: '100%',
    height: 280,
    borderRadius: 8,
  },
  source: {
    color: COLORS.textMuted,
    fontSize: SIZES.sm,
    marginTop: SPACING.base,
    textAlign: 'center',
  },
});
