import notifee from '@notifee/react-native';
import {BellRing, Check, Clock} from 'lucide-react-native';
import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, Easing} from 'react-native';

import {colors, spacing, textStyles} from '@theme';

import {BubbleService} from '../bubble/BubbleService';
import {scheduleNotification} from '../notifications/notificationService';
import * as reminderService from '../reminders/reminderService';
import type {Reminder} from '../reminders/types';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

const AlarmScreen: React.FC<any> = ({route, navigation}) => {
  const {reminderId} = route.params;
  const [reminder, setReminder] = useState<Reminder | null>(null);

  // Animation values
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  const slideUpAnim = React.useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    // Start pulsing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Slide up buttons
    Animated.spring(slideUpAnim, {
      toValue: 0,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [pulseAnim, slideUpAnim]);

  useEffect(() => {
    async function fetchReminder() {
      if (reminderId) {
        const data = await reminderService.getById(reminderId);
        if (data) {
          setReminder(data);
        }
      }
    }
    fetchReminder();
  }, [reminderId]);

  const handleDismiss = async () => {
    if (reminderId) {
      await notifee.cancelNotification(reminderId);
    }
    BubbleService.show();
    // Remove the full screen intent from the navigation stack and go Home
    navigation.reset({
      index: 0,
      routes: [{name: 'Home'}],
    });
  };

  const handleSnooze = async () => {
    if (reminder && reminderId) {
      // Cancel the current ringing notification
      await notifee.cancelNotification(reminderId);

      // Schedule for 10 minutes from now
      const snoozeTime = new Date(Date.now() + 10 * 60 * 1000);
      await scheduleNotification({
        id: reminderId,
        title: reminder.label,
        datetime: snoozeTime,
      });

      // Update the DB so the list shows the new time
      await reminderService.updateReminder(reminderId, {
        datetime: snoozeTime.getTime(),
      });
    }

    BubbleService.show();
    navigation.reset({
      index: 0,
      routes: [{name: 'Home'}],
    });
  };

  if (!reminder) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const isUrdu = reminder.language === 'URDU_SCRIPT';

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <Animated.View style={[styles.bellContainer, {transform: [{scale: pulseAnim}]}]}>
          <View style={styles.bellInner}>
            <BellRing color={colors.accent} size={48} />
          </View>
        </Animated.View>

        <Text style={styles.timeText}>
          {new Date().toLocaleTimeString('en-US', {hour: 'numeric', minute: '2-digit'})}
        </Text>
        <Text style={styles.dateText}>
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
          })}
        </Text>
      </View>

      <View style={styles.middleSection}>
        <Text
          style={[
            styles.reminderText,
            isUrdu && {fontFamily: 'NotoNastaliqUrdu-Regular', textAlign: 'right'},
            reminder.label.length > 50 && styles.reminderTextSmall,
          ]}>
          {reminder.label}
        </Text>
      </View>

      <Animated.View style={[styles.bottomSection, {transform: [{translateY: slideUpAnim}]}]}>
        <TouchableOpacity style={styles.snoozeButton} onPress={handleSnooze}>
          <Clock color={colors.textMain} size={24} style={styles.btnIcon} />
          <Text style={styles.snoozeText}>Snooze 10m</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.dismissButton} onPress={handleDismiss}>
          <Check color="#FFFFFF" size={24} style={styles.btnIcon} />
          <Text style={styles.dismissText}>Dismiss</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // Deep dark background
    justifyContent: 'space-between',
    padding: spacing.xl,
  },
  loadingText: {
    ...textStyles.bodyLarge,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 100,
  },
  topSection: {
    alignItems: 'center',
    marginTop: SCREEN_HEIGHT * 0.1,
  },
  bellContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.accent + '20', // transparent mint
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  bellInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accent + '40',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 56,
    fontWeight: '800',
    color: colors.textMain,
    letterSpacing: -1,
  },
  dateText: {
    ...textStyles.bodyLarge,
    color: colors.primary,
    marginTop: spacing.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  middleSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reminderText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textMain,
    textAlign: 'center',
    lineHeight: 40,
  },
  reminderTextSmall: {
    fontSize: 24,
    lineHeight: 32,
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  btnIcon: {
    marginRight: spacing.sm,
  },
  snoozeButton: {
    flex: 1,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  snoozeText: {
    ...textStyles.h3,
    color: colors.textMain,
  },
  dismissButton: {
    flex: 1,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.danger,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: colors.danger,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  dismissText: {
    ...textStyles.h3,
    color: '#FFFFFF',
  },
});

export default AlarmScreen;
