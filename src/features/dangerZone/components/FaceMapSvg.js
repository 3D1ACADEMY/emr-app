import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import {
  PinchGestureHandler,
  PanGestureHandler,
  TapGestureHandler,
  State,
} from 'react-native-gesture-handler';
import Svg, { Ellipse, Path, Text as SvgText, G } from 'react-native-svg';
import { COLORS, SPACING } from '../../../constants/theme';

const VIEWBOX = { width: 300, height: 320 };

/**
 * SVG path map for each zone id.
 * Frontal and lateral arrays allow a zone to appear on one or both views.
 */
const ZONE_PATHS = {
  supratrochlear: {
    frontal: [
      { path: 'M130,80 Q150,70 170,80 L165,105 Q150,112 135,105 Z', labelX: 150, labelY: 95 },
    ],
  },
  supraorbital: {
    frontal: [
      { path: 'M85,118 Q105,112 125,118 L122,128 Q105,124 88,128 Z', labelX: 105, labelY: 123 },
      { path: 'M175,118 Q195,112 215,118 L212,128 Q195,124 178,128 Z', labelX: 195, labelY: 123 },
    ],
  },
  angular: {
    frontal: [
      { path: 'M125,135 Q140,165 145,200 L132,205 Q128,170 115,140 Z', labelX: 130, labelY: 170 },
      { path: 'M175,135 Q160,165 155,200 L168,205 Q172,170 185,140 Z', labelX: 170, labelY: 170 },
    ],
  },
  dorsalNasal: {
    frontal: [
      { path: 'M140,118 Q150,115 160,118 L155,170 Q150,178 145,170 Z', labelX: 150, labelY: 145 },
    ],
  },
  frontalBranch: {
    frontal: [
      { path: 'M60,90 Q80,80 95,95 L90,135 Q70,145 58,130 Z', labelX: 78, labelY: 112 },
      { path: 'M205,95 Q220,80 240,90 L242,130 Q230,145 210,135 Z', labelX: 222, labelY: 112 },
    ],
  },
  deepTemporal: {
    lateral: [
      { path: 'M40,85 Q58,75 72,90 L68,130 Q52,138 42,125 Z', labelX: 58, labelY: 108 },
    ],
  },
  infraorbital: {
    frontal: [
      { path: 'M118,145 Q135,140 148,145 L145,168 Q130,172 120,168 Z', labelX: 132, labelY: 158 },
      { path: 'M152,145 Q165,140 182,145 L180,168 Q170,172 155,168 Z', labelX: 168, labelY: 158 },
    ],
  },
  zygomaticofacial: {
    frontal: [
      { path: 'M90,165 Q115,155 130,180 L120,215 Q95,220 85,200 Z', labelX: 108, labelY: 190 },
      { path: 'M170,180 Q185,155 210,165 L215,200 Q205,220 180,215 Z', labelX: 192, labelY: 190 },
    ],
  },
  labial: {
    frontal: [
      { path: 'M110,205 Q150,195 190,205 Q150,228 110,215 Z', labelX: 150, labelY: 215 },
    ],
  },
  mental: {
    frontal: [
      { path: 'M130,235 Q150,230 170,235 L165,260 Q150,268 135,260 Z', labelX: 150, labelY: 252 },
    ],
  },
  submental: {
    lateral: [
      { path: 'M55,245 Q72,238 88,248 L82,275 Q68,282 56,270 Z', labelX: 72, labelY: 262 },
    ],
  },
  transverseFacial: {
    frontal: [
      { path: 'M78,170 Q95,165 108,175 L102,195 Q88,200 78,190 Z', labelX: 92, labelY: 185 },
      { path: 'M192,175 Q205,165 222,170 L222,190 Q212,200 198,195 Z', labelX: 208, labelY: 185 },
    ],
  },
};

function getRiskFill(tier, isSelected) {
  const alpha = isSelected ? '70' : '40';
  switch (tier) {
    case 'critical':
      return `${COLORS.danger}${alpha}`;
    case 'high':
      return `#E87C2B${alpha}`;
    case 'moderate':
      return `${COLORS.gold}${alpha}`;
    default:
      return `${COLORS.textMuted}${alpha}`;
  }
}

function getRiskStroke(tier, isSelected) {
  if (isSelected) return COLORS.gold;
  switch (tier) {
    case 'critical':
      return COLORS.danger;
    case 'high':
      return '#E87C2B';
    case 'moderate':
      return COLORS.gold;
    default:
      return COLORS.textMuted;
  }
}

