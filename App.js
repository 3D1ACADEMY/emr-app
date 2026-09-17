import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';

import HomeScreen from './src/screens/HomeScreen';
import EmergencyScreen from './src/screens/EmergencyScreen';
import VascularOcclusionScreen from './src/screens/VascularOcclusionScreen';
import AnaphylaxisScreen from './src/screens/AnaphylaxisScreen';
import ProtocolDetailScreen from './src/screens/ProtocolDetailScreen';
import PatientScreen from './src/screens/PatientScreen';
import TimerScreen from './src/screens/TimerScreen';
import IncidentLogScreen from './src/screens/IncidentLogScreen';
import CalculatorScreen from './src/screens/CalculatorScreen';
import DangerZoneAtlasScreen from './src/screens/DangerZoneAtlasScreen';
import FacilityLocatorScreen from './src/screens/FacilityLocatorScreen';
import SecurityGate from './src/components/SecurityGate';
import DisclaimerModal from './src/components/DisclaimerModal';
import { COLORS } from './src/constants/theme';

const Stack = createNativeStackNavigator();

const theme = {
  colors: {
    primary: COLORS.gold,
    background: COLORS.background,
    surface: COLORS.card,
    text: COLORS.text,
    placeholder: COLORS.textMuted,
    onSurface: COLORS.text,
    accent: COLORS.teal,
  },
  dark: true,
};

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <SecurityGate>
          <DisclaimerModal />
          <NavigationContainer>
            <StatusBar style="light" />
            <Stack.Navigator
              screenOptions={{
                headerStyle: { backgroundColor: COLORS.backgroundAlt },
                headerTintColor: COLORS.gold,
                headerTitleStyle: { color: COLORS.text, fontWeight: '700' },
                contentStyle: { backgroundColor: COLORS.background },
              }}
            >
              <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Emergency"
                component={EmergencyScreen}
                options={{ title: 'Emergency Protocols' }}
              />
              <Stack.Screen
                name="VascularOcclusion"
                component={VascularOcclusionScreen}
                options={{ title: 'Vascular Occlusion' }}
              />
              <Stack.Screen
                name="Anaphylaxis"
                component={AnaphylaxisScreen}
                options={{ title: 'Anaphylaxis' }}
              />
              <Stack.Screen
                name="ProtocolDetail"
                component={ProtocolDetailScreen}
                options={{ title: 'Protocol' }}
              />
              <Stack.Screen
                name="Patient"
                component={PatientScreen}
                options={{ title: 'Patient Context' }}
              />
              <Stack.Screen
                name="Timer"
                component={TimerScreen}
                options={{ title: 'Treatment Timer' }}
              />
              <Stack.Screen
                name="IncidentLog"
                component={IncidentLogScreen}
                options={{ title: 'Incident Log' }}
              />
              <Stack.Screen
                name="Calculator"
                component={CalculatorScreen}
                options={{ title: 'Clinical Calculators' }}
              />
              <Stack.Screen
                name="DangerZoneAtlas"
                component={DangerZoneAtlasScreen}
                options={{ title: 'Danger Zone Atlas' }}
              />
              <Stack.Screen
                name="FacilityLocator"
                component={FacilityLocatorScreen}
                options={{ title: 'Emergency Facilities' }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </SecurityGate>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
