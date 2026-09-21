import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Notifications from 'expo-notifications';

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
import DisclaimerScreen from './src/screens/DisclaimerScreen';
import SettingsScreen from './src/screens/SettingsScreen';
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

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function setupNotificationChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('cems-timers', {
      name: 'CEMS Treatment Timers',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 500, 200, 500],
      sound: 'alarm-beep.wav',
      lightColor: '#D4AF37',
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
  }
}

export default function App() {
  useEffect(() => {
    setupNotificationChannel();
    Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: false,
        allowSound: true,
      },
    });

    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
    });

    return () => subscription.remove();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <SecurityGate>
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
                  name="Disclaimer"
                  component={DisclaimerScreen}
                  options={{ headerShown: false }}
                />
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
                <Stack.Screen
                  name="Settings"
                  component={SettingsScreen}
                  options={{ title: 'Settings' }}
                />
              </Stack.Navigator>
            </NavigationContainer>
          </SecurityGate>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