function renderZoneShape(zone, paths, selectedId, onSelect) {
  const isSelected = selectedId === zone.id;
  const fill = getRiskFill(zone.riskTier, isSelected);
  const stroke = getRiskStroke(zone.riskTier, isSelected);
  const strokeWidth = isSelected ? 2.5 : 1.5;

  return paths.map((p, idx) => (
    <G key={`${zone.id}-${idx}`}>
      <Path
        d={p.path}
        fill="transparent"
        stroke="transparent"
        strokeWidth={18}
        onPress={() => onSelect(zone)}
        accessibilityLabel={`${zone.name} \u2014 ${zone.region}, ${zone.riskTier} risk`}
        accessibilityRole="button"
      />
      <Path
        d={p.path}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        pointerEvents="none"
      />
      <SvgText
        x={p.labelX}
        y={p.labelY}
        fill={COLORS.text}
        fontSize="9"
        fontWeight="700"
        textAnchor="middle"
        pointerEvents="none"
      >
        {zone.name}
      </SvgText>
    </G>
  ));
}

function FaceMapSvgInner({ zones, orientation, selectedId, onSelect }, ref) {
  const isFrontal = orientation === 'frontal';

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

  useImperativeHandle(ref, () => ({ reset }));

  const onPinchEvent = Animated.event(
    [{ nativeEvent: { scale } }],
    { useNativeDriver: true }
  );

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
    if (event.nativeEvent.state === State.END) {
      reset();
    }
  };

  const transform = [{ scale }, { translateX }, { translateY }];

  return (
    <View style={styles.container}>
      <TapGestureHandler
        onHandlerStateChange={onDoubleTapStateChange}
        numberOfTaps={2}
      >
        <Animated.View>
          <PinchGestureHandler
            onGestureEvent={onPinchEvent}
            onHandlerStateChange={onPinchStateChange}
          >
            <Animated.View>
              <PanGestureHandler
                onGestureEvent={onPanEvent}
                onHandlerStateChange={onPanStateChange}
                minDist={10}
                avgTouches
              >
                <Animated.View style={{ transform }}>
                  <Svg
                    height="320"
                    width="300"
                    viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
                    accessibilityLabel={`Danger zone map, ${orientation} view. Tap a zone for details.`}
                  >
                    {isFrontal ? (
                      <>
                        <Ellipse
                          cx="150"
                          cy="150"
                          rx="110"
                          ry="140"
                          fill={COLORS.card}
                          stroke={COLORS.borderStrong}
                          strokeWidth="2"
                        />
                        <Path
                          d="M60,110 Q150,20 240,110"
                          fill="none"
                          stroke={COLORS.borderStrong}
                          strokeWidth="2"
                        />
                        <Ellipse
                          cx="105"
                          cy="130"
                          rx="18"
                          ry="10"
                          fill={COLORS.background}
                          stroke={COLORS.borderStrong}
                          strokeWidth="1.5"
                        />
                        <Ellipse
                          cx="195"
                          cy="130"
                          rx="18"
                          ry="10"
                          fill={COLORS.background}
                          stroke={COLORS.borderStrong}
                          strokeWidth="1.5"
                        />
                      </>
                    ) : (
                      <>
                        <Path
                          d="M50,60 Q120,40 180,80 L190,220 Q130,300 60,260 Z"
                          fill={COLORS.card}
                          stroke={COLORS.borderStrong}
                          strokeWidth="2"
                        />
                        <Path
                          d="M60,90 Q90,80 110,100"
                          fill="none"
                          stroke={COLORS.borderStrong}
                          strokeWidth="1.5"
                        />
                      </>
                    )}

                    {zones.map((zone) => {
                      const mapping = ZONE_PATHS[zone.id];
                      if (!mapping) return null;
                      const paths = isFrontal ? mapping.frontal : mapping.lateral;
                      if (!paths) return null;
                      return renderZoneShape(zone, paths, selectedId, onSelect);
                    })}
                  </Svg>
                </Animated.View>
              </PanGestureHandler>
            </Animated.View>
          </PinchGestureHandler>
        </Animated.View>
      </TapGestureHandler>
    </View>
  );
}

export default forwardRef(FaceMapSvgInner);

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
});
