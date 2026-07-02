import DateTimePicker from '@react-native-community/datetimepicker';
import {CheckCircle, AlertTriangle} from 'lucide-react-native';
import React, {useState, useCallback} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, NativeModules} from 'react-native';

import {colors, spacing, textStyles} from '@theme';

import {scheduleNotification} from '../notifications/notificationService';
import type {ParseResult} from '../parser/types';
import * as reminderService from '../reminders/reminderService';

// Define the route params type
type ConfirmScreenProps = {
  route: {
    params: {
      result: ParseResult;
    };
  };
  navigation: any;
};

const {Bubble} = NativeModules;

export default function ConfirmScreen({route, navigation}: ConfirmScreenProps) {
  const {result} = route.params;
  const isUrdu = result.language === 'URDU_SCRIPT';

  const [datetime, setDatetime] = useState<Date>(
    result.datetime ? new Date(result.datetime) : new Date(),
  );

  const [showDatePicker, setShowDatePicker] = useState(result.confidence === 'none');
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleDateChange = (_event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDatetime(selectedDate);
      // Immediately show time picker after date is picked
      setShowTimePicker(true);
    }
  };

  const handleTimeChange = (_event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setDatetime(selectedTime);
    }
  };

  const handleSave = useCallback(async () => {
    try {
      // 1. Save to SQLite
      const reminderId = await reminderService.createReminder({
        label: result.label,
        datetime: datetime.getTime(),
        language: result.language,
        originalText: result.originalText,
      });

      // 2. Schedule Notification
      await scheduleNotification({
        id: reminderId,
        title: result.label,
        datetime,
      });

      // 3. Play Success Animation via Native Module
      if (Bubble && Bubble.playSuccessAnimation) {
        Bubble.playSuccessAnimation();
      }

      // 4. Close the panel by navigating back and then moving to background
      navigation.goBack();
      if (Bubble && Bubble.moveToBackground) {
        Bubble.moveToBackground();
      }
    } catch (e) {
      console.error('Failed to save reminder:', e);
    }
  }, [result, datetime, navigation]);

  const handleCancel = () => {
    navigation.goBack();
    if (Bubble && Bubble.moveToBackground) {
      Bubble.moveToBackground();
    }
  };

  // Format date/time
  const formattedDateTime = datetime.toLocaleString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        {result.confidence === 'high' ? (
          <CheckCircle color={colors.accent} size={48} strokeWidth={2.5} />
        ) : (
          <AlertTriangle color={colors.warning} size={48} strokeWidth={2.5} />
        )}
      </View>

      <Text
        style={[
          styles.label,
          isUrdu && {textAlign: 'right', fontFamily: 'NotoNastaliqUrdu-Regular'}, // Fallback for Urdu script
        ]}>
        {result.label}
      </Text>

      <Text style={[styles.datetime, isUrdu && {textAlign: 'right'}]}>{formattedDateTime}</Text>

      <Text style={[styles.originalText, isUrdu && {textAlign: 'right'}]}>
        "{result.originalText}"
      </Text>

      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.editButton}>
        <Text style={styles.editButtonText}>Edit time</Text>
      </TouchableOpacity>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={datetime}
          mode="date"
          display="spinner"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={datetime}
          mode="time"
          display="clock"
          is24Hour={false}
          onChange={handleTimeChange}
        />
      )}

      <View style={styles.footer}>
        <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Set Reminder</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
    backgroundColor: 'transparent',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  label: {
    ...textStyles.h2,
    color: colors.textMain,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  datetime: {
    ...textStyles.bodyLarge,
    color: colors.primary,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  originalText: {
    ...textStyles.caption,
    color: colors.textSub,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: spacing.xl,
  },
  editButton: {
    alignSelf: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 48,
  },
  editButtonText: {
    ...textStyles.label,
    color: colors.textMain,
  },
  footer: {
    marginTop: 'auto',
  },
  cancelButton: {
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
  },
  cancelText: {
    ...textStyles.label,
    color: colors.textSub,
  },
  saveButton: {
    backgroundColor: colors.primary,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  saveButtonText: {
    ...textStyles.label,
    color: '#ffffff',
    fontWeight: 'bold',
  },
});
