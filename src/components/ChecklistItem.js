import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SIZES, SPACING } from '../constants/theme';

export default function ChecklistItem({ item, checked, onToggle }) {
  return (
    <TouchableOpacity
      style={[styles.container, checked && styles.completed]}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Icon name="check" size={16} color="#fff" />}
      </View>
      <View style={styles.textContainer}>
        {item.critical && (
          <View style={styles.criticalBadge}>
            <Text style={styles.criticalText}>CRITICAL</Text>
          </View>
        )}
        <Text style={[styles.text, checked && styles.textCompleted]}>
          {item.text}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  completed: {
    opacity: 0.75,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.gold,
    marginRight: SPACING.base,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  textContainer: {
    flex: 1,
  },
  criticalBadge: {
    backgroundColor: `${COLORS.danger}30`,
    borderColor: COLORS.danger,
    borderWidth: 1,
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  criticalText: {
    color: COLORS.dangerLight,
    fontSize: SIZES.xs,
    fontWeight: '800',
  },
  text: {
    color: COLORS.text,
    fontSize: SIZES.base,
    lineHeight: 22,
  },
  textCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.textMuted,
  },
});
