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

function renderZoneShape(zone, isFrontal, selectedId, onSelect) {
  const isSelected = selectedId === zone.id;
  const fill = isSelected ? `${COLORS.danger}60` : `${COLORS.danger}30`;
  const stroke = isSelected ? COLORS.gold : COLORS.danger;
  const strokeWidth = isSelected ? 2.5 : 1.5;

  const hitProps = {
    fill: 'transparent',
    stroke: 'transparent',
    strokeWidth: 12,
    onPress: () => onSelect(zone),
    accessibilityLabel: `${zone.name} — ${zone.region}, ${zone.riskTier} risk`,
    accessibilityRole: 'button',
  };

  const shapeProps = {
    fill,
    stroke,
    strokeWidth,
    pointerEvents: 'none',
  };

  const path = isFrontal ? zone.frontalPath : zone.lateralPath;

  if (path === 'ellipse' || zone.rx) {
    const cx = isFrontal ? zone.cx : zone.cx - 60;
    const cy = zone.cy;
    const rx = (isFrontal ? zone.rx : zone.rx * 0.8) || 30;
    const ry = (isFrontal ? zone.ry : zone.ry * 0.9) || 40;
    const hitRx = rx + 14;
    const hitRy = ry + 18;

    return (
      <G key={zone.id}>
        <Ellipse cx={cx} cy={cy} rx={hitRx} ry={hitRy} {...hitProps} />
        <Ellipse cx={cx} cy={cy} rx={rx} ry={ry} {...shapeProps} />
        <SvgText
          x={cx}
          y={cy + 4}
          fill={COLORS.textMuted}
          fontSize="10"
          fontWeight="600"
          textAnchor="middle"
          pointerEvents="none"
        >
          {zone.name}
        </SvgText>
      </G>
    );
  }

  if (path) {
    const hitPath = isFrontal ? zone.frontalHitPath : zone.lateralHitPath;
    return (
      <G key={zone.id}>
        {hitPath && <Path d={hitPath} {...hitProps} />}
        <Path d={path} {...shapeProps} />
        {zone.cx && (
          <SvgText
            x={isFrontal ? zone.cx : zone.cx - 60}
            y={(zone.cy || 0) + 4}
            fill={COLORS.textMuted}
            fontSize="10"
            fontWeight="600"
            textAnchor="middle"
            pointerEvents="none"
          >
            {zone.name}
          </SvgText>
        )}
      </G>
    );
  }

  return null;
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

  const transform = [
    { scale },
    { translateX },
    { translateY },
  ];

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

                    {zones.map((zone) => renderZoneShape(zone, isFrontal, selectedId, onSelect))}
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
