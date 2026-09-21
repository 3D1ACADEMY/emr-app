import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Audio } from 'expo-av';
import * as Notifications from 'expo-notifications';
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';
import * as Haptics from 'expo-haptics';
import { COLORS, SIZES, SPACING, SHADOWS } from '../constants/theme';
import { formatTime } from '../utils/helpers';

export default function TimerScreen({ route }) {
  const { defaultMinutes = 15, label = 'Treatment Timer' } = route.params || {};
  const [seconds, setSeconds] = useState(defaultMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [initialSeconds, setInitialSeconds] = useState(defaultMinutes * 60);
  const intervalRef = useRef(null);
  const soundRef = useRef(null);
  const notificationIdRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      activateKeepAwake('timer-active');
    } else {
      deactivateKeepAwake('timer-active');
    }
    return () => deactivateKeepAwake('timer-active');
  }, [isRunning]);

  useEffect(() => {
    const loadSound = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require('../../assets/alarm-beep.wav')
        );
        soundRef.current = sound;
      } catch (e) {
        console.warn('Failed to load timer alarm sound:', e.message);
      }
    };
    loadSound();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (soundRef.current) soundRef.current.unloadAsync();
      cancelNotification();
    };
  }, []);

  const cancelNotification = async () => {
    if (notificationIdRef.current) {
      try {
        await Notifications.cancelScheduledNotificationAsync(notificationIdRef.current);
      } catch (e) {
        console.warn('Cancel notification failed:', e.message);
      }
      notificationIdRef.current = null;
    }
  };

  const scheduleCompletionNotification = async (remainingSeconds) => {
    await cancelNotification();
    if (remainingSeconds <= 0) return;
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'CEMS Timer Complete',
          body: `${label} timer has finished.`,
          sound: 'alarm-beep.wav',
          data: { screen: 'Timer' },
        },
        trigger: {
          seconds: remainingSeconds,
          channelId: 'cems-timers',
        },
      });
      notificationIdRef.current = id;
    } catch (e) {
      console.warn('Schedule notification failed:', e.message);
    }
  };

  const playAlarm = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.setPositionAsync(0);
        await soundRef.current.playAsync();
      }
    } catch (e) {
      console.warn('Failed to play timer alarm:', e.message);
    }
  };

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            Vibration.vibrate([0, 500, 200, 500, 200, 500]);
            playAlarm();
            cancelNotification();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  }, [isRunning]);

  const toggleTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const nextRunning = !isRunning;
    setIsRunning(nextRunning);
    if (nextRunning) {
      scheduleCompletionNotification(seconds);
    } else {
      cancelNotification();
    }
  };

  const resetTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsRunning(false);
    setSeconds(initialSeconds);
    cancelNotification();
  };

  const adjustTime = (amount) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsRunning(false);
    setSeconds((prev) => Math.max(0, prev + amount));
    setInitialSeconds((prev) => Math.max(0, prev + amount));
    cancelNotification();
  };

  const setPreset = (min) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsRunning(false);
    setSeconds(min * 60);
    setInitialSeconds(min * 60);
    cancelNotification();
  };

  const progress = initialSeconds > 0 ? seconds / initialSeconds : 0;
  const isCritical = seconds <= 60 && seconds > 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>

        <View style={styles.timerCircle}>
          <View style={[styles.progressRing, { borderColor: isCritical ? COLORS.danger : COLORS.gold }]} />
          <Text style={[styles.timerText, isCritical && styles.timerTextCritical]}>
            {formatTime(seconds * 1000)}
          </Text>
          <Text style={styles.timerSubtext}>
            {isRunning ? 'Running' : 'Paused'}
          </Text>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlButton} onPress={() => adjustTime(-60)}>
            <Icon name="minus" size={24} color={COLORS.text} />
            <Text style={styles.controlText}>-1 min</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.mainButton, isRunning && styles.mainButtonActive]}
            onPress={toggleTimer}
          >
            <Icon name={isRunning ? 'pause' : 'play'} size={32} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton} onPress={() => adjustTime(60)}>
            <Icon name="plus" size={24} color={COLORS.text} />
            <Text style={styles.controlText}>+1 min</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.resetButton} onPress={resetTimer}>
          <Icon name="restart" size={20} color={COLORS.textMuted} />
          <Text style={styles.resetText}>Reset Timer</Text>
        </TouchableOpacity>

        <View style={styles.presetsCard}>
          <Text style={styles.presetsTitle}>Quick Presets</Text>
          <View style={styles.presetRow}>
            {[1, 5, 15, 30].map((min) => (
              <TouchableOpacity
                key={min}
                style={styles.presetButton}
                onPress={() => setPreset(min)}
              >
                <Text style={styles.presetText}>{min}m</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.lg },
  label: { color: COLORS.gold, fontSize: SIZES.lg, fontWeight: '700', marginBottom: SPACING.xl },
  timerCircle: {
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 8,
    borderColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    backgroundColor: COLORS.card,
    ...SHADOWS.large,
  },
  progressRing: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 8,
    borderColor: COLORS.gold,
  },
  timerText: { color: COLORS.text, fontSize: SIZES.xxxl, fontWeight: '800', fontVariant: ['tabular-nums'] },
  timerTextCritical: { color: COLORS.danger },
  timerSubtext: { color: COLORS.textMuted, fontSize: SIZES.md, marginTop: SPACING.sm },
  controls: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg },
  controlButton: {
    alignItems: 'center',
    padding: SPACING.base,
    backgroundColor: COLORS.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginHorizontal: SPACING.base,
  },
  controlText: { color: COLORS.text, fontSize: SIZES.sm, marginTop: 4 },
  mainButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    ...SHADOWS.medium,
  },
  mainButtonActive: { backgroundColor: COLORS.danger },
  resetButton: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xl },
  resetText: { color: COLORS.textMuted, marginLeft: SPACING.sm, fontSize: SIZES.md },
  presetsCard: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  presetsTitle: { color: COLORS.gold, fontSize: SIZES.md, fontWeight: '700', marginBottom: SPACING.base },
  presetRow: { flexDirection: 'row', justifyContent: 'space-between' },
  presetButton: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    paddingVertical: SPACING.base,
    paddingHorizontal: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
  },
  presetText: { color: COLORS.text, fontSize: SIZES.md, fontWeight: '600' },
});
