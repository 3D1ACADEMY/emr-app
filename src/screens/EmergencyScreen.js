import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, SIZES } from '../constants/theme';
import { PROTOCOLS } from '../constants/emergencyData';
import ProtocolCard from '../components/ProtocolCard';

export default function EmergencyScreen({ navigation }) {
  const protocols = Object.values(PROTOCOLS);

  const handleProtocolPress = (protocol) => {
    if (protocol.id === 'vascular-occlusion') {
      navigation.navigate('VascularOcclusion');
    } else if (protocol.id === 'anaphylaxis') {
      navigation.navigate('Anaphylaxis');
    } else {
      navigation.navigate('ProtocolDetail', { protocol });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.alertBanner}>
          <Text style={styles.alertTitle}>Select the Emergency</Text>
          <Text style={styles.alertText}>
            Choose the closest matching protocol. You can still document as you go.
          </Text>
        </View>

        {protocols.map((protocol) => (
          <ProtocolCard
            key={protocol.id}
            protocol={protocol}
            onPress={() => handleProtocolPress(protocol)}
          />
        ))}
      </ScrollView>
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
  },
  alertBanner: {
    backgroundColor: `${COLORS.danger}15`,
    borderWidth: 1,
    borderColor: `${COLORS.danger}50`,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  alertTitle: {
    color: COLORS.dangerLight,
    fontSize: SIZES.lg,
    fontWeight: '700',
    marginBottom: 4,
  },
  alertText: {
    color: COLORS.textMuted,
    fontSize: SIZES.sm,
    lineHeight: 18,
  },
});
