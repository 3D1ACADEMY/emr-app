import React from 'react';
import { View, StyleSheet } from 'react-native';
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
  const hitPath = isFrontal ? zone.frontalHitPath : zone.lateralHitPath;

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

export default function FaceMapSvg({
  zones,
  orientation = 'frontal',
  selectedId,
  onSelect,
}) {
  const isFrontal = orientation === 'frontal';

  return (
    <View style={styles.container}>
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
  },
});
